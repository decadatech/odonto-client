import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

import { SidebarProvider } from "@/components/ui/sidebar";
import { BreadcrumbsProvider } from "./breadcrumbs";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
    },
  },
})

export function AppProvider({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <BreadcrumbsProvider>
        <SidebarProvider>
          {children}
        </SidebarProvider>
      </BreadcrumbsProvider>

      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}