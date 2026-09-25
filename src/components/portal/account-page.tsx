"use client";
import { useAuth } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { applyApiError, Field, FormError, FormPhone, maskedRegister, SubmitButton, useZodForm } from "@/components/ui/form";
import { Input, PasswordInput } from "@/components/ui/input";
import { Alert, Avatar } from "@/components/ui/misc";
import { EmptyState, QueryState, Skeleton } from "@/components/ui/query-state";
import { TD, TH, THead, TR, Table } from "@/components/ui/table";
import { useToast } from "@/components/ui/toast";
import { useChangePassword, useUpdateProfile } from "@/lib/api/hooks/auth";
import { useCompany } from "@/lib/api/hooks/companies";
import { useLicense } from "@/lib/api/hooks/licenses";
import { useUsers } from "@/lib/api/hooks/users";
import type { User } from "@/lib/api/types";
import { formatDate, label, roleLabel, timeAgo } from "@/lib/format";
import { formatPhone, maskEmail, maskName } from "@/lib/validation/masks";
import { applyPasswordError, PASSWORD_HINT, passwordChangeDefaults, passwordChangeSchema, profileBody, profileDefaults, profileSchema } from "@/components/settings/account-schemas";
import { cn } from "@/lib/utils";
import { Pencil, Plus } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { UserDrawer, type UserDrawerState } from "./user-drawer";

type Tab = "profile" | "company" | "users";
const isTab = (v: string | null): v is Tab => v === "profile" || v === "company" || v === "users";
const roleTone = (r: User["role"]) => (r === "ADMIN" ? "purple" : r === "EDITOR" ? "blue" : "slate");
const statusTone = (s: User["status"]) => (s === "ACTIVE" ? "green" : s === "INVITED" ? "blue" : "slate");

function ProfileTab() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const update = useUpdateProfile();
  const changePw = useChangePassword();
  const [changingPw, setChangingPw] = useState(false);
  // "Change password" from the account menu (?tab=security) opens the password form, also when
  // already on this page.
  const wantsPw = useSearchParams().get("tab") === "security";
  const [sawWantsPw, setSawWantsPw] = useState(false);
  if (wantsPw !== sawWantsPw) {
    setSawWantsPw(wantsPw);
    if (wantsPw) setChangingPw(true);
  }
  const form = useZodForm(profileSchema, { defaultValues: profileDefaults(user) });
  const pwForm = useZodForm(passwordChangeSchema(user?.email), { defaultValues: passwordChangeDefaults });
  const save = form.handleSubmit(async (v) => {
    try {
      await update.mutateAsync(profileBody(v));
      toast.success("Profile updated");
      form.reset(v);
    } catch (e) {
      applyApiError(form, e);
    }
  });
  const savePw = pwForm.handleSubmit(async (v) => {
    try {
      await changePw.mutateAsync({ currentPassword: v.currentPassword, newPassword: v.newPassword });
    } catch (e) {
      applyPasswordError(pwForm, e);
      return;
    }
    toast.success("Password updated", "Please sign in again with your new password.");
    await logout();
    router.replace("/login");
  });
  const togglePw = () => { if (changingPw) pwForm.reset(passwordChangeDefaults); setChangingPw((v) => !v); };
  if (!user) return null;
  const e = form.formState.errors;
  const pe = pwForm.formState.errors;
  return (
    <div className="max-w-[520px] space-y-6 animate-fade-in">
      <div className="flex items-center gap-4"><Avatar name={user.name} size="lg" /><div><div className="text-sm font-semibold text-slate-900">{user.name}</div><div className="text-[11px] text-slate-400">{roleLabel(user)} · {user.email}</div></div></div>
      <form onSubmit={save} noValidate className="space-y-4 border-t border-slate-100 pt-5">
        <div className="text-sm font-semibold text-slate-900">Personal Information</div>
        <FormError form={form} />
        <Field label="Full Name" required error={e.name?.message}><Input autoComplete="name" maxLength={120} {...maskedRegister(form, "name", maskName)} /></Field>
        <Field label="Email Address" hint="Contact your account manager to change your email address."><Input value={user.email} disabled readOnly className="bg-slate-50 text-slate-400" /></Field>
        <Field label="Job Title" error={e.title?.message}><Input autoComplete="organization-title" maxLength={80} {...form.register("title")} /></Field>
        <Field label="Phone Number" error={e.phone?.message}><FormPhone form={form} name="phone" /></Field>
        <SubmitButton form={form} size="sm">Save Changes</SubmitButton>
      </form>
      <div className="border-t border-slate-100 pt-5">
        <div className="flex items-center justify-between"><div><div className="text-sm font-semibold text-slate-900">Security</div><div className="text-[11px] text-slate-400">Update your password. All sessions are signed out afterwards.</div></div><Button type="button" variant="secondary" size="sm" disabled={pwForm.formState.isSubmitting} onClick={togglePw}>{changingPw ? "Cancel" : "Change Password"}</Button></div>
        {changingPw && (
          <form onSubmit={savePw} noValidate className="mt-4 space-y-4 animate-fade-in">
            <FormError form={pwForm} />
            <Field label="Current Password" required error={pe.currentPassword?.message}><PasswordInput autoComplete="current-password" maxLength={128} {...pwForm.register("currentPassword")} /></Field>
            <Field label="New Password" required hint={PASSWORD_HINT} error={pe.newPassword?.message}><PasswordInput autoComplete="new-password" maxLength={128} {...pwForm.register("newPassword")} /></Field>
            <Field label="Confirm New Password" required error={pe.confirm?.message}><PasswordInput autoComplete="new-password" maxLength={128} {...pwForm.register("confirm")} /></Field>
            <SubmitButton form={pwForm} size="sm" pendingText="Updating…">Update Password</SubmitButton>
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
          <dl className="grid grid-cols-2 gap-4 text-xs">{([["Company Name", c.name], ["Website", c.website || "—"], ["Industry", c.industry || "—"], ["Phone", c.phone ? formatPhone(c.phone) : "—"], ["Timezone", c.timezone]] as [string, string][]).map(([k, v]) => <div key={k}><dt className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">{k}</dt><dd className="mt-0.5 font-medium text-slate-800">{v}</dd></div>)}</dl>
          <div className="border-t border-slate-100 pt-5">
            <div className="text-sm font-semibold text-slate-900">Account Details</div>
            <dl className="mt-4 grid grid-cols-2 gap-4 text-xs">{([["Account ID", c.code], ["Plan", c.plan || "—"], ["Customer Since", formatDate(c.createdAt)], ["Account Status", label(c.status)], ["Licence", license.data ? `${label(license.data.state)} · ${license.data.paired} of ${license.data.screenLimit} screens` : license.isError ? "Couldn't load" : "…"], ["Licence Expiry", license.data ? (license.data.expiresAt ? formatDate(license.data.expiresAt) : "No expiry") : license.isError ? "Couldn't load" : "…"]] as [string, string][]).map(([k, v]) => <div key={k}><dt className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">{k}</dt><dd className="mt-0.5 font-medium text-slate-800">{v}</dd></div>)}</dl>
            {license.isError && <p className="mt-3 text-[11px] text-red-600">Couldn&apos;t load licence details. <button type="button" onClick={() => license.refetch()} className="font-medium underline">Retry</button></p>}
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
      <div className="flex flex-wrap items-center justify-between gap-3"><span className="text-xs text-slate-400">{users.data?.meta?.total ?? users.data?.data?.length ?? 0} users</span><Button size="sm" onClick={() => setDrawer({ mode: "create" })}><Plus className="h-3.5 w-3.5" /> Add User</Button></div>
      <QueryState query={users} empty={<EmptyState title="No users yet" />}>
        {({ data }) => (
          <Card>
            <Table>
              <THead><tr><TH>User</TH><TH>Email</TH><TH>Role</TH><TH>Status</TH><TH>Last login</TH><TH> </TH></tr></THead>
              <tbody>
                {data.map((u) => (
                  <TR key={u.id}>
                    <TD><div className="flex items-center gap-3"><Avatar name={u.name} size="sm" /><span className="flex items-center gap-2 text-sm font-semibold text-slate-900 whitespace-nowrap">{u.name}{u.id === me?.id && <Badge tone="blue">You</Badge>}</span></div></TD>
                    <TD className="text-xs whitespace-nowrap" title={u.id === me?.id ? u.email : undefined}>{u.id === me?.id ? u.email : maskEmail(u.email)}</TD>
                    <TD><Badge tone={roleTone(u.role)}>{label(u.role)}</Badge></TD>
                    <TD><Badge tone={statusTone(u.status)} dot>{label(u.status)}</Badge></TD>
                    <TD className="text-xs text-slate-400 whitespace-nowrap">{timeAgo(u.lastLoginAt)}</TD>
                    <TD className="text-right"><button type="button" onClick={() => setDrawer({ mode: "edit", id: u.id, user: u })} className="flex h-10 w-10 sm:h-7 sm:w-7 items-center justify-center rounded-md border border-slate-200 text-slate-400 hover:text-slate-700" aria-label="Edit"><Pencil className="h-3.5 w-3.5" /></button></TD>
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
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const requested = params.get("tab");
  const tab: Tab = isTab(requested) ? requested : "profile";
  const setTab = (t: Tab) => router.replace(`${pathname}?tab=${t}`, { scroll: false });
  const canManageUsers = user?.companyRole === "ADMIN";
  const tabs: [Tab, string][] = [["profile", "Profile"], ["company", "Company Settings"], ...(canManageUsers ? [["users", "Users"] as [Tab, string]] : [])];
  return (
    <div className="space-y-5">
      <div className="inline-flex rounded-lg border border-slate-200 bg-slate-100 p-1">{tabs.map(([k, l]) => <button key={k} type="button" onClick={() => setTab(k)} className={cn("h-9 sm:h-7 rounded-md px-4 text-xs font-medium transition-colors", tab === k ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800")}>{l}</button>)}</div>
      {tab === "profile" && <ProfileTab />}
      {tab === "company" && (companyId ? <CompanyTab companyId={companyId} /> : <EmptyState title="No company linked" body="This account isn't linked to a company." className="max-w-[520px]" />)}
      {tab === "users" && canManageUsers && <UsersTab />}
    </div>
  );
}
