"use client";
import { Button } from "@/components/ui/button";
import { Badge, DotStatus } from "@/components/ui/badge";
import { applyApiError, Field, fieldError, FormError, maskedRegister, SubmitButton, useZodForm } from "@/components/ui/form";
import { Checkbox, Input, SearchInput } from "@/components/ui/input";
import { Modal, ModalHeader } from "@/components/ui/modal";
import { SectionLabel } from "@/components/ui/card";
import { Alert } from "@/components/ui/misc";
import { ErrorState, TableSkeleton } from "@/components/ui/query-state";
import { useToast } from "@/components/ui/toast";
import { useCreateGroup, useDeleteGroup, useUpdateGroup } from "@/lib/api/hooks/groups";
import { screenStatusLabel, useScreens } from "@/lib/api/hooks/screens";
import type { ScreenGroup } from "@/lib/api/types";
import { label } from "@/lib/format";
import { maskName } from "@/lib/validation/masks";
import { AlertCircle, Trash2 } from "lucide-react";
import { useState } from "react";
import { GROUP_DESCRIPTION_MAX, GROUP_NAME_MAX, groupDefaults, groupSchema, toCreateGroupBody, toUpdateGroupBody } from "./group-schema";

/** Create a group, or edit one when `group` is given. Screens come from the company in `companyId`. */
export function CreateGroupModal({ open, onClose, companyId, group }: { open: boolean; onClose: () => void; companyId: string; group?: ScreenGroup }) {
  const toast = useToast();
  const screens = useScreens({ pageSize: 100 }, { companyId, enabled: open && !!companyId });
  const create = useCreateGroup(companyId);
  const update = useUpdateGroup(group?.id ?? "", companyId);
  const form = useZodForm(groupSchema, { defaultValues: groupDefaults(group) });
  const [sel, setSel] = useState<string[]>(group?.screenIds ?? []);
  const [q, setQ] = useState("");
  const needle = q.trim().toLowerCase();
  const pool = (screens.data?.data ?? []).filter((s) => s.name.toLowerCase().includes(needle));
  const toggle = (id: string) => setSel((m) => (m.includes(id) ? m.filter((x) => x !== id) : [...m, id]));
  const finish = () => {
    onClose();
    setTimeout(() => { if (!group) { form.reset(groupDefaults()); setSel([]); } setQ(""); }, 200);
  };
  /** Cancel / Escape / backdrop: ignored while saving so a request in flight isn't abandoned. */
  const close = () => { if (!form.formState.isSubmitting) finish(); };

  const submit = form.handleSubmit(async (v) => {
    try {
      if (group) { await update.mutateAsync(toUpdateGroupBody(group, v, sel)); toast.success("Group updated"); }
      else { await create.mutateAsync(toCreateGroupBody(v, sel)); toast.success("Group created", v.name); }
      finish();
    } catch (e) { applyApiError(form, e, { screenIds: "root.server" }); }
  });

  return (
    <Modal open={open} onClose={close} width="max-w-[600px]">
      <ModalHeader title={group ? "Edit Screen Group" : "Create Screen Group"} subtitle="Group multiple screens together for easier content management and publishing." onClose={close} />
      <form onSubmit={submit} noValidate>
        <div className="space-y-5 px-6 py-5">
          <FormError form={form} />
          <div className="space-y-4">
            <SectionLabel>Group Details</SectionLabel>
            <Field label="Group Name" required error={fieldError(form, "name")}><Input placeholder="e.g Main Lobby Display" maxLength={GROUP_NAME_MAX} autoFocus {...maskedRegister(form, "name", maskName)} /></Field>
            <Field label="Description" hint={`Optional · up to ${GROUP_DESCRIPTION_MAX} characters`} error={fieldError(form, "description")}><Input placeholder="Optional" maxLength={GROUP_DESCRIPTION_MAX} {...form.register("description")} /></Field>
          </div>
          <div className="space-y-3">
            <div><SectionLabel>Select Screens</SectionLabel><p className="mt-0.5 text-[11px] text-slate-400">Choose the screens to include in this group.</p></div>
            <SearchInput placeholder="Search screens..." maxLength={120} value={q} onChange={(e) => setQ(e.target.value)} />
            <div className="rounded-lg border border-slate-200">
              <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400"><span className="flex items-center gap-3"><Checkbox checked={pool.length > 0 && pool.every((s) => sel.includes(s.id))} onChange={(v) => setSel(v ? [...new Set([...sel, ...pool.map((s) => s.id)])] : sel.filter((id) => !pool.some((s) => s.id === id)))} /> Screen</span><span>{screens.data ? `${pool.length} available` : ""}</span></div>
              {screens.isError ? <ErrorState error={screens.error} onRetry={() => screens.refetch()} className="m-3 p-4" /> : screens.isPending ? <div className="p-3"><TableSkeleton rows={3} /></div> : (
                <ul className="max-h-[200px] divide-y divide-slate-100 overflow-y-auto">
                  {pool.map((s) => (
                    <li key={s.id} className="flex items-center gap-3 px-3 py-2.5">
                      <Checkbox checked={sel.includes(s.id)} onChange={() => toggle(s.id)} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">{s.name}{(s.groups ?? []).filter((g) => g.id !== group?.id).map((g) => <Badge key={g.id} tone="blue">In: {g.name}</Badge>)}</div>
                        <div className="text-[11px] text-slate-400">{s.location ?? "—"} · {s.orientation === "LANDSCAPE" ? "↔" : "↕"} {label(s.orientation)}</div>
                      </div>
                      <div className="text-right"><DotStatus status={screenStatusLabel(s.status)} /><div className="text-[10px] text-slate-400">{s.assignment?.name ?? "No content"}</div></div>
                    </li>
                  ))}
                  {pool.length === 0 && <li className="px-3 py-6 text-center text-xs text-slate-400">{needle ? "No screens match." : "This company has no paired screens yet."}</li>}
                </ul>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between gap-3 border-t border-slate-100 px-6 py-4">
          <span className="text-[11px] text-slate-400">{sel.length} screen{sel.length === 1 ? "" : "s"} selected</span>
          <div className="flex gap-2"><Button type="button" variant="secondary" onClick={close} disabled={form.formState.isSubmitting}>Cancel</Button><SubmitButton form={form}>{group ? "Save Changes" : "Create Group"}</SubmitButton></div>
        </div>
      </form>
    </Modal>
  );
}

export function DeleteGroupModal({ open, onClose, group, companyId, onDeleted }: { open: boolean; onClose: () => void; group: ScreenGroup; companyId: string; onDeleted?: () => void }) {
  const toast = useToast();
  const remove = useDeleteGroup(companyId);
  // mutateAsync so navigation still happens when the detail page's refetch of the deleted group unmounts this modal.
  const doDelete = async () => {
    if (remove.isPending) return;
    try { await remove.mutateAsync(group.id); toast.success("Group deleted", group.name); onClose(); onDeleted?.(); } catch (e) { toast.error(e); }
  };
  return (
    <Modal open={open} onClose={() => !remove.isPending && onClose()} width="max-w-[480px]">
      <div className="p-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50 text-red-600"><Trash2 className="h-4 w-4" /></div>
        <h2 className="mt-4 text-base font-semibold text-slate-900">Delete &quot;{group.name}&quot;?</h2>
        <p className="mt-1.5 text-xs leading-5 text-slate-500">All {group.screenCount} screens become ungrouped, but are not deleted.</p>
        <Alert tone="red" className="mt-4" icon={<AlertCircle className="h-3.5 w-3.5 shrink-0" />}><span className="font-semibold">This action cannot be undone.</span> Schedules targeting this group are removed.</Alert>
        <div className="mt-6 flex justify-end gap-2"><Button variant="secondary" onClick={onClose} disabled={remove.isPending}>Cancel</Button><Button variant="danger" onClick={doDelete} disabled={remove.isPending}><Trash2 className="h-3.5 w-3.5" /> {remove.isPending ? "Deleting…" : "Delete Group"}</Button></div>
      </div>
    </Modal>
  );
}
