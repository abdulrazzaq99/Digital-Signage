"use client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { CompanyLogo } from "@/components/ui/misc";
import type { Company } from "@/lib/data";
import { AlertCircle, FileBadge, Minus, Plus } from "lucide-react";
import { useState } from "react";

export function EditLimitModal({ company, onClose }: { company: Company | null; onClose: () => void }) {
  return (
    <Modal open={!!company} onClose={onClose} width="max-w-[410px]">
      {company && <EditLimitForm key={company.id} company={company} onClose={onClose} />}
    </Modal>
  );
}

function EditLimitForm({ company, onClose }: { company: Company; onClose: () => void }) {
  const [limit, setLimit] = useState(company.screenLimit + 6);
  const diff = limit - company.screenLimit;
  return (
    <>
      {(
        <form onSubmit={(e) => { e.preventDefault(); onClose(); }} className="p-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600"><FileBadge className="h-4 w-4" /></div>
          <h2 className="mt-4 text-base font-semibold text-slate-900">Edit Screen Limit</h2>
          <p className="mt-1 text-xs text-slate-500">Update the maximum number of screens allowed for <span className="font-semibold text-slate-800">{company.name}</span>.</p>
          <div className="mt-4 flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
            <div className="flex items-center gap-3">
              <CompanyLogo seed={company.seed} size="sm" />
              <div><div className="text-sm font-semibold text-slate-900">{company.name}</div><div className="text-[11px] text-slate-400">Currently using {company.screensUsed} of {company.screenLimit} screens</div></div>
            </div>
            <Badge tone="green" dot>{company.license}</Badge>
          </div>
          <div className="mt-5">
            <Label>New Screen Limit</Label>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => setLimit((v) => Math.max(company.screensUsed, v - 1))} className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50"><Minus className="h-4 w-4" /></button>
              <input type="number" value={limit} onChange={(e) => setLimit(Number(e.target.value))} className="h-10 flex-1 rounded-lg border border-slate-200 text-center text-base font-semibold text-slate-900 outline-none focus:border-blue-500" />
              <button type="button" onClick={() => setLimit((v) => v + 1)} className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50"><Plus className="h-4 w-4" /></button>
            </div>
            {diff !== 0 && <p className={`mt-2 text-xs font-medium ${diff > 0 ? "text-green-600" : "text-red-600"}`}>{diff > 0 ? `+${diff} screens will be added` : `${diff} screens will be removed`}</p>}
          </div>
          <div className="mt-6 flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      )}
    </>
  );
}

export function SuspendLicenseModal({ company, onClose }: { company: Company | null; onClose: () => void }) {
  return (
    <Modal open={!!company} onClose={onClose} width="max-w-[400px]">
      {company && (
        <div className="p-6">
          <div className="flex gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-50 text-amber-600"><AlertCircle className="h-4 w-4" /></div>
            <div><h2 className="text-base font-semibold text-slate-900">Suspend License?</h2><p className="mt-1 text-xs text-slate-500">Temporarily pause this license. Screens will go offline.</p></div>
          </div>
          <div className="mt-4 flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
            <CompanyLogo seed={company.seed} size="sm" />
            <div><div className="text-sm font-semibold text-slate-900">{company.name}</div><div className="text-[11px] text-slate-400">{company.screensUsed} paired · {company.screenLimit} licensed</div></div>
          </div>
          <div className="mt-6 flex justify-end gap-2">
            <Button variant="secondary" onClick={onClose}>Cancel</Button>
            <Button className="bg-amber-700 hover:bg-amber-800" onClick={onClose}>Suspend</Button>
          </div>
        </div>
      )}
    </Modal>
  );
}

export function DisableLicenseModal({ company, onClose }: { company: Company | null; onClose: () => void }) {
  return (
    <Modal open={!!company} onClose={onClose} width="max-w-[400px]">
      {company && (
        <div className="p-6">
          <div className="flex gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500"><AlertCircle className="h-4 w-4" /></div>
            <div><h2 className="text-base font-semibold text-slate-900">Disable License?</h2><p className="mt-1 text-xs text-slate-500">Disable the license entirely.</p></div>
          </div>
          <div className="mt-4 flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
            <CompanyLogo seed={company.seed} size="sm" />
            <div><div className="text-sm font-semibold text-slate-900">{company.name}</div><div className="text-[11px] text-slate-400">{company.screensUsed} paired · {company.screenLimit} licensed</div></div>
          </div>
          <div className="mt-6 flex justify-end gap-2">
            <Button variant="secondary" onClick={onClose}>Cancel</Button>
            <Button className="bg-slate-500 hover:bg-slate-600" onClick={onClose}>Disable</Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
