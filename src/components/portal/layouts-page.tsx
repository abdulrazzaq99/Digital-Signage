"use client";
import { Button } from "@/components/ui/button";
import { PillTabs, SearchInput } from "@/components/ui/input";
import { zoneLayouts } from "@/lib/data";
import { portalTemplates } from "@/lib/portal-data";
import { cn } from "@/lib/utils";
import { ChevronRight, Lock } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { PortalTemplateArt } from "./template-art";

export function NavyZoneDiagram({ layoutId, className, labels }: { layoutId: string; className?: string; labels?: string[] }) {
  const zone = (i: number, cls: string) => <div key={i} className={cn("flex items-center justify-center rounded-sm border border-blue-400/40 bg-blue-950/60 text-[7px] font-semibold uppercase tracking-wider text-blue-300", cls)}>{labels?.[i]}</div>;
  return (
    <div className={cn("aspect-video overflow-hidden rounded-lg border-4 border-slate-800 bg-slate-900 p-1.5", className)}>
      <div className={cn("flex h-full w-full gap-1", layoutId === "main-bottom-bar" && "flex-col")}>
        {layoutId === "full-screen" && zone(0, "flex-1")}
        {layoutId === "main-sidebar" && <>{zone(0, "flex-[7]")}{zone(1, "flex-[3]")}</>}
        {layoutId === "main-bottom-bar" && <>{zone(0, "flex-[3]")}{zone(1, "flex-1")}</>}
        {layoutId === "split-screen" && <>{zone(0, "flex-1")}{zone(1, "flex-1")}</>}
        {layoutId === "main-two-side" && <>{zone(0, "flex-[68]")}<div className="flex flex-[32] flex-col gap-1">{zone(1, "flex-1")}{zone(2, "flex-1")}</div></>}
      </div>
    </div>
  );
}

const zoneLabels: Record<string, string[]> = { "full-screen": ["Main Zone"], "main-sidebar": ["Main", "Sidebar"], "main-bottom-bar": ["Main", "Bottom Bar"], "split-screen": ["Left", "Right"], "main-two-side": ["Main", "Side Top", "Side Bot"] };
const zoneDesc: Record<string, string> = { "full-screen": "Single full-canvas zone", "main-sidebar": "Content area with right sidebar", "main-bottom-bar": "Hero content with ticker bar", "split-screen": "Two equal side-by-side zones", "main-two-side": "Large main with stacked sidebar" };

export function LayoutsPage({ tab }: { tab: "layouts" | "templates" }) {
  const router = useRouter();
  const [cat, setCat] = useState<"All" | "Retail" | "Food & Beverage" | "Corporate">("All");
  const [orient, setOrient] = useState<"All" | "Landscape" | "Portrait">("All");
  const templates = portalTemplates.filter((t) => (cat === "All" || t.category === cat) && (orient === "All" || t.orientation === orient));

  return (
    <div className="space-y-5">
      <PillTabs options={[{ value: "layouts", label: "Layouts" }, { value: "templates", label: "Templates" }]} value={tab} onChange={(v) => router.push(v === "layouts" ? "/portal/layouts" : "/portal/layouts?tab=templates")} />
      {tab === "layouts" ? (
        <>
          <p className="flex items-center gap-1.5 text-xs text-slate-500"><Lock className="h-3 w-3 text-slate-400" /> Zone positions and sizes are fixed. You can assign your content to each zone.</p>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {zoneLayouts.map((z) => (
              <div key={z.id} className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                <NavyZoneDiagram layoutId={z.id} labels={zoneLabels[z.id]} />
                <div className="mt-3 text-sm font-semibold text-slate-900">{z.name}</div>
                <div className="text-[11px] text-slate-400">{z.zones} zone{z.zones > 1 ? "s" : ""} · {zoneDesc[z.id]}</div>
                <Button href={`/portal/layouts/use/${z.id}`} className="mt-3 w-full" size="sm">Use Layout</Button>
              </div>
            ))}
          </div>
        </>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-3"><SearchInput placeholder="Search Templates..." className="w-56" /><PillTabs options={(["All", "Retail", "Food & Beverage", "Corporate"] as const).map((v) => ({ value: v, label: v }))} value={cat} onChange={setCat} /><PillTabs options={(["All", "Landscape", "Portrait"] as const).map((v) => ({ value: v, label: v }))} value={orient} onChange={setOrient} /></div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {templates.map((t) => (
              <Link key={t.id} href={`/portal/layouts/templates/${t.id}`} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md">
                <PortalTemplateArt template={t} className="rounded-none text-[13px]" />
                <div className="flex items-center justify-between px-4 py-3"><div><div className="text-sm font-semibold text-slate-900">{t.name}</div><div className="text-[11px] text-slate-400">{t.category} · {t.orientation}</div></div><ChevronRight className="h-4 w-4 text-slate-300" /></div>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
