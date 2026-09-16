"use client";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { Avatar, Drawer } from "@/components/ui/misc";
import type { PortalUser } from "@/lib/portal-data";
import { X } from "lucide-react";

export function UserDrawer({ mode, user, onClose }: { mode: "add" | "edit" | null; user?: PortalUser | null; onClose: () => void }) {
  const open = mode !== null;
  return (
    <Drawer open={open} onClose={onClose}>
      <div className="flex items-start justify-between border-b border-slate-100 px-5 py-4">
        {mode === "edit" && user ? <div className="flex items-center gap-3"><Avatar name={user.name} src={`https://picsum.photos/seed/${user.seed}/80/80`} size="md" /><div><div className="text-sm font-semibold text-slate-900">{user.name}</div><div className="text-[11px] text-slate-400">{user.email}</div></div></div> : <div className="text-sm font-semibold text-slate-900">Add User</div>}
        <button onClick={onClose} className="flex h-6 w-6 items-center justify-center rounded-md border border-slate-200 text-slate-400 hover:bg-slate-50"><X className="h-3.5 w-3.5" /></button>
      </div>
      <form onSubmit={(e) => { e.preventDefault(); onClose(); }} className="flex flex-1 flex-col">
        <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
          {user?.you && <div className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-[11px] text-blue-700">This is your own account. Some fields may be limited.</div>}
          <div><Label>Full Name</Label><Input placeholder="Full name" defaultValue={user?.name} /></div>
          <div><Label>Email Address</Label><Input type="email" placeholder="name@company.com" defaultValue={user?.email} disabled={mode === "edit"} className={mode === "edit" ? "bg-slate-50 text-slate-400" : ""} />{mode === "edit" && <p className="mt-1 text-[10px] text-slate-400">Contact support to change a user&apos;s email address.</p>}</div>
          <div><Label>Role</Label><Select defaultValue={user?.role ?? ""}><option value="" disabled>Select a role</option><option>Admin</option><option>Editor</option><option>Viewer</option></Select><p className="mt-1.5 text-[10px] leading-4 text-slate-400"><span className="font-semibold text-slate-600">Admin</span> — full access · <span className="font-semibold text-slate-600">Editor</span> — manage content · <span className="font-semibold text-slate-600">Viewer</span> — read only</p></div>
        </div>
        <div className="flex gap-2 border-t border-slate-100 px-5 py-4"><Button type="submit" className="flex-1">{mode === "add" ? "Add User" : "Save Changes"}</Button><Button type="button" variant="secondary" onClick={onClose}>Cancel</Button></div>
      </form>
    </Drawer>
  );
}
