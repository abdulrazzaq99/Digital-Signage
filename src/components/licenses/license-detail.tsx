"use client";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/badge";
import { Card, CardHeader, StatCard } from "@/components/ui/card";
import { Breadcrumb, CompanyLogo, Progress } from "@/components/ui/misc";
import type { Company } from "@/lib/data";
import { Ban, ChevronRight, Pencil, PauseCircle } from "lucide-react";
import { useState } from "react";
import { DisableLicenseModal, EditLimitModal, SuspendLicenseModal } from "./license-modals";

export function LicenseDetail({ company }: { company: Company }) {
  const [edit, setEdit] = useState(false);
  const [suspend, setSuspend] = useState(false);
  const [disable, setDisable] = useState(false);
  const pct = Math.round((company.screensUsed / company.screenLimit) * 100);

  const actions = [
    { label: "Edit Screen Limit", icon: <Pencil className="h-4 w-4" />, onClick: () => setEdit(true), cls: "text-slate-700 hover:bg-slate-50", disabled: false },
    { label: "Suspend License", icon: <PauseCircle className="h-4 w-4" />, onClick: () => setSuspend(true), cls: "text-amber-600 hover:bg-amber-50", disabled: company.license !== "Active" },
    { label: "Disable License", icon: <Ban className="h-4 w-4" />, onClick: () => setDisable(true), cls: "text-slate-400 hover:bg-slate-50", disabled: company.license === "Disabled" },
  ];

  return (
    <div className="space-y-5">
      <Breadcrumb items={[{ label: "License Management", href: "/licenses" }, { label: company.name }]} />
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <CompanyLogo seed={company.seed} size="lg" />
          <div>
            <div className="flex items-center gap-2.5"><h1 className="text-xl font-bold tracking-tight text-slate-900">{company.name}</h1><StatusBadge status={company.license} /></div>
            <p className="mt-0.5 text-xs text-slate-400">Customer since {company.since}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setEdit(true)}><Pencil className="h-3.5 w-3.5" /> Edit Limit</Button>
          <Button variant="warning-outline" onClick={() => setSuspend(true)} disabled={company.license !== "Active"}><PauseCircle className="h-3.5 w-3.5" /> Suspend</Button>
          <Button variant="secondary" onClick={() => setDisable(true)} disabled={company.license === "Disabled"} className="text-slate-400"><Ban className="h-3.5 w-3.5" /> Disable</Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard value={company.screenLimit} label="Screen Limit" sub="maximum capacity" tone="blue" />
        <StatCard value={company.screensUsed} label="Paired Screens" sub="currently registered" />
        <StatCard value={company.available} label="Available Slots" sub="ready to pair" tone="green" />
        <StatCard value={`${pct}%`} label="Usage" sub={`${company.screensUsed} of ${company.screenLimit} used`} />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_300px]">
        <Card>
          <CardHeader title="License Information" />
          <dl className="divide-y divide-slate-100 px-5">
            {[
              ["Company", <span key="1" className="font-semibold text-slate-900">{company.name}</span>],
              ["License Status", <StatusBadge key="2" status={company.license} />],
              ["Screen Limit", <span key="3" className="font-semibold text-slate-900">{company.screenLimit} screens</span>],
              ["Paired Screens", <span key="4" className="font-semibold text-slate-900">{company.screensUsed} screens</span>],
              ["Available Slots", <span key="5" className="font-semibold text-slate-900">{company.available} screens</span>],
              ["Member Since", <span key="6" className="font-semibold text-slate-900">{company.since}</span>],
            ].map(([k, v]) => <div key={String(k)} className="flex items-center justify-between py-3.5 text-sm"><dt className="text-slate-400">{k}</dt><dd>{v}</dd></div>)}
          </dl>
        </Card>
        <div className="space-y-5">
          <Card>
            <CardHeader title="Screen Usage" />
            <div className="px-5 py-4">
              <div className="flex items-end gap-1"><span className="text-3xl font-bold text-blue-600">{company.screensUsed}</span><span className="pb-1 text-xs text-slate-400">of {company.screenLimit}</span></div>
              <Progress value={pct} className="mt-3" />
              <div className="mt-2 flex justify-between text-[11px] text-slate-400"><span>{pct}% used</span><span>{company.available} slots free</span></div>
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
    </div>
  );
}
