"use client";
import { Button } from "@/components/ui/button";
import { Badge, StatusBadge } from "@/components/ui/badge";
import { Card, CardHeader, StatCard } from "@/components/ui/card";
import { FilterSelect, SearchInput } from "@/components/ui/input";
import { Alert, Breadcrumb, DropdownMenu, Progress } from "@/components/ui/misc";
import { TD, TH, THead, TR, Table } from "@/components/ui/table";
import { mainLobbyGroup as g } from "@/lib/data";
import { img } from "@/lib/utils";
import { AlertTriangle, Pencil, Plus, Send, Trash2 } from "lucide-react";
import { useState } from "react";
import { PublishModal } from "@/components/screens/publish-modal";
import { DeleteGroupModal } from "./group-modals";

export function GroupDetail() {
  const [del, setDel] = useState(false);
  const [publish, setPublish] = useState(false);
  const online = g.screens.filter((s) => s.status === "Online").length;
  const offline = g.screens.length - online;
  return (
    <div className="space-y-5">
      <Breadcrumb items={[{ label: "Screen Groups", href: "/screens/groups" }, { label: g.name }]} />
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5"><h1 className="text-xl font-bold tracking-tight text-slate-900">{g.name}</h1><Badge tone="amber" dot>Needs Attention</Badge></div>
          <p className="mt-1 flex items-center gap-2 text-xs text-slate-400">{g.company} <span>·</span> {g.screens.length} Screens <span>·</span> <span className="font-medium text-green-600">● {online} Online</span> <span>·</span> <span className="font-medium text-red-600">● {offline} Offline</span></p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary"><Pencil className="h-3.5 w-3.5" /> Edit Group</Button>
          <Button onClick={() => setPublish(true)}><Send className="h-3.5 w-3.5" /> Publish Content</Button>
          <DropdownMenu items={[{ label: "Delete Group", icon: <Trash2 className="h-3.5 w-3.5" />, tone: "danger", onSelect: () => setDel(true) }]} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard value={g.screens.length} label="Total Screens" />
        <StatCard value={online} label="Online" tone="green" />
        <StatCard value={offline} label="Offline" tone="red" />
        <StatCard value={<span className="text-base">{g.content}</span>} label="Current Assignment" />
      </div>

      <Alert tone="amber" icon={<AlertTriangle className="h-3.5 w-3.5 shrink-0" />}><span className="font-semibold">{offline} screen in this group is currently offline.</span><br />Offline screens will receive the latest assignment when they reconnect.</Alert>

      <div className="grid gap-5 xl:grid-cols-[1fr_300px]">
        <Card>
          <CardHeader title="Screens in this Group" subtitle="Monitor and manage screens assigned to this group." action={<Button variant="secondary" size="sm"><Plus className="h-3.5 w-3.5" /> Add Screens</Button>} />
          <div className="flex items-center justify-between gap-3 px-5 py-3"><div className="flex gap-2"><SearchInput placeholder="Search screens..." className="w-52" /><FilterSelect label="All Statuses" /><FilterSelect label="All Orientations" /></div><span className="text-xs text-slate-400">{g.screens.length} screens</span></div>
          <Table>
            <THead><tr><TH>Screen</TH><TH>Status</TH><TH>Orientation</TH><TH>Content</TH><TH>Last Connection</TH><TH>Sync</TH><TH> </TH></tr></THead>
            <tbody>
              {g.screens.map((s) => (
                <TR key={s.name}>
                  <TD><div className="text-sm font-semibold text-slate-900">{s.name}</div><div className="text-[11px] text-slate-400">{s.location}</div></TD>
                  <TD><StatusBadge status={s.status} /></TD>
                  <TD className="text-xs whitespace-nowrap">{s.orientation === "Landscape" ? "↔" : "↕"} {s.orientation}</TD>
                  <TD className="text-xs">{s.content}</TD>
                  <TD className="text-xs text-slate-400 whitespace-nowrap">{s.lastSync}</TD>
                  <TD><StatusBadge status={s.sync} /></TD>
                  <TD><DropdownMenu items={[{ label: "View Details", href: "/screens/lobby-display-01" }, { label: "Remove from group", tone: "danger" }]} /></TD>
                </TR>
              ))}
            </tbody>
          </Table>
        </Card>

        <div className="space-y-5">
          <Card>
            <CardHeader title="Current Assignment" />
            <div className="p-4">
              <img src={img("lobby1", 560, 315)} alt="" className="aspect-video w-full rounded-lg object-cover" />
              <div className="mt-3 text-sm font-semibold text-slate-900">{g.content}</div>
              <div className="text-[11px] text-slate-400">{g.contentItems} items · {g.contentDuration}</div>
              <div className="mt-3 flex items-center justify-between"><Badge tone="green" dot>Live</Badge><Button variant="secondary" size="sm">View Playlist</Button></div>
            </div>
          </Card>
          <Card>
            <CardHeader title="Group Health" />
            <div className="space-y-2 px-5 py-4 text-xs">
              <div className="flex justify-between"><span className="flex items-center gap-2 text-slate-500"><span className="h-1.5 w-1.5 rounded-full bg-green-500" />Online</span><span className="font-semibold text-slate-900">{online}</span></div>
              <div className="flex justify-between"><span className="flex items-center gap-2 text-slate-500"><span className="h-1.5 w-1.5 rounded-full bg-red-500" />Offline</span><span className="font-semibold text-slate-900">{offline}</span></div>
              <div className="flex justify-between"><span className="flex items-center gap-2 text-slate-500"><span className="h-1.5 w-1.5 rounded-full bg-amber-500" />Syncing</span><span className="font-semibold text-slate-900">0</span></div>
              <Progress value={(online / g.screens.length) * 100} tone="green" className="mt-3" />
              <div className="text-right text-[11px] text-slate-400">{Math.round((online / g.screens.length) * 100)}% online</div>
            </div>
          </Card>
          <Card>
            <CardHeader title="Group Info" />
            <dl className="space-y-2 px-5 py-4 text-xs">
              <div className="flex justify-between"><dt className="text-slate-400">Company</dt><dd className="font-semibold text-slate-800">{g.company}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-400">Created</dt><dd className="font-semibold text-slate-800">{g.created}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-400">Total Screens</dt><dd className="font-semibold text-slate-800">{g.screens.length} screens</dd></div>
            </dl>
          </Card>
        </div>
      </div>

      <DeleteGroupModal open={del} onClose={() => setDel(false)} name={g.name} count={g.screens.length} />
      <PublishModal open={publish} onClose={() => setPublish(false)} />
    </div>
  );
}
