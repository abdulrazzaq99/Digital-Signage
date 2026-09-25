"use client";
import { CompanyFilter } from "@/components/admin/company-scope";
import { Button } from "@/components/ui/button";
import { Badge, StatusBadge } from "@/components/ui/badge";
import { Card, StatCard } from "@/components/ui/card";
import { FilterSelect, SearchInput } from "@/components/ui/input";
import { Modal, ModalFooter, ModalHeader } from "@/components/ui/modal";
import { DropdownMenu, PageHeader, Pagination } from "@/components/ui/misc";
import { CardGridSkeleton, EmptyState, QueryState } from "@/components/ui/query-state";
import { TD, TH, THead, TR, Table } from "@/components/ui/table";
import { useToast } from "@/components/ui/toast";
import { useCompanyNames } from "@/lib/api/hooks/companies";
import { SCREEN_STATUSES, screenStatusLabel, useScreenCommand, useScreens, useUnpairScreen } from "@/lib/api/hooks/screens";
import type { Screen } from "@/lib/api/types";
import { label, timeAgo } from "@/lib/format";
import { useDebouncedValue } from "@/lib/use-debounced-value";
import { cn } from "@/lib/utils";
import { Eye, LayoutGrid, List, Monitor, Plus, RefreshCw, Unlink, User } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { AddScreenModal } from "./add-screen-modal";
import { ScreenCard } from "./screen-card";

/** Live totals for the stat tiles: one tiny query per status (the API has no aggregate endpoint). */
function useScreenTotals(companyId?: string) {
  const all = useScreens({ pageSize: 1 }, { companyId });
  const online = useScreens({ status: "ONLINE", pageSize: 1 }, { companyId });
  const offline = useScreens({ status: "OFFLINE", pageSize: 1 }, { companyId });
  const error = useScreens({ status: "ERROR", pageSize: 1 }, { companyId });
  const n = (q: typeof all) => q.data?.meta?.total ?? "—";
  return { total: n(all), online: n(online), offline: n(offline), error: n(error) };
}

export function ScreensPage() {
  const [view, setView] = useState<"grid" | "list">("grid");
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [companyId, setCompanyId] = useState("");
  const [orientation, setOrientation] = useState("");
  const [page, setPage] = useState(1);
  const [add, setAdd] = useState(false);
  const [unpairTarget, setUnpairTarget] = useState<Screen | null>(null);
  const toast = useToast();
  const { names } = useCompanyNames();
  const totals = useScreenTotals(companyId || undefined);
  const search = useDebouncedValue(q.trim(), 300);
  const screens = useScreens({ search: search || undefined, status: (status || undefined) as Screen["status"] | undefined, orientation: (orientation || undefined) as Screen["orientation"] | undefined, page }, { companyId: companyId || undefined });
  const command = useScreenCommand();
  const unpair = useUnpairScreen();

  const refresh = (s: Screen) => !command.isPending && command.mutate({ id: s.id, command: "refresh" }, { onSuccess: () => toast.success("Refresh sent", s.name), onError: (e) => toast.error(e) });
  const doUnpair = () => unpairTarget && !unpair.isPending && unpair.mutate(unpairTarget.id, { onSuccess: () => { toast.success("Screen unpaired", unpairTarget.name); setUnpairTarget(null); }, onError: (e) => toast.error(e) });
  const reset = (fn: () => void) => { fn(); setPage(1); };

  return (
    <div className="space-y-5">
      <PageHeader title="Screens" subtitle="Manage, monitor and control screens across the platform." action={<Button onClick={() => setAdd(true)}><Plus className="h-4 w-4" /> Add Screen</Button>} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard value={totals.total} label="Total Screens" />
        <StatCard value={totals.online} label="Online" tone="green" />
        <StatCard value={totals.offline} label="Offline" tone="red" />
        <StatCard value={totals.error} label="Error" tone="amber" />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <SearchInput placeholder="Search screens..." className="w-56" maxLength={120} value={q} onChange={(e) => reset(() => setQ(e.target.value))} />
          <FilterSelect label="Status" options={SCREEN_STATUSES.map((s) => ({ value: s, label: screenStatusLabel(s) }))} value={status} onChange={(v) => reset(() => setStatus(v))} />
          <CompanyFilter value={companyId} onChange={(v) => reset(() => setCompanyId(v))} allLabel="Company" />
          <FilterSelect label="Orientation" options={[{ value: "LANDSCAPE", label: "Landscape" }, { value: "PORTRAIT", label: "Portrait" }]} value={orientation} onChange={(v) => reset(() => setOrientation(v))} />
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400">{screens.data?.meta?.total ?? 0} results</span>
          <div className="flex rounded-lg border border-slate-200 bg-white p-0.5">
            <button onClick={() => setView("grid")} className={cn("flex h-7 w-7 items-center justify-center rounded-md", view === "grid" ? "bg-blue-50 text-blue-600" : "text-slate-400 hover:text-slate-600")} aria-label="Grid view"><LayoutGrid className="h-3.5 w-3.5" /></button>
            <button onClick={() => setView("list")} className={cn("flex h-7 w-7 items-center justify-center rounded-md", view === "list" ? "bg-blue-50 text-blue-600" : "text-slate-400 hover:text-slate-600")} aria-label="List view"><List className="h-3.5 w-3.5" /></button>
          </div>
        </div>
      </div>

      <QueryState query={screens} skeleton={<CardGridSkeleton />} empty={<EmptyState icon={<Monitor className="h-5 w-5" />} title="No screens found" body={q || status || companyId || orientation ? "Try clearing the filters." : "Pair a screen to get started."} action={<Button onClick={() => setAdd(true)}><Plus className="h-4 w-4" /> Add Screen</Button>} />}>
        {({ data, meta }) => (
          <>
            {view === "grid" ? (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {data.map((s) => <ScreenCard key={s.id} screen={s} companyName={names[s.companyId]} onRefresh={() => refresh(s)} onUnpair={() => setUnpairTarget(s)} busy={command.isPending || unpair.isPending} />)}
              </div>
            ) : (
              <Card>
                <Table>
                  <THead><tr><TH>Screen</TH><TH>Company</TH><TH>Content</TH><TH>Status</TH><TH>Sync</TH><TH>Last Seen</TH><TH className="text-right"> </TH></tr></THead>
                  <tbody>
                    {data.map((s) => (
                      <TR key={s.id}>
                        <TD>
                          <Link href={`/screens/${s.id}`} className="flex items-center gap-3">
                            <span className="flex h-8 w-12 shrink-0 items-center justify-center overflow-hidden rounded bg-slate-900 text-slate-500">{s.assignment?.thumbnailUrl ? <img src={s.assignment.thumbnailUrl} alt="" className="h-full w-full object-cover" /> : <Monitor className="h-3.5 w-3.5" />}</span>
                            <span><span className="block whitespace-nowrap text-sm font-semibold text-slate-900">{s.name}</span><span className="block text-[11px] text-slate-400">{s.location ?? "—"}</span></span>
                          </Link>
                        </TD>
                        <TD className="text-xs">{s.isPersonal ? <Badge tone="blue"><User className="h-2.5 w-2.5" /> Personal</Badge> : names[s.companyId] ?? "—"}</TD>
                        <TD className="text-xs">{s.assignment?.name ?? "—"}</TD>
                        <TD><StatusBadge status={screenStatusLabel(s.status)} /></TD>
                        <TD><StatusBadge status={label(s.syncState)} /></TD>
                        <TD className="text-xs text-slate-400 whitespace-nowrap">{timeAgo(s.lastSeenAt)}</TD>
                        <TD className="text-right"><DropdownMenu items={[{ label: "View Details", icon: <Eye className="h-3.5 w-3.5" />, href: `/screens/${s.id}` }, { label: "Refresh player", icon: <RefreshCw className="h-3.5 w-3.5" />, onSelect: () => refresh(s), disabled: command.isPending }, { label: "Unpair", icon: <Unlink className="h-3.5 w-3.5" />, tone: "danger", onSelect: () => setUnpairTarget(s), disabled: unpair.isPending }]} /></TD>
                      </TR>
                    ))}
                  </tbody>
                </Table>
              </Card>
            )}
            {meta && <Pagination page={meta.page} pages={meta.totalPages} onChange={setPage} summary={<>Showing <span className="font-semibold text-slate-700">{data.length ? (meta.page - 1) * meta.pageSize + 1 : 0}–{(meta.page - 1) * meta.pageSize + data.length}</span> of <span className="font-semibold text-slate-700">{meta.total}</span> screens</>} />}
          </>
        )}
      </QueryState>

      <AddScreenModal open={add} onClose={() => setAdd(false)} />
      <Modal open={!!unpairTarget} onClose={() => !unpair.isPending && setUnpairTarget(null)} width="max-w-md">
        <ModalHeader title={`Unpair "${unpairTarget?.name}"?`} subtitle="The device stops receiving content and the licence slot is released." onClose={() => setUnpairTarget(null)} />
        <ModalFooter><Button variant="secondary" onClick={() => setUnpairTarget(null)}>Cancel</Button><Button variant="danger" onClick={doUnpair} disabled={unpair.isPending}>{unpair.isPending ? "Unpairing…" : "Unpair"}</Button></ModalFooter>
      </Modal>
    </div>
  );
}
