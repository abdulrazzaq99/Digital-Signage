"use client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input, Label, Segmented, Select } from "@/components/ui/input";
import { SuccessIcon } from "@/components/ui/misc";
import { fmtClock, portalGroups, portalScreens, type PortalPlaylist } from "@/lib/portal-data";
import { cn } from "@/lib/utils";
import { Boxes, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { BackLinkButton } from "./portal-stepper";

type Phase = "target" | "schedule" | "reviewSchedule" | "confirm" | "done";
type Target = { kind: "screen" | "group"; id: string };

export function PlaylistPublish({ playlist }: { playlist: PortalPlaylist }) {
  const router = useRouter();
  const [mode, setMode] = useState<"now" | "schedule">("now");
  const [target, setTarget] = useState<Target>({ kind: "screen", id: "reception-display" });
  const [phase, setPhase] = useState<Phase>("target");
  const total = playlist.items.reduce((a, b) => a + b.duration, 0);
  const affected = target.kind === "screen" ? portalScreens.filter((s) => s.id === target.id) : portalScreens.filter((s) => portalGroups.find((g) => g.id === target.id)?.screenIds.includes(s.id));
  const targetName = target.kind === "screen" ? affected[0]?.name : portalGroups.find((g) => g.id === target.id)?.name;
  const summary: [string, string][] = [["Playlist", playlist.name], ["Items", `${playlist.items.length} items`], ["Duration", fmtClock(total)], ["Target", targetName ?? ""]];

  const Radio = ({ on }: { on: boolean }) => <span className={cn("flex h-4 w-4 items-center justify-center rounded-full border", on ? "border-blue-600" : "border-slate-300")}>{on && <span className="h-2 w-2 rounded-full bg-blue-600" />}</span>;

  return (
    <div className="max-w-[520px] space-y-4">
      {phase === "target" && (
        <div className="space-y-4 animate-fade-in">
          <BackLinkButton label="Playlists" onClick={() => router.push("/portal/playlists")} />
          <div><h1 className="text-xl font-bold tracking-tight text-slate-900">Publish</h1><p className="text-xs text-slate-400">&quot;{playlist.name}&quot; — {playlist.items.length} items · {fmtClock(total)}</p></div>
          <Segmented options={[{ value: "now", label: "Publish Now" }, { value: "schedule", label: "Schedule" }]} value={mode} onChange={setMode} />
          <Card className="p-4">
            <div className="text-xs font-semibold text-slate-900">Select Target</div>
            <div className="mt-3 text-[9px] font-semibold uppercase tracking-wider text-slate-400">Screens</div>
            <ul className="mt-2 space-y-1.5">{portalScreens.map((s) => { const on = target.kind === "screen" && target.id === s.id; return <li key={s.id}><button onClick={() => setTarget({ kind: "screen", id: s.id })} className={cn("flex w-full items-center gap-3 rounded-lg border px-3 py-2 text-left", on ? "border-blue-300 bg-blue-50/40" : "border-slate-200 hover:bg-slate-50")}><span className={cn("h-2 w-2 rounded-full", s.status === "Online" ? "bg-green-500" : s.status === "Offline" ? "bg-red-500" : "bg-amber-500")} /><span className="flex-1"><span className="block text-xs font-semibold text-slate-900">{s.name}</span><span className="block text-[10px] text-slate-400">{s.location}</span></span><Radio on={on} /></button></li>; })}</ul>
            <div className="mt-4 text-[9px] font-semibold uppercase tracking-wider text-slate-400">Screen Groups</div>
            <ul className="mt-2 space-y-1.5">{portalGroups.map((g) => { const on = target.kind === "group" && target.id === g.id; const online = portalScreens.filter((s) => g.screenIds.includes(s.id) && s.status === "Online").length; return <li key={g.id}><button onClick={() => setTarget({ kind: "group", id: g.id })} className={cn("flex w-full items-center gap-3 rounded-lg border px-3 py-2 text-left", on ? "border-blue-300 bg-blue-50/40" : "border-slate-200 hover:bg-slate-50")}><span className="flex h-6 w-6 items-center justify-center rounded bg-blue-50 text-blue-600"><Boxes className="h-3.5 w-3.5" /></span><span className="flex-1"><span className="block text-xs font-semibold text-slate-900">{g.name}</span><span className="block text-[10px] text-slate-400">{g.screenIds.length} screens · {online} online</span></span><Radio on={on} /></button></li>; })}</ul>
          </Card>
          <div className="flex gap-2"><Button variant="secondary" onClick={() => router.push("/portal/playlists")}>Cancel</Button><Button onClick={() => setPhase(mode === "now" ? "confirm" : "schedule")}>Review ›</Button></div>
        </div>
      )}

      {phase === "schedule" && (
        <div className="space-y-4 animate-fade-in">
          <BackLinkButton label="Select Target" onClick={() => setPhase("target")} />
          <div><h1 className="text-xl font-bold tracking-tight text-slate-900">Schedule Playlist</h1><p className="text-xs text-slate-400">Publishing to <span className="font-semibold text-slate-700">{targetName}</span></p></div>
          <Card className="p-4 space-y-3">
            <div className="text-xs font-semibold text-slate-900">Schedule</div>
            <div className="grid grid-cols-2 gap-3"><div><Label>Start Date</Label><Input type="date" defaultValue="2026-09-12" /></div><div><Label>Start Time</Label><Input type="time" defaultValue="09:00" /></div><div><Label>End Date</Label><Input type="date" defaultValue="2026-09-12" /></div><div><Label>End Time</Label><Input type="time" defaultValue="17:00" /></div></div>
            <div><Label>Timezone</Label><Select defaultValue="london"><option value="london">Europe/London (UTC+0)</option><option>UTC</option><option>America/New_York (UTC-4)</option></Select></div>
          </Card>
          <div className="flex gap-2"><Button variant="secondary" onClick={() => setPhase("target")}>Back</Button><Button onClick={() => setPhase("reviewSchedule")}>Check Conflicts ›</Button></div>
        </div>
      )}

      {(phase === "confirm" || phase === "reviewSchedule") && (
        <div className="space-y-4 animate-fade-in">
          <BackLinkButton label={phase === "confirm" ? "Select Target" : "Configure Schedule"} onClick={() => setPhase(phase === "confirm" ? "target" : "schedule")} />
          <div><h1 className="text-xl font-bold tracking-tight text-slate-900">{phase === "confirm" ? "Confirm Publish" : "Review Schedule"}</h1><p className="text-xs text-slate-400">Review the details before confirming.</p></div>
          <Card className="p-4"><div className="text-xs font-semibold text-slate-900">Summary</div><dl className="mt-2 divide-y divide-slate-100 text-xs">{[...summary, ...(phase === "reviewSchedule" ? [["Start", "2026-09-12 at 09:00"], ["End", "2026-09-12 at 17:00"], ["Timezone", "Europe/London (UTC+0)"]] as [string, string][] : [])].map(([k, v]) => <div key={k} className="flex justify-between py-2"><dt className="text-slate-400">{k}</dt><dd className="font-semibold text-slate-800">{v}</dd></div>)}</dl></Card>
          <div><div className="text-xs font-semibold text-slate-700">Screens affected</div><ul className="mt-2 space-y-1.5">{affected.map((s) => <li key={s.id} className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs"><span className={cn("h-2 w-2 rounded-full", s.status === "Online" ? "bg-green-500" : "bg-red-500")} /><span className="font-semibold text-slate-900">{s.name}</span><span className="text-slate-400">{s.location}</span></li>)}</ul></div>
          <div className="flex gap-2"><Button variant="secondary" onClick={() => setPhase(phase === "confirm" ? "target" : "schedule")}>Back</Button><Button onClick={() => setPhase("done")}><Send className="h-3.5 w-3.5" /> {phase === "confirm" ? "Publish Now" : "Schedule"}</Button></div>
        </div>
      )}

      {phase === "done" && (
        <div className="flex flex-col items-center pt-6 text-center animate-fade-in">
          <SuccessIcon /><h1 className="mt-4 text-base font-semibold text-slate-900">{mode === "now" ? "Published!" : "Scheduled!"}</h1><p className="text-xs text-slate-400">{mode === "now" ? "Content is live on your screens." : "Content will go live at the scheduled time."}</p>
          <ul className="mt-5 w-full space-y-2">{affected.map((s) => <li key={s.id} className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-xs"><span><span className="block font-semibold text-slate-900">{s.name}</span><span className="block text-[10px] text-slate-400">{s.location}</span></span><Badge tone={s.status === "Online" ? "green" : "amber"} dot>{s.status === "Online" ? "Synced" : "Pending"}</Badge></li>)}</ul>
          <Button className="mt-4 w-full max-w-[200px]" onClick={() => router.push("/portal/playlists")}>✓ Done</Button>
        </div>
      )}
    </div>
  );
}
