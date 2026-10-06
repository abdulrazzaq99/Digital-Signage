"use client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SuccessIcon } from "@/components/ui/misc";
import { EmptyState, QueryState, TableSkeleton } from "@/components/ui/query-state";
import { useGroup } from "@/lib/api/hooks/groups";
import { usePlaylists, usePublishPlaylist } from "@/lib/api/hooks/playlists";
import { useScreen } from "@/lib/api/hooks/screens";
import type { Playlist, PublishResult } from "@/lib/api/types";
import { errorMessage, formatDuration } from "@/lib/format";
import { ChevronRight, ListVideo, Monitor, Send } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { QueryNotice } from "@/components/screens/query-guards";
import { BackLinkButton, PortalStepper } from "./portal-stepper";
import { PublishOutcome } from "./publish-target";

/** Publish a playlist to one screen, or to the screen's group when `?group=` is present. */
export function ScreenPublish({ id, companyId, basePath = "/portal/screens" }: { id: string; companyId?: string | null; basePath?: string }) {
  const router = useRouter();
  const sp = useSearchParams();
  const groupId = sp.get("group") ?? "";
  const screen = useScreen(id, { companyId });
  const group = useGroup(groupId, { companyId, enabled: !!groupId });
  const playlists = usePlaylists({ pageSize: 50 }, { companyId });
  const publish = usePublishPlaylist(companyId);
  const [step, setStep] = useState(1);
  const [pick, setPick] = useState<Playlist | null>(null);
  const [result, setResult] = useState<PublishResult | null>(null);
  const [error, setError] = useState("");
  const back = groupId ? `${basePath}?tab=groups` : `${basePath}/${id}`;
  const target = groupId ? { name: group.data?.name ?? "…", sub: `${group.data?.screenCount ?? 0} screens` } : { name: screen.data?.name ?? "…", sub: screen.data?.location ?? "" };

  const targetQuery = groupId ? group : screen;
  const go = async () => {
    if (!pick || publish.isPending) return;
    setError("");
    try {
      setResult(await publish.mutateAsync(groupId ? { id: pick.id, screenIds: [], groupIds: [groupId] } : { id: pick.id, screenIds: [id], groupIds: [] }));
      setStep(3);
    } catch (e) { setError(errorMessage(e)); }
  };

  return (
    <div className="space-y-5">
      <BackLinkButton label="Back" onClick={() => (step === 1 || step === 3 ? router.push(back) : setStep(step - 1))} />
      <PortalStepper steps={["Content", "Review", "Done"]} current={step} className="max-w-md" />

      {step === 1 && (
        <Card className="max-w-[560px] animate-fade-in">
          <div className="border-b border-slate-100 px-5 py-3 text-sm font-semibold text-slate-900">Choose Playlist</div>
          <div className="space-y-3 px-5 py-4">
            <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600"><Monitor className="h-3.5 w-3.5 text-slate-400" /> Publishing to: <span className="font-semibold text-slate-800">{target.name}</span></div>
            <QueryNotice query={targetQuery} what={groupId ? "the group" : "the screen"} />
            <QueryState query={playlists} skeleton={<TableSkeleton rows={4} />} empty={<EmptyState icon={<ListVideo className="h-5 w-5" />} title="No playlists yet" body="Create a playlist with at least one media item first." action={<Button href={basePath.replace("/screens", "/playlists")}>Go to Playlists</Button>} />}>
              {({ data }) => (
                <ul className="space-y-1.5">
                  {data.map((p) => (
                    <li key={p.id}>
                      <button type="button" disabled={p.itemCount === 0} onClick={() => { setPick(p); setStep(2); }} className="flex w-full items-center gap-3 rounded-lg border border-slate-200 px-3 py-2.5 text-left transition-colors hover:border-blue-300 hover:bg-blue-50/40 disabled:opacity-50 disabled:hover:border-slate-200 disabled:hover:bg-transparent">
                        <PlaylistThumb playlist={p} />
                        <span className="flex-1"><span className="block text-sm font-semibold text-slate-900">{p.name}</span><span className="block text-[11px] text-slate-400">{p.itemCount} items · {formatDuration(p.totalDurationSec)}{p.itemCount === 0 && " · empty"}</span></span>
                        <ChevronRight className="h-4 w-4 text-slate-300" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </QueryState>
          </div>
        </Card>
      )}

      {step === 2 && pick && (
        <Card className="max-w-[560px] animate-fade-in">
          <div className="border-b border-slate-100 px-5 py-3 text-sm font-semibold text-slate-900">Review &amp; Publish</div>
          <div className="space-y-4 px-5 py-4">
            <dl className="divide-y divide-slate-100 rounded-lg border border-slate-200 bg-slate-50/60 px-4 text-xs">
              <div className="flex justify-between gap-6 py-3"><dt className="text-slate-400">Destination</dt><dd className="text-right"><span className="block font-semibold text-slate-900">{target.name}</span><span className="block text-[10px] text-slate-400">{target.sub}</span></dd></div>
              <div className="flex justify-between gap-6 py-3"><dt className="text-slate-400">Playlist</dt><dd className="text-right"><span className="block font-semibold text-slate-900">{pick.name}</span><span className="block text-[10px] text-slate-400">{pick.itemCount} items · {formatDuration(pick.totalDurationSec)}</span></dd></div>
              <div className="flex justify-between gap-6 py-3"><dt className="text-slate-400">Action</dt><dd className="font-semibold text-slate-900">Publish immediately</dd></div>
            </dl>
            {error && <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">{error}</p>}
            <div className="flex gap-2"><Button variant="secondary" onClick={() => setStep(1)} disabled={publish.isPending}>← Back</Button><Button className="flex-1" onClick={go} disabled={publish.isPending || !targetQuery.data}><Send className="h-3.5 w-3.5" /> {publish.isPending ? "Publishing…" : "Publish Now"}</Button></div>
          </div>
        </Card>
      )}

      {step === 3 && pick && result && (
        <Card className="flex max-w-[560px] flex-col items-center px-6 py-10 text-center animate-fade-in">
          <SuccessIcon />
          <h2 className="mt-4 text-base font-semibold text-slate-900">Published</h2>
          <p className="mt-1 text-xs text-slate-500"><span className="font-semibold text-slate-800">{pick.name}</span> (v{result.version}) is on its way to <span className="font-semibold text-slate-800">{target.name}</span>.</p>
          <PublishOutcome screens={result.screens} />
          <Button className="mt-5" onClick={() => router.push(back)}>Done</Button>
        </Card>
      )}
    </div>
  );
}

/** First item thumbnail when the playlist detail is loaded; list rows don't carry items, so fall back to an icon. */
export function PlaylistThumb({ playlist, className = "h-8 w-12" }: { playlist: Playlist; className?: string }) {
  const url = playlist.items?.[0]?.asset.thumbnailUrl;
  return url ? <img src={url} alt="" className={`${className} rounded object-cover`} /> : <span className={`${className} flex items-center justify-center rounded bg-slate-100 text-slate-400`}><ListVideo className="h-4 w-4" /></span>;
}
