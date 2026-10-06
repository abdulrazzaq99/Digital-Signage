"use client";
import { OfferBody } from "@/components/portal/offer-detail";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { applyApiError, Field, FormError, FormPhone, maskedRegister, SubmitButton, useZodForm } from "@/components/ui/form";
import { Input, Select, Textarea } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Alert, BackLink, SuccessIcon } from "@/components/ui/misc";
import { QueryState, Skeleton } from "@/components/ui/query-state";
import { useToast } from "@/components/ui/toast";
import { useCreateOffer, useOffer, usePublishOffer, useUpdateOffer } from "@/lib/api/hooks/offers";
import type { Offer, Schemas } from "@/lib/api/types";
import { toDateInput } from "@/lib/format";
import { maskName } from "@/lib/validation/masks";
import { AlertTriangle, ArrowLeft, Check, Eye, Info, Save, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useWatch } from "react-hook-form";
import { MAX_LINE, MAX_LINES, OFFER_API_FIELDS, OFFER_CATEGORIES, offerSchema, toLines, toOfferBody, type OfferFormValues, type OfferParsed } from "./offer-schema";
import { OffersShell } from "./offers-shell";

/** Local preview object shaped like the API's Offer so the customer body can render unsaved edits. */
const previewOffer = (b: Schemas["CreateOfferBody"], base?: Offer): Offer => ({ id: base?.id ?? "preview", status: base?.status ?? "DRAFT", imageUrl: base?.imageUrl ?? null, publishedAt: base?.publishedAt ?? null, createdAt: base?.createdAt ?? new Date().toISOString(), updatedAt: new Date().toISOString(), ...b, startsAt: b.startsAt ?? null, endsAt: b.endsAt ?? null });

const fromOffer = (o?: Offer): OfferFormValues => ({
  title: o?.title ?? "", // A stored category outside the allowed list shows "Choose a category" rather than failing on save.
  category: (o?.category ?? OFFER_CATEGORIES[0]) as OfferFormValues["category"], summary: o?.summary ?? "", description: o?.description ?? "", instructions: o?.instructions ?? "",
  included: (o?.included ?? []).join("\n"), steps: (o?.steps ?? []).join("\n"),
  contactName: o?.contact?.name ?? "", contactRole: o?.contact?.role ?? "", contactEmail: o?.contact?.email ?? "", contactPhone: o?.contact?.phone ?? "", contactHours: o?.contact?.hours ?? "",
  start: toDateInput(o?.startsAt), end: toDateInput(o?.endsAt),
});

function Form({ offer, mode }: { offer?: Offer; mode: "create" | "edit" | "preview" }) {
  const router = useRouter();
  const toast = useToast();
  const create = useCreateOffer();
  const update = useUpdateOffer();
  const publish = usePublishOffer();
  const form = useZodForm(offerSchema, { defaultValues: fromOffer(offer) });
  const { register, formState, control } = form;
  const errors = formState.errors;
  const [preview, setPreview] = useState(mode === "preview");
  const [confirm, setConfirm] = useState<"none" | "ask" | "done">("none");
  const isLive = offer?.status === "PUBLISHED";
  const backHref = offer ? `/offers/${offer.id}` : "/offers";
  const busy = create.isPending || update.isPending || publish.isPending || formState.isSubmitting;
  const values = useWatch({ control }) as OfferFormValues;
  const count = (k: keyof OfferFormValues) => String(values[k] ?? "").length;
  const lineCount = (k: "included" | "steps") => toLines(values[k] ?? "").length;
  /** The preview renders the last validated values, so it always matches what would be saved. */
  const [previewBody, setPreviewBody] = useState<Schemas["CreateOfferBody"] | null>(null);
  const shownBody = previewBody ?? toOfferBody(offerSchema.safeParse(fromOffer(offer)).data ?? (fromOffer(offer) as OfferParsed), !!offer);

  /** Saves (create or update) and returns the saved offer. */
  const save = (v: OfferParsed) => (offer ? update.mutateAsync({ id: offer.id, ...toOfferBody(v, true) }) : create.mutateAsync(toOfferBody(v, false)));
  const onError = (e: unknown) => {
    applyApiError(form, e, OFFER_API_FIELDS);
    // A field the server rejected is only visible on the edit screen.
    if (Object.keys(form.formState.errors).some((k) => k !== "root")) setPreview(false);
  };
  const saveDraft = form.handleSubmit(async (v) => { try { const o = await save(v); toast.success(offer ? "Changes saved" : "Draft saved", o.title); router.push(`/offers/${o.id}`); } catch (e) { onError(e); } }, () => setPreview(false));
  const saveAndPublish = form.handleSubmit(async (v) => { try { const o = await save(v); if (o.status !== "PUBLISHED") await publish.mutateAsync(o.id); setConfirm("done"); } catch (e) { setConfirm("none"); onError(e); } }, () => { setConfirm("none"); setPreview(false); });
  const showPreview = form.handleSubmit((v) => { setPreviewBody(toOfferBody(v, !!offer)); setPreview(true); });

  if (preview) {
    return (
      <OffersShell tab="manage" hideCreate>
        <BackLink href={backHref} label="Back to Edit" current="Customer Preview" />
        <div className="flex items-center gap-3"><Badge tone="blue" className="uppercase"><Eye className="h-2.5 w-2.5" /> Customer View Preview</Badge><span className="text-xs text-slate-400">This is what customers will see in the Marketplace.</span></div>
        <Card className="mx-auto max-w-[800px] space-y-4 p-6"><OfferBody offer={previewOffer(shownBody, offer)} /></Card>
        <FormError form={form} />
        <div className="flex flex-wrap items-center justify-between gap-2"><Button variant="secondary" onClick={() => setPreview(false)} disabled={busy}><ArrowLeft className="h-3.5 w-3.5" /> Back to Edit</Button><div className="flex gap-2"><Button variant="secondary" onClick={() => void saveDraft()} disabled={busy}><Save className="h-3.5 w-3.5" /> {busy && confirm === "none" ? "Saving…" : offer ? "Save Changes" : "Save Draft"}</Button><Button variant="success" onClick={() => setConfirm("ask")} disabled={busy}><Send className="h-3.5 w-3.5" /> {isLive ? "Save & Update Live Offer" : "Save & Publish"}</Button></div></div>

        <Modal open={confirm === "ask"} onClose={() => !busy && setConfirm("none")} width="max-w-[460px]">
          <div className="p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600"><Send className="h-4 w-4" /></div>
            <h2 className="mt-4 text-base font-semibold text-slate-900">{isLive ? "Update Live Offer" : "Publish Offer"}</h2>
            <p className="mt-1.5 text-xs leading-5 text-slate-500">{isLive ? "Saving updates the offer customers already see." : <>Publishing <span className="font-semibold text-slate-800">&quot;{values.title || "Untitled offer"}&quot;</span> makes it immediately visible to all customers in the Marketplace.</>}</p>
            <ul className="mt-4 space-y-1.5 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-600">
              {["The offer is visible in the customer Marketplace.", "Customers can view the full details, contact info, and instructions.", "You can unpublish at any time from the Offer Detail page."].map((t) => <li key={t} className="flex items-start gap-2"><Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-green-600" />{t}</li>)}
            </ul>
            <div className="mt-6 flex justify-end gap-2"><Button variant="secondary" onClick={() => setConfirm("none")} disabled={busy}>Cancel</Button><Button variant="success" onClick={() => void saveAndPublish()} disabled={busy}><Send className="h-3.5 w-3.5" /> {busy ? "Publishing…" : "Confirm & Publish"}</Button></div>
          </div>
        </Modal>
        <Modal open={confirm === "done"} onClose={() => router.push("/offers")} width="max-w-[460px]">
          <div className="flex flex-col items-center px-6 py-8 text-center">
            <SuccessIcon />
            <h2 className="mt-4 text-base font-semibold text-slate-900">Published Successfully</h2>
            <p className="mt-1 text-xs text-slate-500">&quot;{values.title}&quot; is live in the customer Marketplace.</p>
            <Button variant="success" className="mt-5 w-full" onClick={() => router.push("/offers")}>Done</Button>
          </div>
        </Modal>
      </OffersShell>
    );
  }

  return (
    <OffersShell tab="manage" hideCreate>
      <BackLink href={backHref} label="Offers" current={offer ? "Edit Offer" : "New Offer"} />
      {isLive && <Alert tone="amber" icon={<AlertTriangle className="h-3.5 w-3.5 shrink-0" />}><span className="font-semibold">This offer is currently live.</span> Saving changes immediately updates the published offer.</Alert>}
      {/* Enter opens the preview (nothing is saved without an explicit Save / Publish). */}
      <form onSubmit={showPreview} noValidate className="space-y-5">
      <div className="grid gap-6 xl:grid-cols-[1fr_280px]">
        <div className="space-y-5">
          <Field label="Title" required error={errors.title?.message} hint={`${count("title")}/120 · at least 3 characters`}><Input placeholder="e.g. Summer Sale — Up to 40% Off" maxLength={120} {...maskedRegister(form, "title", maskName)} /></Field>
          <Field label="Summary" required error={errors.summary?.message} hint={`${count("summary")}/300 · at least 10 characters`}><Input placeholder="One line shown on the offer card" maxLength={300} {...register("summary")} /></Field>
          <Field label="Description" required error={errors.description?.message} hint={`${count("description")}/2000 · at least 10 characters`}><Textarea rows={5} maxLength={2000} placeholder="Describe the offer in detail — what is included, why customers should act now..." {...register("description")} /></Field>
          <Field label="Buying Instructions" required error={errors.instructions?.message} hint={`${count("instructions")}/2000 · at least 5 characters`}><Textarea rows={3} maxLength={2000} placeholder="How should customers claim this offer? Promo codes, steps, limitations..." {...register("instructions")} /></Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="What's included" error={errors.included?.message} hint={`${lineCount("included")}/${MAX_LINES} lines · up to ${MAX_LINE} characters each`}><Textarea rows={4} placeholder="One item per line" {...register("included")} /></Field>
            <Field label="Steps to get started" error={errors.steps?.message} hint={`${lineCount("steps")}/${MAX_LINES} lines · up to ${MAX_LINE} characters each`}><Textarea rows={4} placeholder="One step per line" {...register("steps")} /></Field>
          </div>
          <Card className="px-4 py-4">
            <div className="text-xs font-semibold text-slate-800">Contact</div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <Field label="Name" required error={errors.contactName?.message}><Input placeholder="Account manager" maxLength={120} autoComplete="off" {...maskedRegister(form, "contactName", maskName)} /></Field>
              <Field label="Role" error={errors.contactRole?.message}><Input maxLength={80} {...register("contactRole")} /></Field>
              <Field label="Email" error={errors.contactEmail?.message}><Input type="email" inputMode="email" autoCapitalize="off" maxLength={254} placeholder="name@company.com" {...register("contactEmail")} /></Field>
              <Field label="Phone" error={errors.contactPhone?.message}><FormPhone form={form} name="contactPhone" autoComplete="off" /></Field>
              <Field label="Hours" className="sm:col-span-2" error={errors.contactHours?.message}><Input maxLength={120} placeholder="Mon–Fri 9:00–17:00" {...register("contactHours")} /></Field>
            </div>
          </Card>
        </div>
        <div className="space-y-4">
          <Field label="Category" error={errors.category?.message}><Select {...register("category")}>{[...new Set([values.category ?? "", ...OFFER_CATEGORIES])].filter(Boolean).map((c) => <option key={c}>{c}</option>)}</Select></Field>
          <Card className="px-4 py-4"><div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">📅 Availability Dates <span className="text-[10px] font-normal text-slate-400">(optional)</span></div><div className="mt-3 space-y-3"><Field label="Start Date" error={errors.start?.message}><Input type="date" {...register("start", { onChange: () => formState.touchedFields.end && void form.trigger("end") })} /></Field><Field label="End Date" error={errors.end?.message}><Input type="date" min={values.start || undefined} {...register("end")} /></Field></div><p className="mt-3 text-[10px] leading-4 text-slate-400">Past the end date the offer shows as expired for customers.</p></Card>
          <Alert tone="blue" icon={<Info className="h-3.5 w-3.5 shrink-0" />}><span className="font-semibold">Images</span><br />Cover images are set through the API (storage key). Offers without an image show a category-coloured cover.</Alert>
          <FormError form={form} />
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2"><Button type="button" variant="secondary" onClick={() => router.push(backHref)}>Cancel</Button><div className="flex gap-2"><Button type="button" variant="secondary" onClick={() => void saveDraft()} disabled={busy}><Save className="h-3.5 w-3.5" /> {busy ? "Saving…" : offer ? "Save Changes" : "Save Draft"}</Button><SubmitButton form={form} disabled={busy} pendingText="Checking…"><Eye className="h-3.5 w-3.5" /> Preview {offer ? "Changes" : "Offer"}</SubmitButton></div></div>
      </form>
    </OffersShell>
  );
}

export function OfferForm({ id, mode }: { id?: string; mode: "create" | "edit" | "preview" }) {
  const offer = useOffer(id ?? "");
  if (!id) return <Form mode="create" />;
  return <QueryState query={offer} skeleton={<OffersShell tab="manage" hideCreate><Skeleton className="h-96" /></OffersShell>}>{(o) => <Form key={o.id} offer={o} mode={mode} />}</QueryState>;
}
