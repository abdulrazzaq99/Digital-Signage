"use client";
import { Badge, StatusBadge } from "@/components/ui/badge";
import { Card, StatCard } from "@/components/ui/card";
import { PillTabs, SearchInput } from "@/components/ui/input";
import { CompanyLogo, DropdownMenu, PageHeader, Progress } from "@/components/ui/misc";
import { EmptyState, QueryState, TableSkeleton } from "@/components/ui/query-state";
import { TD, TH, THead, TR, Table } from "@/components/ui/table";
import { counts, useCompanies } from "@/lib/api/hooks/companies";
import type { Company } from "@/lib/api/types";
import { label } from "@/lib/format";
import { Ban, Eye, Pencil, PauseCircle, Play } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { ActivateLicenseModal, DisableLicenseModal, EditLimitModal, SuspendLicenseModal } from "./license-modals";

type Filter = "All" | "Active" | "Suspended" | "Expired / Disabled" | "Limit Reached";
const FILTERS: Filter[] = ["All", "Active", "Suspended", "Expired / Disabled", "Limit Reached"];

export function LicensesTable() {
  const [filter, setFilter] = useState<Filter>("All");
  const [q, setQ] = useState("");
  const [edit, setEdit] = useState<Company | null>(null);
  const [suspend, setSuspend] = useState<Company | null>(null);
  const [disable, setDisable] = useState<Company | null>(null);
  const [activate, setActivate] = useState<Company | null>(null);
  // Licences are one per company; the companies list carries licence state plus live screen counts.
  const companies = useCompanies({ pageSize: 100 });
  const all = useMemo(() => companies.data?.data ?? [], [companies.data]);
  const state = (c: Company) => c.license?.state ?? "DISABLED";

  const rows = useMemo(() => all.filter((c) => {
    if (!c.name.toLowerCase().includes(q.toLowerCase())) return false;
    if (filter === "All") return true;
    if (filter === "Active") return state(c) === "ACTIVE";
    if (filter === "Suspended") return state(c) === "SUSPENDED";
    if (filter === "Expired / Disabled") return state(c) === "EXPIRED" || state(c) === "DISABLED";
    return counts(c).available === 0;
  }), [all, filter, q]);

  const stats = {
    total: all.length,
    active: all.filter((c) => state(c) === "ACTIVE").length,
    suspended: all.filter((c) => state(c) === "SUSPENDED").length,
    expired: all.filter((c) => state(c) === "EXPIRED" || state(c) === "DISABLED").length,
    capacity: all.filter((c) => counts(c).available === 0).length,
  };

  return (
    <div className="space-y-5">
      <PageHeader title="License Management" subtitle="Manage company screen limits and license status." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard value={stats.total} label="Total Licenses" tone="blue" />
        <StatCard value={stats.active} label="Active" tone="green" />
        <StatCard value={stats.suspended} label="Suspended" tone="amber" />
        <StatCard value={stats.expired} label="Expired / Disabled" />
        <StatCard value={stats.capacity} label="At Capacity" tone="red" />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <SearchInput placeholder="Search companies..." className="w-60" value={q} onChange={(e) => setQ(e.target.value)} />
          <PillTabs options={FILTERS.map((v) => ({ value: v, label: v }))} value={filter} onChange={setFilter} />
        </div>
        <span className="text-xs text-slate-400">{rows.length} companies</span>
      </div>

      <QueryState query={companies} skeleton={<TableSkeleton rows={8} />} empty={<EmptyState title="No companies yet" body="Licences are created with each company." />}>
        {() => (
          <Card>
            <Table>
              <THead><tr><TH>Company</TH><TH>Screen Limit</TH><TH>Used Screens</TH><TH>Available Slots</TH><TH>Status</TH><TH className="text-right">Actions</TH></tr></THead>
              <tbody>
                {rows.map((c) => {
                  const limit = c.license?.screenLimit ?? 0;
                  const used = counts(c).screens;
                  const pct = limit ? Math.min(100, (used / limit) * 100) : 0;
                  return (
                    <TR key={c.id}>
                      <TD>
                        <Link href={`/licenses/${c.id}`} className="flex items-center gap-3">
                          <CompanyLogo seed={c.code} name={c.name} size="sm" />
                          <span><span className="block whitespace-nowrap text-sm font-semibold text-slate-900">{c.name}</span><span className="block text-[11px] text-slate-400">{c.code}</span></span>
                        </Link>
                      </TD>
                      <TD><span className="text-sm font-bold text-slate-900">{limit}</span> <span className="text-[10px] text-slate-400">screens</span></TD>
                      <TD>
                        <div className="w-20">
                          <div className="text-xs"><span className="font-bold text-slate-900">{used}</span><span className="text-slate-400"> / {limit}</span></div>
                          <Progress value={pct} tone={c.overLimit ? "red" : pct >= 80 ? "amber" : "blue"} thin className="mt-1" />
                        </div>
                      </TD>
                      <TD>{c.overLimit ? <Badge tone="red">Over limit</Badge> : counts(c).available <= 2 ? <Badge tone="amber">{counts(c).available} left</Badge> : <span className="text-sm font-semibold text-slate-700">{counts(c).available}</span>}</TD>
                      <TD><StatusBadge status={label(state(c))} /></TD>
                      <TD className="text-right">
                        <DropdownMenu items={[
                          { label: "View License", icon: <Eye className="h-3.5 w-3.5" />, href: `/licenses/${c.id}` },
                          { label: "Edit Screen Limit", icon: <Pencil className="h-3.5 w-3.5" />, onSelect: () => setEdit(c) },
                          state(c) === "ACTIVE" ? { label: "Suspend", icon: <PauseCircle className="h-3.5 w-3.5" />, tone: "danger", onSelect: () => setSuspend(c) } : { label: "Activate", icon: <Play className="h-3.5 w-3.5" />, onSelect: () => setActivate(c) },
                          { label: "Disable", icon: <Ban className="h-3.5 w-3.5" />, onSelect: () => setDisable(c), disabled: state(c) === "DISABLED" },
                        ]} />
                      </TD>
                    </TR>
                  );
                })}
              </tbody>
            </Table>
            {rows.length === 0 && <div className="px-6 py-14 text-center"><div className="text-sm font-semibold text-slate-900">No licenses match your filters</div><div className="mt-1 text-xs text-slate-400">Try adjusting your search or filter.</div></div>}
          </Card>
        )}
      </QueryState>

      <EditLimitModal company={edit} onClose={() => setEdit(null)} />
      <SuspendLicenseModal company={suspend} onClose={() => setSuspend(null)} />
      <DisableLicenseModal company={disable} onClose={() => setDisable(null)} />
      <ActivateLicenseModal company={activate} onClose={() => setActivate(null)} />
    </div>
  );
}
