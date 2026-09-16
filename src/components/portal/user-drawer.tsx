"use client";
import { useAuth } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox, Input, Label, Select } from "@/components/ui/input";
import { Alert, Avatar, Drawer } from "@/components/ui/misc";
import { useToast } from "@/components/ui/toast";
import { COMPANY_ROLES, useCreateUser, useDeleteUser, useUpdateUser, useUsers } from "@/lib/api/hooks/users";
import type { User } from "@/lib/api/types";
import { errorMessage, formatDateTime, label, timeAgo } from "@/lib/format";
import { Trash2, X } from "lucide-react";
import { useState } from "react";

export type UserDrawerState = { mode: "create" } | { mode: "edit"; id: string } | null;

function Form({ user, companyId, onClose }: { user?: User; companyId?: string | null; onClose: () => void }) {
  const toast = useToast();
  const { user: me } = useAuth();
  const create = useCreateUser(companyId);
  const update = useUpdateUser(companyId);
  const remove = useDeleteUser(companyId);
  const isSelf = !!user && user.id === me?.id;
  const [f, setF] = useState({ name: user?.name ?? "", email: user?.email ?? "", role: (user?.role ?? "EDITOR") as NonNullable<User["role"]>, title: user?.title ?? "", phone: user?.phone ?? "", password: "", isActive: user ? user.status !== "SUSPENDED" : true });
  const [error, setError] = useState("");
  const [confirmRemove, setConfirmRemove] = useState(false);
  const pending = create.isPending || update.isPending || remove.isPending;

  const submit = async () => {
    setError("");
    try {
      if (user) { await update.mutateAsync({ id: user.id, name: f.name.trim(), role: f.role, title: f.title.trim() || null, phone: f.phone.trim() || null, isActive: f.isActive }); toast.success("User updated", f.name.trim()); }
      else { await create.mutateAsync({ email: f.email.trim(), name: f.name.trim(), role: f.role, title: f.title.trim() || undefined, phone: f.phone.trim() || undefined, password: f.password || undefined }); toast.success("User added", f.password ? `${f.email.trim()} can sign in now.` : `${f.email.trim()} is invited; set a password to activate.`); }
      onClose();
    } catch (e) { setError(errorMessage(e)); }
  };
  const doRemove = () => user && remove.mutate(user.id, { onSuccess: () => { toast.success("User removed", user.name); onClose(); }, onError: (e) => setError(errorMessage(e)) });

  return (
    <form onSubmit={(e) => { e.preventDefault(); submit(); }} className="flex flex-1 flex-col">
      <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
        {isSelf && <div className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-[11px] text-blue-700">This is your own account. Role and status can only be changed by another admin.</div>}
        <div><Label required>Full Name</Label><Input placeholder="Full name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} minLength={2} required /></div>
        <div><Label required>Email Address</Label><Input type="email" placeholder="name@company.com" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} disabled={!!user} className={user ? "bg-slate-50 text-slate-400" : ""} required />{user && <p className="mt-1 text-[10px] text-slate-400">Email addresses cannot be changed after invitation.</p>}</div>
        <div><Label>Role</Label><Select value={f.role} onChange={(e) => setF({ ...f, role: e.target.value as NonNullable<User["role"]> })} disabled={isSelf}>{COMPANY_ROLES.map((r) => <option key={r} value={r}>{label(r)}</option>)}</Select><p className="mt-1.5 text-[10px] leading-4 text-slate-400"><span className="font-semibold text-slate-600">Admin</span> — full access · <span className="font-semibold text-slate-600">Editor</span> — content and screens · <span className="font-semibold text-slate-600">Viewer</span> — read only</p></div>
        <div className="grid grid-cols-2 gap-3"><div><Label>Job Title</Label><Input value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} /></div><div><Label>Phone</Label><Input value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} /></div></div>
        {!user && <div><Label>Temporary password <span className="font-normal text-slate-400">(optional)</span></Label><Input type="password" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} minLength={8} placeholder="At least 8 characters" /><p className="mt-1 text-[10px] text-slate-400">Leave blank to create the user as invited.</p></div>}
        {user && !isSelf && <label className="flex items-center gap-2 text-xs text-slate-700"><Checkbox checked={f.isActive} onChange={(v) => setF({ ...f, isActive: v })} /> Account active {user.status === "INVITED" && <Badge tone="blue">Invited</Badge>}</label>}
        {user && <dl className="grid grid-cols-2 gap-3 rounded-lg border border-slate-100 bg-slate-50/60 px-3 py-2 text-[11px]"><div><dt className="text-slate-400">Status</dt><dd className="font-semibold text-slate-800">{label(user.status)}</dd></div><div><dt className="text-slate-400">Last login</dt><dd className="font-semibold text-slate-800" title={user.lastLoginAt ? formatDateTime(user.lastLoginAt) : undefined}>{timeAgo(user.lastLoginAt)}</dd></div></dl>}
        {error && <Alert tone="red">{error}</Alert>}
        {user && !isSelf && (confirmRemove ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-3"><p className="text-xs text-red-700"><span className="font-semibold">{user.name}</span> loses access immediately. Continue?</p><div className="mt-2 flex gap-2"><Button type="button" variant="danger" size="sm" onClick={doRemove} disabled={pending}>{remove.isPending ? "Removing…" : "Remove User"}</Button><Button type="button" variant="secondary" size="sm" onClick={() => setConfirmRemove(false)}>Cancel</Button></div></div>
        ) : (
          <button type="button" onClick={() => setConfirmRemove(true)} className="flex items-center gap-1.5 text-xs font-medium text-red-600 hover:underline"><Trash2 className="h-3.5 w-3.5" /> Remove this user</button>
        ))}
      </div>
      <div className="flex gap-2 border-t border-slate-100 px-5 py-4"><Button type="submit" className="flex-1" disabled={pending || f.name.trim().length < 2 || !f.email.trim()}>{pending ? "Saving…" : user ? "Save Changes" : "Add User"}</Button><Button type="button" variant="secondary" onClick={onClose}>Cancel</Button></div>
    </form>
  );
}

/** Create/edit drawer shared by the portal Account page and the admin company detail. */
export function UserDrawer({ state, companyId, onClose }: { state: UserDrawerState; companyId?: string | null; onClose: () => void }) {
  const users = useUsers({ pageSize: 100 }, { companyId, enabled: state?.mode === "edit" });
  const user = state?.mode === "edit" ? users.data?.data.find((u) => u.id === state.id) : undefined;
  return (
    <Drawer open={state !== null} onClose={onClose}>
      <div className="flex items-start justify-between border-b border-slate-100 px-5 py-4">
        {state?.mode === "edit" && user ? <div className="flex items-center gap-3"><Avatar name={user.name} size="md" /><div><div className="text-sm font-semibold text-slate-900">{user.name}</div><div className="text-[11px] text-slate-400">{user.email}</div></div></div> : <div className="text-sm font-semibold text-slate-900">{state?.mode === "edit" ? "Edit User" : "Add User"}</div>}
        <button onClick={onClose} className="flex h-6 w-6 items-center justify-center rounded-md border border-slate-200 text-slate-400 hover:bg-slate-50" aria-label="Close"><X className="h-3.5 w-3.5" /></button>
      </div>
      {state?.mode === "create" && <Form key="create" companyId={companyId} onClose={onClose} />}
      {state?.mode === "edit" && (user ? <Form key={user.id} user={user} companyId={companyId} onClose={onClose} /> : <div className="p-5 text-xs text-slate-400">Loading…</div>)}
    </Drawer>
  );
}
