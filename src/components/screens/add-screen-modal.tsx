"use client";
import { Button } from "@/components/ui/button";
import { Input, Label, Segmented, Select } from "@/components/ui/input";
import { Modal, ModalHeader } from "@/components/ui/modal";
import { SectionLabel } from "@/components/ui/card";
import { SuccessIcon } from "@/components/ui/misc";
import { useCompanyNames } from "@/lib/api/hooks/companies";
import { useGroups } from "@/lib/api/hooks/groups";
import { usePairScreen } from "@/lib/api/hooks/screens";
import type { Screen } from "@/lib/api/types";
import { errorMessage } from "@/lib/format";
import { useState } from "react";

/** Super Admin pairing: the same flow as the portal, plus choosing which company owns the screen. */
export function AddScreenModal({ open, onClose, defaultCompanyId }: { open: boolean; onClose: () => void; defaultCompanyId?: string }) {
  const { companies } = useCompanyNames();
  const [step, setStep] = useState(1);
  const [code, setCode] = useState("");
  const [companyId, setCompanyId] = useState(defaultCompanyId ?? "");
  const [form, setForm] = useState({ name: "", location: "", groupId: "", orientation: "LANDSCAPE" as Screen["orientation"], tags: "" });
  const [error, setError] = useState("");
  const [paired, setPaired] = useState<Screen | null>(null);
  const effectiveCompany = companyId || defaultCompanyId || companies[0]?.id || "";
  const groups = useGroups({ companyId: effectiveCompany, enabled: !!effectiveCompany && open });
  const pair = usePairScreen(effectiveCompany);
  const close = () => { onClose(); setTimeout(() => { setStep(1); setCode(""); setError(""); setPaired(null); setForm({ name: "", location: "", groupId: "", orientation: "LANDSCAPE", tags: "" }); }, 200); };

  const submit = async () => {
    setError("");
    try {
      const s = await pair.mutateAsync({ code: code.trim(), name: form.name.trim(), location: form.location.trim() || undefined, orientation: form.orientation, groupId: form.groupId || undefined, tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean) });
      setPaired(s);
      setStep(3);
    } catch (e) {
      setError(errorMessage(e));
      if (e instanceof Error && "code" in e && String((e as { code: string }).code).startsWith("PAIRING_CODE")) setStep(1);
    }
  };

  return (
    <Modal open={open} onClose={close} width="max-w-[520px]">
      {step < 3 && (
        <div className="flex gap-2 px-6 pt-5">
          {[1, 2, 3].map((n) => <div key={n} className={`h-1 flex-1 rounded-full ${n <= step ? "bg-blue-600" : "bg-slate-200"}`} />)}
        </div>
      )}

      {step === 1 && (
        <form onSubmit={(e) => { e.preventDefault(); setError(""); setStep(2); }} className="animate-fade-in">
          <div className="px-6 pt-3 text-[11px] text-slate-400">Step 1 of 3</div>
          <ModalHeader title="Pair New Screen" subtitle="Enter the pairing code displayed on the signage player." className="pt-1" />
          <div className="space-y-4 px-6 py-5">
            <div>
              <Label>Pairing Code</Label>
              <div className="flex gap-2">
                <Input placeholder="e.g. A1B2C3" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} className="font-mono tracking-[0.2em] uppercase" />
                <Button type="submit" disabled={code.trim().length < 4}>Continue</Button>
              </div>
              {error && <p className="mt-1.5 text-[11px] font-medium text-red-600">{error}</p>}
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
              <SectionLabel>How to find the code</SectionLabel>
              <p className="mt-1.5 text-xs leading-5 text-slate-500">Open the signage player app on the device. The pairing code is shown on the welcome screen. Codes expire after 5 minutes.</p>
            </div>
          </div>
          <div className="flex justify-end px-6 pb-6"><Button type="button" variant="secondary" onClick={close}>Cancel</Button></div>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={(e) => { e.preventDefault(); submit(); }} className="animate-fade-in">
          <div className="px-6 pt-3 text-[11px] text-slate-400">Step 2 of 3</div>
          <ModalHeader title="Configure Screen" subtitle="Choose the owning company and basic information for this screen." className="pt-1" />
          <div className="space-y-4 px-6 py-5">
            <div><Label required>Screen Name</Label><Input placeholder="e.g. Lobby Display 01" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required minLength={2} /></div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div><Label required>Company / Tenant</Label><Select value={effectiveCompany} onChange={(e) => { setCompanyId(e.target.value); setForm({ ...form, groupId: "" }); }}>{companies.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</Select></div>
              <div><Label>Location</Label><Input placeholder="e.g. Main Lobby" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div><Label>Screen Group</Label><Select value={form.groupId} onChange={(e) => setForm({ ...form, groupId: e.target.value })}><option value="">None</option>{groups.data?.data.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}</Select></div>
              <div><Label>Orientation</Label><Segmented options={[{ value: "LANDSCAPE", label: "Landscape" }, { value: "PORTRAIT", label: "Portrait" }]} value={form.orientation} onChange={(v) => setForm({ ...form, orientation: v })} /></div>
            </div>
            <div><Label>Tags</Label><Input placeholder="Lobby, Main Display, ... (comma separated)" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} /></div>
            {error && <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">{error}</p>}
          </div>
          <div className="flex justify-end gap-2 px-6 pb-6"><Button type="button" variant="secondary" onClick={() => setStep(1)} disabled={pair.isPending}>Back</Button><Button type="submit" disabled={pair.isPending || !effectiveCompany}>{pair.isPending ? "Pairing…" : "Complete Pairing"}</Button></div>
        </form>
      )}

      {step === 3 && paired && (
        <div className="flex flex-col items-center px-6 py-10 text-center animate-fade-in">
          <SuccessIcon />
          <h2 className="mt-4 text-base font-semibold text-slate-900">{paired.name} paired</h2>
          <p className="mt-1 text-xs text-slate-500">The signage player is connected and ready to receive content.</p>
          <Button href={`/screens/${paired.id}`} className="mt-5" onClick={close}>View Screen Details</Button>
        </div>
      )}
    </Modal>
  );
}
