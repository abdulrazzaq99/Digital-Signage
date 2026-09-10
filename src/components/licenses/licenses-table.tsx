"use client";
import { Badge, StatusBadge } from "@/components/ui/badge";
import { Card, StatCard } from "@/components/ui/card";
import { PillTabs, SearchInput } from "@/components/ui/input";
import { CompanyLogo, DropdownMenu, PageHeader, Progress } from "@/components/ui/misc";
import { TD, TH, THead, TR, Table } from "@/components/ui/table";
import { companies, type Company } from "@/lib/data";
import { Ban, Eye, Pencil, PauseCircle } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { DisableLicenseModal, EditLimitModal, SuspendLicenseModal } from "./license-modals";

type Filter = "All" | "Active" | "Suspended" | "Expired / Disabled" | "Limit Reached";

export function LicensesTable() {
  const [filter, setFilter] = useState<Filter>("All");
  const [q, setQ] = useState("");
  const [edit, setEdit] = useState<Company | null>(null);
  const [suspend, setSuspend] = useState<Company | null>(null);
  const [disable, setDisable] = useState<Company | null>(null);

  const rows = useMemo(() => companies.filter((c) => {
    if (!c.name.toLowerCase().includes(q.toLowerCase())) return false;
    if (filter === "All") return true;
    if (filter === "Active") return c.license === "Active";
    if (filter === "Suspended") return c.license === "Suspended";
    if (filter === "Expired / Disabled") return c.license === "Expired" || c.license === "Disabled";
    return c.available === 0;
  }), [filter, q]);

  const counts = {
    total: companies.length,
    active: companies.filter((c) => c.license === "Active").length,
    suspended: companies.filter((c) => c.license === "Suspended").length,
    expired: companies.filter((c) => c.license === "Expired" || c.license === "Disabled").length,
    capacity: companies.filter((c) => c.available === 0).length,
  };

  return (
    <div className="space-y-5">
      <PageHeader title="License Management" subtitle="Manage company screen limits and license status." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard value={counts.total} label="Total Licenses" tone="blue" />
        <StatCard value={counts.active} label="Active" tone="green" />
        <StatCard value={counts.suspended} label="Suspended" tone="amber" />
        <StatCard value={counts.expired} label="Expired / Disabled" />
        <StatCard value={counts.capacity} label="At Capacity" tone="red" />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <SearchInput placeholder="Search companies..." className="w-60" value={q} onChange={(e) => setQ(e.target.value)} />
          <PillTabs options={(["All", "Active", "Suspended", "Expired / Disabled", "Limit Reached"] as Filter[]).map((v) => ({ value: v, label: v }))} value={filter} onChange={setFilter} />
        </div>
        <span className="text-xs text-slate-400">{rows.length} companies</span>
      </div>

      <Card>
        <Table>
          <THead><tr><TH>Company</TH><TH>Screen Limit</TH><TH>Used Screens</TH><TH>Available Slots</TH><TH>Status</TH><TH className="text-right">Actions</TH></tr></THead>
          <tbody>
            {rows.map((c) => {
              const pct = (c.screensUsed / c.screenLimit) * 100;
              return (
                <TR key={c.id}>
                  <TD>
                    <Link href={`/licenses/${c.id}`} className="flex items-center gap-3">
                      <CompanyLogo seed={c.seed} size="sm" />
                      <span><span className="block text-sm font-semibold text-slate-900">{c.name}</span><span className="block text-[11px] text-slate-400">{c.code}</span></span>
                    </Link>
                  </TD>
                  <TD><span className="text-sm font-bold text-slate-900">{c.screenLimit}</span> <span className="text-[10px] text-slate-400">screens</span></TD>
                  <TD>
                    <div className="w-20">
                      <div className="text-xs"><span className="font-bold text-slate-900">{c.screensUsed}</span><span className="text-slate-400"> / {c.screenLimit}</span></div>
                      <Progress value={pct} tone={pct >= 80 ? "amber" : "blue"} thin className="mt-1" />
                    </div>
                  </TD>
                  <TD>{c.available <= 2 ? <Badge tone="amber">{c.available} left</Badge> : <span className="text-sm font-semibold text-slate-700">{c.available}</span>}</TD>
                  <TD><StatusBadge status={c.license} /></TD>
                  <TD className="text-right">
                    <DropdownMenu items={[
                      { label: "View License", icon: <Eye className="h-3.5 w-3.5" />, href: `/licenses/${c.id}` },
                      { label: "Edit Screen Limit", icon: <Pencil className="h-3.5 w-3.5" />, onSelect: () => setEdit(c) },
                      { label: "Suspend", icon: <PauseCircle className="h-3.5 w-3.5" />, tone: "danger", onSelect: () => setSuspend(c), disabled: c.license !== "Active" },
                      { label: "Disable", icon: <Ban className="h-3.5 w-3.5" />, onSelect: () => setDisable(c), disabled: c.license === "Disabled" },
                    ]} />
                  </TD>
                </TR>
              );
            })}
          </tbody>
        </Table>
      </Card>

      <EditLimitModal company={edit} onClose={() => setEdit(null)} />
      <SuspendLicenseModal company={suspend} onClose={() => setSuspend(null)} />
      <DisableLicenseModal company={disable} onClose={() => setDisable(null)} />
    </div>
  );
}
