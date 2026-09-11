"use client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, SectionLabel } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { BackLink } from "@/components/ui/misc";
import { fmtDuration, media, type Playlist, type PlaylistItem } from "@/lib/data";
import { cn, img } from "@/lib/utils";
import { ChevronLeft, ChevronRight, GripVertical, ListVideo, Play, Plus, Save, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AddMediaModal } from "./playlist-modals";

export function PlaylistEditor({ playlist }: { playlist?: Playlist }) {
  const router = useRouter();
  const [name, setName] = useState(playlist?.name ?? "");
  const [items, setItems] = useState<PlaylistItem[]>(playlist?.items ?? []);
  const [add, setAdd] = useState(false);
  const [cur, setCur] = useState(0);
  const total = items.reduce((a, b) => a + b.duration, 0);
  const editing = !!playlist;
  const addMedia = (ids: string[]) => setItems((it) => [...it, ...ids.map((id) => { const m = media.find((x) => x.id === id)!; return { id: `${id}-${Date.now()}`, name: m.name, type: m.type, duration: m.type === "Video" ? 30 : 10, seed: m.seed }; })]);
  const setDur = (i: number, d: number) => setItems((it) => it.map((x, idx) => (idx === i ? { ...x, duration: d } : x)));
  const remove = (i: number) => setItems((it) => it.filter((_, idx) => idx !== i));
  const preview = items[Math.min(cur, Math.max(items.length - 1, 0))];

  return (
    <div className="space-y-5">
      <BackLink href="/playlists" label="Playlists" current={editing ? "Edit Playlist" : "Create Playlist"} />
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div><h1 className="text-xl font-bold tracking-tight text-slate-900">{editing ? `Edit "${playlist.name}"` : "Create Playlist"}</h1><p className="mt-1 text-sm text-slate-400">{editing ? "Update playlist items, reorder content and adjust durations." : "Build a playlist using content from your media library."}</p></div>
        <div className="flex gap-2"><Button variant="secondary" onClick={() => router.push("/playlists")}>Cancel</Button><Button disabled={!name || !items.length} onClick={() => router.push("/playlists")}><Save className="h-3.5 w-3.5" /> {editing ? "Save Changes" : "Save Playlist"}</Button></div>
      </div>
      <Card className="px-5 py-4"><SectionLabel>Playlist Name <span className="text-red-500">*</span></SectionLabel><Input className="mt-2 bg-slate-50" placeholder="e.g. Weekend Promotion" value={name} onChange={(e) => setName(e.target.value)} /></Card>

      <div className="grid gap-5 xl:grid-cols-[1fr_340px]">
        <Card>
          <CardHeader title="Playlist Items" subtitle={items.length ? `${items.length} item${items.length > 1 ? "s" : ""} · Total ${fmtDuration(total)}` : undefined} action={<Button size="sm" onClick={() => setAdd(true)}><Plus className="h-3.5 w-3.5" /> Add Media</Button>} />
          {items.length === 0 ? (
            <div className="flex flex-col items-center px-6 py-14 text-center"><span className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100 text-slate-400"><ListVideo className="h-5 w-5" /></span><div className="mt-4 text-sm font-semibold text-slate-900">Your playlist is empty</div><p className="mt-1 max-w-xs text-xs text-slate-400">Add media from your library to start building your playlist.</p><Button className="mt-4" onClick={() => setAdd(true)}><Plus className="h-3.5 w-3.5" /> Add Media</Button></div>
          ) : (
            <div className="p-4">
              <div className="grid grid-cols-[24px_1fr_80px_90px_32px] items-center gap-3 px-2 pb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400"><span>#</span><span>Media</span><span /><span className="text-right">Duration</span><span /></div>
              <ul className="space-y-1.5">
                {items.map((it, i) => (
                  <li key={it.id} className={cn("grid grid-cols-[24px_1fr_80px_90px_32px] items-center gap-3 rounded-lg border px-2 py-2", i === cur ? "border-blue-200 bg-blue-50/30" : "border-slate-100")} onClick={() => setCur(i)}>
                    <span className="flex items-center gap-1 text-xs text-slate-400"><GripVertical className="h-3.5 w-3.5 text-slate-300" />{i + 1}</span>
                    <span className="flex items-center gap-3"><img src={img(it.seed, 96, 64)} alt="" className="h-8 w-12 rounded object-cover" /><span><span className="block text-xs font-semibold text-slate-900">{it.name}</span><Badge tone={it.type === "Image" ? "purple" : "blue"} className="mt-0.5">{it.type.toUpperCase()}</Badge></span></span>
                    <span className="text-[11px] text-slate-400">{it.type}</span>
                    <span className="flex items-center justify-end gap-1"><input type="number" value={it.duration} onChange={(e) => setDur(i, Number(e.target.value))} className="h-7 w-12 rounded border border-slate-200 text-center text-xs" /><span className="text-[10px] text-slate-400">s</span></span>
                    <button onClick={(e) => { e.stopPropagation(); remove(i); }} className="flex h-6 w-6 items-center justify-center rounded border border-slate-200 text-slate-400 hover:text-red-500"><X className="h-3 w-3" /></button>
                  </li>
                ))}
              </ul>
              <div className="mt-3 flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-xs"><span className="font-semibold text-slate-700">{items.length} Item{items.length > 1 ? "s" : ""}</span><span className="text-slate-500">Total Duration: <span className="font-semibold text-slate-800">{fmtDuration(total)}</span></span></div>
              <button onClick={() => setAdd(true)} className="mt-3 flex h-9 w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-slate-300 text-xs font-medium text-slate-500 hover:border-blue-300 hover:text-blue-600"><Plus className="h-3.5 w-3.5" /> Add More Media</button>
            </div>
          )}
        </Card>

        <Card className="self-start">
          <CardHeader title="Playlist Preview" action={items.length ? <span className="text-[11px] text-slate-400">{items.length} items · {fmtDuration(total)}</span> : undefined} />
          <div className="p-4">
            <div className="relative overflow-hidden rounded-lg bg-slate-900">
              {preview ? <><img src={img(preview.seed, 640, 360)} alt="" className="aspect-video w-full object-cover" /><div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-3 pb-2.5 pt-8 text-white"><div className="text-[9px] text-white/60">Item {cur + 1} of {items.length}</div><div className="text-xs font-semibold">{preview.name}</div><div className="text-[9px] text-white/60">{preview.duration}s</div></div><span className="absolute bottom-2 right-3 text-[9px] text-white/60">0s / {preview.duration}s</span></> : <div className="flex aspect-video flex-col items-center justify-center text-slate-500"><ListVideo className="h-6 w-6" /><span className="mt-2 text-[11px]">Add items to preview</span></div>}
            </div>
            <div className="mt-3 flex items-center justify-center gap-2"><button disabled={!items.length || cur === 0} onClick={() => setCur((c) => c - 1)} className="flex h-7 w-7 items-center justify-center rounded border border-slate-200 text-slate-400 disabled:opacity-30"><ChevronLeft className="h-3.5 w-3.5" /></button><button className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-600 text-white"><Play className="h-3.5 w-3.5 fill-current" /></button><button disabled={!items.length || cur >= items.length - 1} onClick={() => setCur((c) => c + 1)} className="flex h-7 w-7 items-center justify-center rounded border border-slate-200 text-slate-400 disabled:opacity-30"><ChevronRight className="h-3.5 w-3.5" /></button></div>
            {items.length > 0 && <div className="mt-3 flex gap-1.5 overflow-x-auto">{items.map((it, i) => <button key={it.id} onClick={() => setCur(i)} className={cn("h-7 w-11 shrink-0 overflow-hidden rounded border-2", i === cur ? "border-blue-600" : "border-transparent")}><img src={img(it.seed, 96, 64)} alt="" className="h-full w-full object-cover" /></button>)}</div>}
          </div>
        </Card>
      </div>
      <AddMediaModal open={add} onClose={() => setAdd(false)} onAdd={addMedia} />
    </div>
  );
}
