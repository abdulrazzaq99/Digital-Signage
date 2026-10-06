"use client";
import { CompanyFilter, useCompanyScope } from "@/components/admin/company-scope";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/misc";
import { CardGridSkeleton, EmptyState, QueryState } from "@/components/ui/query-state";
import { useGroups } from "@/lib/api/hooks/groups";
import { Layers, Monitor, Plus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { CompanyGate } from "@/components/screens/query-guards";
import { CreateGroupModal } from "./group-modals";

export function GroupsPage() {
  const scope = useCompanyScope();
  const groups = useGroups({ companyId: scope.companyId, enabled: !!scope.companyId });
  const [create, setCreate] = useState(false);
  return (
    <div className="space-y-5">
      <PageHeader title="Screen Groups" subtitle="Organize screens and publish content to multiple displays at once." action={<div className="flex flex-wrap items-center gap-2"><CompanyFilter value={scope.companyId} onChange={scope.setCompanyId} allLabel="Select company" /><Button onClick={() => setCreate(true)} disabled={!scope.companyId}><Plus className="h-4 w-4" /> Create Group</Button></div>} />
      <CompanyGate companyId={scope.companyId} skeleton={<CardGridSkeleton />} what="screen groups">
        <QueryState query={groups} skeleton={<CardGridSkeleton />} empty={<EmptyState icon={<Layers className="h-5 w-5" />} title={`${scope.companyName || "This company"} has no screen groups`} body="Groups let you publish to several screens in one step." action={<Button onClick={() => setCreate(true)}><Plus className="h-4 w-4" /> Create Group</Button>} />}>
          {({ data }) => (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {data.map((g) => {
                const offline = g.screenCount - g.onlineCount;
                return (
                  <Link key={g.id} href={scope.withCompany(`/screens/groups/${g.id}`)} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md">
                    <div className="relative flex aspect-[16/7] items-center justify-center bg-slate-900 text-slate-600">
                      <Monitor className="h-8 w-8" />
                      <span className="absolute right-2.5 top-2.5 rounded-md bg-slate-900/80 px-2 py-0.5 text-[10px] font-medium text-white">{g.screenCount} screen{g.screenCount === 1 ? "" : "s"}</span>
                    </div>
                    <div className="px-4 py-3">
                      <div className="text-sm font-semibold text-slate-900">{g.name}</div>
                      <div className="text-[11px] text-slate-400">{scope.companyName}{g.description ? ` · ${g.description}` : ""}</div>
                      <div className="mt-2.5 flex items-center gap-3 text-[11px] font-medium">
                        <span className="flex items-center gap-1.5 text-green-600"><span className="h-1.5 w-1.5 rounded-full bg-green-500" />{g.onlineCount} online</span>
                        {offline > 0 && <span className="flex items-center gap-1.5 text-slate-500"><span className="h-1.5 w-1.5 rounded-full bg-slate-400" />{offline} offline</span>}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </QueryState>
      </CompanyGate>
      <CreateGroupModal open={create} onClose={() => setCreate(false)} companyId={scope.companyId} />
    </div>
  );
}
