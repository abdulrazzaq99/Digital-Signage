import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type Tone = "green" | "red" | "amber" | "blue" | "slate" | "purple";

const tones: Record<Tone, string> = {
  green: "bg-green-50 text-green-700 border-green-100",
  red: "bg-red-50 text-red-600 border-red-100",
  amber: "bg-amber-50 text-amber-600 border-amber-100",
  blue: "bg-blue-50 text-blue-600 border-blue-100",
  slate: "bg-slate-100 text-slate-500 border-slate-200",
  purple: "bg-violet-50 text-violet-600 border-violet-100",
};
const dots: Record<Tone, string> = {
  green: "bg-green-500", red: "bg-red-500", amber: "bg-amber-500", blue: "bg-blue-500", slate: "bg-slate-400", purple: "bg-violet-500",
};

export function Badge({ tone = "slate", dot, children, className }: { tone?: Tone; dot?: boolean; children: ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[11px] font-medium leading-4 whitespace-nowrap", tones[tone], className)}>
      {dot && <span className={cn("h-1.5 w-1.5 rounded-full", dots[tone])} />}
      {children}
    </span>
  );
}

export function statusTone(status: string): Tone {
  switch (status) {
    case "Active": case "Online": case "Synced": case "Ready": return "green";
    case "Offline": case "Error": case "Sync Failed": case "Expired": case "Alert": return "red";
    case "Suspended": case "Pending": case "Pending (Offline)": case "Degraded": case "Needs Attention": return "amber";
    case "Syncing": case "Syncing...": case "Personal": return "blue";
    default: return "slate";
  }
}

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  return <Badge tone={statusTone(status)} dot className={className}>{status}</Badge>;
}

export function DotStatus({ status, className }: { status: string; className?: string }) {
  const tone = statusTone(status);
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-xs font-medium", {
      green: "text-green-600", red: "text-red-600", amber: "text-amber-600", blue: "text-blue-600", slate: "text-slate-500", purple: "text-violet-600",
    }[tone], className)}>
      <span className={cn("h-1.5 w-1.5 rounded-full", dots[tone])} />
      {status}
    </span>
  );
}
