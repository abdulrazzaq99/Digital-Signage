import { cn } from "@/lib/utils";
import type { HTMLAttributes, ReactNode, TdHTMLAttributes, ThHTMLAttributes } from "react";

export function Table({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("overflow-x-auto", className)}>
      <table className="w-full min-w-[640px] text-sm">{children}</table>
    </div>
  );
}
export function THead({ children }: { children: ReactNode }) {
  return <thead className="bg-slate-50/80 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-400">{children}</thead>;
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
