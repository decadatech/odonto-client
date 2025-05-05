"use client"

import { createContext, useState, ReactNode, useCallback } from "react";

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

interface BreadcrumbsContextType {
  items: BreadcrumbItem[];
  setBreadcrumbs: (items: BreadcrumbItem[]) => void;
}

export const BreadcrumbsContext = createContext<BreadcrumbsContextType>({
  items: [],
  setBreadcrumbs: () => {},
});

export function BreadcrumbsProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<BreadcrumbItem[]>([]);

  const setBreadcrumbs = useCallback((newItems: BreadcrumbItem[]) => {
    setItems(newItems);
  }, []);

  return (
    <BreadcrumbsContext.Provider value={{ items, setBreadcrumbs }}>
      {children}
    </BreadcrumbsContext.Provider>
  );
}
