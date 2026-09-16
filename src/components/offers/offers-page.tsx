"use client";
import { OffersPage as CustomerOffers } from "@/components/portal/offers-page";
import { OfferCover } from "@/components/portal/offers-page";
import { Badge } from "@/components/ui/badge";
import { FilterSelect, SearchInput } from "@/components/ui/input";
import { DropdownMenu, Pagination } from "@/components/ui/misc";
import { EmptyState, QueryState, TableSkeleton } from "@/components/ui/query-state";
import { useToast } from "@/components/ui/toast";
import { OFFER_STATUSES, offerTone, useOffers, usePublishOffer } from "@/lib/api/hooks/offers";
import type { Offer } from "@/lib/api/types";
import { formatDate, label } from "@/lib/format";
import { Calendar, Eye, EyeOff, FileEdit, Pencil, Tag, Trash2, Users } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { DeleteOfferModal, UnpublishOfferModal } from "./offer-modals";
import { OffersShell } from "./offers-shell";

function useOfferTotals() {
  const all = useOffers({ pageSize: 1 });
  const published = useOffers({ status: "PUBLISHED", pageSize: 1 });
  const draft = useOffers({ status: "DRAFT", pageSize: 1 });
  const n = (q: typeof all) => q.data?.meta?.total ?? 0;
  return { total: n(all), published: n(published), draft: n(draft), other: Math.max(0, n(all) - n(published) - n(draft)) };
}

export function OffersPage({ tab }: { tab: "manage" | "marketplace" }) {
  const toast = useToast();
  const [status, setStatus] = useState("");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [unpub, setUnpub] = useState<Offer | null>(null);
  const [del, setDel] = useState<Offer | null>(null);
  const offers = useOffers({ search: q || undefined, status: (status || undefined) as Offer["status"] | undefined, page }, { enabled: tab === "manage" });
  const totals = useOfferTotals();
  const publish = usePublishOffer();
  const doPublish = (o: Offer) => publish.mutate(o.id, { onSuccess: () => toast.success("Offer published", o.title), onError: (e) => toast.error(e) });

  if (tab === "marketplace") {
    return (
      <OffersShell tab="marketplace">
        <div className="relative overflow-hidden rounded-2xl bg-slate-900 px-8 py-8 text-white"><div className="pointer-events-none absolute -right-10 -top-10 h-56 w-56 rounded-full bg-blue-600/30 blur-2xl" /><Badge tone="blue" className="uppercase">Marketplace</Badge><h2 className="mt-3 text-2xl font-bold">Exclusive Offers &amp; Promotions</h2><p className="mt-1 max-w-md text-sm text-slate-400">This is what customers see in their portal: only published offers, with categories drawn from the live data.</p></div>
        <CustomerOffers basePath="/offers/marketplace" />
      </OffersShell>
    );
  }

  return (
    <OffersShell tab="manage">
      <div className="grid gap-4 sm:grid-cols-4">
        {[["Total Offers", totals.total, "border-blue-100 bg-blue-50/50 text-blue-600"], ["Published", totals.published, "border-green-100 bg-green-50/50 text-green-600"], ["Draft", totals.draft, "border-slate-200 bg-white text-slate-700"], ["Unpublished / Expired", totals.other, "border-amber-100 bg-amber-50/50 text-amber-600"]].map(([l, v, c]) => <div key={String(l)} className={`rounded-xl border px-4 py-3 ${c}`}><div className="text-2xl font-bold">{v}</div><div className="text-xs font-medium opacity-80">{l}</div></div>)}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3"><SearchInput placeholder="Search offers..." className="w-64" value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} /><FilterSelect label="All statuses" options={OFFER_STATUSES.map((s) => ({ value: s, label: label(s) }))} value={status} onChange={(v) => { setStatus(v); setPage(1); }} /></div>
      <QueryState query={offers} skeleton={<TableSkeleton rows={5} />} empty={<EmptyState icon={<Tag className="h-5 w-5" />} title={q || status ? "No offers match" : "No offers yet"} body="Create an offer and publish it to the customer Marketplace." />}>
        {({ data, meta }) => (
          <>
            <div className="text-xs text-slate-400">{meta?.total ?? data.length} offers</div>
            <div className="space-y-3">
              {data.map((o) => (
                <div key={o.id} className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-2.5 pr-3 shadow-sm sm:items-center sm:gap-4 sm:pr-4">
                  <Link href={`/offers/${o.id}`} className="shrink-0"><OfferCover offer={o} className="h-[60px] w-[80px] rounded-lg sm:h-[74px] sm:w-[104px]" /></Link>
                  <div className="min-w-0 flex-1">
                    <Link href={`/offers/${o.id}`} className="block truncate text-sm font-semibold text-slate-900 hover:text-blue-600">{o.title}</Link>
                    <Badge tone={offerTone(o.status)} dot className="mt-1">{label(o.status)}</Badge>
                    <div className="mt-1 text-[11px] text-slate-400">{o.category}</div>
                    <div className="mt-1.5 flex flex-wrap items-center gap-3 text-[10px] text-slate-400"><span className="flex items-center gap-1"><Eye className="h-3 w-3" />{o.stats?.totalViews ?? 0} views</span><span className="flex items-center gap-1"><Users className="h-3 w-3" />{o.stats?.uniqueViewers ?? 0} unique</span><span className="flex items-center gap-1">{o.publishedAt ? <><Calendar className="h-3 w-3" />{formatDate(o.publishedAt)} published</> : <><FileEdit className="h-3 w-3" />Not published</>}</span></div>
                  </div>
                  <DropdownMenu items={[{ label: "View Details", icon: <Eye className="h-3.5 w-3.5" />, href: `/offers/${o.id}` }, { label: "Edit Offer", icon: <Pencil className="h-3.5 w-3.5" />, href: `/offers/${o.id}/edit` }, o.status === "PUBLISHED" ? { label: "Unpublish", icon: <EyeOff className="h-3.5 w-3.5" />, onSelect: () => setUnpub(o) } : { label: "Publish", icon: <Eye className="h-3.5 w-3.5" />, onSelect: () => doPublish(o) }, { label: "Delete", icon: <Trash2 className="h-3.5 w-3.5" />, tone: "danger", onSelect: () => setDel(o) }]} />
                </div>
              ))}
            </div>
            {meta && meta.totalPages > 1 && <Pagination page={meta.page} pages={meta.totalPages} onChange={setPage} summary={`${meta.total} offers`} />}
          </>
        )}
      </QueryState>
      <UnpublishOfferModal offer={unpub} onClose={() => setUnpub(null)} />
      <DeleteOfferModal offer={del} onClose={() => setDel(null)} />
    </OffersShell>
  );
}
