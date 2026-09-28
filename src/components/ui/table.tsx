import { cn } from "@/lib/utils";
import type { HTMLAttributes, ReactNode, TdHTMLAttributes, ThHTMLAttributes } from "react";

export function Table({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("-mx-px overflow-x-auto overscroll-x-contain", className)}>
      <table className="w-full min-w-[640px] text-sm tabular-nums">{children}</table>
    </div>
  );
}
export function THead({ children }: { children: ReactNode }) {
  return <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs font-medium text-slate-500">{children}</thead>;
}
export function TH({ className, children, ...rest }: ThHTMLAttributes<HTMLTableCellElement>) {
  return <th className={cn("px-4 py-2.5 font-semibold", className)} {...rest}>{children}</th>;
}
export function TR({ className, children, ...rest }: HTMLAttributes<HTMLTableRowElement>) {
  return <tr className={cn("border-t border-slate-100 hover:bg-slate-50/60 transition-colors", className)} {...rest}>{children}</tr>;
}
export function TD({ className, children, ...rest }: TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={cn("px-4 py-3 align-middle text-slate-600", className)} {...rest}>{children}</td>;
}
