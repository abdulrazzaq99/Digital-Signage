"use client";
import { useCompanyScope } from "@/components/admin/company-scope";
import { NavyZoneDiagram } from "@/components/portal/layouts-page";
import { PortalTemplateArt } from "@/components/portal/template-art";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PillTabs, SearchInput, UnderlineTabs } from "@/components/ui/input";
import { Modal, ModalFooter, ModalHeader } from "@/components/ui/modal";
import { DropdownMenu, PageHeader } from "@/components/ui/misc";
import { CardGridSkeleton, EmptyState, QueryState } from "@/components/ui/query-state";
import { useToast } from "@/components/ui/toast";
import { usePresets } from "@/lib/api/hooks/layouts";
import { useDeleteTemplate, useTemplates } from "@/lib/api/hooks/templates";
import type { Template } from "@/lib/api/types";
import { formatDate, label } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Eye, LayoutGrid, LayoutTemplate, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useDebouncedValue } from "@/lib/use-debounced-value";
import { CreateTemplateModal } from "./template-modals";

const catTone = (c: string): "green" | "blue" | "amber" | "purple" | "red" | "slate" => { const k = c.toLowerCase(); return k.includes("retail") ? "red" : k.includes("food") || k.includes("restaurant") ? "amber" : k.includes("corporate") ? "blue" : k.includes("event") ? "purple" : "slate"; };
const zoneDesc: Record<string, string> = { "full-screen": "Single full-canvas zone for one playlist or asset.", "main-sidebar": "Main content area with a right-hand sidebar.", "main-bottom-bar": "Hero content with a ticker bar below.", "split-screen": "Two equal side-by-side zones.", "main-two-side": "Large main area with two stacked side zones." };

export function TemplatesPage({ initialTab = "fixed" }: { initialTab?: "fixed" | "zones" }) {
  const scope = useCompanyScope();
  const toast = useToast();
  const templates = useTemplates();
  const presets = usePresets();
  const remove = useDeleteTemplate();
  const [tab, setTab] = useState<"fixed" | "zones">(initialTab);
  const [cat, setCat] = useState("All");
  const [orient, setOrient] = useState<"All" | "LANDSCAPE" | "PORTRAIT">("All");
  const [q, setQ] = useState("");
  const [create, setCreate] = useState(false);
  const [del, setDel] = useState<Template | null>(null);
  const search = useDebouncedValue(q.trim().toLowerCase(), 200);
  const cats = ["All", ...new Set((templates.data?.data ?? []).map((t) => t.category))];
  const list = (templates.data?.data ?? []).filter((t) => (t.name ?? "").toLowerCase().includes(search) && (cat === "All" || cat === t.category) && (orient === "All" || t.orientation === orient));
  const doDelete = () => del && !remove.isPending && remove.mutate(del.id, { onSuccess: () => { toast.success("Template deleted", del.name); setDel(null); }, onError: (e) => toast.error(e) });

  return (
    <div className="space-y-5">
      <PageHeader title="Layouts & Templates" subtitle="Create signage content using approved, fixed-layout templates." action={tab === "fixed" ? <Button onClick={() => setCreate(true)}><Plus className="h-4 w-4" /> Create Template</Button> : undefined} />
      <UnderlineTabs options={[{ value: "fixed", label: "Fixed Templates", icon: <LayoutTemplate className="h-3.5 w-3.5" />, count: templates.data?.data?.length }, { value: "zones", label: "Multi-zone Layouts", icon: <LayoutGrid className="h-3.5 w-3.5" />, count: presets.data?.data?.length }]} value={tab} onChange={setTab} />

      {tab === "fixed" ? (
        <>
          <div className="flex flex-wrap items-center gap-2"><SearchInput placeholder="Search templates..." aria-label="Search templates" maxLength={120} className="w-64" value={q} onChange={(e) => setQ(e.target.value)} /><PillTabs options={[{ value: "All" as const, label: "All" }, { value: "LANDSCAPE" as const, label: "Landscape" }, { value: "PORTRAIT" as const, label: "Portrait" }]} value={orient} onChange={setOrient} /></div>
          <div className="flex flex-wrap gap-1.5">{cats.map((c) => <button key={c} onClick={() => setCat(c)} className={cn("h-7 rounded-full border px-3 text-[11px] font-medium transition-colors", cat === c ? "border-blue-600 bg-blue-600 text-white" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50")}>{c}</button>)}</div>
          <QueryState query={templates} skeleton={<CardGridSkeleton count={4} className="xl:grid-cols-4" />} empty={<EmptyState icon={<LayoutTemplate className="h-5 w-5" />} title="No templates yet" body="Define a fixed-layout template that customers can fill in." action={<Button onClick={() => setCreate(true)}><Plus className="h-4 w-4" /> Create Template</Button>} />}>
            {() => list.length === 0 ? <EmptyState title="No templates match" body="Try another search, category, or orientation." /> : (
              <div className="grid items-start gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {list.map((t) => (
                  <div key={t.id} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                    <Link href={`/layouts/${t.id}`} className="block bg-slate-900"><PortalTemplateArt template={t} className="rounded-none text-[10px]" /></Link>
                    <div className="px-3.5 py-3">
                      <div className="flex items-start justify-between gap-2"><Link href={`/layouts/${t.id}`} className="text-sm font-semibold text-slate-900 hover:text-blue-600">{t.name}</Link><DropdownMenu items={[{ label: "View Details", icon: <Eye className="h-3.5 w-3.5" />, href: `/layouts/${t.id}` }, { label: "Use for a company", icon: <LayoutTemplate className="h-3.5 w-3.5" />, href: scope.withCompany(`/layouts/new/configure?t=${t.id}`) }, { label: "Delete", icon: <Trash2 className="h-3.5 w-3.5" />, tone: "danger", onSelect: () => setDel(t) }]} /></div>
                      <div className="mt-1.5 flex items-center gap-1.5 text-[10px] text-slate-400"><Badge tone={catTone(t.category)}>{t.category}</Badge><span>{label(t.orientation)}</span><span>·</span><span>{(t.fields ?? []).length} fields</span></div>
                      <div className="mt-2 text-[11px] text-slate-400">Used in <span className="font-semibold text-slate-700">{t.usedIn}</span> instance{t.usedIn === 1 ? "" : "s"} · {formatDate(t.createdAt)}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </QueryState>
        </>
      ) : (
        <QueryState query={presets} skeleton={<CardGridSkeleton count={5} className="xl:grid-cols-4" />}>
          {({ data }) => (
            <>
              <div className="text-xs text-slate-400">{data.length} presets · zone geometry is fixed; customers bind content to each zone</div>
              <div className="grid items-start gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {data.map((z) => (
                  <div key={z.id} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                    <div className="relative bg-slate-900 p-5"><NavyZoneDiagram zones={z.zones} /><span className="absolute right-3 top-3 rounded bg-blue-600 px-1.5 py-0.5 text-[10px] font-semibold text-white">{(z.zones ?? []).length} Zone{(z.zones ?? []).length > 1 ? "s" : ""}</span></div>
                    <div className="px-4 py-3">
                      <div className="text-sm font-semibold text-slate-900">{z.name}</div>
                      <p className="mt-1 min-h-[32px] text-[11px] leading-4 text-slate-400">{zoneDesc[z.presetId] ?? "Fixed multi-zone layout."}</p>
                      <div className="mt-2 flex flex-wrap gap-1.5">{(z.zones ?? []).map((zn, i) => <Badge key={zn.index} tone={i === 0 ? "blue" : i === 1 ? "purple" : "green"}>{zn.name}</Badge>)}</div>
                      <Button href={scope.withCompany(`/layouts/use/${z.presetId}`)} variant="secondary" className="mt-3 w-full">Use for {scope.companyName || "a company"}</Button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </QueryState>
      )}
      <CreateTemplateModal open={create} onClose={() => setCreate(false)} />
      <Modal open={!!del} onClose={() => !remove.isPending && setDel(null)} width="max-w-md">
        <ModalHeader title={`Delete "${del?.name}"?`} subtitle={del?.usedIn ? `${del.usedIn} customer instance${del.usedIn > 1 ? "s" : ""} use this template; the API will refuse while they exist.` : "Customers will no longer be able to create content from it."} onClose={() => !remove.isPending && setDel(null)} />
        <ModalFooter><Button variant="secondary" onClick={() => setDel(null)} disabled={remove.isPending}>Cancel</Button><Button variant="danger" onClick={doDelete} disabled={remove.isPending}>{remove.isPending ? "Deleting…" : "Delete Template"}</Button></ModalFooter>
      </Modal>
    </div>
  );
}
