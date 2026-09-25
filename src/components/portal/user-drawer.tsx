"use client";
import { useAuth } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { applyApiError, Field, FormError, maskedRegister, SubmitButton, useZodForm } from "@/components/ui/form";
import { Checkbox, Input, PasswordInput, Select } from "@/components/ui/input";
import { Avatar, Drawer } from "@/components/ui/misc";
import { ErrorState, Skeleton } from "@/components/ui/query-state";
import { useToast } from "@/components/ui/toast";
import { COMPANY_ROLES, useCreateUser, useDeleteUser, useUpdateUser, useUsers } from "@/lib/api/hooks/users";
import type { User } from "@/lib/api/types";
import { formatDateTime, label, timeAgo } from "@/lib/format";
import { maskName, maskPhone } from "@/lib/validation/masks";
import { RefreshCw, Trash2, X } from "lucide-react";
import { useState } from "react";
import { Controller } from "react-hook-form";
import { createUserBody, updateUserBody, userDefaults, userSchema } from "./user-schema";

/** `user` is the row the drawer was opened from, so editing never depends on it being in the first page. */
export type UserDrawerState = { mode: "create" } | { mode: "edit"; id: string; user?: User } | null;

function Form({ user, companyId, onClose }: { user?: User; companyId?: string | null; onClose: () => void }) {
  const toast = useToast();
  const { user: me } = useAuth();
  const create = useCreateUser(companyId);
  const update = useUpdateUser(companyId);
  const remove = useDeleteUser(companyId);
  const isSelf = !!user && user.id === me?.id;
  const form = useZodForm(userSchema, { defaultValues: userDefaults(user) });
  const { register, formState } = form;
  const [confirmRemove, setConfirmRemove] = useState(false);
  const busy = formState.isSubmitting || remove.isPending;

  const submit = form.handleSubmit(async (v) => {
    try {
      if (user) {
        await update.mutateAsync({ id: user.id, ...updateUserBody(v, isSelf) });
        toast.success("User updated", v.name);
      } else {
        await create.mutateAsync(createUserBody(v));
        toast.success("User added", v.password ? `${v.email} can sign in now.` : `${v.email} is invited; set a password to activate.`);
      }
      onClose();
    } catch (e) {
      applyApiError(form, e);
    }
  });
  const doRemove = () => user && remove.mutate(user.id, { onSuccess: () => { toast.success("User removed", user.name); onClose(); }, onError: (e) => applyApiError(form, e) });

  return (
    <form onSubmit={submit} noValidate className="flex flex-1 flex-col">
      <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
        {isSelf && <div className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-[11px] text-blue-700">This is your own account. Role and status can only be changed by another admin.</div>}
        <FormError form={form} />
        <Field label="Full Name" required error={formState.errors.name?.message}>
          <Input placeholder="Full name" autoComplete="off" maxLength={120} {...maskedRegister(form, "name", maskName)} />
        </Field>
        <Field label="Email Address" required hint={user ? "Email addresses cannot be changed after invitation." : undefined} error={formState.errors.email?.message}>
          <Input type="email" inputMode="email" autoComplete="off" autoCapitalize="off" placeholder="name@company.com" maxLength={254} readOnly={!!user} tabIndex={user ? -1 : undefined} className={user ? "bg-slate-50 text-slate-400 focus:border-slate-200 focus:ring-0" : ""} {...register("email")} />
        </Field>
        <div>
          {/* A disabled registered control submits undefined, so your own role is shown in a separate, unregistered select. */}
          <Field label="Role" required error={formState.errors.role?.message}>
            {isSelf ? <Select disabled value={user?.role ?? ""} onChange={() => undefined}><option value={user?.role ?? ""}>{label(user?.role)}</option></Select> : <Select {...register("role")}>{COMPANY_ROLES.map((r) => <option key={r} value={r}>{label(r)}</option>)}</Select>}
          </Field>
          <p className="mt-1.5 text-[10px] leading-4 text-slate-400"><span className="font-semibold text-slate-600">Admin</span> — full access · <span className="font-semibold text-slate-600">Editor</span> — content and screens · <span className="font-semibold text-slate-600">Viewer</span> — read only</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Job Title" error={formState.errors.title?.message}><Input autoComplete="off" maxLength={80} {...register("title")} /></Field>
          <Field label="Phone" error={formState.errors.phone?.message}><Input type="tel" inputMode="tel" autoComplete="off" placeholder="+44 20 7946 0000" maxLength={20} {...maskedRegister(form, "phone", maskPhone)} /></Field>
        </div>
        {!user && (
          <Field label={<>Temporary password <span className="font-normal text-slate-400">(optional)</span></>} hint="Leave blank to create the user as invited. Otherwise 8–128 characters with a letter and a number." error={formState.errors.password?.message}>
            <PasswordInput autoComplete="new-password" maxLength={128} placeholder="At least 8 characters" {...register("password")} />
          </Field>
        )}
        {user && !isSelf && (
          <label className="flex items-center gap-2 text-xs text-slate-700">
            <Controller control={form.control} name="isActive" render={({ field }) => <Checkbox checked={field.value} onChange={field.onChange} />} /> Account active {user.status === "INVITED" && <Badge tone="blue">Invited</Badge>}
          </label>
        )}
        {user && <dl className="grid grid-cols-2 gap-3 rounded-lg border border-slate-100 bg-slate-50/60 px-3 py-2 text-[11px]"><div><dt className="text-slate-400">Status</dt><dd className="font-semibold text-slate-800">{label(user.status)}</dd></div><div><dt className="text-slate-400">Last login</dt><dd className="font-semibold text-slate-800" title={user.lastLoginAt ? formatDateTime(user.lastLoginAt) : undefined}>{timeAgo(user.lastLoginAt)}</dd></div></dl>}
        {user && !isSelf && (confirmRemove ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-3"><p className="text-xs text-red-700"><span className="font-semibold">{user.name}</span> loses access immediately. Continue?</p><div className="mt-2 flex gap-2"><Button type="button" variant="danger" size="sm" onClick={doRemove} disabled={busy}>{remove.isPending ? "Removing…" : "Remove User"}</Button><Button type="button" variant="secondary" size="sm" disabled={remove.isPending} onClick={() => setConfirmRemove(false)}>Cancel</Button></div></div>
        ) : (
          <button type="button" onClick={() => setConfirmRemove(true)} disabled={busy} className="flex items-center gap-1.5 text-xs font-medium text-red-600 hover:underline disabled:opacity-50"><Trash2 className="h-3.5 w-3.5" /> Remove this user</button>
        ))}
      </div>
      <div className="flex gap-2 border-t border-slate-100 px-5 py-4"><SubmitButton form={form} className="flex-1" disabled={remove.isPending}>{user ? "Save Changes" : "Add User"}</SubmitButton><Button type="button" variant="secondary" onClick={onClose}>Cancel</Button></div>
    </form>
  );
}

/** Create/edit drawer shared by the portal Account page and the admin company detail. */
export function UserDrawer({ state, companyId, onClose }: { state: UserDrawerState; companyId?: string | null; onClose: () => void }) {
  const passed = state?.mode === "edit" ? state.user : undefined;
  // There is no GET /users/:id, so look the user up in the list only when the opener didn't pass the row.
  const users = useUsers({ pageSize: 100 }, { companyId, enabled: state?.mode === "edit" && !passed });
  const user = state?.mode === "edit" ? (passed ?? users.data?.data?.find((u) => u.id === state.id)) : undefined;
  return (
    <Drawer open={state !== null} onClose={onClose}>
      <div className="flex items-start justify-between border-b border-slate-100 px-5 py-4">
        {state?.mode === "edit" && user ? <div className="flex items-center gap-3"><Avatar name={user.name} size="md" /><div><div className="text-sm font-semibold text-slate-900">{user.name}</div><div className="text-[11px] text-slate-400">{user.email}</div></div></div> : <div className="text-sm font-semibold text-slate-900">{state?.mode === "edit" ? "Edit User" : "Add User"}</div>}
        <button type="button" onClick={onClose} className="flex h-6 w-6 items-center justify-center rounded-md border border-slate-200 text-slate-400 hover:bg-slate-50" aria-label="Close"><X className="h-3.5 w-3.5" /></button>
      </div>
      {state?.mode === "create" && <Form key="create" companyId={companyId} onClose={onClose} />}
      {state?.mode === "edit" && (user ? (
        <Form key={user.id} user={user} companyId={companyId} onClose={onClose} />
      ) : users.isError ? (
        <div className="p-5"><ErrorState error={users.error} onRetry={() => users.refetch()} /></div>
      ) : users.isPending ? (
        <div className="space-y-3 p-5"><Skeleton className="h-10" /><Skeleton className="h-10" /><Skeleton className="h-10" /></div>
      ) : (
        <div className="p-5 text-center">
          <p className="text-sm font-semibold text-slate-900">User not found</p>
          <p className="mt-1 text-xs text-slate-500">This user may have been removed.</p>
          <Button type="button" variant="secondary" size="sm" className="mt-3" onClick={() => users.refetch()}><RefreshCw className="h-3.5 w-3.5" /> Try again</Button>
        </div>
      ))}
    </Drawer>
  );
}
