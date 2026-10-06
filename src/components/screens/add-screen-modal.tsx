"use client";
import { Button } from "@/components/ui/button";
import { applyApiError, Field, fieldError, FormError, maskedRegister, SubmitButton, useZodForm } from "@/components/ui/form";
import { Input, Label, Segmented, Select } from "@/components/ui/input";
import { Modal, ModalHeader } from "@/components/ui/modal";
import { SectionLabel } from "@/components/ui/card";
import { SuccessIcon } from "@/components/ui/misc";
import { useGroups } from "@/lib/api/hooks/groups";
import { usePairScreen } from "@/lib/api/hooks/screens";
import type { Screen } from "@/lib/api/types";
import { errorMessage } from "@/lib/format";
import { maskName, maskPairingCode, maskTags } from "@/lib/validation/masks";
import { useState } from "react";
import { CompanySelect, QueryNotice, useCompanyOptions } from "./query-guards";
import { emptyScreenForm, isPairingCodeError, pairCodeSchema, SCREEN_LOCATION_MAX, SCREEN_NAME_MAX, screenSchema, toPairBody } from "./screen-form";

/** Super Admin pairing: the same flow as the portal, plus choosing which company owns the screen. */
export function AddScreenModal({ open, onClose, defaultCompanyId }: { open: boolean; onClose: () => void; defaultCompanyId?: string }) {
  const companies = useCompanyOptions();
  const [step, setStep] = useState(1);
  const [paired, setPaired] = useState<Screen | null>(null);
  const codeForm = useZodForm(pairCodeSchema, { defaultValues: { code: "" } });
  const form = useZodForm(screenSchema, { defaultValues: emptyScreenForm() });
  const [chosen, setChosen] = useState(defaultCompanyId ?? "");
  const companyId = chosen || defaultCompanyId || companies.data?.data[0]?.id || "";
  const groups = useGroups({ companyId, enabled: !!companyId && open });
  const pair = usePairScreen(companyId);
  const orientation = form.watch("orientation");
  const close = () => {
    if (form.formState.isSubmitting) return;
    onClose();
    setTimeout(() => { setStep(1); setPaired(null); codeForm.reset({ code: "" }); form.reset(emptyScreenForm()); setChosen(defaultCompanyId ?? ""); }, 200);
  };

  const submitCode = codeForm.handleSubmit(() => setStep(2));
  const submit = form.handleSubmit(async (v) => {
    if (!companyId) { form.setError("root.server", { type: "manual", message: "Choose the company that owns this screen." }); return; }
    try {
      const s = await pair.mutateAsync(toPairBody(codeForm.getValues("code").trim().toUpperCase(), v));
      setPaired(s);
      setStep(3);
    } catch (e) {
      if (isPairingCodeError(e)) {
        setStep(1);
        codeForm.setError("code", { type: "server", message: errorMessage(e) });
      } else applyApiError(form, e, { code: "root.server" });
    }
  });

  return (
    <Modal open={open} onClose={close} width="max-w-[520px]">
      {step < 3 && (
        <div className="flex gap-2 px-6 pt-5">
          {[1, 2, 3].map((n) => <div key={n} className={`h-1 flex-1 rounded-full ${n <= step ? "bg-blue-600" : "bg-slate-200"}`} />)}
        </div>
      )}

      {step === 1 && (
        <form onSubmit={submitCode} noValidate className="animate-fade-in">
          <div className="px-6 pt-3 text-[11px] text-slate-400">Step 1 of 3</div>
          <ModalHeader title="Pair New Screen" subtitle="Enter the pairing code displayed on the signage player." className="pt-1" />
          <div className="space-y-4 px-6 py-5">
            <div>
              <Label htmlFor="admin-pair-code" required>Pairing Code</Label>
              <div className="flex items-start gap-2">
                <Field error={fieldError(codeForm, "code")} className="flex-1">
                  <Input id="admin-pair-code" placeholder="e.g. A7K9QX" autoComplete="off" autoCapitalize="characters" autoCorrect="off" spellCheck={false} maxLength={6} className="font-mono tracking-[0.2em] uppercase" autoFocus {...maskedRegister(codeForm, "code", maskPairingCode)} />
                </Field>
                <SubmitButton form={codeForm}>Continue</SubmitButton>
              </div>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
              <SectionLabel>How to find the code</SectionLabel>
              <p className="mt-1.5 text-xs leading-5 text-slate-500">Open the signage player app on the device. The 6-character pairing code is shown on the welcome screen. Codes expire after 5 minutes.</p>
            </div>
          </div>
          <div className="flex justify-end px-6 pb-6"><Button type="button" variant="secondary" onClick={close}>Cancel</Button></div>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={submit} noValidate className="animate-fade-in">
          <div className="px-6 pt-3 text-[11px] text-slate-400">Step 2 of 3</div>
          <ModalHeader title="Configure Screen" subtitle="Choose the owning company and basic information for this screen." className="pt-1" />
          <div className="space-y-4 px-6 py-5">
            <FormError form={form} />
            <Field label="Screen Name" required error={fieldError(form, "name")}>
              <Input placeholder="e.g. Lobby Display 01" maxLength={SCREEN_NAME_MAX} autoFocus {...maskedRegister(form, "name", maskName)} />
            </Field>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label htmlFor="admin-pair-company" required>Company / Tenant</Label>
                <CompanySelect id="admin-pair-company" value={companyId} onChange={(id) => { setChosen(id); form.setValue("groupId", ""); }} />
              </div>
              <Field label="Location" error={fieldError(form, "location")}>
                <Input placeholder="e.g. Main Lobby" maxLength={SCREEN_LOCATION_MAX} {...maskedRegister(form, "location", maskName)} />
              </Field>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Field label="Screen Group" error={fieldError(form, "groupId")}>
                  <Select disabled={!groups.data} {...form.register("groupId")}>
                    <option value="">{!companyId ? "Choose a company first" : groups.data ? "None" : groups.isError ? "Couldn't load groups" : "Loading groups…"}</option>
                    {(groups.data?.data ?? []).map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
                  </Select>
                </Field>
                <QueryNotice query={groups} what="groups" />
              </div>
              <div><Label>Orientation</Label><Segmented options={[{ value: "LANDSCAPE", label: "Landscape" }, { value: "PORTRAIT", label: "Portrait" }]} value={orientation} onChange={(v) => form.setValue("orientation", v)} /></div>
            </div>
            <Field label="Tags" hint="Comma separated · up to 20 tags of 40 characters" error={fieldError(form, "tags")}>
              <Input placeholder="lobby, main display" {...maskedRegister(form, "tags", maskTags)} />
            </Field>
          </div>
          <div className="flex justify-end gap-2 px-6 pb-6"><Button type="button" variant="secondary" onClick={() => setStep(1)} disabled={form.formState.isSubmitting}>Back</Button><SubmitButton form={form} pendingText="Pairing…">Complete Pairing</SubmitButton></div>
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
