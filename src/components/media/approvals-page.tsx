"use client";
import { MediaPreview, typeTone } from "@/components/portal/media-drawer";
import { Badge } from "@/components/ui/badge";
import { FilterSelect, SearchInput, UnderlineTabs } from "@/components/ui/input";
import { PageHeader, Pagination } from "@/components/ui/misc";
import { CardGridSkeleton, EmptyState, QueryState } from "@/components/ui/query-state";
import { MEDIA_TYPES, mediaTypeLabel, useMedia } from "@/lib/api/hooks/media";
import type { Media } from "@/lib/api/types";
import { formatBytes, formatDateTime } from "@/lib/format";
import { useDebouncedValue } from "@/lib/use-debounced-value";
import { ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { ApprovalBadge, ReviewActions } from "./approval";
import { PreviewMediaModal } from "./media-modals";

type Tab = Media["approval"];

/** Every company's uploads waiting for the Super Admin, plus the ones already decided. */
export function ApprovalsPage() {
  const [tab, setTab] = useState<Tab>("PENDING");
  const [q, setQ] = useState("");
  const [type, setType] = useState("");
  const [page, setPage] = useState(1);
  const [preview, setPreview] = useState<Media | null>(null);
  const search = useDebouncedValue(q.trim(), 300);
  const media = useMedia({ approval: tab, search: search || undefined, type: (type || undefined) as Media["type"] | undefined, page });
  const waiting = useMedia({ approval: "PENDING", pageSize: 1 });
  const go = (t: Tab) => { setTab(t); setPage(1); };
  const empty = tab === "PENDING" ? "Nothing is waiting for approval" : tab === "REJECTED" ? "No files have been turned down" : "No approved files yet";

  return (
    <div className="space-y-5">
      <PageHeader title="Approvals" subtitle="Files companies upload wait here. Screens only show a file after you approve it." />
      <UnderlineTabs value={tab} onChange={go} options={[{ value: "PENDING", label: "Waiting", count: waiting.data?.meta?.total }, { value: "REJECTED", label: "Not approved" }, { value: "APPROVED", label: "Approved" }]} />
      <div className="flex flex-wrap items-center gap-2">
        <SearchInput placeholder="Search file name..." className="w-56" maxLength={120} value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} />
        <FilterSelect label="All Types" options={MEDIA_TYPES.map((t) => ({ value: t, label: mediaTypeLabel(t) }))} value={type} onChange={(v) => { setType(v); setPage(1); }} />
        <span className="text-xs text-slate-400">{media.data?.meta?.total ?? 0} files</span>
      </div>
      <QueryState query={media} skeleton={<CardGridSkeleton count={6} className="xl:grid-cols-3" />} empty={<EmptyState icon={<ShieldCheck className="h-5 w-5" />} title={search || type ? "No files match" : empty} body={tab === "PENDING" && !search && !type ? "New uploads from companies will appear here." : "Try another search or tab."} />}>
        {({ data, meta }) => (
          <>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {data.map((m) => (
                <div key={m.id} className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                  <button type="button" onClick={() => setPreview(m)} className="relative block text-left" aria-label={`Preview ${m.name}`}>
                    <MediaPreview item={m} className="aspect-video" />
                    <Badge tone={typeTone(m.type)} className="absolute left-2 top-2">{mediaTypeLabel(m.type)}</Badge>
                  </button>
                  <div className="flex flex-1 flex-col gap-3 px-4 py-3">
                    <div className="min-w-0">
                      <Link href={`/media/${m.id}?company=${m.company.id}`} className="block truncate text-sm font-semibold text-slate-900 hover:text-blue-600">{m.name}</Link>
                      <div className="mt-0.5 truncate text-xs text-slate-600">{m.company.name}</div>
                      <div className="mt-0.5 text-[11px] text-slate-400">{formatBytes(m.sizeBytes)} · Uploaded {formatDateTime(m.createdAt)}{m.uploadedBy ? ` by ${m.uploadedBy}` : ""}</div>
                    </div>
                    {tab !== "PENDING" && <ApprovalBadge item={m} showApproved className="self-start" />}
                    {m.approval === "REJECTED" && m.rejectionReason && <p className="rounded-md bg-red-50 px-3 py-2 text-[11px] text-red-700">Reason: {m.rejectionReason}</p>}
                    <ReviewActions item={m} size="sm" className="mt-auto" />
                  </div>
                </div>
              ))}
            </div>
            {meta && meta.totalPages > 1 && <Pagination page={meta.page} pages={meta.totalPages} onChange={setPage} summary={`${meta.total} files`} />}
          </>
        )}
      </QueryState>
      <PreviewMediaModal item={preview} onClose={() => setPreview(null)} />
    </div>
  );
}
