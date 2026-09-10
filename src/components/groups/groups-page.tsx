"use client";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/misc";
import { screenGroups } from "@/lib/data";
import { img } from "@/lib/utils";
import { Plus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { CreateGroupModal } from "./group-modals";

export function GroupsPage() {
  const [create, setCreate] = useState(false);
  return (
    <div className="space-y-5">
      <PageHeader title="Screen Groups" subtitle="Organize screens and publish content to multiple displays at once." action={<Button onClick={() => setCreate(true)}><Plus className="h-4 w-4" /> Create Group</Button>} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {screenGroups.map((g) => (
          <Link key={g.id} href={`/screens/groups/${g.id === "lobby" ? "main-lobby" : g.id}`} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md">
            <div className="relative aspect-[16/7] bg-slate-900">
              <img src={img(g.seed, 640, 280)} alt="" className="h-full w-full object-cover" />
              <span className="absolute right-2.5 top-2.5 rounded-md bg-slate-900/80 px-2 py-0.5 text-[10px] font-medium text-white">{g.screens} screen{g.screens > 1 ? "s" : ""}</span>
            </div>
            <div className="px-4 py-3">
              <div className="text-sm font-semibold text-slate-900">{g.name}</div>
              <div className="text-[11px] text-slate-400">{g.company}</div>
              <div className="mt-2.5 flex items-center gap-3 text-[11px] font-medium">
                <span className="flex items-center gap-1.5 text-green-600"><span className="h-1.5 w-1.5 rounded-full bg-green-500" />{g.online} online</span>
                {g.offline > 0 && <span className="flex items-center gap-1.5 text-slate-500"><span className="h-1.5 w-1.5 rounded-full bg-slate-400" />{g.offline} offline</span>}
              </div>
              <div className="mt-2.5 flex items-center justify-between"><span className="text-[11px] text-slate-500">{g.content}</span><StatusBadge status={g.sync} /></div>
            </div>
          </Link>
        ))}
      </div>
      <CreateGroupModal open={create} onClose={() => setCreate(false)} />
    </div>
  );
}
