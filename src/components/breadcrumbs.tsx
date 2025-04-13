"use client"

import * as React from "react";
import Link from "next/link";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

import { useBreadcrumb } from "@/contexts/breadcrumb"

export function Breadcrumbs() {
  const { items } = useBreadcrumb()

  return (
    <Breadcrumb>
    <BreadcrumbList>
      {items.map((item, index) => (
        <React.Fragment key={item.label}>
          {index === items.length - 1 ? (
            <BreadcrumbItem>
              <BreadcrumbPage>{item.label}</BreadcrumbPage>
            </BreadcrumbItem>
          ) : (
            <>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink asChild>
                  <Link href={item.href}>{item.label}</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
            </>
          )}
        </React.Fragment>
      ))}
    </BreadcrumbList>
  </Breadcrumb>
  )
}
