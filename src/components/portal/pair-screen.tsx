"use client";
import { QueryNotice } from "@/components/screens/query-guards";
import { emptyScreenForm, isPairingCodeError, pairCodeSchema, SCREEN_LOCATION_MAX, SCREEN_NAME_MAX, screenSchema, toPairBody } from "@/components/screens/screen-form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { applyApiError, Field, fieldError, FormError, maskedRegister, SubmitButton, useZodForm } from "@/components/ui/form";
import { Input, Select } from "@/components/ui/input";
import { SuccessIcon } from "@/components/ui/misc";
import { useGroups } from "@/lib/api/hooks/groups";
import { usePairScreen } from "@/lib/api/hooks/screens";
import type { Screen } from "@/lib/api/types";
import { errorMessage } from "@/lib/format";
import { maskName, maskPairingCode, maskTags } from "@/lib/validation/masks";
import { Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { BackLinkButton, PortalStepper } from "./portal-stepper";

/**
 * Pairing flow. The code's format is checked here; whether it exists is only known when the screen
 * is created (step 2 submit), so a bad or expired code sends the user back to step 1 with the
 * API's message on the code field.
 */
export function PairScreen({ companyId }: { companyId?: string | null } = {}) {
  const router = useRouter();
  const groups = useGroups({ companyId });
  const pair = usePairScreen(companyId);
  const [step, setStep] = useState(1);
  const [paired, setPaired] = useState<Screen | null>(null);
  const codeForm = useZodForm(pairCodeSchema, { defaultValues: { code: "" } });
  const form = useZodForm(screenSchema, { defaultValues: emptyScreenForm() });
  const base = companyId ? "/screens" : "/portal/screens";

  const submitCode = codeForm.handleSubmit(() => setStep(2));
  const submit = form.handleSubmit(async (v) => {
    try {
      setPaired(await pair.mutateAsync(toPairBody(codeForm.getValues("code").trim().toUpperCase(), v)));
      setStep(3);
    } catch (e) {
      if (isPairingCodeError(e)) {
        setStep(1);
        codeForm.setError("code", { type: "server", message: errorMessage(e) });
      } else applyApiError(form, e, { code: "root.server" });
    }
  });

  return (
    <div className="space-y-5">
      <BackLinkButton label="Back to Screens" onClick={() => router.push(base)} />
      <PortalStepper steps={["Enter Code", "Configure", "Done"]} current={step} className="max-w-md" />

      {step === 1 && (
        <Card className="max-w-[540px] animate-fade-in">
          <div className="border-b border-slate-100 px-5 py-3 text-sm font-semibold text-slate-900">Enter Pairing Code</div>
          <form onSubmit={submitCode} noValidate className="space-y-4 px-5 py-4">
            <p className="text-xs leading-5 text-slate-500">On your screen device, navigate to <span className="font-semibold text-slate-800">Settings → Pair Screen</span> to display a pairing code.</p>
            <Field label="Pairing Code" required hint="6 letters and numbers, e.g. 7F3K9Q" error={fieldError(codeForm, "code")}>
              <Input placeholder="E.G. 7F3K9Q" autoComplete="off" autoCapitalize="characters" autoCorrect="off" spellCheck={false} maxLength={6} className="font-mono uppercase tracking-[0.2em]" autoFocus {...maskedRegister(codeForm, "code", maskPairingCode)} />
            </Field>
            <div className="flex gap-2"><SubmitButton form={codeForm}>Continue</SubmitButton><Button type="button" variant="secondary" onClick={() => router.push(base)}>Cancel</Button></div>
            <p className="rounded-lg bg-slate-50 px-3 py-2.5 text-[10px] leading-4 text-slate-400">Codes are valid for 5 minutes. The code is checked against the device when you finish the next step.</p>
          </form>
        </Card>
      )}

      {step === 2 && (
        <Card className="max-w-[540px] animate-fade-in">
          <div className="border-b border-slate-100 px-5 py-3 text-sm font-semibold text-slate-900">Configure Screen</div>
          <form onSubmit={submit} noValidate className="space-y-4 px-5 py-4">
            <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-700"><Check className="h-3.5 w-3.5" /> Pairing code: <span className="font-mono font-semibold">{codeForm.getValues("code")}</span></div>
            <FormError form={form} />
            <Field label="Screen Name" required error={fieldError(form, "name")}>
              <Input placeholder="e.g. Reception Display" maxLength={SCREEN_NAME_MAX} autoFocus {...maskedRegister(form, "name", maskName)} />
            </Field>
            <Field label="Location" error={fieldError(form, "location")}>
              <Input placeholder="e.g. Main Lobby, Floor 1" maxLength={SCREEN_LOCATION_MAX} {...maskedRegister(form, "location", maskName)} />
            </Field>
            <div>
              <Field label={<>Assign to Group <span className="font-normal text-slate-400">(optional)</span></>} error={fieldError(form, "groupId")}>
                <Select disabled={!groups.data} {...form.register("groupId")}>
                  <option value="">{groups.data ? "No group" : groups.isError ? "Couldn't load groups" : "Loading groups…"}</option>
                  {(groups.data?.data ?? []).map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
                </Select>
              </Field>
              <QueryNotice query={groups} what="groups" />
            </div>
            <Field label="Orientation" error={fieldError(form, "orientation")}>
              <Select {...form.register("orientation")}><option value="LANDSCAPE">Landscape (16:9)</option><option value="PORTRAIT">Portrait (9:16)</option></Select>
            </Field>
            <Field label={<>Tags <span className="font-normal text-slate-400">(optional)</span></>} hint="Comma-separated tags for organising screens · up to 20, 40 characters each." error={fieldError(form, "tags")}>
              <Input placeholder="lobby, customer-facing" {...maskedRegister(form, "tags", maskTags)} />
            </Field>
            <div className="flex gap-2"><SubmitButton form={form} className="flex-1" pendingText="Pairing…">Pair Screen</SubmitButton><Button type="button" variant="secondary" onClick={() => setStep(1)} disabled={form.formState.isSubmitting}>← Back</Button></div>
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
