"use client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Label, Select } from "@/components/ui/input";
import { SuccessIcon } from "@/components/ui/misc";
import { useGroups } from "@/lib/api/hooks/groups";
import { usePairScreen } from "@/lib/api/hooks/screens";
import type { Screen } from "@/lib/api/types";
import { errorMessage } from "@/lib/format";
import { Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { BackLinkButton, PortalStepper } from "./portal-stepper";

/**
 * Pairing flow. The code is only validated by the API when the screen is created (step 2 submit),
 * so a bad or expired code sends the user back to step 1 with the API's message.
 */
export function PairScreen({ companyId }: { companyId?: string | null } = {}) {
  const router = useRouter();
  const groups = useGroups({ companyId });
  const pair = usePairScreen(companyId);
  const [step, setStep] = useState(1);
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState("");
  const [form, setForm] = useState({ name: "", location: "", groupId: "", orientation: "LANDSCAPE" as Screen["orientation"], tags: "" });
  const [paired, setPaired] = useState<Screen | null>(null);
  const [submitError, setSubmitError] = useState("");
  const base = companyId ? "/screens" : "/portal/screens";

  const validate = () => {
    if (code.trim().length < 4) { setCodeError("Enter the pairing code shown on your screen."); return; }
    setCodeError("");
    setStep(2);
  };

  const submit = async () => {
    setSubmitError("");
    try {
      const screen = await pair.mutateAsync({
        code: code.trim(),
        name: form.name.trim(),
        location: form.location.trim() || undefined,
        orientation: form.orientation,
        groupId: form.groupId || undefined,
        tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
      });
      setPaired(screen);
      setStep(3);
    } catch (e) {
      const msg = errorMessage(e);
      const codeProblem = e instanceof Error && "code" in e && ["PAIRING_CODE_INVALID", "PAIRING_CODE_EXPIRED", "DEVICE_ALREADY_PAIRED"].includes(String((e as { code: string }).code));
      if (codeProblem) { setCodeError(msg); setStep(1); } else setSubmitError(msg);
    }
  };

  return (
    <div className="space-y-5">
      <BackLinkButton label="Back to Screens" onClick={() => router.push(base)} />
      <PortalStepper steps={["Enter Code", "Configure", "Done"]} current={step} className="max-w-md" />

      {step === 1 && (
        <Card className="max-w-[540px] animate-fade-in">
          <div className="border-b border-slate-100 px-5 py-3 text-sm font-semibold text-slate-900">Enter Pairing Code</div>
          <form onSubmit={(e) => { e.preventDefault(); validate(); }} className="space-y-4 px-5 py-4">
            <p className="text-xs leading-5 text-slate-500">On your screen device, navigate to <span className="font-semibold text-slate-800">Settings → Pair Screen</span> to display a pairing code.</p>
            <div><Label>Pairing Code</Label><Input placeholder="E.G. 7F3K9Q" value={code} onChange={(e) => { setCode(e.target.value.toUpperCase()); setCodeError(""); }} className={`font-mono uppercase tracking-[0.2em] ${codeError ? "border-red-400 focus:border-red-500 focus:ring-red-500/20" : ""}`} />{codeError && <p className="mt-1.5 text-[11px] font-medium text-red-600">{codeError}</p>}</div>
            <div className="flex gap-2"><Button type="submit">Continue</Button><Button type="button" variant="secondary" onClick={() => router.push(base)}>Cancel</Button></div>
            <p className="rounded-lg bg-slate-50 px-3 py-2.5 text-[10px] leading-4 text-slate-400">Codes are valid for 5 minutes. The code is checked against the device when you finish the next step.</p>
          </form>
        </Card>
      )}

      {step === 2 && (
        <Card className="max-w-[540px] animate-fade-in">
          <div className="border-b border-slate-100 px-5 py-3 text-sm font-semibold text-slate-900">Configure Screen</div>
          <form onSubmit={(e) => { e.preventDefault(); submit(); }} className="space-y-4 px-5 py-4">
            <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-700"><Check className="h-3.5 w-3.5" /> Pairing code: <span className="font-mono font-semibold">{code}</span></div>
            <div><Label required>Screen Name</Label><Input placeholder="e.g. Reception Display" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required minLength={2} /></div>
            <div><Label>Location</Label><Input placeholder="e.g. Main Lobby, Floor 1" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></div>
            <div><Label>Assign to Group <span className="font-normal text-slate-400">(optional)</span></Label><Select value={form.groupId} onChange={(e) => setForm({ ...form, groupId: e.target.value })}><option value="">No group</option>{groups.data?.data.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}</Select></div>
            <div><Label>Orientation</Label><Select value={form.orientation} onChange={(e) => setForm({ ...form, orientation: e.target.value as Screen["orientation"] })}><option value="LANDSCAPE">Landscape (16:9)</option><option value="PORTRAIT">Portrait (9:16)</option></Select></div>
            <div><Label>Tags <span className="font-normal text-slate-400">(optional)</span></Label><Input placeholder="lobby, customer-facing" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} /><p className="mt-1 text-[10px] text-slate-400">Comma-separated tags for organising screens.</p></div>
            {submitError && <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">{submitError}</p>}
            <div className="flex gap-2"><Button type="submit" className="flex-1" disabled={pair.isPending}>{pair.isPending ? "Pairing…" : "Pair Screen"}</Button><Button type="button" variant="secondary" onClick={() => setStep(1)} disabled={pair.isPending}>← Back</Button></div>
          </form>
        </Card>
      )}

      {step === 3 && paired && (
        <Card className="flex max-w-[540px] flex-col items-center px-6 py-10 text-center animate-fade-in">
          <SuccessIcon />
          <h2 className="mt-4 text-base font-semibold text-slate-900">{paired.name} paired</h2>
          <p className="mt-1 text-xs text-slate-500">Your screen is connected and will receive content as soon as you publish.</p>
          <Button href={`${base}/${paired.id}`} className="mt-5">View Screen</Button>
        </Card>
      )}
    </div>
  );
}
