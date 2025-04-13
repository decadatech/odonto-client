"use client";

import * as React from "react";

type BreadcrumbItem = {
  label: string;
  href: string;
};

interface BreadcrumbContextType {
  items: BreadcrumbItem[];
  setBreadcrumb: (items: BreadcrumbItem[]) => void;
  push: (item: BreadcrumbItem) => void;
  pop: () => void;
}

const BreadcrumbContext = React.createContext<BreadcrumbContextType>({
  items: [],
  setBreadcrumb: () => {},
  push: () => {},
  pop: () => {},
});

export function BreadcrumbProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = React.useState<BreadcrumbItem[]>([]);

  const setBreadcrumb = React.useCallback((newItems: BreadcrumbItem[]) => {
    setItems(newItems);
  }, []);

  const push = React.useCallback((newItem: BreadcrumbItem) => {
    setItems((prevItems) => [...prevItems, newItem]);
  }, []);

  const pop = React.useCallback(() => {
    setItems((prevItems) => prevItems.slice(0, -1));
  }, []);

  return (
    <BreadcrumbContext.Provider value={{ items, setBreadcrumb, push, pop }}>
      {children}
    </BreadcrumbContext.Provider>
  );
}

export function useBreadcrumb() {
  const context = React.useContext(BreadcrumbContext);

  if (!context) {
    throw new Error("useBreadcrumb must be used within a BreadcrumbProvider");
  }

  return context;
}
