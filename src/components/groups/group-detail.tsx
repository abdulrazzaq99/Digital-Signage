"use client";
import { useCompanyScope } from "@/components/admin/company-scope";
import { PublishModal } from "@/components/screens/publish-modal";
import { Button } from "@/components/ui/button";
import { Badge, StatusBadge } from "@/components/ui/badge";
import { Card, CardHeader, StatCard } from "@/components/ui/card";
import { SearchInput } from "@/components/ui/input";
import { Alert, Breadcrumb, DropdownMenu, Progress } from "@/components/ui/misc";
import { QueryState, Skeleton } from "@/components/ui/query-state";
import { TD, TH, THead, TR, Table } from "@/components/ui/table";
import { useGroup } from "@/lib/api/hooks/groups";
import { screenStatusLabel, useScreens } from "@/lib/api/hooks/screens";
import type { ScreenGroup } from "@/lib/api/types";
import { formatDate, label, timeAgo } from "@/lib/format";
import { useDebouncedValue } from "@/lib/use-debounced-value";
import { CompanyGate } from "@/components/screens/query-guards";
import { AlertTriangle, Pencil, Send, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CreateGroupModal, DeleteGroupModal } from "./group-modals";

function Detail({ group, companyId, companyName }: { group: ScreenGroup; companyId: string; companyName: string }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [edit, setEdit] = useState(false);
  const [del, setDel] = useState(false);
  const [publish, setPublish] = useState(false);
  const search = useDebouncedValue(q.trim(), 300);
  const members = useScreens({ groupId: group.id, search: search || undefined, pageSize: 100 }, { companyId });
  const online = group.onlineCount;
  const offline = group.screenCount - online;
  const pct = group.screenCount ? Math.round((online / group.screenCount) * 100) : 0;
  const assignments = new Set((members.data?.data ?? []).map((s) => s.assignment?.name).filter(Boolean));
  const currentContent = assignments.size === 1 ? [...assignments][0] : assignments.size > 1 ? "Mixed" : "None";

  return (
    <div className="space-y-5">
      <Breadcrumb items={[{ label: "Screen Groups", href: `/screens/groups?company=${companyId}` }, { label: group.name }]} />
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5"><h1 className="text-xl font-bold tracking-tight text-slate-900">{group.name}</h1>{offline > 0 ? <Badge tone="amber" dot>Needs Attention</Badge> : <Badge tone="green" dot>Healthy</Badge>}</div>
          <p className="mt-1 flex items-center gap-2 text-xs text-slate-400">{companyName} <span>·</span> {group.screenCount} Screens <span>·</span> <span className="font-medium text-green-600">● {online} Online</span> <span>·</span> <span className="font-medium text-red-600">● {offline} Offline</span></p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={() => setEdit(true)}><Pencil className="h-3.5 w-3.5" /> Edit Group</Button>
          <Button onClick={() => setPublish(true)} disabled={group.screenCount === 0}><Send className="h-3.5 w-3.5" /> Publish Content</Button>
          <DropdownMenu items={[{ label: "Delete Group", icon: <Trash2 className="h-3.5 w-3.5" />, tone: "danger", onSelect: () => setDel(true) }]} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard value={group.screenCount} label="Total Screens" />
        <StatCard value={online} label="Online" tone="green" />
        <StatCard value={offline} label="Offline" tone="red" />
        <StatCard value={<span className="text-base">{currentContent}</span>} label="Current Assignment" />
      </div>

      {offline > 0 && <Alert tone="amber" icon={<AlertTriangle className="h-3.5 w-3.5 shrink-0" />}><span className="font-semibold">{offline} screen{offline === 1 ? " is" : "s are"} currently offline.</span><br />Offline screens receive the latest assignment when they reconnect.</Alert>}

      <div className="grid gap-5 xl:grid-cols-[1fr_300px]">
        <Card>
          <CardHeader title="Screens in this Group" subtitle="Monitor and manage screens assigned to this group." action={<Button variant="secondary" size="sm" onClick={() => setEdit(true)}><Pencil className="h-3.5 w-3.5" /> Manage Screens</Button>} />
          <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3"><SearchInput placeholder="Search screens..." className="w-full sm:w-52" maxLength={120} value={q} onChange={(e) => setQ(e.target.value)} /><span className="text-xs text-slate-400">{members.data?.meta?.total ?? group.screenCount} screens</span></div>
          <QueryState query={members} empty={<div className="px-5 py-8 text-center text-xs text-slate-400">{search ? "No screens in this group match." : "No screens in this group."}</div>}>
            {({ data }) => (
              <Table>
                <THead><tr><TH>Screen</TH><TH>Status</TH><TH>Orientation</TH><TH>Content</TH><TH>Last Seen</TH><TH>Sync</TH><TH> </TH></tr></THead>
                <tbody>
                  {data.map((s) => (
                    <TR key={s.id}>
                      <TD><div className="text-sm font-semibold text-slate-900">{s.name}</div><div className="text-[11px] text-slate-400">{s.location ?? "—"}</div></TD>
                      <TD><StatusBadge status={screenStatusLabel(s.status)} /></TD>
                      <TD className="text-xs whitespace-nowrap">{s.orientation === "LANDSCAPE" ? "↔" : "↕"} {label(s.orientation)}</TD>
                      <TD className="text-xs">{s.assignment?.name ?? "—"}</TD>
                      <TD className="text-xs text-slate-400 whitespace-nowrap">{timeAgo(s.lastSeenAt)}</TD>
                      <TD><StatusBadge status={label(s.syncState)} /></TD>
                      <TD><DropdownMenu items={[{ label: "View Details", href: `/screens/${s.id}` }]} /></TD>
                    </TR>
                  ))}
                </tbody>
              </Table>
            )}
          </QueryState>
        </Card>

        <div className="space-y-5">
          <Card>
            <CardHeader title="Group Health" />
            <div className="space-y-2 px-5 py-4 text-xs">
              <div className="flex justify-between"><span className="flex items-center gap-2 text-slate-500"><span className="h-1.5 w-1.5 rounded-full bg-green-500" />Online</span><span className="font-semibold text-slate-900">{online}</span></div>
              <div className="flex justify-between"><span className="flex items-center gap-2 text-slate-500"><span className="h-1.5 w-1.5 rounded-full bg-red-500" />Offline</span><span className="font-semibold text-slate-900">{offline}</span></div>
              <Progress value={pct} tone="green" className="mt-3" />
              <div className="text-right text-[11px] text-slate-400">{pct}% online</div>
            </div>
          </Card>
          <Card>
            <CardHeader title="Group Info" />
            <dl className="space-y-2 px-5 py-4 text-xs">
              <div className="flex justify-between"><dt className="text-slate-400">Company</dt><dd className="font-semibold text-slate-800">{companyName}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-400">Created</dt><dd className="font-semibold text-slate-800">{formatDate(group.createdAt)}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-400">Description</dt><dd className="font-semibold text-slate-800">{group.description || "—"}</dd></div>
            </dl>
          </Card>
        </div>
      </div>

      {edit && <CreateGroupModal open={edit} onClose={() => setEdit(false)} companyId={companyId} group={group} />}
      <DeleteGroupModal open={del} onClose={() => setDel(false)} group={group} companyId={companyId} onDeleted={() => router.replace(`/screens/groups?company=${companyId}`)} />
      <PublishModal open={publish} onClose={() => setPublish(false)} companyId={companyId} defaultGroup={group.id} />
    </div>
  );
}

export function GroupDetail({ id }: { id: string }) {
  const scope = useCompanyScope();
  const group = useGroup(id, { companyId: scope.companyId, enabled: !!scope.companyId });
  const skeleton = <div className="space-y-5"><Skeleton className="h-16" /><Skeleton className="h-64" /></div>;
  // Without a company the group query is disabled and would stay "pending" forever; the gate explains instead.
  return (
    <CompanyGate companyId={scope.companyId} skeleton={skeleton} what="this group">
      <QueryState query={group} skeleton={skeleton}>
        {(g) => <Detail key={`${g.id}-${(g.screenIds ?? []).join(",")}`} group={g} companyId={scope.companyId} companyName={scope.companyName} />}
      </QueryState>
    </CompanyGate>
  );
}
