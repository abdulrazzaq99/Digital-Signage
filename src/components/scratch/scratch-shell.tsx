"use client";
import { Button } from "@/components/ui/button";
import { UnderlineTabs } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/misc";
import { useWinners } from "@/lib/api/hooks/campaigns";
import { LayoutList, Plus, Star } from "lucide-react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

export function ScratchShell({ tab, children, compact }: { tab: "campaigns" | "winners"; children: ReactNode; compact?: boolean }) {
  const router = useRouter();
  const pending = useWinners({ redemption: "PENDING", pageSize: 1 });
  return (
    <div className="space-y-5">
      {!compact && <PageHeader title="Scratch & Win" subtitle="Run prize campaigns with scratch card mechanics for customer engagement." action={<Button href="/scratch-win/new"><Plus className="h-4 w-4" /> Create Campaign</Button>} />}
      <UnderlineTabs options={[{ value: "campaigns", label: "Campaigns", icon: <LayoutList className="h-3.5 w-3.5" /> }, { value: "winners", label: "Winner Tracking", icon: <Star className="h-3.5 w-3.5" />, count: pending.data?.meta?.total }]} value={tab} onChange={(v) => router.push(v === "campaigns" ? "/scratch-win" : "/scratch-win?tab=winners")} />
      {children}
    </div>
  );
}

export { campaignTone } from "@/lib/api/hooks/campaigns";
export function prizeTone(p: string): "blue" | "purple" | "amber" { const k = p.toLowerCase(); return k.includes("iphone") || k.includes("tablet") ? "blue" : k.includes("airpods") || k.includes("gift") ? "purple" : "amber"; }
