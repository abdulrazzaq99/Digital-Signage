"use client";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { AlertTriangle, Building2, ChevronRight, FileBadge, ListVideo, Monitor, MonitorOff, Plus, RefreshCw, Upload, UploadCloud, Wifi, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const stats = [
  { value: "186", label: "Total Screens", sub: "Across all tenants", delta: "vs last month", tone: "text-slate-900", icon: <Monitor className="h-4 w-4" />, bg: "bg-blue-50 text-blue-600", spark: "#93c5fd" },
  { value: "164", label: "Screens Online", sub: "88.2% availability", delta: "vs yesterday", tone: "text-slate-900", icon: <Wifi className="h-4 w-4" />, bg: "bg-green-50 text-green-600", spark: "#86efac" },
  { value: "22", label: "Screens Offline", sub: "Needs attention", delta: "vs yesterday", tone: "text-slate-900", icon: <MonitorOff className="h-4 w-4" />, bg: "bg-red-50 text-red-600", spark: "#fca5a5" },
  { value: "24", label: "Companies", sub: "Active tenants", delta: "new this month", tone: "text-slate-900", icon: <Building2 className="h-4 w-4" />, bg: "bg-blue-50 text-blue-600", spark: "#c4b5fd" },
];

type AttnKind = "offline" | "syncing" | "licenses";
interface Attn { id: string; kind: AttnKind; title: string; critical?: boolean; company: string; when: string; action: string }
const attention: Attn[] = [
  { id: "a1", kind: "offline", title: "Entrance Display", critical: true, company: "City Mall", when: "32 min", action: "Diagnose" },
  { id: "a2", kind: "offline", title: "Checkout Panel 3", critical: true, company: "Acme Retail", when: "1h 14m", action: "Diagnose" },
  { id: "a3", kind: "syncing", title: "Floor 2 Display", company: "Metro Fashion", when: "48 min", action: "Force sync" },
  { id: "a4", kind: "licenses", title: "Basic Plan · 8 seats", company: "Fresh Bites", when: "6 days left", action: "Renew" },
  { id: "a5", kind: "licenses", title: "Starter Plan · 3 seats", company: "Sunrise Hotels", when: "12 days left", action: "Renew" },
];
const attnStyle: Record<AttnKind, { icon: React.ReactNode; iconCls: string; btn: string }> = {
  offline: { icon: <MonitorOff className="h-3.5 w-3.5" />, iconCls: "border-red-200 bg-red-50 text-red-600", btn: "border-red-200 bg-red-50 text-red-600 hover:bg-red-100" },
  syncing: { icon: <RefreshCw className="h-3.5 w-3.5" />, iconCls: "border-amber-200 bg-amber-50 text-amber-600", btn: "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100" },
  licenses: { icon: <FileBadge className="h-3.5 w-3.5" />, iconCls: "border-violet-200 bg-violet-50 text-violet-600", btn: "border-violet-200 bg-violet-50 text-violet-600 hover:bg-violet-100" },
};

const quick = [
  { title: "Add Company", sub: "Create a new tenant", href: "/companies", icon: <Building2 className="h-4 w-4" />, key: "⌘ N" },
  { title: "Pair Screen", sub: "Add a signage device", href: "/screens", icon: <Monitor className="h-4 w-4" />, key: "⌘ P" },
  { title: "Upload Media", sub: "Add to media library", href: "/media", icon: <Upload className="h-4 w-4" />, key: "⌘ U" },
];

const activity = [
  { title: '"Lobby Display 01" paired successfully', by: "Acme Retail", when: "2m ago", alert: false, icon: <Monitor className="h-3.5 w-3.5" />, cls: "bg-green-50 text-green-600" },
  { title: '"Weekend Promotion" published to 14 screens', by: "Fresh Bites", when: "18m ago", alert: false, icon: <ListVideo className="h-3.5 w-3.5" />, cls: "bg-blue-50 text-blue-600" },
  { title: '"Entrance Display" went offline', by: "City Mall", when: "32m ago", alert: true, icon: <MonitorOff className="h-3.5 w-3.5" />, cls: "bg-red-50 text-red-600" },
  { title: "12 assets uploaded — Spring Campaign 2026", by: "Metro Fashion", when: "1h ago", alert: false, icon: <UploadCloud className="h-3.5 w-3.5" />, cls: "bg-blue-50 text-blue-600" },
  { title: '"Sunrise Hotels" company created', by: "Super Admin", when: "2h ago", alert: false, icon: <Building2 className="h-3.5 w-3.5" />, cls: "bg-blue-50 text-blue-600" },
  { title: "5 licenses assigned", by: "Sunrise Hotels", when: "2h ago", alert: false, icon: <FileBadge className="h-3.5 w-3.5" />, cls: "bg-violet-50 text-violet-600" },
  { title: '"Food Court Panel A" content refreshed', by: "City Mall", when: "3h ago", alert: false, icon: <RefreshCw className="h-3.5 w-3.5" />, cls: "bg-slate-100 text-slate-500" },
];

function Spark({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 120 28" className="h-7 w-full" preserveAspectRatio="none">
      <path d="M0 22 C15 20, 25 10, 40 14 S 65 24, 80 12 S 105 4, 120 8" fill="none" stroke={color} strokeWidth="1.5" />
      <path d="M0 22 C15 20, 25 10, 40 14 S 65 24, 80 12 S 105 4, 120 8 V28 H0 Z" fill={color} opacity=".15" />
    </svg>
  );
}

function SegBar({ online, syncing, offline, className }: { online: number; syncing: number; offline: number; className?: string }) {
  const t = online + syncing + offline;
  return (
    <div className={cn("flex h-1.5 w-full overflow-hidden rounded-full bg-slate-100", className)}>
      <div className="bg-green-500" style={{ width: `${(online / t) * 100}%` }} />
      <div className="bg-amber-400" style={{ width: `${(syncing / t) * 100}%` }} />
      <div className="bg-red-300" style={{ width: `${(offline / t) * 100}%` }} />
    </div>
  );
}

export function OverviewPage() {
  const [filter, setFilter] = useState<"all" | AttnKind>("all");
  const [dismissed, setDismissed] = useState<string[]>([]);
  const [actFilter, setActFilter] = useState<"all" | "alerts">("all");
  const rows = attention.filter((a) => !dismissed.includes(a.id) && (filter === "all" || a.kind === filter));
  const count = (k: "all" | AttnKind) => attention.filter((a) => !dismissed.includes(a.id) && (k === "all" || a.kind === k)).length;
  const critical = attention.filter((a) => a.critical && !dismissed.includes(a.id)).length;
  const acts = activity.filter((a) => actFilter === "all" || a.alert);

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label} className="px-5 py-4">
            <div className={`mb-3 flex h-8 w-8 items-center justify-center rounded-lg ${s.bg}`}>{s.icon}</div>
            <div className={`text-2xl font-bold tracking-tight ${s.tone}`}>{s.value}</div>
            <div className="text-sm font-medium text-slate-700">{s.label}</div>
            <div className="text-xs text-slate-400">{s.sub}</div>
            <div className="mt-2"><Spark color={s.spark} /></div>
            <div className="mt-1 text-[11px] text-slate-300">{s.delta}</div>
          </Card>
        ))}
      </div>

      {count("all") > 0 && (
        <Card>
          <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-600"><AlertTriangle className="h-4 w-4" /></span>
            <div>
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">Needs Attention {critical > 0 && <Badge tone="red" className="bg-red-600 text-white border-red-600">{critical} critical</Badge>}</div>
              <div className="text-xs text-slate-400">Requires immediate action</div>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5 border-b border-slate-100 px-5 py-3">
            {([["all", "All"], ["offline", "Offline"], ["syncing", "Syncing"], ["licenses", "Licenses"]] as ["all" | AttnKind, string][]).map(([k, l]) => (
              <button key={k} onClick={() => setFilter(k)} className={cn("flex h-7 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium transition-colors", filter === k ? "bg-slate-100 text-slate-900" : "text-slate-500 hover:bg-slate-50")}>
                {l}<span className={cn("rounded px-1 text-[10px]", filter === k ? "bg-white text-slate-600" : "bg-slate-100 text-slate-400")}>{count(k)}</span>
              </button>
            ))}
          </div>
          <ul className="divide-y divide-slate-100">
            {rows.map((a) => (
              <li key={a.id} className="flex items-center gap-3 px-5 py-3">
                <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border", attnStyle[a.kind].iconCls)}>{attnStyle[a.kind].icon}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">{a.title}{a.critical && <Badge tone="red">CRITICAL</Badge>}</div>
                  <div className="text-[11px] text-slate-400">{a.company} · {a.when}</div>
                </div>
                <button className={cn("h-7 rounded-md border px-3 text-xs font-medium transition-colors", attnStyle[a.kind].btn)}>{a.action}</button>
                <button onClick={() => setDismissed((d) => [...d, a.id])} className="flex h-6 w-6 items-center justify-center rounded text-slate-300 hover:bg-slate-100 hover:text-slate-500" aria-label="Dismiss"><X className="h-3.5 w-3.5" /></button>
              </li>
            ))}
            {rows.length === 0 && <li className="px-5 py-6 text-center text-xs text-slate-400">Nothing needs attention in this category.</li>}
          </ul>
        </Card>
      )}

      <div className="grid gap-5 xl:grid-cols-[1fr_260px_260px]">
        <Card>
          <CardHeader title="Screen Health" subtitle="Device connectivity by group" action={<span className="flex items-center gap-1.5 text-[11px] text-slate-400"><span className="h-1.5 w-1.5 rounded-full bg-green-500" />Live</span>} />
          <div className="space-y-6 px-5 py-5">
            {[
              { name: "Personal Screens", tag: "Super Admin", total: 12, online: 10, offline: 2, syncing: 0, pct: 83 },
              { name: "Customer Screens", tag: "All tenants", total: 174, online: 154, offline: 14, syncing: 6, pct: 89 },
            ].map((g) => (
              <div key={g.name}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2"><span className="text-sm font-semibold text-slate-900">{g.name}</span><Badge tone="blue">{g.tag}</Badge></div>
                  <span className="text-sm font-semibold text-slate-900">{g.total}</span>
                </div>
                <SegBar online={g.online} syncing={g.syncing} offline={g.offline} className="mt-3" />
                <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex flex-wrap gap-2"><Badge tone="green" dot>{g.online} Online</Badge><Badge tone="red" dot>{g.offline} Offline</Badge>{g.syncing > 0 && <Badge tone="amber" dot>{g.syncing} Syncing</Badge>}</div>
                  <span className="text-slate-400"><span className="font-semibold text-amber-600">{g.pct}%</span> online</span>
                </div>
              </div>
            ))}
            <div className="flex gap-4 text-[11px] text-slate-400">{[["bg-green-500", "Online"], ["bg-amber-400", "Syncing"], ["bg-red-300", "Offline"]].map(([c, l]) => <span key={l} className="flex items-center gap-1.5"><span className={`h-2 w-2 rounded-sm ${c}`} />{l}</span>)}</div>
          </div>
        </Card>

        <Card>
          <CardHeader title="Quick Actions" />
          <div className="space-y-2 p-4">
            {quick.map((q) => (
              <Link key={q.title} href={q.href} className="flex items-center gap-3 rounded-lg border border-slate-200 px-3 py-3 transition-colors hover:border-blue-200 hover:bg-blue-50/40">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">{q.icon}</span>
                <span className="min-w-0 flex-1"><span className="block text-sm font-medium text-slate-900">{q.title}</span><span className="block text-xs text-slate-400">{q.sub}</span></span>
                <kbd className="rounded border border-slate-200 px-1.5 py-0.5 text-[9px] text-slate-400">{q.key}</kbd>
              </Link>
            ))}
            <button className="mt-2 flex h-9 w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-slate-300 text-xs font-medium text-slate-500 hover:border-blue-300 hover:text-blue-600"><Plus className="h-3.5 w-3.5" /> Invite Admin User</button>
          </div>
        </Card>

        <Card>
          <CardHeader title="Platform Health" subtitle="192 total devices" action={<span className="flex items-center gap-1.5 text-[11px] text-slate-400"><span className="h-1.5 w-1.5 rounded-full bg-green-500" />Updated now</span>} />
          <div className="space-y-3 p-4">
            <SegBar online={164} syncing={6} offline={22} />
            {[
              { label: "Online", sub: "Active · streaming", value: 164, cls: "border-green-100 bg-green-50/50", dot: "bg-green-500", text: "text-green-700" },
              { label: "Syncing", sub: "Content pending", value: 6, cls: "border-amber-100 bg-amber-50/50", dot: "bg-amber-500", text: "text-amber-700" },
              { label: "Offline", sub: "No heartbeat", value: 22, cls: "border-red-100 bg-red-50/50", dot: "bg-red-500", text: "text-red-700" },
            ].map((s) => (
              <div key={s.label} className={`flex items-center justify-between rounded-lg border px-3 py-2.5 ${s.cls}`}>
                <div className="flex items-center gap-2 text-xs"><span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} /><span className={`font-semibold ${s.text}`}>{s.label}</span><span className="text-slate-400">· {s.sub}</span></div>
                <span className="text-base font-bold text-slate-900">{s.value}</span>
              </div>
            ))}
            <p className="text-center text-[10px] text-slate-300">Offline ≠ Syncing — distinct device states</p>
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader title="Recent Activity" subtitle="Events across all tenants" action={
          <div className="flex rounded-lg border border-slate-200 bg-slate-50 p-0.5 text-xs font-medium">
            {(["all", "alerts"] as const).map((v) => <button key={v} onClick={() => setActFilter(v)} className={cn("h-6 rounded-md px-3 capitalize transition-colors", actFilter === v ? "bg-white text-slate-900 shadow-sm" : "text-slate-500")}>{v}</button>)}
          </div>
        } />
        <ul className="divide-y divide-slate-100">
          {acts.map((a, i) => (
            <li key={i} className="flex items-center gap-3 px-5 py-3">
              <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", a.cls)}>{a.icon}</span>
              <div className="min-w-0 flex-1"><div className="truncate text-sm font-medium text-slate-900">{a.title}</div><div className="text-[11px] text-slate-400">{a.by} · {a.when}</div></div>
              <span className={cn("h-2 w-2 rounded-full", a.alert ? "bg-red-500" : "bg-green-500")} />
            </li>
          ))}
        </ul>
        <div className="border-t border-slate-100 px-5 py-3"><Link href="/activity" className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:underline">View full activity log <ChevronRight className="h-3 w-3" /></Link></div>
      </Card>
    </div>
  );
}
