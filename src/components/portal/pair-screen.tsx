"use client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Label, Select } from "@/components/ui/input";
import { SuccessIcon } from "@/components/ui/misc";
import { portalGroups } from "@/lib/portal-data";
import { Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { BackLinkButton, PortalStepper } from "./portal-stepper";

const demoErrors: Record<string, string> = { INVALID: "Code not recognised. Check the code shown on your screen and try again.", EXPIRED: "This code has expired. Restart pairing on the device to get a new one.", PAIRED: "This device is already paired to an account.", LIMIT: "Screen licence limit reached. Contact your account manager to add more screens." };

export function PairScreen() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const validate = () => {
    const key = code.trim().toUpperCase();
    if (demoErrors[key]) { setError(demoErrors[key]); return; }
    if (key.length < 4) { setError("Enter the pairing code shown on your screen."); return; }
    setError(""); setStep(2);
  };

  return (
    <div className="space-y-5">
      <BackLinkButton label="Back to Screens" onClick={() => router.push("/portal/screens")} />
      <PortalStepper steps={["Enter Code", "Configure", "Done"]} current={step} className="max-w-md" />

      {step === 1 && (
        <Card className="max-w-[540px] animate-fade-in">
          <div className="border-b border-slate-100 px-5 py-3 text-sm font-semibold text-slate-900">Enter Pairing Code</div>
          <form onSubmit={(e) => { e.preventDefault(); validate(); }} className="space-y-4 px-5 py-4">
            <p className="text-xs leading-5 text-slate-500">On your screen device, navigate to <span className="font-semibold text-slate-800">Settings → Pair Screen</span> to display a pairing code.</p>
            <div><Label>Pairing Code</Label><Input placeholder="E.G. 7F3K-9QZM" value={code} onChange={(e) => { setCode(e.target.value.toUpperCase()); setError(""); }} className={`font-mono uppercase tracking-[0.2em] ${error ? "border-red-400 focus:border-red-500 focus:ring-red-500/20" : ""}`} />{error && <p className="mt-1.5 text-[11px] font-medium text-red-600">{error}</p>}</div>
            <div className="flex gap-2"><Button type="submit">Validate Code</Button><Button type="button" variant="secondary" onClick={() => router.push("/portal/screens")}>Cancel</Button></div>
            <div className="rounded-lg bg-slate-50 px-3 py-2.5 text-[10px] leading-4 text-slate-400"><span className="font-semibold text-slate-600">Demo codes:</span> type <span className="font-mono">INVALID</span>, <span className="font-mono">EXPIRED</span>, <span className="font-mono">PAIRED</span>, or <span className="font-mono">LIMIT</span> to test error states. Any other code proceeds to setup.</div>
          </form>
        </Card>
      )}

      {step === 2 && (
        <Card className="max-w-[540px] animate-fade-in">
          <div className="border-b border-slate-100 px-5 py-3 text-sm font-semibold text-slate-900">Configure Screen</div>
          <form onSubmit={(e) => { e.preventDefault(); setStep(3); }} className="space-y-4 px-5 py-4">
            <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-xs text-green-700"><Check className="h-3.5 w-3.5" /> Pairing code validated — code: <span className="font-semibold">{code || "3245678"}</span></div>
            <div><Label>Screen Name</Label><Input placeholder="e.g. Reception Display" /></div>
            <div><Label>Location</Label><Input placeholder="e.g. Main Lobby, Floor 1" /></div>
            <div><Label>Assign to Group <span className="font-normal text-slate-400">(optional)</span></Label><Select defaultValue=""><option value="">No group</option>{portalGroups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}</Select></div>
            <div><Label>Orientation</Label><Select defaultValue="landscape"><option value="landscape">Landscape (16:9)</option><option value="portrait">Portrait (9:16)</option></Select></div>
            <div><Label>Tags <span className="font-normal text-slate-400">(optional)</span></Label><Input placeholder="lobby, customer-facing" /><p className="mt-1 text-[10px] text-slate-400">Comma-separated tags for organising screens.</p></div>
            <div className="flex gap-2"><Button type="submit" className="flex-1">Pair Screen</Button><Button type="button" variant="secondary" onClick={() => setStep(1)}>← Back</Button></div>
          </form>
        </Card>
      )}

      {step === 3 && (
        <Card className="flex max-w-[540px] flex-col items-center px-6 py-10 text-center animate-fade-in">
          <SuccessIcon />
          <h2 className="mt-4 text-base font-semibold text-slate-900">Screen paired</h2>
          <p className="mt-1 text-xs text-slate-500">Your screen is connected and will receive content as soon as you publish.</p>
          <Button href="/portal/screens/reception-display" className="mt-5">View Screen</Button>
        </Card>
      )}
    </div>
  );
}
