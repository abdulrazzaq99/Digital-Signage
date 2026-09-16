"use client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { PillTabs, SearchInput } from "@/components/ui/input";
import { fmtClock, portalMedia, type PortalPlaylist, type PortalPlaylistItem } from "@/lib/portal-data";
import { cn, img } from "@/lib/utils";
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Eye, FileText, GripVertical, Pencil, Play, Plus, Save, Send, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { BackLinkButton } from "./portal-stepper";

const typeOf = (t: string): PortalPlaylistItem["type"] => (t === "MP4" ? "MP4" : t === "PDF" ? "PDF" : "IMG");

export function PlaylistEditor({ playlist }: { playlist: PortalPlaylist }) {
  const router = useRouter();
  const [name, setName] = useState(playlist.name);
  const [editingName, setEditingName] = useState(false);
  const [items, setItems] = useState<PortalPlaylistItem[]>(playlist.items);
  const [filter, setFilter] = useState<"ALL" | "IMG" | "VID" | "PDF">("ALL");
  const [cur, setCur] = useState(0);
  const total = items.reduce((a, b) => a + b.duration, 0);
  const library = portalMedia.filter((m) => m.status === "Ready" && (filter === "ALL" || (filter === "IMG" ? m.type === "JPG/PNG" : filter === "VID" ? m.type === "MP4" : m.type === "PDF")));
  const add = (mid: string) => { const m = portalMedia.find((x) => x.id === mid)!; setItems((it) => [...it, { id: `${mid}-${Date.now()}`, mediaId: mid, name: m.name.replace(/\.[a-z0-9]+$/i, ""), type: typeOf(m.type), duration: m.type === "MP4" ? 45 : 10, seed: m.seed }]); };
  const move = (i: number, d: -1 | 1) => setItems((it) => { const n = [...it]; const j = i + d; if (j < 0 || j >= n.length) return it; [n[i], n[j]] = [n[j], n[i]]; return n; });
  const preview = items[Math.min(cur, Math.max(items.length - 1, 0))];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <BackLinkButton label="Playlists" onClick={() => router.push("/portal/playlists")} />
          {editingName ? <input autoFocus value={name} onChange={(e) => setName(e.target.value)} onBlur={() => setEditingName(false)} onKeyDown={(e) => e.key === "Enter" && setEditingName(false)} className="h-7 rounded border border-slate-200 px-2 text-sm font-semibold text-slate-900 outline-none focus:border-blue-500" /> : <button onClick={() => setEditingName(true)} className="flex items-center gap-1.5 text-sm font-semibold text-slate-900 hover:text-blue-600">{name}<Pencil className="h-3 w-3 text-slate-400" /></button>}
        </div>
        <div className="flex flex-wrap gap-2"><Button variant="secondary" size="sm" onClick={() => router.push("/portal/playlists")}><Save className="h-3.5 w-3.5" /> Save</Button><Button variant="secondary" size="sm" href={`/portal/playlists/${playlist.id}/preview`}><Eye className="h-3.5 w-3.5" /> Preview</Button><Button size="sm" href={`/portal/playlists/${playlist.id}/publish`}><Send className="h-3.5 w-3.5" /> Publish</Button></div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[240px_1fr_260px]">
        <Card className="self-start">
          <div className="border-b border-slate-100 px-4 py-3 text-xs font-semibold text-slate-900">Media Library</div>
          <div className="space-y-2 p-3"><SearchInput placeholder="Search..." /><PillTabs options={(["ALL", "IMG", "VID", "PDF"] as const).map((v) => ({ value: v, label: v }))} value={filter} onChange={setFilter} /></div>
          <ul className="max-h-[420px] divide-y divide-slate-100 overflow-y-auto">
            {library.map((m) => (
              <li key={m.id} className="flex items-center gap-2 px-3 py-2">
                {m.type === "PDF" ? <span className="flex h-7 w-10 items-center justify-center rounded bg-orange-50 text-orange-500"><FileText className="h-3.5 w-3.5" /></span> : <span className="relative h-7 w-10 overflow-hidden rounded bg-slate-900"><img src={img(m.seed, 80, 56)} alt="" className="h-full w-full object-cover" />{m.type === "MP4" && <Play className="absolute inset-0 m-auto h-3 w-3 fill-white text-white" />}</span>}
                <span className="min-w-0 flex-1"><span className="block truncate text-[11px] font-medium text-slate-800">{m.name.replace(/\.[a-z0-9]+$/i, "")}</span><span className="flex items-center gap-1"><Badge tone={m.type === "JPG/PNG" ? "blue" : m.type === "MP4" ? "purple" : "red"}>{typeOf(m.type)}</Badge>{m.duration && <span className="text-[9px] text-slate-400">{m.duration}</span>}</span></span>
                <button onClick={() => add(m.id)} className="flex h-6 w-6 items-center justify-center rounded border border-slate-200 text-slate-500 hover:border-blue-300 hover:text-blue-600" aria-label="Add"><Plus className="h-3 w-3" /></button>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="self-start">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3"><span className="text-xs font-semibold text-slate-900">Timeline</span><span className="text-[11px] text-slate-400">{items.length} item{items.length !== 1 ? "s" : ""} · {fmtClock(total)}</span></div>
          {items.length === 0 ? <div className="px-4 py-14 text-center text-xs text-slate-400">Add media from the library to build your timeline.</div> : (
            <ul className="space-y-2 p-3">
              {items.map((it, i) => (
                <li key={it.id} onClick={() => setCur(i)} className={cn("flex items-center gap-2 rounded-lg border px-2 py-2", i === cur ? "border-blue-200 bg-blue-50/30" : "border-slate-200")}>
                  <span className="flex h-5 w-5 items-center justify-center rounded border border-slate-200 text-[10px] font-semibold text-slate-500">{i + 1}</span>
                  <span className="flex flex-col text-slate-300"><button onClick={(e) => { e.stopPropagation(); move(i, -1); }} disabled={i === 0} className="disabled:opacity-30"><ChevronUp className="h-3 w-3" /></button><button onClick={(e) => { e.stopPropagation(); move(i, 1); }} disabled={i === items.length - 1} className="disabled:opacity-30"><ChevronDown className="h-3 w-3" /></button></span>
                  <GripVertical className="hidden h-3.5 w-3.5 text-slate-300 sm:block" />
                  <span className="relative h-8 w-12 shrink-0 overflow-hidden rounded bg-slate-900"><img src={img(it.seed, 96, 64)} alt="" className="h-full w-full object-cover" />{it.type === "MP4" && <Play className="absolute inset-0 m-auto h-3 w-3 fill-white text-white" />}</span>
                  <span className="min-w-0 flex-1"><span className="block truncate text-xs font-semibold text-slate-900">{it.name}</span><Badge tone={it.type === "IMG" ? "blue" : it.type === "MP4" ? "purple" : "red"}>{it.type}</Badge></span>
                  <span className="flex items-center gap-1"><input type="number" value={it.duration} onClick={(e) => e.stopPropagation()} onChange={(e) => setItems((arr) => arr.map((x, idx) => (idx === i ? { ...x, duration: Number(e.target.value) } : x)))} className="h-7 w-12 rounded border border-slate-200 text-center text-xs" /><span className="text-[10px] text-slate-400">sec</span></span>
                  <button onClick={(e) => { e.stopPropagation(); setItems((arr) => arr.filter((_, idx) => idx !== i)); }} className="text-slate-400 hover:text-red-500"><X className="h-3.5 w-3.5" /></button>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="self-start">
          <div className="border-b border-slate-100 px-4 py-3 text-xs font-semibold text-slate-900">Preview</div>
          <div className="p-3">
            <div className="relative aspect-video overflow-hidden rounded-lg bg-slate-900">{preview && <img src={img(preview.seed, 480, 270)} alt="" className="h-full w-full object-cover" />}</div>
            <div className="mt-2 flex items-center justify-center gap-2 text-[11px] text-slate-500"><button onClick={() => setCur((c) => Math.max(0, c - 1))} className="flex h-6 w-6 items-center justify-center rounded border border-slate-200"><ChevronLeft className="h-3 w-3" /></button>{items.length ? `${cur + 1} / ${items.length}` : "0 / 0"}<button onClick={() => setCur((c) => Math.min(items.length - 1, c + 1))} className="flex h-6 w-6 items-center justify-center rounded border border-slate-200"><ChevronRight className="h-3 w-3" /></button></div>
            <dl className="mt-3 space-y-1.5 text-xs"><div className="flex justify-between"><dt className="text-slate-400">Items</dt><dd className="font-semibold text-slate-800">{items.length}</dd></div><div className="flex justify-between"><dt className="text-slate-400">Duration</dt><dd className="font-semibold text-slate-800">{fmtClock(total)}</dd></div><div className="flex justify-between"><dt className="text-slate-400">Status</dt><dd><Badge tone={playlist.status === "Published" ? "green" : "slate"} dot>{playlist.status}</Badge></dd></div></dl>
            <Button className="mt-3 w-full" size="sm" href={`/portal/playlists/${playlist.id}/publish`}><Send className="h-3.5 w-3.5" /> Publish</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
