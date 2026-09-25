"use client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { QueryState, Skeleton } from "@/components/ui/query-state";
import { usePlaylist } from "@/lib/api/hooks/playlists";
import type { Playlist } from "@/lib/api/types";
import { fmtClock } from "@/lib/format";
import { cn } from "@/lib/utils";
import { FileText, Pause, Play, Send, SkipBack, SkipForward } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { BackLinkButton } from "./portal-stepper";

function Slide({ item, className }: { item: NonNullable<Playlist["items"]>[number]; className?: string }) {
  const url = item.asset.thumbnailUrl;
  if (url) return <img src={url} alt="" className={cn("h-full w-full object-cover", className)} />;
  return <div className={cn("flex h-full w-full flex-col items-center justify-center gap-2 text-slate-400", className)}>{item.asset.type === "PDF" ? <FileText className="h-10 w-10" /> : <Play className="h-10 w-10" />}<span className="text-xs">{item.asset.name}</span></div>;
}

function Preview({ playlist, basePath, query }: { playlist: Playlist; basePath: string; query: string }) {
  const router = useRouter();
  const items = playlist.items ?? [];
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(false);
  const cur = items[i];
  const qs = query ? `?${query}` : "";
  // Advance using each slot's real duration, capped so the preview stays snappy.
  useEffect(() => {
    if (!playing || items.length === 0) return;
    const t = setTimeout(() => setI((v) => (v + 1) % items.length), Math.min(cur?.durationSec ?? 5, 5) * 1000);
    return () => clearTimeout(t);
  }, [playing, i, items.length, cur?.durationSec]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3"><BackLinkButton label="Back to Editor" onClick={() => router.push(`${basePath}/${playlist.id}/edit${qs}`)} /><Button size="sm" href={`${basePath}/${playlist.id}/publish${qs}`} disabled={items.length === 0}><Send className="h-3.5 w-3.5" /> Publish</Button></div>
      <Card className="overflow-hidden">
        <div className="relative aspect-video bg-slate-900">
          {cur ? <Slide item={cur} /> : <div className="flex h-full items-center justify-center text-xs text-slate-500">This playlist has no items yet.</div>}
          {cur && <div className="absolute bottom-3 left-3 rounded-md bg-black/70 px-2.5 py-1.5 text-white"><div className="text-xs font-semibold">{cur.asset.name}</div><div className="text-[9px] text-white/70">{cur.durationSec}s</div></div>}
          <span className="absolute bottom-3 right-3 rounded bg-black/70 px-2 py-0.5 text-[10px] text-white">{items.length ? `${i + 1} / ${items.length}` : "0 / 0"}</span>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-1.5"><button onClick={() => setI((v) => Math.max(0, v - 1))} className="flex h-10 w-10 sm:h-7 sm:w-7 items-center justify-center rounded border border-slate-200 text-slate-500" aria-label="Previous"><SkipBack className="h-3.5 w-3.5" /></button><button onClick={() => setPlaying((p) => !p)} className="flex h-10 w-10 sm:h-7 sm:w-7 items-center justify-center rounded bg-blue-600 text-white" aria-label={playing ? "Pause" : "Play"}>{playing ? <Pause className="h-3.5 w-3.5 fill-current" /> : <Play className="h-3.5 w-3.5 fill-current" />}</button><button onClick={() => setI((v) => Math.min(items.length - 1, v + 1))} className="flex h-10 w-10 sm:h-7 sm:w-7 items-center justify-center rounded border border-slate-200 text-slate-500" aria-label="Next"><SkipForward className="h-3.5 w-3.5" /></button></div>
          <div className="flex items-center gap-1">{items.map((it, idx) => <span key={it.id} className={cn("h-1.5 rounded-full transition-all", idx === i ? "w-6 bg-blue-600" : "w-1.5 bg-slate-300")} />)}</div>
          <span className="text-[11px] text-slate-400">{fmtClock(playlist.totalDurationSec)}</span>
        </div>
        <div className="flex gap-2 overflow-x-auto border-t border-slate-100 px-4 py-3">{items.map((it, idx) => <button key={it.id} onClick={() => setI(idx)} className="shrink-0 text-center"><span className={cn("block h-9 w-14 overflow-hidden rounded border-2 bg-slate-900", idx === i ? "border-blue-600" : "border-transparent")}><Slide item={it} /></span><span className="mt-0.5 block text-[9px] text-slate-400">{it.durationSec}s</span></button>)}</div>
      </Card>
    </div>
  );
}

export function PlaylistPreview({ id, companyId, basePath = "/portal/playlists", query = "" }: { id: string; companyId?: string | null; basePath?: string; query?: string }) {
  const playlist = usePlaylist(id, { companyId });
  return <QueryState query={playlist} skeleton={<Skeleton className="aspect-video w-full" />}>{(p) => <Preview key={p.id} playlist={p} basePath={basePath} query={query} />}</QueryState>;
}
