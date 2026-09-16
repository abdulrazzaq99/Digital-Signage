"use client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { Alert, BackLink } from "@/components/ui/misc";
import type { Offer } from "@/lib/data";
import { img } from "@/lib/utils";
import { AlertTriangle, ArrowLeft, Check, Eye, ImageIcon, Info, Save, Send } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { SuccessIcon } from "@/components/ui/misc";
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
  const [confirm, setConfirm] = useState<"none" | "ask" | "done">("none");
  const isLive = offer?.status === "Active";
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setF({ ...f, [k]: e.target.value });
  const backHref = offer ? `/offers/${offer.id}` : "/offers";

  if (preview) {
    return (
      <OffersShell tab="manage" hideCreate>
        <BackLink href={backHref} label="Back to Edit" current="Customer Preview" />
        <div className="flex items-center gap-3"><Badge tone="blue" className="uppercase"><Eye className="h-2.5 w-2.5" /> Customer View Preview</Badge><span className="text-xs text-slate-400">This is exactly what customers will see in the Marketplace.</span></div>
        <OfferCustomerCard offer={{ ...base, seed: base.seed || "fashion" }} values={{ title: f.title, description: f.description, contact: f.contact.split("\n").filter(Boolean), claim: f.claim, category: f.category, start: f.start, end: f.end }} />
        <div className="flex flex-wrap items-center justify-between gap-2"><Button variant="secondary" onClick={() => setPreview(false)}><ArrowLeft className="h-3.5 w-3.5" /> Back to Edit</Button><div className="flex gap-2"><Button variant="secondary"><Save className="h-3.5 w-3.5" /> Save Draft</Button><Button variant="success" onClick={() => setConfirm("ask")}><Send className="h-3.5 w-3.5" /> Save &amp; Publish {mode === "create" ? "" : "Changes"}</Button></div></div>

        <Modal open={confirm === "ask"} onClose={() => setConfirm("none")} width="max-w-[460px]">
          <div className="p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600"><Send className="h-4 w-4" /></div>
            <h2 className="mt-4 text-base font-semibold text-slate-900">Publish Offer</h2>
            <p className="mt-1.5 text-xs leading-5 text-slate-500">Publishing <span className="font-semibold text-slate-800">&quot;{f.title || "Untitled offer"}&quot;</span> will make it immediately visible to all customers in the Marketplace.</p>
            <ul className="mt-4 space-y-1.5 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-600">
              {["The offer becomes visible in the customer Marketplace.", "Customers can view the full details, contact info, and instructions.", "You can unpublish at any time from the Offer Detail page."].map((t) => <li key={t} className="flex items-start gap-2"><Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-green-600" />{t}</li>)}
            </ul>
            <div className="mt-6 flex justify-end gap-2"><Button variant="secondary" onClick={() => setConfirm("none")}>Cancel</Button><Button variant="success" onClick={() => setConfirm("done")}><Send className="h-3.5 w-3.5" /> Confirm &amp; Publish</Button></div>
          </div>
        </Modal>
        <Modal open={confirm === "done"} onClose={() => router.push("/offers")} width="max-w-[460px]">
          <div className="flex flex-col items-center px-6 py-8 text-center">
            <SuccessIcon />
            <h2 className="mt-4 text-base font-semibold text-slate-900">Published Successfully</h2>
            <p className="mt-1 text-xs text-slate-500">&quot;{f.title || "Untitled offer"}&quot; is now live in the customer Marketplace.</p>
            <Button variant="success" className="mt-5 w-full" onClick={() => router.push("/offers")}>Done</Button>
          </div>
        </Modal>
      </OffersShell>
    );
  }

  return (
    <OffersShell tab="manage" hideCreate>
      <BackLink href={backHref} label="Offers" current={offer ? "Edit Offer" : "New Offer"} />
      {isLive && <Alert tone="amber" icon={<AlertTriangle className="h-3.5 w-3.5 shrink-0" />}><span className="font-semibold">This offer is currently live.</span> Saving changes will immediately update the published offer.</Alert>}
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
      <div className="flex flex-wrap items-center justify-between gap-2"><Button variant="secondary" onClick={() => router.push(backHref)}>Cancel</Button><div className="flex gap-2"><Button variant="secondary"><Save className="h-3.5 w-3.5" /> Save Draft</Button><Button disabled={!f.title || !f.description} onClick={() => setPreview(true)}><Eye className="h-3.5 w-3.5" /> Preview {offer ? "Changes" : "Offer"}</Button></div></div>
    </OffersShell>
  );
}
