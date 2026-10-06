"use client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { applyApiError, Field, FormError, SubmitButton, useZodForm } from "@/components/ui/form";
import { Input, Segmented, Select } from "@/components/ui/input";
import { Alert, SuccessIcon } from "@/components/ui/misc";
import { ErrorState, QueryState, Skeleton, TableSkeleton } from "@/components/ui/query-state";
import { browserZone, formatInZone, nowIn, scheduleInstants, scheduleSchema, type ScheduleWindow } from "@/components/schedules/zoned-time";
import { ApiError } from "@/lib/api/client";
import { useGroups } from "@/lib/api/hooks/groups";
import { usePlaylist, usePublishPlaylist } from "@/lib/api/hooks/playlists";
import { useCheckConflicts, useCreateSchedule } from "@/lib/api/hooks/schedules";
import { useScreens } from "@/lib/api/hooks/screens";
import type { Playlist, PublishResult, Schedule, Schemas } from "@/lib/api/types";
import { errorMessage, fmtClock } from "@/lib/format";
import { TIME_ZONES } from "@/lib/validation/fields";
import { cn } from "@/lib/utils";
import { Boxes, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useWatch } from "react-hook-form";
import { BackLinkButton } from "./portal-stepper";
import { PublishOutcome } from "./publish-target";

type Phase = "target" | "schedule" | "reviewSchedule" | "confirm" | "done";
type Target = { kind: "screen" | "group"; id: string };
/** Default start: the next whole hour in the browser's zone; the end is left blank (open-ended). */
const defaultWindow = () => {
  const tz = TIME_ZONES.includes(browserZone()) ? browserZone() : "UTC";
  const next = nowIn(tz, Date.now() + 3_600_000);
  return { startDate: next.date, startTime: `${next.time.slice(0, 2)}:00`, endDate: "", endTime: "", timezone: tz };
};
/** API field names → schedule form fields (server errors and SCHEDULE_CONFLICT land on the time inputs). */
const SCHEDULE_FIELDS = { startsAt: "startTime", endsAt: "endTime" };

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
  const scheduleForm = useZodForm(useMemo(() => scheduleSchema(), []), { defaultValues: defaultWindow() });
  const [when, setWhen] = useState<ScheduleWindow | null>(null);
  const [tzNow = "", startDate = ""] = useWatch({ control: scheduleForm.control, name: ["timezone", "startDate"] });
  const zoneToday = nowIn(tzNow || "UTC").date;
  const [conflicts, setConflicts] = useState<Schemas["ScheduleConflicts"]["conflicts"] | null>(null);
  const [result, setResult] = useState<PublishResult | null>(null);
  const [created, setCreated] = useState<Schedule | null>(null);
  const [error, setError] = useState("");
  const all = screens.data?.data ?? [];
  const group = target?.kind === "group" ? (groups.data?.data ?? []).find((g) => g.id === target.id) : undefined;
  const affected = target?.kind === "screen" ? all.filter((s) => s.id === target.id) : all.filter((s) => (group?.screenIds ?? []).includes(s.id));
  const targetName = target?.kind === "screen" ? affected[0]?.name : group?.name;
  const summary: [string, string][] = [["Playlist", playlist.name], ["Items", `${playlist.itemCount} items`], ["Duration", fmtClock(playlist.totalDurationSec)], ["Target", targetName ?? ""]];
  const scheduleBody = (w: ScheduleWindow | null = when): Schemas["CreateScheduleBody"] | null => {
    if (!target || !w) return null;
    const { startsAt, endsAt, timezone } = scheduleInstants(w);
    return { playlistId: playlist.id, targetKind: target.kind === "screen" ? "SCREEN" : "GROUP", targetId: target.id, startsAt, ...(endsAt ? { endsAt } : {}), timezone };
  };
  const Radio = ({ on }: { on: boolean }) => <span className={cn("flex h-4 w-4 items-center justify-center rounded-full border", on ? "border-blue-600" : "border-slate-300")}>{on && <span className="h-2 w-2 rounded-full bg-blue-600" />}</span>;

  const checkConflicts = scheduleForm.handleSubmit(async (w) => {
    const body = scheduleBody(w);
    if (!body) return;
    setError("");
    try { setConflicts((await check.mutateAsync(body)).conflicts ?? []); setWhen(w); setPhase("reviewSchedule"); } catch (e) { applyApiError(scheduleForm, e, SCHEDULE_FIELDS); }
  });
  /** A conflict found while creating (someone scheduled in between): back to the times, with the error on them. */
  const showConflict = (e: ApiError) => {
    setPhase("schedule");
    const message = errorMessage(e);
    scheduleForm.setError("startTime", { type: "server", message });
    scheduleForm.setError("endTime", { type: "server", message });
  };
  const confirm = async () => {
    if (!target) return;
    setError("");
    try {
      if (mode === "now") setResult(await publish.mutateAsync(target.kind === "screen" ? { id: playlist.id, screenIds: [target.id], groupIds: [] } : { id: playlist.id, screenIds: [], groupIds: [target.id] }));
      else {
        const body = scheduleBody();
        if (!body) return;
        setCreated(await schedule.mutateAsync(body));
      }
      setPhase("done");
    } catch (e) {
      if (mode === "schedule" && e instanceof ApiError && e.code === "SCHEDULE_CONFLICT") showConflict(e);
      else if (mode === "schedule" && e instanceof ApiError && e.code === "VALIDATION_ERROR") { setPhase("schedule"); applyApiError(scheduleForm, e, SCHEDULE_FIELDS); }
      else setError(errorMessage(e));
    }
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
            {screens.isPending || groups.isPending ? <div className="mt-3"><TableSkeleton rows={4} /></div> : screens.isError || groups.isError ? <ErrorState className="mt-3" error={screens.error ?? groups.error} onRetry={() => { if (screens.isError) void screens.refetch(); if (groups.isError) void groups.refetch(); }} /> : (
              <>
                <div className="mt-3 text-[9px] font-semibold uppercase tracking-wider text-slate-400">Screens</div>
                <ul className="mt-2 space-y-1.5">{all.map((s) => { const on = target?.kind === "screen" && target.id === s.id; return <li key={s.id}><button type="button" onClick={() => setTarget({ kind: "screen", id: s.id })} className={cn("flex w-full items-center gap-3 rounded-lg border px-3 py-2 text-left", on ? "border-blue-300 bg-blue-50/40" : "border-slate-200 hover:bg-slate-50")}><span className={cn("h-2 w-2 rounded-full", s.status === "ONLINE" ? "bg-green-500" : s.status === "OFFLINE" ? "bg-red-500" : "bg-amber-500")} /><span className="flex-1"><span className="block text-xs font-semibold text-slate-900">{s.name}</span><span className="block text-[10px] text-slate-400">{s.location ?? "—"}</span></span><Radio on={on} /></button></li>; })}</ul>
                {all.length === 0 && <p className="mt-2 text-xs text-slate-400">No screens paired yet.</p>}
                <div className="mt-4 text-[9px] font-semibold uppercase tracking-wider text-slate-400">Screen Groups</div>
                {(groups.data?.data ?? []).length === 0 && <p className="mt-2 text-xs text-slate-400">No screen groups yet.</p>}
                <ul className="mt-2 space-y-1.5">{(groups.data?.data ?? []).map((g) => { const on = target?.kind === "group" && target.id === g.id; return <li key={g.id}><button type="button" onClick={() => setTarget({ kind: "group", id: g.id })} disabled={g.screenCount === 0} className={cn("flex w-full items-center gap-3 rounded-lg border px-3 py-2 text-left disabled:opacity-50", on ? "border-blue-300 bg-blue-50/40" : "border-slate-200 hover:bg-slate-50")}><span className="flex h-6 w-6 items-center justify-center rounded bg-blue-50 text-blue-600"><Boxes className="h-3.5 w-3.5" /></span><span className="flex-1"><span className="block text-xs font-semibold text-slate-900">{g.name}</span><span className="block text-[10px] text-slate-400">{g.screenCount} screens · {g.onlineCount} online</span></span><Radio on={on} /></button></li>; })}</ul>
              </>
            )}
          </Card>
          <div className="flex gap-2"><Button variant="secondary" onClick={() => router.push(listHref)}>Cancel</Button><Button onClick={() => { setError(""); setPhase(mode === "now" ? "confirm" : "schedule"); }} disabled={!target || playlist.itemCount === 0}>{mode === "now" ? "Review ›" : "Set Schedule ›"}</Button></div>
        </div>
      )}

      {phase === "schedule" && (
        <form onSubmit={checkConflicts} noValidate className="space-y-4 animate-fade-in">
          <BackLinkButton label="Select Target" onClick={() => setPhase("target")} />
          <div><h1 className="text-xl font-bold tracking-tight text-slate-900">Schedule Playlist</h1><p className="text-xs text-slate-400">Publishing to <span className="font-semibold text-slate-700">{targetName}</span></p></div>
          <Card className="p-4 space-y-3">
            <div className="text-xs font-semibold text-slate-900">Schedule</div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Start Date" required error={scheduleForm.formState.errors.startDate?.message}><Input type="date" min={zoneToday} {...scheduleForm.register("startDate")} /></Field>
              <Field label="Start Time" required error={scheduleForm.formState.errors.startTime?.message}><Input type="time" {...scheduleForm.register("startTime")} /></Field>
              <Field label="End Date" error={scheduleForm.formState.errors.endDate?.message}><Input type="date" min={startDate || zoneToday} {...scheduleForm.register("endDate")} /></Field>
              <Field label="End Time" error={scheduleForm.formState.errors.endTime?.message} hint="Blank = end of that day"><Input type="time" {...scheduleForm.register("endTime")} /></Field>
            </div>
            <Field label="Timezone" required error={scheduleForm.formState.errors.timezone?.message} hint="Start and end times are read in this zone, wherever you are."><Select {...scheduleForm.register("timezone")}>{TIME_ZONES.map((z) => <option key={z} value={z}>{z}</option>)}</Select></Field>
            <p className="text-[10px] text-slate-400">Leave the end date blank for an open-ended schedule.</p>
          </Card>
          <FormError form={scheduleForm} />
          <div className="flex gap-2"><Button type="button" variant="secondary" onClick={() => setPhase("target")}>Back</Button><SubmitButton form={scheduleForm} disabled={pending} pendingText="Checking…">Check Conflicts ›</SubmitButton></div>
        </form>
      )}

      {(phase === "confirm" || phase === "reviewSchedule") && (
        <div className="space-y-4 animate-fade-in">
          <BackLinkButton label={phase === "confirm" ? "Select Target" : "Configure Schedule"} onClick={() => setPhase(phase === "confirm" ? "target" : "schedule")} />
          <div><h1 className="text-xl font-bold tracking-tight text-slate-900">{phase === "confirm" ? "Confirm Publish" : "Review Schedule"}</h1><p className="text-xs text-slate-400">Review the details before confirming.</p></div>
          <Card className="p-4"><div className="text-xs font-semibold text-slate-900">Summary</div><dl className="mt-2 divide-y divide-slate-100 text-xs">{[...summary, ...(phase === "reviewSchedule" ? [["Start", when ? `${when.startDate} at ${when.startTime}` : "—"], ["End", when?.endDate ? `${when.endDate} at ${when.endTime || "23:59"}` : "Open-ended"], ["Timezone", when?.timezone ?? "—"]] as [string, string][] : [])].map(([k, v]) => <div key={k} className="flex justify-between py-2"><dt className="text-slate-400">{k}</dt><dd className="font-semibold text-slate-800">{v}</dd></div>)}</dl></Card>
          {phase === "reviewSchedule" && conflicts && (conflicts.length === 0 ? <Alert tone="green">No conflicts with existing schedules.</Alert> : <Alert tone="amber"><span className="font-semibold">{conflicts.length} overlapping schedule{conflicts.length > 1 ? "s" : ""}:</span> {conflicts.map((c) => `${c.playlistName} (${formatInZone(c.startsAt, when?.timezone ?? "UTC")}${c.endsAt ? ` – ${formatInZone(c.endsAt, when?.timezone ?? "UTC")}` : ""})`).join("; ")}. Resolve them before scheduling.</Alert>)}
          <div><div className="text-xs font-semibold text-slate-700">Screens affected</div><ul className="mt-2 space-y-1.5">{affected.map((s) => <li key={s.id} className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs"><span className={cn("h-2 w-2 rounded-full", s.status === "ONLINE" ? "bg-green-500" : "bg-red-500")} /><span className="font-semibold text-slate-900">{s.name}</span><span className="text-slate-400">{s.location ?? "—"}</span></li>)}</ul></div>
          {error && <Alert tone="red">{error}</Alert>}
          <div className="flex gap-2"><Button variant="secondary" onClick={() => setPhase(phase === "confirm" ? "target" : "schedule")} disabled={pending}>Back</Button><Button onClick={confirm} disabled={pending || (phase === "reviewSchedule" && (conflicts?.length ?? 0) > 0)}><Send className="h-3.5 w-3.5" /> {pending ? "Working…" : phase === "confirm" ? "Publish Now" : "Schedule"}</Button></div>
        </div>
      )}

      {phase === "done" && (
        <div className="flex flex-col items-center pt-6 text-center animate-fade-in">
          <SuccessIcon /><h1 className="mt-4 text-base font-semibold text-slate-900">{mode === "now" ? "Published!" : "Scheduled!"}</h1><p className="text-xs text-slate-400">{mode === "now" ? `Version ${result?.version} is on its way to your screens.` : `Goes live ${created ? formatInZone(created.startsAt, created.timezone || when?.timezone || "UTC") : "at the scheduled time"} (${created?.timezone ?? when?.timezone ?? "UTC"}).`}</p>
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
