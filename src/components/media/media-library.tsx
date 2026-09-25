"use client";
import { useCompanyScope } from "@/components/admin/company-scope";
import { MediaPreview, statusTone, typeTone } from "@/components/portal/media-drawer";
import { useMediaTotals } from "@/components/portal/media-page";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, StatCard } from "@/components/ui/card";
import { FilterSelect, SearchInput } from "@/components/ui/input";
import { CompanyGate, CompanySelect } from "@/components/screens/query-guards";
import { useDebouncedValue } from "@/lib/use-debounced-value";
import { DropdownMenu, PageHeader, Pagination } from "@/components/ui/misc";
import { CardGridSkeleton, EmptyState, QueryState } from "@/components/ui/query-state";
import { useToast } from "@/components/ui/toast";
import { MEDIA_TYPES, mediaTypeLabel, useMedia, useRetryMedia, useUpdateMedia } from "@/lib/api/hooks/media";
import type { Media } from "@/lib/api/types";
import { fmtClock, formatBytes, label } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Eye, FileText, ImageIcon, LayoutGrid, List, Pencil, RefreshCw, Trash2, Upload } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { PreviewMediaModal, RemoveMediaModal, RenameModal, UploadMediaModal } from "./media-modals";

const metaLine = (m: Media) => (m.type === "VIDEO" ? (m.durationSec ? fmtClock(m.durationSec) : "Video") : m.type === "PDF" ? (m.pages ? `${m.pages} pages` : "PDF") : m.width && m.height ? `${m.width}×${m.height}` : "Image");

export function MediaLibrary() {
  const scope = useCompanyScope();
  const companyId = scope.companyId;
  const toast = useToast();
  const [view, setView] = useState<"grid" | "list">("grid");
  const [q, setQ] = useState("");
  const [type, setType] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [upload, setUpload] = useState(false);
  const [preview, setPreview] = useState<Media | null>(null);
  const [rename, setRename] = useState<Media | null>(null);
  const [remove, setRemove] = useState<Media | null>(null);
  const search = useDebouncedValue(q.trim(), 300);
  const media = useMedia({ search: search || undefined, type: (type || undefined) as Media["type"] | undefined, status: (status || undefined) as Media["status"] | undefined, page }, { companyId, enabled: !!companyId });
  const totals = useMediaTotals(companyId, !!companyId);
  const update = useUpdateMedia(companyId);
  const retry = useRetryMedia(companyId);
  const doRetry = (m: Media) => !retry.isPending && retry.mutate(m.id, { onSuccess: () => toast.success("Processing restarted", m.name), onError: (e) => toast.error(e) });
  const menu = (m: Media) => [
    { label: "Preview", icon: <Eye className="h-3.5 w-3.5" />, onSelect: () => setPreview(m) },
    { label: "View Details", icon: <FileText className="h-3.5 w-3.5" />, href: scope.withCompany(`/media/${m.id}`) },
    { label: "Rename", icon: <Pencil className="h-3.5 w-3.5" />, onSelect: () => setRename(m) },
    { label: "Remove", icon: <Trash2 className="h-3.5 w-3.5" />, tone: "danger" as const, onSelect: () => setRemove(m) },
  ];

  return (
    <div className="space-y-5">
      <PageHeader title="Media Library" subtitle="Upload and manage content used across your screens." action={<div className="sm:text-right"><Button onClick={() => setUpload(true)} disabled={!companyId}><Upload className="h-4 w-4" /> Upload Media</Button><div className="mt-1 text-[10px] text-slate-400">JPG, PNG, MP4 and PDF</div></div>} />
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard value={totals.total} label="Media Files" sub="In this company" />
        <StatCard value={totals.ready} label="Ready" sub="Available for playlists" />
        <StatCard value={totals.processing} label="Processing" sub="Being converted" />
      </div>
      <Card className="flex flex-wrap items-center gap-3 px-4 py-3">
        <span className="text-xs font-semibold text-slate-700">Media Context:</span>
        <div className="flex items-center gap-2 text-xs text-slate-500">Company: <CompanySelect className="w-44 [&_select]:h-8" aria-label="Company" value={companyId} onChange={(id) => { scope.setCompanyId(id); setPage(1); }} /></div>
        <span className="ml-auto text-[11px] text-slate-400">Showing media files for {scope.companyName || "…"}</span>
      </Card>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <SearchInput placeholder="Search media..." className="w-56" maxLength={120} value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} />
          <FilterSelect label="All Types" options={MEDIA_TYPES.map((t) => ({ value: t, label: mediaTypeLabel(t) }))} value={type} onChange={(v) => { setType(v); setPage(1); }} />
          <FilterSelect label="All Statuses" options={["READY", "PROCESSING", "FAILED"].map((s) => ({ value: s, label: label(s) }))} value={status} onChange={(v) => { setStatus(v); setPage(1); }} />
          <span className="text-xs text-slate-400">{media.data?.meta?.total ?? 0} files</span>
        </div>
        <div className="flex rounded-lg border border-slate-200 bg-white p-0.5"><button onClick={() => setView("grid")} className={cn("flex h-10 w-10 sm:h-7 sm:w-7 items-center justify-center rounded-md", view === "grid" ? "bg-blue-50 text-blue-600" : "text-slate-400")} aria-label="Grid view"><LayoutGrid className="h-3.5 w-3.5" /></button><button onClick={() => setView("list")} className={cn("flex h-10 w-10 sm:h-7 sm:w-7 items-center justify-center rounded-md", view === "list" ? "bg-blue-50 text-blue-600" : "text-slate-400")} aria-label="List view"><List className="h-3.5 w-3.5" /></button></div>
      </div>

      <CompanyGate companyId={companyId} skeleton={<CardGridSkeleton count={10} className="xl:grid-cols-5" />} what="its media library">
      <QueryState query={media} skeleton={<CardGridSkeleton count={10} className="xl:grid-cols-5" />} empty={<EmptyState icon={<ImageIcon className="h-5 w-5" />} title={search || type || status ? "No media matches" : `${scope.companyName || "This company"} has no media yet`} body="Upload images, videos, or PDFs on the company's behalf." action={<Button onClick={() => setUpload(true)}><Upload className="h-4 w-4" /> Upload Media</Button>} />}>
        {({ data, meta }) => (
          <>
            <div className={cn(view === "grid" ? "grid gap-4 sm:grid-cols-2 xl:grid-cols-5" : "space-y-2")}>
              {data.map((m) => (
                <div key={m.id} className={cn("overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm", view === "list" && "flex items-center")}>
                  <div className={cn("relative", view === "list" ? "w-40 shrink-0" : "")}>
                    <MediaPreview item={m} className={cn("aspect-video", m.status !== "READY" && "opacity-60")} />
                    <Badge tone={typeTone(m.type)} className="absolute left-2 top-2">{mediaTypeLabel(m.type)}</Badge>
                  </div>
                  <div className="min-w-0 flex-1 px-3.5 py-3">
                    <div className="flex items-start justify-between gap-2">
                      <Link href={scope.withCompany(`/media/${m.id}`)} className="truncate text-sm font-semibold text-slate-900 hover:text-blue-600">{m.name}</Link>
                      <DropdownMenu items={menu(m)} />
                    </div>
                    <div className="mt-1 text-[11px] text-slate-400">{metaLine(m)} · {formatBytes(m.sizeBytes)}</div>
                    <div className="mt-2 flex items-center justify-between">
                      <Badge tone={statusTone(m.status)}>{label(m.status)}</Badge>
                      {m.status === "FAILED" && <span className="flex gap-2 text-[11px] font-medium"><button onClick={() => doRetry(m)} disabled={retry.isPending} className="flex items-center gap-1 text-blue-600 hover:underline disabled:opacity-50"><RefreshCw className="h-3 w-3" />Retry</button><button onClick={() => setRemove(m)} className="text-red-600 hover:underline">Remove</button></span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {meta && meta.totalPages > 1 && <Pagination page={meta.page} pages={meta.totalPages} onChange={setPage} summary={`${meta.total} files`} />}
          </>
        )}
      </QueryState>
      </CompanyGate>

      <UploadMediaModal open={upload} onClose={() => setUpload(false)} defaultCompanyId={companyId} />
      <PreviewMediaModal item={preview} onClose={() => setPreview(null)} />
      {rename && <RenameModal open onClose={() => setRename(null)} name={rename.name} onSave={(name) => update.mutateAsync({ id: rename.id, name }).then(() => toast.success("Renamed"))} />}
      <RemoveMediaModal item={remove} companyId={companyId} onClose={() => setRemove(null)} />
    </div>
  );
}
