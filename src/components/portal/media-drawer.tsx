"use client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Drawer } from "@/components/ui/misc";
import type { PortalMedia } from "@/lib/portal-data";
import { img } from "@/lib/utils";
import { AlertTriangle, ArrowLeft, Check, FileText, ListVideo, Play, Trash2, X } from "lucide-react";
import { useState } from "react";

export type MediaDrawerView = "detail" | "usedBy" | "delete";

export function typeTone(t: PortalMedia["type"]) { return t === "JPG/PNG" ? "blue" : t === "MP4" ? "purple" : "red"; }
export function statusTone(s: PortalMedia["status"]) { return s === "Ready" ? "green" : s === "Processing" ? "amber" : "red"; }

export function MediaPreview({ item, className }: { item: PortalMedia; className?: string }) {
  if (item.type === "PDF") return <div className={`flex flex-col items-center justify-center gap-1 bg-orange-50 text-orange-500 ${className}`}><FileText className="h-8 w-8" /><span className="text-[9px] font-medium">{item.pages}p</span></div>;
  return <div className={`relative bg-slate-900 ${className}`}><img src={img(item.seed, 640, 360)} alt="" className="h-full w-full object-cover" />{item.type === "MP4" && <span className="absolute inset-0 m-auto flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white"><Play className="h-4 w-4 fill-current" /></span>}</div>;
}

export function MediaDrawer({ item, initialView, onClose }: { item: PortalMedia | null; initialView: MediaDrawerView; onClose: () => void }) {
  return (
    <Drawer open={!!item} onClose={onClose}>
      {item && <MediaDrawerBody key={item.id + initialView} item={item} initialView={initialView} onClose={onClose} />}
    </Drawer>
  );
}

function MediaDrawerBody({ item, initialView, onClose }: { item: PortalMedia; initialView: MediaDrawerView; onClose: () => void }) {
  const [view, setView] = useState<MediaDrawerView>(initialView);
  const meta = item.type === "MP4" ? ["Duration", item.duration ?? "—"] : item.type === "PDF" ? ["Pages", `${item.pages} pages`] : ["Dimensions", item.dimensions ?? "—"];
  return (
    <>
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">{view !== "detail" && <button onClick={() => setView("detail")} className="text-slate-400 hover:text-slate-700"><ArrowLeft className="h-4 w-4" /></button>}{view === "detail" ? "Media Detail" : view === "usedBy" ? "Used By" : "Delete Media"}</div>
        <button onClick={onClose} className="flex h-6 w-6 items-center justify-center rounded-md border border-slate-200 text-slate-400 hover:bg-slate-50"><X className="h-3.5 w-3.5" /></button>
      </div>
      <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
        {view === "detail" && (
          <>
            <MediaPreview item={item} className="aspect-video overflow-hidden rounded-xl" />
            <dl className="divide-y divide-slate-100 text-xs">
              {[["File Name", item.name], ["Type", <Badge key="t" tone={typeTone(item.type)}>{item.type}</Badge>], ["Status", <Badge key="s" tone={statusTone(item.status)} dot>{item.status}</Badge>], ["File Size", item.size], meta, ["Uploaded", item.uploaded], ["Uploaded By", item.uploadedBy]].map(([k, v]) => <div key={String(k)} className="flex items-center justify-between gap-4 py-2.5"><dt className="text-slate-400">{k}</dt><dd className="truncate text-right font-semibold text-slate-800">{v}</dd></div>)}
            </dl>
            {item.tags.length > 0 && <div className="flex flex-wrap gap-1.5">{item.tags.map((t) => <Badge key={t} tone="slate">{t}</Badge>)}</div>}
            <Button variant="secondary" className="w-full" onClick={() => setView("usedBy")}><Check className="h-3.5 w-3.5" /> View Used By <Badge tone="blue">{item.usedIn.length}</Badge></Button>
            <Button variant="danger-outline" className="w-full" onClick={() => setView("delete")}><Trash2 className="h-3.5 w-3.5" /> Delete</Button>
          </>
        )}
        {view === "usedBy" && (
          <>
            <p className="text-xs text-slate-600"><span className="font-semibold text-slate-900">{item.name}</span> is currently referenced in:</p>
            {item.usedIn.length === 0 ? <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-6 text-center text-xs text-slate-400">Not used in any playlist.</div> : (
              <ul className="space-y-2">{item.usedIn.map((p) => <li key={p} className="flex items-center gap-3 rounded-lg border border-slate-200 px-3 py-2.5"><span className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-50 text-blue-600"><ListVideo className="h-4 w-4" /></span><span className="flex-1"><span className="block text-xs font-semibold text-slate-900">{p}</span><span className="block text-[10px] text-slate-400">Playlist</span></span><Badge tone="green">ACTIVE</Badge></li>)}</ul>
            )}
          </>
        )}
        {view === "delete" && (
          <>
            <MediaPreview item={item} className="aspect-video overflow-hidden rounded-xl" />
            {item.usedIn.length > 0 && <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800"><div className="flex items-center gap-1.5 font-semibold"><AlertTriangle className="h-3.5 w-3.5" /> This file is currently in use</div><p className="mt-1 leading-5">Deleting this file will remove it from <span className="font-semibold">{item.usedIn.length} playlist{item.usedIn.length > 1 ? "s" : ""}</span>: {item.usedIn.join(", ")}. Affected screens may display a blank slot until the playlist is updated.</p></div>}
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs leading-5 text-red-700">Are you sure you want to permanently delete <span className="font-semibold">{item.name}</span>? This action cannot be undone.</div>
            <div className="flex gap-2"><Button variant="danger" className="flex-1" onClick={onClose}><Trash2 className="h-3.5 w-3.5" /> Delete Permanently</Button><Button variant="secondary" onClick={() => setView("detail")}>Cancel</Button></div>
          </>
        )}
      </div>
    </>
  );
}
