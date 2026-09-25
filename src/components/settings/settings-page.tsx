"use client";
import { useAuth } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { applyApiError, Field, FormError, maskedRegister, SubmitButton, useZodForm } from "@/components/ui/form";
import { Input, Label, PasswordInput, Select, Toggle } from "@/components/ui/input";
import { Alert, Avatar, PageHeader } from "@/components/ui/misc";
import { useToast } from "@/components/ui/toast";
import { useChangePassword, useUpdateProfile } from "@/lib/api/hooks/auth";
import { roleLabel } from "@/lib/format";
import { cn } from "@/lib/utils";
import { TIME_ZONES } from "@/lib/validation/fields";
import { maskInteger, maskName, maskPhone } from "@/lib/validation/masks";
import { Info } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { applyPasswordError, generalSchema, PASSWORD_HINT, passwordChangeDefaults, passwordChangeSchema, profileBody, profileDefaults, profileSchema } from "./account-schemas";

type Tab = "general" | "profile" | "security";

function Section({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) {
  return <Card className="px-5 py-5"><div className="text-sm font-semibold text-slate-900">{title}</div>{sub && <div className="mt-0.5 text-[11px] text-slate-400">{sub}</div>}<div className="mt-4 space-y-4">{children}</div></Card>;
}

function GeneralTab() {
  const [toggles, setToggles] = useState({ maintenance: false, selfReg: false, emailVerify: true, logging: true });
  const form = useZodForm(generalSchema, { defaultValues: { platformName: "Signage Hub", supportEmail: "support@signagehub.io", timezone: "UTC", sessionTimeout: "60" } });
  const { register, formState } = form;
  // No endpoint stores these yet: validate so mistakes show, but never pretend to save.
  const submit = form.handleSubmit(() => undefined);
  return (
    <form onSubmit={submit} noValidate className="space-y-4 animate-fade-in">
      <Alert tone="amber" icon={<Info className="h-3.5 w-3.5 shrink-0" />}>Platform settings are not connected to the API yet, so changes on this tab are not saved.</Alert>
      <Section title="Platform" sub="Core settings for your DSP platform.">
        <Field label="Platform Name" required hint="Displayed in the browser tab and system emails." error={formState.errors.platformName?.message}>
          <Input maxLength={120} autoComplete="off" {...maskedRegister(form, "platformName", maskName)} />
        </Field>
        <Field label="Support Email" required hint="Used as the reply-to address for system-generated emails." error={formState.errors.supportEmail?.message}>
          <Input type="email" inputMode="email" autoComplete="off" autoCapitalize="off" maxLength={254} {...register("supportEmail")} />
        </Field>
      </Section>
      <Section title="Locale & Time" sub="Configure regional display settings.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Timezone" required error={formState.errors.timezone?.message}>
            <Select {...register("timezone")}>{TIME_ZONES.map((tz) => <option key={tz} value={tz}>{tz}</option>)}</Select>
          </Field>
          <div><Label>Date Format</Label><Select defaultValue="MM/DD/YYYY"><option>MM/DD/YYYY</option><option>DD/MM/YYYY</option><option>YYYY-MM-DD</option></Select></div>
        </div>
        <div><Label>Default Language</Label><Select defaultValue="English"><option>English</option><option>Spanish</option><option>French</option><option>German</option></Select></div>
      </Section>
      <Section title="Security & Sessions">
        <Field label="Session Timeout (minutes)" required hint="Admin sessions will expire after this period of inactivity (5–1440 minutes)." error={formState.errors.sessionTimeout?.message}>
          <Input inputMode="numeric" maxLength={4} autoComplete="off" {...maskedRegister(form, "sessionTimeout", (v) => maskInteger(v, 4))} />
        </Field>
      </Section>
      <Section title="Platform Behaviour" sub="Control how the platform operates for all tenants.">
        {([["maintenance", "Maintenance Mode", "Temporarily suspends access for all non-admin users."], ["selfReg", "Allow Self-Registration", "Let new companies sign up without an invitation."], ["emailVerify", "Require Email Verification", "New accounts must verify their email before logging in."], ["logging", "Enable Activity Logging", "Record all platform actions for audit and review."]] as [keyof typeof toggles, string, string][]).map(([k, t, s], i) => (
          <div key={k} className={cn("flex items-center justify-between gap-4", i > 0 && "border-t border-slate-100 pt-4")}><div><div className="text-sm font-medium text-slate-900">{t}</div><div className="text-[11px] text-slate-400">{s}</div></div><Toggle checked={toggles[k]} onChange={(v) => setToggles({ ...toggles, [k]: v })} /></div>
        ))}
      </Section>
      <div className="flex items-center gap-3">
        <Button type="submit" disabled aria-describedby="general-save-hint">Save Changes</Button>
        <span id="general-save-hint" className="text-[11px] text-slate-400">Not available yet</span>
      </div>
    </form>
  );
}

function ProfileTab() {
  const { user } = useAuth();
  const toast = useToast();
  const updateProfile = useUpdateProfile();
  const form = useZodForm(profileSchema, { defaultValues: profileDefaults(user) });
  const { register, formState } = form;
  const submit = form.handleSubmit(async (v) => {
    try {
      await updateProfile.mutateAsync(profileBody(v));
      toast.success("Profile updated");
      form.reset(v);
    } catch (e) {
      applyApiError(form, e);
    }
  });
  return (
    <div className="space-y-4 animate-fade-in">
      <Section title="Profile Photo"><div className="flex items-center gap-4"><Avatar name={user?.name ?? ""} size="lg" className="bg-blue-600 text-base" /><div><div className="text-sm font-semibold text-slate-900">{user?.name}</div><div className="text-[11px] text-slate-400">{roleLabel(user)} · {user?.email}</div></div></div></Section>
      <Section title="Personal Information">
        <form onSubmit={submit} noValidate className="space-y-4">
          <FormError form={form} />
          <Field label="Full Name" required error={formState.errors.name?.message}>
            <Input autoComplete="name" maxLength={120} {...maskedRegister(form, "name", maskName)} />
          </Field>
          <Field label="Email Address" hint="Used for login and system notifications. Email changes go through the API.">
            <Input type="email" value={user?.email ?? ""} disabled readOnly className="bg-slate-50 text-slate-400" />
          </Field>
          <div className="grid gap-4 border-t border-slate-100 pt-4 sm:grid-cols-2">
            <Field label="Job Title" error={formState.errors.title?.message}>
              <Input autoComplete="organization-title" maxLength={80} {...register("title")} />
            </Field>
            <Field label="Phone Number" error={formState.errors.phone?.message}>
              <Input type="tel" inputMode="tel" autoComplete="tel" placeholder="+44 20 7946 0000" maxLength={20} {...maskedRegister(form, "phone", maskPhone)} />
            </Field>
          </div>
          <SubmitButton form={form}>Save Changes</SubmitButton>
        </form>
      </Section>
    </div>
  );
}

function SecurityTab() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const changePw = useChangePassword();
  const form = useZodForm(passwordChangeSchema(user?.email), { defaultValues: passwordChangeDefaults });
  const { register, formState } = form;
  const next = form.watch("newPassword") ?? "";
  const strength = next.length === 0 ? 0 : next.length < 8 ? 1 : /[A-Z]/.test(next) && /\d/.test(next) && /[^\w]/.test(next) ? 4 : /[A-Z]/.test(next) || /\d/.test(next) ? 3 : 2;
  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"][strength];
  const strengthCls = ["", "bg-red-500", "bg-amber-500", "bg-blue-500", "bg-green-500"][strength];
  const submit = form.handleSubmit(async (v) => {
    try {
      await changePw.mutateAsync({ currentPassword: v.currentPassword, newPassword: v.newPassword });
    } catch (e) {
      applyPasswordError(form, e);
      return;
    }
    toast.success("Password updated", "All sessions were signed out; please sign in again.");
    await logout();
    router.replace("/login");
  });
  return (
    <div className="animate-fade-in">
      <Section title="Change Password" sub="Choose a strong password you do not use elsewhere.">
        <form onSubmit={submit} noValidate className="space-y-4">
          <FormError form={form} />
          <Field label="Current Password" required error={formState.errors.currentPassword?.message}>
            <PasswordInput placeholder="Enter current password" autoComplete="current-password" maxLength={128} {...register("currentPassword")} />
          </Field>
          <div className="border-t border-slate-100 pt-4">
            <Field label="New Password" required hint={PASSWORD_HINT} error={formState.errors.newPassword?.message}>
              <PasswordInput placeholder="At least 8 characters" autoComplete="new-password" maxLength={128} {...register("newPassword")} />
            </Field>
            {next && <div className="mt-2 flex items-center gap-2"><div className="flex flex-1 gap-1">{[1, 2, 3, 4].map((n) => <span key={n} className={cn("h-1 flex-1 rounded-full", n <= strength ? strengthCls : "bg-slate-200")} />)}</div><span className={cn("text-[10px] font-medium", strength >= 4 ? "text-green-600" : strength >= 3 ? "text-blue-600" : "text-amber-600")}>{strengthLabel}</span></div>}
          </div>
          <Field label="Confirm New Password" required error={formState.errors.confirm?.message}>
            <PasswordInput placeholder="Re-enter new password" autoComplete="new-password" maxLength={128} {...register("confirm")} />
          </Field>
          <div className="flex gap-2 pt-1"><SubmitButton form={form} pendingText="Updating…">Update Password</SubmitButton><Button type="button" variant="secondary" disabled={formState.isSubmitting} onClick={() => form.reset(passwordChangeDefaults)}>Cancel</Button></div>
          <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-[10px] text-slate-400"><Info className="h-3 w-3" /> Changing your password revokes every active session, including this one.</div>
        </form>
      </Section>
    </div>
  );
}

export function SettingsPage() {
  const [tab, setTab] = useState<Tab>("general");
  return (
    <div className="space-y-5">
      <PageHeader title="Settings" subtitle="Manage your platform configuration, profile and security." />
      <div className="inline-flex rounded-lg border border-slate-200 bg-slate-100 p-1">{(["general", "profile", "security"] as Tab[]).map((t) => <button key={t} type="button" onClick={() => setTab(t)} className={cn("h-9 sm:h-7 rounded-md px-4 text-xs font-medium capitalize transition-colors", tab === t ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800")}>{t}</button>)}</div>

      <div className="max-w-[760px] space-y-4">
        {tab === "general" && <GeneralTab />}
        {tab === "profile" && <ProfileTab />}
        {tab === "security" && <SecurityTab />}
      </div>
    </div>
  );
}
