import type { PortalTemplate } from "@/lib/portal-data";
import { cn } from "@/lib/utils";

export function PortalTemplateArt({ template, values, className }: { template: PortalTemplate; values?: Record<string, string>; className?: string }) {
  const v = (k: string) => values?.[k] ?? template.fields.find((f) => f.key === k)?.defaultValue ?? "";
  if (template.id === "flash-sale") return (
    <div className={cn("relative flex aspect-video flex-col justify-center overflow-hidden rounded-lg bg-gradient-to-br from-slate-950 via-slate-900 to-red-950 p-[7%] text-white", className)}>
      <div className="text-[0.55em] font-bold tracking-[0.2em] text-red-500">{v("headline")}</div>
      <div className="mt-[2%] text-[1.9em] font-black leading-none">{v("discount")}</div>
      <div className="mt-[3%] text-[0.5em] text-white/50 line-through">Was {v("was")}</div>
      <div className="text-[0.85em] font-bold">Now {v("now")}</div>
      <div className="absolute inset-x-0 bottom-0 h-[4%] bg-red-500" />
    </div>
  );
  if (template.id === "event-announcement") return (
    <div className={cn("relative flex aspect-video flex-col justify-center overflow-hidden rounded-lg bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 p-[7%] text-white", className)}>
      <div className="text-[0.45em] font-semibold tracking-[0.25em] text-violet-400">{v("kicker")}</div>
      <div className="mt-[2%] text-[1.15em] font-bold leading-tight">{v("title")}</div>
      <div className="mt-[4%] border-l-2 border-violet-500 pl-[3%] text-[0.5em] text-white/80"><div>{v("date")}</div><div>{v("time")}</div></div>
    </div>
  );
  return (
    <div className={cn("relative flex aspect-video flex-col justify-center overflow-hidden rounded-lg bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950 p-[7%] text-white", className)}>
      <div className="text-[1.1em] font-black leading-none text-amber-400">{v("title")}</div>
      <div className="mt-[3%] flex items-center gap-[4%]"><span className="text-[1.6em] font-black text-amber-400">{v("start")}</span><span className="text-[0.9em] text-amber-400">→</span></div>
      <div className="text-[0.4em] tracking-[0.2em] text-white/50">STARTS</div>
      <div className="mt-[1%] text-[1.6em] font-black leading-none">{v("end")}</div>
      <div className="absolute inset-x-0 bottom-0 h-[4%] bg-amber-400" />
    </div>
  );
}
