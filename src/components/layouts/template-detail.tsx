"use client";
import { useCompanyScope } from "@/components/admin/company-scope";
import { PortalTemplateArt } from "@/components/portal/template-art";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Modal, ModalFooter, ModalHeader } from "@/components/ui/modal";
import { Alert, BackLink } from "@/components/ui/misc";
import { QueryState, Skeleton } from "@/components/ui/query-state";
import { useToast } from "@/components/ui/toast";
import { useDeleteTemplate, useTemplates } from "@/lib/api/hooks/templates";
import type { Template } from "@/lib/api/types";
import { formatDate, label } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Check, ImageIcon, LayoutTemplate, Lock, Palette, Shield, Trash2, Type } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

const FIXED = ["Layout structure", "Typography hierarchy", "Element positions", "Colour theme", "Brand elements"];

function Detail({ t }: { t: Template }) {
  const router = useRouter();
  const toast = useToast();
  const scope = useCompanyScope();
  const remove = useDeleteTemplate();
  const [del, setDel] = useState(false);
  const portrait = t.orientation === "PORTRAIT";
  const doDelete = () => remove.mutate(t.id, { onSuccess: () => { toast.success("Template deleted"); router.replace("/layouts"); }, onError: (e) => toast.error(e) });
  return (
    <div className="space-y-5">
      <BackLink href="/layouts" label="Back to Templates" current={t.name} />
      <div className="grid gap-6 xl:grid-cols-[1fr_460px]">
        <div>
          <div className={cn("relative rounded-xl border-[6px] border-slate-900 bg-slate-900 shadow-2xl", portrait && "mx-auto max-w-[360px]")}>
            <span className="absolute right-3 top-3 z-10 rounded bg-blue-600 px-2 py-0.5 text-[10px] font-semibold text-white">{t.fields.length} editable fields</span>
            <span className="absolute left-3 top-2 z-10 text-[9px] text-white/50">{portrait ? "9:16" : "16:9"} PREVIEW</span>
            <PortalTemplateArt template={t} values={Object.fromEntries(t.fields.map((f) => [f.key, f.label]))} className="rounded-md text-xl" />
          </div>
          <div className="mt-3 flex gap-2">{[`${portrait ? "1080 × 1920" : "1920 × 1080"} px`, label(t.orientation), portrait ? "9:16" : "16:9", t.isGlobal ? "Global" : "Company"].map((x) => <Badge key={x} tone="slate">{x}</Badge>)}</div>
        </div>
        <div className="space-y-4">
          <div><h1 className="text-xl font-bold tracking-tight text-slate-900">{t.name}</h1><div className="mt-1 flex items-center gap-2 text-[11px] text-slate-400"><Badge tone="purple">{t.category}</Badge>Created {formatDate(t.createdAt)} · Used in {t.usedIn} instance{t.usedIn === 1 ? "" : "s"}</div></div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">{[["Created", formatDate(t.createdAt)], ["Orientation", label(t.orientation)], ["Used In", `${t.usedIn} instance${t.usedIn === 1 ? "" : "s"}`]].map(([k, v]) => <Card key={k} className="px-3 py-2"><div className="text-[10px] text-slate-400">{k}</div><div className="text-xs font-semibold text-slate-900">{v}</div></Card>)}</div>
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-900">Editable Fields <Badge tone="green">{t.fields.length} fields</Badge></div>
            <ul className="mt-2 space-y-1.5">{t.fields.map((f) => <li key={f.key} className="flex items-center justify-between rounded-lg border border-green-100 bg-green-50/40 px-3 py-2 text-xs"><span className="flex items-center gap-2"><Check className="h-3.5 w-3.5 rounded-full bg-green-500 p-0.5 text-white" /><span className="font-semibold text-slate-800">{f.label}</span><span className="font-mono text-[10px] text-slate-400">{f.key}</span></span><span className="flex items-center gap-1.5 text-[10px] text-slate-400">{f.type === "text" ? <Type className="h-3 w-3" /> : f.type === "image" ? <ImageIcon className="h-3 w-3" /> : <Palette className="h-3 w-3" />}{f.type}{f.required && <Badge tone="red">Required</Badge>}{f.max && <span>max {f.max}</span>}</span></li>)}</ul>
          </div>
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-900">Fixed Elements <Badge tone="slate">Cannot be changed</Badge></div>
            <ul className="mt-2 space-y-1.5">{FIXED.map((f) => <li key={f} className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/60 px-3 py-2 text-xs"><span className="flex items-center gap-2 text-slate-600"><Lock className="h-3 w-3 text-slate-400" />{f}</span><span className="text-[10px] text-slate-400">Locked</span></li>)}</ul>
          </div>
          <Alert tone="blue" icon={<Shield className="h-3.5 w-3.5 shrink-0" />}><span className="font-semibold">Fixed-Layout Template</span><br />Customers may only edit the fields listed above. Layout structure, fonts, element positions, and overall design are locked by the template.</Alert>
          <Button href={scope.withCompany(`/layouts/new/configure?t=${t.id}`)} size="lg" className="w-full"><LayoutTemplate className="h-4 w-4" /> Use Template for {scope.companyName || "a company"}</Button>
          <Button variant="danger-outline" className="w-full" onClick={() => setDel(true)}><Trash2 className="h-3.5 w-3.5" /> Delete Template</Button>
        </div>
      </div>
      <Modal open={del} onClose={() => setDel(false)} width="max-w-md">
        <ModalHeader title={`Delete "${t.name}"?`} subtitle={t.usedIn ? `${t.usedIn} customer instance${t.usedIn > 1 ? "s" : ""} use this template; the API refuses while they exist.` : "Customers will no longer be able to create content from it."} onClose={() => setDel(false)} />
        <ModalFooter><Button variant="secondary" onClick={() => setDel(false)}>Cancel</Button><Button variant="danger" onClick={doDelete} disabled={remove.isPending}>{remove.isPending ? "Deleting…" : "Delete Template"}</Button></ModalFooter>
      </Modal>
    </div>
  );
}

export function TemplateDetail({ id }: { id: string }) {
  const templates = useTemplates();
  return <QueryState query={templates} skeleton={<div className="grid gap-6 xl:grid-cols-[1fr_460px]"><Skeleton className="aspect-video" /><Skeleton className="h-96" /></div>}>{({ data }) => { const t = data.find((x) => x.id === id); return t ? <Detail t={t} /> : <div className="text-sm text-slate-500">Template not found.</div>; }}</QueryState>;
}
