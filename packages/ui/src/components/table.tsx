"use client"

import * as React from "react"
import { ArrowUp, ArrowDown } from "lucide-react"

import { cn } from "@workspace/ui/lib/utils"

function Table({ className, ...props }: React.ComponentProps<"table">) {
  return (
    <div
      data-slot="table-container"
      className="relative w-full overflow-x-auto"
    >
      <table
        data-slot="table"
        className={cn("w-full caption-bottom text-sm", className)}
        {...props}
      />
    </div>
  )
}

function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  return (
    <thead
      data-slot="table-header"
      className={cn("[&_tr]:border-b", className)}
      {...props}
    />
  )
}

function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return (
    <tbody
      data-slot="table-body"
      className={cn("[&_tr:last-child]:border-0", className)}
      {...props}
    />
  )
}

function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn(
        "bg-muted/50 border-t font-medium [&>tr]:last:border-b-0",
        className
      )}
      {...props}
    />
  )
}

function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        `
          group/tablerow relative odd:bg-white even:bg-muted/50
          border-x-0 border-t border-b-0 border-solid odd:border-white
          even:border-muted/50 transition-colors data-[state=selected]:bg-muted
        `,
        className
      )}
      {...props}
    />
  )
}


interface TableHeadProps extends React.ComponentProps<"th"> {
  sortable?: boolean;
  sortOrder?: "asc" | "desc";
  onSort?: (order: 'asc' | 'desc') => void;
}

function TableHead({ className, children, sortable = false, sortOrder, onSort, tabIndex = 0, ...props }: TableHeadProps) {
  const updatedSortOrder = (() => {
    if (sortOrder === undefined) return 'desc';

    return sortOrder === 'asc' ? 'desc' : 'asc';
  })();

  return (
    <th
      data-slot="table-head"
      className={cn(
        "p-4 text-foreground text-left align-middle font-medium whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        className
      )}
      {...props}
    >
      <div 
        className="group flex items-center justify-between data-[sortable=true]:cursor-pointer" data-sortable={sortable}
        tabIndex={tabIndex}
        role="button"
        onClick={() => sortable && onSort?.(updatedSortOrder)}
        onKeyDown={e => {
          if (e.code === 'Enter' && sortable) {
            onSort?.(updatedSortOrder);
          }
        }}
      >
        {children}

        {sortable && (
          <div
            className="
              w-6 h-6 flex justify-center items-center invisible data-[is-ordered=true]:visible
              group-hover:visible group-hover:bg-colors-background-neutral-1 bg-muted/50 rounded-md
            "
            data-is-ordered={sortOrder !== undefined}
          >
            {sortOrder === 'asc' ? (
              <ArrowUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ArrowDown className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        )}
      </div>
    </th>
  )
}

function TableCell({ className, ...props }: React.ComponentProps<"td">) {
  return (
    <td
      data-slot="table-cell"
      className={cn(
        "p-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        className
      )}
      {...props}
    />
  )
}

function TableCaption({
  className,
  ...props
}: React.ComponentProps<"caption">) {
  return (
    <caption
      data-slot="table-caption"
      className={cn("text-muted-foreground mt-4 text-sm", className)}
      {...props}
    />
  )
}


type ActionCellProps = React.ComponentProps<"td"> & {
  actions: React.ReactNode;
}

function TableActionCell({ actions, className, ...rest }: ActionCellProps) {
  return (
    <td
      className={cn(`
        bg-gradient-to-l group-odd/tablerow:from-white group-even/tablerow:from-muted to-transparent from-50% to-100% 
        opacity-0 invisible group-hover/tablerow:opacity-100 group-hover/tablerow:visible
        flex absolute justify-end items-center px-4 py-0 space-x-2 top-0 right-0 h-[calc(100%-1px)] w-[300px]
        transition-all overflow-x-hidden`,
        className,
      )}
      {...rest}
    >
      <div className="duration-200 ease-in-out transform translate-x-2 group-hover/tablerow:translate-x-0">
        {actions}
      </div>
    </td>
  );
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
  TableActionCell,
}
