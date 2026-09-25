"use client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, StatCard } from "@/components/ui/card";
import { SearchInput } from "@/components/ui/input";
import { DropdownMenu, Pagination } from "@/components/ui/misc";
import { CardGridSkeleton, EmptyState, QueryState } from "@/components/ui/query-state";
import { TD, TH, THead, TR, Table } from "@/components/ui/table";
import { mediaTypeLabel, useMedia } from "@/lib/api/hooks/media";
import type { Media } from "@/lib/api/types";
import { formatBytes, formatDate, label } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Eye, ImageIcon, LayoutGrid, List, Trash2, Upload } from "lucide-react";
import { useState } from "react";
import { useDebouncedValue } from "@/lib/use-debounced-value";
import { MediaDrawer, MediaPreview, statusTone, typeTone, type MediaDrawerView } from "./media-drawer";
import { PortalUploadModal } from "./upload-media-modal";

const TYPE_TABS: { value: "" | Media["type"]; label: string }[] = [{ value: "", label: "All" }, { value: "IMAGE", label: "Images" }, { value: "VIDEO", label: "Videos" }, { value: "PDF", label: "PDFs" }];

/** Counts per status for the stat tiles: one tiny query each (no aggregate endpoint). */
export function useMediaTotals(companyId?: string | null, enabled = true) {
  const all = useMedia({ pageSize: 1 }, { companyId, enabled });
  const ready = useMedia({ status: "READY", pageSize: 1 }, { companyId, enabled });
  const processing = useMedia({ status: "PROCESSING", pageSize: 1 }, { companyId, enabled });
  const failed = useMedia({ status: "FAILED", pageSize: 1 }, { companyId, enabled });
  const n = (q: typeof all) => q.data?.meta?.total ?? "—";
  return { total: n(all), ready: n(ready), processing: n(processing), failed: n(failed) };
}

export function MediaPage({ companyId }: { companyId?: string | null } = {}) {
  const [type, setType] = useState<"" | Media["type"]>("");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [upload, setUpload] = useState(false);
  const [drawer, setDrawer] = useState<{ id: string; view: MediaDrawerView } | null>(null);
  const search = useDebouncedValue(q.trim(), 300);
  const media = useMedia({ search: search || undefined, type: type || undefined, page }, { companyId });
  const totals = useMediaTotals(companyId);
  const open = (m: Media, v: MediaDrawerView = "detail") => setDrawer({ id: m.id, view: v });
  const menu = (m: Media) => [{ label: "View Details", icon: <Eye className="h-3.5 w-3.5" />, onSelect: () => open(m) }, { label: "Delete", icon: <Trash2 className="h-3.5 w-3.5" />, tone: "danger" as const, onSelect: () => open(m, "delete") }];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <SearchInput placeholder="Search media..." className="w-56" maxLength={120} value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} />
          <div className="flex flex-wrap gap-1.5">{TYPE_TABS.map((t) => <button key={t.value} onClick={() => { setType(t.value); setPage(1); }} className={cn("flex h-8 items-center gap-1.5 rounded-md border px-3 text-xs font-medium transition-colors", type === t.value ? "border-blue-200 bg-blue-50 text-blue-600" : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50")}>{t.label}</button>)}</div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-slate-200 bg-white p-0.5"><button onClick={() => setView("grid")} className={cn("flex h-7 w-7 items-center justify-center rounded-md", view === "grid" ? "bg-blue-50 text-blue-600" : "text-slate-400")} aria-label="Grid view"><LayoutGrid className="h-3.5 w-3.5" /></button><button onClick={() => setView("list")} className={cn("flex h-7 w-7 items-center justify-center rounded-md", view === "list" ? "bg-blue-50 text-blue-600" : "text-slate-400")} aria-label="List view"><List className="h-3.5 w-3.5" /></button></div>
          <Button onClick={() => setUpload(true)}><Upload className="h-4 w-4" /> Upload Media</Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard value={totals.total} label="Total Files" tone="blue" />
        <StatCard value={totals.ready} label="Ready" tone="green" />
        <StatCard value={totals.processing} label="Processing" tone="amber" />
        <StatCard value={totals.failed} label="Failed" tone="red" />
      </div>

      <QueryState query={media} skeleton={<CardGridSkeleton count={10} className="xl:grid-cols-5" />} empty={<EmptyState icon={<ImageIcon className="h-5 w-5" />} title={search || type ? "No media matches" : "No media yet"} body={search || type ? "Try another search or type." : "Upload images, videos, or PDFs to use in playlists."} action={<Button onClick={() => setUpload(true)}><Upload className="h-4 w-4" /> Upload Media</Button>} />}>
        {({ data, meta }) => (
          <>
            {view === "grid" ? (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                {data.map((m) => (
                  <div key={m.id} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                    <button onClick={() => open(m)} className="relative block w-full text-left">
                      {m.status === "PROCESSING" || m.status === "UPLOADING" ? <div className="relative flex aspect-video items-center justify-center bg-slate-800"><span className="absolute left-2 top-2 z-10 rounded-full bg-amber-100 px-2 py-0.5 text-[9px] font-semibold text-amber-700">● {label(m.status)}</span><MediaPreview item={m} className="h-full w-full opacity-40" /></div>
                        : m.status === "FAILED" ? <div className="relative flex aspect-video items-center justify-center bg-orange-50"><span className="absolute left-2 top-2 z-10 rounded-full bg-red-100 px-2 py-0.5 text-[9px] font-semibold text-red-600">● Failed</span><MediaPreview item={m} className="h-full w-full" /></div>
                        : <MediaPreview item={m} className="aspect-video" />}
                    </button>
                    <div className="flex items-start justify-between gap-2 px-3 py-2.5">
                      <div className="min-w-0"><button onClick={() => open(m)} className="block max-w-full truncate text-xs font-semibold text-slate-900 hover:text-blue-600">{m.name}</button><div className="mt-1 flex items-center gap-1.5"><Badge tone={typeTone(m.type)}>{mediaTypeLabel(m.type)}</Badge><span className="text-[10px] text-slate-400">{formatBytes(m.sizeBytes)}</span></div></div>
                      <DropdownMenu items={menu(m)} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Card>
                <Table>
                  <THead><tr><TH>Preview</TH><TH>Name</TH><TH>Type</TH><TH>Status</TH><TH>Size</TH><TH>Used In</TH><TH> </TH></tr></THead>
                  <tbody>
                    {data.map((m) => (
                      <TR key={m.id} className="cursor-pointer" onClick={() => open(m)}>
                        <TD><MediaPreview item={m} className="h-8 w-12 overflow-hidden rounded" /></TD>
                        <TD><div className="text-sm font-semibold text-slate-900 whitespace-nowrap">{m.name}</div><div className="text-[11px] text-slate-400 whitespace-nowrap">{formatDate(m.createdAt)}</div></TD>
                        <TD><Badge tone={typeTone(m.type)}>{mediaTypeLabel(m.type)}</Badge></TD>
                        <TD><Badge tone={statusTone(m.status)} dot>{label(m.status)}</Badge></TD>
                        <TD className="text-xs whitespace-nowrap">{formatBytes(m.sizeBytes)}</TD>
                        <TD className="text-xs text-slate-500 whitespace-nowrap">{(m.usedIn ?? []).length ? `${m.usedIn.length} playlist${m.usedIn.length > 1 ? "s" : ""}` : <span className="text-slate-300">Unused</span>}</TD>
                        <TD onClick={(e) => e.stopPropagation()}><DropdownMenu items={menu(m)} /></TD>
                      </TR>
                    ))}
                  </tbody>
                </Table>
              </Card>
            )}
            {meta && meta.totalPages > 1 && <Pagination page={meta.page} pages={meta.totalPages} onChange={setPage} summary={`${meta.total} files`} />}
          </>
        )}
      </QueryState>

      <PortalUploadModal open={upload} onClose={() => setUpload(false)} companyId={companyId} />
      <MediaDrawer id={drawer?.id ?? null} initialView={drawer?.view ?? "detail"} companyId={companyId} onClose={() => setDrawer(null)} />
    </div>
  );
}

