import { Badge } from "@/components/ui/badge";
import { Card, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/misc";
import { recentActivity } from "@/lib/data";
import { Building2, ChevronRight, Monitor, MonitorOff, Upload, Wifi } from "lucide-react";
import Link from "next/link";

const stats = [
  { value: "186", label: "Total Screens", sub: "Across all tenants", delta: "+4 this month", tone: "text-slate-900", deltaTone: "text-slate-400", icon: <Monitor className="h-4 w-4" />, bg: "bg-blue-50 text-blue-600", spark: "#93c5fd" },
  { value: "164", label: "Screens Online", sub: "88.2% availability", delta: "+3 vs yesterday", tone: "text-green-600", deltaTone: "text-green-600", icon: <Wifi className="h-4 w-4" />, bg: "bg-green-50 text-green-600", spark: "#86efac" },
  { value: "22", label: "Screens Offline", sub: "Needs attention", delta: "-1 vs yesterday", tone: "text-red-600", deltaTone: "text-red-600", icon: <MonitorOff className="h-4 w-4" />, bg: "bg-red-50 text-red-600", spark: "#fca5a5" },
  { value: "24", label: "Companies", sub: "Active tenants", delta: "+1 this month", tone: "text-blue-600", deltaTone: "text-slate-400", icon: <Building2 className="h-4 w-4" />, bg: "bg-blue-50 text-blue-600", spark: "#c4b5fd" },
];

const quick = [
  { title: "Add Company", sub: "Create a new customer company", href: "/companies", icon: <Building2 className="h-4 w-4" /> },
  { title: "Add Screen", sub: "Pair a new signage device", href: "/screens", icon: <Monitor className="h-4 w-4" /> },
  { title: "Upload Media", sub: "Add content to the media library", href: "/media", icon: <Upload className="h-4 w-4" /> },
];

function Spark({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 120 28" className="h-7 w-full" preserveAspectRatio="none">
      <path d="M0 22 C15 20, 25 10, 40 14 S 65 24, 80 12 S 105 4, 120 8" fill="none" stroke={color} strokeWidth="1.5" />
      <path d="M0 22 C15 20, 25 10, 40 14 S 65 24, 80 12 S 105 4, 120 8 V28 H0 Z" fill={color} opacity=".15" />
    </svg>
  );
}

export default function OverviewPage() {
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
            <div className={`mt-1 text-[11px] font-medium ${s.deltaTone}`}>{s.delta}</div>
          </Card>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_320px]">
        <Card>
          <CardHeader title="Screen Status" subtitle="Device connectivity across the platform" />
          <div className="space-y-6 px-5 py-5">
            {[
              { name: "Personal Screens", tag: "Super Admin managed", total: 12, online: 10, offline: 2, uptime: "83% uptime" },
              { name: "Customer Screens", tag: "All tenant devices", total: 174, online: 154, offline: 20, uptime: "89% uptime" },
            ].map((g) => (
              <div key={g.name}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-blue-600" />
                    <span className="text-sm font-semibold text-slate-900">{g.name}</span>
                    <Badge tone="slate">{g.tag}</Badge>
                  </div>
                  <span className="text-xs text-slate-400">{g.total} total</span>
                </div>
                <Progress value={(g.online / g.total) * 100} tone="green" className="mt-3" />
                <div className="mt-2 flex items-center justify-between text-xs">
                  <div className="flex gap-3">
                    <Badge tone="green" dot>{g.online} Online</Badge>
                    <Badge tone="red" dot>{g.offline} Offline</Badge>
                  </div>
                  <span className="text-slate-400">{g.uptime}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader title="Quick Actions" />
          <div className="space-y-2 p-4">
            {quick.map((q) => (
              <Link key={q.title} href={q.href} className="flex items-center gap-3 rounded-lg border border-slate-200 px-3 py-3 transition-colors hover:border-blue-200 hover:bg-blue-50/40">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500">{q.icon}</span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium text-slate-900">{q.title}</span>
                  <span className="block text-xs text-slate-400">{q.sub}</span>
                </span>
                <ChevronRight className="h-4 w-4 text-slate-300" />
              </Link>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_320px]">
        <Card>
          <CardHeader title="Recent Activity" subtitle="Platform events across all tenants" action={<Link href="/activity" className="text-xs font-medium text-blue-600 hover:underline">View all activity →</Link>} />
          <ul className="divide-y divide-slate-100">
            {recentActivity.map((a, i) => (
              <li key={i} className="flex items-center gap-4 px-5 py-3.5">
                <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${a.kind === "alert" ? "bg-red-500" : "bg-transparent"}`} />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium text-slate-900">{a.title}</div>
                  <div className="text-xs text-slate-400">{a.by}</div>
                </div>
                <Badge tone={a.kind === "alert" ? "red" : a.kind === "success" ? "green" : "slate"} dot>{a.kind === "alert" ? "Alert" : a.kind === "success" ? "Success" : "Info"}</Badge>
                <span className="w-16 text-right text-xs text-slate-400">{a.when}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <CardHeader title="Operational Status" subtitle="Current platform health snapshot" />
          <div className="space-y-3 p-4">
            {[
              { label: "Online", sub: "Active and streaming", value: 164, cls: "border-green-100 bg-green-50/50", dot: "bg-green-500" },
              { label: "Offline", sub: "No connection detected", value: 22, cls: "border-red-100 bg-red-50/50", dot: "bg-red-500" },
              { label: "Syncing", sub: "Sync pending", value: 6, cls: "border-amber-100 bg-amber-50/50", dot: "bg-amber-500" },
            ].map((s) => (
              <div key={s.label} className={`flex items-center justify-between rounded-lg border px-4 py-3 ${s.cls}`}>
                <div className="flex items-center gap-2.5">
                  <span className={`h-2 w-2 rounded-full ${s.dot}`} />
                  <div>
                    <div className="text-sm font-semibold text-slate-900">{s.label}</div>
                    <div className="text-[11px] text-slate-400">{s.sub}</div>
                  </div>
                </div>
                <div className="text-right"><div className="text-xl font-bold text-slate-900">{s.value}</div><div className="text-[10px] text-slate-400">screens</div></div>
              </div>
            ))}
            <div className="flex items-center gap-1.5 pt-1 text-[11px] text-slate-400"><span className="h-1.5 w-1.5 rounded-full bg-green-500" />Last synced 45 seconds ago</div>
          </div>
        </Card>
      </div>
    </div>
  );
}
