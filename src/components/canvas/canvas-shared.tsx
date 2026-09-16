"use client";
import { DotStatus } from "@/components/ui/badge";
import { Card, CardHeader } from "@/components/ui/card";
import { Select } from "@/components/ui/input";
import { TableSkeleton } from "@/components/ui/query-state";
import { usePlaylists } from "@/lib/api/hooks/playlists";
import { screenStatusLabel } from "@/lib/api/hooks/screens";
import type { Screen } from "@/lib/api/types";
import { formatDuration } from "@/lib/format";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";

export const swatches = ["bg-blue-600", "bg-violet-600", "bg-emerald-600", "bg-amber-500", "bg-pink-500"];

/** A screen is canvas-compatible when it is landscape; the API enforces orientation consistency on create. */
export const canvasCompatible = (s: Screen) => s.orientation === "LANDSCAPE";

/** Left-to-right tiles with move controls; `screens` are already in position order. */
export function Arrangement({ screens, onMove }: { screens: Screen[]; onMove?: (i: number, dir: -1 | 1) => void }) {
  return (
    <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${Math.max(screens.length, 1)}, minmax(0,1fr))` }}>
      {screens.map((s, i) => (
        <div key={s.id} className="overflow-hidden rounded-lg border border-slate-200">
          <div className="relative flex aspect-video items-center justify-center bg-slate-900 text-slate-600">
            {s.assignment?.thumbnailUrl ? <img src={s.assignment.thumbnailUrl} alt="" className="h-full w-full object-cover" /> : <span className="text-[10px] uppercase tracking-wider">{screenStatusLabel(s.status)}</span>}
            <span className={`absolute left-2 top-2 rounded px-1.5 py-0.5 text-[10px] font-semibold text-white ${swatches[i % swatches.length]}`}>#{i + 1}</span>
          </div>
          <div className="flex items-center justify-between gap-2 px-3 py-2">
            <div className="min-w-0"><div className="truncate text-xs font-semibold text-slate-900">{s.name}</div><div className="text-[10px] text-slate-400">Position {i + 1}</div></div>
            {onMove && <div className="flex shrink-0 gap-1"><button type="button" onClick={() => onMove(i, -1)} disabled={i === 0} className="flex h-6 w-6 items-center justify-center rounded border border-slate-200 text-slate-500 disabled:opacity-30" aria-label="Move left"><ChevronLeft className="h-3 w-3" /></button><button type="button" onClick={() => onMove(i, 1)} disabled={i === screens.length - 1} className="flex h-6 w-6 items-center justify-center rounded border border-slate-200 text-slate-500 disabled:opacity-30" aria-label="Move right"><ChevronRight className="h-3 w-3" /></button></div>}
            {!onMove && <DotStatus status={screenStatusLabel(s.status)} />}
          </div>
        </div>
      ))}
    </div>
  );
}

/** The master canvas split into `count` equal slices. */
export function MasterPreview({ count, caption, thumbnailUrl }: { count: number; caption: string; thumbnailUrl?: string | null }) {
  const n = Math.max(count, 1);
  return (
    <div className="relative overflow-hidden rounded-lg bg-slate-900" style={{ aspectRatio: `${n * 16} / 9`, maxHeight: 220 }}>
      {thumbnailUrl && <img src={thumbnailUrl} alt="" className="h-full w-full object-cover opacity-80" />}
      <div className="absolute inset-0 grid" style={{ gridTemplateColumns: `repeat(${n}, minmax(0,1fr))` }}>
        {Array.from({ length: n }).map((_, i) => <div key={i} className="relative border-r border-white/30 last:border-r-0"><span className={`absolute left-2 top-2 rounded px-1.5 py-0.5 text-[10px] font-semibold text-white ${swatches[i % swatches.length]}`}>Screen {i + 1}</span></div>)}
      </div>
      <div className="absolute bottom-3 left-3 flex items-center gap-1.5 text-xs font-semibold text-white"><Play className="h-3 w-3 fill-current" /> {caption}</div>
    </div>
  );
}

/** Playlist picker for the canvas content (layouts and template instances can be assigned through the API as well). */
export function ContentPicker({ companyId, value, onChange }: { companyId: string; value: string; onChange: (id: string) => void }) {
  const playlists = usePlaylists({ pageSize: 100 }, { companyId });
  return (
    <Card>
      <CardHeader title="Canvas Content" subtitle="The playlist is split evenly across the member screens. Required before activation." />
      <div className="px-5 py-4">
        {playlists.isPending ? <TableSkeleton rows={2} /> : (
          <Select value={value} onChange={(e) => onChange(e.target.value)} className="max-w-md">
            <option value="">Select a playlist…</option>
            {(playlists.data?.data ?? []).filter((p) => p.itemCount > 0).map((p) => <option key={p.id} value={p.id}>{p.name} · {p.itemCount} items · {formatDuration(p.totalDurationSec)}</option>)}
          </Select>
        )}
      </div>
    </Card>
  );
}
