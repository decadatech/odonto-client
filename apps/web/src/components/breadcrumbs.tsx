"use client";

import * as React from "react";
import Link from "next/link";

import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@workspace/ui/components/breadcrumb";

import { useBreadcrumbs } from "@/hooks/use-breadcrumbs";

export function Breadcrumbs() {
  const { items } = useBreadcrumbs();

  if (items.length === 0) {
    return null;
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {items.map((item, index: number) => (
          <React.Fragment key={item.label}>
            <BreadcrumbItem className={index === 0 ? "hidden md:block" : ""}>
              {index < items.length - 1 ? (
                <BreadcrumbLink asChild>
                  <Link href={item.href || "#"}>{item.label}</Link>
                </BreadcrumbLink>
              ) : (
                <BreadcrumbPage>{item.label}</BreadcrumbPage>
              )}
            </BreadcrumbItem>
            {index < items.length - 1 && (
              <BreadcrumbSeparator className="hidden md:block" />
            )}
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
