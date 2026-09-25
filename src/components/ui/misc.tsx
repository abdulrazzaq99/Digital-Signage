"use client";
import { cn } from "@/lib/utils";
import { Floating, useDismiss } from "./floating";
import { Check, ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";

export function PageHeader({ title, subtitle, action, className }: { title: ReactNode; subtitle?: ReactNode; action?: ReactNode; className?: string }) {
  return (
    <div className={cn("flex flex-wrap items-start justify-between gap-4", className)}>
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-slate-400">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function Breadcrumb({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav className="flex items-center gap-2 text-xs text-slate-400">
      {items.map((it, i) => (
        <span key={i} className="flex items-center gap-2">
          {it.href ? <Link href={it.href} className="hover:text-slate-600">{it.label}</Link> : <span className="text-slate-700">{it.label}</span>}
          {i < items.length - 1 && <ChevronRight className="h-3 w-3" />}
        </span>
      ))}
    </nav>
  );
}

export function Avatar({ name, src, size = "md", className }: { name: string; src?: string; size?: "sm" | "md" | "lg"; className?: string }) {
  const s = { sm: "h-7 w-7 text-[10px]", md: "h-9 w-9 text-xs", lg: "h-12 w-12 text-sm" }[size];
  const initials = name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
  if (src) return <img src={src} alt={name} className={cn("rounded-full object-cover", s, className)} />;
  return <div className={cn("flex items-center justify-center rounded-full font-semibold text-white", !/\bbg-/.test(className ?? "") && "bg-slate-900", s, className)}>{initials}</div>;
}

/** Deterministic initials tile for a company (no external images). */
export function CompanyLogo({ seed, name, size = "md", className }: { seed: string; name?: string; size?: "sm" | "md" | "lg"; className?: string }) {
  const s = { sm: "h-8 w-8 text-[10px]", md: "h-10 w-10 text-xs", lg: "h-12 w-12 text-sm" }[size];
  const palette = ["bg-blue-600", "bg-violet-600", "bg-emerald-600", "bg-amber-500", "bg-rose-600", "bg-cyan-600", "bg-indigo-600"];
  const key = name ?? seed;
  let h = 0;
  for (const ch of key) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  const initials = key.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("") || "?";
  return <span className={cn("flex shrink-0 items-center justify-center rounded-lg font-bold text-white", palette[h % palette.length], s, className)}>{initials}</span>;
}

export function Pagination({ page = 1, pages = 1, summary, onChange, className }: { page?: number; pages?: number; summary?: ReactNode; onChange?: (p: number) => void; className?: string }) {
  const btn = "flex h-7 min-w-7 items-center justify-center rounded-md border px-1.5 text-xs font-medium transition-colors disabled:opacity-40";
  const go = (p: number) => { if (p >= 1 && p <= pages && p !== page) onChange?.(p); };
  // Window of up to five numbers around the current page, plus the last page when out of view.
  const start = Math.max(1, Math.min(page - 2, pages - 4));
  const nums = Array.from({ length: Math.min(5, pages) }, (_, i) => start + i);
  return (
    <div className={cn("flex flex-wrap items-center justify-between gap-3", className)}>
      <div className="text-xs text-slate-400">{summary}</div>
      <div className="flex flex-wrap items-center gap-1">
        <button type="button" disabled={page <= 1} onClick={() => go(page - 1)} className={cn(btn, "border-slate-200 bg-white text-slate-400 hover:bg-slate-50")} aria-label="Previous page"><ChevronLeft className="h-3.5 w-3.5" /></button>
        {nums.map((n) => (
          <button type="button" key={n} onClick={() => go(n)} className={cn(btn, n === page ? "border-blue-600 bg-blue-600 text-white" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50")}>{n}</button>
        ))}
        {nums[nums.length - 1] < pages - 1 && <span className="px-1 text-xs text-slate-400">…</span>}
        {nums[nums.length - 1] < pages && <button type="button" onClick={() => go(pages)} className={cn(btn, "border-slate-200 bg-white text-slate-600 hover:bg-slate-50")}>{pages}</button>}
        <button type="button" disabled={page >= pages} onClick={() => go(page + 1)} className={cn(btn, "border-slate-200 bg-white text-slate-400 hover:bg-slate-50")} aria-label="Next page"><ChevronRight className="h-3.5 w-3.5" /></button>
      </div>
    </div>
  );
}

export function Stepper({ steps, current, className, compact }: { steps: string[]; current: number; className?: string; compact?: boolean }) {
  return (
    <div className={cn("flex items-center", className)}>
      {steps.map((s, i) => {
        const n = i + 1;
        const done = n < current;
        const active = n === current;
        return (
          <div key={s} className={cn("flex items-center", i < steps.length - 1 && "flex-1")}>
            <div className="flex items-center gap-2">
              <span className={cn("flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-semibold", done ? "bg-green-500 text-white" : active ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-400")}>
                {done ? <Check className="h-3 w-3" /> : n}
              </span>
              <span className={cn("text-xs font-medium whitespace-nowrap", done ? "text-green-600" : active ? "text-slate-900" : "text-slate-400", compact && "text-[11px]", !active && "hidden sm:inline")}>{s}</span>
            </div>
            {i < steps.length - 1 && <div className={cn("mx-2 h-px flex-1 sm:mx-3", done ? "bg-green-300" : "bg-slate-200")} />}
          </div>
        );
      })}
    </div>
  );
}

export function Progress({ value, tone = "blue", className, thin }: { value: number; tone?: "blue" | "green" | "amber" | "red" | "slate"; className?: string; thin?: boolean }) {
  const c = { blue: "bg-blue-600", green: "bg-green-500", amber: "bg-amber-500", red: "bg-red-500", slate: "bg-slate-300" }[tone];
  return (
    <div className={cn("w-full overflow-hidden rounded-full bg-slate-100", thin ? "h-1" : "h-1.5", className)}>
      <div className={cn("h-full rounded-full", c)} style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  );
}

export function Alert({ tone = "blue", children, className, icon }: { tone?: "blue" | "amber" | "green" | "red"; children: ReactNode; className?: string; icon?: ReactNode }) {
  const c = {
    blue: "border-blue-100 bg-blue-50 text-blue-700",
    amber: "border-amber-100 bg-amber-50 text-amber-700",
    green: "border-green-100 bg-green-50 text-green-700",
    red: "border-red-100 bg-red-50 text-red-700",
  }[tone];
  return <div className={cn("flex gap-2.5 rounded-lg border px-4 py-3 text-xs", c, className)}>{icon}<div>{children}</div></div>;
}

export interface MenuItem { label: string; icon?: ReactNode; onSelect?: () => void; tone?: "default" | "danger"; disabled?: boolean; href?: string }

export function DropdownMenu({ items, align = "right", trigger, className }: { items: MenuItem[]; align?: "left" | "right"; trigger?: ReactNode; className?: string }) {
  const [open, setOpen] = useState(false);
  const button = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  useDismiss(open, () => setOpen(false), [button, panel]);
  return (
    <div className={cn("relative inline-block", className)}>
      <button ref={button} type="button" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen((v) => !v)} className="flex h-10 w-10 sm:h-7 sm:w-7 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-400 hover:bg-slate-50 hover:text-slate-600" aria-label="Actions">
        {trigger ?? <MoreHorizontal className="h-3.5 w-3.5" />}
      </button>
      {/* Rendered on <body> so tables and scroll containers can't clip it; opens upward near the bottom. */}
      <Floating anchor={button} open={open} panelRef={panel} placement={align === "right" ? "bottom-end" : "bottom-start"} role="menu" className="min-w-40 rounded-lg border border-slate-200 bg-white p-1 shadow-lg animate-pop-in">
          {items.map((it) => {
            const cls = cn("flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-xs font-medium transition-colors", it.disabled ? "text-slate-300 cursor-not-allowed" : it.tone === "danger" ? "text-red-600 hover:bg-red-50" : "text-slate-700 hover:bg-slate-50");
            if (it.href && !it.disabled) return <Link key={it.label} href={it.href} className={cls} onClick={() => setOpen(false)}>{it.icon}{it.label}</Link>;
            return (
              <button key={it.label} type="button" disabled={it.disabled} className={cls} onClick={() => { setOpen(false); it.onSelect?.(); }}>{it.icon}{it.label}</button>
            );
          })}
      </Floating>
    </div>
  );
}

export function SuccessIcon({ className }: { className?: string }) {
  return (
    <div className={cn("flex h-12 w-12 items-center justify-center rounded-full bg-green-50 text-green-600", className)}>
      <Check className="h-5 w-5" />
    </div>
  );
}

export function Drawer({ open, onClose, children, width = "max-w-[420px]" }: { open: boolean; onClose: () => void; children: ReactNode; width?: string }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-slate-900/30 animate-fade-in" onClick={onClose} />
      <div className={cn("absolute inset-y-0 right-0 flex w-full flex-col bg-white shadow-2xl animate-pop-in", width)} role="dialog" aria-modal>{children}</div>
    </div>
  );
}

export function BackLink({ href, label, current }: { href: string; label: string; current: string }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <Link href={href} className="inline-flex items-center gap-1 font-medium text-blue-600 hover:underline"><ChevronLeft className="h-3.5 w-3.5" /> {label}</Link>
      <ChevronRight className="h-3 w-3 text-slate-300" />
      <span className="text-slate-400">{current}</span>
    </div>
  );
}
