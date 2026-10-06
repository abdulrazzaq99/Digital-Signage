"use client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/misc";
import { QueryState, Skeleton } from "@/components/ui/query-state";
import { categoryTone, useOffer, useRecordOfferView } from "@/lib/api/hooks/offers";
import type { Offer } from "@/lib/api/types";
import { formatDate } from "@/lib/format";
import { phoneDigits } from "@/lib/validation/fields";
import { formatPhone } from "@/lib/validation/masks";
import { Check, Clock, Mail, Phone } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { OfferCover } from "./offers-page";
import { BackLinkButton } from "./portal-stepper";

/** Customer-facing offer body, shared with the admin marketplace preview. */
export function OfferBody({ offer }: { offer: Offer }) {
  const [contact, setContact] = useState(false);
  const paragraphs = (offer.description ?? "").split(/\n{2,}/).filter(Boolean);
  const included = offer.included ?? [];
  const steps = offer.steps ?? [];
  const c = offer.contact;
  return (
    <>
      <OfferCover offer={offer} className="aspect-[12/5] rounded-xl" />
      <div className="flex flex-wrap items-center gap-2"><Badge tone={categoryTone(offer.category)}>{offer.category}</Badge>{offer.endsAt && <span className="flex items-center gap-1 text-[11px] text-slate-500"><Clock className="h-3 w-3" /> Available until {formatDate(offer.endsAt)}</span>}</div>
      <h1 className="text-xl font-bold tracking-tight text-slate-900">{offer.title}</h1>
      <p className="text-sm font-medium text-slate-700">{offer.summary}</p>
      {paragraphs.map((p, i) => <p key={i} className="text-sm leading-6 text-slate-600">{p}</p>)}
      {included.length > 0 && <Card className="bg-slate-50/60 px-5 py-4"><div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">What&apos;s included</div><ul className="mt-2 grid gap-2 sm:grid-cols-2">{included.map((i) => <li key={i} className="flex items-center gap-2 text-xs text-slate-700"><Check className="h-3.5 w-3.5 text-green-500" />{i}</li>)}</ul></Card>}
      <div><div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">How to get started</div>{steps.length > 0 ? <ol className="mt-2 space-y-2">{steps.map((s, i) => <li key={i} className="flex items-start gap-3 text-xs text-slate-700"><span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-50 text-[10px] font-semibold text-blue-600">{i + 1}</span><span className="pt-0.5">{s}</span></li>)}</ol> : <p className="mt-2 text-xs leading-5 text-slate-700">{offer.instructions}</p>}</div>
      <Card className="px-5 py-4">
        <div className="text-sm font-semibold text-slate-900">Interested in this offer?</div><p className="mt-0.5 text-[11px] text-slate-400">Contact your account manager to get started. There&apos;s no obligation.</p>
        <Button className="mt-3" size="sm" onClick={() => setContact((v) => !v)}><Phone className="h-3.5 w-3.5" /> {contact ? "Hide Contact Details" : "View Contact Details"}</Button>
        {contact && c && <div className="mt-4 flex items-start gap-3 border-t border-slate-100 pt-4 animate-fade-in"><Avatar name={c.name || "Contact"} size="md" className="bg-blue-600" /><div><div className="text-sm font-semibold text-slate-900">{c.name || "Your account manager"}</div>{c.role && <div className="text-[11px] text-slate-400">{c.role}</div>}{c.email && <a href={`mailto:${c.email}`} className="mt-2 flex items-center gap-1.5 text-xs text-blue-600 hover:underline"><Mail className="h-3 w-3" />{c.email}</a>}{c.phone && <a href={`tel:${phoneDigits(c.phone)}`} className="mt-1 flex items-center gap-1.5 text-xs text-blue-600 hover:underline"><Phone className="h-3 w-3" />{formatPhone(c.phone)}</a>}{c.hours && <div className="mt-1 text-[11px] text-slate-500">{c.hours}</div>}</div></div>}
      </Card>
    </>
  );
}

export function OfferDetail({ id, basePath = "/portal/offers", recordView = true }: { id: string; basePath?: string; recordView?: boolean }) {
  const router = useRouter();
  const offer = useOffer(id);
  const { mutate: record } = useRecordOfferView();
  const recorded = useRef<string | null>(null);
  // Counting the view unlocks Scratch & Win campaigns that require an Offers visit. Once per offer per mount.
  useEffect(() => { if (recordView && id && recorded.current !== id) { recorded.current = id; record(id); } }, [id, recordView, record]);
  return (
    <div className="max-w-[800px] space-y-4">
      <BackLinkButton label="All Offers" onClick={() => router.push(basePath)} />
      <QueryState query={offer} skeleton={<><Skeleton className="aspect-[12/5] w-full" /><Skeleton className="h-6 w-1/2" /><Skeleton className="h-24" /></>}>{(o) => <OfferBody offer={o} />}</QueryState>
    </div>
  );
}
