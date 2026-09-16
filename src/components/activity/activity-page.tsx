"use client";
import { CompanyFilter } from "@/components/admin/company-scope";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { FilterSelect, SearchInput } from "@/components/ui/input";
import { Alert, Drawer, DropdownMenu, PageHeader, Pagination } from "@/components/ui/misc";
import { EmptyState, QueryState } from "@/components/ui/query-state";
import { TD, TH, THead, TR, Table } from "@/components/ui/table";
import { useActivity } from "@/lib/api/hooks/activity";
import type { ActivityEntry } from "@/lib/api/types";
import { formatDateTime, label } from "@/lib/format";
import { Activity, Eye, Info, X } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

const tone = (s: string) => (s === "SUCCESS" ? "green" : s === "PENDING" ? "amber" : "red");
const RESOURCE_TYPES = ["company", "user", "license", "screen", "screen_group", "media", "playlist", "schedule", "layout", "template", "template_instance", "offer", "campaign", "winner", "notification", "canvas"];
const PERIODS: { value: string; label: string; days?: number }[] = [{ value: "", label: "All Time" }, { value: "1", label: "Last 24 hours", days: 1 }, { value: "7", label: "Last 7 days", days: 7 }, { value: "30", label: "Last 30 days", days: 30 }];

/** Where an entry's resource lives in the admin, when there is a page for it. */
function resourceHref(a: ActivityEntry): string | undefined {
  if (!a.resourceId) return undefined;
  const map: Record<string, string> = { screen: `/screens/${a.resourceId}`, company: `/companies/${a.resourceId}`, offer: `/offers/${a.resourceId}`, campaign: `/scratch-win/${a.resourceId}`, license: `/licenses/${a.resourceId}` };
  return map[a.resourceType];
}

export function ActivityPage() {
  const params = useSearchParams();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [resourceType, setResourceType] = useState("");
  const [companyId, setCompanyId] = useState(params.get("company") ?? "");
  const [period, setPeriod] = useState("");
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState<ActivityEntry | null>(null);
  // The period start is captured when the filter changes, not on every render, so the query key stays stable.
  const [from, setFrom] = useState<string | undefined>(undefined);
  const changePeriod = (v: string) => { setPeriod(v); const days = PERIODS.find((p) => p.value === v)?.days; setFrom(days ? new Date(Date.now() - days * 86_400_000).toISOString() : undefined); };
  const activity = useActivity({ search: q || undefined, status: (status || undefined) as "SUCCESS" | "PENDING" | "FAILED" | undefined, resourceType: resourceType || undefined, companyId: companyId || undefined, from, page });
  const reset = (fn: () => void) => { fn(); setPage(1); };

  return (
    <div className="space-y-5">
      <PageHeader title="Activity" subtitle="Audit log of platform actions across all tenants." />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <SearchInput placeholder="Search activity..." className="w-60" value={q} onChange={(e) => reset(() => setQ(e.target.value))} />
          <FilterSelect label="All Types" options={RESOURCE_TYPES.map((t) => ({ value: t, label: label(t) }))} value={resourceType} onChange={(v) => reset(() => setResourceType(v))} />
          <CompanyFilter value={companyId} onChange={(v) => reset(() => setCompanyId(v))} />
          <FilterSelect label="All Statuses" options={["SUCCESS", "PENDING", "FAILED"].map((s) => ({ value: s, label: label(s) }))} value={status} onChange={(v) => reset(() => setStatus(v))} />
          <FilterSelect label="All Time" options={PERIODS.filter((p) => p.value).map((p) => ({ value: p.value, label: p.label }))} value={period} onChange={(v) => reset(() => changePeriod(v))} />
        </div>
        <span className="text-xs text-slate-400">{activity.data?.meta?.total ?? 0} entries</span>
      </div>
      <QueryState query={activity} empty={<EmptyState icon={<Activity className="h-5 w-5" />} title="No activity matches" body="Try widening the filters." />}>
        {({ data, meta }) => (
          <>
            <Card>
              <Table>
                <THead><tr><TH>Action</TH><TH>Performed By</TH><TH>Company</TH><TH>Resource</TH><TH>Status</TH><TH>Date &amp; Time</TH><TH> </TH></tr></THead>
                <tbody>
                  {data.map((a) => (
                    <TR key={a.id} className="cursor-pointer" onClick={() => setOpen(a)}>
                      <TD><div className="text-sm font-semibold text-slate-900">{label(a.action.replace(/\./g, "_"))}</div><div className="max-w-[280px] truncate text-[11px] text-slate-400">{a.summary}</div></TD>
                      <TD className="whitespace-nowrap"><div className="text-xs font-medium text-slate-800">{a.actor?.name ?? "System"}</div><div className="text-[10px] text-slate-400">{a.actor ? label(a.actor.role) : "Automated"}</div></TD>
                      <TD className="text-xs font-medium text-slate-800 whitespace-nowrap">{a.company?.name ?? <span className="text-slate-400">Platform</span>}</TD>
                      <TD className="whitespace-nowrap"><div className="text-xs font-medium text-slate-800">{label(a.resourceType)}</div><div className="max-w-[140px] truncate font-mono text-[10px] text-slate-400">{a.resourceId ?? "—"}</div></TD>
                      <TD><Badge tone={tone(a.status)} dot>{label(a.status)}</Badge></TD>
                      <TD className="text-xs text-slate-500 whitespace-nowrap">{formatDateTime(a.createdAt)}</TD>
                      <TD onClick={(e) => e.stopPropagation()}><DropdownMenu items={[{ label: "View Details", icon: <Eye className="h-3.5 w-3.5" />, onSelect: () => setOpen(a) }, ...(resourceHref(a) ? [{ label: `Open ${label(a.resourceType)}`, icon: <Eye className="h-3.5 w-3.5" />, href: resourceHref(a) }] : [])]} /></TD>
                    </TR>
                  ))}
                </tbody>
              </Table>
            </Card>
            {meta && meta.totalPages > 1 && <Pagination page={meta.page} pages={meta.totalPages} onChange={setPage} summary={`${meta.total} entries`} />}
          </>
        )}
      </QueryState>

      <Drawer open={!!open} onClose={() => setOpen(null)}>
        {open && (
          <>
            <div className="flex items-start justify-between border-b border-slate-100 px-5 py-4"><div><div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">{open.action}</div><div className="text-sm font-semibold text-slate-900">{label(open.action.replace(/\./g, "_"))}</div><div className="text-[11px] text-slate-400">{open.summary}</div></div><button onClick={() => setOpen(null)} className="flex h-6 w-6 items-center justify-center rounded-md border border-slate-200 text-slate-400" aria-label="Close"><X className="h-3.5 w-3.5" /></button></div>
            <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
              <dl className="divide-y divide-slate-100 text-xs">
                {([["Action", open.action], ["Performed By", open.actor ? <span key="b">{open.actor.name} <span className="font-normal text-slate-400">· {label(open.actor.role)}</span></span> : "System"], ["Company", open.company?.name ?? "Platform"], ["Resource Type", label(open.resourceType)], ["Resource ID", <span key="r" className="font-mono">{open.resourceId ?? "—"}</span>], ["Status", <Badge key="s" tone={tone(open.status)} dot>{label(open.status)}</Badge>], ["Date & Time", formatDateTime(open.createdAt)]] as [string, React.ReactNode][]).map(([k, v]) => <div key={k} className="flex items-center justify-between gap-4 py-2.5"><dt className="shrink-0 text-slate-400">{k}</dt><dd className="truncate text-right font-semibold text-slate-800">{v}</dd></div>)}
              </dl>
              {open.meta != null && typeof open.meta === "object" && Object.keys(open.meta as object).length > 0 && (
                <div><div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Details</div><dl className="mt-2 divide-y divide-slate-100 rounded-lg border border-slate-200 bg-slate-50/60 px-3 text-xs">{Object.entries(open.meta as Record<string, unknown>).map(([k, v]) => <div key={k} className="flex justify-between gap-4 py-2"><dt className="text-slate-400">{label(k)}</dt><dd className="truncate text-right font-medium text-slate-800">{Array.isArray(v) ? v.join(", ") : typeof v === "object" ? JSON.stringify(v) : String(v)}</dd></div>)}</dl></div>
              )}
              <Alert tone="blue" className="border-slate-200 bg-slate-50 text-slate-500" icon={<Info className="h-3.5 w-3.5 shrink-0" />}>Activity history is read-only and cannot be modified.</Alert>
            </div>
            <div className="flex gap-2 border-t border-slate-100 px-5 py-4">{resourceHref(open) && <Button href={resourceHref(open)} className="flex-1">Open {label(open.resourceType)}</Button>}<Button variant="secondary" onClick={() => setOpen(null)} className={resourceHref(open) ? "" : "flex-1"}>Close</Button></div>
          </>
        )}
      </Drawer>
    </div>
  );
}
