"use client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { FilterSelect, SearchInput } from "@/components/ui/input";
import { Alert, Drawer, DropdownMenu, PageHeader } from "@/components/ui/misc";
import { TD, TH, THead, TR, Table } from "@/components/ui/table";
import { activityLog, type ActivityEntry } from "@/lib/data";
import { Eye, Info, Monitor, X } from "lucide-react";
import { useState } from "react";

const tone = (s: string) => (s === "Successful" ? "green" : s === "Pending" ? "amber" : "red");

export function ActivityPage() {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<ActivityEntry | null>(null);
  const list = activityLog.filter((a) => a.action.toLowerCase().includes(q.toLowerCase()) || a.summary.toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="space-y-5">
      <PageHeader title="Activity" subtitle="Audit log of platform actions across all tenants." />
      <div className="flex flex-wrap items-center justify-between gap-3"><div className="flex flex-wrap items-center gap-2"><SearchInput placeholder="Search activity..." className="w-60" value={q} onChange={(e) => setQ(e.target.value)} /><FilterSelect label="All Types" /><FilterSelect label="All Companies" /><FilterSelect label="All Time" /></div><span className="text-xs text-slate-400">{list.length} entries</span></div>
      <Card>
        <Table>
          <THead><tr><TH>Action</TH><TH>Performed By</TH><TH>Company</TH><TH>Resource</TH><TH>Status</TH><TH>Date &amp; Time</TH><TH> </TH></tr></THead>
          <tbody>
            {list.map((a) => (
              <TR key={a.id} className="cursor-pointer" onClick={() => setOpen(a)}>
                <TD><div className="text-sm font-semibold text-slate-900">{a.action}</div><div className="max-w-[240px] truncate text-[11px] text-slate-400">{a.summary}</div></TD>
                <TD className="whitespace-nowrap"><div className="text-xs font-medium text-slate-800">{a.by}</div><div className="text-[10px] text-slate-400">{a.role}</div></TD>
                <TD className="text-xs font-medium text-slate-800 whitespace-nowrap">{a.company}</TD>
                <TD className="whitespace-nowrap"><div className="text-xs font-medium text-slate-800">{a.resource}</div><div className="text-[10px] text-slate-400">{a.resourceSub}</div></TD>
                <TD><Badge tone={tone(a.status)} dot>{a.status}</Badge></TD>
                <TD className="text-xs text-slate-500 whitespace-nowrap">{a.when}</TD>
                <TD onClick={(e) => e.stopPropagation()}><DropdownMenu items={[{ label: "View Details", icon: <Eye className="h-3.5 w-3.5" />, onSelect: () => setOpen(a) }, { label: "View Screen", icon: <Monitor className="h-3.5 w-3.5" />, href: "/screens/lobby-display-01" }]} /></TD>
              </TR>
            ))}
          </tbody>
        </Table>
      </Card>

      <Drawer open={!!open} onClose={() => setOpen(null)}>
        {open && (
          <>
            <div className="flex items-start justify-between border-b border-slate-100 px-5 py-4"><div><div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">{open.action}</div><div className="text-sm font-semibold text-slate-900">{open.action}</div><div className="text-[11px] text-slate-400">{open.summary}</div></div><button onClick={() => setOpen(null)} className="flex h-6 w-6 items-center justify-center rounded-md border border-slate-200 text-slate-400"><X className="h-3.5 w-3.5" /></button></div>
            <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
              <div className="rounded-lg border border-slate-200 bg-slate-50/60 px-4 py-3 text-xs leading-5 text-slate-700">{open.detail}</div>
              <dl className="divide-y divide-slate-100 text-xs">
                {[["Action", open.action], ["Performed By", <span key="b">{open.by} <span className="font-normal text-slate-400">· {open.role}</span></span>], ["Company", open.company], ["Resource", <span key="r">{open.resource} <span className="font-normal text-slate-400">({open.resourceSub})</span></span>], ["Resource Type", open.resourceType], ["Status", <Badge key="s" tone={tone(open.status)} dot>{open.status}</Badge>], ["Date & Time", open.when]].map(([k, v]) => <div key={String(k)} className="flex items-center justify-between gap-4 py-2.5"><dt className="shrink-0 text-slate-400">{k}</dt><dd className="text-right font-semibold text-slate-800">{v}</dd></div>)}
              </dl>
              <Alert tone="blue" className="border-slate-200 bg-slate-50 text-slate-500" icon={<Info className="h-3.5 w-3.5 shrink-0" />}>Activity history is read-only and cannot be modified.</Alert>
            </div>
            <div className="flex gap-2 border-t border-slate-100 px-5 py-4"><Button href="/screens/lobby-display-01" className="flex-1">View Screen</Button><Button variant="secondary" onClick={() => setOpen(null)}>Close</Button></div>
          </>
        )}
      </Drawer>
    </div>
  );
}
