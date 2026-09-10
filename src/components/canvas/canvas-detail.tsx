import { Button } from "@/components/ui/button";
import { Badge, DotStatus, StatusBadge } from "@/components/ui/badge";
import { Card, CardHeader, StatCard } from "@/components/ui/card";
import { Breadcrumb } from "@/components/ui/misc";
import type { Canvas } from "@/lib/data";
import { img } from "@/lib/utils";
import { Play, RefreshCw } from "lucide-react";

const swatches = ["bg-blue-600", "bg-violet-600", "bg-emerald-600"];

export function CanvasDetail({ canvas }: { canvas: Canvas }) {
  const online = canvas.members.filter((m) => m.status === "Online").length;
  return (
    <div className="space-y-5">
      <Breadcrumb items={[{ label: "Synchronized Canvas", href: "/screens/canvas" }, { label: canvas.name }]} />
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {canvas.seed ? <img src={img(canvas.seed, 160, 100)} alt="" className="h-12 w-[72px] rounded-lg object-cover" /> : <span className="h-12 w-[72px] rounded-lg bg-slate-900" />}
          <div>
            <div className="flex items-center gap-2.5"><h1 className="text-xl font-bold tracking-tight text-slate-900">{canvas.name}</h1><StatusBadge status={canvas.status} /></div>
            <p className="mt-0.5 text-xs text-slate-400">{canvas.screens} screens · Created {canvas.created}</p>
          </div>
        </div>
        <div className="flex gap-2"><Button href={`/screens/canvas/${canvas.id}/reconfigure`} variant="secondary">Reconfigure</Button><Button variant="danger-outline">Deactivate</Button></div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard value={canvas.screens} label="Total Screens" sub="in this canvas" />
        <StatCard value={online} label="Screens Online" sub={`of ${canvas.screens} active`} tone="green" />
        <StatCard value={canvas.ready} label="Ready" sub="for synchronization" tone="green" />
        <StatCard value={<span className="text-lg">{canvas.lastSync}</span>} label="Last Sync" sub="synchronization time" />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_280px]">
        <div className="space-y-5">
          <Card>
            <CardHeader title="Physical Arrangement" />
            <div className="p-5">
              {canvas.members.length === 0 ? <div className="py-2 text-xs text-slate-400">No screens arranged yet.</div> : (
                <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${canvas.members.length}, minmax(0,1fr))` }}>
                  {canvas.members.map((m, i) => (
                    <div key={m.name} className="overflow-hidden rounded-lg border border-slate-200">
                      <div className="relative aspect-video bg-slate-900"><img src={img(`${canvas.seed}-${i}`, 480, 270)} alt="" className="h-full w-full object-cover" /><span className={`absolute left-2 top-2 rounded px-1.5 py-0.5 text-[10px] font-semibold text-white ${swatches[i % 3]}`}>#{i + 1}</span></div>
                      <div className="px-3 py-2"><div className="text-xs font-semibold text-slate-900">{m.name}</div><div className="text-[10px] text-slate-400">{m.location}</div></div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
          <Card>
            <CardHeader title="Master Canvas" action={<span className="text-[11px] text-slate-400">{canvas.content ?? "No content assigned"}</span>} />
            <div className="p-5">
              <div className="relative overflow-hidden rounded-lg bg-slate-900" style={{ aspectRatio: `${Math.max(canvas.members.length, 1) * 16} / 9` }}>
                {canvas.members.length > 0 && <img src={img(`${canvas.seed}-wide`, 1600, 400)} alt="" className="h-full w-full object-cover" />}
                {canvas.members.length > 0 && (
                  <div className="absolute inset-0 grid" style={{ gridTemplateColumns: `repeat(${canvas.members.length}, minmax(0,1fr))` }}>
                    {canvas.members.map((m, i) => <div key={m.name} className="relative border-r border-white/40 last:border-r-0"><span className={`absolute left-2 top-2 rounded px-1.5 py-0.5 text-[10px] font-semibold text-white ${swatches[i % 3]}`}>Screen {i + 1}</span></div>)}
                  </div>
                )}
                <div className="absolute bottom-3 left-3 flex items-center gap-1.5 text-xs font-medium text-white"><Play className="h-3 w-3 fill-current" /> {canvas.content ?? "No content assigned"}</div>
              </div>
            </div>
          </Card>
        </div>
        <Card className="self-start">
          <CardHeader title="Member Screens" />
          <ul className="divide-y divide-slate-100">
            {canvas.members.map((m, i) => (
              <li key={m.name} className="px-4 py-3">
                <div className="flex items-center justify-between"><span className="flex items-center gap-2"><span className={`flex h-5 w-5 items-center justify-center rounded text-[10px] font-semibold text-white ${swatches[i % 3]}`}>{i + 1}</span><span className="text-sm font-semibold text-slate-900">{m.name}</span></span><DotStatus status={m.status} /></div>
                <div className="mt-1.5 flex items-center gap-2 pl-7"><Badge tone="green">Ready</Badge><span className="text-[10px] text-slate-400">Synced {m.syncedAgo}</span></div>
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-1.5 border-t border-slate-100 px-4 py-3 text-[11px] text-slate-400"><RefreshCw className="h-3 w-3" /> Last sync: {canvas.lastSync}</div>
        </Card>
      </div>
    </div>
  );
}
