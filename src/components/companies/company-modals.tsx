"use client";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { Modal, ModalFooter, ModalHeader } from "@/components/ui/modal";
import { SectionLabel } from "@/components/ui/card";
import { CompanyLogo } from "@/components/ui/misc";
import type { Company } from "@/lib/data";
import { Trash2 } from "lucide-react";

export function CompanyFormModal({ open, onClose, company }: { open: boolean; onClose: () => void; company?: Company | null }) {
  const editing = !!company;
  return (
    <Modal open={open} onClose={onClose} width="max-w-[540px]">
      <ModalHeader title={editing ? "Edit company" : "Create company"} subtitle={editing ? "Update company details and its screen license." : "Set up a customer company and configure its screen license."} onClose={onClose} />
      <form onSubmit={(e) => { e.preventDefault(); onClose(); }}>
        <div className="space-y-6 px-6 py-6">
          <div className="space-y-4">
            <SectionLabel>Company Information</SectionLabel>
            <div>
              <Label required>Company Name</Label>
              <Input placeholder="e.g. Acme Retail" defaultValue={company?.name} />
            </div>
            <div>
              <Label>Company Status</Label>
              <Select defaultValue={company?.status ?? "Active"}>
                <option>Active</option><option>Inactive</option><option>Suspended</option>
              </Select>
            </div>
          </div>
          <div className="space-y-4">
            <SectionLabel>License Configuration</SectionLabel>
            <div>
              <Label required>Maximum Screens</Label>
              <Input type="number" defaultValue={company?.screenLimit ?? 10} min={1} />
            </div>
            <div>
              <Label>License Status</Label>
              <Select defaultValue={company?.license ?? "Suspended"}>
                <option>Active</option><option>Suspended</option><option>Disabled</option><option>Expired</option>
              </Select>
            </div>
          </div>
        </div>
        <ModalFooter>
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit">{editing ? "Save Changes" : "Create Company"}</Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}

export function DeleteCompanyModal({ company, onClose }: { company: Company | null; onClose: () => void }) {
  return (
    <Modal open={!!company} onClose={onClose} width="max-w-[550px]">
      {company && (
        <div className="p-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50 text-red-600"><Trash2 className="h-4 w-4" /></div>
          <h2 className="mt-4 text-base font-semibold text-slate-900">Delete {company.name}?</h2>
          <p className="mt-1.5 text-xs leading-5 text-slate-500">
            This will permanently remove the company and all associated data including <span className="font-semibold text-slate-800">{company.screensUsed} paired screens</span> and license records. This action cannot be undone.
          </p>
          <div className="mt-4 flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
            <CompanyLogo seed={company.seed} size="sm" />
            <div>
              <div className="text-sm font-semibold text-slate-900">{company.name}</div>
              <div className="text-[11px] text-slate-400">{company.screensUsed} screens · {company.screenLimit} licensed</div>
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-2">
            <Button variant="secondary" onClick={onClose}>Cancel</Button>
            <Button variant="danger" onClick={onClose}>Delete Company</Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
