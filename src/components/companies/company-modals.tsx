"use client";
import { Button } from "@/components/ui/button";
import { applyApiError, Field, FormError, FormPhone, maskedRegister, SubmitButton, useZodForm } from "@/components/ui/form";
import { Input, Select } from "@/components/ui/input";
import { Modal, ModalFooter, ModalHeader } from "@/components/ui/modal";
import { SectionLabel } from "@/components/ui/card";
import { Alert, CompanyLogo } from "@/components/ui/misc";
import { useToast } from "@/components/ui/toast";
import { counts, useCreateCompany, useDeleteCompany, useUpdateCompany } from "@/lib/api/hooks/companies";
import { LICENSE_STATES, useUpdateLicense } from "@/lib/api/hooks/licenses";
import type { Company } from "@/lib/api/types";
import { label } from "@/lib/format";
import { TIME_ZONES } from "@/lib/validation/fields";
import { maskInteger, maskName } from "@/lib/validation/masks";
import { Trash2 } from "lucide-react";
import { COMPANY_STATUSES, companyDefaults, companySchema, createCompanyBody, deleteCompanySchema, updateCompanyBody } from "./company-schema";

function CompanyForm({ company, onClose, onSaved }: { company?: Company | null; onClose: () => void; onSaved?: (c: Company) => void }) {
  const toast = useToast();
  const create = useCreateCompany();
  const update = useUpdateCompany(company?.id ?? "");
  const updateLicense = useUpdateLicense();
  const editing = !!company;
  const form = useZodForm(companySchema, { defaultValues: companyDefaults(company) });
  const { register, formState } = form;
  const e = formState.errors;
  const limitText = form.watch("screenLimit");
  const zone = form.watch("timezone");
  // Keep a stored zone the browser doesn't list selectable, so opening the form never silently changes it.
  const zones = zone && !TIME_ZONES.includes(zone) ? [zone, ...TIME_ZONES] : TIME_ZONES;

  const submit = form.handleSubmit(async (v) => {
    try {
      let saved: Company;
      if (company) {
        saved = await update.mutateAsync(updateCompanyBody(v));
        const limit = Number(v.screenLimit);
        if (limit !== company.license?.screenLimit || v.licenseState !== company.license?.state) await updateLicense.mutateAsync({ companyId: company.id, screenLimit: limit, state: v.licenseState });
        toast.success("Company updated", saved.name);
      } else {
        saved = await create.mutateAsync(createCompanyBody(v));
        toast.success("Company created", `${saved.name} · ${v.screenLimit} screen licences`);
      }
      onSaved?.(saved);
      onClose();
    } catch (err) {
      applyApiError(form, err, { state: "licenseState" });
    }
  });

  return (
    <form onSubmit={submit} noValidate>
      <div className="space-y-6 px-6 py-6">
        <FormError form={form} />
        <div className="space-y-4">
          <SectionLabel>Company Information</SectionLabel>
          <Field label="Company Name" required error={e.name?.message}><Input placeholder="e.g. Acme Retail" autoComplete="organization" maxLength={120} {...maskedRegister(form, "name", maskName)} /></Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Company Status" error={e.status?.message}><Select {...register("status")}>{COMPANY_STATUSES.map((s) => <option key={s} value={s}>{label(s)}</option>)}</Select></Field>
            <Field label="Plan" error={e.plan?.message}><Input placeholder="e.g. Platform Pro" autoComplete="off" maxLength={60} {...register("plan")} /></Field>
            <Field label="Website" error={e.website?.message}><Input type="url" inputMode="url" placeholder="https://" autoComplete="url" autoCapitalize="off" maxLength={2048} {...register("website")} /></Field>
            <Field label="Industry" error={e.industry?.message}><Input placeholder="Retail" autoComplete="off" maxLength={80} {...register("industry")} /></Field>
            <Field label="Phone" error={e.phone?.message}><FormPhone form={form} name="phone" autoComplete="off" /></Field>
            <Field label="Timezone" required error={e.timezone?.message}><Select {...register("timezone")}>{zones.map((tz) => <option key={tz} value={tz}>{tz}</option>)}</Select></Field>
          </div>
        </div>
        <div className="space-y-4">
          <SectionLabel>License Configuration</SectionLabel>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Maximum Screens" required hint="Whole number, 1–10,000." error={e.screenLimit?.message}><Input inputMode="numeric" autoComplete="off" maxLength={5} {...maskedRegister(form, "screenLimit", (v) => maskInteger(v, 5))} /></Field>
            <Field label="License Status" error={e.licenseState?.message}><Select {...register("licenseState")}>{LICENSE_STATES.map((s) => <option key={s} value={s}>{label(s)}</option>)}</Select></Field>
          </div>
          {editing && company?.license && limitText !== "" && Number(limitText) < counts(company).screens && <Alert tone="amber">Lower than the {counts(company).screens} screens already paired: the account is flagged over limit and cannot pair more until screens are unpaired.</Alert>}
        </div>
      </div>
      <ModalFooter>
        <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
        <SubmitButton form={form}>{editing ? "Save Changes" : "Create Company"}</SubmitButton>
      </ModalFooter>
    </form>
  );
}

export function CompanyFormModal({ open, onClose, company, onSaved }: { open: boolean; onClose: () => void; company?: Company | null; onSaved?: (c: Company) => void }) {
  const editing = !!company;
  return (
    <Modal open={open} onClose={onClose} width="max-w-[560px]">
      <ModalHeader title={editing ? "Edit company" : "Create company"} subtitle={editing ? "Update company details and its screen license." : "Set up a customer company and configure its screen license."} onClose={onClose} />
      {open && <CompanyForm key={company?.id ?? "new"} company={company} onClose={onClose} onSaved={onSaved} />}
    </Modal>
  );
}

function DeleteCompanyForm({ company, onClose, onDeleted }: { company: Company; onClose: () => void; onDeleted?: () => void }) {
  const toast = useToast();
  const remove = useDeleteCompany();
  const form = useZodForm(deleteCompanySchema(company.name), { defaultValues: { confirm: "" } });
  const matches = form.watch("confirm").trim() === company.name.trim();
  const submit = form.handleSubmit(async () => {
    try {
      await remove.mutateAsync(company.id);
    } catch (err) {
      applyApiError(form, err);
      return;
    }
    toast.success("Company deleted", company.name);
    onClose();
    onDeleted?.();
  });
  return (
    <form onSubmit={submit} noValidate className="p-6">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50 text-red-600"><Trash2 className="h-4 w-4" /></div>
      <h2 className="mt-4 text-base font-semibold text-slate-900">Delete {company.name}?</h2>
      <p className="mt-1.5 text-xs leading-5 text-slate-500">This permanently removes the company and all associated data including <span className="font-semibold text-slate-800">{counts(company).screens} paired screens</span>, users, media, and licence records. This action cannot be undone.</p>
      <div className="mt-4 flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
        <CompanyLogo seed={company.code} name={company.name} size="sm" />
        <div><div className="text-sm font-semibold text-slate-900">{company.name}</div><div className="text-[11px] text-slate-400">{counts(company).screens} screens · {company.license?.screenLimit ?? 0} licensed</div></div>
      </div>
      <Field className="mt-4" label={<>Type <span className="font-semibold text-slate-900">{company.name}</span> to confirm</>} error={form.formState.errors.confirm?.message}>
        <Input placeholder={company.name} autoComplete="off" autoCapitalize="off" spellCheck={false} maxLength={120} {...form.register("confirm")} />
      </Field>
      <FormError form={form} className="mt-3" />
      <div className="mt-6 flex justify-end gap-2"><Button type="button" variant="secondary" onClick={onClose}>Cancel</Button><SubmitButton form={form} variant="danger" pendingText="Deleting…" disabled={!matches}>Delete Company</SubmitButton></div>
    </form>
  );
}

export function DeleteCompanyModal({ company, onClose, onDeleted }: { company: Company | null; onClose: () => void; onDeleted?: () => void }) {
  return (
    <Modal open={!!company} onClose={onClose} width="max-w-[550px]">
      {company && <DeleteCompanyForm key={company.id} company={company} onClose={onClose} onDeleted={onDeleted} />}
    </Modal>
  );
}
