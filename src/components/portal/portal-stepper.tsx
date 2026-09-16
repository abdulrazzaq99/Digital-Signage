import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

export function PortalStepper({ steps, current, className }: { steps: string[]; current: number; className?: string }) {
  return (
    <div className={cn("flex items-start", className)}>
      {steps.map((label, i) => {
        const n = i + 1; const done = n < current; const active = n === current;
        return (
          <div key={label} className={cn("flex items-start", i < steps.length - 1 && "flex-1")}>
            <div className="flex w-16 flex-col items-center gap-1.5">
              <span className={cn("flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-semibold", done ? "bg-blue-600 text-white" : active ? "border-2 border-blue-600 bg-white text-blue-600" : "border border-slate-200 bg-white text-slate-400")}>{done ? <Check className="h-3.5 w-3.5" /> : n}</span>
              <span className={cn("text-center text-[10px] font-medium", active ? "text-blue-600" : done ? "text-slate-700" : "text-slate-400")}>{label}</span>
            </div>
            {i < steps.length - 1 && <div className={cn("mt-3.5 h-px flex-1", done ? "bg-blue-300" : "bg-slate-200")} />}
          </div>
        );
      })}
    </div>
  );
}

export function BackLinkButton({ label, onClick, href }: { label: string; onClick?: () => void; href?: string }) {
  const cls = "inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-800";
  if (href) return <a href={href} className={cls}>← {label}</a>;
  return <button type="button" onClick={onClick} className={cls}>← {label}</button>;
}
