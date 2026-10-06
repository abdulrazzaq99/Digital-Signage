"use client";
import { PublishOutcome } from "@/components/portal/publish-target";
import { Button } from "@/components/ui/button";
import { DotStatus } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/input";
import { Modal, ModalHeader } from "@/components/ui/modal";
import { SectionLabel } from "@/components/ui/card";
import { Alert, Stepper, SuccessIcon } from "@/components/ui/misc";
import { ErrorState, TableSkeleton } from "@/components/ui/query-state";
import { useGroups } from "@/lib/api/hooks/groups";
import { usePlaylists, usePublishPlaylist } from "@/lib/api/hooks/playlists";
import { screenStatusLabel, useScreens } from "@/lib/api/hooks/screens";
import type { Playlist, PublishResult } from "@/lib/api/types";
import { errorMessage, formatDuration } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Check, Info, ListVideo, Monitor, Send } from "lucide-react";
import { useState } from "react";

type TargetMode = "single" | "multiple" | "group";
type Phase = "target" | "content" | "review" | "done";

/**
 * Super Admin publish flow for one company: pick screens or a group, pick a playlist, publish.
 * `companyId` scopes every read and the publish call (sent as X-Company-Id).
 */
export function PublishModal({ open, onClose, companyId, defaultScreen, defaultGroup }: { open: boolean; onClose: () => void; companyId: string; defaultScreen?: string; defaultGroup?: string }) {
  const [phase, setPhase] = useState<Phase>("target");
  const [mode, setMode] = useState<TargetMode>(defaultGroup ? "group" : "single");
  const [single, setSingle] = useState(defaultScreen ?? "");
  const [multi, setMulti] = useState<string[]>([]);
  const [group, setGroup] = useState(defaultGroup ?? "");
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [result, setResult] = useState<PublishResult | null>(null);
  const [error, setError] = useState("");
  const screens = useScreens({ pageSize: 100 }, { companyId, enabled: open });
  const groups = useGroups({ companyId, enabled: open });
  const playlists = usePlaylists({ pageSize: 100 }, { companyId, enabled: open });
  const publish = usePublishPlaylist(companyId);

  const close = () => { if (publish.isPending) return; onClose(); setTimeout(() => { setPhase("target"); setResult(null); setError(""); setPlaylist(null); }, 200); };
  const stepIndex = phase === "target" ? 1 : phase === "content" ? 2 : 3;
  // The list being picked from; its failure shows an error with Retry rather than "no screens".
  const targetQuery = mode === "group" ? groups : screens;
  const screenList = screens.data?.data ?? [];
  const groupList = groups.data?.data ?? [];
  const chosenGroup = groupList.find((g) => g.id === group);
  const targetLabel = mode === "single" ? screenList.find((s) => s.id === single)?.name ?? "—" : mode === "multiple" ? `${multi.length} screens` : `${chosenGroup?.name ?? "—"} (group)`;
  const targetCount = mode === "single" ? 1 : mode === "multiple" ? multi.length : chosenGroup?.screenCount ?? 0;
  const targetValid = mode === "single" ? !!single : mode === "multiple" ? multi.length > 0 : !!group;

  const go = async () => {
    if (!playlist || publish.isPending) return;
    setError("");
    try {
      setResult(await publish.mutateAsync({ id: playlist.id, screenIds: mode === "single" ? [single] : mode === "multiple" ? multi : [], groupIds: mode === "group" ? [group] : [] }));
      setPhase("done");
    } catch (e) { setError(errorMessage(e)); }
  };

  return (
    <Modal open={open} onClose={close} width="max-w-[580px]">
      <ModalHeader title="Publish Content" onClose={close} />
      {phase !== "done" && <div className="px-6 pt-4"><Stepper steps={["Select Target", "Select Content", "Review & Publish"]} current={stepIndex} compact /></div>}

      {phase === "target" && (
        <div className="animate-fade-in">
          <div className="px-6 pt-5">
            <div className="grid grid-cols-3 rounded-lg border border-slate-200 bg-slate-50 p-1 text-xs font-medium">
              {([["single", "Single Screen"], ["multiple", "Multiple Screens"], ["group", "Screen Group"]] as [TargetMode, string][]).map(([v, l]) => (
                <button key={v} type="button" onClick={() => setMode(v)} className={cn("h-8 rounded-md transition-colors", mode === v ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-800")}>{l}</button>
              ))}
            </div>
          </div>
          <div className="max-h-[280px] space-y-2 overflow-y-auto px-6 py-4">
            {targetQuery.isError ? <ErrorState error={targetQuery.error} onRetry={() => targetQuery.refetch()} className="p-4" /> : targetQuery.isPending ? <TableSkeleton rows={4} /> : mode === "group" ? (groupList.length ? groupList.map((g) => (
              <button key={g.id} type="button" onClick={() => setGroup(g.id)} disabled={g.screenCount === 0} className={cn("flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors disabled:opacity-50", group === g.id ? "border-blue-300 bg-blue-50/50" : "border-slate-200 hover:bg-slate-50")}>
                <span className="flex h-8 w-12 items-center justify-center rounded bg-slate-100 text-slate-400"><Monitor className="h-4 w-4" /></span>
                <span className="flex-1"><span className="block text-sm font-semibold text-slate-900">{g.name}</span><span className="block text-[11px] text-slate-400">{g.screenCount} screen{g.screenCount === 1 ? "" : "s"} · {g.onlineCount} online</span></span>
              </button>
            )) : <p className="text-xs text-slate-400">This company has no screen groups.</p>) : (screenList.length ? screenList.map((s) => {
              const selected = mode === "single" ? single === s.id : multi.includes(s.id);
              const toggle = () => mode === "single" ? setSingle(s.id) : setMulti((m) => m.includes(s.id) ? m.filter((x) => x !== s.id) : [...m, s.id]);
              return (
                <div role="button" tabIndex={0} key={s.id} onClick={toggle} onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && toggle()} className={cn("flex w-full cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors", selected ? "border-blue-300 bg-blue-50/50" : "border-slate-200 hover:bg-slate-50")}>
                  {mode === "multiple" && <Checkbox checked={selected} />}
                  <span className="flex h-8 w-12 shrink-0 items-center justify-center overflow-hidden rounded bg-slate-900 text-slate-500">{s.assignment?.thumbnailUrl ? <img src={s.assignment.thumbnailUrl} alt="" className="h-full w-full object-cover" /> : <Monitor className="h-3.5 w-3.5" />}</span>
                  <span className="flex-1"><span className="block text-sm font-semibold text-slate-900">{s.name}</span><span className="block text-[11px] text-slate-400">{s.location ?? "—"}{s.assignment ? ` · ${s.assignment.name}` : ""}</span></span>
                  <DotStatus status={screenStatusLabel(s.status)} />
                </div>
              );
            }) : <p className="text-xs text-slate-400">This company has no paired screens.</p>)}
          </div>
          <div className="flex justify-end px-6 pb-6"><Button onClick={() => setPhase("content")} disabled={!targetValid}>Continue ›</Button></div>
        </div>
      )}

      {phase === "content" && (
        <div className="animate-fade-in">
          <div className="px-6 pt-5 text-xs text-slate-500">Choose the playlist to send to <span className="font-semibold text-slate-800">{targetLabel}</span>.</div>
          <div className="max-h-[300px] space-y-2 overflow-y-auto px-6 py-4">
            {playlists.isError ? <ErrorState error={playlists.error} onRetry={() => playlists.refetch()} className="p-4" /> : playlists.isPending ? <TableSkeleton rows={4} /> : (playlists.data?.data ?? []).length ? playlists.data!.data.map((p) => (
              <button key={p.id} type="button" onClick={() => setPlaylist(p)} disabled={p.itemCount === 0} className={cn("flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors disabled:opacity-50", playlist?.id === p.id ? "border-blue-400 bg-blue-50/50 ring-2 ring-blue-500/20" : "border-slate-200 hover:border-slate-300")}>
                <span className="flex h-8 w-12 items-center justify-center rounded bg-slate-100 text-slate-400"><ListVideo className="h-4 w-4" /></span>
                <span className="flex-1"><span className="block text-sm font-semibold text-slate-900">{p.name}</span><span className="block text-[11px] text-slate-400">{p.itemCount} item{p.itemCount === 1 ? "" : "s"} · {formatDuration(p.totalDurationSec)}{p.itemCount === 0 ? " · empty" : ""}</span></span>
                {playlist?.id === p.id && <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-white"><Check className="h-3 w-3" /></span>}
              </button>
            )) : <p className="text-xs text-slate-400">This company has no playlists yet.</p>}
          </div>
          <div className="flex justify-between px-6 pb-6"><Button variant="secondary" onClick={() => setPhase("target")}>Back</Button><Button onClick={() => setPhase("review")} disabled={!playlist}>Review ›</Button></div>
        </div>
      )}

      {phase === "review" && playlist && (
        <div className="animate-fade-in">
          <div className="space-y-3 px-6 py-5">
            <div className="rounded-lg border border-slate-200 px-4 py-3">
              <SectionLabel>Target</SectionLabel>
              <div className="mt-2 flex items-center gap-3"><span className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-100 text-slate-500"><Monitor className="h-4 w-4" /></span><div><div className="text-sm font-semibold text-slate-900">{targetLabel}</div><div className="text-[11px] text-slate-400">{targetCount} screen{targetCount === 1 ? "" : "s"} will receive this content</div></div></div>
            </div>
            <div className="rounded-lg border border-slate-200 px-4 py-3">
              <SectionLabel>Content</SectionLabel>
              <div className="mt-2 flex items-center gap-3"><span className="flex h-8 w-12 items-center justify-center rounded bg-slate-100 text-slate-400"><ListVideo className="h-4 w-4" /></span><div><div className="text-sm font-semibold text-slate-900">{playlist.name}</div><div className="text-[11px] text-slate-400">Playlist · {playlist.itemCount} items · {formatDuration(playlist.totalDurationSec)}</div></div></div>
            </div>
            <Alert tone="blue" icon={<Info className="h-3.5 w-3.5 shrink-0" />}>Content is queued and synced immediately. Offline screens receive the update when they reconnect.</Alert>
            {error && <Alert tone="red">{error}</Alert>}
          </div>
          <div className="flex justify-between px-6 pb-6"><Button variant="secondary" onClick={() => setPhase("content")} disabled={publish.isPending}>Back</Button><Button onClick={go} disabled={publish.isPending}><Send className="h-3.5 w-3.5" /> {publish.isPending ? "Publishing…" : "Publish Now"}</Button></div>
        </div>
      )}

      {phase === "done" && playlist && result && (
        <div className="flex flex-col items-center px-6 py-8 text-center animate-fade-in">
          <SuccessIcon />
          <h3 className="mt-4 text-base font-semibold text-slate-900">Content published</h3>
          <p className="mt-1 text-xs text-slate-600"><span className="font-semibold">&quot;{playlist.name}&quot;</span> (v{result.version}) has been sent to {targetLabel}.</p>
          <PublishOutcome screens={result.screens} />
          <Button className="mt-5" onClick={close}>Done</Button>
        </div>
      )}
    </Modal>
  );
}
