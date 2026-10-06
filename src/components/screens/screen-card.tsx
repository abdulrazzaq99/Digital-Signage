"use client";
import { Badge, StatusBadge, statusTone } from "@/components/ui/badge";
import { DropdownMenu } from "@/components/ui/misc";
import { screenStatusLabel } from "@/lib/api/hooks/screens";
import type { Screen } from "@/lib/api/types";
import { label, timeAgo } from "@/lib/format";
import { Clock, ListVideo, MonitorSmartphone, Play, RefreshCw, Unlink, User } from "lucide-react";
import Link from "next/link";

function OrientationIcon({ o }: { o: Screen["orientation"] }) {
  return o === "LANDSCAPE" ? <span className="text-[10px]">↔</span> : <span className="text-[10px]">↕</span>;
}

export function ScreenCard({ screen, companyName, onRefresh, onUnpair, busy }: { screen: Screen; companyName?: string; onRefresh?: () => void; onUnpair?: () => void; busy?: boolean }) {
  const status = screenStatusLabel(screen.status);
  const tone = statusTone(status);
  const thumb = screen.status === "ONLINE" ? screen.assignment?.thumbnailUrl : null;
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      <div className="relative aspect-[16/9] bg-slate-900">
        {thumb ? <img src={thumb} alt="" className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-[11px] font-medium uppercase tracking-wider text-slate-500">{screen.status === "ONLINE" ? "No preview" : status}</div>}
        <div className="absolute inset-x-0 top-0 flex items-start justify-between p-2.5">
          <Badge tone={tone} dot className="bg-white/95 shadow-sm">{status}</Badge>
          <div className="flex items-center gap-1.5">
            <span className="inline-flex items-center gap-1 rounded-md bg-white/95 px-2 py-0.5 text-[10px] font-medium text-slate-600 shadow-sm"><OrientationIcon o={screen.orientation} /> {label(screen.orientation)}</span>
            <DropdownMenu items={[
              { label: "View Details", icon: <MonitorSmartphone className="h-3.5 w-3.5" />, href: `/screens/${screen.id}` },
              { label: "Refresh player", icon: <RefreshCw className="h-3.5 w-3.5" />, onSelect: onRefresh, disabled: busy },
              { label: "Unpair", icon: <Unlink className="h-3.5 w-3.5" />, tone: "danger", onSelect: onUnpair, disabled: busy },
            ]} />
          </div>
        </div>
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-3 pb-2.5 pt-8">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-white"><Play className="h-3 w-3 fill-current" /> {screen.assignment?.name ?? "Nothing assigned"}</span>
        </div>
      </div>
      <div className="px-3.5 py-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <Link href={`/screens/${screen.id}`} className="block truncate text-sm font-semibold text-slate-900 hover:text-blue-600">{screen.name}</Link>
            <div className="truncate text-[11px] text-slate-400">{companyName ?? "—"} · {screen.location ?? "No location"}</div>
          </div>
          {screen.isPersonal && <Badge tone="blue"><User className="h-2.5 w-2.5" /> Personal</Badge>}
        </div>
        <div className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-500"><ListVideo className="h-3 w-3 text-slate-400" /> {screen.assignment ? `${screen.assignment.name} · ${label(screen.assignment.kind)}` : "No content"}</div>
        <div className="mt-1.5 flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-[11px] text-slate-400"><Clock className="h-3 w-3" /> {timeAgo(screen.lastSeenAt)}</span>
          <StatusBadge status={label(screen.syncState)} />
        </div>
      </div>
    </div>
  );
}
