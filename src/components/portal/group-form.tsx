"use client";
import { Button } from "@/components/ui/button";
import { DotStatus } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { GROUP_DESCRIPTION_MAX, GROUP_NAME_MAX, groupDefaults, groupSchema, toCreateGroupBody, toUpdateGroupBody } from "@/components/groups/group-schema";
import { applyApiError, Field, fieldError, FormError, maskedRegister, SubmitButton, useZodForm } from "@/components/ui/form";
import { Checkbox, Input, Label } from "@/components/ui/input";
import { Modal, ModalFooter, ModalHeader } from "@/components/ui/modal";
import { QueryState, TableSkeleton } from "@/components/ui/query-state";
import { useToast } from "@/components/ui/toast";
import { useCreateGroup, useDeleteGroup, useGroup, useUpdateGroup } from "@/lib/api/hooks/groups";
import { screenStatusLabel, useScreens } from "@/lib/api/hooks/screens";
import type { Screen, ScreenGroup } from "@/lib/api/types";
import { timeAgo } from "@/lib/format";
import { maskName } from "@/lib/validation/masks";
import { cn } from "@/lib/utils";
import { Send, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { BackLinkButton } from "./portal-stepper";
import { ScreenThumb } from "./screens-page";

function ScreenRow({ screen, on, onToggle }: { screen: Screen; on: boolean; onToggle: () => void }) {
  return (
    <li>
      <div role="button" tabIndex={0} onClick={onToggle} onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onToggle()} className={cn("flex w-full cursor-pointer items-center gap-3 rounded-lg border px-3 py-2 text-left transition-colors", on ? "border-blue-300 bg-blue-50/40" : "border-slate-200 hover:bg-slate-50")}>
        <Checkbox checked={on} />
        <ScreenThumb screen={screen} className="h-8 w-11" />
        <span className="min-w-0 flex-1"><span className="block truncate text-xs font-semibold text-slate-900">{screen.name}</span><span className="block truncate text-[10px] text-slate-400">{screen.location ?? "—"}</span></span>
        <DotStatus status={screenStatusLabel(screen.status)} />
      </div>
    </li>
  );
}

function Form({ group, companyId, basePath }: { group?: ScreenGroup; companyId?: string | null; basePath: string }) {
  const router = useRouter();
  const toast = useToast();
  const screens = useScreens({ pageSize: 100 }, { companyId });
  const create = useCreateGroup(companyId);
  const update = useUpdateGroup(group?.id ?? "", companyId);
  const remove = useDeleteGroup(companyId);
  const form = useZodForm(groupSchema, { defaultValues: groupDefaults(group) });
  const [sel, setSel] = useState<string[]>(group?.screenIds ?? []);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const toggle = (id: string) => setSel((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  const members = (screens.data?.data ?? []).filter((s) => sel.includes(s.id));
  const listHref = `${basePath}?tab=groups`;

  const save = form.handleSubmit(async (v) => {
    try {
      if (group) { await update.mutateAsync(toUpdateGroupBody(group, v, sel)); toast.success("Group updated"); }
      else { await create.mutateAsync(toCreateGroupBody(v, sel)); toast.success("Group created"); }
      router.push(listHref);
    } catch (e) { applyApiError(form, e, { screenIds: "root.server" }); }
  });
  // mutateAsync, not mutate callbacks: the refetch of the deleted group fails and unmounts this form before per-call callbacks run.
  const doDelete = async () => {
    if (!group || remove.isPending) return;
    try { await remove.mutateAsync(group.id); toast.success("Group deleted"); router.replace(listHref); } catch (e) { toast.error(e); }
  };

  return (
    <div className="space-y-4">
      <BackLinkButton label="Screen Groups" onClick={() => router.push(listHref)} />
      <div className="grid gap-5 xl:grid-cols-[1fr_1fr]">
        <div className="space-y-5">
          <Card>
            <div className="border-b border-slate-100 px-5 py-3 text-sm font-semibold text-slate-900">{group ? group.name : "Create Group"}</div>
            <form onSubmit={save} noValidate className="space-y-4 px-5 py-4">
              <FormError form={form} />
              <Field label="Group Name" required error={fieldError(form, "name")}><Input placeholder="Lobby" maxLength={GROUP_NAME_MAX} {...maskedRegister(form, "name", maskName)} /></Field>
              <Field label={<>Description <span className="font-normal text-slate-400">(optional)</span></>} hint={`Up to ${GROUP_DESCRIPTION_MAX} characters`} error={fieldError(form, "description")}><Input placeholder="Brief description of this group" maxLength={GROUP_DESCRIPTION_MAX} {...form.register("description")} /></Field>
              <div>
                <Label>Member Screens</Label>
                <QueryState query={screens} skeleton={<TableSkeleton rows={4} />}>
                  {({ data }) => data.length ? <ul className="space-y-1.5">{data.map((s) => <ScreenRow key={s.id} screen={s} on={sel.includes(s.id)} onToggle={() => toggle(s.id)} />)}</ul> : <p className="text-xs text-slate-400">No screens paired yet.</p>}
                </QueryState>
              </div>
              <div className="flex flex-wrap gap-2">
                <SubmitButton form={form}>{group ? "Save Changes" : "Create Group"}</SubmitButton>
                {group && group.screenIds[0] && <Button variant="secondary" href={`${basePath}/${group.screenIds[0]}/publish?group=${group.id}`}><Send className="h-3.5 w-3.5" /> Publish to Group</Button>}
                {group && <Button type="button" variant="danger-outline" onClick={() => setConfirmDelete(true)} disabled={remove.isPending}><Trash2 className="h-3.5 w-3.5" /> Delete</Button>}
              </div>
            </form>
          </Card>
        </div>
        {group && (
          <Card className="self-start">
            <div className="border-b border-slate-100 px-5 py-3 text-sm font-semibold text-slate-900">Member Status</div>
            <ul className="divide-y divide-slate-100">
              {members.map((s) => (
                <li key={s.id} className="flex items-center gap-3 px-5 py-2.5">
                  <ScreenThumb screen={s} className="h-8 w-11" />
                  <span className="min-w-0 flex-1"><span className="block truncate text-xs font-semibold text-slate-900">{s.name}</span><span className="block text-[10px] text-slate-400">{s.assignment?.name ?? "Nothing assigned"} · seen {timeAgo(s.lastSeenAt)}</span></span>
                  <DotStatus status={screenStatusLabel(s.status)} />
                </li>
              ))}
              {members.length === 0 && <li className="px-5 py-6 text-center text-xs text-slate-400">No screens selected.</li>}
            </ul>
          </Card>
        )}
      </div>

      <Modal open={confirmDelete} onClose={() => !remove.isPending && setConfirmDelete(false)} width="max-w-md">
        <ModalHeader title="Delete this group?" subtitle="Screens stay paired; only the grouping is removed." onClose={() => setConfirmDelete(false)} />
        <ModalFooter>
          <Button variant="secondary" onClick={() => setConfirmDelete(false)}>Cancel</Button>
          <Button variant="danger" onClick={doDelete} disabled={remove.isPending}>{remove.isPending ? "Deleting…" : "Delete Group"}</Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}

/** Create (no `id`) or edit an existing group. */
export function GroupForm({ id, companyId, basePath = "/portal/screens" }: { id?: string; companyId?: string | null; basePath?: string }) {
  const group = useGroup(id ?? "", { companyId, enabled: !!id });
  if (!id) return <Form companyId={companyId} basePath={basePath} />;
  return <QueryState query={group}>{(g) => <Form key={g.id} group={g} companyId={companyId} basePath={basePath} />}</QueryState>;
}
