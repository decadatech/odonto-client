import { useContext } from "react";

import { BreadcrumbsContext } from "@/contexts/breadcrumbs";

export function useBreadcrumbs() {
  const context = useContext(BreadcrumbsContext);
  
  if (context === undefined) {
    return {
      items: [],
      setBreadcrumbs: () => {}
    };
  }
  
  return context;
}
