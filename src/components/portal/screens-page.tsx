"use client";
import { Button } from "@/components/ui/button";
import { DotStatus } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { FilterSelect, PillTabs, SearchInput } from "@/components/ui/input";
import { Pagination } from "@/components/ui/misc";
import { CardGridSkeleton, EmptyState, QueryState } from "@/components/ui/query-state";
import { useGroups } from "@/lib/api/hooks/groups";
import { SCREEN_STATUSES, screenStatusLabel, useScreens } from "@/lib/api/hooks/screens";
import type { Screen } from "@/lib/api/types";
import { label, timeAgo } from "@/lib/format";
import { useDebouncedValue } from "@/lib/use-debounced-value";
import { QueryNotice } from "@/components/screens/query-guards";
import { cn } from "@/lib/utils";
import { Monitor, Plus, Send } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

/** Thumbnail of what the screen is showing, or a dark tile with the status when nothing can be shown. */
export function ScreenThumb({ screen, className }: { screen: Screen; className?: string }) {
  const showImage = screen.status === "ONLINE" && screen.assignment?.thumbnailUrl;
  return (
    <div className={cn("relative shrink-0 overflow-hidden rounded-md bg-slate-900", className)}>
      {showImage ? (
        <img src={screen.assignment!.thumbnailUrl!} alt="" className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full items-center justify-center text-[8px] font-medium uppercase tracking-wider text-slate-500">{screen.status === "ONLINE" ? "No preview" : screenStatusLabel(screen.status)}</div>
      )}
      <span className="absolute inset-x-0 bottom-0 truncate bg-black/60 px-1.5 py-0.5 text-[8px] font-medium text-white">{screen.assignment?.name ?? "Nothing assigned"}</span>
    </div>
  );
}

export function ScreensPage({ tab }: { tab: "all" | "groups" }) {
  const router = useRouter();
  const [status, setStatus] = useState<"All" | Screen["status"]>("All");
  const [q, setQ] = useState("");
  const [groupId, setGroupId] = useState("");
  const [page, setPage] = useState(1);
  const search = useDebouncedValue(q.trim(), 300);
  const screens = useScreens({ search: search || undefined, status: status === "All" ? undefined : status, groupId: groupId || undefined, page });
  const groups = useGroups();

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <PillTabs options={[{ value: "all", label: "All Screens" }, { value: "groups", label: "Screen Groups" }]} value={tab} onChange={(v) => router.push(v === "all" ? "/portal/screens" : "/portal/screens?tab=groups")} />
        {tab === "all" ? <Button href="/portal/screens/pair"><Plus className="h-4 w-4" /> Pair Screen</Button> : <Button href="/portal/screens/groups/new"><Plus className="h-4 w-4" /> Create Group</Button>}
      </div>

      {tab === "all" ? (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <SearchInput placeholder="Search screens..." className="w-56" maxLength={120} value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} />
              <PillTabs options={[{ value: "All" as const, label: "All" }, ...SCREEN_STATUSES.map((v) => ({ value: v, label: screenStatusLabel(v) }))]} value={status} onChange={(v) => { setStatus(v); setPage(1); }} />
              <div className="relative">
                <FilterSelect label={groups.data ? "All Groups" : groups.isError ? "Groups unavailable" : "Loading groups…"} options={groups.data?.data.map((g) => ({ value: g.id, label: g.name })) ?? []} value={groupId} onChange={(v) => { setGroupId(v); setPage(1); }} />
                {groups.isError && <QueryNotice query={groups} what="groups" className="absolute left-0 top-full z-10 whitespace-nowrap" />}
              </div>
            </div>
            <span className="text-xs text-slate-400">{screens.data?.meta?.total ?? 0} screens</span>
          </div>
          <QueryState
            query={screens}
            skeleton={<CardGridSkeleton />}
            empty={<EmptyState icon={<Monitor className="h-5 w-5" />} title={q || status !== "All" || groupId ? "No screens match these filters" : "No screens paired yet"} body={q || status !== "All" || groupId ? "Try clearing the search or filters." : "Pair your first screen to start publishing content."} action={<Button href="/portal/screens/pair"><Plus className="h-4 w-4" /> Pair Screen</Button>} />}
          >
            {({ data, meta }) => (
              <>
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {data.map((s) => (
                    <Link key={s.id} href={`/portal/screens/${s.id}`} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
                      <div className="flex gap-3">
                        <ScreenThumb screen={s} className="h-14 w-20" />
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-semibold text-slate-900">{s.name}</div>
                          <div className="truncate text-[11px] text-slate-400">{s.location ?? "—"}</div>
                          <DotStatus status={screenStatusLabel(s.status)} className="mt-1.5" />
                        </div>
                      </div>
                      <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-[11px]">
                        {[["Content", s.assignment?.name ?? "—"], ["Group", (s.groups ?? [])[0]?.name ?? "—"], ["Last Seen", timeAgo(s.lastSeenAt)], ["Orientation", label(s.orientation)]].map(([k, v]) => <div key={k}><dt className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">{k}</dt><dd className="mt-0.5 truncate font-medium text-slate-700">{v}</dd></div>)}
                      </dl>
                    </Link>
                  ))}
                </div>
                {meta && meta.totalPages > 1 && <Pagination page={meta.page} pages={meta.totalPages} onChange={setPage} summary={`${meta.total} screens`} />}
              </>
            )}
          </QueryState>
        </>
      ) : (
        <QueryState query={groups} empty={<EmptyState title="No screen groups yet" body="Group screens to publish to all of them at once." action={<Button href="/portal/screens/groups/new"><Plus className="h-4 w-4" /> Create Group</Button>} />}>
          {({ data }) => (
            <div className="space-y-3">
              {data.map((g) => (
                <Card key={g.id} className="flex flex-wrap items-center gap-4 px-4 py-3">
                  <Link href={`/portal/screens/groups/${g.id}`} className="flex min-w-0 flex-1 items-center gap-3">
                    <span className="flex h-9 w-12 shrink-0 items-center justify-center rounded bg-slate-100 text-slate-400"><Monitor className="h-4 w-4" /></span>
                    <span className="min-w-0"><span className="block truncate text-sm font-semibold text-slate-900">{g.name}</span><span className="block truncate text-[11px] text-slate-400">{g.description || "No description"}</span></span>
                  </Link>
                  <div className="flex items-center gap-6 text-center"><div><div className="text-sm font-bold text-slate-900">{g.screenCount}</div><div className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">Screens</div></div><div><div className="text-sm font-bold text-green-600">{g.onlineCount}</div><div className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">Online</div></div></div>
                  <Button size="sm" href={g.screenIds[0] ? `/portal/screens/${g.screenIds[0]}/publish?group=${g.id}` : undefined} disabled={!g.screenIds[0]}><Send className="h-3.5 w-3.5" /> Publish</Button>
                </Card>
              ))}
            </div>
          )}
        </QueryState>
      )}
    </div>
  );
}
