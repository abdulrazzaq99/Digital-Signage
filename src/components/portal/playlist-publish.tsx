"use client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Label, Segmented, Select } from "@/components/ui/input";
import { Alert, SuccessIcon } from "@/components/ui/misc";
import { QueryState, Skeleton, TableSkeleton } from "@/components/ui/query-state";
import { useGroups } from "@/lib/api/hooks/groups";
import { usePlaylist, usePublishPlaylist } from "@/lib/api/hooks/playlists";
import { useCheckConflicts, useCreateSchedule } from "@/lib/api/hooks/schedules";
import { useScreens } from "@/lib/api/hooks/screens";
import type { Playlist, PublishResult, Schedule, Schemas } from "@/lib/api/types";
import { errorMessage, fmtClock, formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Boxes, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { BackLinkButton } from "./portal-stepper";
import { PublishOutcome } from "./publish-target";

type Phase = "target" | "schedule" | "reviewSchedule" | "confirm" | "done";
type Target = { kind: "screen" | "group"; id: string };
const TIMEZONES = ["Europe/London", "UTC", "Europe/Berlin", "America/New_York", "America/Los_Angeles", "Asia/Dubai", "Asia/Karachi", "Asia/Singapore", "Australia/Sydney"];
const localTz = () => { try { return Intl.DateTimeFormat().resolvedOptions().timeZone; } catch { return "UTC"; } };
const today = () => new Date().toISOString().slice(0, 10);
const toIso = (date: string, time: string) => (date ? new Date(`${date}T${time || "00:00"}:00`).toISOString() : "");

function Publish({ playlist, companyId, basePath, query }: { playlist: Playlist; companyId?: string | null; basePath: string; query: string }) {
  const router = useRouter();
  const listHref = `${basePath}${query ? `?${query}` : ""}`;
  const screens = useScreens({ pageSize: 100 }, { companyId });
  const groups = useGroups({ companyId });
  const publish = usePublishPlaylist(companyId);
  const check = useCheckConflicts(companyId);
  const schedule = useCreateSchedule(companyId);
  const [mode, setMode] = useState<"now" | "schedule">("now");
  const [target, setTarget] = useState<Target | null>(null);
  const [phase, setPhase] = useState<Phase>("target");
  const [when, setWhen] = useState({ startDate: today(), startTime: "09:00", endDate: today(), endTime: "17:00", timezone: TIMEZONES.includes(localTz()) ? localTz() : "UTC" });
  const [conflicts, setConflicts] = useState<Schemas["ScheduleConflicts"]["conflicts"] | null>(null);
  const [result, setResult] = useState<PublishResult | null>(null);
  const [created, setCreated] = useState<Schedule | null>(null);
  const [error, setError] = useState("");
  const all = screens.data?.data ?? [];
  const group = target?.kind === "group" ? groups.data?.data.find((g) => g.id === target.id) : undefined;
  const affected = target?.kind === "screen" ? all.filter((s) => s.id === target.id) : all.filter((s) => group?.screenIds.includes(s.id));
  const targetName = target?.kind === "screen" ? affected[0]?.name : group?.name;
  const summary: [string, string][] = [["Playlist", playlist.name], ["Items", `${playlist.itemCount} items`], ["Duration", fmtClock(playlist.totalDurationSec)], ["Target", targetName ?? ""]];
  const scheduleBody = (): Schemas["CreateScheduleBody"] | null => target ? { playlistId: playlist.id, targetKind: target.kind === "screen" ? "SCREEN" : "GROUP", targetId: target.id, startsAt: toIso(when.startDate, when.startTime), endsAt: when.endDate ? toIso(when.endDate, when.endTime) : null, timezone: when.timezone } : null;
  const Radio = ({ on }: { on: boolean }) => <span className={cn("flex h-4 w-4 items-center justify-center rounded-full border", on ? "border-blue-600" : "border-slate-300")}>{on && <span className="h-2 w-2 rounded-full bg-blue-600" />}</span>;

  const checkConflicts = async () => {
    const body = scheduleBody();
    if (!body) return;
    setError("");
    try { setConflicts((await check.mutateAsync(body)).conflicts); setPhase("reviewSchedule"); } catch (e) { setError(errorMessage(e)); }
  };
  const confirm = async () => {
    if (!target) return;
    setError("");
    try {
      if (mode === "now") setResult(await publish.mutateAsync(target.kind === "screen" ? { id: playlist.id, screenIds: [target.id], groupIds: [] } : { id: playlist.id, screenIds: [], groupIds: [target.id] }));
      else setCreated(await schedule.mutateAsync(scheduleBody()!));
      setPhase("done");
    } catch (e) { setError(errorMessage(e)); }
  };
  const pending = publish.isPending || schedule.isPending || check.isPending;

  return (
    <div className="max-w-[520px] space-y-4">
      {phase === "target" && (
        <div className="space-y-4 animate-fade-in">
          <BackLinkButton label="Playlists" onClick={() => router.push(listHref)} />
          <div><h1 className="text-xl font-bold tracking-tight text-slate-900">Publish</h1><p className="text-xs text-slate-400">&quot;{playlist.name}&quot; — {playlist.itemCount} items · {fmtClock(playlist.totalDurationSec)}</p></div>
          {playlist.itemCount === 0 && <Alert tone="amber">This playlist is empty. Add media before publishing.</Alert>}
          <Segmented options={[{ value: "now", label: "Publish Now" }, { value: "schedule", label: "Schedule" }]} value={mode} onChange={setMode} />
          <Card className="p-4">
            <div className="text-xs font-semibold text-slate-900">Select Target</div>
            {screens.isPending || groups.isPending ? <div className="mt-3"><TableSkeleton rows={4} /></div> : (
              <>
                <div className="mt-3 text-[9px] font-semibold uppercase tracking-wider text-slate-400">Screens</div>
                <ul className="mt-2 space-y-1.5">{all.map((s) => { const on = target?.kind === "screen" && target.id === s.id; return <li key={s.id}><button type="button" onClick={() => setTarget({ kind: "screen", id: s.id })} className={cn("flex w-full items-center gap-3 rounded-lg border px-3 py-2 text-left", on ? "border-blue-300 bg-blue-50/40" : "border-slate-200 hover:bg-slate-50")}><span className={cn("h-2 w-2 rounded-full", s.status === "ONLINE" ? "bg-green-500" : s.status === "OFFLINE" ? "bg-red-500" : "bg-amber-500")} /><span className="flex-1"><span className="block text-xs font-semibold text-slate-900">{s.name}</span><span className="block text-[10px] text-slate-400">{s.location ?? "—"}</span></span><Radio on={on} /></button></li>; })}</ul>
                {all.length === 0 && <p className="mt-2 text-xs text-slate-400">No screens paired yet.</p>}
                <div className="mt-4 text-[9px] font-semibold uppercase tracking-wider text-slate-400">Screen Groups</div>
                <ul className="mt-2 space-y-1.5">{(groups.data?.data ?? []).map((g) => { const on = target?.kind === "group" && target.id === g.id; return <li key={g.id}><button type="button" onClick={() => setTarget({ kind: "group", id: g.id })} disabled={g.screenCount === 0} className={cn("flex w-full items-center gap-3 rounded-lg border px-3 py-2 text-left disabled:opacity-50", on ? "border-blue-300 bg-blue-50/40" : "border-slate-200 hover:bg-slate-50")}><span className="flex h-6 w-6 items-center justify-center rounded bg-blue-50 text-blue-600"><Boxes className="h-3.5 w-3.5" /></span><span className="flex-1"><span className="block text-xs font-semibold text-slate-900">{g.name}</span><span className="block text-[10px] text-slate-400">{g.screenCount} screens · {g.onlineCount} online</span></span><Radio on={on} /></button></li>; })}</ul>
              </>
            )}
          </Card>
          <div className="flex gap-2"><Button variant="secondary" onClick={() => router.push(listHref)}>Cancel</Button><Button onClick={() => setPhase(mode === "now" ? "confirm" : "schedule")} disabled={!target || playlist.itemCount === 0}>{mode === "now" ? "Review ›" : "Set Schedule ›"}</Button></div>
        </div>
      )}

      {phase === "schedule" && (
        <div className="space-y-4 animate-fade-in">
          <BackLinkButton label="Select Target" onClick={() => setPhase("target")} />
          <div><h1 className="text-xl font-bold tracking-tight text-slate-900">Schedule Playlist</h1><p className="text-xs text-slate-400">Publishing to <span className="font-semibold text-slate-700">{targetName}</span></p></div>
          <Card className="p-4 space-y-3">
            <div className="text-xs font-semibold text-slate-900">Schedule</div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label required>Start Date</Label><Input type="date" value={when.startDate} onChange={(e) => setWhen({ ...when, startDate: e.target.value })} /></div>
              <div><Label>Start Time</Label><Input type="time" value={when.startTime} onChange={(e) => setWhen({ ...when, startTime: e.target.value })} /></div>
              <div><Label>End Date</Label><Input type="date" value={when.endDate} onChange={(e) => setWhen({ ...when, endDate: e.target.value })} /></div>
              <div><Label>End Time</Label><Input type="time" value={when.endTime} onChange={(e) => setWhen({ ...when, endTime: e.target.value })} /></div>
            </div>
            <div><Label>Timezone</Label><Select value={when.timezone} onChange={(e) => setWhen({ ...when, timezone: e.target.value })}>{TIMEZONES.map((z) => <option key={z} value={z}>{z}</option>)}</Select></div>
            <p className="text-[10px] text-slate-400">Leave the end date blank for an open-ended schedule.</p>
          </Card>
          {error && <Alert tone="red">{error}</Alert>}
          <div className="flex gap-2"><Button variant="secondary" onClick={() => setPhase("target")}>Back</Button><Button onClick={checkConflicts} disabled={!when.startDate || pending}>{check.isPending ? "Checking…" : "Check Conflicts ›"}</Button></div>
        </div>
      )}

      {(phase === "confirm" || phase === "reviewSchedule") && (
        <div className="space-y-4 animate-fade-in">
          <BackLinkButton label={phase === "confirm" ? "Select Target" : "Configure Schedule"} onClick={() => setPhase(phase === "confirm" ? "target" : "schedule")} />
          <div><h1 className="text-xl font-bold tracking-tight text-slate-900">{phase === "confirm" ? "Confirm Publish" : "Review Schedule"}</h1><p className="text-xs text-slate-400">Review the details before confirming.</p></div>
          <Card className="p-4"><div className="text-xs font-semibold text-slate-900">Summary</div><dl className="mt-2 divide-y divide-slate-100 text-xs">{[...summary, ...(phase === "reviewSchedule" ? [["Start", `${when.startDate} at ${when.startTime}`], ["End", when.endDate ? `${when.endDate} at ${when.endTime}` : "Open-ended"], ["Timezone", when.timezone]] as [string, string][] : [])].map(([k, v]) => <div key={k} className="flex justify-between py-2"><dt className="text-slate-400">{k}</dt><dd className="font-semibold text-slate-800">{v}</dd></div>)}</dl></Card>
          {phase === "reviewSchedule" && conflicts && (conflicts.length === 0 ? <Alert tone="green">No conflicts with existing schedules.</Alert> : <Alert tone="amber"><span className="font-semibold">{conflicts.length} overlapping schedule{conflicts.length > 1 ? "s" : ""}:</span> {conflicts.map((c) => `${c.playlistName} (${formatDateTime(c.startsAt)}${c.endsAt ? ` – ${formatDateTime(c.endsAt)}` : ""})`).join("; ")}. Resolve them before scheduling.</Alert>)}
          <div><div className="text-xs font-semibold text-slate-700">Screens affected</div><ul className="mt-2 space-y-1.5">{affected.map((s) => <li key={s.id} className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs"><span className={cn("h-2 w-2 rounded-full", s.status === "ONLINE" ? "bg-green-500" : "bg-red-500")} /><span className="font-semibold text-slate-900">{s.name}</span><span className="text-slate-400">{s.location ?? "—"}</span></li>)}</ul></div>
          {error && <Alert tone="red">{error}</Alert>}
          <div className="flex gap-2"><Button variant="secondary" onClick={() => setPhase(phase === "confirm" ? "target" : "schedule")} disabled={pending}>Back</Button><Button onClick={confirm} disabled={pending || (phase === "reviewSchedule" && (conflicts?.length ?? 0) > 0)}><Send className="h-3.5 w-3.5" /> {pending ? "Working…" : phase === "confirm" ? "Publish Now" : "Schedule"}</Button></div>
        </div>
      )}

      {phase === "done" && (
        <div className="flex flex-col items-center pt-6 text-center animate-fade-in">
          <SuccessIcon /><h1 className="mt-4 text-base font-semibold text-slate-900">{mode === "now" ? "Published!" : "Scheduled!"}</h1><p className="text-xs text-slate-400">{mode === "now" ? `Version ${result?.version} is on its way to your screens.` : `Goes live ${created ? formatDateTime(created.startsAt) : "at the scheduled time"} (${when.timezone}).`}</p>
          {result && <PublishOutcome screens={result.screens} />}
          {created && <ul className="mt-5 w-full space-y-2">{affected.map((s) => <li key={s.id} className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-xs"><span><span className="block font-semibold text-slate-900">{s.name}</span><span className="block text-[10px] text-slate-400">{s.location ?? "—"}</span></span><span className="text-[10px] font-medium text-blue-600">Scheduled</span></li>)}</ul>}
          <Button className="mt-4 w-full max-w-[200px]" onClick={() => router.push(listHref)}>✓ Done</Button>
        </div>
      )}
    </div>
  );
}

export function PlaylistPublish({ id, companyId, basePath = "/portal/playlists", query = "" }: { id: string; companyId?: string | null; basePath?: string; query?: string }) {
  const playlist = usePlaylist(id, { companyId });
  return <QueryState query={playlist} skeleton={<Skeleton className="h-80 max-w-[520px]" />}>{(p) => <Publish key={p.id} playlist={p} companyId={companyId} basePath={basePath} query={query} />}</QueryState>;
}
