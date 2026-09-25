"use client";
import { Badge } from "@/components/ui/badge";
import { SearchInput } from "@/components/ui/input";
import { CardGridSkeleton, EmptyState, QueryState } from "@/components/ui/query-state";
import { categoryTone, endingSoon, useOffers } from "@/lib/api/hooks/offers";
import type { Offer } from "@/lib/api/types";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Clock, Tag } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useDebouncedValue } from "@/lib/use-debounced-value";

export { categoryTone as catTone };

/** Cover image or a category-coloured tile when the offer has no image. */
export function OfferCover({ offer, className }: { offer: Offer; className?: string }) {
  const tone = categoryTone(offer.category);
  const bg: Record<string, string> = { blue: "from-blue-600 to-blue-900", purple: "from-violet-600 to-violet-900", green: "from-emerald-600 to-emerald-900", amber: "from-amber-500 to-amber-800", red: "from-rose-600 to-rose-900", slate: "from-slate-600 to-slate-900" };
  if (offer.imageUrl) return <img src={offer.imageUrl} alt="" className={cn("w-full object-cover", className)} />;
  return <div className={cn("flex w-full items-end bg-gradient-to-br p-4 text-white", bg[tone], className)}><span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider opacity-80"><Tag className="h-3 w-3" /> {offer.category}</span></div>;
}

/** Published offers for customers. Categories come from the data itself. */
export function OffersPage({ basePath = "/portal/offers" }: { basePath?: string } = {}) {
  const [cat, setCat] = useState("All");
  const [q, setQ] = useState("");
  const search = useDebouncedValue(q.trim().toLowerCase(), 200);
  const offers = useOffers({ status: "PUBLISHED", pageSize: 100 });
  const all = offers.data?.data ?? [];
  const categories = ["All", ...new Set(all.map((o) => o.category))];
  const list = all.filter((o) => (cat === "All" || o.category === cat) && (o.title ?? "").toLowerCase().includes(search));
  const expiring = all.filter(endingSoon).length;
  const count = (c: string) => all.filter((o) => o.category === c).length;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2"><span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700"><span className="h-1.5 w-1.5 rounded-full bg-green-500" />{all.length} active offers</span>{expiring > 0 && <span className="inline-flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700"><Clock className="h-3 w-3" />{expiring} offer{expiring > 1 ? "s" : ""} expiring soon</span>}</div>
      <div className="flex flex-wrap items-center gap-2"><SearchInput placeholder="Search offers..." aria-label="Search offers" maxLength={120} className="w-56" value={q} onChange={(e) => setQ(e.target.value)} />{categories.map((c) => <button key={c} onClick={() => setCat(c)} className={cn("flex h-8 items-center gap-1.5 rounded-full border px-3 text-xs font-medium transition-colors", cat === c ? "border-blue-600 bg-blue-600 text-white" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50")}>{c}{c !== "All" && <span className={cn("text-[10px]", cat === c ? "text-white/70" : "text-slate-400")}>{count(c)}</span>}</button>)}</div>
      <QueryState query={offers} skeleton={<CardGridSkeleton />} empty={<EmptyState icon={<Tag className="h-5 w-5" />} title="No offers right now" body="Check back soon — new promotions appear here as they are published." />}>
        {() => list.length === 0 ? <EmptyState title="No offers match" body="Try another search or category." /> : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {list.map((o) => (
              <div key={o.id} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="relative"><OfferCover offer={o} className="aspect-video" />{o.endsAt && <span className={cn("absolute right-2.5 top-2.5 rounded-full px-2 py-0.5 text-[10px] font-semibold text-white", endingSoon(o) ? "bg-amber-500" : "bg-slate-900/70")}>Ends {formatDate(o.endsAt)}</span>}</div>
                <div className="px-4 py-3">
                  <Badge tone={categoryTone(o.category)}>{o.category}</Badge>
                  <h3 className="mt-2 text-sm font-semibold text-slate-900">{o.title}</h3>
                  <p className="mt-1 line-clamp-3 text-[11px] leading-4 text-slate-500">{o.summary}</p>
                  <Link href={`${basePath}/${o.id}`} className="mt-3 inline-flex h-8 items-center gap-1 rounded-lg border border-slate-200 px-3 text-xs font-medium text-slate-700 hover:bg-slate-50">View Offer →</Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </QueryState>
    </div>
  );
}
