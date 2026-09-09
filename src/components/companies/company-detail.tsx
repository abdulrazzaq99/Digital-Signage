"use client";
import { Button } from "@/components/ui/button";
import { Badge, DotStatus } from "@/components/ui/badge";
import { Card, CardHeader, StatCard } from "@/components/ui/card";
import { Input, Label, Select } from "@/components/ui/input";
import { Breadcrumb, CompanyLogo, Progress } from "@/components/ui/misc";
import type { Company } from "@/lib/data";
import { ImageIcon, Monitor, MonitorOff, Pencil, Play } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { CompanyFormModal } from "./company-modals";

const activity = [
  { icon: <Monitor className="h-3.5 w-3.5" />, tone: "bg-green-50 text-green-600", text: '"Lobby Display 01" paired', when: "2h ago" },
  { icon: <Play className="h-3.5 w-3.5" />, tone: "bg-blue-50 text-blue-600", text: '"Weekend Promo" playlist published', when: "5h ago" },
  { icon: <MonitorOff className="h-3.5 w-3.5" />, tone: "bg-red-50 text-red-600", text: '"Entrance Display" went offline', when: "Yesterday" },
  { icon: <ImageIcon className="h-3.5 w-3.5" />, tone: "bg-slate-100 text-slate-500", text: "12 media assets uploaded", when: "2 days ago" },
];

export function CompanyDetail({ company }: { company: Company }) {
  const [editLicense, setEditLicense] = useState(false);
  const [editCompany, setEditCompany] = useState(false);
  const total = company.online + company.offline;
  const onlineRate = total ? Math.round((company.online / total) * 100) : 0;
  const usagePct = (company.screensUsed / company.screenLimit) * 100;

  return (
    <div className="space-y-5">
      <Breadcrumb items={[{ label: "Companies", href: "/companies" }, { label: company.name }]} />

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <CompanyLogo seed={company.seed} size="lg" />
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold tracking-tight text-slate-900">{company.name}</h1>
              <Badge tone="green" dot>{company.status}</Badge>
            </div>
            <p className="mt-0.5 text-xs text-slate-400">Customer since {company.since}</p>
          </div>
        </div>
        <Button variant="secondary" onClick={() => setEditCompany(true)}><Pencil className="h-3.5 w-3.5" /> Edit Company</Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard value={company.screenLimit} label="Licensed" sub="total capacity" tone="blue" />
        <StatCard value={company.screensUsed} label="Paired" sub="screens registered" />
        <StatCard value={company.available} label="Available" sub="free slots" tone="green" />
        <StatCard value={company.online} label="Online" sub="currently active" tone="green" />
        <StatCard value={company.offline} label="Offline" sub="need attention" tone="red" />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_380px]">
        <div className="space-y-5">
          <Card>
            <CardHeader title="Company Information" />
            <dl className="divide-y divide-slate-100 px-5">
              {[["Company name", <span key="n" className="font-semibold text-slate-900">{company.name}</span>], ["Status", <DotStatus key="s" status={company.status} />], ["Member since", <span key="m" className="font-semibold text-slate-900">{company.since}</span>]].map(([k, v]) => (
                <div key={String(k)} className="flex items-center justify-between py-3 text-sm"><dt className="text-slate-400">{k}</dt><dd>{v}</dd></div>
              ))}
            </dl>
          </Card>

          <Card>
            <CardHeader title="Screen Health" />
            <div className="px-5 py-4">
              <div className="flex items-center justify-between text-xs"><span className="text-slate-500">Online rate</span><span className="font-semibold text-green-600">{onlineRate}%</span></div>
              <Progress value={onlineRate} tone="green" className="mt-2" />
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="flex items-center justify-between rounded-lg border border-green-100 bg-green-50/50 px-4 py-3"><span className="flex items-center gap-2 text-xs font-medium text-green-700"><span className="h-1.5 w-1.5 rounded-full bg-green-500" />Online</span><span className="text-lg font-bold text-slate-900">{company.online}</span></div>
                <div className="flex items-center justify-between rounded-lg border border-red-100 bg-red-50/50 px-4 py-3"><span className="flex items-center gap-2 text-xs font-medium text-red-600"><span className="h-1.5 w-1.5 rounded-full bg-red-500" />Offline</span><span className="text-lg font-bold text-slate-900">{company.offline}</span></div>
              </div>
              <div className="mt-3 text-right text-[11px] text-slate-400">{total} total paired screens</div>
            </div>
          </Card>

          <Card>
            <CardHeader title="Recent Activity" action={<Link href="/activity" className="text-xs font-medium text-blue-600 hover:underline">View all</Link>} />
            <ul className="divide-y divide-slate-100">
              {activity.map((a, i) => (
                <li key={i} className="flex items-center gap-3 px-5 py-3">
                  <span className={`flex h-7 w-7 items-center justify-center rounded-md ${a.tone}`}>{a.icon}</span>
                  <span className="flex-1 text-sm text-slate-800">{a.text}</span>
                  <span className="text-[11px] text-slate-400">{a.when}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        <Card className="self-start">
          <CardHeader title="License" subtitle="Screen allocation and access control" action={!editLicense && <Button variant="secondary" size="sm" onClick={() => setEditLicense(true)}>Edit License</Button>} />
          <div className="space-y-4 px-5 py-4">
            <div className="grid grid-cols-4 gap-2">
              {[["License Status", <Badge key="a" tone="green" dot>{company.license}</Badge>], ["Screen Limit", <span key="b" className="text-lg font-bold text-slate-900">{company.screenLimit}</span>], ["Paired Screens", <span key="c" className="text-lg font-bold text-slate-900">{company.screensUsed}</span>], ["Available Slots", <span key="d" className="text-lg font-bold text-green-600">{company.available}</span>]].map(([k, v]) => (
                <div key={String(k)} className="rounded-lg border border-slate-100 bg-slate-50/60 px-2 py-3 text-center"><div className="text-[10px] leading-3 text-slate-400">{k}</div><div className="mt-2 flex justify-center">{v}</div></div>
              ))}
            </div>
            <div>
              <div className="flex items-center justify-between text-xs"><span className="text-slate-500">Screen usage</span><span className="font-semibold text-slate-900">{company.screensUsed} of {company.screenLimit} used</span></div>
              <Progress value={usagePct} className="mt-2" />
            </div>
            <div className="rounded-lg border border-slate-100 bg-slate-50/60 px-4 py-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-green-700"><span className="h-1.5 w-1.5 rounded-full bg-green-500" />Active</div>
              <p className="mt-1 text-[11px] text-slate-400">Users can sign in and manage screens within the assigned limit.</p>
            </div>
            {editLicense && (
              <form onSubmit={(e) => { e.preventDefault(); setEditLicense(false); }} className="space-y-4 border-t border-slate-100 pt-4 animate-fade-in">
                <div><Label>Maximum Screens</Label><Input type="number" defaultValue={company.screenLimit} /></div>
                <div><Label>License Status</Label><Select defaultValue={company.license}><option>Active</option><option>Suspended</option><option>Disabled</option><option>Expired</option></Select></div>
                <div className="flex justify-end gap-2"><Button type="button" variant="secondary" size="sm" onClick={() => setEditLicense(false)}>Cancel</Button><Button type="submit" size="sm">Save Changes</Button></div>
              </form>
            )}
          </div>
        </Card>
      </div>

      <CompanyFormModal open={editCompany} onClose={() => setEditCompany(false)} company={company} />
    </div>
  );
}
