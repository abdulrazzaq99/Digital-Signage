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

function EditLimitForm({ company, onClose }: { company: Company; onClose: () => void }) {
  const toast = useToast();
  const update = useUpdateLicense();
  const current = company.license?.screenLimit ?? 0;
  const paired = counts(company).screens;
  const [limit, setLimit] = useState(current);
  const [error, setError] = useState("");
  const diff = limit - current;
  const save = () => update.mutate({ companyId: company.id, screenLimit: limit }, { onSuccess: (r) => { toast.success("Screen limit updated", r.overLimit ? `${r.screenLimit} screens — the account is now over its limit.` : `${r.screenLimit} screens`); onClose(); }, onError: (e) => setError(errorMessage(e)) });
  return (
    <form onSubmit={(e) => { e.preventDefault(); save(); }} className="p-6">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600"><FileBadge className="h-4 w-4" /></div>
      <h2 className="mt-4 text-base font-semibold text-slate-900">Edit Screen Limit</h2>
      <p className="mt-1 text-xs text-slate-500">Update the maximum number of screens allowed for <span className="font-semibold text-slate-800">{company.name}</span>.</p>
      <div className="mt-4 flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
        <div className="flex items-center gap-3"><CompanyLogo seed={company.code} name={company.name} size="sm" /><div><div className="text-sm font-semibold text-slate-900">{company.name}</div><div className="text-[11px] text-slate-400">Currently using {paired} of {current} screens</div></div></div>
        <Badge tone={company.license?.state === "ACTIVE" ? "green" : "amber"} dot>{label(company.license?.state ?? "DISABLED")}</Badge>
      </div>
      <div className="mt-5">
        <Label>New Screen Limit</Label>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => setLimit((v) => Math.max(1, v - 1))} className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50" aria-label="Decrease"><Minus className="h-4 w-4" /></button>
          <input type="number" min={1} value={limit} onChange={(e) => setLimit(Math.max(1, Number(e.target.value)))} className="h-10 flex-1 rounded-lg border border-slate-200 text-center text-base font-semibold text-slate-900 outline-none focus:border-blue-500" />
          <button type="button" onClick={() => setLimit((v) => v + 1)} className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50" aria-label="Increase"><Plus className="h-4 w-4" /></button>
        </div>
        {diff !== 0 && <p className={`mt-2 text-xs font-medium ${diff > 0 ? "text-green-600" : "text-red-600"}`}>{diff > 0 ? `+${diff} screens will be added` : `${diff} screens will be removed`}</p>}
        {limit < paired && <Alert tone="amber" className="mt-2">Below the {paired} screens already paired. Screens are not removed; the account is flagged over limit until it unpairs some.</Alert>}
      </div>
      {error && <Alert tone="red" className="mt-3">{error}</Alert>}
      <div className="mt-6 flex justify-end gap-2"><Button type="button" variant="secondary" onClick={onClose}>Cancel</Button><Button type="submit" disabled={update.isPending || diff === 0}>{update.isPending ? "Saving…" : "Save Changes"}</Button></div>
    </form>
  );
}

function StateModal({ company, onClose, state, title, body, tone, cta }: { company: Company | null; onClose: () => void; state: "SUSPENDED" | "DISABLED" | "ACTIVE"; title: string; body: string; tone: string; cta: string }) {
  const toast = useToast();
  const update = useUpdateLicense();
  const [error, setError] = useState("");
  const go = () => company && update.mutate({ companyId: company.id, state }, { onSuccess: () => { toast.success(`License ${label(state).toLowerCase()}`, company.name); onClose(); }, onError: (e) => setError(errorMessage(e)) });
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
          <div className="mt-6 flex justify-end gap-2"><Button variant="secondary" onClick={onClose}>Cancel</Button><Button className={tone} onClick={go} disabled={update.isPending}>{update.isPending ? "Saving…" : cta}</Button></div>
        </div>
      )}
    </Modal>
  );
}

export const SuspendLicenseModal = (p: { company: Company | null; onClose: () => void }) => <StateModal {...p} state="SUSPENDED" title="Suspend License?" body="Pauses publishing and pairing for this company. Screens keep their last content." tone="bg-amber-700 hover:bg-amber-800" cta="Suspend" />;
export const DisableLicenseModal = (p: { company: Company | null; onClose: () => void }) => <StateModal {...p} state="DISABLED" title="Disable License?" body="Disables the licence entirely; the company cannot use the platform until it is reactivated." tone="bg-slate-500 hover:bg-slate-600" cta="Disable" />;
export const ActivateLicenseModal = (p: { company: Company | null; onClose: () => void }) => <StateModal {...p} state="ACTIVE" title="Activate License?" body="Restores publishing and pairing within the screen limit." tone="bg-green-600 hover:bg-green-700" cta="Activate" />;
