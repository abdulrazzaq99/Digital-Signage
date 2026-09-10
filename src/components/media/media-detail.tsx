"use client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, SectionLabel } from "@/components/ui/card";
import { BackLink } from "@/components/ui/misc";
import type { MediaItem } from "@/lib/data";
import { img } from "@/lib/utils";
import { FileText, Pencil, Play, Trash2 } from "lucide-react";
import { useState } from "react";
import { PreviewMediaModal, RemoveMediaModal, RenameModal } from "./media-modals";

export function MediaDetail({ item }: { item: MediaItem }) {
  const [rename, setRename] = useState(false);
  const [del, setDel] = useState(false);
  const [preview, setPreview] = useState(false);
  return (
    <div className="space-y-5">
      <BackLink href="/media" label="Media Library" current={item.name} />
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div><h1 className="text-xl font-bold tracking-tight text-slate-900">{item.name}</h1><p className="mt-1 text-xs text-slate-400">Uploaded {item.uploaded} · {item.company}</p></div>
        <div className="flex gap-2"><Button variant="secondary" onClick={() => setRename(true)}><Pencil className="h-3.5 w-3.5" /> Rename</Button><Button variant="danger-outline" onClick={() => setDel(true)}><Trash2 className="h-3.5 w-3.5" /> Delete</Button></div>
      </div>
      <div className="grid gap-5 xl:grid-cols-[1fr_320px]">
        <button onClick={() => setPreview(true)} className="relative overflow-hidden rounded-xl bg-slate-900 text-left">
          {item.type === "PDF" ? <div className="flex aspect-video items-center justify-center text-slate-400"><FileText className="h-16 w-16" /></div> : <img src={img(item.seed, 1200, 675)} alt="" className="aspect-video w-full object-cover" />}
          {item.type === "Video" && <span className="absolute inset-0 m-auto flex h-12 w-12 items-center justify-center rounded-full bg-black/50 text-white"><Play className="h-5 w-5 fill-current" /></span>}
        </button>
        <div className="space-y-5">
          <Card className="px-5 py-4">
            <SectionLabel>File Details</SectionLabel>
            <dl className="mt-3 space-y-2.5 text-xs">
              {[["File Name", item.name], ["Media Type", <Badge key="t" tone="blue">{item.type.toUpperCase()}</Badge>], ["File Size", item.size], [item.type === "Video" ? "Duration" : item.type === "PDF" ? "Pages" : "Resolution", item.type === "Video" ? item.duration : item.meta], ["Upload Date", item.uploaded], ["Status", <Badge key="s" tone="green">{item.status}</Badge>]].map(([k, v]) => <div key={String(k)} className="flex items-center justify-between"><dt className="text-slate-400">{k}</dt><dd className="font-semibold text-slate-800">{v}</dd></div>)}
            </dl>
          </Card>
          <Card className="px-5 py-4">
            <SectionLabel>Used By</SectionLabel>
            {item.usedBy.length === 0 ? <p className="mt-3 text-xs text-slate-400">Not used in any playlist or layout.</p> : (
              <ul className="mt-3 space-y-2">{item.usedBy.map((u) => <li key={u.name} className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/60 px-3 py-2 text-xs"><span className="font-semibold text-slate-800">{u.name}</span><Badge tone="blue">{u.kind}</Badge></li>)}</ul>
            )}
          </Card>
        </div>
      </div>
      <RenameModal open={rename} onClose={() => setRename(false)} name={item.name} />
      <RemoveMediaModal item={del ? item : null} onClose={() => setDel(false)} />
      <PreviewMediaModal item={preview ? item : null} onClose={() => setPreview(false)} />
    </div>
  );
}
