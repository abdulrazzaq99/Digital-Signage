"use client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, SectionLabel } from "@/components/ui/card";
import { BackLink } from "@/components/ui/misc";
import type { Offer } from "@/lib/data";
import { img } from "@/lib/utils";
import { Eye, EyeOff, Pencil, Trash2, Users } from "lucide-react";
import { useState } from "react";
import { DeleteOfferModal, UnpublishOfferModal } from "./offer-modals";
import { OffersShell, offerTone } from "./offers-shell";

export function OfferDetail({ offer }: { offer: Offer }) {
  const [unpub, setUnpub] = useState(false);
  const [del, setDel] = useState(false);
  return (
    <OffersShell tab="manage" hideCreate>
      <BackLink href="/offers" label="Offers" current={offer.title} />
      <div className="grid gap-6 xl:grid-cols-[1fr_300px]">
        <div>
          <img src={img(offer.seed, 1200, 420)} alt="" className="aspect-[3/1] w-full rounded-xl object-cover" />
          <h1 className="mt-5 text-xl font-bold tracking-tight text-slate-900">{offer.title}</h1>
          <Badge tone={offerTone(offer.status)} dot className="mt-2">{offer.status}</Badge>
          <p className="mt-4 text-sm leading-6 text-slate-600">{offer.description}</p>
          <SectionLabel className="mt-6">Contact Information</SectionLabel>
          <ul className="mt-2 space-y-0.5 text-xs text-slate-700">{offer.contact.map((c) => <li key={c}>{c}</li>)}</ul>
          <SectionLabel className="mt-5">Buying Instructions</SectionLabel>
          <p className="mt-2 text-xs leading-5 text-slate-700">{offer.claim}</p>
        </div>
        <div className="space-y-4">
          <Card><CardHeader title="Statistics" /><div className="grid grid-cols-2 divide-x divide-slate-100 px-2 py-4 text-center"><div><Eye className="mx-auto h-4 w-4 text-blue-500" /><div className="mt-1 text-lg font-bold text-slate-900">{offer.views}</div><div className="text-[10px] text-slate-400">Total Views</div></div><div><Users className="mx-auto h-4 w-4 text-violet-500" /><div className="mt-1 text-lg font-bold text-slate-900">{offer.unique}</div><div className="text-[10px] text-slate-400">Unique Viewers</div></div></div></Card>
          <Card><CardHeader title="Details" /><dl className="divide-y divide-slate-100 px-5 text-xs">{[["Category", offer.category], ["Status", offer.status], ["Created", offer.created], ["Published", offer.published], ["Last Updated", offer.updated], ["Start Date", offer.start || "—"], ["End Date", offer.end || "—"]].map(([k, v]) => <div key={k} className="flex justify-between py-2.5"><dt className="text-slate-400">{k}</dt><dd className="font-semibold text-slate-800">{v}</dd></div>)}</dl></Card>
          <Button href={`/offers/${offer.id}/edit`} className="w-full"><Pencil className="h-3.5 w-3.5" /> Edit Offer</Button>
          <Button variant="secondary" className="w-full" onClick={() => setUnpub(true)}><EyeOff className="h-3.5 w-3.5" /> {offer.status === "Active" ? "Unpublish" : "Publish"}</Button>
          <Button variant="danger-outline" className="w-full" onClick={() => setDel(true)}><Trash2 className="h-3.5 w-3.5" /> Delete Offer</Button>
        </div>
      </div>
      <UnpublishOfferModal offer={unpub ? offer : null} onClose={() => setUnpub(false)} />
      <DeleteOfferModal offer={del ? offer : null} onClose={() => setDel(false)} />
    </OffersShell>
  );
}

export function MarketplaceOffer({ offer }: { offer: Offer }) {
  return (
    <OffersShell tab="marketplace" hideCreate>
      <BackLink href="/offers?tab=marketplace" label="Marketplace" current={offer.title} />
      <OfferCustomerCard offer={offer} />
    </OffersShell>
  );
}

export function OfferCustomerCard({ offer, values }: { offer: Offer; values?: Partial<Offer> }) {
  const o = { ...offer, ...values };
  return (
    <Card className="mx-auto max-w-[800px] overflow-hidden">
      <div className="relative"><img src={img(o.seed, 1200, 500)} alt="" className="aspect-[12/5] w-full object-cover" /><div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-6 pb-5 pt-16"><Badge tone="blue">{o.category}</Badge><h2 className="mt-2 text-xl font-bold text-white">{o.title || "Untitled offer"}</h2></div></div>
      <div className="px-6 py-5">
        <SectionLabel>About this offer</SectionLabel>
        <p className="mt-2 text-sm leading-6 text-slate-600">{o.description || "No description yet."}</p>
        <div className="mt-5 grid gap-6 sm:grid-cols-2">
          <div><SectionLabel className="text-blue-600">📞 Contact</SectionLabel><ul className="mt-2 space-y-0.5 text-xs text-slate-700">{o.contact.map((c) => <li key={c}>{c}</li>)}</ul></div>
          <div><SectionLabel className="text-green-600">✅ How to Claim</SectionLabel><p className="mt-2 text-xs leading-5 text-slate-700">{o.claim}</p></div>
        </div>
        <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs text-slate-500">📅 Offer available {o.start || "—"} – {o.end || "—"}</div>
      </div>
    </Card>
  );
}
