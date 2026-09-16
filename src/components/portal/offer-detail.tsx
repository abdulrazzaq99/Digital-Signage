"use client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/misc";
import type { PortalOffer } from "@/lib/portal-data";
import { img } from "@/lib/utils";
import { Check, Mail, Phone } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { catTone } from "./offers-page";
import { BackLinkButton } from "./portal-stepper";

export function OfferDetail({ offer }: { offer: PortalOffer }) {
  const router = useRouter();
  const [contact, setContact] = useState(false);
  return (
    <div className="max-w-[800px] space-y-4">
      <BackLinkButton label="All Offers" onClick={() => router.push("/portal/offers")} />
      <img src={img(offer.seed, 1200, 500)} alt="" className="aspect-[12/5] w-full rounded-xl object-cover" />
      <Badge tone={catTone[offer.category]}>{offer.category}</Badge>
      <h1 className="text-xl font-bold tracking-tight text-slate-900">{offer.title}</h1>
      {offer.body.map((p) => <p key={p.slice(0, 20)} className="text-sm leading-6 text-slate-600">{p}</p>)}
      <Card className="bg-slate-50/60 px-5 py-4"><div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">What&apos;s included</div><ul className="mt-2 grid gap-2 sm:grid-cols-2">{offer.included.map((i) => <li key={i} className="flex items-center gap-2 text-xs text-slate-700"><Check className="h-3.5 w-3.5 text-green-500" />{i}</li>)}</ul></Card>
      <div><div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">How to get started</div><ol className="mt-2 space-y-2">{offer.steps.map((s, i) => <li key={s} className="flex items-start gap-3 text-xs text-slate-700"><span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-50 text-[10px] font-semibold text-blue-600">{i + 1}</span><span className="pt-0.5">{s}</span></li>)}</ol></div>
      <Card className="px-5 py-4">
        <div className="text-sm font-semibold text-slate-900">Interested in this offer?</div><p className="mt-0.5 text-[11px] text-slate-400">Contact your account manager to get started. There&apos;s no obligation.</p>
        <Button className="mt-3" size="sm" onClick={() => setContact((v) => !v)}><Phone className="h-3.5 w-3.5" /> {contact ? "Hide Contact Details" : "View Contact Details"}</Button>
        {contact && <div className="mt-4 flex items-start gap-3 border-t border-slate-100 pt-4 animate-fade-in"><Avatar name={offer.contact.name} size="md" className="bg-blue-600" /><div><div className="text-sm font-semibold text-slate-900">{offer.contact.name}</div><div className="text-[11px] text-slate-400">{offer.contact.role}</div><a href={`mailto:${offer.contact.email}`} className="mt-2 flex items-center gap-1.5 text-xs text-blue-600 hover:underline"><Mail className="h-3 w-3" />{offer.contact.email}</a><a href={`tel:${offer.contact.phone}`} className="mt-1 flex items-center gap-1.5 text-xs text-blue-600 hover:underline"><Phone className="h-3 w-3" />{offer.contact.phone}</a></div></div>}
      </Card>
    </div>
  );
}
