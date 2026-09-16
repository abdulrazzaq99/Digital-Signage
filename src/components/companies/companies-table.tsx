"use client";
import { Button } from "@/components/ui/button";
import { Badge, DotStatus, StatusBadge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { PillTabs, SearchInput } from "@/components/ui/input";
import { CompanyLogo, DropdownMenu, PageHeader, Pagination, Progress } from "@/components/ui/misc";
import { EmptyState, QueryState, TableSkeleton } from "@/components/ui/query-state";
import { TD, TH, THead, TR, Table } from "@/components/ui/table";
import { counts, useCompanies } from "@/lib/api/hooks/companies";
import type { Company } from "@/lib/api/types";
import { formatDate, label } from "@/lib/format";
import { Building2, Eye, Pencil, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { CompanyFormModal, DeleteCompanyModal } from "./company-modals";

const STATUSES: ("All" | Company["status"])[] = ["All", "ACTIVE", "SUSPENDED", "INACTIVE"];

export function CompaniesTable() {
  const [status, setStatus] = useState<"All" | Company["status"]>("All");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [create, setCreate] = useState(false);
  const [edit, setEdit] = useState<Company | null>(null);
  const [del, setDel] = useState<Company | null>(null);
  const companies = useCompanies({ search: q || undefined, status: status === "All" ? undefined : status, page });

  return (
    <div className="space-y-5">
      <PageHeader title="Companies" subtitle="Manage customer companies, licenses, and screen capacity." action={<Button onClick={() => setCreate(true)}><Plus className="h-4 w-4" /> Add Company</Button>} />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <SearchInput placeholder="Search companies..." className="w-60" value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} />
          <PillTabs options={STATUSES.map((s) => ({ value: s, label: s === "All" ? "All" : label(s) }))} value={status} onChange={(v) => { setStatus(v); setPage(1); }} />
        </div>
        <span className="text-xs text-slate-400">{companies.data?.meta?.total ?? 0} companies</span>
      </div>

      <QueryState query={companies} skeleton={<TableSkeleton rows={8} />} empty={<EmptyState icon={<Building2 className="h-5 w-5" />} title={q || status !== "All" ? "No companies match" : "No companies yet"} body="Onboard a customer company to start pairing screens." action={<Button onClick={() => setCreate(true)}><Plus className="h-4 w-4" /> Add Company</Button>} />}>
        {({ data, meta }) => (
          <Card>
            <Table>
              <THead>
                <tr><TH>Company</TH><TH>Status</TH><TH>License</TH><TH>Screens</TH><TH className="text-center">Online</TH><TH className="text-center">Offline</TH><TH className="text-center">Available</TH><TH>Since</TH><TH className="text-right">Actions</TH></tr>
              </THead>
              <tbody>
                {data.map((c) => {
                  const limit = c.license?.screenLimit ?? 0;
                  const pct = limit ? (counts(c).screens / limit) * 100 : 0;
                  return (
                    <TR key={c.id}>
                      <TD>
                        <Link href={`/companies/${c.id}`} className="flex items-center gap-3">
                          <CompanyLogo seed={c.code} name={c.name} size="sm" />
                          <span><span className="block whitespace-nowrap text-sm font-semibold text-slate-900">{c.name}</span><span className="block text-[11px] text-slate-400">{c.code}</span></span>
                        </Link>
                      </TD>
                      <TD><DotStatus status={label(c.status)} /></TD>
                      <TD><span className="flex items-center gap-1.5"><StatusBadge status={label(c.license?.state ?? "DISABLED")} />{c.overLimit && <Badge tone="red">Over limit</Badge>}</span></TD>
                      <TD>
                        <div className="w-16">
                          <div className="text-xs"><span className="font-semibold text-slate-900">{counts(c).screens}</span><span className="text-slate-400"> / {limit}</span></div>
                          <Progress value={Math.min(100, pct)} tone={pct >= 90 ? "amber" : "blue"} thin className="mt-1" />
                        </div>
                      </TD>
                      <TD className="text-center text-sm font-semibold text-green-600">{counts(c).online || <span className="text-slate-300">—</span>}</TD>
                      <TD className="text-center text-sm font-semibold text-red-600">{counts(c).offline || <span className="text-slate-300">—</span>}</TD>
                      <TD className="text-center text-sm font-semibold text-slate-700">{counts(c).available}</TD>
                      <TD className="text-xs text-slate-400 whitespace-nowrap">{formatDate(c.createdAt)}</TD>
                      <TD className="text-right">
                        <DropdownMenu items={[
                          { label: "View Details", icon: <Eye className="h-3.5 w-3.5" />, href: `/companies/${c.id}` },
                          { label: "Edit Company", icon: <Pencil className="h-3.5 w-3.5" />, onSelect: () => setEdit(c) },
                          { label: "Delete", icon: <Trash2 className="h-3.5 w-3.5" />, tone: "danger", onSelect: () => setDel(c) },
                        ]} />
                      </TD>
                    </TR>
                  );
                })}
              </tbody>
            </Table>
            {meta && <Pagination page={meta.page} pages={meta.totalPages} onChange={setPage} summary={`${data.length ? (meta.page - 1) * meta.pageSize + 1 : 0}–${(meta.page - 1) * meta.pageSize + data.length} of ${meta.total} companies`} className="border-t border-slate-100 px-4 py-3" />}
          </Card>
        )}
      </QueryState>

      <CompanyFormModal open={create} onClose={() => setCreate(false)} />
      <CompanyFormModal open={!!edit} onClose={() => setEdit(null)} company={edit} />
      <DeleteCompanyModal company={del} onClose={() => setDel(null)} />
    </div>
  );
}
