"use client";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader } from "@/components/ui/card";
import { QueryState, Skeleton } from "@/components/ui/query-state";
import { useActivity } from "@/lib/api/hooks/activity";
import { counts, useCompanies } from "@/lib/api/hooks/companies";
import { useLicenses } from "@/lib/api/hooks/licenses";
import { useScreens } from "@/lib/api/hooks/screens";
import type { ActivityEntry, Company } from "@/lib/api/types";
import { maskEmailsIn } from "@/components/activity/redact";
import { formatDateTime, label, timeAgo } from "@/lib/format";
import { cn } from "@/lib/utils";
import { AlertTriangle, Building2, ChevronRight, FileBadge, ListVideo, Monitor, MonitorOff, Plus, RefreshCw, Upload, UploadCloud, Wifi } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const quick = [
  { title: "Add Company", sub: "Create a new tenant", href: "/companies", icon: <Building2 className="h-4 w-4" /> },
  { title: "Pair Screen", sub: "Add a signage device", href: "/screens", icon: <Monitor className="h-4 w-4" /> },
  { title: "Upload Media", sub: "Add to a media library", href: "/media", icon: <Upload className="h-4 w-4" /> },
];

function SegBar({ online, syncing, offline, className }: { online: number; syncing: number; offline: number; className?: string }) {
  const t = Math.max(1, online + syncing + offline);
  return (
    <div className={cn("flex h-1.5 w-full overflow-hidden rounded-full bg-slate-100", className)}>
      <div className="bg-green-500" style={{ width: `${(online / t) * 100}%` }} />
      <div className="bg-amber-400" style={{ width: `${(syncing / t) * 100}%` }} />
      <div className="bg-red-300" style={{ width: `${(offline / t) * 100}%` }} />
    </div>
  );
}

/** Icon for an activity entry from its action prefix (`screen.paired`, `playlist.published`, …). */
function activityIcon(a: ActivityEntry) {
  const [kind, verb] = (a.action ?? "").split(".");
  if (kind === "screen") return verb?.includes("offline") ? { icon: <MonitorOff className="h-3.5 w-3.5" />, cls: "bg-red-50 text-red-600", alert: true } : { icon: <Monitor className="h-3.5 w-3.5" />, cls: "bg-green-50 text-green-600", alert: false };
  if (kind === "playlist" || kind === "layout" || kind === "template_instance") return { icon: <ListVideo className="h-3.5 w-3.5" />, cls: "bg-blue-50 text-blue-600", alert: false };
  if (kind === "media") return { icon: <UploadCloud className="h-3.5 w-3.5" />, cls: "bg-blue-50 text-blue-600", alert: false };
  if (kind === "company") return { icon: <Building2 className="h-3.5 w-3.5" />, cls: "bg-blue-50 text-blue-600", alert: false };
  if (kind === "license") return { icon: <FileBadge className="h-3.5 w-3.5" />, cls: "bg-violet-50 text-violet-600", alert: false };
  return { icon: <RefreshCw className="h-3.5 w-3.5" />, cls: "bg-slate-100 text-slate-500", alert: a.status === "FAILED" };
}

/** Platform totals from list metadata: one tiny query per figure (no aggregate endpoint). */
function useTotals() {
  const companies = useCompanies({ pageSize: 1 });
  const screens = useScreens({ pageSize: 1 });
  const online = useScreens({ status: "ONLINE", pageSize: 1 });
  const offline = useScreens({ status: "OFFLINE", pageSize: 1 });
  const error = useScreens({ status: "ERROR", pageSize: 1 });
  const n = (q: { data?: { meta?: { total: number } } }) => q.data?.meta?.total;
  // A failed figure shows "—" (with a retry) instead of a skeleton that never resolves.
  const all = [companies, screens, online, offline, error];
  return { companies: n(companies), screens: n(screens), online: n(online), offline: n(offline), error: n(error), pending: companies.isPending || screens.isPending, failed: all.some((q) => q.isError), retry: () => all.forEach((q) => q.isError && void q.refetch()) };
}

export function OverviewPage() {
  const totals = useTotals();
  const companies = useCompanies({ pageSize: 100 });
  const licenses = useLicenses();
  const activity = useActivity({ pageSize: 8 });
  const [actFilter, setActFilter] = useState<"all" | "alerts">("all");
  const availability = totals.screens ? Math.round(((totals.online ?? 0) / totals.screens) * 100) : 0;
  const attention: { id: string; kind: "offline" | "licenses" | "overLimit"; title: string; company: Company; sub: string; href: string; critical?: boolean }[] = [];
  for (const c of companies.data?.data ?? []) {
    const k = counts(c);
    if (k.offline > 0) attention.push({ id: `off-${c.id}`, kind: "offline", title: `${k.offline} screen${k.offline > 1 ? "s" : ""} offline`, company: c, sub: `${k.online} online of ${k.screens}`, href: `/screens?company=${c.id}`, critical: k.online === 0 && k.screens > 0 });
    if (c.overLimit) attention.push({ id: `lim-${c.id}`, kind: "overLimit", title: "Over licence limit", company: c, sub: `${k.screens} paired · ${c.license?.screenLimit ?? 0} licensed`, href: `/licenses/${c.id}`, critical: true });
    else if (c.license && c.license.state !== "ACTIVE") attention.push({ id: `lic-${c.id}`, kind: "licenses", title: `Licence ${label(c.license.state).toLowerCase()}`, company: c, sub: "Publishing and pairing blocked", href: `/licenses/${c.id}` });
  }
  const critical = attention.filter((a) => a.critical).length;
  const attnStyle = { offline: { icon: <MonitorOff className="h-3.5 w-3.5" />, iconCls: "border-red-200 bg-red-50 text-red-600", btn: "border-red-200 bg-red-50 text-red-600 hover:bg-red-100" }, licenses: { icon: <FileBadge className="h-3.5 w-3.5" />, iconCls: "border-violet-200 bg-violet-50 text-violet-600", btn: "border-violet-200 bg-violet-50 text-violet-600 hover:bg-violet-100" }, overLimit: { icon: <AlertTriangle className="h-3.5 w-3.5" />, iconCls: "border-amber-200 bg-amber-50 text-amber-600", btn: "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100" } };
  const stats = [
    { value: totals.screens, label: "Total Screens", sub: "Across all tenants", icon: <Monitor className="h-4 w-4" />, bg: "bg-blue-50 text-blue-600" },
    { value: totals.online, label: "Screens Online", sub: `${availability}% availability`, icon: <Wifi className="h-4 w-4" />, bg: "bg-green-50 text-green-600" },
    { value: totals.offline, label: "Screens Offline", sub: "No recent heartbeat", icon: <MonitorOff className="h-4 w-4" />, bg: "bg-red-50 text-red-600" },
    { value: totals.companies, label: "Companies", sub: `${licenses.isError ? "—" : licenses.data?.data?.filter((l) => l.state === "ACTIVE").length ?? "…"} active licences`, icon: <Building2 className="h-4 w-4" />, bg: "bg-blue-50 text-blue-600" },
  ];

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label} className="px-5 py-4">
            <div className={`mb-3 flex h-8 w-8 items-center justify-center rounded-lg ${s.bg}`}>{s.icon}</div>
            {s.value === undefined ? (totals.failed ? <button type="button" onClick={totals.retry} className="text-2xl font-bold tracking-tight text-slate-400" title="Couldn't load. Click to retry">—</button> : <Skeleton className="h-8 w-16" />) : <div className="text-2xl font-bold tracking-tight text-slate-900">{s.value}</div>}
            <div className="text-sm font-medium text-slate-700">{s.label}</div>
            <div className="text-xs text-slate-400">{s.sub}</div>
          </Card>
        ))}
      </div>

      {attention.length > 0 && (
        <Card>
          <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-600"><AlertTriangle className="h-4 w-4" /></span>
            <div><div className="flex items-center gap-2 text-sm font-semibold text-slate-900">Needs Attention {critical > 0 && <Badge tone="red" className="bg-red-600 text-white border-red-600">{critical} critical</Badge>}</div><div className="text-xs text-slate-400">Derived from live screen status and licence state</div></div>
          </div>
          <ul className="divide-y divide-slate-100">
            {attention.slice(0, 8).map((a) => (
              <li key={a.id} className="flex items-center gap-3 px-5 py-3">
                <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border", attnStyle[a.kind].iconCls)}>{attnStyle[a.kind].icon}</span>
                <div className="min-w-0 flex-1"><div className="flex items-center gap-2 text-sm font-semibold text-slate-900">{a.title}{a.critical && <Badge tone="red">CRITICAL</Badge>}</div><div className="text-[11px] text-slate-400">{a.company.name} · {a.sub}</div></div>
                <Link href={a.href} className={cn("h-7 rounded-md border px-3 text-xs font-medium leading-7 transition-colors", attnStyle[a.kind].btn)}>{a.kind === "offline" ? "View screens" : "Open licence"}</Link>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <div className="grid gap-5 xl:grid-cols-[1fr_260px_260px]">
        <Card>
          <CardHeader title="Screen Health" subtitle="Device connectivity by company" action={<span className="flex items-center gap-1.5 text-[11px] text-slate-400"><span className="h-1.5 w-1.5 rounded-full bg-green-500" />Live</span>} />
          <QueryState query={companies} skeleton={<div className="p-5"><Skeleton className="h-32" /></div>} empty={<div className="px-5 py-8 text-center text-xs text-slate-400">No companies yet.</div>}>
            {({ data }) => (
              <div className="space-y-5 px-5 py-5">
                {data.filter((c) => counts(c).screens > 0).slice(0, 6).map((c) => { const k = counts(c); const pct = k.screens ? Math.round((k.online / k.screens) * 100) : 0; return (
                  <div key={c.id}>
                    <div className="flex items-center justify-between"><div className="flex items-center gap-2"><Link href={`/companies/${c.id}`} className="text-sm font-semibold text-slate-900 hover:text-blue-600">{c.name}</Link>{c.overLimit && <Badge tone="red">Over limit</Badge>}</div><span className="text-sm font-semibold text-slate-900">{k.screens}</span></div>
                    <SegBar online={k.online} syncing={0} offline={k.offline} className="mt-3" />
                    <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs"><div className="flex flex-wrap gap-2"><Badge tone="green" dot>{k.online} Online</Badge><Badge tone="red" dot>{k.offline} Offline</Badge></div><span className="text-slate-400"><span className={cn("font-semibold", pct >= 80 ? "text-green-600" : "text-amber-600")}>{pct}%</span> online</span></div>
                  </div>
                ); })}
                {data.every((c) => counts(c).screens === 0) && <div className="text-center text-xs text-slate-400">No screens paired yet.</div>}
              </div>
            )}
          </QueryState>
        </Card>

        <Card>
          <CardHeader title="Quick Actions" />
          <div className="space-y-2 p-4">
            {quick.map((q) => (
              <Link key={q.title} href={q.href} className="flex items-center gap-3 rounded-lg border border-slate-200 px-3 py-3 transition-colors hover:border-blue-200 hover:bg-blue-50/40">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">{q.icon}</span>
                <span className="min-w-0 flex-1"><span className="block text-sm font-medium text-slate-900">{q.title}</span><span className="block text-xs text-slate-400">{q.sub}</span></span>
              </Link>
            ))}
            <Link href="/notifications" className="mt-2 flex h-9 w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-slate-300 text-xs font-medium text-slate-500 hover:border-blue-300 hover:text-blue-600"><Plus className="h-3.5 w-3.5" /> Send Notification</Link>
          </div>
        </Card>

        <Card>
          <CardHeader title="Platform Health" subtitle={totals.screens === undefined ? "…" : `${totals.screens} total devices`} action={<span className="flex items-center gap-1.5 text-[11px] text-slate-400"><span className="h-1.5 w-1.5 rounded-full bg-green-500" />Live</span>} />
          <div className="space-y-3 p-4">
            <SegBar online={totals.online ?? 0} syncing={totals.error ?? 0} offline={totals.offline ?? 0} />
            {[
              { label: "Online", sub: "Active · streaming", value: totals.online, cls: "border-green-100 bg-green-50/50", dot: "bg-green-500", text: "text-green-700" },
              { label: "Error", sub: "Player reported a fault", value: totals.error, cls: "border-amber-100 bg-amber-50/50", dot: "bg-amber-500", text: "text-amber-700" },
              { label: "Offline", sub: "No heartbeat", value: totals.offline, cls: "border-red-100 bg-red-50/50", dot: "bg-red-500", text: "text-red-700" },
            ].map((s) => (
              <div key={s.label} className={`flex items-center justify-between rounded-lg border px-3 py-2.5 ${s.cls}`}>
                <div className="flex items-center gap-2 text-xs"><span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} /><span className={`font-semibold ${s.text}`}>{s.label}</span><span className="text-slate-400">· {s.sub}</span></div>
                <span className="text-base font-bold text-slate-900">{s.value ?? "—"}</span>
              </div>
            ))}
            <p className="text-center text-[10px] text-slate-300">Presence expires 90 s after the last heartbeat</p>
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader title="Recent Activity" subtitle="Events across all tenants" action={
          <div className="flex rounded-lg border border-slate-200 bg-slate-50 p-0.5 text-xs font-medium">
            {(["all", "alerts"] as const).map((v) => <button key={v} onClick={() => setActFilter(v)} className={cn("h-6 rounded-md px-3 capitalize transition-colors", actFilter === v ? "bg-white text-slate-900 shadow-sm" : "text-slate-500")}>{v}</button>)}
          </div>
        } />
        <QueryState query={activity} skeleton={<div className="p-5"><Skeleton className="h-40" /></div>} empty={<div className="px-5 py-8 text-center text-xs text-slate-400">No activity yet.</div>}>
          {({ data }) => {
            const rows = data.map((a) => ({ a, ...activityIcon(a) })).filter((r) => actFilter === "all" || r.alert);
            return rows.length === 0 ? <div className="px-5 py-8 text-center text-xs text-slate-400">No alerts in the latest activity.</div> : (
              <ul className="divide-y divide-slate-100">
                {rows.map(({ a, icon, cls, alert }) => (
                  <li key={a.id} className="flex items-center gap-3 px-5 py-3">
                    <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", cls)}>{icon}</span>
                    <div className="min-w-0 flex-1"><div className="truncate text-sm font-medium text-slate-900">{maskEmailsIn(a.summary ?? "")}</div><div className="text-[11px] text-slate-400">{a.company?.name ?? a.actor?.name ?? "Platform"} · <span title={formatDateTime(a.createdAt)}>{timeAgo(a.createdAt)}</span></div></div>
                    <span className={cn("h-2 w-2 rounded-full", alert ? "bg-red-500" : "bg-green-500")} />
                  </li>
                ))}
              </ul>
            );
          }}
        </QueryState>
        <div className="border-t border-slate-100 px-5 py-3"><Link href="/activity" className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:underline">View full activity log <ChevronRight className="h-3 w-3" /></Link></div>
      </Card>
    </div>
  );
}
