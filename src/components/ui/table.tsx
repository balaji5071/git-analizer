import type { HTMLAttributes, TableHTMLAttributes, TdHTMLAttributes, ThHTMLAttributes } from "react";

import { cn } from "@/utils/cn";

export function Table({ className, ...props }: TableHTMLAttributes<HTMLTableElement>) {
  return (
    <div className="overflow-hidden rounded-3xl border border-[var(--border)]">
      <div className="overflow-x-auto">
        <table className={cn("min-w-full divide-y divide-[var(--border)]", className)} {...props} />
      </div>
    </div>
  );
}

export function TableHead({
  className,
  ...props
}: ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={cn(
        "bg-[var(--surface)] px-5 py-3 text-left text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]",
        className,
      )}
      {...props}
    />
  );
}

export function TableRow({
  className,
  ...props
}: HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr
      className={cn(
        "border-b border-[var(--border)] bg-[var(--surface)] transition hover:bg-[var(--surface-hover)]",
        className,
      )}
      {...props}
    />
  );
}

export function TableCell({
  className,
  ...props
}: TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td
      className={cn("px-5 py-4 text-sm text-[var(--foreground)]", className)}
      {...props}
    />
  );
}

export function TableSection({
  className,
  ...props
}: HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody className={cn("", className)} {...props} />;
}
