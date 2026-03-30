import { act, renderHook, waitFor } from "@testing-library/react"
import type { ReactNode } from "react"
import { NuqsTestingAdapter, type UrlUpdateEvent } from "nuqs/adapters/testing"

import { useScheduleFiltersQueryState } from "."

function createWrapper({
  onUrlUpdate,
  searchParams = "",
}: {
  onUrlUpdate?: (event: UrlUpdateEvent) => void
  searchParams?: string
}) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <NuqsTestingAdapter
        searchParams={searchParams}
        onUrlUpdate={onUrlUpdate}
        hasMemory
      >
        {children}
      </NuqsTestingAdapter>
    )
  }
}

describe("useScheduleFiltersQueryState", () => {
  it("should read the initial filter state from the URL", () => {
    const { result } = renderHook(() => useScheduleFiltersQueryState(), {
      wrapper: createWrapper({
        searchParams: "?dentists=dentist-1,dentist-2&patients=patient-1&statuses=confirmed,cancelled",
      }),
    })

    expect(result.current.selectedValues).toEqual({
      dentists: ["dentist-1", "dentist-2"],
      patients: ["patient-1"],
      statuses: ["confirmed", "cancelled"],
    })
  })

  it("should toggle filters and update the URL state", async () => {
    const onUrlUpdate = vi.fn<(event: UrlUpdateEvent) => void>()
    const { result } = renderHook(() => useScheduleFiltersQueryState(), {
      wrapper: createWrapper({
        onUrlUpdate,
        searchParams: "?dentists=dentist-1&statuses=confirmed",
      }),
    })

    act(() => {
      result.current.toggleOption("dentists", "dentist-2")
      result.current.toggleOption("statuses", "cancelled")
    })

    await waitFor(() => {
      expect(result.current.selectedValues).toEqual({
        dentists: ["dentist-1", "dentist-2"],
        patients: [],
        statuses: ["confirmed", "cancelled"],
      })
    })

    const latestUrlUpdate = onUrlUpdate.mock.calls.at(-1)?.[0]

    expect(latestUrlUpdate?.searchParams.get("dentists")).toBe("dentist-1,dentist-2")
    expect(latestUrlUpdate?.searchParams.get("statuses")).toBe("confirmed,cancelled")
    expect(latestUrlUpdate?.options.history).toBe("replace")
  })

  it("should reset a single facet without affecting the others", async () => {
    const onUrlUpdate = vi.fn<(event: UrlUpdateEvent) => void>()
    const { result } = renderHook(() => useScheduleFiltersQueryState(), {
      wrapper: createWrapper({
        onUrlUpdate,
        searchParams: "?dentists=dentist-1&patients=patient-1,patient-2&statuses=confirmed",
      }),
    })

    act(() => {
      result.current.resetFacet("patients")
    })

    await waitFor(() => {
      expect(result.current.selectedValues).toEqual({
        dentists: ["dentist-1"],
        patients: [],
        statuses: ["confirmed"],
      })
    })

    const latestUrlUpdate = onUrlUpdate.mock.calls.at(-1)?.[0]

    expect(latestUrlUpdate?.searchParams.get("dentists")).toBe("dentist-1")
    expect(latestUrlUpdate?.searchParams.get("patients")).toBeNull()
    expect(latestUrlUpdate?.searchParams.get("statuses")).toBe("confirmed")
  })

  it("should reset all filters", async () => {
    const onUrlUpdate = vi.fn<(event: UrlUpdateEvent) => void>()
    const { result } = renderHook(() => useScheduleFiltersQueryState(), {
      wrapper: createWrapper({
        onUrlUpdate,
        searchParams: "?dentists=dentist-1&patients=patient-1&statuses=confirmed",
      }),
    })

    act(() => {
      result.current.resetAll()
    })

    await waitFor(() => {
      expect(result.current.selectedValues).toEqual({
        dentists: [],
        patients: [],
        statuses: [],
      })
    })

    const latestUrlUpdate = onUrlUpdate.mock.calls.at(-1)?.[0]

    expect(latestUrlUpdate?.queryString).toBe("")
  })
})
