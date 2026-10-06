"use client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Alert, CompanyLogo } from "@/components/ui/misc";
import { useToast } from "@/components/ui/toast";
import { counts } from "@/lib/api/hooks/companies";
import { useUpdateLicense } from "@/lib/api/hooks/licenses";
import type { Company } from "@/lib/api/types";
import { errorMessage, label } from "@/lib/format";
import { AlertCircle, FileBadge, Minus, Plus } from "lucide-react";
import { useState } from "react";
import { z } from "zod";
import { applyApiError, FormError, maskedRegister, SubmitButton, useZodForm } from "@/components/ui/form";
import { maskInteger } from "@/lib/validation/masks";
import { SCREEN_LIMIT_MAX, screenLimit } from "@/components/companies/company-schema";

function CompanyRow({ company }: { company: Company }) {
  return (
    <div className="mt-4 flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
      <CompanyLogo seed={company.code} name={company.name} size="sm" />
      <div><div className="text-sm font-semibold text-slate-900">{company.name}</div><div className="text-[11px] text-slate-400">{counts(company).screens} paired · {company.license?.screenLimit ?? 0} licensed</div></div>
    </div>
  );
}

export function EditLimitModal({ company, onClose }: { company: Company | null; onClose: () => void }) {
  return <Modal open={!!company} onClose={onClose} width="max-w-[410px]">{company && <EditLimitForm key={company.id} company={company} onClose={onClose} />}</Modal>;
}

const limitSchema = z.object({ limit: screenLimit() });

function EditLimitForm({ company, onClose }: { company: Company; onClose: () => void }) {
  const toast = useToast();
  const update = useUpdateLicense();
  const current = company.license?.screenLimit ?? 0;
  const paired = counts(company).screens;
  const form = useZodForm(limitSchema, { defaultValues: { limit: String(Math.max(1, current)) } });
  const limitText = form.watch("limit");
  const limit = /^\d+$/.test(limitText) ? Number(limitText) : null;
  const diff = limit === null ? 0 : limit - current;
  const step = (by: number) => {
    const next = Math.min(SCREEN_LIMIT_MAX, Math.max(1, (limit ?? current) + by));
    form.setValue("limit", String(next), { shouldValidate: true, shouldDirty: true });
  };
  const save = form.handleSubmit(async (v) => {
    try {
      const r = await update.mutateAsync({ companyId: company.id, screenLimit: Number(v.limit) });
      toast.success("Screen limit updated", r.overLimit ? `${r.screenLimit} screens — the account is now over its limit.` : `${r.screenLimit} screens`);
      onClose();
    } catch (e) {
      applyApiError(form, e, { screenLimit: "limit" });
    }
  });
  const limitError = form.formState.errors.limit?.message;
  return (
    <form onSubmit={save} noValidate className="p-6">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600"><FileBadge className="h-4 w-4" /></div>
      <h2 className="mt-4 text-base font-semibold text-slate-900">Edit Screen Limit</h2>
      <p className="mt-1 text-xs text-slate-500">Update the maximum number of screens allowed for <span className="font-semibold text-slate-800">{company.name}</span>.</p>
      <div className="mt-4 flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
        <div className="flex items-center gap-3"><CompanyLogo seed={company.code} name={company.name} size="sm" /><div><div className="text-sm font-semibold text-slate-900">{company.name}</div><div className="text-[11px] text-slate-400">Currently using {paired} of {current} screens</div></div></div>
        <Badge tone={company.license?.state === "ACTIVE" ? "green" : "amber"} dot>{label(company.license?.state ?? "DISABLED")}</Badge>
      </div>
      <div className="mt-5">
        <Label htmlFor="screen-limit-input" required>New Screen Limit</Label>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => step(-1)} disabled={limit !== null && limit <= 1} className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40" aria-label="Decrease"><Minus className="h-4 w-4" /></button>
          <input id="screen-limit-input" inputMode="numeric" autoComplete="off" maxLength={5} aria-invalid={limitError ? true : undefined} aria-describedby={limitError ? "screen-limit-error" : "screen-limit-hint"} {...maskedRegister(form, "limit", (v) => maskInteger(v, 5))} className="h-10 min-w-0 flex-1 rounded-lg border border-slate-200 text-center text-base font-semibold text-slate-900 outline-none focus:border-blue-500 aria-invalid:border-red-400" />
          <button type="button" onClick={() => step(1)} disabled={limit !== null && limit >= SCREEN_LIMIT_MAX} className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40" aria-label="Increase"><Plus className="h-4 w-4" /></button>
        </div>
        {limitError ? <p id="screen-limit-error" role="alert" className="mt-1 text-[11px] font-medium text-red-600">{limitError}</p> : <p id="screen-limit-hint" className="mt-1 text-[11px] text-slate-400">Whole number, 1–10,000.</p>}
        {diff !== 0 && <p className={`mt-2 text-xs font-medium ${diff > 0 ? "text-green-600" : "text-red-600"}`}>{diff > 0 ? `+${diff} screens will be added` : `${diff} screens will be removed`}</p>}
        {limit !== null && limit < paired && <Alert tone="amber" className="mt-2">Below the {paired} screens already paired. Screens are not removed; the account is flagged over limit until it unpairs some.</Alert>}
      </div>
      <FormError form={form} className="mt-3" />
      <div className="mt-6 flex justify-end gap-2"><Button type="button" variant="secondary" onClick={onClose}>Cancel</Button><SubmitButton form={form} disabled={limit === current}>Save Changes</SubmitButton></div>
    </form>
  );
}

function StateModal({ company, onClose, state, title, body, tone, cta }: { company: Company | null; onClose: () => void; state: "SUSPENDED" | "DISABLED" | "ACTIVE"; title: string; body: string; tone: string; cta: string }) {
  const toast = useToast();
  const update = useUpdateLicense();
  const [error, setError] = useState("");
  const go = () => company && !update.isPending && update.mutate({ companyId: company.id, state }, { onSuccess: () => { toast.success(`License ${label(state).toLowerCase()}`, company.name); onClose(); }, onError: (e) => setError(errorMessage(e)) });
  return (
    <Modal open={!!company} onClose={onClose} width="max-w-[400px]">
      {company && (
        <div className="p-6">
          <div className="flex gap-3">
            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${state === "SUSPENDED" ? "bg-amber-50 text-amber-600" : state === "DISABLED" ? "bg-slate-100 text-slate-500" : "bg-green-50 text-green-600"}`}><AlertCircle className="h-4 w-4" /></div>
            <div><h2 className="text-base font-semibold text-slate-900">{title}</h2><p className="mt-1 text-xs text-slate-500">{body}</p></div>
          </div>
          <CompanyRow company={company} />
          {error && <Alert tone="red" className="mt-3">{error}</Alert>}
          <div className="mt-6 flex justify-end gap-2"><Button type="button" variant="secondary" onClick={onClose} disabled={update.isPending}>Cancel</Button><Button type="button" className={tone} onClick={go} disabled={update.isPending} aria-busy={update.isPending || undefined}>{update.isPending ? "Saving…" : cta}</Button></div>
        </div>
      )}
    </Modal>
  );
}

export const SuspendLicenseModal = (p: { company: Company | null; onClose: () => void }) => <StateModal {...p} state="SUSPENDED" title="Suspend License?" body="Pauses publishing and pairing for this company. Screens keep their last content." tone="bg-amber-700 hover:bg-amber-800" cta="Suspend" />;
export const DisableLicenseModal = (p: { company: Company | null; onClose: () => void }) => <StateModal {...p} state="DISABLED" title="Disable License?" body="Disables the licence entirely; the company cannot use the platform until it is reactivated." tone="bg-slate-500 hover:bg-slate-600" cta="Disable" />;
export const ActivateLicenseModal = (p: { company: Company | null; onClose: () => void }) => <StateModal {...p} state="ACTIVE" title="Activate License?" body="Restores publishing and pairing within the screen limit." tone="bg-green-600 hover:bg-green-700" cta="Activate" />;
