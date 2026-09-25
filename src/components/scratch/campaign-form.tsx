"use client";
import { Button } from "@/components/ui/button";
import { Card, SectionLabel } from "@/components/ui/card";
import { applyApiError, Field, fieldError, FormError, maskedRegister, SubmitButton, useZodForm } from "@/components/ui/form";
import { Input, Textarea, Toggle } from "@/components/ui/input";
import { Modal, ModalHeader } from "@/components/ui/modal";
import { Alert, BackLink, Stepper } from "@/components/ui/misc";
import { QueryState, Skeleton } from "@/components/ui/query-state";
import { TD, TH, THead, TR, Table } from "@/components/ui/table";
import { useToast } from "@/components/ui/toast";
import { useActivateCampaign, useAddPrize, useCampaign, useCreateCampaign, useDeletePrize, useUpdateCampaign } from "@/lib/api/hooks/campaigns";
import type { Campaign, Schemas } from "@/lib/api/types";
import { toDateInput, todayInput } from "@/lib/format";
import { maskInteger, maskName } from "@/lib/validation/masks";
import { cn } from "@/lib/utils";
import { ArrowLeft, ArrowRight, Gift, Loader2, Lock, Plus, Save, Send, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { z } from "zod";
import { useFieldArray, useWatch, type FieldPath } from "react-hook-form";
import { campaignSchema, campaignWindow, formatOdds, MAX_PRIZES, prizeSchema, winOdds, type CampaignValues, type PrizeRow } from "./campaign-schema";
import { ScratchShell } from "./scratch-shell";

const STEPS = ["Basic Info", "Eligibility", "Prize Setup", "Review"];
const STEP_FIELDS: FieldPath<CampaignValues>[][] = [["title", "description", "start", "end"], ["maxAttempts", "loseWeight"], ["prizes"]];
/** API field names → form field names, for server validation errors. */
const API_FIELDS = { startsAt: "start", endsAt: "end" };
const stepOf = (name: string) => Math.max(0, STEP_FIELDS.findIndex((fs) => fs.some((f) => name === f || name.startsWith(`${f}.`)))) + 1;

/**
 * The API doesn't return a campaign's lose weight or prize draw weights (the odds stay server-side),
 * so on edit they're unknown: shown as blank / "—" and never overwritten unless the admin enters a value.
 * If the API starts returning them, they're picked up here.
 */
type PrizeIn = Campaign["prizes"][number] & { weight?: number };
type WithWeights = Omit<Campaign, "prizes"> & { loseWeight?: number; prizes: PrizeIn[] };
const toRows = (prizes: PrizeIn[], known: Map<string, string> = new Map()): PrizeRow[] =>
  prizes.map((p) => ({ id: p.id, name: p.name, value: p.value ?? "", quantity: String(p.quantity), weight: p.weight !== undefined ? String(p.weight) : known.get(p.id) ?? "", remaining: p.remaining, awarded: p.awarded }));

function Form({ campaign }: { campaign?: WithWeights }) {
  const router = useRouter();
  const toast = useToast();
  const editing = !!campaign;
  const create = useCreateCampaign();
  const update = useUpdateCampaign();
  const activate = useActivateCampaign();
  const addPrize = useAddPrize();
  const deletePrize = useDeletePrize();
  const [step, setStep] = useState(1);
  const [addOpen, setAddOpen] = useState(false);
  const initialStart = toDateInput(campaign?.startsAt);
  const initialEnd = toDateInput(campaign?.endsAt);
  const form = useZodForm(campaignSchema(editing, initialStart), {
    defaultValues: {
      title: campaign?.title ?? "",
      description: campaign?.description ?? "",
      start: initialStart,
      end: initialEnd,
      maxAttempts: String(campaign?.maxAttempts ?? 1),
      requireOffersVisit: campaign?.requireOffersVisit ?? false,
      loseWeight: campaign ? (campaign.loseWeight !== undefined ? String(campaign.loseWeight) : "") : "50",
      activate: false,
      prizes: toRows(campaign?.prizes ?? []),
    },
  });
  const { register, control, setValue, formState } = form;
  const prizesArray = useFieldArray({ control, name: "prizes" });
  const [title = "", description = "", start = "", end = "", maxAttempts = "", requireOffers = false, loseWeight = "", activateOnSave = false] = useWatch({ control, name: ["title", "description", "start", "end", "maxAttempts", "requireOffersVisit", "loseWeight", "activate"] });
  const prizes = useWatch({ control, name: "prizes" }) ?? [];
  const odds = winOdds(prizes.map((p) => ({ weight: p.weight === "" || p.weight === undefined ? null : Number(p.weight), inStock: (p.remaining ?? Number(p.quantity)) > 0 })), loseWeight === "" ? null : Number(loseWeight));
  const loseOdds = odds.every((o) => o !== null) && loseWeight !== "" ? 1 - odds.reduce<number>((a, o) => a + (o ?? 0), 0) : null;
  const back = editing ? `/scratch-win/${campaign.id}` : "/scratch-win";
  const saving = formState.isSubmitting;
  const prizesError = (formState.errors.prizes as { root?: { message?: string }; message?: string } | undefined);

  const next = async () => {
    if (await form.trigger(STEP_FIELDS[step - 1])) setStep(step + 1);
  };

  /** Edit mode: prizes are managed live against the API so inventory stays authoritative. Throws so the modal can show the error. */
  const onAddPrize = async (p: Schemas["AddPrizeBody"]) => {
    if (!campaign) {
      prizesArray.append({ name: p.name, value: p.value ?? "", quantity: String(p.quantity), weight: String(p.weight) });
      return;
    }
    const known = new Map(prizes.filter((r) => r.id && r.weight).map((r) => [r.id!, r.weight]));
    const c = (await addPrize.mutateAsync({ id: campaign.id, ...p })) as WithWeights;
    const added = c.prizes.find((x) => !prizes.some((r) => r.id === x.id));
    if (added) known.set(added.id, String(p.weight));
    prizesArray.replace(toRows(c.prizes, known));
    toast.success("Prize added", p.name);
  };
  const onRemovePrize = async (i: number) => {
    const p = prizes[i];
    if (!p) return;
    if (!campaign || !p.id) { prizesArray.remove(i); return; }
    try { await deletePrize.mutateAsync({ id: campaign.id, prizeId: p.id }); prizesArray.remove(i); toast.success("Prize removed", p.name); } catch (e) { toast.error(e, "Couldn't remove prize"); }
  };

  const save = async (v: z.output<ReturnType<typeof campaignSchema>>, activateNow: boolean) => {
    const { startsAt, endsAt } = campaignWindow(v.start, v.end);
    try {
      let saved: Campaign;
      if (campaign) {
        // Only the dates the admin changed are sent, so an unchanged start keeps its time of day.
        const body: Schemas["UpdateCampaignBody"] = { title: v.title, description: v.description || null, maxAttempts: Number(v.maxAttempts), requireOffersVisit: v.requireOffersVisit };
        if (v.start !== initialStart) body.startsAt = startsAt;
        if (v.end !== initialEnd) body.endsAt = endsAt;
        if (v.loseWeight !== "") body.loseWeight = Number(v.loseWeight);
        saved = await update.mutateAsync({ id: campaign.id, ...body });
        if (activateNow && saved.status !== "ACTIVE") saved = await activate.mutateAsync(saved.id);
      } else {
        saved = await create.mutateAsync({
          title: v.title,
          ...(v.description ? { description: v.description } : {}),
          startsAt, endsAt,
          maxAttempts: Number(v.maxAttempts),
          requireOffersVisit: v.requireOffersVisit,
          loseWeight: Number(v.loseWeight),
          activate: activateNow,
          prizes: v.prizes.map((p) => ({ name: p.name.trim(), ...(p.value.trim() ? { value: p.value.trim() } : {}), quantity: Number(p.quantity), weight: Number(p.weight) })),
        });
      }
      toast.success(activateNow ? "Campaign activated" : editing ? "Campaign saved" : "Draft saved", saved.title);
      router.push(`/scratch-win/${saved.id}`);
    } catch (e) {
      applyApiError(form, e, API_FIELDS);
      // Send the admin to the step holding the first field the server rejected.
      const bad = Object.keys(form.formState.errors).find((k) => k !== "root");
      if (bad) setStep(stepOf(bad));
    }
  };
  const submitWith = (activateNow: boolean) => form.handleSubmit((v) => save(v, activateNow), (errors) => { const bad = Object.keys(errors).find((k) => k !== "root"); if (bad) setStep(stepOf(bad)); });

  return (
    <ScratchShell tab="campaigns" compact={editing}>
      <BackLink href="/scratch-win" label="Scratch & Win" current={editing ? "Edit Campaign" : "Create Campaign"} />
      <Stepper steps={STEPS} current={step} />

      {/* Enter moves to the next step; on the review step it saves (activating only if chosen on step 1). */}
      <form noValidate className="space-y-5" onSubmit={(e) => { e.preventDefault(); if (saving) return; if (step < 4) void next(); else void submitWith(!editing && activateOnSave)(); }}>
        {step === 1 && (
          <div className="max-w-2xl space-y-4 animate-fade-in">
            <Field label="Campaign Title" required error={formState.errors.title?.message} hint={`${title.length}/120 · at least 3 characters`}>
              <Input maxLength={120} placeholder="e.g. Summer Lucky Draw" autoFocus {...maskedRegister(form, "title", maskName)} />
            </Field>
            <Field label="Description" error={formState.errors.description?.message} hint={`${description.length}/2000`}>
              <Textarea rows={3} maxLength={2000} placeholder="Describe the campaign — who can participate, what the prizes are, how it works..." {...register("description")} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Start Date" required error={formState.errors.start?.message}><Input type="date" min={editing ? undefined : todayInput()} {...register("start", { onChange: () => formState.touchedFields.end && void form.trigger("end") })} /></Field>
              <Field label="End Date" required error={formState.errors.end?.message} hint="The campaign runs until the end of this day."><Input type="date" min={start || todayInput()} {...register("end")} /></Field>
            </div>
            {!editing && <div className="grid gap-4 sm:grid-cols-2"><button type="button" onClick={() => setValue("activate", false)} className={cn("h-10 rounded-lg border text-xs font-medium", !activateOnSave ? "border-blue-300 bg-blue-50 text-blue-600" : "border-slate-200 text-slate-600")}>Save as Draft</button><button type="button" onClick={() => setValue("activate", true)} className={cn("h-10 rounded-lg border text-xs font-medium", activateOnSave ? "border-green-300 bg-green-50 text-green-700" : "border-slate-200 text-slate-600")}>Activate on Save</button></div>}
            <Alert tone="blue">Campaign artwork is set through the API (storage key); campaigns without artwork use the default card design.</Alert>
          </div>
        )}

        {step === 2 && (
          <div className="max-w-xl space-y-5 animate-fade-in">
            <Alert tone="blue" icon={<Lock className="h-3.5 w-3.5 shrink-0" />}>Eligibility rules are enforced server-side. The platform validates attempts, prior activity, and identity before a scratch is recorded; duplicate attempts and replays cannot create extra entries.</Alert>
            <Field label="Maximum Attempts Per User" required error={formState.errors.maxAttempts?.message} hint="1–100. The API rejects any attempt beyond this limit.">
              <Input className="w-24" inputMode="numeric" autoFocus {...maskedRegister(form, "maxAttempts", (v) => maskInteger(v, 3))} />
            </Field>
            <Card className="px-4 py-4"><div className="flex items-start justify-between gap-4"><div><div className="text-sm font-semibold text-slate-900">Require Offers Visit Before Scratching</div><p className="mt-1 text-[11px] leading-4 text-slate-400">Users must have viewed a Marketplace offer in the last 30 minutes before they can scratch. Validated on each attempt.</p></div><Toggle checked={requireOffers} onChange={(v) => setValue("requireOffersVisit", v, { shouldDirty: true })} /></div></Card>
            <Field label="Lose weight" error={formState.errors.loseWeight?.message} hint={editing ? "Leave blank to keep the current value (the server doesn't reveal it). 0–1,000,000; 0 means every attempt wins while stock lasts." : "0–1,000,000. Relative weight of a losing draw against the prize weights; 0 means every attempt wins while stock lasts."}>
              <Input className="w-32" inputMode="numeric" placeholder={editing ? "Unchanged" : undefined} {...maskedRegister(form, "loseWeight", (v) => maskInteger(v, 7))} />
            </Field>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5 animate-fade-in">
            <Alert tone="blue" icon={<Lock className="h-3.5 w-3.5 shrink-0" />}>Prize allocation is handled exclusively server-side. Remaining quantity is updated atomically; inventory never falls below zero.</Alert>
            <div className="flex items-center justify-between"><div><div className="text-sm font-semibold text-slate-900">Prize Inventory</div><div className="text-[11px] text-slate-400">{prizes.length} prize{prizes.length !== 1 ? "s" : ""} configured · at most {MAX_PRIZES}</div></div><Button type="button" size="sm" onClick={() => setAddOpen(true)} disabled={prizes.length >= MAX_PRIZES}><Plus className="h-3.5 w-3.5" /> Add Prize</Button></div>
            {prizes.length === 0 ? (
              <Card className="flex flex-col items-center px-6 py-12 text-center"><span className="flex h-11 w-11 items-center justify-center rounded-lg bg-slate-100 text-slate-400"><Gift className="h-5 w-5" /></span><div className="mt-3 text-sm font-semibold text-slate-900">No prizes configured</div><div className={cn("mt-0.5 text-[11px]", prizesError ? "font-medium text-red-600" : "text-slate-400")} role={prizesError ? "alert" : undefined}>Add at least one prize to continue.</div><Button type="button" className="mt-4" onClick={() => setAddOpen(true)}><Plus className="h-3.5 w-3.5" /> Add First Prize</Button></Card>
            ) : (
              <>
                <Card><Table><THead><tr><TH>Prize Name</TH><TH>Value</TH><TH className="text-right">Quantity</TH><TH className="text-right">Weight</TH><TH className="text-right" title="Chance of winning this prize on one attempt">Win chance</TH><TH className="text-right">Awarded</TH><TH> </TH></tr></THead><tbody>{prizesArray.fields.map((f, i) => { const p = prizes[i] ?? f; return <TR key={f.id}><TD><span className="flex items-center gap-2 text-xs font-semibold text-slate-900"><span className="h-1.5 w-1.5 rounded-full bg-blue-600" />{p.name}</span>{fieldError(form, `prizes.${i}.name`) && <span className="text-[10px] text-red-600">{fieldError(form, `prizes.${i}.name`)}</span>}</TD><TD className="text-xs">{p.value || "—"}</TD><TD className="text-right text-xs">{p.quantity}</TD><TD className="text-right text-xs">{p.weight || "—"}</TD><TD className="text-right text-xs font-semibold text-slate-800">{formatOdds(odds[i] ?? null)}</TD><TD className="text-right text-[11px] text-slate-400">{p.awarded ?? 0}</TD><TD className="text-right"><button type="button" onClick={() => onRemovePrize(i)} disabled={deletePrize.isPending || (p.awarded ?? 0) > 0} title={(p.awarded ?? 0) > 0 ? "Prizes already awarded cannot be removed" : "Remove"} className="flex h-6 w-6 items-center justify-center rounded border border-red-200 text-red-500 hover:bg-red-50 disabled:opacity-30" aria-label="Remove prize">{deletePrize.isPending && deletePrize.variables?.prizeId === p.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <X className="h-3 w-3" />}</button></TD></TR>; })}</tbody></Table></Card>
                <p className="text-[11px] text-slate-400">
                  {loseOdds !== null ? <>Chance of no prize on an attempt: <span className="font-semibold text-slate-700">{formatOdds(Math.max(0, loseOdds))}</span>. Chances are weight ÷ (all in-stock prize weights + lose weight).</> : "Win chances need every weight and the lose weight; the server doesn't reveal stored weights, so they show once you enter a lose weight and every prize has a known weight."}
                </p>
              </>
            )}
          </div>
        )}

        {step === 4 && saving && (
          <div className="flex flex-col items-center py-20 text-center animate-fade-in">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600"><Loader2 className="h-5 w-5 animate-spin" /></span>
            <div className="mt-4 text-sm font-semibold text-slate-900">Saving Campaign…</div>
            <div className="mt-1 text-xs text-slate-400">Setting up prize inventory and eligibility rules.</div>
          </div>
        )}

        {step === 4 && !saving && (
          <div className="max-w-2xl space-y-6 animate-fade-in">
            <div>
              <SectionLabel>Campaign Information</SectionLabel>
              <dl className="mt-2 space-y-2 text-xs">{[["Title", title], ["Description", description || "—"], ["Start Date", start || "—"], ["End Date", end || "—"], ...(!editing ? [["On save", activateOnSave ? "Activate" : "Save as draft"]] : [])].map(([k, v]) => <div key={k} className="flex justify-between gap-8"><dt className="shrink-0 text-slate-400">{k}</dt><dd className="truncate text-right font-semibold text-slate-800">{v}</dd></div>)}</dl>
            </div>
            <div>
              <SectionLabel>Eligibility &amp; Prerequisites</SectionLabel>
              <dl className="mt-2 space-y-2 text-xs"><div className="flex justify-between"><dt className="text-slate-400">Max Attempts / User</dt><dd className="font-semibold text-slate-800">{maxAttempts}</dd></div><div className="flex justify-between"><dt className="text-slate-400">Requires Offers Visit</dt><dd className={cn("font-semibold", requireOffers ? "text-green-600" : "text-slate-800")}>{requireOffers ? "Yes" : "No"}</dd></div><div className="flex justify-between"><dt className="text-slate-400">Lose weight</dt><dd className="font-semibold text-slate-800">{loseWeight || "Unchanged"}</dd></div></dl>
            </div>
            <div>
              <SectionLabel>Prize Inventory</SectionLabel>
              <ul className="mt-2 space-y-2 text-xs">{prizes.map((p, i) => <li key={p.id ?? p.name + i} className="flex justify-between"><span className="flex items-center gap-2 text-slate-700"><span className="h-1.5 w-1.5 rounded-full bg-blue-600" />{p.name}{p.value ? ` · ${p.value}` : ""}</span><span className="font-semibold text-slate-800">{p.quantity} available{odds[i] !== null ? ` · ${formatOdds(odds[i] ?? null)} chance` : ""}</span></li>)}</ul>
            </div>
            <FormError form={form} />
          </div>
        )}

        {!(step === 4 && saving) && (
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Button type="button" variant="secondary" onClick={() => (step === 1 ? router.push(back) : setStep(step - 1))}>{step === 1 ? "Cancel" : <><ArrowLeft className="h-3.5 w-3.5" /> {step === 4 ? "Back to Edit" : "Back"}</>}</Button>
            {step < 4 ? <Button type="submit">Next: {STEPS[step]} <ArrowRight className="h-3.5 w-3.5" /></Button> : (
              <div className="flex gap-2">
                <Button type="button" variant="secondary" disabled={saving} onClick={() => void submitWith(false)()}><Save className="h-3.5 w-3.5" /> {editing ? "Save Changes" : "Save Draft"}</Button>
                {(!editing || campaign?.status !== "ACTIVE") && <Button type="button" variant="success" disabled={saving} onClick={() => void submitWith(true)()}><Send className="h-3.5 w-3.5" /> {editing ? "Save & Activate" : "Create & Activate"}</Button>}
              </div>
            )}
          </div>
        )}
      </form>

      {/* Outside the wizard's <form>: forms can't nest. */}
      <AddPrizeModal open={addOpen} onClose={() => setAddOpen(false)} onAdd={onAddPrize} />
    </ScratchShell>
  );
}

function AddPrizeModal({ open, onClose, onAdd }: { open: boolean; onClose: () => void; onAdd: (p: Schemas["AddPrizeBody"]) => Promise<void> }) {
  const form = useZodForm(prizeSchema, { defaultValues: { name: "", value: "", quantity: "10", weight: "1" } });
  const { register, formState } = form;
  const busy = formState.isSubmitting;
  const close = () => { if (busy) return; onClose(); form.reset(); };
  const submit = form.handleSubmit(async (p) => {
    try {
      await onAdd({ name: p.name, ...(p.value ? { value: p.value } : {}), quantity: Number(p.quantity), weight: Number(p.weight) });
      onClose();
      form.reset();
    } catch (e) {
      // Keep the modal open with the admin's input so they can fix it or retry.
      applyApiError(form, e);
    }
  });
  return (
    <Modal open={open} onClose={close} width="max-w-[420px]">
      <ModalHeader title="Add Prize" onClose={close} />
      <form onSubmit={submit} noValidate className="space-y-4 px-6 py-5">
        <FormError form={form} />
        <Field label="Prize Name" required error={formState.errors.name?.message}><Input placeholder="e.g. Gift Card $50, Luxury Watch..." maxLength={80} autoFocus {...maskedRegister(form, "name", maskName)} /></Field>
        <Field label="Value" error={formState.errors.value?.message} hint="Shown to players, e.g. $50 or “Free month”."><Input placeholder="e.g. $50" maxLength={40} {...register("value")} /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Quantity" required error={formState.errors.quantity?.message}><Input inputMode="numeric" {...maskedRegister(form, "quantity", (v) => maskInteger(v, 7))} /></Field>
          <Field label="Draw weight" required error={formState.errors.weight?.message} hint="Higher = more likely"><Input inputMode="numeric" {...maskedRegister(form, "weight", (v) => maskInteger(v, 7))} /></Field>
        </div>
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-[11px] leading-4 text-slate-500"><span className="font-semibold text-slate-700">Remaining quantity</span> is system-controlled: it starts at the quantity and is decremented atomically on each win.</div>
        <div className="flex justify-end gap-2 pt-1"><Button type="button" variant="secondary" onClick={close} disabled={busy}>Cancel</Button><SubmitButton form={form} pendingText="Adding…"><Plus className="h-3.5 w-3.5" /> Add Prize</SubmitButton></div>
      </form>
    </Modal>
  );
}

export function CampaignForm({ id }: { id?: string } = {}) {
  const campaign = useCampaign(id ?? "");
  if (!id) return <Form />;
  return <QueryState query={campaign} skeleton={<Skeleton className="h-96" />}>{(c) => <Form key={c.id} campaign={c} />}</QueryState>;
}
