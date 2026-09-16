"use client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { PillTabs, SearchInput } from "@/components/ui/input";
import { QueryState, Skeleton, TableSkeleton } from "@/components/ui/query-state";
import { useToast } from "@/components/ui/toast";
import { useMedia } from "@/lib/api/hooks/media";
import { usePlaylist, useUpdatePlaylist } from "@/lib/api/hooks/playlists";
import type { Media, Playlist } from "@/lib/api/types";
import { fmtClock, label } from "@/lib/format";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Eye, FileText, GripVertical, Pencil, Play, Plus, Save, Send, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { BackLinkButton } from "./portal-stepper";

/** Editor row: the asset plus its slot duration. `key` is local so the same asset can appear twice. */
interface Row { key: string; assetId: string; name: string; type: Media["type"]; thumbnailUrl: string | null; durationSec: number }

const typeShort = (t: Media["type"]) => (t === "IMAGE" ? "IMG" : t === "VIDEO" ? "MP4" : "PDF");
const typeTone = (t: Media["type"]) => (t === "IMAGE" ? "blue" : t === "VIDEO" ? "purple" : "red");
const stripExt = (n: string) => n.replace(/\.[a-z0-9]+$/i, "");

function Thumb({ url, type, className }: { url: string | null; type: Media["type"]; className: string }) {
  if (type === "PDF" && !url) return <span className={cn("flex items-center justify-center rounded bg-orange-50 text-orange-500", className)}><FileText className="h-3.5 w-3.5" /></span>;
  return <span className={cn("relative overflow-hidden rounded bg-slate-900", className)}>{url ? <img src={url} alt="" className="h-full w-full object-cover" /> : <span className="flex h-full items-center justify-center text-[8px] uppercase text-slate-500">{typeShort(type)}</span>}{type === "VIDEO" && <Play className="absolute inset-0 m-auto h-3 w-3 fill-white text-white" />}</span>;
}

function Editor({ playlist, companyId, basePath, query }: { playlist: Playlist; companyId?: string | null; basePath: string; query: string }) {
  const router = useRouter();
  const toast = useToast();
  const update = useUpdatePlaylist(playlist.id, companyId);
  const [name, setName] = useState(playlist.name);
  const [editingName, setEditingName] = useState(false);
  const [items, setItems] = useState<Row[]>((playlist.items ?? []).map((it) => ({ key: it.id, assetId: it.asset.id, name: it.asset.name, type: it.asset.type as Media["type"], thumbnailUrl: it.asset.thumbnailUrl, durationSec: it.durationSec })));
  const [filter, setFilter] = useState<"ALL" | "IMG" | "VID" | "PDF">("ALL");
  const [q, setQ] = useState("");
  const [cur, setCur] = useState(0);
  const [dirty, setDirty] = useState(false);
  const library = useMedia({ status: "READY", pageSize: 100, search: q || undefined, type: filter === "ALL" ? undefined : filter === "IMG" ? "IMAGE" : filter === "VID" ? "VIDEO" : "PDF" }, { companyId });
  const total = items.reduce((a, b) => a + b.durationSec, 0);
  const mutate = (fn: (rows: Row[]) => Row[]) => { setItems(fn); setDirty(true); };
  const add = (m: Media) => mutate((it) => [...it, { key: `${m.id}-${Date.now()}`, assetId: m.id, name: m.name, type: m.type, thumbnailUrl: m.thumbnailUrl, durationSec: m.type === "VIDEO" && m.durationSec ? m.durationSec : 10 }]);
  const move = (i: number, d: -1 | 1) => mutate((it) => { const n = [...it]; const j = i + d; if (j < 0 || j >= n.length) return it; [n[i], n[j]] = [n[j], n[i]]; return n; });
  const preview = items[Math.min(cur, Math.max(items.length - 1, 0))];

  const save = async (then?: string) => {
    try {
      await update.mutateAsync({ name: name.trim(), items: items.map(({ assetId, durationSec }) => ({ assetId, durationSec: Math.max(1, Math.round(durationSec) || 1) })) });
      setDirty(false);
      toast.success("Playlist saved");
      if (then) router.push(then);
    } catch (e) { toast.error(e, "Couldn't save playlist"); }
  };
  const qs = query ? `?${query}` : "";
  const go = (sub: string) => (dirty ? save(`${basePath}/${playlist.id}/${sub}${qs}`) : router.push(`${basePath}/${playlist.id}/${sub}${qs}`));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <BackLinkButton label="Playlists" onClick={() => router.push(`${basePath}${qs}`)} />
          {editingName ? <input autoFocus value={name} onChange={(e) => { setName(e.target.value); setDirty(true); }} onBlur={() => setEditingName(false)} onKeyDown={(e) => e.key === "Enter" && setEditingName(false)} className="h-7 rounded border border-slate-200 px-2 text-sm font-semibold text-slate-900 outline-none focus:border-blue-500" /> : <button onClick={() => setEditingName(true)} className="flex items-center gap-1.5 text-sm font-semibold text-slate-900 hover:text-blue-600">{name}<Pencil className="h-3 w-3 text-slate-400" /></button>}
          {dirty && <Badge tone="amber">Unsaved</Badge>}
        </div>
        <div className="flex flex-wrap gap-2"><Button variant="secondary" size="sm" onClick={() => save()} disabled={update.isPending || !dirty}><Save className="h-3.5 w-3.5" /> {update.isPending ? "Saving…" : "Save"}</Button><Button variant="secondary" size="sm" onClick={() => go("preview")} disabled={items.length === 0}><Eye className="h-3.5 w-3.5" /> Preview</Button><Button size="sm" onClick={() => go("publish")} disabled={items.length === 0}><Send className="h-3.5 w-3.5" /> Publish</Button></div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[240px_1fr_260px]">
        <Card className="self-start">
          <div className="border-b border-slate-100 px-4 py-3 text-xs font-semibold text-slate-900">Media Library</div>
          <div className="space-y-2 p-3"><SearchInput placeholder="Search..." value={q} onChange={(e) => setQ(e.target.value)} /><PillTabs options={(["ALL", "IMG", "VID", "PDF"] as const).map((v) => ({ value: v, label: v }))} value={filter} onChange={setFilter} /></div>
          <QueryState query={library} skeleton={<div className="p-3"><TableSkeleton rows={4} /></div>} empty={<div className="px-4 py-8 text-center text-xs text-slate-400">No ready media{q || filter !== "ALL" ? " matches" : " yet — upload some first"}.</div>}>
            {({ data }) => (
              <ul className="max-h-[420px] divide-y divide-slate-100 overflow-y-auto">
                {data.map((m) => (
                  <li key={m.id} className="flex items-center gap-2 px-3 py-2">
                    <Thumb url={m.thumbnailUrl} type={m.type} className="h-7 w-10 shrink-0" />
                    <span className="min-w-0 flex-1"><span className="block truncate text-[11px] font-medium text-slate-800">{stripExt(m.name)}</span><span className="flex items-center gap-1"><Badge tone={typeTone(m.type)}>{typeShort(m.type)}</Badge>{m.durationSec && <span className="text-[9px] text-slate-400">{fmtClock(m.durationSec)}</span>}</span></span>
                    <button onClick={() => add(m)} className="flex h-6 w-6 items-center justify-center rounded border border-slate-200 text-slate-500 hover:border-blue-300 hover:text-blue-600" aria-label={`Add ${m.name}`}><Plus className="h-3 w-3" /></button>
                  </li>
                ))}
              </ul>
            )}
          </QueryState>
        </Card>

        <Card className="self-start">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3"><span className="text-xs font-semibold text-slate-900">Timeline</span><span className="text-[11px] text-slate-400">{items.length} item{items.length !== 1 ? "s" : ""} · {fmtClock(total)}</span></div>
          {items.length === 0 ? <div className="px-4 py-14 text-center text-xs text-slate-400">Add media from the library to build your timeline.</div> : (
            <ul className="space-y-2 p-3">
              {items.map((it, i) => (
                <li key={it.key} onClick={() => setCur(i)} className={cn("flex items-center gap-2 rounded-lg border px-2 py-2", i === cur ? "border-blue-200 bg-blue-50/30" : "border-slate-200")}>
                  <span className="flex h-5 w-5 items-center justify-center rounded border border-slate-200 text-[10px] font-semibold text-slate-500">{i + 1}</span>
                  <span className="flex flex-col text-slate-300"><button onClick={(e) => { e.stopPropagation(); move(i, -1); }} disabled={i === 0} className="disabled:opacity-30" aria-label="Move up"><ChevronUp className="h-3 w-3" /></button><button onClick={(e) => { e.stopPropagation(); move(i, 1); }} disabled={i === items.length - 1} className="disabled:opacity-30" aria-label="Move down"><ChevronDown className="h-3 w-3" /></button></span>
                  <GripVertical className="hidden h-3.5 w-3.5 text-slate-300 sm:block" />
                  <Thumb url={it.thumbnailUrl} type={it.type} className="h-8 w-12 shrink-0" />
                  <span className="min-w-0 flex-1"><span className="block truncate text-xs font-semibold text-slate-900">{stripExt(it.name)}</span><Badge tone={typeTone(it.type)}>{typeShort(it.type)}</Badge></span>
                  <span className="flex items-center gap-1"><input type="number" min={1} max={3600} value={it.durationSec} onClick={(e) => e.stopPropagation()} onChange={(e) => mutate((arr) => arr.map((x, idx) => (idx === i ? { ...x, durationSec: Number(e.target.value) } : x)))} className="h-7 w-14 rounded border border-slate-200 text-center text-xs" aria-label="Duration in seconds" /><span className="text-[10px] text-slate-400">sec</span></span>
                  <button onClick={(e) => { e.stopPropagation(); mutate((arr) => arr.filter((_, idx) => idx !== i)); }} className="text-slate-400 hover:text-red-500" aria-label="Remove"><X className="h-3.5 w-3.5" /></button>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="self-start">
          <div className="border-b border-slate-100 px-4 py-3 text-xs font-semibold text-slate-900">Preview</div>
          <div className="p-3">
            <div className="relative aspect-video overflow-hidden rounded-lg bg-slate-900">{preview && <Thumb url={preview.thumbnailUrl} type={preview.type} className="h-full w-full rounded-none" />}</div>
            <div className="mt-2 flex items-center justify-center gap-2 text-[11px] text-slate-500"><button onClick={() => setCur((c) => Math.max(0, c - 1))} className="flex h-6 w-6 items-center justify-center rounded border border-slate-200" aria-label="Previous"><ChevronLeft className="h-3 w-3" /></button>{items.length ? `${Math.min(cur, items.length - 1) + 1} / ${items.length}` : "0 / 0"}<button onClick={() => setCur((c) => Math.min(items.length - 1, c + 1))} className="flex h-6 w-6 items-center justify-center rounded border border-slate-200" aria-label="Next"><ChevronRight className="h-3 w-3" /></button></div>
            <dl className="mt-3 space-y-1.5 text-xs"><div className="flex justify-between"><dt className="text-slate-400">Items</dt><dd className="font-semibold text-slate-800">{items.length}</dd></div><div className="flex justify-between"><dt className="text-slate-400">Duration</dt><dd className="font-semibold text-slate-800">{fmtClock(total)}</dd></div><div className="flex justify-between"><dt className="text-slate-400">Status</dt><dd><Badge tone={playlist.status === "PUBLISHED" ? "green" : "slate"} dot>{label(playlist.status)}</Badge></dd></div><div className="flex justify-between"><dt className="text-slate-400">Version</dt><dd className="font-semibold text-slate-800">v{playlist.version}</dd></div></dl>
            <Button className="mt-3 w-full" size="sm" onClick={() => go("publish")} disabled={items.length === 0}><Send className="h-3.5 w-3.5" /> Publish</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

export function PlaylistEditor({ id, companyId, basePath = "/portal/playlists", query = "" }: { id: string; companyId?: string | null; basePath?: string; query?: string }) {
  const playlist = usePlaylist(id, { companyId });
  return <QueryState query={playlist} skeleton={<div className="grid gap-4 xl:grid-cols-[240px_1fr_260px]"><Skeleton className="h-96" /><Skeleton className="h-96" /><Skeleton className="h-96" /></div>}>{(p) => <Editor key={`${p.id}-${p.version}`} playlist={p} companyId={companyId} basePath={basePath} query={query} />}</QueryState>;
}
