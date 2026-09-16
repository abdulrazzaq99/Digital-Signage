"use client";
import { useCompanyScope } from "@/components/admin/company-scope";
import { MediaPreview, statusTone, typeTone } from "@/components/portal/media-drawer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, SectionLabel } from "@/components/ui/card";
import { BackLink } from "@/components/ui/misc";
import { QueryState, Skeleton } from "@/components/ui/query-state";
import { useToast } from "@/components/ui/toast";
import { mediaTypeLabel, useDownloadUrl, useMediaItem, useRetryMedia, useUpdateMedia } from "@/lib/api/hooks/media";
import type { Media } from "@/lib/api/types";
import { fmtClock, formatBytes, formatDateTime, label } from "@/lib/format";
import { Download, Pencil, RefreshCw, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { PreviewMediaModal, RemoveMediaModal, RenameModal } from "./media-modals";

function Detail({ item, companyId }: { item: Media; companyId: string }) {
  const router = useRouter();
  const toast = useToast();
  const scope = useCompanyScope();
  const update = useUpdateMedia(companyId);
  const retry = useRetryMedia(companyId);
  const download = useDownloadUrl(companyId);
  const [rename, setRename] = useState(false);
  const [del, setDel] = useState(false);
  const [preview, setPreview] = useState(false);
  const specific: [string, string] = item.type === "VIDEO" ? ["Duration", item.durationSec ? fmtClock(item.durationSec) : "—"] : item.type === "PDF" ? ["Pages", item.pages ? String(item.pages) : "—"] : ["Resolution", item.width && item.height ? `${item.width}×${item.height}` : "—"];

  return (
    <div className="space-y-5">
      <BackLink href={scope.withCompany("/media")} label="Media Library" current={item.name} />
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div><h1 className="text-xl font-bold tracking-tight text-slate-900">{item.name}</h1><p className="mt-1 text-xs text-slate-400">Uploaded {formatDateTime(item.createdAt)}{item.uploadedBy ? ` by ${item.uploadedBy}` : ""} · {scope.companyName}</p></div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={() => download.mutate(item.id, { onSuccess: ({ url }) => window.open(url, "_blank", "noopener"), onError: (e) => toast.error(e) })} disabled={download.isPending || item.status !== "READY"}><Download className="h-3.5 w-3.5" /> Download</Button>
          {item.status === "FAILED" && <Button variant="secondary" onClick={() => retry.mutate(item.id, { onSuccess: () => toast.success("Processing restarted"), onError: (e) => toast.error(e) })} disabled={retry.isPending}><RefreshCw className="h-3.5 w-3.5" /> Retry</Button>}
          <Button variant="secondary" onClick={() => setRename(true)}><Pencil className="h-3.5 w-3.5" /> Rename</Button>
          <Button variant="danger-outline" onClick={() => setDel(true)}><Trash2 className="h-3.5 w-3.5" /> Delete</Button>
        </div>
      </div>
      <div className="grid gap-5 xl:grid-cols-[1fr_320px]">
        <button onClick={() => setPreview(true)} className="relative overflow-hidden rounded-xl bg-slate-900 text-left"><MediaPreview item={item} className="aspect-video" /></button>
        <div className="space-y-5">
          <Card className="px-5 py-4">
            <SectionLabel>File Details</SectionLabel>
            <dl className="mt-3 space-y-2.5 text-xs">
              {([["File Name", item.name], ["Media Type", <Badge key="t" tone={typeTone(item.type)}>{mediaTypeLabel(item.type)}</Badge>], ["MIME", item.mimeType], ["File Size", formatBytes(item.sizeBytes)], specific, ["Upload Date", formatDateTime(item.createdAt)], ["Status", <Badge key="s" tone={statusTone(item.status)}>{label(item.status)}</Badge>]] as [string, React.ReactNode][]).map(([k, v]) => <div key={k} className="flex items-center justify-between gap-3"><dt className="text-slate-400">{k}</dt><dd className="truncate font-semibold text-slate-800">{v}</dd></div>)}
            </dl>
            {item.failureReason && <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-[11px] text-red-700">{item.failureReason}</p>}
            {item.tags.length > 0 && <div className="mt-3 flex flex-wrap gap-1.5">{item.tags.map((t) => <Badge key={t} tone="slate">{t}</Badge>)}</div>}
          </Card>
          <Card className="px-5 py-4">
            <SectionLabel>Used By</SectionLabel>
            {item.usedIn.length === 0 ? <p className="mt-3 text-xs text-slate-400">Not used in any playlist.</p> : (
              <ul className="mt-3 space-y-2">{item.usedIn.map((u) => <li key={u.id} className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/60 px-3 py-2 text-xs"><span className="font-semibold text-slate-800">{u.name}</span><Badge tone="blue">Playlist</Badge></li>)}</ul>
            )}
          </Card>
        </div>
      </div>
      {rename && <RenameModal open onClose={() => setRename(false)} name={item.name} onSave={(name) => update.mutateAsync({ id: item.id, name }).then(() => toast.success("Renamed"))} />}
      <RemoveMediaModal item={del ? item : null} companyId={companyId} onClose={() => setDel(false)} onDeleted={() => router.replace(scope.withCompany("/media"))} />
      <PreviewMediaModal item={preview ? item : null} onClose={() => setPreview(false)} />
    </div>
  );
}

export function MediaDetail({ id }: { id: string }) {
  const scope = useCompanyScope();
  const item = useMediaItem(id, { companyId: scope.companyId, enabled: !!scope.companyId });
  return <QueryState query={item} skeleton={<div className="space-y-5"><Skeleton className="h-12" /><Skeleton className="h-72" /></div>}>{(m) => <Detail item={m} companyId={scope.companyId} />}</QueryState>;
}
