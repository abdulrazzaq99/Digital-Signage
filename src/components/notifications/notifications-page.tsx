"use client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { FilterSelect, PillTabs, SearchInput } from "@/components/ui/input";
import { Drawer, DropdownMenu, PageHeader } from "@/components/ui/misc";
import { notifications, type NotifKind, type Notification } from "@/lib/data";
import { cn } from "@/lib/utils";
import { AlertTriangle, Building2, Check, Clock, Eye, FileBadge, Monitor, MonitorOff, RefreshCw, Rocket, Sparkles, Ticket, X, XCircle } from "lucide-react";
import { useState } from "react";

const kinds: Record<NotifKind, { icon: React.ReactNode; cls: string; label: string }> = {
  "sync-success": { icon: <RefreshCw className="h-3.5 w-3.5" />, cls: "bg-green-50 text-green-600", label: "Sync Success" },
  "screen-offline": { icon: <MonitorOff className="h-3.5 w-3.5" />, cls: "bg-red-50 text-red-600", label: "Screen Offline" },
  "sync-failed": { icon: <XCircle className="h-3.5 w-3.5" />, cls: "bg-amber-50 text-amber-600", label: "Sync Failed" },
  "license-limit": { icon: <AlertTriangle className="h-3.5 w-3.5" />, cls: "bg-amber-50 text-amber-600", label: "License Limit" },
  "screen-online": { icon: <Monitor className="h-3.5 w-3.5" />, cls: "bg-green-50 text-green-600", label: "Screen Online" },
  campaign: { icon: <Ticket className="h-3.5 w-3.5" />, cls: "bg-violet-50 text-violet-600", label: "Campaign" },
  "license-expiring": { icon: <Clock className="h-3.5 w-3.5" />, cls: "bg-amber-50 text-amber-600", label: "License Expiring" },
  company: { icon: <Building2 className="h-3.5 w-3.5" />, cls: "bg-blue-50 text-blue-600", label: "Company" },
  "campaign-updated": { icon: <FileBadge className="h-3.5 w-3.5" />, cls: "bg-violet-50 text-violet-600", label: "Campaign Updated" },
  platform: { icon: <Rocket className="h-3.5 w-3.5" />, cls: "bg-blue-50 text-blue-600", label: "Platform" },
};

export function NotificationsPage() {
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<Notification | null>(null);
  const [read, setRead] = useState<string[]>([]);
  const isUnread = (n: Notification) => !!n.unread && !read.includes(n.id);
  const list = notifications.filter((n) => (filter === "all" || isUnread(n)) && n.title.toLowerCase().includes(q.toLowerCase()));
  const unreadCount = notifications.filter(isUnread).length;
  const groups = ["Today", "Earlier"] as const;

  return (
    <div className="space-y-5">
      <PageHeader title="Notifications" subtitle="View and manage important platform activity and alerts." />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <SearchInput placeholder="Search notifications..." className="w-60" value={q} onChange={(e) => setQ(e.target.value)} />
          <PillTabs options={[{ value: "all", label: "All" }, { value: "unread", label: `Unread ${unreadCount}` }]} value={filter} onChange={setFilter} />
          <FilterSelect label="All Types" />
        </div>
        <Button variant="secondary" onClick={() => setRead(notifications.map((n) => n.id))}><Check className="h-3.5 w-3.5" /> Mark All as Read</Button>
      </div>
      <Card>
        {groups.map((g) => {
          const rows = list.filter((n) => n.group === g);
          if (!rows.length) return null;
          return (
            <div key={g}>
              <div className="border-b border-slate-100 bg-slate-50/70 px-5 py-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">{g} · {rows.length}</div>
              <ul className="divide-y divide-slate-100">
                {rows.map((n) => (
                  <li key={n.id} className={cn("flex items-start gap-3 px-5 py-3.5 transition-colors hover:bg-slate-50/60", isUnread(n) && "bg-blue-50/20")}>
                    <span className={cn("mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full", isUnread(n) ? "bg-blue-600" : "bg-transparent")} />
                    <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-full", kinds[n.kind].cls)}>{kinds[n.kind].icon}</span>
                    <button onClick={() => { setOpen(n); setRead((r) => [...r, n.id]); }} className="min-w-0 flex-1 text-left">
                      <div className="text-sm font-semibold text-slate-900">{n.title}</div>
                      <div className="truncate text-xs text-slate-500">{n.body}</div>
                      <Badge tone="slate" className="mt-1.5">{n.company}</Badge>
                    </button>
                    <span className="shrink-0 text-[11px] text-slate-400">{n.when}</span>
                    <DropdownMenu items={[{ label: isUnread(n) ? "Mark as Read" : "Mark as Unread", icon: <Check className="h-3.5 w-3.5" />, onSelect: () => setRead((r) => isUnread(n) ? [...r, n.id] : r.filter((x) => x !== n.id)) }, { label: "View Details", icon: <Eye className="h-3.5 w-3.5" />, onSelect: () => setOpen(n) }]} />
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </Card>

      <Drawer open={!!open} onClose={() => setOpen(null)}>
        {open && (
          <>
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
              <div className="flex items-center gap-3">
                <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-full", kinds[open.kind].cls)}>{kinds[open.kind].icon}</span>
                <div><div className="text-[10px] font-semibold uppercase tracking-wider text-green-600">{kinds[open.kind].label}</div><div className="text-sm font-semibold text-slate-900">{open.title}</div></div>
              </div>
              <button onClick={() => setOpen(null)} className="flex h-6 w-6 items-center justify-center rounded-md border border-slate-200 text-slate-400 hover:bg-slate-50"><X className="h-3.5 w-3.5" /></button>
            </div>
            <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
              <div className="rounded-lg border border-slate-200 bg-slate-50/60 px-4 py-3 text-xs leading-5 text-slate-700">{open.detail}</div>
              <dl className="divide-y divide-slate-100 text-xs">
                {[["Date & Time", open.when], ["Status", isUnread(open) ? "Unread" : "Read"], ["Priority", open.priority], ["Company", open.company], ["Related", open.related]].map(([k, v]) => <div key={k} className="flex justify-between py-2.5"><dt className="text-slate-400">{k}</dt><dd className="font-semibold text-slate-800">{v}</dd></div>)}
              </dl>
            </div>
            <div className="space-y-2 border-t border-slate-100 px-5 py-4">
              <Button className="w-full"><Eye className="h-3.5 w-3.5" /> {open.action}</Button>
              <div className="grid grid-cols-2 gap-2"><Button variant="secondary" onClick={() => setRead((r) => r.filter((x) => x !== open.id))}><Sparkles className="h-3.5 w-3.5" /> Mark as Unread</Button><Button variant="secondary" onClick={() => setOpen(null)}>Close</Button></div>
            </div>
          </>
        )}
      </Drawer>
    </div>
  );
}
