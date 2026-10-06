"use client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Drawer } from "@/components/ui/misc";
import { useToast } from "@/components/ui/toast";
import { mediaTypeLabel, useDeleteMedia, useDownloadUrl, useMediaItem, useRetryMedia } from "@/lib/api/hooks/media";
import type { Media } from "@/lib/api/types";
import { errorMessage, fmtClock, formatBytes, formatDateTime, label } from "@/lib/format";
import { AlertTriangle, ArrowLeft, Check, Download, FileText, ListVideo, Play, RefreshCw, Trash2, X } from "lucide-react";
import { useState } from "react";

export type MediaDrawerView = "detail" | "usedBy" | "delete";

export function typeTone(t: Media["type"]) { return t === "IMAGE" ? "blue" : t === "VIDEO" ? "purple" : "red"; }
export function statusTone(s: Media["status"]) { return s === "READY" ? "green" : s === "FAILED" ? "red" : "amber"; }

export function MediaPreview({ item, className }: { item: Media; className?: string }) {
  if (item.type === "PDF" && !item.thumbnailUrl) return <div className={`flex flex-col items-center justify-center gap-1 bg-orange-50 text-orange-500 ${className}`}><FileText className="h-8 w-8" /><span className="text-[9px] font-medium">{item.pages ? `${item.pages}p` : "PDF"}</span></div>;
  return (
    <div className={`relative bg-slate-900 ${className}`}>
      {item.thumbnailUrl ? <img src={item.thumbnailUrl} alt="" className="h-full w-full object-cover" /> : <div className="flex h-full w-full items-center justify-center text-[10px] uppercase tracking-wider text-slate-500">{item.status === "READY" ? mediaTypeLabel(item.type) : label(item.status)}</div>}
      {item.type === "VIDEO" && <span className="absolute inset-0 m-auto flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white"><Play className="h-4 w-4 fill-current" /></span>}
    </div>
  );
}

export function MediaDrawer({ id, initialView, companyId, onClose }: { id: string | null; initialView: MediaDrawerView; companyId?: string | null; onClose: () => void }) {
  return (
    <Drawer open={!!id} onClose={onClose}>
      {id && <MediaDrawerBody key={id + initialView} id={id} initialView={initialView} companyId={companyId} onClose={onClose} />}
    </Drawer>
  );
}

function MediaDrawerBody({ id, initialView, companyId, onClose }: { id: string; initialView: MediaDrawerView; companyId?: string | null; onClose: () => void }) {
  const toast = useToast();
  const item = useMediaItem(id, { companyId });
  const remove = useDeleteMedia(companyId);
  const retry = useRetryMedia(companyId);
  const download = useDownloadUrl(companyId);
  const [view, setView] = useState<MediaDrawerView>(initialView);
  const [error, setError] = useState("");

  const doDelete = (force: boolean) => !remove.isPending && remove.mutate({ id, force }, { onSuccess: () => { toast.success("Media deleted"); onClose(); }, onError: (e) => setError(errorMessage(e)) });
  const doDownload = () => download.mutate(id, { onSuccess: ({ url }) => window.open(url, "_blank", "noopener"), onError: (e) => toast.error(e) });
  const doRetry = () => retry.mutate(id, { onSuccess: () => toast.success("Processing restarted"), onError: (e) => toast.error(e) });

  return (
    <>
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">{view !== "detail" && <button onClick={() => setView("detail")} className="text-slate-400 hover:text-slate-700" aria-label="Back"><ArrowLeft className="h-4 w-4" /></button>}{view === "detail" ? "Media Detail" : view === "usedBy" ? "Used By" : "Delete Media"}</div>
        <button onClick={onClose} className="flex h-6 w-6 items-center justify-center rounded-md border border-slate-200 text-slate-400 hover:bg-slate-50" aria-label="Close"><X className="h-3.5 w-3.5" /></button>
      </div>
      <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
        {item.isPending && <div className="h-40 animate-pulse rounded-xl bg-slate-100" />}
        {item.isError && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">{errorMessage(item.error)} <button type="button" onClick={() => item.refetch()} className="ml-1 font-semibold text-blue-600 hover:underline">Retry</button></div>}
        {item.data && (() => {
          const m = item.data;
          const usedIn = m.usedIn ?? [];
          const tags = m.tags ?? [];
          const meta: [string, string] = m.type === "VIDEO" ? ["Duration", m.durationSec ? fmtClock(m.durationSec) : "—"] : m.type === "PDF" ? ["Pages", m.pages ? `${m.pages} pages` : "—"] : ["Dimensions", m.width && m.height ? `${m.width}×${m.height}` : "—"];
          return (
            <>
              {view === "detail" && (
                <>
                  <MediaPreview item={m} className="aspect-video overflow-hidden rounded-xl" />
                  {m.status === "FAILED" && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700"><div className="font-semibold">Processing failed</div><div className="mt-0.5">{m.failureReason ?? "Unknown error"}</div><Button size="sm" variant="secondary" className="mt-2" onClick={doRetry} disabled={retry.isPending}><RefreshCw className="h-3.5 w-3.5" /> Retry</Button></div>}
                  <dl className="divide-y divide-slate-100 text-xs">
                    {([["File Name", m.name], ["Type", <Badge key="t" tone={typeTone(m.type)}>{mediaTypeLabel(m.type)}</Badge>], ["Status", <Badge key="s" tone={statusTone(m.status)} dot>{label(m.status)}</Badge>], ["File Size", formatBytes(m.sizeBytes)], meta, ["Uploaded", formatDateTime(m.createdAt)], ["Uploaded By", m.uploadedBy ?? "—"]] as [string, React.ReactNode][]).map(([k, v]) => <div key={k} className="flex items-center justify-between gap-4 py-2.5"><dt className="text-slate-400">{k}</dt><dd className="truncate text-right font-semibold text-slate-800">{v}</dd></div>)}
                  </dl>
                  {tags.length > 0 && <div className="flex flex-wrap gap-1.5">{tags.map((t) => <Badge key={t} tone="slate">{t}</Badge>)}</div>}
                  <Button variant="secondary" className="w-full" onClick={doDownload} disabled={download.isPending || m.status !== "READY"}><Download className="h-3.5 w-3.5" /> Download original</Button>
                  <Button variant="secondary" className="w-full" onClick={() => setView("usedBy")}><Check className="h-3.5 w-3.5" /> View Used By <Badge tone="blue">{usedIn.length}</Badge></Button>
                  <Button variant="danger-outline" className="w-full" onClick={() => setView("delete")}><Trash2 className="h-3.5 w-3.5" /> Delete</Button>
                </>
              )}
              {view === "usedBy" && (
                <>
                  <p className="text-xs text-slate-600"><span className="font-semibold text-slate-900">{m.name}</span> is currently referenced in:</p>
                  {usedIn.length === 0 ? <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-6 text-center text-xs text-slate-400">Not used in any playlist.</div> : (
                    <ul className="space-y-2">{usedIn.map((p) => <li key={p.id} className="flex items-center gap-3 rounded-lg border border-slate-200 px-3 py-2.5"><span className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-50 text-blue-600"><ListVideo className="h-4 w-4" /></span><span className="flex-1"><span className="block text-xs font-semibold text-slate-900">{p.name}</span><span className="block text-[10px] text-slate-400">Playlist</span></span></li>)}</ul>
                  )}
                </>
              )}
              {view === "delete" && (
                <>
                  <MediaPreview item={m} className="aspect-video overflow-hidden rounded-xl" />
                  {usedIn.length > 0 && <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800"><div className="flex items-center gap-1.5 font-semibold"><AlertTriangle className="h-3.5 w-3.5" /> This file is currently in use</div><p className="mt-1 leading-5">Deleting removes it from <span className="font-semibold">{usedIn.length} playlist{usedIn.length > 1 ? "s" : ""}</span>: {usedIn.map((p) => p.name).join(", ")}. Affected screens may show a shorter loop until the playlist is updated.</p></div>}
                  <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs leading-5 text-red-700">Permanently delete <span className="font-semibold">{m.name}</span>? This action cannot be undone.</div>
                  {error && <div className="text-xs text-red-600">{error}</div>}
                  <div className="flex gap-2"><Button variant="danger" className="flex-1" onClick={() => doDelete(usedIn.length > 0)} disabled={remove.isPending}><Trash2 className="h-3.5 w-3.5" /> {remove.isPending ? "Deleting…" : usedIn.length ? "Delete & remove from playlists" : "Delete Permanently"}</Button><Button variant="secondary" onClick={() => setView("detail")} disabled={remove.isPending}>Cancel</Button></div>
                </>
              )}
            </>
          );
        })()}
      </div>
    </>
  );
}
