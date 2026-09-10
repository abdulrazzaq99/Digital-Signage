"use client";
import { Button } from "@/components/ui/button";
import { Badge, StatusBadge } from "@/components/ui/badge";
import { Card, CardHeader, SectionLabel } from "@/components/ui/card";
import { Breadcrumb, Progress } from "@/components/ui/misc";
import type { Screen } from "@/lib/data";
import { img } from "@/lib/utils";
import { Plus, RefreshCw, RotateCcw, Send, Unlink } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { PublishModal } from "./publish-modal";

const activity = [
  ["Screen came online", "2 min ago"], ['Playlist "Summer Promotion" published', "Aug 21, 2026 · 10:30 AM"], ["Screen refreshed", "Yesterday"], ["Screen went offline", "2 days ago"],
];

export function ScreenDetail({ screen }: { screen: Screen }) {
  const [publish, setPublish] = useState(false);
  return (
    <div className="space-y-5">
      <Breadcrumb items={[{ label: "All Screens", href: "/screens" }, { label: screen.name }]} />
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5"><h1 className="text-xl font-bold tracking-tight text-slate-900">{screen.name}</h1><StatusBadge status={screen.status} /></div>
          <p className="mt-1 text-xs text-slate-400">{screen.company} <span className="mx-1.5">·</span> {screen.location} <span className="mx-1.5">·</span> <span className="font-mono">ANDROID-8F29A2</span></p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary"><RefreshCw className="h-3.5 w-3.5" /> Refresh</Button>
          <Button variant="secondary"><RotateCcw className="h-3.5 w-3.5" /> Restart Player</Button>
          <Button variant="danger-outline"><Unlink className="h-3.5 w-3.5" /> Unpair</Button>
          <Button onClick={() => setPublish(true)}><Send className="h-3.5 w-3.5" /> Publish</Button>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_300px]">
        <div className="space-y-5">
          <Card>
            <CardHeader title="Current Display" action={<span className="text-[11px] text-slate-400">{screen.orientation} · {screen.orientation === "Landscape" ? "16:9" : "9:16"}</span>} />
            <div className="flex justify-center px-5 py-6">
              <div className="w-full max-w-[560px] rounded-lg border-[6px] border-slate-900 bg-slate-900 shadow-2xl">
                <img src={img(screen.seed, 1120, 630)} alt="" className="aspect-video w-full rounded-[3px] object-cover" />
              </div>
            </div>
          </Card>
          <Card>
            <CardHeader title="Assigned Content" action={<Button variant="secondary" size="sm">View Playlist</Button>} />
            <div className="flex items-center gap-4 px-5 py-4">
              <img src={img(screen.seed, 160, 100)} alt="" className="h-14 w-20 rounded-md object-cover" />
              <div>
                <div className="text-sm font-semibold text-slate-900">{screen.content}</div>
                <div className="text-[11px] text-slate-400">Playlist · 8 items</div>
                <div className="text-[11px] text-slate-400">Published Aug 21, 2026 · 10:30 AM</div>
                <StatusBadge status={screen.sync} className="mt-1.5" />
              </div>
            </div>
          </Card>
          <Card>
            <CardHeader title="Recent Activity" action={<Link href="/activity" className="text-xs font-medium text-blue-600 hover:underline">View All</Link>} />
            <ul className="divide-y divide-slate-100">
              {activity.map(([t, w]) => <li key={t} className="px-5 py-3"><div className="text-sm text-slate-800">{t}</div><div className="text-[11px] text-slate-400">{w}</div></li>)}
            </ul>
          </Card>
        </div>

        <div className="space-y-5">
          <Card className="px-5 py-4">
            <SectionLabel>Health &amp; Status</SectionLabel>
            <dl className="mt-3 space-y-4">
              <div><dt className="text-[10px] uppercase tracking-wider text-slate-400">Status</dt><dd className="mt-0.5 flex items-center gap-1.5 text-sm font-semibold text-slate-900"><span className="h-2 w-2 rounded-full bg-green-500" />{screen.status}</dd><div className="text-[11px] text-slate-400">Last seen {screen.lastSeen}</div></div>
              <div><dt className="text-[10px] uppercase tracking-wider text-slate-400">Orientation</dt><dd className="mt-0.5 text-sm font-semibold text-slate-900">{screen.orientation}</dd><div className="text-[11px] text-slate-400">1920×1080</div></div>
              <div><dt className="text-[10px] uppercase tracking-wider text-slate-400">Last Sync</dt><dd className="mt-0.5 text-sm font-semibold text-slate-900">5 min ago</dd></div>
              <div><dt className="text-[10px] uppercase tracking-wider text-slate-400">Storage</dt><dd className="mt-0.5 text-sm font-semibold text-slate-900">68% Used</dd><div className="text-[11px] text-slate-400">8.2 GB / 12 GB</div><Progress value={68} tone="amber" className="mt-2" /></div>
            </dl>
          </Card>
          <Card className="px-5 py-4">
            <SectionLabel>Device Information</SectionLabel>
            <dl className="mt-3 space-y-2.5 text-xs">
              {[["Device ID", "ANDROID-8F29A2"], ["Player Version", "1.6.3"], ["App Version", "2.4.0"], ["Model", "Android Box Pro"], ["IP Address", "192.168.1.101"], ["Paired", "Mar 12, 2025"]].map(([k, v]) => (
                <div key={k} className="flex justify-between"><dt className="text-slate-400">{k}</dt><dd className={k === "Device ID" || k === "IP Address" ? "font-mono font-semibold text-slate-800" : "font-semibold text-slate-800"}>{v}</dd></div>
              ))}
            </dl>
          </Card>
          <Card className="px-5 py-4">
            <SectionLabel>Tags</SectionLabel>
            <div className="mt-3 flex flex-wrap gap-1.5">
              <Badge tone="slate">Lobby</Badge><Badge tone="slate">Main Display</Badge>
              <button className="inline-flex items-center gap-1 rounded-md border border-dashed border-slate-300 px-2 py-0.5 text-[11px] font-medium text-slate-500 hover:border-slate-400"><Plus className="h-3 w-3" /> Add Tag</button>
            </div>
          </Card>
        </div>
      </div>

      <PublishModal open={publish} onClose={() => setPublish(false)} defaultScreen={screen.id} />
    </div>
  );
}
