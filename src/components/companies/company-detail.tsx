"use client";
import { Button } from "@/components/ui/button";
import { Badge, DotStatus, StatusBadge } from "@/components/ui/badge";
import { Card, CardHeader, StatCard } from "@/components/ui/card";
import { applyApiError, Field, FormError, maskedRegister, SubmitButton, useZodForm } from "@/components/ui/form";
import { Input, Select } from "@/components/ui/input";
import { Alert, Breadcrumb, CompanyLogo, Progress } from "@/components/ui/misc";
import { QueryState, Skeleton } from "@/components/ui/query-state";
import { TD, TH, THead, TR, Table } from "@/components/ui/table";
import { useToast } from "@/components/ui/toast";
import { useActivity } from "@/lib/api/hooks/activity";
import { counts, useCompany } from "@/lib/api/hooks/companies";
import { LICENSE_STATES, useLicense, useUpdateLicense } from "@/lib/api/hooks/licenses";
import { screenStatusLabel, useScreens } from "@/lib/api/hooks/screens";
import { useUsers } from "@/lib/api/hooks/users";
import type { Company } from "@/lib/api/types";
import { formatDate, formatDateTime, label, timeAgo } from "@/lib/format";
import { Activity, Pencil, Users } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { UserDrawer, type UserDrawerState } from "@/components/portal/user-drawer";
import { isHttpUrl } from "@/lib/validation/fields";
import { formatPhone, maskEmail, maskInteger } from "@/lib/validation/masks";
import { z } from "zod";
import { LICENSE_STATE_VALUES, screenLimit } from "./company-schema";
import { CompanyFormModal } from "./company-modals";

const licenseSchema = z.object({ limit: screenLimit(), state: z.enum(LICENSE_STATE_VALUES, { error: "Choose a licence status" }) });

function LicensePanel({ company }: { company: Company }) {
  const toast = useToast();
  const license = useLicense(company.id);
  const update = useUpdateLicense();
  const [editing, setEditing] = useState(false);
  const l = license.data ?? { screenLimit: company.license?.screenLimit ?? 0, state: company.license?.state ?? "DISABLED", overLimit: company.overLimit, paired: counts(company).screens, available: counts(company).available, expiresAt: null };
  const form = useZodForm(licenseSchema, { defaultValues: { limit: String(l.screenLimit || 1), state: l.state } });
  const limitText = form.watch("limit");
  const usagePct = l.screenLimit ? Math.min(100, (l.paired / l.screenLimit) * 100) : 0;
  const startEdit = () => { form.reset({ limit: String(l.screenLimit || 1), state: l.state }); setEditing(true); };
  const save = form.handleSubmit(async (v) => {
    try {
      const r = await update.mutateAsync({ companyId: company.id, screenLimit: Number(v.limit), state: v.state });
      toast.success("License updated", r.overLimit ? "The account is now over its limit." : `${r.screenLimit} screens · ${label(r.state)}`);
      setEditing(false);
    } catch (e) {
      applyApiError(form, e, { screenLimit: "limit" });
    }
  });
  const desc: Record<string, string> = { ACTIVE: "Users can sign in and manage screens within the assigned limit.", SUSPENDED: "Publishing and pairing are blocked until the licence is reactivated.", DISABLED: "The account cannot use the platform.", EXPIRED: "The licence period has ended; renew to restore access." };
  return (
    <Card className="self-start">
      <CardHeader title="License" subtitle="Screen allocation and access control" action={!editing && <Button variant="secondary" size="sm" onClick={startEdit}>Edit License</Button>} />
      <div className="space-y-4 px-5 py-4">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[["License Status", <StatusBadge key="a" status={label(l.state)} />], ["Screen Limit", <span key="b" className="text-lg font-bold text-slate-900">{l.screenLimit}</span>], ["Paired Screens", <span key="c" className="text-lg font-bold text-slate-900">{l.paired}</span>], ["Available Slots", <span key="d" className={`text-lg font-bold ${l.available > 0 ? "text-green-600" : "text-red-600"}`}>{l.available}</span>]].map(([k, v]) => (
            <div key={String(k)} className="rounded-lg border border-slate-100 bg-slate-50/60 px-2 py-3 text-center"><div className="text-[10px] leading-3 text-slate-400">{k}</div><div className="mt-2 flex justify-center">{v}</div></div>
          ))}
        </div>
        <div>
          <div className="flex items-center justify-between text-xs"><span className="text-slate-500">Screen usage</span><span className="font-semibold text-slate-900">{l.paired} of {l.screenLimit} used</span></div>
          <Progress value={usagePct} tone={l.overLimit ? "red" : usagePct >= 90 ? "amber" : "blue"} className="mt-2" />
        </div>
        {l.overLimit && <Alert tone="red">Over limit: more screens are paired than the licence allows. Pairing is blocked until the limit is raised or screens are unpaired.</Alert>}
        <div className="rounded-lg border border-slate-100 bg-slate-50/60 px-4 py-3">
          <div className={`flex items-center gap-2 text-xs font-semibold ${l.state === "ACTIVE" ? "text-green-700" : "text-amber-700"}`}><span className={`h-1.5 w-1.5 rounded-full ${l.state === "ACTIVE" ? "bg-green-500" : "bg-amber-500"}`} />{label(l.state)}</div>
          <p className="mt-1 text-[11px] text-slate-400">{desc[l.state]}</p>
          {license.isError && <p className="mt-1 text-[11px] text-red-600">Couldn&apos;t load the latest licence details. <button type="button" onClick={() => license.refetch()} className="font-medium underline">Retry</button></p>}
          {l.expiresAt && <p className="mt-1 text-[11px] text-slate-400">Expires {formatDate(l.expiresAt)}</p>}
        </div>
        {editing && (
          <form onSubmit={save} noValidate className="space-y-4 border-t border-slate-100 pt-4 animate-fade-in">
            <FormError form={form} />
            <Field label="Maximum Screens" required hint="Whole number, 1–10,000." error={form.formState.errors.limit?.message}><Input inputMode="numeric" autoComplete="off" maxLength={5} {...maskedRegister(form, "limit", (v) => maskInteger(v, 5))} /></Field>
            <Field label="License Status" error={form.formState.errors.state?.message}><Select {...form.register("state")}>{LICENSE_STATES.map((s) => <option key={s} value={s}>{label(s)}</option>)}</Select></Field>
            {limitText !== "" && Number(limitText) < l.paired && <Alert tone="amber">Lower than the {l.paired} screens already paired; the account will be flagged over limit (screens are not removed).</Alert>}
            <div className="flex justify-end gap-2"><Button type="button" variant="secondary" size="sm" disabled={form.formState.isSubmitting} onClick={() => setEditing(false)}>Cancel</Button><SubmitButton form={form} size="sm">Save Changes</SubmitButton></div>
          </form>
        )}
      </div>
    </Card>
  );
}

function Detail({ company }: { company: Company }) {
  const [editCompany, setEditCompany] = useState(false);
  const [tab, setTab] = useState<"overview" | "users" | "screens">("overview");
  const [userDrawer, setUserDrawer] = useState<UserDrawerState>(null);
  const activity = useActivity({ companyId: company.id, pageSize: 6 });
  const users = useUsers({ pageSize: 50 }, { companyId: company.id, enabled: tab === "users" });
  const screens = useScreens({ pageSize: 50 }, { companyId: company.id, enabled: tab === "screens" });
  const total = counts(company).online + counts(company).offline;
  const onlineRate = total ? Math.round((counts(company).online / total) * 100) : 0;

  return (
    <div className="space-y-5">
      <Breadcrumb items={[{ label: "Companies", href: "/companies" }, { label: company.name }]} />
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <CompanyLogo seed={company.code} name={company.name} size="lg" />
          <div>
            <div className="flex items-center gap-2.5"><h1 className="text-xl font-bold tracking-tight text-slate-900">{company.name}</h1><Badge tone={company.status === "ACTIVE" ? "green" : company.status === "SUSPENDED" ? "amber" : "slate"} dot>{label(company.status)}</Badge></div>
            <p className="mt-0.5 text-xs text-slate-400">{company.code} · Customer since {formatDate(company.createdAt)}{company.plan ? ` · ${company.plan}` : ""}</p>
          </div>
        </div>
        <Button variant="secondary" onClick={() => setEditCompany(true)}><Pencil className="h-3.5 w-3.5" /> Edit Company</Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard value={company.license?.screenLimit ?? 0} label="Licensed" sub="total capacity" tone="blue" />
        <StatCard value={counts(company).screens} label="Paired" sub="screens registered" />
        <StatCard value={counts(company).available} label="Available" sub="free slots" tone="green" />
        <StatCard value={counts(company).online} label="Online" sub="currently active" tone="green" />
        <StatCard value={counts(company).offline} label="Offline" sub="need attention" tone="red" />
      </div>

      <div className="flex gap-1 rounded-lg border border-slate-200 bg-white p-1 text-xs font-medium sm:w-fit">
        {([["overview", "Overview"], ["users", "Users"], ["screens", "Screens"]] as const).map(([v, l]) => <button key={v} type="button" onClick={() => setTab(v)} className={`h-8 flex-1 rounded-md px-4 transition-colors sm:flex-none ${tab === v ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-50"}`}>{l}</button>)}
      </div>

      {tab === "overview" && (
        <div className="grid gap-5 xl:grid-cols-[1fr_380px]">
          <div className="space-y-5">
            <Card>
              <CardHeader title="Company Information" />
              <dl className="divide-y divide-slate-100 px-5">
                {([["Company name", company.name], ["Code", company.code], ["Status", <DotStatus key="s" status={label(company.status)} />], ["Website", company.website ? (isHttpUrl(company.website) ? <a href={company.website} className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">{company.website}</a> : company.website) : "—"], ["Industry", company.industry || "—"], ["Phone", company.phone ? formatPhone(company.phone) : "—"], ["Timezone", company.timezone], ["Member since", formatDate(company.createdAt)]] as [string, React.ReactNode][]).map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between py-3 text-sm"><dt className="text-slate-400">{k}</dt><dd className="font-semibold text-slate-900">{v}</dd></div>
                ))}
              </dl>
            </Card>
            <Card>
              <CardHeader title="Screen Health" />
              <div className="px-5 py-4">
                <div className="flex items-center justify-between text-xs"><span className="text-slate-500">Online rate</span><span className="font-semibold text-green-600">{onlineRate}%</span></div>
                <Progress value={onlineRate} tone="green" className="mt-2" />
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="flex items-center justify-between rounded-lg border border-green-100 bg-green-50/50 px-4 py-3"><span className="flex items-center gap-2 text-xs font-medium text-green-700"><span className="h-1.5 w-1.5 rounded-full bg-green-500" />Online</span><span className="text-lg font-bold text-slate-900">{counts(company).online}</span></div>
                  <div className="flex items-center justify-between rounded-lg border border-red-100 bg-red-50/50 px-4 py-3"><span className="flex items-center gap-2 text-xs font-medium text-red-600"><span className="h-1.5 w-1.5 rounded-full bg-red-500" />Offline</span><span className="text-lg font-bold text-slate-900">{counts(company).offline}</span></div>
                </div>
                <div className="mt-3 text-right text-[11px] text-slate-400">{total} total paired screens</div>
              </div>
            </Card>
            <Card>
              <CardHeader title="Recent Activity" action={<Link href={`/activity?company=${company.id}`} className="text-xs font-medium text-blue-600 hover:underline">View all</Link>} />
              <QueryState query={activity} skeleton={<div className="p-4"><Skeleton className="h-24" /></div>} empty={<div className="px-5 py-6 text-center text-xs text-slate-400">No activity yet.</div>}>
                {({ data }) => <ul className="divide-y divide-slate-100">{data.map((a) => <li key={a.id} className="flex items-center gap-3 px-5 py-3"><span className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-100 text-slate-500"><Activity className="h-3.5 w-3.5" /></span><span className="flex-1 text-sm text-slate-800">{a.summary}</span><span className="text-[11px] text-slate-400" title={formatDateTime(a.createdAt)}>{timeAgo(a.createdAt)}</span></li>)}</ul>}
              </QueryState>
            </Card>
          </div>
          <LicensePanel company={company} />
        </div>
      )}

      {tab === "users" && (
        <Card>
          <CardHeader title="Users" subtitle="People who can sign in to this company's portal." action={<Button size="sm" onClick={() => setUserDrawer({ mode: "create" })}><Users className="h-3.5 w-3.5" /> Add User</Button>} />
          <QueryState query={users} empty={<div className="px-5 py-8 text-center text-xs text-slate-400">No users yet.</div>}>
            {({ data }) => (
              <Table>
                <THead><tr><TH>User</TH><TH>Role</TH><TH>Status</TH><TH>Last login</TH></tr></THead>
                <tbody>{data.map((u) => <TR key={u.id} className="cursor-pointer" onClick={() => setUserDrawer({ mode: "edit", id: u.id, user: u })}><TD><div className="text-sm font-semibold text-slate-900">{u.name}</div><div className="text-[11px] text-slate-400">{maskEmail(u.email)}</div></TD><TD><Badge tone="blue">{label(u.role)}</Badge></TD><TD><StatusBadge status={label(u.status)} /></TD><TD className="text-xs text-slate-400">{timeAgo(u.lastLoginAt)}</TD></TR>)}</tbody>
              </Table>
            )}
          </QueryState>
          <UserDrawer state={userDrawer} companyId={company.id} onClose={() => setUserDrawer(null)} />
        </Card>
      )}

      {tab === "screens" && (
        <Card>
          <CardHeader title="Screens" subtitle={`${counts(company).screens} paired · ${counts(company).available} slots free`} />
          <QueryState query={screens} empty={<div className="px-5 py-8 text-center text-xs text-slate-400">No screens paired yet.</div>}>
            {({ data }) => (
              <Table>
                <THead><tr><TH>Screen</TH><TH>Status</TH><TH>Content</TH><TH>Last seen</TH></tr></THead>
                <tbody>{data.map((s) => <TR key={s.id}><TD><Link href={`/screens/${s.id}`} className="text-sm font-semibold text-slate-900 hover:text-blue-600">{s.name}</Link><div className="text-[11px] text-slate-400">{s.location ?? "—"}</div></TD><TD><StatusBadge status={screenStatusLabel(s.status)} /></TD><TD className="text-xs">{s.assignment?.name ?? "—"}</TD><TD className="text-xs text-slate-400">{timeAgo(s.lastSeenAt)}</TD></TR>)}</tbody>
              </Table>
            )}
          </QueryState>
        </Card>
      )}

      <CompanyFormModal open={editCompany} onClose={() => setEditCompany(false)} company={company} />
    </div>
  );
}

export function CompanyDetail({ id }: { id: string }) {
  const company = useCompany(id);
  return <QueryState query={company} skeleton={<div className="space-y-5"><Skeleton className="h-16" /><Skeleton className="h-24" /><Skeleton className="h-64" /></div>}>{(c) => <Detail company={c} />}</QueryState>;
}
