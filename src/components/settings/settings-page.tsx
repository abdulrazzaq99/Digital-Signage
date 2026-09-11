"use client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Label, Select, Toggle } from "@/components/ui/input";
import { Avatar, PageHeader } from "@/components/ui/misc";
import { cn } from "@/lib/utils";
import { Eye, EyeOff, Info } from "lucide-react";
import { useState } from "react";

type Tab = "general" | "profile" | "security";

function Section({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) {
  return <Card className="px-5 py-5"><div className="text-sm font-semibold text-slate-900">{title}</div>{sub && <div className="mt-0.5 text-[11px] text-slate-400">{sub}</div>}<div className="mt-4 space-y-4">{children}</div></Card>;
}
function Hint({ children }: { children: React.ReactNode }) { return <p className="mt-1 text-[10px] text-slate-400">{children}</p>; }

export function SettingsPage() {
  const [tab, setTab] = useState<Tab>("general");
  const [toggles, setToggles] = useState({ maintenance: false, selfReg: false, emailVerify: true, logging: true });
  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });
  const [show, setShow] = useState({ current: false, next: false, confirm: false });
  const [error, setError] = useState("");
  const strength = pw.next.length === 0 ? 0 : pw.next.length < 8 ? 1 : /[A-Z]/.test(pw.next) && /\d/.test(pw.next) && /[^\w]/.test(pw.next) ? 4 : /[A-Z]/.test(pw.next) || /\d/.test(pw.next) ? 3 : 2;
  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"][strength];
  const strengthCls = ["", "bg-red-500", "bg-amber-500", "bg-blue-500", "bg-green-500"][strength];

  return (
    <div className="space-y-5">
      <PageHeader title="Settings" subtitle="Manage your platform configuration, profile and security." />
      <div className="inline-flex rounded-lg border border-slate-200 bg-slate-100 p-1">{(["general", "profile", "security"] as Tab[]).map((t) => <button key={t} onClick={() => setTab(t)} className={cn("h-7 rounded-md px-4 text-xs font-medium capitalize transition-colors", tab === t ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800")}>{t}</button>)}</div>

      <div className="max-w-[760px] space-y-4">
        {tab === "general" && (
          <div className="space-y-4 animate-fade-in">
            <Section title="Platform" sub="Core settings for your DSP platform.">
              <div><Label>Platform Name</Label><Input defaultValue="Signage Hub" /><Hint>Displayed in the browser tab and system emails.</Hint></div>
              <div><Label>Support Email</Label><Input type="email" defaultValue="support@signagehub.io" /><Hint>Used as the reply-to address for system-generated emails.</Hint></div>
            </Section>
            <Section title="Locale & Time" sub="Configure regional display settings.">
              <div className="grid gap-4 sm:grid-cols-2"><div><Label>Timezone</Label><Select defaultValue="UTC"><option>UTC</option><option>Europe/London</option><option>America/New_York</option><option>Asia/Karachi</option></Select></div><div><Label>Date Format</Label><Select defaultValue="MM/DD/YYYY"><option>MM/DD/YYYY</option><option>DD/MM/YYYY</option><option>YYYY-MM-DD</option></Select></div></div>
              <div><Label>Default Language</Label><Select defaultValue="English"><option>English</option><option>Spanish</option><option>French</option><option>German</option></Select></div>
            </Section>
            <Section title="Security & Sessions">
              <div><Label>Session Timeout (minutes)</Label><Input type="number" defaultValue={60} /><Hint>Admin sessions will expire after this period of inactivity.</Hint></div>
            </Section>
            <Section title="Platform Behaviour" sub="Control how the platform operates for all tenants.">
              {([["maintenance", "Maintenance Mode", "Temporarily suspends access for all non-admin users."], ["selfReg", "Allow Self-Registration", "Let new companies sign up without an invitation."], ["emailVerify", "Require Email Verification", "New accounts must verify their email before logging in."], ["logging", "Enable Activity Logging", "Record all platform actions for audit and review."]] as [keyof typeof toggles, string, string][]).map(([k, t, s], i) => (
                <div key={k} className={cn("flex items-center justify-between gap-4", i > 0 && "border-t border-slate-100 pt-4")}><div><div className="text-sm font-medium text-slate-900">{t}</div><div className="text-[11px] text-slate-400">{s}</div></div><Toggle checked={toggles[k]} onChange={(v) => setToggles({ ...toggles, [k]: v })} /></div>
              ))}
            </Section>
          </div>
        )}

        {tab === "profile" && (
          <div className="space-y-4 animate-fade-in">
            <Section title="Profile Photo"><div className="flex items-center gap-4"><Avatar name="John Martinez" size="lg" className="bg-blue-600 text-base" /><div><div className="text-sm font-semibold text-slate-900">John Martinez</div><div className="text-[11px] text-slate-400">Super Administrator · Signage Hub</div></div></div></Section>
            <Section title="Personal Information">
              <div className="grid gap-4 sm:grid-cols-2"><div><Label>First Name</Label><Input defaultValue="John" /></div><div><Label>Last Name</Label><Input defaultValue="Martinez" /></div></div>
              <div><Label>Email Address</Label><Input type="email" defaultValue="john.martinez@signagehub.io" /><Hint>Used for login and system notifications.</Hint></div>
              <div className="grid gap-4 border-t border-slate-100 pt-4 sm:grid-cols-2"><div><Label>Job Title</Label><Input defaultValue="Super Admin" /></div><div><Label>Phone Number</Label><Input defaultValue="+1 (555) 000-1234" /></div></div>
            </Section>
          </div>
        )}

        {tab === "security" && (
          <div className="animate-fade-in">
            <Section title="Change Password" sub="Choose a strong password you do not use elsewhere.">
              <form onSubmit={(e) => { e.preventDefault(); if (pw.current === "wrong") { setError("The current password you entered is incorrect."); return; } setError(""); setPw({ current: "", next: "", confirm: "" }); }} className="space-y-4">
                {([["current", "Current Password", "Enter current password"], ["next", "New Password", "At least 8 characters"], ["confirm", "Confirm New Password", "Re-enter new password"]] as [keyof typeof pw, string, string][]).map(([k, l, ph], i) => (
                  <div key={k} className={cn(i === 1 && "border-t border-slate-100 pt-4")}>
                    <Label>{l}</Label>
                    <div className="relative"><Input type={show[k] ? "text" : "password"} placeholder={ph} value={pw[k]} onChange={(e) => setPw({ ...pw, [k]: e.target.value })} className={cn("pr-10", k === "current" && error && "border-red-400")} /><button type="button" onClick={() => setShow({ ...show, [k]: !show[k] })} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">{show[k] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div>
                    {k === "current" && error && <p className="mt-1 text-[11px] text-red-600">{error}</p>}
                    {k === "next" && pw.next && <div className="mt-2 flex items-center gap-2"><div className="flex flex-1 gap-1">{[1, 2, 3, 4].map((n) => <span key={n} className={cn("h-1 flex-1 rounded-full", n <= strength ? strengthCls : "bg-slate-200")} />)}</div><span className={cn("text-[10px] font-medium", strength >= 4 ? "text-green-600" : strength >= 3 ? "text-blue-600" : "text-amber-600")}>{strengthLabel}</span></div>}
                  </div>
                ))}
                <div className="flex gap-2 pt-1"><Button type="submit" disabled={!pw.current || pw.next.length < 8 || pw.next !== pw.confirm}>Update Password</Button><Button type="button" variant="secondary" onClick={() => { setPw({ current: "", next: "", confirm: "" }); setError(""); }}>Cancel</Button></div>
                <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-[10px] text-slate-400"><Info className="h-3 w-3" /> Demo: type <span className="font-semibold text-slate-600">wrong</span> as the current password to simulate an incorrect password error.</div>
              </form>
            </Section>
          </div>
        )}
      </div>
    </div>
  );
}
