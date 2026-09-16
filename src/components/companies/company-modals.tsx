"use client";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { Modal, ModalFooter, ModalHeader } from "@/components/ui/modal";
import { SectionLabel } from "@/components/ui/card";
import { Alert, CompanyLogo } from "@/components/ui/misc";
import { useToast } from "@/components/ui/toast";
import { counts, useCreateCompany, useDeleteCompany, useUpdateCompany } from "@/lib/api/hooks/companies";
import { LICENSE_STATES, useUpdateLicense } from "@/lib/api/hooks/licenses";
import type { Company } from "@/lib/api/types";
import { errorMessage, label } from "@/lib/format";
import { Trash2 } from "lucide-react";
import { useState } from "react";

const STATUSES: Company["status"][] = ["ACTIVE", "INACTIVE", "SUSPENDED"];

function CompanyForm({ company, onClose, onSaved }: { company?: Company | null; onClose: () => void; onSaved?: (c: Company) => void }) {
  const toast = useToast();
  const create = useCreateCompany();
  const update = useUpdateCompany(company?.id ?? "");
  const updateLicense = useUpdateLicense();
  const editing = !!company;
  const [f, setF] = useState({ name: company?.name ?? "", status: company?.status ?? "ACTIVE", website: company?.website ?? "", industry: company?.industry ?? "", phone: company?.phone ?? "", timezone: company?.timezone ?? "UTC", plan: company?.plan ?? "", screenLimit: company?.license?.screenLimit ?? 10, licenseState: company?.license?.state ?? "ACTIVE" });
  const [error, setError] = useState("");
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setF({ ...f, [k]: e.target.value });
  const pending = create.isPending || update.isPending || updateLicense.isPending;

  const submit = async () => {
    setError("");
    const common = { name: f.name.trim(), status: f.status, website: f.website.trim() || undefined, industry: f.industry.trim() || undefined, phone: f.phone.trim() || undefined, timezone: f.timezone.trim() || "UTC", plan: f.plan.trim() || undefined };
    try {
      let saved: Company;
      if (company) {
        saved = await update.mutateAsync(common);
        if (Number(f.screenLimit) !== company.license?.screenLimit || f.licenseState !== company.license?.state) await updateLicense.mutateAsync({ companyId: company.id, screenLimit: Number(f.screenLimit), state: f.licenseState });
        toast.success("Company updated", saved.name);
      } else {
        saved = await create.mutateAsync({ ...common, screenLimit: Number(f.screenLimit), licenseState: f.licenseState });
        toast.success("Company created", `${saved.name} · ${f.screenLimit} screen licences`);
      }
      onSaved?.(saved);
      onClose();
    } catch (e) { setError(errorMessage(e)); }
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); submit(); }}>
      <div className="space-y-6 px-6 py-6">
        <div className="space-y-4">
          <SectionLabel>Company Information</SectionLabel>
          <div><Label required>Company Name</Label><Input placeholder="e.g. Acme Retail" value={f.name} onChange={set("name")} minLength={2} required /></div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div><Label>Company Status</Label><Select value={f.status} onChange={set("status")}>{STATUSES.map((s) => <option key={s} value={s}>{label(s)}</option>)}</Select></div>
            <div><Label>Plan</Label><Input placeholder="e.g. Platform Pro" value={f.plan} onChange={set("plan")} /></div>
            <div><Label>Website</Label><Input type="url" placeholder="https://" value={f.website} onChange={set("website")} /></div>
            <div><Label>Industry</Label><Input placeholder="Retail" value={f.industry} onChange={set("industry")} /></div>
            <div><Label>Phone</Label><Input value={f.phone} onChange={set("phone")} /></div>
            <div><Label>Timezone</Label><Input placeholder="Europe/London" value={f.timezone} onChange={set("timezone")} /></div>
          </div>
        </div>
        <div className="space-y-4">
          <SectionLabel>License Configuration</SectionLabel>
          <div className="grid gap-4 sm:grid-cols-2">
            <div><Label required>Maximum Screens</Label><Input type="number" value={f.screenLimit} onChange={set("screenLimit")} min={1} required /></div>
            <div><Label>License Status</Label><Select value={f.licenseState} onChange={set("licenseState")}>{LICENSE_STATES.map((s) => <option key={s} value={s}>{label(s)}</option>)}</Select></div>
          </div>
          {editing && company?.license && Number(f.screenLimit) < counts(company).screens && <Alert tone="amber">Lower than the {counts(company).screens} screens already paired: the account is flagged over limit and cannot pair more until screens are unpaired.</Alert>}
        </div>
        {error && <Alert tone="red">{error}</Alert>}
      </div>
      <ModalFooter>
        <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
        <Button type="submit" disabled={pending || f.name.trim().length < 2}>{pending ? "Saving…" : editing ? "Save Changes" : "Create Company"}</Button>
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

export function DeleteCompanyModal({ company, onClose, onDeleted }: { company: Company | null; onClose: () => void; onDeleted?: () => void }) {
  const toast = useToast();
  const remove = useDeleteCompany();
  const [error, setError] = useState("");
  const go = () => company && remove.mutate(company.id, { onSuccess: () => { toast.success("Company deleted", company.name); onClose(); onDeleted?.(); }, onError: (e) => setError(errorMessage(e)) });
  return (
    <Modal open={!!company} onClose={onClose} width="max-w-[550px]">
      {company && (
        <div className="p-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50 text-red-600"><Trash2 className="h-4 w-4" /></div>
          <h2 className="mt-4 text-base font-semibold text-slate-900">Delete {company.name}?</h2>
          <p className="mt-1.5 text-xs leading-5 text-slate-500">This permanently removes the company and all associated data including <span className="font-semibold text-slate-800">{counts(company).screens} paired screens</span>, users, media, and licence records. This action cannot be undone.</p>
          <div className="mt-4 flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
            <CompanyLogo seed={company.code} name={company.name} size="sm" />
            <div><div className="text-sm font-semibold text-slate-900">{company.name}</div><div className="text-[11px] text-slate-400">{counts(company).screens} screens · {company.license?.screenLimit ?? 0} licensed</div></div>
          </div>
          {error && <Alert tone="red" className="mt-3">{error}</Alert>}
          <div className="mt-6 flex justify-end gap-2"><Button variant="secondary" onClick={onClose}>Cancel</Button><Button variant="danger" onClick={go} disabled={remove.isPending}>{remove.isPending ? "Deleting…" : "Delete Company"}</Button></div>
        </div>
      )}
    </Modal>
  );
}
