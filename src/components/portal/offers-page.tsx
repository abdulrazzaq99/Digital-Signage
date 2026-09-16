"use client";
import { Badge } from "@/components/ui/badge";
import { SearchInput } from "@/components/ui/input";
import { portalOffers, type OfferCategory } from "@/lib/portal-data";
import { cn, img } from "@/lib/utils";
import { Clock } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export const catTone: Record<OfferCategory, "blue" | "purple" | "green" | "amber"> = { Hardware: "blue", Software: "purple", Services: "green", Support: "amber" };

export function OffersPage() {
  const [cat, setCat] = useState<"All" | OfferCategory>("All");
  const [q, setQ] = useState("");
  const list = portalOffers.filter((o) => (cat === "All" || o.category === cat) && o.title.toLowerCase().includes(q.toLowerCase()));
  const expiring = portalOffers.filter((o) => o.endsOn).length;
  const count = (c: OfferCategory) => portalOffers.filter((o) => o.category === c).length;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2"><span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700"><span className="h-1.5 w-1.5 rounded-full bg-green-500" />{portalOffers.length} active offers</span><span className="inline-flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700"><Clock className="h-3 w-3" />{expiring} offers expiring soon</span></div>
      <div className="flex flex-wrap items-center gap-2"><SearchInput placeholder="Search offers..." className="w-56" value={q} onChange={(e) => setQ(e.target.value)} />{(["All", "Hardware", "Software", "Services", "Support"] as const).map((c) => <button key={c} onClick={() => setCat(c)} className={cn("flex h-8 items-center gap-1.5 rounded-full border px-3 text-xs font-medium transition-colors", cat === c ? "border-blue-600 bg-blue-600 text-white" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50")}>{c}{c !== "All" && <span className={cn("text-[10px]", cat === c ? "text-white/70" : "text-slate-400")}>{count(c)}</span>}</button>)}</div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {list.map((o) => (
          <div key={o.id} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="relative"><img src={img(o.seed, 640, 360)} alt="" className="aspect-video w-full object-cover" />{o.endsOn && <span className="absolute right-2.5 top-2.5 rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-semibold text-white">Ends {o.endsOn}</span>}</div>
            <div className="px-4 py-3">
              <Badge tone={catTone[o.category]}>{o.category}</Badge>
              <h3 className="mt-2 text-sm font-semibold text-slate-900">{o.title}</h3>
              <p className="mt-1 line-clamp-3 text-[11px] leading-4 text-slate-500">{o.summary}</p>
              <Link href={`/portal/offers/${o.id}`} className="mt-3 inline-flex h-8 items-center gap-1 rounded-lg border border-slate-200 px-3 text-xs font-medium text-slate-700 hover:bg-slate-50">View Offer →</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
