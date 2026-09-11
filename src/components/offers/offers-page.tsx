"use client";
import { Badge } from "@/components/ui/badge";
import { PillTabs, SearchInput, Select } from "@/components/ui/input";
import { DropdownMenu } from "@/components/ui/misc";
import { offers, type Offer, type OfferStatus } from "@/lib/data";
import { img } from "@/lib/utils";
import { Calendar, Eye, EyeOff, FileEdit, Pencil, Search, Trash2, Users } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { DeleteOfferModal, UnpublishOfferModal } from "./offer-modals";
import { OffersShell, offerTone } from "./offers-shell";

export function OffersPage({ tab }: { tab: "manage" | "marketplace" }) {
  const [filter, setFilter] = useState<"All" | OfferStatus>("All");
  const [q, setQ] = useState("");
  const [unpub, setUnpub] = useState<Offer | null>(null);
  const [del, setDel] = useState<Offer | null>(null);
  const list = offers.filter((o) => (filter === "All" || o.status === filter) && o.title.toLowerCase().includes(q.toLowerCase()));
  const count = (s: OfferStatus | OfferStatus[]) => offers.filter((o) => (Array.isArray(s) ? s : [s]).includes(o.status)).length;

  if (tab === "marketplace") {
    const live = offers.filter((o) => o.status === "Active");
    return (
      <OffersShell tab="marketplace">
        <div className="relative overflow-hidden rounded-2xl bg-slate-900 px-8 py-8 text-white"><div className="pointer-events-none absolute -right-10 -top-10 h-56 w-56 rounded-full bg-blue-600/30 blur-2xl" /><Badge tone="blue" className="uppercase">Marketplace</Badge><h2 className="mt-3 text-2xl font-bold">Exclusive Offers &amp; Promotions</h2><p className="mt-1 max-w-md text-sm text-slate-400">Discover the latest promotions and special offers available to you. Browse and contact providers directly.</p><div className="mt-5 flex gap-2"><div className="relative w-64"><Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" /><input placeholder="Search offers..." className="h-9 w-full rounded-lg border border-white/10 bg-white/10 pl-8 pr-3 text-xs text-white placeholder:text-slate-400 outline-none" /></div><Select className="w-40 [&>select]:h-9 [&>select]:border-white/10 [&>select]:bg-white/10 [&>select]:text-white" defaultValue="All"><option>All Categories</option></Select></div></div>
        <div className="text-xs text-slate-400">{live.length} offers available</div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{live.map((o) => <div key={o.id} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"><div className="relative"><img src={img(o.seed, 640, 320)} alt="" className="aspect-[2/1] w-full object-cover" /><Badge tone="blue" className="absolute left-3 top-3">{o.category}</Badge><span className="absolute bottom-3 right-3 rounded bg-slate-900/80 px-2 py-0.5 text-[10px] text-white">Until {o.end}</span></div><div className="px-4 py-3"><div className="text-sm font-semibold text-slate-900">{o.title}</div><p className="mt-1 line-clamp-3 text-[11px] leading-4 text-slate-500">{o.description}</p><Link href={`/offers/marketplace/${o.id}`} className="mt-3 inline-flex h-8 items-center gap-1 rounded-lg border border-blue-200 px-3 text-xs font-medium text-blue-600 hover:bg-blue-50">View Offer ›</Link></div></div>)}</div>
      </OffersShell>
    );
  }

  return (
    <OffersShell tab="manage">
      <div className="grid gap-4 sm:grid-cols-4">
        {[["Total Offers", offers.length, "border-blue-100 bg-blue-50/50 text-blue-600"], ["Active", count("Active"), "border-green-100 bg-green-50/50 text-green-600"], ["Draft", count("Draft"), "border-slate-200 bg-white text-slate-700"], ["Inactive / Expired", count(["Inactive", "Expired"]), "border-amber-100 bg-amber-50/50 text-amber-600"]].map(([l, v, c]) => <div key={String(l)} className={`rounded-xl border px-4 py-3 ${c}`}><div className="text-2xl font-bold">{v}</div><div className="text-xs font-medium opacity-80">{l}</div></div>)}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3"><SearchInput placeholder="Search offers..." className="w-64" value={q} onChange={(e) => setQ(e.target.value)} /><PillTabs options={(["All", "Active", "Draft", "Inactive", "Expired"] as const).map((v) => ({ value: v, label: v }))} value={filter} onChange={setFilter} /></div>
      <div className="text-xs text-slate-400">{list.length} offers</div>
      <div className="space-y-3">
        {list.map((o) => (
          <div key={o.id} className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-2.5 pr-4 shadow-sm">
            <Link href={`/offers/${o.id}`} className="shrink-0"><img src={img(o.seed, 280, 200)} alt="" className="h-[74px] w-[104px] rounded-lg object-cover" /></Link>
            <div className="min-w-0 flex-1">
              <Link href={`/offers/${o.id}`} className="block truncate text-sm font-semibold text-slate-900 hover:text-blue-600">{o.title}</Link>
              <Badge tone={offerTone(o.status)} dot className="mt-1">{o.status}</Badge>
              <div className="mt-1 text-[11px] text-slate-400">{o.category}</div>
              <div className="mt-1.5 flex items-center gap-3 text-[10px] text-slate-400"><span className="flex items-center gap-1"><Eye className="h-3 w-3" />{o.views} views</span><span className="flex items-center gap-1"><Users className="h-3 w-3" />{o.unique} unique</span><span className="flex items-center gap-1">{o.status === "Draft" ? <FileEdit className="h-3 w-3" /> : <Calendar className="h-3 w-3" />}{o.status === "Draft" ? "Draft" : `${o.published} published`}</span></div>
            </div>
            <DropdownMenu items={[{ label: "View Details", icon: <Eye className="h-3.5 w-3.5" />, href: `/offers/${o.id}` }, { label: "Edit Offer", icon: <Pencil className="h-3.5 w-3.5" />, href: `/offers/${o.id}/edit` }, { label: o.status === "Active" ? "Unpublish" : "Publish", icon: <EyeOff className="h-3.5 w-3.5" />, onSelect: () => o.status === "Active" && setUnpub(o) }, { label: "Delete", icon: <Trash2 className="h-3.5 w-3.5" />, tone: "danger", onSelect: () => setDel(o) }]} />
          </div>
        ))}
      </div>
      <UnpublishOfferModal offer={unpub} onClose={() => setUnpub(null)} />
      <DeleteOfferModal offer={del} onClose={() => setDel(null)} />
    </OffersShell>
  );
}
