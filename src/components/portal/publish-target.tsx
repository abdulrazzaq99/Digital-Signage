"use client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { SuccessIcon } from "@/components/ui/misc";
import { ErrorState, TableSkeleton } from "@/components/ui/query-state";
import { useGroups } from "@/lib/api/hooks/groups";
import { useScreens } from "@/lib/api/hooks/screens";
import type { PublishResult, Screen } from "@/lib/api/types";
import { errorMessage } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Send } from "lucide-react";
import { useState } from "react";
import { BackLinkButton } from "./portal-stepper";

export type PublishTargetSelection = { screenIds: string[]; groupIds: string[] };
type Target = { kind: "screen" | "group"; id: string };

/** Sync status of a screen right after publishing: online players receive the update at once, others when they reconnect. */
export function PublishOutcome({ screens }: { screens: PublishResult["screens"] }) {
  return (
    <ul className="mt-5 w-full space-y-2">
      {screens.map((s) => {
        const online = s.status === "ONLINE";
        return (
          <li key={s.id} className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-xs">
            <span><span className="block font-semibold text-slate-900">{s.name}</span>{!online && <span className="block text-[10px] text-slate-400">Update pending — will sync when the screen reconnects.</span>}</span>
            <Badge tone={online ? "green" : "amber"} dot>{online ? "Syncing" : "Pending"}</Badge>
          </li>
        );
      })}
    </ul>
  );
}

/**
 * Pick one screen or one group, review, publish. `onPublish` performs the API call and returns the
 * result so this component stays independent of what is being published (playlist, layout, template).
 */
export function PublishTarget({ subject, companyId, onBack, onDone, onPublish }: { subject: string; companyId?: string | null; onBack: () => void; onDone: () => void; onPublish: (sel: PublishTargetSelection) => Promise<PublishResult> }) {
  const screens = useScreens({ pageSize: 100 }, { companyId });
  const groups = useGroups({ companyId });
  const [target, setTarget] = useState<Target | null>(null);
  const [phase, setPhase] = useState<"select" | "confirm" | "done">("select");
  const [result, setResult] = useState<PublishResult | null>(null);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  const all: Screen[] = screens.data?.data ?? [];
  const group = target?.kind === "group" ? groups.data?.data.find((g) => g.id === target.id) : undefined;
  const affected = target?.kind === "screen" ? all.filter((s) => s.id === target.id) : all.filter((s) => (group?.screenIds ?? []).includes(s.id));
  const targetName = target?.kind === "screen" ? affected[0]?.name : group?.name;
  const Radio = ({ on }: { on: boolean }) => <span className={cn("flex h-4 w-4 items-center justify-center rounded-full border", on ? "border-blue-600" : "border-slate-300")}>{on && <span className="h-2 w-2 rounded-full bg-blue-600" />}</span>;

  const publish = async () => {
    if (!target || pending) return;
    setPending(true);
    setError("");
    try {
      const r = await onPublish(target.kind === "screen" ? { screenIds: [target.id], groupIds: [] } : { screenIds: [], groupIds: [target.id] });
      setResult(r);
      setPhase("done");
    } catch (e) { setError(errorMessage(e)); } finally { setPending(false); }
  };

  if (phase === "done" && result) {
    return (
      <div className="flex max-w-[480px] flex-col items-center pt-6 text-center animate-fade-in">
        <SuccessIcon /><h1 className="mt-4 text-base font-semibold text-slate-900">Published!</h1><p className="text-xs text-slate-400">Version {result.version} is on its way to your screens.</p>
        <PublishOutcome screens={result.screens} />
        <Button className="mt-4 w-full max-w-[160px]" onClick={onDone}>Done</Button>
      </div>
    );
  }

  if (phase === "confirm") {
    return (
      <div className="max-w-[480px] space-y-4 animate-fade-in">
        <BackLinkButton label="Select Target" onClick={() => setPhase("select")} />
        <div><h1 className="text-xl font-bold tracking-tight text-slate-900">Confirm Publish</h1><p className="text-xs text-slate-400">Publishing <span className="font-semibold text-slate-700">{subject}</span> to <span className="font-semibold text-slate-700">{targetName}</span></p></div>
        <ul className="space-y-1.5">{affected.map((s) => <li key={s.id} className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs"><span className="flex items-center gap-2"><span className={cn("h-2 w-2 rounded-full", s.status === "ONLINE" ? "bg-green-500" : "bg-slate-300")} /><span><span className="block font-semibold text-slate-900">{s.name}</span><span className="block text-[10px] text-slate-400">{s.location ?? "—"}</span></span></span>{s.status !== "ONLINE" && <span className="text-[10px] italic text-slate-400">Will sync when online</span>}</li>)}</ul>
        {error && <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">{error}</p>}
        <div className="flex gap-2"><Button variant="secondary" onClick={() => setPhase("select")} disabled={pending}>Back</Button><Button onClick={publish} disabled={pending}><Send className="h-3.5 w-3.5" /> {pending ? "Publishing…" : "Publish Now"}</Button></div>
      </div>
    );
  }

  return (
    <div className="max-w-[520px] space-y-4 animate-fade-in">
      <BackLinkButton label="Back" onClick={onBack} />
      <div><h1 className="text-xl font-bold tracking-tight text-slate-900">Publish — {subject}</h1><p className="text-xs text-slate-400">Choose a screen or group to publish to.</p></div>
      <Card className="p-4">
        {/* Each list shows its own loading / error-with-Retry, so a failed request never reads as "no screens". */}
        <>
            <div className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">Screens</div>
            {screens.isError ? <ErrorState error={screens.error} onRetry={() => screens.refetch()} className="mt-2 p-4" /> : screens.isPending ? <div className="mt-2"><TableSkeleton rows={3} /></div> : <>
            <ul className="mt-2 space-y-1.5">{all.map((s) => { const on = target?.kind === "screen" && target.id === s.id; return <li key={s.id}><button type="button" onClick={() => setTarget({ kind: "screen", id: s.id })} className={cn("flex w-full items-center gap-3 rounded-lg border px-3 py-2 text-left", on ? "border-blue-300 bg-blue-50/40" : "border-slate-200 hover:bg-slate-50")}><span className={cn("h-2 w-2 rounded-full", s.status === "ONLINE" ? "bg-green-500" : s.status === "OFFLINE" ? "bg-slate-300" : "bg-red-500")} /><span className="flex-1"><span className="block text-xs font-semibold text-slate-900">{s.name}</span><span className="block text-[10px] text-slate-400">{s.location ?? "—"}</span></span><Radio on={on} /></button></li>; })}</ul>
            {all.length === 0 && <p className="mt-2 text-xs text-slate-400">No screens paired yet.</p>}
            </>}
            <div className="mt-4 text-[9px] font-semibold uppercase tracking-wider text-slate-400">Groups</div>
            {groups.isError ? <ErrorState error={groups.error} onRetry={() => groups.refetch()} className="mt-2 p-4" /> : groups.isPending ? <div className="mt-2"><TableSkeleton rows={2} /></div> : <>
            <ul className="mt-2 space-y-1.5">{(groups.data?.data ?? []).map((g) => { const on = target?.kind === "group" && target.id === g.id; return <li key={g.id}><button type="button" onClick={() => setTarget({ kind: "group", id: g.id })} disabled={g.screenCount === 0} className={cn("flex w-full items-center gap-3 rounded-lg border px-3 py-2 text-left disabled:opacity-50", on ? "border-blue-300 bg-blue-50/40" : "border-slate-200 hover:bg-slate-50")}><span className="flex-1"><span className="block text-xs font-semibold text-slate-900">{g.name}</span><span className="block text-[10px] text-slate-400">{g.screenCount} screens</span></span><Radio on={on} /></button></li>; })}</ul>
            {(groups.data?.data ?? []).length === 0 && <p className="mt-2 text-xs text-slate-400">No screen groups yet.</p>}
            </>}
        </>
      </Card>
      <div className="flex gap-2"><Button variant="secondary" onClick={onBack}>Cancel</Button><Button onClick={() => setPhase("confirm")} disabled={!target}>Review</Button></div>
    </div>
  );
}
