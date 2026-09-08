import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("rounded-xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]", className)}>{children}</div>;
}

export function CardHeader({ title, subtitle, action, className }: { title: ReactNode; subtitle?: ReactNode; action?: ReactNode; className?: string }) {
  return (
    <div className={cn("flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4", className)}>
      <div>
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
        {subtitle && <p className="mt-0.5 text-xs text-slate-400">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function StatCard({ value, label, sub, tone = "slate", className }: { value: ReactNode; label: string; sub?: ReactNode; tone?: "slate" | "green" | "red" | "blue" | "amber"; className?: string }) {
  const color = { slate: "text-slate-900", green: "text-green-600", red: "text-red-600", blue: "text-blue-600", amber: "text-amber-600" }[tone];
  return (
    <Card className={cn("px-5 py-4", className)}>
      <div className={cn("text-2xl font-bold tracking-tight", color)}>{value}</div>
      <div className="mt-1 text-sm font-medium text-slate-700">{label}</div>
      {sub && <div className="mt-0.5 text-xs text-slate-400">{sub}</div>}
    </Card>
  );
}

export function SectionLabel({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("text-[11px] font-semibold uppercase tracking-wider text-slate-400", className)}>{children}</div>;
}
