"use client";
import { CompanyFilter, useCompanyScope } from "@/components/admin/company-scope";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { PageHeader, Progress } from "@/components/ui/misc";
import { EmptyState, QueryState } from "@/components/ui/query-state";
import { TD, TH, THead, TR, Table } from "@/components/ui/table";
import { useCanvases } from "@/lib/api/hooks/canvas";
import { formatDate, label } from "@/lib/format";
import { LayoutPanelTop, Plus } from "lucide-react";
import Link from "next/link";
import { swatches } from "./canvas-shared";

export function CanvasList() {
  const scope = useCompanyScope();
  const canvases = useCanvases({ companyId: scope.companyId, enabled: !!scope.companyId });
  return (
    <div className="space-y-5">
      <PageHeader title="Synchronized Canvas" subtitle="Combine adjacent compatible screens into one synchronized logical display." action={<div className="flex flex-wrap items-center gap-2"><CompanyFilter value={scope.companyId} onChange={scope.setCompanyId} allLabel="Select company" /><Button href={scope.withCompany("/screens/canvas/new")}><Plus className="h-4 w-4" /> Create Canvas</Button></div>} />
      <QueryState query={canvases} empty={<EmptyState icon={<LayoutPanelTop className="h-5 w-5" />} title={`${scope.companyName || "This company"} has no canvases`} body="Combine two or more landscape screens into one synchronized display." action={<Button href={scope.withCompany("/screens/canvas/new")}><Plus className="h-4 w-4" /> Create Canvas</Button>} />}>
        {({ data }) => (
          <Card>
            <Table>
              <THead><tr><TH>Canvas Name</TH><TH>Screens</TH><TH>Layout</TH><TH>Readiness</TH><TH>Status</TH><TH className="text-right">Actions</TH></tr></THead>
              <tbody>
                {data.map((c) => {
                  const n = c.members.length;
                  return (
                    <TR key={c.id}>
                      <TD>
                        <Link href={scope.withCompany(`/screens/canvas/${c.id}`)} className="flex items-center gap-3">
                          <span className="flex h-8 w-12 items-center justify-center rounded bg-slate-900 text-slate-500"><LayoutPanelTop className="h-3.5 w-3.5" /></span>
                          <span><span className="block text-sm font-semibold text-slate-900">{c.name}</span><span className="block text-[11px] text-slate-400">Created {formatDate(c.createdAt)}</span></span>
                        </Link>
                      </TD>
                      <TD><span className="flex items-center gap-1.5">{c.members.map((m, i) => <span key={m.screenId} className={`h-2.5 w-4 rounded-sm ${swatches[i % swatches.length]}`} />)}<span className="ml-1 text-xs font-semibold text-slate-700">{n}</span></span></TD>
                      <TD className="text-xs whitespace-nowrap">{n} × {label(c.members[0]?.orientation ?? "LANDSCAPE")}</TD>
                      <TD><div className="w-20"><div className={`text-xs font-semibold ${c.readyCount === n ? "text-green-600" : "text-amber-600"}`}>{c.readyCount} of {n} ready</div><Progress value={n ? (c.readyCount / n) * 100 : 0} tone={c.readyCount === n ? "green" : "amber"} thin className="mt-1" /></div></TD>
                      <TD><StatusBadge status={label(c.status)} /></TD>
                      <TD className="text-right"><Button href={scope.withCompany(`/screens/canvas/${c.id}`)} variant="secondary" size="sm">View</Button></TD>
                    </TR>
                  );
                })}
              </tbody>
            </Table>
          </Card>
        )}
      </QueryState>
    </div>
  );
}
