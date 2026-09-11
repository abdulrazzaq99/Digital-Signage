"use client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { Alert, BackLink } from "@/components/ui/misc";
import type { Offer } from "@/lib/data";
import { img } from "@/lib/utils";
import { ArrowLeft, Eye, ImageIcon, Info, Save, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { OfferCustomerCard } from "./offer-detail";
import { OffersShell } from "./offers-shell";

const blank: Offer = { id: "new", title: "", status: "Draft", category: "Retail & Shopping", views: "0", unique: "0", published: "Draft", seed: "", description: "", contact: [], claim: "", start: "", end: "", created: "", updated: "" };

export function OfferForm({ offer, mode }: { offer?: Offer; mode: "create" | "edit" | "preview" }) {
  const router = useRouter();
  const base = offer ?? blank;
  const [f, setF] = useState({ title: base.title, description: base.description, contact: base.contact.join("\n"), claim: base.claim, category: base.category, start: base.start, end: base.end });
  const [preview, setPreview] = useState(mode === "preview");
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setF({ ...f, [k]: e.target.value });
  const backHref = offer ? `/offers/${offer.id}` : "/offers";

  if (preview) {
    return (
      <OffersShell tab="manage" hideCreate>
        <BackLink href={backHref} label="Back to Edit" current="Customer Preview" />
        <div className="flex items-center gap-3"><Badge tone="blue" className="uppercase"><Eye className="h-2.5 w-2.5" /> Customer View Preview</Badge><span className="text-xs text-slate-400">This is exactly what customers will see in the Marketplace.</span></div>
        <OfferCustomerCard offer={{ ...base, seed: base.seed || "fashion" }} values={{ title: f.title, description: f.description, contact: f.contact.split("\n").filter(Boolean), claim: f.claim, category: f.category, start: f.start, end: f.end }} />
        <div className="flex justify-between"><Button variant="secondary" onClick={() => setPreview(false)}><ArrowLeft className="h-3.5 w-3.5" /> Back to Edit</Button><div className="flex gap-2"><Button variant="secondary"><Save className="h-3.5 w-3.5" /> Save Draft</Button><Button variant="success" onClick={() => router.push("/offers")}><Send className="h-3.5 w-3.5" /> Save &amp; Publish {mode === "create" ? "" : "Changes"}</Button></div></div>
      </OffersShell>
    );
  }

  return (
    <OffersShell tab="manage" hideCreate>
      <BackLink href={backHref} label="Offers" current={offer ? "Edit Offer" : "New Offer"} />
      <div className="grid gap-6 xl:grid-cols-[1fr_260px]">
        <div className="space-y-5">
          <div><Label>Offer Image</Label><div className="relative flex aspect-[4/1] items-center justify-center overflow-hidden rounded-xl bg-slate-400">{base.seed && <img src={img(base.seed, 1200, 300)} alt="" className="absolute inset-0 h-full w-full object-cover" />}<Button variant="secondary" size="sm" className="relative"><ImageIcon className="h-3.5 w-3.5" /> Change Image</Button></div></div>
          <div><Label required>Title</Label><Input placeholder="e.g. Summer Sale — Up to 40% Off" value={f.title} onChange={set("title")} maxLength={120} /><div className="mt-1 text-[10px] text-slate-400">{f.title.length}/120</div></div>
          <div><Label required>Description</Label><Textarea rows={4} placeholder="Describe the offer in detail — what is included, why customers should act now..." value={f.description} onChange={set("description")} /></div>
          <div><Label required>Contact Information</Label><Textarea rows={3} placeholder="Phone number, email address, store hours, website..." value={f.contact} onChange={set("contact")} /></div>
          <div><Label required>Buying Instructions</Label><Textarea rows={3} placeholder="How should customers claim this offer? Promo codes, steps, limitations..." value={f.claim} onChange={set("claim")} /></div>
        </div>
        <div className="space-y-4">
          <div><Label>Category</Label><Select value={f.category} onChange={set("category")}><option>Retail &amp; Shopping</option><option>Food &amp; Beverage</option><option>Travel &amp; Hospitality</option><option>Technology</option><option>Health &amp; Wellness</option></Select></div>
          <Card className="px-4 py-4"><div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">📅 Availability Dates <span className="text-[10px] font-normal text-slate-400">(optional)</span></div><div className="mt-3 space-y-3"><div><Label>Start Date</Label><Input type="date" value={f.start} onChange={set("start")} /></div><div><Label>End Date</Label><Input type="date" value={f.end} onChange={set("end")} /></div></div><p className="mt-3 text-[10px] leading-4 text-slate-400">If set, the offer will appear active only within this date range. Outside of it the offer will show as inactive.</p></Card>
          <Alert tone="blue" icon={<Info className="h-3.5 w-3.5 shrink-0" />}><span className="font-semibold">Publishing tip</span><br />Save as draft first to review the customer-facing appearance. Once you&apos;re satisfied, publish to make the offer live in the Marketplace.</Alert>
        </div>
      </div>
      <div className="flex justify-between"><Button variant="secondary" onClick={() => router.push(backHref)}>Cancel</Button><div className="flex gap-2"><Button variant="secondary"><Save className="h-3.5 w-3.5" /> Save Draft</Button><Button disabled={!f.title || !f.description} onClick={() => setPreview(true)}><Eye className="h-3.5 w-3.5" /> Preview {offer ? "Changes" : "Offer"}</Button></div></div>
    </OffersShell>
  );
}
