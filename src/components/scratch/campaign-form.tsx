"use client";
import { Button } from "@/components/ui/button";
import { Card, SectionLabel } from "@/components/ui/card";
import { Input, Label, Textarea, Toggle } from "@/components/ui/input";
import { Modal, ModalHeader } from "@/components/ui/modal";
import { Alert, BackLink, Stepper } from "@/components/ui/misc";
import { TD, TH, THead, TR, Table } from "@/components/ui/table";
import { artworks, type Campaign, type Prize } from "@/lib/data";
import { cn, img } from "@/lib/utils";
import { ArrowLeft, ArrowRight, Gift, Loader2, Lock, Plus, Save, Send, X } from "lucide-react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ScratchShell } from "./scratch-shell";

const STEPS = ["Basic Info", "Eligibility", "Prize Setup", "Review"];

export function CampaignForm({ campaign }: { campaign?: Campaign }) {
  const router = useRouter();
  const editing = !!campaign;
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState(campaign?.title ?? "Summer Lucky Draw");
  const [desc, setDesc] = useState(campaign?.description ?? "");
  const [start, setStart] = useState(campaign?.start ?? "");
  const [end, setEnd] = useState(campaign?.end ?? "");
  const [activate, setActivate] = useState(campaign?.status === "Active");
  const [art, setArt] = useState(0);
  const [maxAttempts, setMaxAttempts] = useState(campaign?.maxAttempts ?? 3);
  const [requireOffers, setRequireOffers] = useState(campaign?.requireOffers ?? false);
  const [prizes, setPrizes] = useState<Prize[]>(campaign?.prizes ?? []);
  const [addPrize, setAddPrize] = useState(false);
  const [activating, setActivating] = useState(false);
  const back = editing ? `/scratch-win/${campaign.id}` : "/scratch-win";
  useEffect(() => {
    if (!activating) return;
    const t = setTimeout(() => router.push(editing ? back : "/scratch-win"), 1800);
    return () => clearTimeout(t);
  }, [activating]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <ScratchShell tab="campaigns" compact={editing}>
      <BackLink href="/scratch-win" label="Scratch & Win" current={editing ? "Edit Campaign" : "Create Campaign"} />
      <Stepper steps={STEPS} current={step} />

      {step === 1 && (
        <div className="grid gap-6 xl:grid-cols-[1fr_300px] animate-fade-in">
          <div className="space-y-4">
            <div><Label required>Campaign Title</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={100} /><div className="mt-1 text-[10px] text-slate-400">{title.length}/100</div></div>
            <div><Label>Description</Label><Textarea rows={3} placeholder="Describe the campaign — who can participate, what the prizes are, how it works..." value={desc} onChange={(e) => setDesc(e.target.value)} /></div>
            <div className="grid gap-4 sm:grid-cols-2"><div><Label required>Start Date</Label><Input type="date" value={start} onChange={(e) => setStart(e.target.value)} /></div><div><Label required>End Date</Label><Input type="date" value={end} onChange={(e) => setEnd(e.target.value)} /></div></div>
            <div className="grid gap-4 sm:grid-cols-2"><button type="button" onClick={() => setActivate(false)} className={cn("h-10 rounded-lg border text-xs font-medium", !activate ? "border-blue-300 bg-blue-50 text-blue-600" : "border-slate-200 text-slate-600")}>Save as Draft</button><button type="button" onClick={() => setActivate(true)} className={cn("h-10 rounded-lg border text-xs font-medium", activate ? "border-green-300 bg-green-50 text-green-700" : "border-slate-200 text-slate-600")}>Activate on Save</button></div>
          </div>
          <div className="max-w-md xl:max-w-none">
            <Label>Campaign Artwork</Label>
            <img src={img(`art-${art}`, 600, 400)} alt="" className="aspect-[3/2] w-full rounded-xl object-cover" />
            <Label className="mt-4">Choose Artwork</Label>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">{artworks.map((a, i) => <button key={a} onClick={() => setArt(i)} className={cn("overflow-hidden rounded-lg border-2 text-left", art === i ? "border-blue-600" : "border-transparent")}><img src={img(`art-${i}`, 120, 80)} alt="" className="aspect-[3/2] w-full object-cover" /><span className="block truncate px-1 py-0.5 text-[9px] text-slate-500">{a}</span></button>)}</div>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="max-w-xl space-y-5 animate-fade-in">
          <Alert tone="blue" icon={<Lock className="h-3.5 w-3.5 shrink-0" />}>Eligibility rules are enforced server-side. The platform validates all conditions — maximum attempts, prior activity, and user identity — before a scratch event is recorded. Duplicate attempts and replay attacks cannot create additional entries.</Alert>
          <div><Label required>Maximum Attempts Per User</Label><p className="mb-2 text-[11px] text-slate-400">The maximum number of times a single user can attempt a scratch card in this campaign. The backend rejects any attempt beyond this limit.</p><div className="flex items-center gap-2"><Input type="number" className="w-24" value={maxAttempts} onChange={(e) => setMaxAttempts(Number(e.target.value))} min={1} /><span className="text-xs text-slate-400">attempts per user</span></div></div>
          <Card className="px-4 py-4"><div className="flex items-start justify-between gap-4"><div><div className="text-sm font-semibold text-slate-900">Require Offers Visit Before Scratching</div><p className="mt-1 text-[11px] leading-4 text-slate-400">When enabled, users must have viewed at least one active Marketplace offer before they can use a scratch card. The backend validates this condition on each scratch request.</p></div><Toggle checked={requireOffers} onChange={setRequireOffers} /></div>{requireOffers && <div className="mt-3 rounded-lg bg-blue-50 px-3 py-2 text-[11px] font-medium text-blue-700 animate-fade-in">Users will need to view at least one offer in the Marketplace before their scratch card is unlocked.</div>}</Card>
          <div><Label>Additional Eligibility Notes <span className="font-normal text-slate-400">(optional)</span></Label><Textarea rows={3} placeholder="Any additional conditions — e.g. purchase threshold, loyalty tier, registration date..." /><p className="mt-1 text-[10px] text-slate-400">These notes are for internal reference only. Custom eligibility rules beyond the fields above must be configured in the backend.</p></div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-5 animate-fade-in">
          <Alert tone="blue" icon={<Lock className="h-3.5 w-3.5 shrink-0" />}>Prize allocation is handled exclusively server-side. Remaining quantity is updated atomically — network retries, replays, or double-taps cannot create duplicate awards. Inventory never falls below zero.</Alert>
          <div className="flex items-center justify-between"><div><div className="text-sm font-semibold text-slate-900">Prize Inventory</div><div className="text-[11px] text-slate-400">{prizes.length} prize{prizes.length !== 1 ? "s" : ""} configured</div></div><Button size="sm" onClick={() => setAddPrize(true)}><Plus className="h-3.5 w-3.5" /> Add Prize</Button></div>
          {prizes.length === 0 ? (
            <Card className="flex flex-col items-center px-6 py-12 text-center"><span className="flex h-11 w-11 items-center justify-center rounded-lg bg-slate-100 text-slate-400"><Gift className="h-5 w-5" /></span><div className="mt-3 text-sm font-semibold text-slate-900">No prizes configured</div><div className="mt-0.5 text-[11px] text-slate-400">Add at least one prize to continue.</div><Button className="mt-4" onClick={() => setAddPrize(true)}><Plus className="h-3.5 w-3.5" /> Add First Prize</Button></Card>
          ) : (
            <Card><Table><THead><tr><TH>Prize Name</TH><TH className="text-right">Available Qty</TH><TH className="text-right">Remaining (System)</TH><TH> </TH></tr></THead><tbody>{prizes.map((p, i) => <TR key={p.name + i}><TD><span className="flex items-center gap-2 text-xs font-semibold text-slate-900"><span className="h-1.5 w-1.5 rounded-full bg-blue-600" />{p.name}</span></TD><TD className="text-right text-xs">{p.qty}</TD><TD className="text-right text-[11px] italic text-slate-400">Set by system</TD><TD className="text-right"><button onClick={() => setPrizes((ps) => ps.filter((_, idx) => idx !== i))} className="flex h-6 w-6 items-center justify-center rounded border border-red-200 text-red-500 hover:bg-red-50"><X className="h-3 w-3" /></button></TD></TR>)}</tbody></Table></Card>
          )}
        </div>
      )}

      {step === 4 && activating && (
        <div className="flex flex-col items-center py-20 text-center animate-fade-in">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600"><Loader2 className="h-5 w-5 animate-spin" /></span>
          <div className="mt-4 text-sm font-semibold text-slate-900">{activate ? "Activating Campaign..." : "Saving Campaign..."}</div>
          <div className="mt-1 text-xs text-slate-400">Setting up prize inventory and eligibility rules.</div>
        </div>
      )}

      {step === 4 && !activating && (
        <div className="grid gap-6 xl:grid-cols-[1fr_300px] animate-fade-in">
          <div className="space-y-6">
            <div>
              <SectionLabel>Campaign Information</SectionLabel>
              <dl className="mt-2 space-y-2 text-xs">{[["Title", title], ["Description", desc || "—"], ["Start Date", start || "—"], ["End Date", end || "—"], ["Save Mode", <span key="m" className={activate ? "text-green-600" : "text-slate-800"}>{activate ? "Activate Immediately" : "Save as Draft"}</span>]].map(([k, v]) => <div key={String(k)} className="flex justify-between gap-8"><dt className="shrink-0 text-slate-400">{k}</dt><dd className="truncate text-right font-semibold text-slate-800">{v}</dd></div>)}</dl>
            </div>
            <div>
              <SectionLabel>Eligibility &amp; Prerequisites</SectionLabel>
              <dl className="mt-2 space-y-2 text-xs"><div className="flex justify-between"><dt className="text-slate-400">Max Attempts / User</dt><dd className="font-semibold text-slate-800">{maxAttempts} attempts</dd></div><div className="flex justify-between"><dt className="text-slate-400">Requires Offers Visit</dt><dd className={cn("font-semibold", requireOffers ? "text-green-600" : "text-slate-800")}>{requireOffers ? "Yes" : "No"}</dd></div></dl>
            </div>
            <div>
              <SectionLabel>Prize Inventory</SectionLabel>
              <ul className="mt-2 space-y-2 text-xs">{prizes.map((p, i) => <li key={p.name + i} className="flex justify-between"><span className="flex items-center gap-2 text-slate-700"><span className="h-1.5 w-1.5 rounded-full bg-blue-600" />{p.name}</span><span className="font-semibold text-slate-800">{p.qty} available</span></li>)}</ul>
            </div>
          </div>
          <div><SectionLabel>Campaign Artwork</SectionLabel><img src={img(`art-${art}`, 600, 400)} alt="" className="mt-2 aspect-[3/2] w-full rounded-xl object-cover" /></div>
        </div>
      )}

      {!(step === 4 && activating) && (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Button variant="secondary" onClick={() => (step === 1 ? router.push(back) : setStep(step - 1))}>{step === 1 ? "Cancel" : <><ArrowLeft className="h-3.5 w-3.5" /> {step === 4 ? "Back to Edit" : "Back"}</>}</Button>
          {step < 4 ? <Button disabled={(step === 1 && (!title || !start || !end)) || (step === 3 && !prizes.length)} onClick={() => setStep(step + 1)}>Next: {STEPS[step]} <ArrowRight className="h-3.5 w-3.5" /></Button> : (
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => { setActivate(false); setActivating(true); }}><Save className="h-3.5 w-3.5" /> Save Draft</Button>
              <Button variant="success" onClick={() => { setActivate(true); setActivating(true); }}><Send className="h-3.5 w-3.5" /> {editing ? "Activate Campaign" : "Activate Campaign"}</Button>
            </div>
          )}
        </div>
      )}

      <AddPrizeModal open={addPrize} onClose={() => setAddPrize(false)} onAdd={(p) => setPrizes((ps) => [...ps, p])} />
    </ScratchShell>
  );
}

function AddPrizeModal({ open, onClose, onAdd }: { open: boolean; onClose: () => void; onAdd: (p: Prize) => void }) {
  const [name, setName] = useState("");
  const [qty, setQty] = useState(10);
  const close = () => { onClose(); setName(""); setQty(10); };
  return (
    <Modal open={open} onClose={close} width="max-w-[420px]">
      <ModalHeader title="Add Prize" onClose={close} />
      <form onSubmit={(e) => { e.preventDefault(); onAdd({ name, qty, awarded: 0 }); close(); }} className="space-y-4 px-6 py-5">
        <div><Label required>Prize Name</Label><Input placeholder="e.g. Gift Card $50, Luxury Watch..." value={name} onChange={(e) => setName(e.target.value)} autoFocus /></div>
        <div><Label required>Available Quantity</Label><Input type="number" min={1} value={qty} onChange={(e) => setQty(Number(e.target.value))} className="w-36" /></div>
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-[11px] leading-4 text-slate-500"><span className="font-semibold text-slate-700">Remaining quantity</span> is system-controlled. It starts equal to the available quantity and is decremented atomically by the backend on each winning event. It can never fall below zero.</div>
        <div className="flex justify-end gap-2 pt-1"><Button type="button" variant="secondary" onClick={close}>Cancel</Button><Button type="submit" disabled={!name || qty < 1}><Plus className="h-3.5 w-3.5" /> Add Prize</Button></div>
      </form>
    </Modal>
  );
}
