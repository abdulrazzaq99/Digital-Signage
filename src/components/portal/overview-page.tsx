"use client";
import { Button } from "@/components/ui/button";
import { Badge, DotStatus } from "@/components/ui/badge";
import { Card, CardHeader } from "@/components/ui/card";
import { TD, TH, THead, TR, Table } from "@/components/ui/table";
import { portalActivity, portalPublishPlaylists, portalScreens, portalUser, portalCompany, type PortalActivity } from "@/lib/portal-data";
import { cn, img } from "@/lib/utils";
import { Calendar, Check, ChevronRight, ImageIcon, Link2, Monitor, MonitorOff, Send, UploadCloud } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const kindStyle: Record<PortalActivity["kind"], { icon: React.ReactNode; cls: string }> = {
  publish: { icon: <Send className="h-3.5 w-3.5" />, cls: "bg-blue-50 text-blue-600" },
  offline: { icon: <MonitorOff className="h-3.5 w-3.5" />, cls: "bg-red-50 text-red-600" },
  media: { icon: <ImageIcon className="h-3.5 w-3.5" />, cls: "bg-violet-50 text-violet-600" },
  schedule: { icon: <Calendar className="h-3.5 w-3.5" />, cls: "bg-amber-50 text-amber-600" },
  pair: { icon: <Link2 className="h-3.5 w-3.5" />, cls: "bg-green-50 text-green-600" },
  upload: { icon: <UploadCloud className="h-3.5 w-3.5" />, cls: "bg-blue-50 text-blue-600" },
};

export function OverviewPage() {
  const [showAll, setShowAll] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [screenId, setScreenId] = useState<string | null>(null);
  const [playlistId, setPlaylistId] = useState<string | null>(null);
  const online = portalScreens.filter((s) => s.status === "Online").length;
  const offline = portalScreens.length - online;
  const rows = showAll ? portalScreens : portalScreens.slice(0, 5);
  const screen = portalScreens.find((s) => s.id === screenId);
  const playlist = portalPublishPlaylists.find((p) => p.id === playlistId);
  const reset = () => { setStep(1); setScreenId(null); setPlaylistId(null); };

  return (
    <div className="space-y-5">
      <div><h1 className="text-xl font-bold tracking-tight text-slate-900">Welcome back, {portalUser.name.split(" ")[0]}.</h1><p className="mt-0.5 text-sm text-slate-400">{portalCompany.name}</p></div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { value: portalScreens.length, label: "Total Screens", icon: <Monitor className="h-4 w-4" />, cls: "border-slate-200", ic: "bg-blue-50 text-blue-600" },
          { value: online, label: "Online", icon: <Monitor className="h-4 w-4" />, cls: "border-slate-200", ic: "bg-green-50 text-green-600" },
          { value: offline, label: "Offline", icon: <MonitorOff className="h-4 w-4" />, cls: "border-red-200", ic: "bg-red-50 text-red-600" },
        ].map((s) => (
          <Card key={s.label} className={cn("flex items-center gap-4 px-5 py-4", s.cls)}>
            <span className={cn("flex h-9 w-9 items-center justify-center rounded-lg", s.ic)}>{s.icon}</span>
            <div><div className="text-2xl font-bold tracking-tight text-slate-900">{s.value}</div><div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">{s.label}</div></div>
          </Card>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_300px]">
        <div className="space-y-5">
          <Card>
            <CardHeader title="Screen Status" action={<Link href="/portal/screens" className="text-xs font-medium text-blue-600 hover:underline">View all ›</Link>} />
            <Table>
              <THead><tr><TH>Screen</TH><TH>Location</TH><TH>Status</TH><TH>Content</TH><TH>Last Sync</TH></tr></THead>
              <tbody>
                {rows.map((s) => (
                  <TR key={s.id}>
                    <TD><Link href={`/portal/screens/${s.id}`} className="text-sm font-semibold text-slate-900 hover:text-blue-600 whitespace-nowrap">{s.name}</Link></TD>
                    <TD className="text-xs whitespace-nowrap">{s.location}</TD>
                    <TD><DotStatus status={s.status} /></TD>
                    <TD className="text-xs whitespace-nowrap">{s.content}</TD>
                    <TD className="text-xs text-slate-400 whitespace-nowrap">{s.lastSync}</TD>
                  </TR>
                ))}
              </tbody>
            </Table>
            {portalScreens.length > 5 && <div className="border-t border-slate-100 px-5 py-2.5"><button onClick={() => setShowAll((v) => !v)} className="text-xs font-medium text-slate-500 hover:text-slate-800">{showAll ? "Show fewer screens" : `Show ${portalScreens.length - 5} more screens`}</button></div>}
          </Card>

          <Card>
            <CardHeader title="Recent Activity" />
            <ul className="divide-y divide-slate-100">
              {portalActivity.map((a) => (
                <li key={a.id} className="flex items-center gap-3 px-5 py-3">
                  <span className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-md", kindStyle[a.kind].cls)}>{kindStyle[a.kind].icon}</span>
                  <span className="min-w-0 flex-1 truncate text-sm text-slate-800">{a.text}</span>
                  <span className="shrink-0 text-[11px] text-slate-400">{a.when}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        <Card className="self-start">
          <CardHeader title="Quick Publish" />
          <div className="px-4 pt-4">
            <div className="flex items-center">
              {["Screen", "Content", "Review"].map((label, i) => {
                const n = i + 1; const done = step > n; const active = step === n;
                return (
                  <div key={label} className={cn("flex items-center", i < 2 && "flex-1")}>
                    <div className="flex flex-col items-center gap-1">
                      <span className={cn("flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-semibold", done ? "bg-green-500 text-white" : active ? "bg-blue-600 text-white" : "border border-slate-200 bg-white text-slate-400")}>{done ? <Check className="h-3 w-3" /> : n}</span>
                      <span className={cn("text-[9px] font-medium", active ? "text-blue-600" : "text-slate-400")}>{label}</span>
                    </div>
                    {i < 2 && <div className={cn("mx-2 mb-4 h-px flex-1", done ? "bg-green-300" : "bg-slate-200")} />}
                  </div>
                );
              })}
            </div>
          </div>
          <div className="p-4">
            {step === 1 && (
              <div className="animate-fade-in">
                <p className="mb-2 text-[11px] text-slate-400">Select a screen to publish to</p>
                <ul className="max-h-[420px] space-y-1.5 overflow-y-auto pr-1">
                  {portalScreens.map((s) => (
                    <li key={s.id}><button onClick={() => { setScreenId(s.id); setStep(2); }} className="flex w-full items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-left transition-colors hover:border-blue-300 hover:bg-blue-50/40"><span><span className="block text-xs font-semibold text-slate-900">{s.name}</span><span className="block text-[10px] text-slate-400">{s.location}</span></span><DotStatus status={s.status} /></button></li>
                  ))}
                </ul>
              </div>
            )}
            {step === 2 && screen && (
              <div className="animate-fade-in">
                <p className="mb-2 text-[11px] text-slate-400">Publishing to <span className="font-semibold text-slate-700">{screen.name}</span></p>
                <ul className="space-y-1.5">
                  {portalPublishPlaylists.map((p) => (
                    <li key={p.id}><button onClick={() => { setPlaylistId(p.id); setStep(3); }} className="flex w-full items-center gap-3 rounded-lg border border-slate-200 px-3 py-2 text-left transition-colors hover:border-blue-300 hover:bg-blue-50/40"><img src={img(p.seed, 64, 40)} alt="" className="h-7 w-11 rounded object-cover" /><span className="flex-1"><span className="block text-xs font-semibold text-slate-900">{p.name}</span><span className="block text-[10px] text-slate-400">{p.items} items · {p.duration}</span></span><ChevronRight className="h-3.5 w-3.5 text-slate-300" /></button></li>
                  ))}
                </ul>
                <button onClick={() => setStep(1)} className="mt-3 text-[11px] font-medium text-slate-500 hover:text-slate-800">‹ Change screen</button>
              </div>
            )}
            {step === 3 && screen && playlist && (
              <div className="space-y-3 animate-fade-in">
                <dl className="space-y-2 rounded-lg border border-slate-200 bg-slate-50/60 px-3 py-3 text-xs">
                  <div className="flex justify-between gap-4"><dt className="text-slate-400">Screen</dt><dd className="text-right font-semibold text-slate-800">{screen.name}</dd></div>
                  <div className="flex justify-between gap-4"><dt className="text-slate-400">Playlist</dt><dd className="text-right font-semibold text-slate-800">{playlist.name}</dd></div>
                  <div className="flex justify-between gap-4"><dt className="text-slate-400">Action</dt><dd className="text-right font-semibold text-slate-800">Publish immediately</dd></div>
                </dl>
                <Button className="w-full" onClick={() => setStep(4)}><Send className="h-3.5 w-3.5" /> Publish Now</Button>
                <button onClick={() => setStep(2)} className="text-[11px] font-medium text-slate-500 hover:text-slate-800">‹ Back</button>
              </div>
            )}
            {step === 4 && screen && playlist && (
              <div className="flex flex-col items-center py-4 text-center animate-fade-in">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-green-50 text-green-600"><Check className="h-5 w-5" /></span>
                <div className="mt-3 text-sm font-semibold text-slate-900">Published</div>
                <p className="mt-1 text-[11px] text-slate-500"><span className="font-semibold text-slate-700">{playlist.name}</span> is now live on {screen.name}.</p>
                <Badge tone="green" dot className="mt-3">Synced</Badge>
                <Button variant="secondary" size="sm" className="mt-4" onClick={reset}>Start over</Button>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
