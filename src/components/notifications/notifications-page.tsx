"use client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Checkbox, Input, Label, PillTabs, SearchInput, Textarea } from "@/components/ui/input";
import { Modal, ModalFooter, ModalHeader } from "@/components/ui/modal";
import { Alert, Drawer, PageHeader, Pagination } from "@/components/ui/misc";
import { EmptyState, QueryState } from "@/components/ui/query-state";
import { useToast } from "@/components/ui/toast";
import { useCompanyNames } from "@/lib/api/hooks/companies";
import { useNotifications, useSendNotification } from "@/lib/api/hooks/notifications";
import type { Notification } from "@/lib/api/types";
import { errorMessage, formatDateTime, timeAgo } from "@/lib/format";
import { cn } from "@/lib/utils";
import { AlertTriangle, Bell, Building2, Clock, Eye, FileBadge, MonitorOff, Plus, RefreshCw, Rocket, Send, Ticket, X } from "lucide-react";
import { useState } from "react";

/** Icon by keyword in the title; notifications are free text so this is presentation only. */
function kindOf(n: Notification): { icon: React.ReactNode; cls: string; label: string } {
  const t = `${n.title} ${n.body}`.toLowerCase();
  if (t.includes("offline")) return { icon: <MonitorOff className="h-3.5 w-3.5" />, cls: "bg-red-50 text-red-600", label: "Screen" };
  if (t.includes("sync")) return { icon: <RefreshCw className="h-3.5 w-3.5" />, cls: "bg-green-50 text-green-600", label: "Sync" };
  if (t.includes("licen")) return { icon: <FileBadge className="h-3.5 w-3.5" />, cls: "bg-amber-50 text-amber-600", label: "Licence" };
  if (t.includes("campaign") || t.includes("scratch") || t.includes("prize")) return { icon: <Ticket className="h-3.5 w-3.5" />, cls: "bg-violet-50 text-violet-600", label: "Campaign" };
  if (t.includes("maintenance") || t.includes("alert")) return { icon: <AlertTriangle className="h-3.5 w-3.5" />, cls: "bg-amber-50 text-amber-600", label: "Alert" };
  if (t.includes("company") || t.includes("welcome")) return { icon: <Building2 className="h-3.5 w-3.5" />, cls: "bg-blue-50 text-blue-600", label: "Company" };
  return { icon: <Rocket className="h-3.5 w-3.5" />, cls: "bg-blue-50 text-blue-600", label: "Platform" };
}
const audienceLabel = (a: Notification["audience"], names: Record<string, string>) => a.kind === "all" ? "All customers" : a.kind === "companies" ? a.companyIds.map((id) => names[id] ?? "Company").join(", ") : `${a.userIds.length} user${a.userIds.length === 1 ? "" : "s"}`;
const isToday = (iso: string) => new Date(iso).toDateString() === new Date().toDateString();

function ComposeModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const toast = useToast();
  const { companies } = useCompanyNames();
  const send = useSendNotification();
  const [f, setF] = useState({ title: "", body: "", kind: "all" as "all" | "companies", companyIds: [] as string[], deepLink: "", scheduledAt: "" });
  const [error, setError] = useState("");
  const close = () => { onClose(); setF({ title: "", body: "", kind: "all", companyIds: [], deepLink: "", scheduledAt: "" }); setError(""); };
  const submit = () => {
    setError("");
    send.mutate({ title: f.title.trim(), body: f.body.trim(), audience: f.kind === "all" ? { kind: "all" } : { kind: "companies", companyIds: f.companyIds }, deepLink: f.deepLink.trim() || undefined, scheduledAt: f.scheduledAt ? new Date(f.scheduledAt).toISOString() : undefined }, { onSuccess: (n) => { toast.success(n.scheduledAt && !n.sentAt ? "Notification scheduled" : "Notification sent", n.title); close(); }, onError: (e) => setError(errorMessage(e)) });
  };
  const valid = f.title.trim().length > 0 && f.body.trim().length > 0 && (f.kind === "all" || f.companyIds.length > 0);
  return (
    <Modal open={open} onClose={close} width="max-w-[520px]">
      <ModalHeader title="Send Notification" subtitle="Delivered as a push notification to the selected customers' apps." onClose={close} />
      <div className="space-y-4 px-6 py-5">
        <div><Label required>Title</Label><Input value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} maxLength={120} placeholder="e.g. Scheduled maintenance tonight" /></div>
        <div><Label required>Message</Label><Textarea rows={3} value={f.body} onChange={(e) => setF({ ...f, body: e.target.value })} maxLength={1000} /></div>
        <div><Label>Audience</Label><PillTabs options={[{ value: "all" as const, label: "All customers" }, { value: "companies" as const, label: "Specific companies" }]} value={f.kind} onChange={(v) => setF({ ...f, kind: v })} />
          {f.kind === "companies" && <ul className="mt-2 max-h-40 space-y-1 overflow-y-auto rounded-lg border border-slate-200 p-2">{companies.map((c) => <li key={c.id}><label className="flex items-center gap-2 text-xs text-slate-700"><Checkbox checked={f.companyIds.includes(c.id)} onChange={(v) => setF({ ...f, companyIds: v ? [...f.companyIds, c.id] : f.companyIds.filter((x) => x !== c.id) })} />{c.name}</label></li>)}</ul>}
        </div>
        <div className="grid gap-4 sm:grid-cols-2"><div><Label>Deep link</Label><Input value={f.deepLink} onChange={(e) => setF({ ...f, deepLink: e.target.value })} placeholder="/portal/offers" /></div><div><Label>Schedule for</Label><Input type="datetime-local" value={f.scheduledAt} onChange={(e) => setF({ ...f, scheduledAt: e.target.value })} /></div></div>
        {error && <Alert tone="red">{error}</Alert>}
      </div>
      <ModalFooter><Button variant="secondary" onClick={close}>Cancel</Button><Button onClick={submit} disabled={!valid || send.isPending}><Send className="h-3.5 w-3.5" /> {send.isPending ? "Sending…" : f.scheduledAt ? "Schedule" : "Send Now"}</Button></ModalFooter>
    </Modal>
  );
}

export function NotificationsPage() {
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState<Notification | null>(null);
  const [compose, setCompose] = useState(false);
  const notifications = useNotifications({ page });
  const { names } = useCompanyNames();
  const list = (notifications.data?.data ?? []).filter((n) => `${n.title} ${n.body}`.toLowerCase().includes(q.toLowerCase()));
  const groups: [string, Notification[]][] = [["Today", list.filter((n) => isToday(n.createdAt))], ["Earlier", list.filter((n) => !isToday(n.createdAt))]];

  return (
    <div className="space-y-5">
      <PageHeader title="Notifications" subtitle="Push notifications sent to customers, and their delivery status." action={<Button onClick={() => setCompose(true)}><Plus className="h-4 w-4" /> Send Notification</Button>} />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SearchInput placeholder="Search notifications..." className="w-60" value={q} onChange={(e) => setQ(e.target.value)} />
        <span className="text-xs text-slate-400">{notifications.data?.meta?.total ?? 0} sent</span>
      </div>
      <QueryState query={notifications} empty={<EmptyState icon={<Bell className="h-5 w-5" />} title="No notifications yet" body="Send platform announcements and alerts to customers." action={<Button onClick={() => setCompose(true)}><Plus className="h-4 w-4" /> Send Notification</Button>} />}>
        {({ meta }) => (
          <>
            <Card>
              {list.length === 0 && <div className="px-5 py-10 text-center text-xs text-slate-400">No notifications match.</div>}
              {groups.map(([g, rows]) => rows.length === 0 ? null : (
                <div key={g}>
                  <div className="border-b border-slate-100 bg-slate-50/70 px-5 py-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">{g} · {rows.length}</div>
                  <ul className="divide-y divide-slate-100">
                    {rows.map((n) => { const k = kindOf(n); return (
                      <li key={n.id} className="flex items-start gap-3 px-5 py-3.5 transition-colors hover:bg-slate-50/60">
                        <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-full", k.cls)}>{k.icon}</span>
                        <button onClick={() => setOpen(n)} className="min-w-0 flex-1 text-left">
                          <div className="text-sm font-semibold text-slate-900">{n.title}</div>
                          <div className="truncate text-xs text-slate-500">{n.body}</div>
                          <div className="mt-1.5 flex flex-wrap items-center gap-1.5"><Badge tone="slate">{audienceLabel(n.audience, names)}</Badge>{n.sentAt ? <Badge tone="green" dot>Sent</Badge> : n.scheduledAt ? <Badge tone="blue" dot>Scheduled</Badge> : <Badge tone="amber" dot>Queued</Badge>}</div>
                        </button>
                        <span className="shrink-0 text-[11px] text-slate-400" title={formatDateTime(n.createdAt)}>{n.sentAt ? timeAgo(n.sentAt) : n.scheduledAt ? <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{formatDateTime(n.scheduledAt)}</span> : timeAgo(n.createdAt)}</span>
                      </li>
                    ); })}
                  </ul>
                </div>
              ))}
            </Card>
            {meta && meta.totalPages > 1 && <Pagination page={meta.page} pages={meta.totalPages} onChange={setPage} summary={`${meta.total} notifications`} />}
          </>
        )}
      </QueryState>

      <Drawer open={!!open} onClose={() => setOpen(null)}>
        {open && (() => { const k = kindOf(open); return (
          <>
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
              <div className="flex items-center gap-3"><span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-full", k.cls)}>{k.icon}</span><div><div className="text-[10px] font-semibold uppercase tracking-wider text-blue-600">{k.label}</div><div className="text-sm font-semibold text-slate-900">{open.title}</div></div></div>
              <button onClick={() => setOpen(null)} className="flex h-6 w-6 items-center justify-center rounded-md border border-slate-200 text-slate-400 hover:bg-slate-50" aria-label="Close"><X className="h-3.5 w-3.5" /></button>
            </div>
            <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
              <div className="rounded-lg border border-slate-200 bg-slate-50/60 px-4 py-3 text-xs leading-5 text-slate-700">{open.body}</div>
              <dl className="divide-y divide-slate-100 text-xs">
                {([["Created", formatDateTime(open.createdAt)], ["Scheduled", open.scheduledAt ? formatDateTime(open.scheduledAt) : "Immediately"], ["Sent", open.sentAt ? formatDateTime(open.sentAt) : "Pending"], ["Audience", audienceLabel(open.audience, names)], ["Deep link", open.deepLink ?? "—"], ["Provider ref", open.providerId ?? "—"]] as [string, string][]).map(([k2, v]) => <div key={k2} className="flex justify-between gap-4 py-2.5"><dt className="text-slate-400">{k2}</dt><dd className="truncate font-semibold text-slate-800">{v}</dd></div>)}
              </dl>
            </div>
            <div className="border-t border-slate-100 px-5 py-4">{open.deepLink ? <Button className="w-full" href={open.deepLink}><Eye className="h-3.5 w-3.5" /> Open link</Button> : <Button variant="secondary" className="w-full" onClick={() => setOpen(null)}>Close</Button>}</div>
          </>
        ); })()}
      </Drawer>
      <ComposeModal open={compose} onClose={() => setCompose(false)} />
    </div>
  );
}
