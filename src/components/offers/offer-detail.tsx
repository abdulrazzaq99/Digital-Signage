"use client";
import { OfferBody } from "@/components/portal/offer-detail";
import { OfferCover } from "@/components/portal/offers-page";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, SectionLabel } from "@/components/ui/card";
import { BackLink } from "@/components/ui/misc";
import { QueryState, Skeleton } from "@/components/ui/query-state";
import { useToast } from "@/components/ui/toast";
import { useCompanyNames } from "@/lib/api/hooks/companies";
import { offerTone, useOffer, useOfferStats, usePublishOffer } from "@/lib/api/hooks/offers";
import type { Offer } from "@/lib/api/types";
import { formatDate, formatDateTime, label } from "@/lib/format";
import { Eye, EyeOff, Pencil, Trash2, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { DeleteOfferModal, UnpublishOfferModal } from "./offer-modals";
import { OffersShell } from "./offers-shell";

function Detail({ offer }: { offer: Offer }) {
  const router = useRouter();
  const toast = useToast();
  const stats = useOfferStats(offer.id);
  const { names } = useCompanyNames();
  const publish = usePublishOffer();
  const [unpub, setUnpub] = useState(false);
  const [del, setDel] = useState(false);
  const doPublish = () => publish.mutate(offer.id, { onSuccess: () => toast.success("Offer published", "It is now visible in the customer Marketplace."), onError: (e) => toast.error(e) });
  return (
    <>
      <BackLink href="/offers" label="Offers" current={offer.title} />
      <div className="grid gap-6 xl:grid-cols-[1fr_300px]">
        <div>
          <OfferCover offer={offer} className="aspect-[3/1] rounded-xl" />
          <h1 className="mt-5 text-xl font-bold tracking-tight text-slate-900">{offer.title}</h1>
          <Badge tone={offerTone(offer.status)} dot className="mt-2">{label(offer.status)}</Badge>
          <p className="mt-4 text-sm font-medium text-slate-700">{offer.summary}</p>
          <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-600">{offer.description}</p>
          <SectionLabel className="mt-6">Contact Information</SectionLabel>
          <ul className="mt-2 space-y-0.5 text-xs text-slate-700">{[offer.contact.name, offer.contact.role, offer.contact.email, offer.contact.phone, offer.contact.hours].filter(Boolean).map((c) => <li key={c}>{c}</li>)}</ul>
          <SectionLabel className="mt-5">Buying Instructions</SectionLabel>
          <p className="mt-2 whitespace-pre-line text-xs leading-5 text-slate-700">{offer.instructions}</p>
          {offer.included.length > 0 && <><SectionLabel className="mt-5">What&apos;s included</SectionLabel><ul className="mt-2 list-disc space-y-0.5 pl-4 text-xs text-slate-700">{offer.included.map((i) => <li key={i}>{i}</li>)}</ul></>}
          {offer.steps.length > 0 && <><SectionLabel className="mt-5">Steps</SectionLabel><ol className="mt-2 list-decimal space-y-0.5 pl-4 text-xs text-slate-700">{offer.steps.map((s) => <li key={s}>{s}</li>)}</ol></>}
        </div>
        <div className="space-y-4">
          <Card><CardHeader title="Statistics" /><div className="grid grid-cols-2 divide-x divide-slate-100 px-2 py-4 text-center"><div><Eye className="mx-auto h-4 w-4 text-blue-500" /><div className="mt-1 text-lg font-bold text-slate-900">{stats.data?.totalViews ?? offer.stats?.totalViews ?? 0}</div><div className="text-[10px] text-slate-400">Total Views</div></div><div><Users className="mx-auto h-4 w-4 text-violet-500" /><div className="mt-1 text-lg font-bold text-slate-900">{stats.data?.uniqueViewers ?? offer.stats?.uniqueViewers ?? 0}</div><div className="text-[10px] text-slate-400">Unique Viewers</div></div></div>
            {stats.data && stats.data.byCompany.length > 0 && <ul className="divide-y divide-slate-100 border-t border-slate-100 px-5 py-2 text-xs">{stats.data.byCompany.map((c) => <li key={c.companyId ?? "none"} className="flex justify-between py-1.5"><span className="text-slate-600">{c.companyId ? names[c.companyId] ?? "Company" : "Platform"}</span><span className="font-semibold text-slate-800">{c.views}</span></li>)}</ul>}
            {stats.data?.lastViewedAt && <div className="border-t border-slate-100 px-5 py-2 text-[10px] text-slate-400">Last viewed {formatDateTime(stats.data.lastViewedAt)}</div>}
          </Card>
          <Card><CardHeader title="Details" /><dl className="divide-y divide-slate-100 px-5 text-xs">{[["Category", offer.category], ["Status", label(offer.status)], ["Created", formatDate(offer.createdAt)], ["Published", offer.publishedAt ? formatDate(offer.publishedAt) : "—"], ["Last Updated", formatDate(offer.updatedAt)], ["Start Date", offer.startsAt ? formatDate(offer.startsAt) : "—"], ["End Date", offer.endsAt ? formatDate(offer.endsAt) : "—"]].map(([k, v]) => <div key={k} className="flex justify-between py-2.5"><dt className="text-slate-400">{k}</dt><dd className="font-semibold text-slate-800">{v}</dd></div>)}</dl></Card>
          <Button href={`/offers/${offer.id}/edit`} className="w-full"><Pencil className="h-3.5 w-3.5" /> Edit Offer</Button>
          {offer.status === "PUBLISHED" ? <Button variant="secondary" className="w-full" onClick={() => setUnpub(true)}><EyeOff className="h-3.5 w-3.5" /> Unpublish</Button> : <Button variant="success" className="w-full" onClick={doPublish} disabled={publish.isPending}><Eye className="h-3.5 w-3.5" /> {publish.isPending ? "Publishing…" : "Publish"}</Button>}
          <Button variant="secondary" className="w-full" href={`/offers/${offer.id}/preview`}><Eye className="h-3.5 w-3.5" /> Customer Preview</Button>
          <Button variant="danger-outline" className="w-full" onClick={() => setDel(true)}><Trash2 className="h-3.5 w-3.5" /> Delete Offer</Button>
        </div>
      </div>
      <UnpublishOfferModal offer={unpub ? offer : null} onClose={() => setUnpub(false)} />
      <DeleteOfferModal offer={del ? offer : null} onClose={() => setDel(false)} onDeleted={() => router.replace("/offers")} />
    </>
  );
}

export function OfferDetail({ id }: { id: string }) {
  const offer = useOffer(id);
  return <OffersShell tab="manage" hideCreate><QueryState query={offer} skeleton={<Skeleton className="h-96" />}>{(o) => <Detail offer={o} />}</QueryState></OffersShell>;
}

/** Customer-facing rendering inside the admin shell: used by the marketplace tab and the preview route. */
export function MarketplaceOffer({ id, preview }: { id: string; preview?: boolean }) {
  const offer = useOffer(id);
  return (
    <OffersShell tab={preview ? "manage" : "marketplace"} hideCreate>
      <BackLink href={preview ? `/offers/${id}` : "/offers?tab=marketplace"} label={preview ? "Offer" : "Marketplace"} current={offer.data?.title ?? "…"} />
      {preview && <div className="flex items-center gap-3"><Badge tone="blue" className="uppercase"><Eye className="h-2.5 w-2.5" /> Customer View Preview</Badge><span className="text-xs text-slate-400">Exactly what customers see in the Marketplace. Views are not counted from here.</span></div>}
      <QueryState query={offer} skeleton={<Skeleton className="h-96 max-w-[800px]" />}>{(o) => <div className="max-w-[800px] space-y-4"><OfferBody offer={o} /></div>}</QueryState>
    </OffersShell>
  );
}
