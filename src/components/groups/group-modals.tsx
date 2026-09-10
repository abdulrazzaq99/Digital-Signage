"use client";
import { Button } from "@/components/ui/button";
import { Badge, DotStatus } from "@/components/ui/badge";
import { Checkbox, FilterSelect, Input, Label, SearchInput, Segmented, Select } from "@/components/ui/input";
import { Modal, ModalHeader } from "@/components/ui/modal";
import { SectionLabel } from "@/components/ui/card";
import { Alert } from "@/components/ui/misc";
import { companies, screens } from "@/lib/data";
import { AlertCircle, Trash2 } from "lucide-react";
import { useState } from "react";

export function CreateGroupModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [owner, setOwner] = useState<"personal" | "customer">("personal");
  const [name, setName] = useState("");
  const [sel, setSel] = useState<string[]>([]);
  const pool = screens.filter((s) => (owner === "personal" ? s.personal : !s.personal));
  const toggle = (id: string) => setSel((m) => (m.includes(id) ? m.filter((x) => x !== id) : [...m, id]));
  const valid = name.trim().length > 0 && sel.length > 0;
  const close = () => { onClose(); setTimeout(() => { setName(""); setSel([]); setOwner("personal"); }, 200); };

  return (
    <Modal open={open} onClose={close} width="max-w-[600px]">
      <ModalHeader title="Create Screen Group" subtitle="Group multiple screens together for easier content management and publishing." onClose={close} />
      <form onSubmit={(e) => { e.preventDefault(); close(); }}>
        <div className="space-y-5 px-6 py-5">
          <div className="space-y-4">
            <SectionLabel>Group Details</SectionLabel>
            <div><Label required>Group Name</Label><Input placeholder="e.g Main Lobby Display" value={name} onChange={(e) => setName(e.target.value)} /></div>
            <div><Label required>Owner</Label><Segmented options={[{ value: "personal", label: "Personal Screens" }, { value: "customer", label: "Customer Company" }]} value={owner} onChange={(v) => { setOwner(v); setSel([]); }} /></div>
            {owner === "customer" && <div className="animate-fade-in"><Label required>Company</Label><Select defaultValue="acme-retail">{companies.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</Select></div>}
          </div>
          <div className="space-y-3">
            <div><SectionLabel>Select Screens</SectionLabel><p className="mt-0.5 text-[11px] text-slate-400">Choose the screens you want to include in this group.</p></div>
            <div className="flex gap-2"><SearchInput placeholder="Search screens..." className="flex-1" /><FilterSelect label="All Statuses" /></div>
            <div className="rounded-lg border border-slate-200">
              <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400"><span className="flex items-center gap-3"><Checkbox checked={sel.length === pool.length && pool.length > 0} onChange={(v) => setSel(v ? pool.map((s) => s.id) : [])} /> Screen</span><span>{pool.length} available</span></div>
              <ul className="max-h-[200px] divide-y divide-slate-100 overflow-y-auto">
                {pool.map((s) => (
                  <li key={s.id} className="flex items-center gap-3 px-3 py-2.5">
                    <Checkbox checked={sel.includes(s.id)} onChange={() => toggle(s.id)} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">{s.name}{s.group && <Badge tone="blue">In: Main Lobby Displays</Badge>}</div>
                      <div className="text-[11px] text-slate-400">{s.location} · {s.orientation === "Landscape" ? "↔" : "↕"} {s.orientation}</div>
                    </div>
                    <div className="text-right"><DotStatus status={s.status} /><div className="text-[10px] text-slate-400">{s.content}</div></div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between gap-3 border-t border-slate-100 px-6 py-4">
          <span className="text-[11px] text-slate-400">Fill in group name, owner, and select at least one screen.</span>
          <div className="flex gap-2"><Button type="button" variant="secondary" onClick={close}>Cancel</Button><Button type="submit" disabled={!valid}>Create Group</Button></div>
        </div>
      </form>
    </Modal>
  );
}

export function DeleteGroupModal({ open, onClose, name, count }: { open: boolean; onClose: () => void; name: string; count: number }) {
  return (
    <Modal open={open} onClose={onClose} width="max-w-[480px]">
      <div className="p-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50 text-red-600"><Trash2 className="h-4 w-4" /></div>
        <h2 className="mt-4 text-base font-semibold text-slate-900">Delete &quot;{name}&quot;?</h2>
        <p className="mt-1.5 text-xs leading-5 text-slate-500">Delete this group? All {count} screens will become ungrouped, but won&apos;t be deleted.</p>
        <Alert tone="red" className="mt-4" icon={<AlertCircle className="h-3.5 w-3.5 shrink-0" />}><span className="font-semibold">This action cannot be undone.</span> Any scheduled content publishing for this group will also be cancelled.</Alert>
        <div className="mt-6 flex justify-end gap-2"><Button variant="secondary" onClick={onClose}>Cancel</Button><Button variant="danger" onClick={onClose}><Trash2 className="h-3.5 w-3.5" /> Delete Group</Button></div>
      </div>
    </Modal>
  );
}
