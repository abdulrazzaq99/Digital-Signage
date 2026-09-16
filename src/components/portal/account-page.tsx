"use client";
import { useAuth } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { Alert, Avatar } from "@/components/ui/misc";
import { EmptyState, QueryState, Skeleton } from "@/components/ui/query-state";
import { TD, TH, THead, TR, Table } from "@/components/ui/table";
import { useToast } from "@/components/ui/toast";
import { useChangePassword, useUpdateProfile } from "@/lib/api/hooks/auth";
import { useCompany } from "@/lib/api/hooks/companies";
import { useLicense } from "@/lib/api/hooks/licenses";
import { useUsers } from "@/lib/api/hooks/users";
import type { User } from "@/lib/api/types";
import { errorMessage, formatDate, label, roleLabel, timeAgo } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Pencil, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { UserDrawer, type UserDrawerState } from "./user-drawer";

type Tab = "profile" | "company" | "users";
const roleTone = (r: User["role"]) => (r === "ADMIN" ? "purple" : r === "EDITOR" ? "blue" : "slate");
const statusTone = (s: User["status"]) => (s === "ACTIVE" ? "green" : s === "INVITED" ? "blue" : "slate");

function ProfileTab() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const update = useUpdateProfile();
  const changePw = useChangePassword();
  const [f, setF] = useState({ name: user?.name ?? "", title: user?.title ?? "", phone: user?.phone ?? "" });
  const [changingPw, setChangingPw] = useState(false);
  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });
  const [pwError, setPwError] = useState("");
  const save = () => update.mutate({ name: f.name.trim(), title: f.title.trim() || null, phone: f.phone.trim() || null }, { onSuccess: () => toast.success("Profile updated"), onError: (e) => toast.error(e) });
  const savePw = () => {
    setPwError("");
    if (pw.next !== pw.confirm) { setPwError("New passwords do not match."); return; }
    changePw.mutate({ currentPassword: pw.current, newPassword: pw.next }, { onSuccess: async () => { toast.success("Password updated", "Please sign in again with your new password."); await logout(); router.replace("/login"); }, onError: (e) => setPwError(errorMessage(e)) });
  };
  if (!user) return null;
  return (
    <div className="max-w-[520px] space-y-6 animate-fade-in">
      <div className="flex items-center gap-4"><Avatar name={user.name} size="lg" /><div><div className="text-sm font-semibold text-slate-900">{user.name}</div><div className="text-[11px] text-slate-400">{roleLabel(user)} · {user.email}</div></div></div>
      <form onSubmit={(e) => { e.preventDefault(); save(); }} className="space-y-4 border-t border-slate-100 pt-5">
        <div className="text-sm font-semibold text-slate-900">Personal Information</div>
        <div><Label required>Full Name</Label><Input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} minLength={2} required /></div>
        <div><Label>Email Address</Label><Input value={user.email} disabled className="bg-slate-50 text-slate-400" /><p className="mt-1 text-[10px] text-slate-400">Contact your account manager to change your email address.</p></div>
        <div><Label>Job Title</Label><Input value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} /></div>
        <div><Label>Phone Number</Label><Input value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} /></div>
        <Button type="submit" size="sm" disabled={update.isPending}>{update.isPending ? "Saving…" : "Save Changes"}</Button>
      </form>
      <div className="border-t border-slate-100 pt-5">
        <div className="flex items-center justify-between"><div><div className="text-sm font-semibold text-slate-900">Security</div><div className="text-[11px] text-slate-400">Update your password. All sessions are signed out afterwards.</div></div><Button variant="secondary" size="sm" onClick={() => setChangingPw((v) => !v)}>{changingPw ? "Cancel" : "Change Password"}</Button></div>
        {changingPw && (
          <form onSubmit={(e) => { e.preventDefault(); savePw(); }} className="mt-4 space-y-4 animate-fade-in">
            <div><Label required>Current Password</Label><Input type="password" value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} required /></div>
            <div><Label required>New Password</Label><Input type="password" value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} minLength={8} required /><p className="mt-1 text-[10px] text-slate-400">Minimum 8 characters.</p></div>
            <div><Label required>Confirm New Password</Label><Input type="password" value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} required /></div>
            {pwError && <Alert tone="red">{pwError}</Alert>}
            <Button type="submit" size="sm" disabled={changePw.isPending}>{changePw.isPending ? "Updating…" : "Update Password"}</Button>
          </form>
        )}
      </div>
    </div>
  );
}

function CompanyTab({ companyId }: { companyId: string }) {
  const company = useCompany(companyId);
  const license = useLicense(companyId);
  return (
    <QueryState query={company} skeleton={<Skeleton className="h-64 max-w-[520px]" />}>
      {(c) => (
        <div className="max-w-[520px] space-y-6 animate-fade-in">
          <div><div className="text-sm font-semibold text-slate-900">Company Information</div><div className="text-[11px] text-slate-400">Managed by the platform team. Contact support to request changes.</div></div>
          <dl className="grid grid-cols-2 gap-4 text-xs">{([["Company Name", c.name], ["Website", c.website || "—"], ["Industry", c.industry || "—"], ["Phone", c.phone || "—"], ["Timezone", c.timezone]] as [string, string][]).map(([k, v]) => <div key={k}><dt className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">{k}</dt><dd className="mt-0.5 font-medium text-slate-800">{v}</dd></div>)}</dl>
          <div className="border-t border-slate-100 pt-5">
            <div className="text-sm font-semibold text-slate-900">Account Details</div>
            <dl className="mt-4 grid grid-cols-2 gap-4 text-xs">{([["Account ID", c.code], ["Plan", c.plan || "—"], ["Customer Since", formatDate(c.createdAt)], ["Account Status", label(c.status)], ["Licence", license.data ? `${label(license.data.state)} · ${license.data.paired} of ${license.data.screenLimit} screens` : "…"], ["Licence Expiry", license.data?.expiresAt ? formatDate(license.data.expiresAt) : "No expiry"]] as [string, string][]).map(([k, v]) => <div key={k}><dt className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">{k}</dt><dd className="mt-0.5 font-medium text-slate-800">{v}</dd></div>)}</dl>
            {license.data?.overLimit && <Alert tone="amber" className="mt-4">More screens are paired than your licence allows. Pairing is blocked until the limit is raised.</Alert>}
          </div>
        </div>
      )}
    </QueryState>
  );
}

function UsersTab() {
  const { user: me } = useAuth();
  const users = useUsers({ pageSize: 100 });
  const [drawer, setDrawer] = useState<UserDrawerState>(null);
  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-3"><span className="text-xs text-slate-400">{users.data?.meta?.total ?? users.data?.data.length ?? 0} users</span><Button size="sm" onClick={() => setDrawer({ mode: "create" })}><Plus className="h-3.5 w-3.5" /> Add User</Button></div>
      <QueryState query={users} empty={<EmptyState title="No users yet" />}>
        {({ data }) => (
          <Card>
            <Table>
              <THead><tr><TH>User</TH><TH>Email</TH><TH>Role</TH><TH>Status</TH><TH>Last login</TH><TH> </TH></tr></THead>
              <tbody>
                {data.map((u) => (
                  <TR key={u.id}>
                    <TD><div className="flex items-center gap-3"><Avatar name={u.name} size="sm" /><span className="flex items-center gap-2 text-sm font-semibold text-slate-900 whitespace-nowrap">{u.name}{u.id === me?.id && <Badge tone="blue">You</Badge>}</span></div></TD>
                    <TD className="text-xs whitespace-nowrap">{u.email}</TD>
                    <TD><Badge tone={roleTone(u.role)}>{label(u.role)}</Badge></TD>
                    <TD><Badge tone={statusTone(u.status)} dot>{label(u.status)}</Badge></TD>
                    <TD className="text-xs text-slate-400 whitespace-nowrap">{timeAgo(u.lastLoginAt)}</TD>
                    <TD className="text-right"><button onClick={() => setDrawer({ mode: "edit", id: u.id })} className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 text-slate-400 hover:text-slate-700" aria-label="Edit"><Pencil className="h-3.5 w-3.5" /></button></TD>
                  </TR>
                ))}
              </tbody>
            </Table>
          </Card>
        )}
      </QueryState>
      <UserDrawer state={drawer} onClose={() => setDrawer(null)} />
    </div>
  );
}

export function AccountPage() {
  const { user, companyId } = useAuth();
  const [tab, setTab] = useState<Tab>("profile");
  const canManageUsers = user?.companyRole === "ADMIN";
  const tabs: [Tab, string][] = [["profile", "Profile"], ["company", "Company Settings"], ...(canManageUsers ? [["users", "Users"] as [Tab, string]] : [])];
  return (
    <div className="space-y-5">
      <div className="inline-flex rounded-lg border border-slate-200 bg-slate-100 p-1">{tabs.map(([k, l]) => <button key={k} onClick={() => setTab(k)} className={cn("h-7 rounded-md px-4 text-xs font-medium transition-colors", tab === k ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800")}>{l}</button>)}</div>
      {tab === "profile" && <ProfileTab />}
      {tab === "company" && companyId && <CompanyTab companyId={companyId} />}
      {tab === "users" && canManageUsers && <UsersTab />}
    </div>
  );
}
