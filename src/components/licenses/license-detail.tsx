"use client";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/badge";
import { Card, CardHeader, StatCard } from "@/components/ui/card";
import { Alert, Breadcrumb, CompanyLogo, Progress } from "@/components/ui/misc";
import { QueryState, Skeleton } from "@/components/ui/query-state";
import { useCompany } from "@/lib/api/hooks/companies";
import { useLicense } from "@/lib/api/hooks/licenses";
import type { Company, License } from "@/lib/api/types";
import { formatDate, label } from "@/lib/format";
import { Ban, ChevronRight, Pencil, PauseCircle, Play } from "lucide-react";
import { useState } from "react";
import { ActivateLicenseModal, DisableLicenseModal, EditLimitModal, SuspendLicenseModal } from "./license-modals";

function Detail({ company, license }: { company: Company; license: License }) {
  const [edit, setEdit] = useState(false);
  const [suspend, setSuspend] = useState(false);
  const [disable, setDisable] = useState(false);
  const [activate, setActivate] = useState(false);
  const pct = license.screenLimit ? Math.min(100, Math.round((license.paired / license.screenLimit) * 100)) : 0;
  const actions = [
    { label: "Edit Screen Limit", icon: <Pencil className="h-4 w-4" />, onClick: () => setEdit(true), cls: "text-slate-700 hover:bg-slate-50", disabled: false },
    license.state === "ACTIVE"
      ? { label: "Suspend License", icon: <PauseCircle className="h-4 w-4" />, onClick: () => setSuspend(true), cls: "text-amber-600 hover:bg-amber-50", disabled: false }
      : { label: "Activate License", icon: <Play className="h-4 w-4" />, onClick: () => setActivate(true), cls: "text-green-600 hover:bg-green-50", disabled: false },
    { label: "Disable License", icon: <Ban className="h-4 w-4" />, onClick: () => setDisable(true), cls: "text-slate-400 hover:bg-slate-50", disabled: license.state === "DISABLED" },
  ];

  return (
    <div className="space-y-5">
      <Breadcrumb items={[{ label: "License Management", href: "/licenses" }, { label: company.name }]} />
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <CompanyLogo seed={company.code} name={company.name} size="lg" />
          <div>
            <div className="flex items-center gap-2.5"><h1 className="text-xl font-bold tracking-tight text-slate-900">{company.name}</h1><StatusBadge status={label(license.state)} /></div>
            <p className="mt-0.5 text-xs text-slate-400">Customer since {formatDate(company.createdAt)}{license.expiresAt ? ` · Licence expires ${formatDate(license.expiresAt)}` : ""}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={() => setEdit(true)}><Pencil className="h-3.5 w-3.5" /> Edit Limit</Button>
          {license.state === "ACTIVE" ? <Button variant="warning-outline" onClick={() => setSuspend(true)}><PauseCircle className="h-3.5 w-3.5" /> Suspend</Button> : <Button variant="success" onClick={() => setActivate(true)}><Play className="h-3.5 w-3.5" /> Activate</Button>}
          <Button variant="secondary" onClick={() => setDisable(true)} disabled={license.state === "DISABLED"} className="text-slate-400"><Ban className="h-3.5 w-3.5" /> Disable</Button>
        </div>
      </div>

      {license.overLimit && <Alert tone="red">More screens are paired ({license.paired}) than the licence allows ({license.screenLimit}). Pairing is blocked until the limit is raised or screens are unpaired.</Alert>}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard value={license.screenLimit} label="Screen Limit" sub="maximum capacity" tone="blue" />
        <StatCard value={license.paired} label="Paired Screens" sub="currently registered" />
        <StatCard value={license.available} label="Available Slots" sub="ready to pair" tone={license.available > 0 ? "green" : "red"} />
        <StatCard value={`${pct}%`} label="Usage" sub={`${license.paired} of ${license.screenLimit} used`} />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_300px]">
        <Card>
          <CardHeader title="License Information" />
          <dl className="divide-y divide-slate-100 px-5">
            {([["Company", company.name], ["License Status", <StatusBadge key="2" status={label(license.state)} />], ["Screen Limit", `${license.screenLimit} screens`], ["Paired Screens", `${license.paired} screens`], ["Available Slots", `${license.available} screens`], ["Expires", license.expiresAt ? formatDate(license.expiresAt) : "No expiry"], ["Last Updated", formatDate(license.updatedAt)], ["Member Since", formatDate(company.createdAt)]] as [string, React.ReactNode][]).map(([k, v]) => <div key={k} className="flex items-center justify-between py-3.5 text-sm"><dt className="text-slate-400">{k}</dt><dd className="font-semibold text-slate-900">{v}</dd></div>)}
          </dl>
        </Card>
        <div className="space-y-5">
          <Card>
            <CardHeader title="Screen Usage" />
            <div className="px-5 py-4">
              <div className="flex items-end gap-1"><span className="text-3xl font-bold text-blue-600">{license.paired}</span><span className="pb-1 text-xs text-slate-400">of {license.screenLimit}</span></div>
              <Progress value={pct} tone={license.overLimit ? "red" : "blue"} className="mt-3" />
              <div className="mt-2 flex justify-between text-[11px] text-slate-400"><span>{pct}% used</span><span>{license.available} slots free</span></div>
            </div>
          </Card>
          <Card>
            <CardHeader title="Actions" />
            <ul className="divide-y divide-slate-100">
              {actions.map((a) => (
                <li key={a.label}>
                  <button disabled={a.disabled} onClick={a.onClick} className={`flex w-full items-center gap-3 px-5 py-3.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:text-slate-300 disabled:hover:bg-transparent ${a.cls}`}>
                    {a.icon}<span className="flex-1 text-left">{a.label}</span><ChevronRight className="h-4 w-4 text-slate-300" />
                  </button>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>

      <EditLimitModal company={edit ? company : null} onClose={() => setEdit(false)} />
      <SuspendLicenseModal company={suspend ? company : null} onClose={() => setSuspend(false)} />
      <DisableLicenseModal company={disable ? company : null} onClose={() => setDisable(false)} />
      <ActivateLicenseModal company={activate ? company : null} onClose={() => setActivate(false)} />
    </div>
  );
}

export function LicenseDetail({ companyId }: { companyId: string }) {
  const company = useCompany(companyId);
  const license = useLicense(companyId);
  return (
    <QueryState query={company} skeleton={<div className="space-y-5"><Skeleton className="h-16" /><Skeleton className="h-64" /></div>}>
      {(c) => <QueryState query={license} skeleton={<Skeleton className="h-64" />}>{(l) => <Detail company={c} license={l} />}</QueryState>}
    </QueryState>
  );
}
