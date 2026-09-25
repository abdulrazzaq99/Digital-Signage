"use client";
import { useAuth } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/button";
import { Badge, DotStatus } from "@/components/ui/badge";
import { Card, CardHeader } from "@/components/ui/card";
import { Alert } from "@/components/ui/misc";
import { QueryState, Skeleton, TableSkeleton } from "@/components/ui/query-state";
import { TD, TH, THead, TR, Table } from "@/components/ui/table";
import { useActivity } from "@/lib/api/hooks/activity";
import { useCompany } from "@/lib/api/hooks/companies";
import { useLicense } from "@/lib/api/hooks/licenses";
import { usePlaylists, usePublishPlaylist } from "@/lib/api/hooks/playlists";
import { screenStatusLabel, useScreens } from "@/lib/api/hooks/screens";
import type { ActivityEntry, Playlist, PublishResult, Screen } from "@/lib/api/types";
import { errorMessage, formatDateTime, formatDuration, timeAgo } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Calendar, Check, ChevronRight, ImageIcon, Link2, ListVideo, Monitor, MonitorOff, Send, UploadCloud } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { PublishOutcome } from "./publish-target";

function kindStyle(a: ActivityEntry): { icon: React.ReactNode; cls: string } {
  const [kind, verb] = (a.action ?? "").split(".");
  if (verb?.includes("publish")) return { icon: <Send className="h-3.5 w-3.5" />, cls: "bg-blue-50 text-blue-600" };
  if (kind === "screen" && verb?.includes("offline")) return { icon: <MonitorOff className="h-3.5 w-3.5" />, cls: "bg-red-50 text-red-600" };
  if (kind === "screen") return { icon: <Link2 className="h-3.5 w-3.5" />, cls: "bg-green-50 text-green-600" };
  if (kind === "media") return { icon: <UploadCloud className="h-3.5 w-3.5" />, cls: "bg-blue-50 text-blue-600" };
  if (kind === "schedule") return { icon: <Calendar className="h-3.5 w-3.5" />, cls: "bg-amber-50 text-amber-600" };
  return { icon: <ImageIcon className="h-3.5 w-3.5" />, cls: "bg-violet-50 text-violet-600" };
}

function QuickPublish() {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [screen, setScreen] = useState<Screen | null>(null);
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [result, setResult] = useState<PublishResult | null>(null);
  const [error, setError] = useState("");
  const screens = useScreens({ pageSize: 100 });
  const playlists = usePlaylists({ pageSize: 20 });
  const publish = usePublishPlaylist();
  const reset = () => { setStep(1); setScreen(null); setPlaylist(null); setResult(null); setError(""); };
  const go = () => { if (!screen || !playlist || publish.isPending) return; setError(""); publish.mutate({ id: playlist.id, screenIds: [screen.id], groupIds: [] }, { onSuccess: (r) => { setResult(r); setStep(4); }, onError: (e) => setError(errorMessage(e)) }); };
  return (
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
            <QueryState query={screens} skeleton={<TableSkeleton rows={3} />} empty={<p className="text-xs text-slate-400">No screens paired yet. <Link href="/portal/screens/pair" className="text-blue-600 hover:underline">Pair one →</Link></p>}>
              {({ data }) => <ul className="max-h-[420px] space-y-1.5 overflow-y-auto pr-1">{data.map((s) => <li key={s.id}><button onClick={() => { setScreen(s); setStep(2); }} className="flex w-full items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-left transition-colors hover:border-blue-300 hover:bg-blue-50/40"><span><span className="block text-xs font-semibold text-slate-900">{s.name}</span><span className="block text-[10px] text-slate-400">{s.location ?? "—"}</span></span><DotStatus status={screenStatusLabel(s.status)} /></button></li>)}</ul>}
            </QueryState>
          </div>
        )}
        {step === 2 && screen && (
          <div className="animate-fade-in">
            <p className="mb-2 text-[11px] text-slate-400">Publishing to <span className="font-semibold text-slate-700">{screen.name}</span></p>
            <QueryState query={playlists} skeleton={<TableSkeleton rows={3} />} empty={<p className="text-xs text-slate-400">No playlists yet. <Link href="/portal/playlists" className="text-blue-600 hover:underline">Create one →</Link></p>}>
              {({ data }) => <ul className="space-y-1.5">{data.every((p) => !p.itemCount) ? <li className="text-xs text-slate-400">Your playlists are empty. <Link href="/portal/playlists" className="text-blue-600 hover:underline">Add content →</Link></li> : data.filter((p) => p.itemCount > 0).map((p) => <li key={p.id}><button onClick={() => { setPlaylist(p); setStep(3); }} className="flex w-full items-center gap-3 rounded-lg border border-slate-200 px-3 py-2 text-left transition-colors hover:border-blue-300 hover:bg-blue-50/40"><span className="flex h-7 w-11 items-center justify-center rounded bg-slate-100 text-slate-400"><ListVideo className="h-3.5 w-3.5" /></span><span className="flex-1"><span className="block text-xs font-semibold text-slate-900">{p.name}</span><span className="block text-[10px] text-slate-400">{p.itemCount} items · {formatDuration(p.totalDurationSec)}</span></span><ChevronRight className="h-3.5 w-3.5 text-slate-300" /></button></li>)}</ul>}
            </QueryState>
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
            {error && <Alert tone="red">{error}</Alert>}
            <Button className="w-full" onClick={go} disabled={publish.isPending}><Send className="h-3.5 w-3.5" /> {publish.isPending ? "Publishing…" : "Publish Now"}</Button>
            <button onClick={() => setStep(2)} className="text-[11px] font-medium text-slate-500 hover:text-slate-800">‹ Back</button>
          </div>
        )}
        {step === 4 && screen && playlist && result && (
          <div className="flex flex-col items-center py-4 text-center animate-fade-in">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-green-50 text-green-600"><Check className="h-5 w-5" /></span>
            <div className="mt-3 text-sm font-semibold text-slate-900">Published</div>
            <p className="mt-1 text-[11px] text-slate-500"><span className="font-semibold text-slate-700">{playlist.name}</span> (v{result.version}) is on its way to {screen.name}.</p>
            <PublishOutcome screens={result.screens} />
            <Button variant="secondary" size="sm" className="mt-4" onClick={reset}>Start over</Button>
          </div>
        )}
      </div>
    </Card>
  );
}

export function OverviewPage() {
  const { user, companyId } = useAuth();
  const [showAll, setShowAll] = useState(false);
  const company = useCompany(companyId ?? "", { enabled: !!companyId });
  const license = useLicense(companyId ?? "", { enabled: !!companyId });
  const screens = useScreens({ pageSize: 100 });
  const activity = useActivity({ pageSize: 6 });
  const all = screens.data?.data ?? [];
  const online = all.filter((s) => s.status === "ONLINE").length;
  const offline = all.length - online;
  const rows = showAll ? all : all.slice(0, 5);

  return (
    <div className="space-y-5">
      <div><h1 className="text-xl font-bold tracking-tight text-slate-900">Welcome back{user?.name ? `, ${user.name.split(" ")[0]}` : ""}.</h1><p className="mt-0.5 text-sm text-slate-400">{company.data?.name ?? (company.isError ? "" : "…")}{license.data ? ` · ${license.data.paired} of ${license.data.screenLimit} screen licences used` : ""}</p></div>
      {license.data?.overLimit && <Alert tone="amber">Your account is over its licence limit ({license.data.paired} paired, {license.data.screenLimit} licensed). Pairing is blocked until it is raised.</Alert>}
      {license.data && license.data.state !== "ACTIVE" && <Alert tone="red">Your licence is {(license.data.state ?? "").toLowerCase()}. Publishing and pairing are unavailable — contact your account manager.</Alert>}

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { value: screens.isPending || screens.isError ? undefined : all.length, label: "Total Screens", icon: <Monitor className="h-4 w-4" />, cls: "border-slate-200", ic: "bg-blue-50 text-blue-600" },
          { value: screens.isPending || screens.isError ? undefined : online, label: "Online", icon: <Monitor className="h-4 w-4" />, cls: "border-slate-200", ic: "bg-green-50 text-green-600" },
          { value: screens.isPending || screens.isError ? undefined : offline, label: "Offline", icon: <MonitorOff className="h-4 w-4" />, cls: offline > 0 ? "border-red-200" : "border-slate-200", ic: "bg-red-50 text-red-600" },
        ].map((s) => (
          <Card key={s.label} className={cn("flex items-center gap-4 px-5 py-4", s.cls)}>
            <span className={cn("flex h-9 w-9 items-center justify-center rounded-lg", s.ic)}>{s.icon}</span>
            <div>{s.value === undefined ? (screens.isError ? <div className="text-2xl font-bold tracking-tight text-slate-300" title="Couldn't load screens">—</div> : <Skeleton className="h-7 w-10" />) : <div className="text-2xl font-bold tracking-tight text-slate-900">{s.value}</div>}<div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">{s.label}</div></div>
          </Card>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_300px]">
        <div className="space-y-5">
          <Card>
            <CardHeader title="Screen Status" action={<Link href="/portal/screens" className="text-xs font-medium text-blue-600 hover:underline">View all ›</Link>} />
            <QueryState query={screens} skeleton={<div className="p-4"><TableSkeleton rows={4} /></div>} empty={<div className="px-5 py-8 text-center text-xs text-slate-400">No screens paired yet. <Link href="/portal/screens/pair" className="text-blue-600 hover:underline">Pair your first screen →</Link></div>}>
              {() => (
                <>
                  <Table>
                    <THead><tr><TH>Screen</TH><TH>Location</TH><TH>Status</TH><TH>Content</TH><TH>Last Seen</TH></tr></THead>
                    <tbody>
                      {rows.map((s) => (
                        <TR key={s.id}>
                          <TD><Link href={`/portal/screens/${s.id}`} className="text-sm font-semibold text-slate-900 hover:text-blue-600 whitespace-nowrap">{s.name}</Link></TD>
                          <TD className="text-xs whitespace-nowrap">{s.location ?? "—"}</TD>
                          <TD><DotStatus status={screenStatusLabel(s.status)} /></TD>
                          <TD className="text-xs whitespace-nowrap">{s.assignment?.name ?? "—"}</TD>
                          <TD className="text-xs text-slate-400 whitespace-nowrap">{timeAgo(s.lastSeenAt)}</TD>
                        </TR>
                      ))}
                    </tbody>
                  </Table>
                  {all.length > 5 && <div className="border-t border-slate-100 px-5 py-2.5"><button onClick={() => setShowAll((v) => !v)} className="text-xs font-medium text-slate-500 hover:text-slate-800">{showAll ? "Show fewer screens" : `Show ${all.length - 5} more screens`}</button></div>}
                </>
              )}
            </QueryState>
          </Card>

          <Card>
            <CardHeader title="Recent Activity" />
            <QueryState query={activity} skeleton={<div className="p-4"><TableSkeleton rows={4} /></div>} empty={<div className="px-5 py-8 text-center text-xs text-slate-400">No activity yet.</div>}>
              {({ data }) => (
                <ul className="divide-y divide-slate-100">
                  {data.map((a) => { const k = kindStyle(a); return (
                    <li key={a.id} className="flex items-center gap-3 px-5 py-3">
                      <span className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-md", k.cls)}>{k.icon}</span>
                      <span className="min-w-0 flex-1 truncate text-sm text-slate-800">{a.summary}</span>
                      <span className="shrink-0 text-[11px] text-slate-400" title={formatDateTime(a.createdAt)}>{timeAgo(a.createdAt)}</span>
                      {a.status === "FAILED" && <Badge tone="red">Failed</Badge>}
                    </li>
                  ); })}
                </ul>
              )}
            </QueryState>
          </Card>
        </div>

        <QuickPublish />
      </div>
    </div>
  );
}
