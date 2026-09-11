"use client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UnderlineTabs } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/misc";
import { Eye, Plus, ShoppingBag, Tag } from "lucide-react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

export function OffersShell({ tab, children, hideCreate }: { tab: "manage" | "marketplace"; children: ReactNode; hideCreate?: boolean }) {
  const router = useRouter();
  return (
    <div className="space-y-5">
      <PageHeader title="Offers / Marketplace" subtitle="Create and manage promotional offers available to customers." action={!hideCreate ? <Button href="/offers/new"><Plus className="h-4 w-4" /> Create Offer</Button> : undefined} />
      <div className="flex items-center justify-between gap-4">
        <UnderlineTabs className="flex-1" options={[{ value: "manage", label: "Manage Offers", icon: <Tag className="h-3.5 w-3.5" /> }, { value: "marketplace", label: "Marketplace Preview", icon: <ShoppingBag className="h-3.5 w-3.5" /> }]} value={tab} onChange={(v) => router.push(v === "manage" ? "/offers" : "/offers?tab=marketplace")} />
        {tab === "marketplace" && <Badge tone="blue" className="uppercase"><Eye className="h-2.5 w-2.5" /> Customer View</Badge>}
      </div>
      {children}
    </div>
  );
}

export function offerTone(s: string) { return s === "Active" ? "green" : s === "Draft" ? "slate" : s === "Inactive" ? "amber" : "red"; }
