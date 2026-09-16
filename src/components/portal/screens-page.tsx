"use client";
import { Button } from "@/components/ui/button";
import { DotStatus } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { FilterSelect, PillTabs, SearchInput } from "@/components/ui/input";
import { portalGroups, portalScreens, type PortalStatus } from "@/lib/portal-data";
import { img } from "@/lib/utils";
import { Plus, Send } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function ScreensPage({ tab }: { tab: "all" | "groups" }) {
  const router = useRouter();
  const [status, setStatus] = useState<"All" | PortalStatus>("All");
  const [q, setQ] = useState("");
  const list = portalScreens.filter((s) => (status === "All" || s.status === status) && s.name.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <PillTabs options={[{ value: "all", label: "All Screens" }, { value: "groups", label: "Screen Groups" }]} value={tab} onChange={(v) => router.push(v === "all" ? "/portal/screens" : "/portal/screens?tab=groups")} />
        {tab === "all" ? <Button href="/portal/screens/pair"><Plus className="h-4 w-4" /> Pair Screen</Button> : <Button href="/portal/screens/groups/new"><Plus className="h-4 w-4" /> Create Group</Button>}
      </div>

      {tab === "all" ? (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2"><SearchInput placeholder="Search screens..." className="w-56" value={q} onChange={(e) => setQ(e.target.value)} /><PillTabs options={(["All", "Online", "Offline", "Error"] as const).map((v) => ({ value: v, label: v }))} value={status} onChange={setStatus} /><FilterSelect label="All Groups" /></div>
            <span className="text-xs text-slate-400">{list.length} screens</span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {list.map((s) => (
              <Link key={s.id} href={`/portal/screens/${s.id}`} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
                <div className="flex gap-3">
                  <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-md bg-slate-900">
                    {s.status !== "Offline" && s.status !== "Error" ? <img src={img(s.seed, 160, 112)} alt="" className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-[8px] font-medium uppercase tracking-wider text-slate-500">{s.status === "Offline" ? "Offline" : "Error"}</div>}
                    <span className="absolute inset-x-0 bottom-0 truncate bg-black/60 px-1.5 py-0.5 text-[8px] font-medium text-white">{s.content}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold text-slate-900">{s.name}</div>
                    <div className="truncate text-[11px] text-slate-400">{s.location}</div>
                    <DotStatus status={s.status} className="mt-1.5" />
                  </div>
                </div>
                <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-[11px]">
                  {[["Content", s.content], ["Group", s.group ?? "—"], ["Last Sync", s.lastSync], ["Orientation", s.orientation]].map(([k, v]) => <div key={k}><dt className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">{k}</dt><dd className="mt-0.5 truncate font-medium text-slate-700">{v}</dd></div>)}
                </dl>
              </Link>
            ))}
          </div>
        </>
      ) : (
        <div className="space-y-3">
          {portalGroups.map((g) => {
            const members = portalScreens.filter((s) => g.screenIds.includes(s.id));
            const online = members.filter((s) => s.status === "Online").length;
            return (
              <Card key={g.id} className="flex flex-wrap items-center gap-4 px-4 py-3">
                <Link href={`/portal/screens/groups/${g.id}`} className="flex min-w-0 flex-1 items-center gap-3">
                  <img src={img(g.seed, 96, 64)} alt="" className="h-9 w-12 rounded object-cover" />
                  <span className="min-w-0"><span className="block truncate text-sm font-semibold text-slate-900">{g.name}</span><span className="block truncate text-[11px] text-slate-400">{g.description}</span></span>
                </Link>
                <div className="flex items-center gap-6 text-center"><div><div className="text-sm font-bold text-slate-900">{members.length}</div><div className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">Screens</div></div><div><div className="text-sm font-bold text-green-600">{online}</div><div className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">Online</div></div></div>
                <span className="hidden text-xs text-slate-500 sm:block">{g.content}</span>
                <Button size="sm" href={`/portal/screens/${g.screenIds[0]}/publish?group=${g.id}`}><Send className="h-3.5 w-3.5" /> Publish</Button>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
