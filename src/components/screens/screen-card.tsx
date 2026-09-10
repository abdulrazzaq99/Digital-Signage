import { Badge, StatusBadge, statusTone } from "@/components/ui/badge";
import { DropdownMenu } from "@/components/ui/misc";
import { img } from "@/lib/utils";
import type { Screen } from "@/lib/data";
import { Clock, Eye, ListVideo, MonitorSmartphone, Pencil, Play, Trash2, User } from "lucide-react";
import Link from "next/link";

function OrientationIcon({ o }: { o: Screen["orientation"] }) {
  return o === "Landscape" ? <span className="text-[10px]">↔</span> : <span className="text-[10px]">↕</span>;
}

export function ScreenCard({ screen }: { screen: Screen }) {
  const tone = statusTone(screen.status);
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      <div className="relative aspect-[16/9] bg-slate-900">
        <img src={img(screen.seed, 640, 360)} alt="" className="h-full w-full object-cover" />
        <div className="absolute inset-x-0 top-0 flex items-start justify-between p-2.5">
          <Badge tone={tone} dot className="bg-white/95 shadow-sm">{screen.status}</Badge>
          <div className="flex items-center gap-1.5">
            <span className="inline-flex items-center gap-1 rounded-md bg-white/95 px-2 py-0.5 text-[10px] font-medium text-slate-600 shadow-sm"><OrientationIcon o={screen.orientation} /> {screen.orientation}</span>
            <DropdownMenu items={[
              { label: "Preview", icon: <Eye className="h-3.5 w-3.5" /> },
              { label: "View Details", icon: <MonitorSmartphone className="h-3.5 w-3.5" />, href: `/screens/${screen.id}` },
              { label: "Rename", icon: <Pencil className="h-3.5 w-3.5" /> },
              { label: "Delete", icon: <Trash2 className="h-3.5 w-3.5" />, tone: "danger" },
            ]} />
          </div>
        </div>
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-3 pb-2.5 pt-8">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-white"><Play className="h-3 w-3 fill-current" /> {screen.content}</span>
        </div>
      </div>
      <div className="px-3.5 py-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <Link href={`/screens/${screen.id}`} className="block truncate text-sm font-semibold text-slate-900 hover:text-blue-600">{screen.name}</Link>
            <div className="truncate text-[11px] text-slate-400">{screen.company} · {screen.location}</div>
          </div>
          {screen.personal && <Badge tone="blue"><User className="h-2.5 w-2.5" /> Personal</Badge>}
        </div>
        <div className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-500"><ListVideo className="h-3 w-3 text-slate-400" /> {screen.content}</div>
        <div className="mt-1.5 flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-[11px] text-slate-400"><Clock className="h-3 w-3" /> {screen.lastSeen}</span>
          <StatusBadge status={screen.sync} />
        </div>
      </div>
    </div>
  );
}
