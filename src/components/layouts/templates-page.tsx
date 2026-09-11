"use client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FilterSelect, PillTabs, SearchInput, UnderlineTabs } from "@/components/ui/input";
import { DropdownMenu, PageHeader } from "@/components/ui/misc";
import { templates, zoneLayouts, type TemplateCategory } from "@/lib/data";
import { cn } from "@/lib/utils";
import { Copy, Eye, LayoutGrid, LayoutTemplate, Pencil, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { CreateTemplateModal } from "./template-modals";
import { TemplateArt } from "./template-art";

const cats: ("All" | "Landscape" | "Portrait" | TemplateCategory)[] = ["All", "Landscape", "Portrait", "Promotional", "Announcement", "Retail", "Restaurant", "Hotel", "Corporate", "Event", "Travel"];
const catTone: Record<TemplateCategory, "green" | "blue" | "amber" | "purple" | "red" | "slate"> = { Event: "purple", Corporate: "blue", Restaurant: "amber", Hotel: "blue", Announcement: "red", Retail: "red", Travel: "green", Promotional: "amber" };

export function TemplatesPage({ initialTab = "fixed" }: { initialTab?: "fixed" | "zones" }) {
  const [tab, setTab] = useState<"fixed" | "zones">(initialTab);
  const [cat, setCat] = useState<(typeof cats)[number]>("All");
  const [orient, setOrient] = useState<"All" | "Landscape" | "Portrait">("All");
  const [q, setQ] = useState("");
  const [create, setCreate] = useState(false);
  const list = templates.filter((t) => t.name.toLowerCase().includes(q.toLowerCase()) && (cat === "All" || cat === t.category || cat === t.orientation));

  return (
    <div className="space-y-5">
      <PageHeader title="Layouts & Templates" subtitle="Create signage content using approved, fixed-layout templates." action={tab === "fixed" ? <Button onClick={() => setCreate(true)}><Plus className="h-4 w-4" /> Create Template</Button> : undefined} />
      <UnderlineTabs options={[{ value: "fixed", label: "Fixed Templates", icon: <LayoutTemplate className="h-3.5 w-3.5" /> }, { value: "zones", label: "Multi-zone Layouts", icon: <LayoutGrid className="h-3.5 w-3.5" /> }]} value={tab} onChange={setTab} />

      {tab === "fixed" ? (
        <>
          <div className="flex flex-wrap items-center gap-2"><SearchInput placeholder="Search templates..." className="w-64" value={q} onChange={(e) => setQ(e.target.value)} /><FilterSelect label="Newest first" /></div>
          <div className="flex flex-wrap gap-1.5">{cats.map((c) => <button key={c} onClick={() => setCat(c)} className={cn("h-7 rounded-full border px-3 text-[11px] font-medium transition-colors", cat === c ? "border-blue-600 bg-blue-600 text-white" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50")}>{c}</button>)}</div>
          <div className="grid items-start gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {list.map((t) => (
              <div key={t.id} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <Link href={`/layouts/${t.id}`} className="block bg-slate-900"><div className={cn(t.orientation === "Portrait" ? "aspect-[3/4]" : "aspect-video", "flex items-center justify-center bg-slate-900")}><TemplateArt t={t} className={cn("text-[10px]", t.orientation === "Portrait" ? "h-full" : "w-full")} /></div></Link>
                <div className="px-3.5 py-3">
                  <div className="flex items-start justify-between gap-2"><Link href={`/layouts/${t.id}`} className="text-sm font-semibold text-slate-900 hover:text-blue-600">{t.name}</Link><DropdownMenu items={[{ label: "View Details", icon: <Eye className="h-3.5 w-3.5" />, href: `/layouts/${t.id}` }, { label: "Use Template", icon: <LayoutTemplate className="h-3.5 w-3.5" />, href: `/layouts/new/configure?t=${t.id}` }, { label: "Duplicate", icon: <Copy className="h-3.5 w-3.5" /> }, { label: "Edit", icon: <Pencil className="h-3.5 w-3.5" /> }, { label: "Delete", icon: <Trash2 className="h-3.5 w-3.5" />, tone: "danger" }]} /></div>
                  <div className="mt-1.5 flex items-center gap-1.5 text-[10px] text-slate-400"><Badge tone={catTone[t.category]}>{t.category}</Badge><span>{t.orientation}</span><span>·</span><span>{t.ratio}</span></div>
                  <div className="mt-2 text-[11px] text-slate-400">Used in <span className="font-semibold text-slate-700">{t.usedIn}</span> playlists</div>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-3"><SearchInput placeholder="Search templates..." className="w-64" /><PillTabs options={[{ value: "All", label: "All" }, { value: "Landscape", label: "Landscape" }, { value: "Portrait", label: "Portrait" }]} value={orient} onChange={setOrient} /></div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {zoneLayouts.map((z) => (
              <div key={z.id} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="relative bg-slate-900 p-5"><ZoneDiagram layout={z.id} portrait={orient === "Portrait"} /><span className="absolute right-3 top-3 rounded bg-blue-600 px-1.5 py-0.5 text-[10px] font-semibold text-white">{z.zones} Zone{z.zones > 1 ? "s" : ""}</span><span className="absolute bottom-3 left-3 rounded bg-slate-800 px-1.5 py-0.5 text-[9px] text-slate-300">L | P</span></div>
                <div className="px-4 py-3">
                  <div className="text-sm font-semibold text-slate-900">{z.name}</div>
                  <p className="mt-1 min-h-[32px] text-[11px] leading-4 text-slate-400">{z.description}</p>
                  <div className="mt-2 flex gap-1.5">{z.zoneNames.map((n, i) => <Badge key={n} tone={i === 0 ? "blue" : "purple"}>Zone {i + 1}</Badge>)}</div>
                  <Button href={`/layouts/use/${z.id}`} variant="secondary" className="mt-3 w-full">Use Layout</Button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
      <CreateTemplateModal open={create} onClose={() => setCreate(false)} />
    </div>
  );
}

export function ZoneDiagram({ layout, portrait, className, labels = true }: { layout: string; portrait?: boolean; className?: string; labels?: boolean }) {
  const zone = (n: number, name: string, cls: string) => <div className={cn("flex flex-col items-center justify-center gap-1 rounded-md border", n === 1 ? "border-blue-200 bg-blue-50/80" : "border-violet-200 bg-violet-50/80", cls)}>{labels && <><span className={cn("flex h-4 w-4 items-center justify-center rounded-full text-[8px] font-bold text-white", n === 1 ? "bg-blue-600" : "bg-violet-600")}>{n}</span><span className="text-[8px] font-semibold text-slate-700">Zone {n}</span><span className="text-[7px] text-slate-400">{name}</span></>}</div>;
  return (
    <div className={cn("mx-auto overflow-hidden rounded-lg border-4 border-slate-700 bg-slate-100 p-1", portrait ? "aspect-[9/16] w-24" : "aspect-video w-full", className)}>
      {layout === "full-screen" && zone(1, "Full Screen", "h-full")}
      {layout === "main-bottom-bar" && <div className="flex h-full flex-col gap-1">{zone(1, "Main Content", "flex-[3]")}{zone(2, "Bottom Bar", "flex-1")}</div>}
      {layout === "split-screen" && <div className={cn("flex h-full gap-1", portrait && "flex-col")}>{zone(1, portrait ? "Top" : "Left", "flex-1")}{zone(2, portrait ? "Bottom" : "Right", "flex-1")}</div>}
    </div>
  );
}
