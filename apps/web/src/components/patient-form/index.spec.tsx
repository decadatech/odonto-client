/// <reference types="vitest/globals" />
import * as React from "react"
import { act } from "react"
import { createRoot, type Root } from "react-dom/client"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

const mockToastError = vi.hoisted(() => vi.fn())
const mockMutateAsync = vi.hoisted(() => vi.fn())
const mockRouterPush = vi.hoisted(() => vi.fn())

vi.mock("@workspace/ui/components/sonner", () => ({
  toast: {
    error: mockToastError,
  },
}))

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockRouterPush,
  }),
}))

vi.mock("@/hooks/mutations/patients", () => {
  class PatientMutationError extends Error {
    code: string

    constructor(code: string) {
      super(code)
      this.code = code
    }
  }

  return {
    PatientMutationError,
    isPatientMutationError: (error: unknown) => error instanceof PatientMutationError,
    usePatientMutation: () => ({
      mutateAsync: mockMutateAsync,
      isPending: false,
    }),
  }
})

vi.mock("@/components/birth-date-picker", () => ({
  BirthDatePicker: ({
    id,
    name,
    value,
    onValueChange,
    "aria-invalid": ariaInvalid,
  }: {
    id: string
    name: string
    value?: string
    onValueChange?: (value: string) => void
    "aria-invalid"?: boolean
  }) => (
    <input
      id={id}
      name={name}
      value={value ?? ""}
      aria-invalid={ariaInvalid}
      onChange={(event) => onValueChange?.(event.currentTarget.value)}
    />
  ),
}))

vi.mock("@workspace/ui/components/select", async () => {
  const ReactModule = await vi.importActual<typeof import("react")>("react")

  function Select({
    name,
    value,
    onValueChange,
    children,
  }: {
    name?: string
    value?: string
    onValueChange?: (value: string) => void
    children: React.ReactNode
  }) {
    const options: React.ReactElement[] = []

    const collectOptions = (nodes: React.ReactNode) => {
      ReactModule.Children.forEach(nodes, (node) => {
        if (!ReactModule.isValidElement(node)) {
          return
        }

        if (node.type === SelectItem) {
          options.push(node as React.ReactElement)
          return
        }

        collectOptions((node.props as { children?: React.ReactNode }).children)
      })
    }

    collectOptions(children)

    return (
      <select
        name={name}
        value={value ?? ""}
        onChange={(event) => onValueChange?.(event.currentTarget.value)}
      >
        <option value="">Selecione</option>
        {options}
      </select>
    )
  }

  function SelectTrigger({
    id,
    children,
    ...props
  }: React.ComponentProps<"div">) {
    return (
      <div id={id} {...props}>
        {children}
      </div>
    )
  }

  function SelectValue({ placeholder }: { placeholder?: string }) {
    return <>{placeholder}</>
  }

  function SelectContent({ children }: { children: React.ReactNode }) {
    return <>{children}</>
  }

  function SelectItem({
    value,
    children,
  }: {
    value: string
    children: React.ReactNode
  }) {
    return <option value={value}>{children}</option>
  }

  return {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
  }
})

import { PatientForm, type PatientFormValues } from "@/components/patient-form"

let container: HTMLDivElement | null = null
let root: Root | null = null
let queryClient: QueryClient

const initialValues: PatientFormValues = {
  name: "Maria Silva",
  sex: "female",
  birthDate: "1990-05-12",
  rg: "12.345.678-9",
  cpf: "123.456.789-01",
  phone: "(11) 99999-8888",
  email: "maria@example.com",
  zipCode: "01310100",
  street: "Rua das Flores",
  streetNumber: "123",
  neighborhood: "Centro",
  city: "Sao Paulo",
  state: "SP",
}

function render(element: React.ReactNode) {
  container = document.createElement("div")
  document.body.appendChild(container)
  root = createRoot(container)
  queryClient = new QueryClient()

  act(() => {
    root?.render(
      <QueryClientProvider client={queryClient}>
        {element}
      </QueryClientProvider>,
    )
  })
}

function getInput(id: string) {
  return document.getElementById(id) as HTMLInputElement
}

function changeValue(element: HTMLInputElement | HTMLSelectElement, value: string) {
  const prototype =
    element instanceof HTMLInputElement
      ? HTMLInputElement.prototype
      : HTMLSelectElement.prototype
  const valueSetter = Object.getOwnPropertyDescriptor(prototype, "value")?.set

  act(() => {
    valueSetter?.call(element, value)
    element.dispatchEvent(new Event("input", { bubbles: true }))
    element.dispatchEvent(new Event("change", { bubbles: true }))
  })
}

beforeEach(() => {
  mockToastError.mockClear()
  mockMutateAsync.mockClear()
  mockRouterPush.mockClear()
  mockMutateAsync.mockResolvedValue(undefined)
})

afterEach(() => {
  act(() => {
    root?.unmount()
  })

  container?.remove()
  container = null
  root = null
})

describe("PatientForm", () => {
  it("should render an empty email field when initial email is null", () => {
    render(
      <PatientForm
        submitLabel="Salvar alterações"
        mode="update"
        patientId="patient-id"
        initialValues={{
          ...initialValues,
          email: null,
        }}
      />,
    )

    expect(getInput("email").value).toBe("")
  })

  it("should apply masks and sanitization to rg, cpf, phone and zip code fields", () => {
    render(
      <PatientForm
        submitLabel="Cadastrar paciente"
        mode="create"
      />,
    )

    changeValue(getInput("rg"), "123456789")
    changeValue(getInput("cpf"), "12345678901")
    changeValue(getInput("phone"), "11999998888")
    changeValue(getInput("zipCode"), "01a31-0 100")

    expect(getInput("rg").value).toBe("12.345.678-9")
    expect(getInput("cpf").value).toBe("123.456.789-01")
    expect(getInput("phone").value).toBe("(11) 99999-8888")
    expect(getInput("zipCode").value).toBe("01310100")
  })

  it("should block submission and show the birth date error when the field is missing", async () => {
    render(
      <PatientForm
        submitLabel="Cadastrar paciente"
        mode="create"
        initialValues={{
          ...initialValues,
          birthDate: "",
        }}
      />,
    )

    await act(async () => {
      document.querySelector("form")?.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }))
    })

    expect(mockMutateAsync).not.toHaveBeenCalled()
    expect(document.body.textContent).toContain("Data de nascimento é obrigatória")
    expect(getInput("birthDate").getAttribute("aria-invalid")).toBe("true")
  })

  it("should show a toast with the mapped backend error message", async () => {
    const { PatientMutationError } = await import("@/hooks/mutations/patients")
    mockMutateAsync.mockRejectedValue(new PatientMutationError("PATIENT_CPF_ALREADY_EXISTS"))

    render(
      <PatientForm
        submitLabel="Cadastrar paciente"
        mode="create"
      />,
    )

    changeValue(getInput("name"), initialValues.name)
    changeValue(getInput("birthDate"), initialValues.birthDate)
    changeValue(getInput("rg"), "123456789")
    changeValue(getInput("cpf"), "12345678901")
    changeValue(getInput("phone"), "11999998888")
    changeValue(getInput("zipCode"), "01310100")
    changeValue(getInput("street"), initialValues.street)
    changeValue(getInput("streetNumber"), initialValues.streetNumber)
    changeValue(getInput("neighborhood"), initialValues.neighborhood)
    changeValue(getInput("city"), initialValues.city)
    changeValue(document.querySelector('select[name="sex"]') as HTMLSelectElement, initialValues.sex)
    changeValue(document.querySelector('select[name="state"]') as HTMLSelectElement, initialValues.state)

    await act(async () => {
      document.querySelector("form")?.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }))
    })

    expect(mockToastError).toHaveBeenCalledWith("Já existe um paciente com este CPF.")
  })

  it("should invalidate the patients query and navigate after a successful submission", async () => {
    render(
      <PatientForm
        submitLabel="Cadastrar paciente"
        mode="create"
      />,
    )

    const invalidateQueriesSpy = vi
      .spyOn(queryClient, "invalidateQueries")
      .mockResolvedValue()

    changeValue(getInput("name"), initialValues.name)
    changeValue(getInput("birthDate"), initialValues.birthDate)
    changeValue(getInput("rg"), "123456789")
    changeValue(getInput("cpf"), "12345678901")
    changeValue(getInput("phone"), "11999998888")
    changeValue(getInput("zipCode"), "01310100")
    changeValue(getInput("street"), initialValues.street)
    changeValue(getInput("streetNumber"), initialValues.streetNumber)
    changeValue(getInput("neighborhood"), initialValues.neighborhood)
    changeValue(getInput("city"), initialValues.city)
    changeValue(document.querySelector('select[name="sex"]') as HTMLSelectElement, initialValues.sex)
    changeValue(document.querySelector('select[name="state"]') as HTMLSelectElement, initialValues.state)

    await act(async () => {
      document.querySelector("form")?.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }))
    })

    expect(mockMutateAsync).toHaveBeenCalledWith({
      name: initialValues.name,
      sex: initialValues.sex,
      birthDate: initialValues.birthDate,
      rg: initialValues.rg,
      cpf: initialValues.cpf,
      phone: initialValues.phone,
      email: "",
      zipCode: initialValues.zipCode,
      street: initialValues.street,
      streetNumber: initialValues.streetNumber,
      neighborhood: initialValues.neighborhood,
      city: initialValues.city,
      state: initialValues.state,
    })
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: ["patients"],
    })
    expect(mockRouterPush).toHaveBeenCalledWith("/patients")
  })
})
