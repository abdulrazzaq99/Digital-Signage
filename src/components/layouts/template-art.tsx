import type { Template } from "@/lib/data";
import { cn } from "@/lib/utils";

export function TemplateArt({ t, className, values }: { t: Template; className?: string; values?: { title?: string; sub?: string; kicker?: string } }) {
  const portrait = t.orientation === "Portrait";
  return (
    <div className={cn("relative overflow-hidden bg-gradient-to-br text-white", t.theme, portrait ? "aspect-[9/16]" : "aspect-video", className)}>
      {t.superAdmin && <span className="absolute left-2 top-2 rounded bg-violet-600 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider">Super Admin</span>}
      <div className={cn("absolute inset-0 flex flex-col justify-end p-[8%]", t.category === "Hotel" && "items-center justify-center text-center", t.category === "Promotional" && "items-end")}>
        <div className="text-[0.55em] font-medium tracking-[0.25em] opacity-80">{values?.kicker ?? t.kicker}</div>
        <div className={cn("mt-1 font-bold leading-tight", t.title.length < 8 ? "text-[2.4em]" : "text-[1.15em]")}>{values?.title ?? t.title}</div>
        {(values?.sub ?? t.sub) && <div className="mt-1 text-[0.55em] opacity-80">{values?.sub ?? t.sub}</div>}
        {(t.category === "Retail" || t.category === "Travel") && <span className="mt-2 inline-block rounded bg-white px-2 py-0.5 text-[0.5em] font-semibold text-slate-900">Shop Now</span>}
      </div>
    </div>
  );
}
