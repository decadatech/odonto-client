import { act, renderHook, waitFor } from "@testing-library/react"
import type { ReactNode } from "react"
import { NuqsTestingAdapter, type UrlUpdateEvent } from "nuqs/adapters/testing"

import { usePatientsTableParams } from "."

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

describe("usePatientsTableParams", () => {
  it("should read the initial params from the URL", () => {
    const { result } = renderHook(() => usePatientsTableParams(), {
      wrapper: createWrapper({
        searchParams: "?search=maria&sort_order=desc",
      }),
    })

    expect(result.current.search).toBe("maria")
    expect(result.current.sortOrder).toBe("desc")
  })

  it("should update the search param in the URL", async () => {
    const onUrlUpdate = vi.fn<(event: UrlUpdateEvent) => void>()
    const { result } = renderHook(() => usePatientsTableParams(), {
      wrapper: createWrapper({
        onUrlUpdate,
        searchParams: "?sort_order=asc",
      }),
    })

    act(() => {
      void result.current.setSearch("joao")
    })

    await waitFor(() => {
      expect(result.current.search).toBe("joao")
    })

    const latestUrlUpdate = onUrlUpdate.mock.calls.at(-1)?.[0]

    expect(latestUrlUpdate?.searchParams.get("search")).toBe("joao")
    expect(latestUrlUpdate?.searchParams.get("sort_order")).toBe("asc")
    expect(latestUrlUpdate?.options.history).toBe("replace")
  })

  it("should clear the search param when the value is empty", async () => {
    const onUrlUpdate = vi.fn<(event: UrlUpdateEvent) => void>()
    const { result } = renderHook(() => usePatientsTableParams(), {
      wrapper: createWrapper({
        onUrlUpdate,
        searchParams: "?search=maria&sort_order=asc",
      }),
    })

    act(() => {
      void result.current.setSearch("")
    })

    await waitFor(() => {
      expect(result.current.search).toBe("")
    })

    const latestUrlUpdate = onUrlUpdate.mock.calls.at(-1)?.[0]

    expect(latestUrlUpdate?.searchParams.get("search")).toBeNull()
    expect(latestUrlUpdate?.searchParams.get("sort_order")).toBe("asc")
  })

  it("should update the sort order in the URL", async () => {
    const onUrlUpdate = vi.fn<(event: UrlUpdateEvent) => void>()
    const { result } = renderHook(() => usePatientsTableParams(), {
      wrapper: createWrapper({
        onUrlUpdate,
        searchParams: "?search=maria&sort_order=asc",
      }),
    })

    act(() => {
      void result.current.setSortOrder("desc")
    })

    await waitFor(() => {
      expect(result.current.sortOrder).toBe("desc")
    })

    const latestUrlUpdate = onUrlUpdate.mock.calls.at(-1)?.[0]

    expect(latestUrlUpdate?.searchParams.get("search")).toBe("maria")
    expect(latestUrlUpdate?.searchParams.get("sort_order")).toBe("desc")
    expect(latestUrlUpdate?.options.history).toBe("replace")
  })
})
