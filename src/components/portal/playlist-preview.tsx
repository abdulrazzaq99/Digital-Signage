"use client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { fmtClock, type PortalPlaylist } from "@/lib/portal-data";
import { cn, img } from "@/lib/utils";
import { Pause, Play, Send, SkipBack, SkipForward } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { BackLinkButton } from "./portal-stepper";

export function PlaylistPreview({ playlist }: { playlist: PortalPlaylist }) {
  const router = useRouter();
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(false);
  const items = playlist.items;
  const total = items.reduce((a, b) => a + b.duration, 0);
  useEffect(() => {
    if (!playing || items.length === 0) return;
    const t = setTimeout(() => setI((v) => (v + 1) % items.length), 1800);
    return () => clearTimeout(t);
  }, [playing, i, items.length]);
  const cur = items[i];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3"><BackLinkButton label="Back to Editor" onClick={() => router.push(`/portal/playlists/${playlist.id}/edit`)} /><Button size="sm" href={`/portal/playlists/${playlist.id}/publish`}><Send className="h-3.5 w-3.5" /> Publish</Button></div>
      <Card className="overflow-hidden">
        <div className="relative aspect-video bg-slate-900">
          {cur && <img src={img(cur.seed, 1280, 720)} alt="" className="h-full w-full object-cover" />}
          {cur && <div className="absolute bottom-3 left-3 rounded-md bg-black/70 px-2.5 py-1.5 text-white"><div className="text-xs font-semibold">{cur.name}</div><div className="text-[9px] text-white/70">{cur.duration}s</div></div>}
          <span className="absolute bottom-3 right-3 rounded bg-black/70 px-2 py-0.5 text-[10px] text-white">{items.length ? `${i + 1} / ${items.length}` : "0 / 0"}</span>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-1.5"><button onClick={() => setI((v) => Math.max(0, v - 1))} className="flex h-7 w-7 items-center justify-center rounded border border-slate-200 text-slate-500"><SkipBack className="h-3.5 w-3.5" /></button><button onClick={() => setPlaying((p) => !p)} className="flex h-7 w-7 items-center justify-center rounded bg-blue-600 text-white">{playing ? <Pause className="h-3.5 w-3.5 fill-current" /> : <Play className="h-3.5 w-3.5 fill-current" />}</button><button onClick={() => setI((v) => Math.min(items.length - 1, v + 1))} className="flex h-7 w-7 items-center justify-center rounded border border-slate-200 text-slate-500"><SkipForward className="h-3.5 w-3.5" /></button></div>
          <div className="flex items-center gap-1">{items.map((it, idx) => <span key={it.id} className={cn("h-1.5 rounded-full transition-all", idx === i ? "w-6 bg-blue-600" : "w-1.5 bg-slate-300")} />)}</div>
          <span className="text-[11px] text-slate-400">{fmtClock(total)}</span>
        </div>
        <div className="flex gap-2 overflow-x-auto border-t border-slate-100 px-4 py-3">{items.map((it, idx) => <button key={it.id} onClick={() => setI(idx)} className="shrink-0 text-center"><span className={cn("block h-9 w-14 overflow-hidden rounded border-2", idx === i ? "border-blue-600" : "border-transparent")}><img src={img(it.seed, 112, 72)} alt="" className="h-full w-full object-cover" /></span><span className="mt-0.5 block text-[9px] text-slate-400">{it.duration}s</span></button>)}</div>
      </Card>
    </div>
  );
}
