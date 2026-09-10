"use client";
import { Button } from "@/components/ui/button";
import { Input, Label, Segmented, Select } from "@/components/ui/input";
import { Modal, ModalHeader } from "@/components/ui/modal";
import { SectionLabel } from "@/components/ui/card";
import { SuccessIcon } from "@/components/ui/misc";
import { companies } from "@/lib/data";
import { useState } from "react";

export function AddScreenModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [step, setStep] = useState(1);
  const [code, setCode] = useState("");
  const [orientation, setOrientation] = useState<"Landscape" | "Portrait">("Landscape");
  const close = () => { onClose(); setTimeout(() => { setStep(1); setCode(""); }, 200); };

  return (
    <Modal open={open} onClose={close} width="max-w-[520px]">
      {step < 3 && (
        <div className="flex gap-2 px-6 pt-5">
          {[1, 2, 3].map((n) => <div key={n} className={`h-1 flex-1 rounded-full ${n <= step ? "bg-blue-600" : "bg-slate-200"}`} />)}
        </div>
      )}

      {step === 1 && (
        <form onSubmit={(e) => { e.preventDefault(); setStep(2); }} className="animate-fade-in">
          <div className="px-6 pt-3 text-[11px] text-slate-400">Step 1 of 3</div>
          <ModalHeader title="Pair New Screen" subtitle="Enter the pairing code displayed on your signage player." className="pt-1" />
          <div className="space-y-4 px-6 py-5">
            <div>
              <Label>Pairing Code</Label>
              <div className="flex gap-2">
                <Input placeholder="e.g. A1B2C3" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} className="font-mono tracking-[0.2em] uppercase" />
                <Button type="submit" disabled={code.length < 6}>Validate Code</Button>
              </div>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
              <SectionLabel>How to find your code</SectionLabel>
              <p className="mt-1.5 text-xs leading-5 text-slate-500">Open the signage player app on your device. The pairing code is shown on the welcome screen. Codes expire after 5 minutes.</p>
            </div>
          </div>
          <div className="flex justify-end px-6 pb-6"><Button type="button" variant="secondary" onClick={close}>Back</Button></div>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={(e) => { e.preventDefault(); setStep(3); }} className="animate-fade-in">
          <div className="px-6 pt-3 text-[11px] text-slate-400">Step 2 of 3</div>
          <ModalHeader title="Configure Screen" subtitle="Set up basic information for this screen." className="pt-1" />
          <div className="space-y-4 px-6 py-5">
            <div><Label required>Screen Name</Label><Input placeholder="e.g. Lobby Display 01" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Company / Tenant</Label><Select defaultValue="acme-retail">{companies.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</Select></div>
              <div><Label required>Location</Label><Input placeholder="e.g. Main Lobby" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Screen Group</Label><Select defaultValue="lobby"><option value="lobby">Lobby</option><option value="restaurant">Restaurant</option><option value="reception">Reception</option><option value="fitness">Fitness</option><option value="">None</option></Select></div>
              <div><Label>Orientation</Label><Segmented options={[{ value: "Landscape", label: "Landscape" }, { value: "Portrait", label: "Portrait" }]} value={orientation} onChange={setOrientation} /></div>
            </div>
            <div><Label>Tags</Label><Input placeholder="Lobby, Main Display, ... (comma separated)" /></div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
              <SectionLabel>Detected Device</SectionLabel>
              <dl className="mt-2 grid grid-cols-2 gap-x-6 gap-y-1 text-[11px]">
                <div className="flex justify-between"><dt className="text-slate-400">Device ID</dt><dd className="font-semibold text-slate-800">ANDROID-NEW01</dd></div>
                <div className="flex justify-between"><dt className="text-slate-400">Model</dt><dd className="font-semibold text-slate-800">Android Box Pro</dd></div>
                <div className="flex justify-between"><dt className="text-slate-400">Player Version</dt><dd className="font-semibold text-slate-800">1.6.3</dd></div>
                <div className="flex justify-between"><dt className="text-slate-400">App Version</dt><dd className="font-semibold text-slate-800">2.4.0</dd></div>
              </dl>
            </div>
          </div>
          <div className="flex justify-end gap-2 px-6 pb-6"><Button type="button" variant="secondary" onClick={() => setStep(1)}>Back</Button><Button type="submit">Complete Pairing</Button></div>
        </form>
      )}

      {step === 3 && (
        <div className="flex flex-col items-center px-6 py-10 text-center animate-fade-in">
          <SuccessIcon />
          <h2 className="mt-4 text-base font-semibold text-slate-900">Screen paired successfully</h2>
          <p className="mt-1 text-xs text-slate-500">Your signage player is connected and ready to receive content.</p>
          <Button href="/screens/lobby-display-01" className="mt-5" onClick={close}>View Screen Details</Button>
        </div>
      )}
    </Modal>
  );
}
