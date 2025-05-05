import { useContext } from "react";

import { BreadcrumbsContext } from "@/contexts/breadcrumbs";

// Safe version of the hook that works with SSR
export function useBreadcrumbs() {
  const context = useContext(BreadcrumbsContext);
  
  // Return a fallback object during SSR to avoid errors
  if (context === undefined) {
    return {
      items: [],
      setBreadcrumbs: () => {}
    };
  }
  
  return context;
}
