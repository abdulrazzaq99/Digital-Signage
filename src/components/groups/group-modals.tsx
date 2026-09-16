"use client";
import { Button } from "@/components/ui/button";
import { Badge, DotStatus } from "@/components/ui/badge";
import { Checkbox, Input, Label, SearchInput } from "@/components/ui/input";
import { Modal, ModalHeader } from "@/components/ui/modal";
import { SectionLabel } from "@/components/ui/card";
import { Alert } from "@/components/ui/misc";
import { TableSkeleton } from "@/components/ui/query-state";
import { useToast } from "@/components/ui/toast";
import { useCreateGroup, useDeleteGroup, useUpdateGroup } from "@/lib/api/hooks/groups";
import { screenStatusLabel, useScreens } from "@/lib/api/hooks/screens";
import type { ScreenGroup } from "@/lib/api/types";
import { label } from "@/lib/format";
import { AlertCircle, Trash2 } from "lucide-react";
import { useState } from "react";

/** Create a group, or edit one when `group` is given. Screens come from the company in `companyId`. */
export function CreateGroupModal({ open, onClose, companyId, group }: { open: boolean; onClose: () => void; companyId: string; group?: ScreenGroup }) {
  const toast = useToast();
  const screens = useScreens({ pageSize: 100 }, { companyId, enabled: open && !!companyId });
  const create = useCreateGroup(companyId);
  const update = useUpdateGroup(group?.id ?? "", companyId);
  const [name, setName] = useState(group?.name ?? "");
  const [description, setDescription] = useState(group?.description ?? "");
  const [sel, setSel] = useState<string[]>(group?.screenIds ?? []);
  const [q, setQ] = useState("");
  const pool = (screens.data?.data ?? []).filter((s) => s.name.toLowerCase().includes(q.toLowerCase()));
  const toggle = (id: string) => setSel((m) => (m.includes(id) ? m.filter((x) => x !== id) : [...m, id]));
  const valid = name.trim().length >= 2;
  const pending = create.isPending || update.isPending;
  const close = () => { onClose(); setTimeout(() => { if (!group) { setName(""); setDescription(""); setSel([]); } setQ(""); }, 200); };

  const submit = async () => {
    const body = { name: name.trim(), description: description.trim() || undefined, screenIds: sel };
    try {
      if (group) { await update.mutateAsync(body); toast.success("Group updated"); }
      else { await create.mutateAsync(body); toast.success("Group created", name.trim()); }
      close();
    } catch (e) { toast.error(e, group ? "Couldn't update group" : "Couldn't create group"); }
  };

  return (
    <Modal open={open} onClose={close} width="max-w-[600px]">
      <ModalHeader title={group ? "Edit Screen Group" : "Create Screen Group"} subtitle="Group multiple screens together for easier content management and publishing." onClose={close} />
      <form onSubmit={(e) => { e.preventDefault(); submit(); }}>
        <div className="space-y-5 px-6 py-5">
          <div className="space-y-4">
            <SectionLabel>Group Details</SectionLabel>
            <div><Label required>Group Name</Label><Input placeholder="e.g Main Lobby Display" value={name} onChange={(e) => setName(e.target.value)} /></div>
            <div><Label>Description</Label><Input placeholder="Optional" value={description} onChange={(e) => setDescription(e.target.value)} /></div>
          </div>
          <div className="space-y-3">
            <div><SectionLabel>Select Screens</SectionLabel><p className="mt-0.5 text-[11px] text-slate-400">Choose the screens to include in this group.</p></div>
            <SearchInput placeholder="Search screens..." value={q} onChange={(e) => setQ(e.target.value)} />
            <div className="rounded-lg border border-slate-200">
              <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400"><span className="flex items-center gap-3"><Checkbox checked={pool.length > 0 && pool.every((s) => sel.includes(s.id))} onChange={(v) => setSel(v ? [...new Set([...sel, ...pool.map((s) => s.id)])] : sel.filter((id) => !pool.some((s) => s.id === id)))} /> Screen</span><span>{pool.length} available</span></div>
              {screens.isPending ? <div className="p-3"><TableSkeleton rows={3} /></div> : (
                <ul className="max-h-[200px] divide-y divide-slate-100 overflow-y-auto">
                  {pool.map((s) => (
                    <li key={s.id} className="flex items-center gap-3 px-3 py-2.5">
                      <Checkbox checked={sel.includes(s.id)} onChange={() => toggle(s.id)} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">{s.name}{s.groups.filter((g) => g.id !== group?.id).map((g) => <Badge key={g.id} tone="blue">In: {g.name}</Badge>)}</div>
                        <div className="text-[11px] text-slate-400">{s.location ?? "—"} · {s.orientation === "LANDSCAPE" ? "↔" : "↕"} {label(s.orientation)}</div>
                      </div>
                      <div className="text-right"><DotStatus status={screenStatusLabel(s.status)} /><div className="text-[10px] text-slate-400">{s.assignment?.name ?? "No content"}</div></div>
                    </li>
                  ))}
                  {pool.length === 0 && <li className="px-3 py-6 text-center text-xs text-slate-400">No screens match.</li>}
                </ul>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between gap-3 border-t border-slate-100 px-6 py-4">
          <span className="text-[11px] text-slate-400">{sel.length} screen{sel.length === 1 ? "" : "s"} selected</span>
          <div className="flex gap-2"><Button type="button" variant="secondary" onClick={close}>Cancel</Button><Button type="submit" disabled={!valid || pending}>{pending ? "Saving…" : group ? "Save Changes" : "Create Group"}</Button></div>
        </div>
      </form>
    </Modal>
  );
}

export function DeleteGroupModal({ open, onClose, group, companyId, onDeleted }: { open: boolean; onClose: () => void; group: ScreenGroup; companyId: string; onDeleted?: () => void }) {
  const toast = useToast();
  const remove = useDeleteGroup(companyId);
  const doDelete = () => remove.mutate(group.id, { onSuccess: () => { toast.success("Group deleted", group.name); onClose(); onDeleted?.(); }, onError: (e) => toast.error(e) });
  return (
    <Modal open={open} onClose={onClose} width="max-w-[480px]">
      <div className="p-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50 text-red-600"><Trash2 className="h-4 w-4" /></div>
        <h2 className="mt-4 text-base font-semibold text-slate-900">Delete &quot;{group.name}&quot;?</h2>
        <p className="mt-1.5 text-xs leading-5 text-slate-500">All {group.screenCount} screens become ungrouped, but are not deleted.</p>
        <Alert tone="red" className="mt-4" icon={<AlertCircle className="h-3.5 w-3.5 shrink-0" />}><span className="font-semibold">This action cannot be undone.</span> Schedules targeting this group are removed.</Alert>
        <div className="mt-6 flex justify-end gap-2"><Button variant="secondary" onClick={onClose}>Cancel</Button><Button variant="danger" onClick={doDelete} disabled={remove.isPending}><Trash2 className="h-3.5 w-3.5" /> {remove.isPending ? "Deleting…" : "Delete Group"}</Button></div>
      </div>
    </Modal>
  );
}
