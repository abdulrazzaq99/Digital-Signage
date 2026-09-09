"use client";
import { Button } from "@/components/ui/button";
import { DotStatus, StatusBadge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { PillTabs, SearchInput } from "@/components/ui/input";
import { CompanyLogo, DropdownMenu, PageHeader, Pagination, Progress } from "@/components/ui/misc";
import { TD, TH, THead, TR, Table } from "@/components/ui/table";
import { companies, type Company } from "@/lib/data";
import { Eye, Pencil, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { CompanyFormModal, DeleteCompanyModal } from "./company-modals";

type Filter = "All" | "Active" | "Suspended" | "Inactive";

export function CompaniesTable() {
  const [filter, setFilter] = useState<Filter>("All");
  const [q, setQ] = useState("");
  const [create, setCreate] = useState(false);
  const [edit, setEdit] = useState<Company | null>(null);
  const [del, setDel] = useState<Company | null>(null);

  const rows = useMemo(() => companies.filter((c) => (filter === "All" || c.status === filter) && c.name.toLowerCase().includes(q.toLowerCase())), [filter, q]);

  return (
    <div className="space-y-5">
      <PageHeader title="Companies" subtitle="Manage customer companies, licenses, and screen capacity." action={<Button onClick={() => setCreate(true)}><Plus className="h-4 w-4" /> Add Company</Button>} />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <SearchInput placeholder="Search companies..." className="w-60" value={q} onChange={(e) => setQ(e.target.value)} />
          <PillTabs options={[{ value: "All", label: "All" }, { value: "Active", label: "Active" }, { value: "Suspended", label: "Suspended" }, { value: "Inactive", label: "Inactive" }]} value={filter} onChange={setFilter} />
        </div>
        <span className="text-xs text-slate-400">{companies.length} companies</span>
      </div>

      <Card>
        <Table>
          <THead>
            <tr>
              <TH>Company</TH><TH>Status</TH><TH>License</TH><TH>Screens</TH><TH className="text-center">Online</TH><TH className="text-center">Offline</TH><TH className="text-center">Available</TH><TH>Since</TH><TH className="text-right">Actions</TH>
            </tr>
          </THead>
          <tbody>
            {rows.map((c) => {
              const pct = (c.screensUsed / c.screenLimit) * 100;
              return (
                <TR key={c.id}>
                  <TD>
                    <Link href={`/companies/${c.id}`} className="flex items-center gap-3">
                      <CompanyLogo seed={c.seed} size="sm" />
                      <span><span className="block text-sm font-semibold text-slate-900">{c.name}</span><span className="block text-[11px] text-slate-400">{c.code}</span></span>
                    </Link>
                  </TD>
                  <TD><DotStatus status={c.status} /></TD>
                  <TD><StatusBadge status={c.license} /></TD>
                  <TD>
                    <div className="w-16">
                      <div className="text-xs"><span className="font-semibold text-slate-900">{c.screensUsed}</span><span className="text-slate-400"> / {c.screenLimit}</span></div>
                      <Progress value={pct} tone={pct >= 90 ? "amber" : "blue"} thin className="mt-1" />
                    </div>
                  </TD>
                  <TD className="text-center text-sm font-semibold text-green-600">{c.online || <span className="text-slate-300">—</span>}</TD>
                  <TD className="text-center text-sm font-semibold text-red-600">{c.offline || <span className="text-slate-300">—</span>}</TD>
                  <TD className="text-center text-sm font-semibold text-slate-700">{c.available}</TD>
                  <TD className="text-xs text-slate-400 whitespace-nowrap">{c.since}</TD>
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
        <Pagination page={1} pages={2} summary={`1–${rows.length} of ${companies.length} companies`} className="border-t border-slate-100 px-4 py-3" />
      </Card>

      <CompanyFormModal open={create} onClose={() => setCreate(false)} />
      <CompanyFormModal open={!!edit} onClose={() => setEdit(null)} company={edit} />
      <DeleteCompanyModal company={del} onClose={() => setDel(null)} />
    </div>
  );
}
