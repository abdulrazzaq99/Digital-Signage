"use client";
import { Button } from "@/components/ui/button";
import { Card, SectionLabel } from "@/components/ui/card";
import { Input, Label, Textarea, Toggle } from "@/components/ui/input";
import { Modal, ModalHeader } from "@/components/ui/modal";
import { Alert, BackLink, Stepper } from "@/components/ui/misc";
import { QueryState, Skeleton } from "@/components/ui/query-state";
import { TD, TH, THead, TR, Table } from "@/components/ui/table";
import { useToast } from "@/components/ui/toast";
import { useActivateCampaign, useAddPrize, useCampaign, useCreateCampaign, useDeletePrize, useUpdateCampaign } from "@/lib/api/hooks/campaigns";
import type { Campaign, Schemas } from "@/lib/api/types";
import { errorMessage, fromDateInput, toDateInput } from "@/lib/format";
import { cn } from "@/lib/utils";
import { ArrowLeft, ArrowRight, Gift, Loader2, Lock, Plus, Save, Send, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ScratchShell } from "./scratch-shell";

const STEPS = ["Basic Info", "Eligibility", "Prize Setup", "Review"];
type PrizeInput = Schemas["AddPrizeBody"];
/** Existing prizes keep their id; new ones are sent with the campaign (create) or added one by one (edit). */
type PrizeRow = PrizeInput & { id?: string; awarded?: number };

function Form({ campaign }: { campaign?: Campaign }) {
  const router = useRouter();
  const toast = useToast();
  const editing = !!campaign;
  const create = useCreateCampaign();
  const update = useUpdateCampaign();
  const activate = useActivateCampaign();
  const addPrize = useAddPrize();
  const deletePrize = useDeletePrize();
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState(campaign?.title ?? "");
  const [desc, setDesc] = useState(campaign?.description ?? "");
  const [start, setStart] = useState(toDateInput(campaign?.startsAt));
  const [end, setEnd] = useState(toDateInput(campaign?.endsAt));
  const [activateOnSave, setActivateOnSave] = useState(false);
  const [maxAttempts, setMaxAttempts] = useState(campaign?.maxAttempts ?? 1);
  const [requireOffers, setRequireOffers] = useState(campaign?.requireOffersVisit ?? false);
  const [loseWeight, setLoseWeight] = useState(50);
  const [prizes, setPrizes] = useState<PrizeRow[]>((campaign?.prizes ?? []).map((p) => ({ id: p.id, name: p.name, value: p.value ?? undefined, quantity: p.quantity, weight: 1, awarded: p.awarded })));
  const [addOpen, setAddOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const back = editing ? `/scratch-win/${campaign.id}` : "/scratch-win";
  const startsAt = fromDateInput(start) ?? "";
  const endsAt = end ? new Date(`${end}T23:59:59`).toISOString() : "";
  const datesValid = !!startsAt && !!endsAt && new Date(endsAt) > new Date(startsAt);

  /** Edit mode: prizes are managed live against the API so inventory stays authoritative. */
  const onAddPrize = async (p: PrizeInput) => {
    if (!campaign) { setPrizes((ps) => [...ps, p]); return; }
    try { const c = await addPrize.mutateAsync({ id: campaign.id, ...p }); setPrizes(c.prizes.map((x) => ({ id: x.id, name: x.name, value: x.value ?? undefined, quantity: x.quantity, weight: 1, awarded: x.awarded }))); toast.success("Prize added", p.name); } catch (e) { toast.error(e, "Couldn't add prize"); }
  };
  const onRemovePrize = async (i: number) => {
    const p = prizes[i];
    if (!campaign || !p.id) { setPrizes((ps) => ps.filter((_, idx) => idx !== i)); return; }
    try { await deletePrize.mutateAsync({ id: campaign.id, prizeId: p.id }); setPrizes((ps) => ps.filter((_, idx) => idx !== i)); toast.success("Prize removed", p.name); } catch (e) { toast.error(e, "Couldn't remove prize"); }
  };

  const save = async (activateNow: boolean) => {
    setSaving(true);
    setError("");
    try {
      let saved: Campaign;
      if (campaign) {
        saved = await update.mutateAsync({ id: campaign.id, title: title.trim(), description: desc.trim() || null, startsAt, endsAt, maxAttempts, requireOffersVisit: requireOffers, loseWeight });
        if (activateNow && saved.status !== "ACTIVE") saved = await activate.mutateAsync(saved.id);
      } else {
        saved = await create.mutateAsync({ title: title.trim(), description: desc.trim() || undefined, startsAt, endsAt, maxAttempts, requireOffersVisit: requireOffers, loseWeight, activate: activateNow, prizes: prizes.map(({ name, value, quantity, weight }) => ({ name, value, quantity, weight })) });
      }
      toast.success(activateNow ? "Campaign activated" : editing ? "Campaign saved" : "Draft saved", saved.title);
      router.push(`/scratch-win/${saved.id}`);
    } catch (e) { setError(errorMessage(e)); setSaving(false); }
  };

  return (
    <ScratchShell tab="campaigns" compact={editing}>
      <BackLink href="/scratch-win" label="Scratch & Win" current={editing ? "Edit Campaign" : "Create Campaign"} />
      <Stepper steps={STEPS} current={step} />

      {step === 1 && (
        <div className="max-w-2xl space-y-4 animate-fade-in">
          <div><Label required>Campaign Title</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} placeholder="e.g. Summer Lucky Draw" /><div className="mt-1 text-[10px] text-slate-400">{title.length}/120 · at least 3 characters</div></div>
          <div><Label>Description</Label><Textarea rows={3} placeholder="Describe the campaign — who can participate, what the prizes are, how it works..." value={desc} onChange={(e) => setDesc(e.target.value)} /></div>
          <div className="grid gap-4 sm:grid-cols-2"><div><Label required>Start Date</Label><Input type="date" value={start} onChange={(e) => setStart(e.target.value)} /></div><div><Label required>End Date</Label><Input type="date" value={end} onChange={(e) => setEnd(e.target.value)} /></div></div>
          {start && end && !datesValid && <p className="text-[11px] text-red-600">End date must be after the start date.</p>}
          {!editing && <div className="grid gap-4 sm:grid-cols-2"><button type="button" onClick={() => setActivateOnSave(false)} className={cn("h-10 rounded-lg border text-xs font-medium", !activateOnSave ? "border-blue-300 bg-blue-50 text-blue-600" : "border-slate-200 text-slate-600")}>Save as Draft</button><button type="button" onClick={() => setActivateOnSave(true)} className={cn("h-10 rounded-lg border text-xs font-medium", activateOnSave ? "border-green-300 bg-green-50 text-green-700" : "border-slate-200 text-slate-600")}>Activate on Save</button></div>}
          <Alert tone="blue">Campaign artwork is set through the API (storage key); campaigns without artwork use the default card design.</Alert>
        </div>
      )}

      {step === 2 && (
        <div className="max-w-xl space-y-5 animate-fade-in">
          <Alert tone="blue" icon={<Lock className="h-3.5 w-3.5 shrink-0" />}>Eligibility rules are enforced server-side. The platform validates attempts, prior activity, and identity before a scratch is recorded; duplicate attempts and replays cannot create extra entries.</Alert>
          <div><Label required>Maximum Attempts Per User</Label><p className="mb-2 text-[11px] text-slate-400">The API rejects any attempt beyond this limit.</p><div className="flex items-center gap-2"><Input type="number" className="w-24" value={maxAttempts} onChange={(e) => setMaxAttempts(Math.max(1, Number(e.target.value)))} min={1} max={100} /><span className="text-xs text-slate-400">attempts per user</span></div></div>
          <Card className="px-4 py-4"><div className="flex items-start justify-between gap-4"><div><div className="text-sm font-semibold text-slate-900">Require Offers Visit Before Scratching</div><p className="mt-1 text-[11px] leading-4 text-slate-400">Users must have viewed a Marketplace offer in the last 30 minutes before they can scratch. Validated on each attempt.</p></div><Toggle checked={requireOffers} onChange={setRequireOffers} /></div></Card>
          <div><Label>Lose weight</Label><p className="mb-2 text-[11px] text-slate-400">Relative weight of a losing draw against the prize weights (each prize defaults to 1). 0 means every attempt wins while stock lasts.</p><Input type="number" className="w-24" min={0} max={10000} value={loseWeight} onChange={(e) => setLoseWeight(Math.max(0, Number(e.target.value)))} /></div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-5 animate-fade-in">
          <Alert tone="blue" icon={<Lock className="h-3.5 w-3.5 shrink-0" />}>Prize allocation is handled exclusively server-side. Remaining quantity is updated atomically; inventory never falls below zero.</Alert>
          <div className="flex items-center justify-between"><div><div className="text-sm font-semibold text-slate-900">Prize Inventory</div><div className="text-[11px] text-slate-400">{prizes.length} prize{prizes.length !== 1 ? "s" : ""} configured</div></div><Button size="sm" onClick={() => setAddOpen(true)}><Plus className="h-3.5 w-3.5" /> Add Prize</Button></div>
          {prizes.length === 0 ? (
            <Card className="flex flex-col items-center px-6 py-12 text-center"><span className="flex h-11 w-11 items-center justify-center rounded-lg bg-slate-100 text-slate-400"><Gift className="h-5 w-5" /></span><div className="mt-3 text-sm font-semibold text-slate-900">No prizes configured</div><div className="mt-0.5 text-[11px] text-slate-400">Add at least one prize to continue.</div><Button className="mt-4" onClick={() => setAddOpen(true)}><Plus className="h-3.5 w-3.5" /> Add First Prize</Button></Card>
          ) : (
            <Card><Table><THead><tr><TH>Prize Name</TH><TH>Value</TH><TH className="text-right">Quantity</TH><TH className="text-right">Weight</TH><TH className="text-right">Awarded</TH><TH> </TH></tr></THead><tbody>{prizes.map((p, i) => <TR key={p.id ?? p.name + i}><TD><span className="flex items-center gap-2 text-xs font-semibold text-slate-900"><span className="h-1.5 w-1.5 rounded-full bg-blue-600" />{p.name}</span></TD><TD className="text-xs">{p.value ?? "—"}</TD><TD className="text-right text-xs">{p.quantity}</TD><TD className="text-right text-xs">{p.weight ?? 1}</TD><TD className="text-right text-[11px] text-slate-400">{p.awarded ?? 0}</TD><TD className="text-right"><button onClick={() => onRemovePrize(i)} disabled={deletePrize.isPending || (p.awarded ?? 0) > 0} title={(p.awarded ?? 0) > 0 ? "Prizes already awarded cannot be removed" : "Remove"} className="flex h-6 w-6 items-center justify-center rounded border border-red-200 text-red-500 hover:bg-red-50 disabled:opacity-30" aria-label="Remove prize"><X className="h-3 w-3" /></button></TD></TR>)}</tbody></Table></Card>
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
            <dl className="mt-2 space-y-2 text-xs">{[["Title", title], ["Description", desc || "—"], ["Start Date", start || "—"], ["End Date", end || "—"]].map(([k, v]) => <div key={k} className="flex justify-between gap-8"><dt className="shrink-0 text-slate-400">{k}</dt><dd className="truncate text-right font-semibold text-slate-800">{v}</dd></div>)}</dl>
          </div>
          <div>
            <SectionLabel>Eligibility &amp; Prerequisites</SectionLabel>
            <dl className="mt-2 space-y-2 text-xs"><div className="flex justify-between"><dt className="text-slate-400">Max Attempts / User</dt><dd className="font-semibold text-slate-800">{maxAttempts}</dd></div><div className="flex justify-between"><dt className="text-slate-400">Requires Offers Visit</dt><dd className={cn("font-semibold", requireOffers ? "text-green-600" : "text-slate-800")}>{requireOffers ? "Yes" : "No"}</dd></div><div className="flex justify-between"><dt className="text-slate-400">Lose weight</dt><dd className="font-semibold text-slate-800">{loseWeight}</dd></div></dl>
          </div>
          <div>
            <SectionLabel>Prize Inventory</SectionLabel>
            <ul className="mt-2 space-y-2 text-xs">{prizes.map((p, i) => <li key={p.id ?? p.name + i} className="flex justify-between"><span className="flex items-center gap-2 text-slate-700"><span className="h-1.5 w-1.5 rounded-full bg-blue-600" />{p.name}{p.value ? ` · ${p.value}` : ""}</span><span className="font-semibold text-slate-800">{p.quantity} available</span></li>)}</ul>
          </div>
          {error && <Alert tone="red">{error}</Alert>}
        </div>
      )}

      {!(step === 4 && saving) && (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Button variant="secondary" onClick={() => (step === 1 ? router.push(back) : setStep(step - 1))}>{step === 1 ? "Cancel" : <><ArrowLeft className="h-3.5 w-3.5" /> {step === 4 ? "Back to Edit" : "Back"}</>}</Button>
          {step < 4 ? <Button disabled={(step === 1 && (title.trim().length < 3 || !datesValid)) || (step === 3 && !prizes.length)} onClick={() => setStep(step + 1)}>Next: {STEPS[step]} <ArrowRight className="h-3.5 w-3.5" /></Button> : (
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => save(false)}><Save className="h-3.5 w-3.5" /> {editing ? "Save Changes" : "Save Draft"}</Button>
              {(!editing || campaign?.status !== "ACTIVE") && <Button variant="success" onClick={() => save(true)}><Send className="h-3.5 w-3.5" /> {editing ? "Save & Activate" : "Create & Activate"}</Button>}
            </div>
          )}
        </div>
      )}

      <AddPrizeModal open={addOpen} onClose={() => setAddOpen(false)} onAdd={onAddPrize} />
    </ScratchShell>
  );
}

function AddPrizeModal({ open, onClose, onAdd }: { open: boolean; onClose: () => void; onAdd: (p: PrizeInput) => Promise<void> | void }) {
  const [name, setName] = useState("");
  const [value, setValue] = useState("");
  const [quantity, setQuantity] = useState(10);
  const [weight, setWeight] = useState(1);
  const close = () => { onClose(); setName(""); setValue(""); setQuantity(10); setWeight(1); };
  return (
    <Modal open={open} onClose={close} width="max-w-[420px]">
      <ModalHeader title="Add Prize" onClose={close} />
      <form onSubmit={async (e) => { e.preventDefault(); await onAdd({ name: name.trim(), value: value.trim() || undefined, quantity, weight }); close(); }} className="space-y-4 px-6 py-5">
        <div><Label required>Prize Name</Label><Input placeholder="e.g. Gift Card $50, Luxury Watch..." value={name} onChange={(e) => setName(e.target.value)} autoFocus /></div>
        <div><Label>Value</Label><Input placeholder="e.g. $50" value={value} onChange={(e) => setValue(e.target.value)} maxLength={40} /></div>
        <div className="grid grid-cols-2 gap-3"><div><Label required>Quantity</Label><Input type="number" min={1} value={quantity} onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))} /></div><div><Label>Draw weight</Label><Input type="number" min={1} value={weight} onChange={(e) => setWeight(Math.max(1, Number(e.target.value)))} /></div></div>
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-[11px] leading-4 text-slate-500"><span className="font-semibold text-slate-700">Remaining quantity</span> is system-controlled: it starts at the quantity and is decremented atomically on each win.</div>
        <div className="flex justify-end gap-2 pt-1"><Button type="button" variant="secondary" onClick={close}>Cancel</Button><Button type="submit" disabled={!name.trim() || quantity < 1}><Plus className="h-3.5 w-3.5" /> Add Prize</Button></div>
      </form>
    </Modal>
  );
}

export function CampaignForm({ id }: { id?: string } = {}) {
  const campaign = useCampaign(id ?? "");
  if (!id) return <Form />;
  return <QueryState query={campaign} skeleton={<Skeleton className="h-96" />}>{(c) => <Form key={c.id} campaign={c} />}</QueryState>;
}
