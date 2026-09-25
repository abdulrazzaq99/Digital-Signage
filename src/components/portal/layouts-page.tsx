"use client";
import { Button } from "@/components/ui/button";
import { PillTabs, SearchInput } from "@/components/ui/input";
import { CardGridSkeleton, EmptyState, QueryState } from "@/components/ui/query-state";
import { usePresets } from "@/lib/api/hooks/layouts";
import { useTemplates } from "@/lib/api/hooks/templates";
import type { Layout } from "@/lib/api/types";
import { label } from "@/lib/format";
import { cn } from "@/lib/utils";
import { ChevronRight, LayoutTemplate, Lock } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useDebouncedValue } from "@/lib/use-debounced-value";
import { PortalTemplateArt } from "./template-art";

/** Draws a layout's zones from their fractional geometry (x, y, w, h in 0..1). */
export function NavyZoneDiagram({ zones, className, showNames = true, filled }: { zones: Layout["zones"]; className?: string; showNames?: boolean; filled?: Record<number, string> }) {
  return (
    <div className={cn("relative aspect-video overflow-hidden rounded-lg border-4 border-slate-800 bg-slate-900", className)}>
      {(zones ?? []).map((z) => (
        <div key={z.index} className={cn("absolute flex flex-col items-center justify-center overflow-hidden rounded-sm border text-center", filled?.[z.index] ? "border-blue-400/40 bg-slate-800" : "border-blue-400/40 bg-blue-950/60")} style={{ left: `calc(${z.x * 100}% + 2px)`, top: `calc(${z.y * 100}% + 2px)`, width: `calc(${z.w * 100}% - 4px)`, height: `calc(${z.h * 100}% - 4px)` }}>
          {showNames && <span className="px-1 text-[7px] font-semibold uppercase tracking-wider text-blue-300">{z.name}</span>}
          {filled?.[z.index] && <span className="max-w-[90%] truncate px-1 text-[7px] text-slate-400">{filled[z.index]}</span>}
        </div>
      ))}
    </div>
  );
}

const zoneDesc: Record<string, string> = { "full-screen": "Single full-canvas zone", "main-sidebar": "Content area with right sidebar", "main-bottom-bar": "Hero content with ticker bar", "split-screen": "Two equal side-by-side zones", "main-two-side": "Large main with stacked sidebar" };

export function LayoutsPage({ tab, basePath = "/portal/layouts" }: { tab: "layouts" | "templates"; basePath?: string }) {
  const router = useRouter();
  const presets = usePresets();
  const templates = useTemplates();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");
  const [orient, setOrient] = useState<"All" | "LANDSCAPE" | "PORTRAIT">("All");
  const search = useDebouncedValue(q.trim().toLowerCase(), 200);
  const categories = ["All", ...new Set((templates.data?.data ?? []).map((t) => t.category))];
  const filtered = (templates.data?.data ?? []).filter((t) => (cat === "All" || t.category === cat) && (orient === "All" || t.orientation === orient) && (t.name ?? "").toLowerCase().includes(search));

  return (
    <div className="space-y-5">
      <PillTabs options={[{ value: "layouts", label: "Layouts" }, { value: "templates", label: "Templates" }]} value={tab} onChange={(v) => router.push(v === "layouts" ? basePath : `${basePath}?tab=templates`)} />
      {tab === "layouts" ? (
        <>
          <p className="flex items-center gap-1.5 text-xs text-slate-500"><Lock className="h-3 w-3 text-slate-400" /> Zone positions and sizes are fixed. You can assign your content to each zone.</p>
          <QueryState query={presets} skeleton={<CardGridSkeleton count={5} className="xl:grid-cols-4" />}>
            {({ data }) => (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {data.map((z) => (
                  <div key={z.id} className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                    <NavyZoneDiagram zones={z.zones} />
                    <div className="mt-3 text-sm font-semibold text-slate-900">{z.name}</div>
                    <div className="text-[11px] text-slate-400">{(z.zones ?? []).length} zone{(z.zones ?? []).length > 1 ? "s" : ""} · {zoneDesc[z.presetId] ?? "Fixed zone layout"}</div>
                    <Button href={`${basePath}/use/${z.presetId}`} className="mt-3 w-full" size="sm">Use Layout</Button>
                  </div>
                ))}
              </div>
            )}
          </QueryState>
        </>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-3"><SearchInput placeholder="Search Templates..." aria-label="Search templates" maxLength={120} className="w-56" value={q} onChange={(e) => setQ(e.target.value)} /><PillTabs options={categories.map((v) => ({ value: v, label: v }))} value={cat} onChange={setCat} /><PillTabs options={[{ value: "All" as const, label: "All" }, { value: "LANDSCAPE" as const, label: "Landscape" }, { value: "PORTRAIT" as const, label: "Portrait" }]} value={orient} onChange={setOrient} /></div>
          <QueryState query={templates} skeleton={<CardGridSkeleton />} empty={<EmptyState icon={<LayoutTemplate className="h-5 w-5" />} title="No templates available" body="Templates are published by the platform team." />}>
            {() => filtered.length === 0 ? <EmptyState title="No templates match" body="Try another category or orientation." /> : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {filtered.map((t) => (
                  <Link key={t.id} href={`${basePath}/templates/${t.id}`} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md">
                    <PortalTemplateArt template={t} className="rounded-none text-[13px]" />
                    <div className="flex items-center justify-between px-4 py-3"><div><div className="text-sm font-semibold text-slate-900">{t.name}</div><div className="text-[11px] text-slate-400">{t.category} · {label(t.orientation)} · {(t.fields ?? []).length} fields</div></div><ChevronRight className="h-4 w-4 text-slate-300" /></div>
                  </Link>
                ))}
              </div>
            )}
          </QueryState>
        </>
      )}
    </div>
  );
}
