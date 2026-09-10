"use client";
import { cn } from "@/lib/utils";
import { ChevronDown, Search } from "lucide-react";
import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

export function Label({ children, required, className }: { children: ReactNode; required?: boolean; className?: string }) {
  return (
    <label className={cn("mb-1.5 block text-xs font-medium text-slate-700", className)}>
      {children}{required && <span className="text-red-500"> *</span>}
    </label>
  );
}

export function Input({ className, ...rest }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn("h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20", className)}
      {...rest}
    />
  );
}

export function SearchInput({ className, ...rest }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className={cn("relative", className)}>
      <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
      <input
        className="h-9 w-full rounded-lg border border-slate-200 bg-white pl-8 pr-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
        {...rest}
      />
    </div>
  );
}

export function Select({ className, children, ...rest }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className={cn("relative", className)}>
      <select
        className="h-10 w-full appearance-none rounded-lg border border-slate-200 bg-white pl-3 pr-8 text-sm text-slate-900 shadow-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
        {...rest}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
    </div>
  );
}

export function FilterSelect({ label, className }: { label: string; className?: string }) {
  return (
    <button type="button" className={cn("inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-500 hover:bg-slate-50", className)}>
      {label}
      <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
    </button>
  );
}

export function Checkbox({ checked, onChange, className }: { checked?: boolean; onChange?: (v: boolean) => void; className?: string }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={() => onChange?.(!checked)}
      className={cn("flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors", checked ? "border-blue-600 bg-blue-600 text-white" : "border-slate-300 bg-white", className)}
    >
      {checked && <svg viewBox="0 0 12 12" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={2}><path d="M2.5 6.5l2.5 2.5 4.5-5" /></svg>}
    </button>
  );
}

export function Segmented<T extends string>({ options, value, onChange, className }: { options: { value: T; label: string }[]; value: T; onChange: (v: T) => void; className?: string }) {
  return (
    <div className={cn("grid gap-2", className)} style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0,1fr))` }}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={cn("h-9 rounded-lg border text-xs font-medium transition-colors", value === o.value ? "border-blue-600 bg-blue-600 text-white" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50")}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function PillTabs<T extends string>({ options, value, onChange, className }: { options: { value: T; label: string }[]; value: T; onChange: (v: T) => void; className?: string }) {
  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={cn("h-8 rounded-md border px-3 text-xs font-medium transition-colors", value === o.value ? "border-blue-200 bg-blue-50 text-blue-600" : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50")}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Textarea({ className, ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn("w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20", className)}
      {...rest}
    />
  );
}

export function Toggle({ checked, onChange, className }: { checked: boolean; onChange: (v: boolean) => void; className?: string }) {
  return (
    <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)} className={cn("relative h-5 w-9 shrink-0 rounded-full transition-colors", checked ? "bg-blue-600" : "bg-slate-200", className)}>
      <span className={cn("absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform", checked ? "translate-x-4" : "translate-x-0.5")} />
    </button>
  );
}

export function UnderlineTabs<T extends string>({ options, value, onChange, className }: { options: { value: T; label: string; icon?: ReactNode; count?: number }[]; value: T; onChange: (v: T) => void; className?: string }) {
  return (
    <div className={cn("border-b border-slate-200", className)}>
      <div className="-mb-px flex gap-6">
        {options.map((o) => (
          <button key={o.value} type="button" onClick={() => onChange(o.value)} className={cn("flex items-center gap-2 border-b-2 pb-3 text-sm font-medium transition-colors", value === o.value ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-800")}>
            {o.icon}{o.label}
            {o.count !== undefined && <span className={cn("rounded-full px-1.5 py-0.5 text-[10px] font-semibold", value === o.value ? "bg-blue-600 text-white" : "bg-amber-500 text-white")}>{o.count}</span>}
          </button>
        ))}
      </div>
    </div>
  );
}

export function RadioCard({ checked, onSelect, title, sub, className }: { checked: boolean; onSelect: () => void; title: ReactNode; sub?: ReactNode; className?: string }) {
  return (
    <button type="button" onClick={onSelect} className={cn("flex w-full items-start gap-3 rounded-lg border px-4 py-3 text-left transition-colors", checked ? "border-blue-300 bg-blue-50/50" : "border-slate-200 bg-white hover:bg-slate-50", className)}>
      <span className={cn("mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border", checked ? "border-blue-600" : "border-slate-300")}>{checked && <span className="h-2 w-2 rounded-full bg-blue-600" />}</span>
      <span><span className="block text-sm font-semibold text-slate-900">{title}</span>{sub && <span className="block text-[11px] text-slate-400">{sub}</span>}</span>
    </button>
  );
}
