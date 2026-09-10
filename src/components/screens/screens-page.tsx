"use client";
import { Button } from "@/components/ui/button";
import { Badge, StatusBadge } from "@/components/ui/badge";
import { Card, StatCard } from "@/components/ui/card";
import { FilterSelect, SearchInput } from "@/components/ui/input";
import { DropdownMenu, PageHeader, Pagination } from "@/components/ui/misc";
import { TD, TH, THead, TR, Table } from "@/components/ui/table";
import { screens } from "@/lib/data";
import { cn, img } from "@/lib/utils";
import { Eye, LayoutGrid, List, Plus, Trash2, User } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { AddScreenModal } from "./add-screen-modal";
import { ScreenCard } from "./screen-card";

type Tab = "all" | "personal" | "customer" | "groups";

export function ScreensPage() {
  const [tab, setTab] = useState<Tab>("all");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [q, setQ] = useState("");
  const [add, setAdd] = useState(false);

  const list = useMemo(() => screens.filter((s) => {
    if (!s.name.toLowerCase().includes(q.toLowerCase())) return false;
    if (tab === "personal") return !!s.personal;
    if (tab === "customer") return !s.personal;
    return true;
  }), [tab, q]);

  const tabs: { value: Tab; label: string; count: number }[] = [
    { value: "all", label: "All Screens", count: screens.length },
    { value: "personal", label: "Personal Screens", count: screens.filter((s) => s.personal).length },
    { value: "customer", label: "Customer Screens", count: screens.filter((s) => !s.personal).length },
    { value: "groups", label: "Groups", count: 4 },
  ];

  const start = tab === "personal" ? 97 : 1;

  return (
    <div className="space-y-5">
      <PageHeader title="Screens" subtitle="Manage, monitor and control screens across the platform." action={<Button onClick={() => setAdd(true)}><Plus className="h-4 w-4" /> Add Screen</Button>} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard value="186" label="Total Screens" />
        <StatCard value="164" label="Online" tone="green" />
        <StatCard value="22" label="Offline" tone="red" />
        <StatCard value="6" label="Syncing" tone="blue" />
      </div>

      <div className="border-b border-slate-200">
        <div className="-mb-px flex gap-6">
          {tabs.map((t) => (
            <button key={t.value} onClick={() => setTab(t.value)} className={cn("flex items-center gap-2 border-b-2 pb-3 text-sm font-medium transition-colors", tab === t.value ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-800")}>
              {t.label}<span className={cn("rounded-md px-1.5 py-0.5 text-[10px] font-semibold", tab === t.value ? "bg-blue-50 text-blue-600" : "bg-slate-100 text-slate-500")}>{t.count}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <SearchInput placeholder="Search screens..." className="w-56" value={q} onChange={(e) => setQ(e.target.value)} />
          <FilterSelect label="Status" /><FilterSelect label="Company" /><FilterSelect label="Group" /><FilterSelect label="Orientation" />
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400">{list.length} results</span>
          <div className="flex rounded-lg border border-slate-200 bg-white p-0.5">
            <button onClick={() => setView("grid")} className={cn("flex h-7 w-7 items-center justify-center rounded-md", view === "grid" ? "bg-blue-50 text-blue-600" : "text-slate-400 hover:text-slate-600")} aria-label="Grid view"><LayoutGrid className="h-3.5 w-3.5" /></button>
            <button onClick={() => setView("list")} className={cn("flex h-7 w-7 items-center justify-center rounded-md", view === "list" ? "bg-blue-50 text-blue-600" : "text-slate-400 hover:text-slate-600")} aria-label="List view"><List className="h-3.5 w-3.5" /></button>
          </div>
        </div>
      </div>

      {view === "grid" ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {list.map((s) => <ScreenCard key={s.id} screen={s} />)}
        </div>
      ) : (
        <Card>
          <Table>
            <THead><tr><TH>Screen</TH><TH>Company</TH><TH>Content</TH><TH>Status</TH><TH>Sync</TH><TH>Last Seen</TH><TH className="text-right"> </TH></tr></THead>
            <tbody>
              {list.map((s) => (
                <TR key={s.id}>
                  <TD>
                    <Link href={`/screens/${s.id}`} className="flex items-center gap-3">
                      <img src={img(s.seed, 96, 64)} alt="" className="h-8 w-12 rounded object-cover" />
                      <span><span className="block text-sm font-semibold text-slate-900">{s.name}</span><span className="block text-[11px] text-slate-400">{s.location}</span></span>
                    </Link>
                  </TD>
                  <TD className="text-xs">{s.personal ? <Badge tone="blue"><User className="h-2.5 w-2.5" /> Personal</Badge> : s.company}</TD>
                  <TD className="text-xs">{s.content}</TD>
                  <TD><StatusBadge status={s.status} /></TD>
                  <TD><StatusBadge status={s.sync} /></TD>
                  <TD className="text-xs text-slate-400 whitespace-nowrap">{s.lastSeen}</TD>
                  <TD className="text-right"><DropdownMenu items={[{ label: "View Details", icon: <Eye className="h-3.5 w-3.5" />, href: `/screens/${s.id}` }, { label: "Delete", icon: <Trash2 className="h-3.5 w-3.5" />, tone: "danger" }]} /></TD>
                </TR>
              ))}
            </tbody>
          </Table>
        </Card>
      )}

      <Pagination page={1} pages={16} summary={<>Showing <span className="font-semibold text-slate-700">{start}–{start + list.length - 1}</span> of <span className="font-semibold text-slate-700">186</span> screens</>} />
      <AddScreenModal open={add} onClose={() => setAdd(false)} />
    </div>
  );
}
