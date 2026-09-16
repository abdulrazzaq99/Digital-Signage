"use client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input, Label, Select } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Avatar } from "@/components/ui/misc";
import { TD, TH, THead, TR, Table } from "@/components/ui/table";
import { portalCompany, portalUser, portalUsers, type PortalUser } from "@/lib/portal-data";
import { cn } from "@/lib/utils";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { UserDrawer } from "./user-drawer";

type Tab = "profile" | "company" | "users";
const roleTone = (r: PortalUser["role"]) => (r === "Admin" ? "purple" : r === "Editor" ? "blue" : "slate");
const statusTone = (s: PortalUser["status"]) => (s === "Active" ? "green" : s === "Invited" ? "blue" : "slate");

export function AccountPage() {
  const [tab, setTab] = useState<Tab>("profile");
  const [changingPw, setChangingPw] = useState(false);
  const [users, setUsers] = useState(portalUsers);
  const [drawer, setDrawer] = useState<{ mode: "add" | "edit"; user?: PortalUser } | null>(null);
  const [remove, setRemove] = useState<PortalUser | null>(null);

  return (
    <div className="space-y-5">
      <div className="inline-flex rounded-lg border border-slate-200 bg-slate-100 p-1">{([["profile", "Profile"], ["company", "Company Settings"], ["users", "Users"]] as [Tab, string][]).map(([k, l]) => <button key={k} onClick={() => setTab(k)} className={cn("h-7 rounded-md px-4 text-xs font-medium transition-colors", tab === k ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800")}>{l}</button>)}</div>

      {tab === "profile" && (
        <div className="max-w-[520px] space-y-6 animate-fade-in">
          <div className="flex items-center gap-4"><Avatar name={portalUser.name} src={`https://picsum.photos/seed/${portalUser.seed}/96/96`} size="lg" /><div><div className="text-sm font-semibold text-slate-900">{portalUser.name}</div><div className="text-[11px] text-slate-400">{portalUser.role} · {portalCompany.name}</div></div></div>
          <form onSubmit={(e) => e.preventDefault()} className="space-y-4 border-t border-slate-100 pt-5">
            <div className="text-sm font-semibold text-slate-900">Personal Information</div>
            <div><Label>Full Name</Label><Input defaultValue={portalUser.name} /></div>
            <div><Label>Email Address</Label><Input defaultValue={portalUser.email} disabled className="bg-slate-50 text-slate-400" /><p className="mt-1 text-[10px] text-slate-400">Contact your account manager to change your email address.</p></div>
            <div><Label>Job Title</Label><Input defaultValue={portalUser.title} /></div>
            <div><Label>Phone Number</Label><Input defaultValue={portalUser.phone} /></div>
            <Button type="submit" size="sm">Save Changes</Button>
          </form>
          <div className="border-t border-slate-100 pt-5">
            <div className="flex items-center justify-between"><div><div className="text-sm font-semibold text-slate-900">Security</div><div className="text-[11px] text-slate-400">Update your password.</div></div><Button variant="secondary" size="sm" onClick={() => setChangingPw((v) => !v)}>{changingPw ? "Cancel" : "Change Password"}</Button></div>
            {changingPw && <form onSubmit={(e) => { e.preventDefault(); setChangingPw(false); }} className="mt-4 space-y-4 animate-fade-in"><div><Label>Current Password</Label><Input type="password" placeholder="••••••••" /></div><div><Label>New Password</Label><Input type="password" placeholder="••••••••" /><p className="mt-1 text-[10px] text-slate-400">Minimum 8 characters.</p></div><div><Label>Confirm New Password</Label><Input type="password" placeholder="••••••••" /></div><Button type="submit" size="sm">Update Password</Button></form>}
          </div>
        </div>
      )}

      {tab === "company" && (
        <div className="max-w-[520px] space-y-6 animate-fade-in">
          <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
            <div><div className="text-sm font-semibold text-slate-900">Company Information</div><div className="text-[11px] text-slate-400">Update your company details visible across the platform.</div></div>
            <div><Label>Company Name</Label><Input defaultValue={portalCompany.name} /></div>
            <div><Label>Website</Label><Input defaultValue={portalCompany.website} /></div>
            <div><Label>Industry</Label><Select defaultValue=""><option value="">Select industry</option><option>Retail</option><option>Hospitality</option><option>Corporate</option><option>Healthcare</option><option>Education</option></Select></div>
            <div><Label>Phone Number</Label><Input defaultValue={portalCompany.phone} /></div>
            <div><Label>Timezone</Label><Select defaultValue=""><option value="">Select timezone</option><option>Europe/London (UTC+0)</option><option>UTC</option><option>America/New_York (UTC-4)</option></Select></div>
            <Button type="submit" size="sm">Save Changes</Button>
          </form>
          <div className="border-t border-slate-100 pt-5">
            <div className="text-sm font-semibold text-slate-900">Account Details</div><p className="mt-0.5 text-[11px] text-slate-400">These details are managed by SignagePlatform. Contact support to request changes.</p>
            <dl className="mt-4 grid grid-cols-2 gap-4 text-xs">{[["Account ID", portalCompany.accountId], ["Plan", portalCompany.plan], ["Contract Start", portalCompany.contractStart], ["Account Status", portalCompany.status]].map(([k, v]) => <div key={k}><dt className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">{k}</dt><dd className="mt-0.5 font-medium text-slate-800">{v}</dd></div>)}</dl>
          </div>
        </div>
      )}

      {tab === "users" && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex flex-wrap items-center justify-between gap-3"><span className="text-xs text-slate-400">{users.length} users · {portalCompany.name}</span><Button size="sm" onClick={() => setDrawer({ mode: "add" })}><Plus className="h-3.5 w-3.5" /> Add User</Button></div>
          <Card>
            <Table>
              <THead><tr><TH>User</TH><TH>Email</TH><TH>Role</TH><TH>Status</TH><TH> </TH></tr></THead>
              <tbody>
                {users.map((u) => (
                  <TR key={u.id}>
                    <TD><div className="flex items-center gap-3"><Avatar name={u.name} src={`https://picsum.photos/seed/${u.seed}/64/64`} size="sm" /><span className="flex items-center gap-2 text-sm font-semibold text-slate-900 whitespace-nowrap">{u.name}{u.you && <Badge tone="blue">You</Badge>}</span></div></TD>
                    <TD className="text-xs whitespace-nowrap">{u.email}</TD>
                    <TD><Badge tone={roleTone(u.role)}>{u.role}</Badge></TD>
                    <TD><Badge tone={statusTone(u.status)} dot>{u.status}</Badge></TD>
                    <TD className="text-right"><div className="flex justify-end gap-1"><button onClick={() => setDrawer({ mode: "edit", user: u })} className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 text-slate-400 hover:text-slate-700" aria-label="Edit"><Pencil className="h-3.5 w-3.5" /></button>{!u.you && <button onClick={() => setRemove(u)} className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 text-slate-400 hover:text-red-500" aria-label="Remove"><Trash2 className="h-3.5 w-3.5" /></button>}</div></TD>
                  </TR>
                ))}
              </tbody>
            </Table>
          </Card>
        </div>
      )}

      <UserDrawer mode={drawer?.mode ?? null} user={drawer?.user} onClose={() => setDrawer(null)} />
      <Modal open={!!remove} onClose={() => setRemove(null)} width="max-w-[380px]">
        {remove && <div className="p-5"><h2 className="text-sm font-semibold text-slate-900">Remove user?</h2><p className="mt-2 text-xs leading-5 text-slate-500"><span className="font-semibold text-slate-800">{remove.name}</span> will lose access to your {portalCompany.name} account immediately.</p><div className="mt-4 flex gap-2"><Button variant="danger" className="flex-1" onClick={() => { setUsers((u) => u.filter((x) => x.id !== remove.id)); setRemove(null); }}>Remove User</Button><Button variant="secondary" onClick={() => setRemove(null)}>Cancel</Button></div></div>}
      </Modal>
    </div>
  );
}
