"use client";
import { useCompanyScope } from "@/components/admin/company-scope";
import { PortalTemplateArt } from "@/components/portal/template-art";
import { UseTemplate } from "@/components/portal/use-template";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, SectionLabel } from "@/components/ui/card";
import { Checkbox, Input, Label, Select } from "@/components/ui/input";
import { Alert, BackLink, Stepper } from "@/components/ui/misc";
import { useToast } from "@/components/ui/toast";
import { useCreateTemplate } from "@/lib/api/hooks/templates";
import type { Schemas } from "@/lib/api/types";
import { label } from "@/lib/format";
import { ArrowLeft, ArrowRight, Lock, Plus, Save, Trash2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

type Field = Schemas["CreateTemplateBody"]["fields"][number];
const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "").slice(0, 40);

/** Steps 2–3 of defining a template: the editable fields, then review and create. */
function DefineTemplate({ name, category, orientation }: { name: string; category: string; orientation: "LANDSCAPE" | "PORTRAIT" }) {
  const router = useRouter();
  const toast = useToast();
  const create = useCreateTemplate();
  const [step, setStep] = useState<2 | 3>(2);
  const [fields, setFields] = useState<Field[]>([{ key: "title", label: "Title", type: "text", required: true, max: 60 }]);
  const setField = (i: number, patch: Partial<Field>) => setFields((f) => f.map((x, j) => (j === i ? { ...x, ...patch } : x)));
  const keysUnique = new Set(fields.map((f) => f.key)).size === fields.length;
  const valid = fields.length > 0 && fields.every((f) => f.key && f.label) && keysUnique;
  const previewValues = Object.fromEntries(fields.map((f) => [f.key, f.label]));
  const submit = () => create.mutate({ name, category, orientation, fields: fields.map((f) => ({ ...f, max: f.max || undefined })) }, { onSuccess: (t) => { toast.success("Template created", t.name); router.replace(`/layouts/${t.id}`); }, onError: (e) => toast.error(e, "Couldn't create template") });

  return (
    <div className="space-y-5">
      <BackLink href="/layouts" label="Templates" current={name} />
      <div className="flex justify-end"><Stepper steps={["Basic Info", "Fields", "Review"]} current={step} compact className="w-full max-w-md" /></div>
      <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
        <div className="space-y-3">
          <div className="relative rounded-xl border-[6px] border-slate-900 bg-slate-900 shadow-2xl">
            <span className="absolute right-3 top-3 z-10 flex items-center gap-1 rounded bg-slate-800 px-2 py-0.5 text-[10px] font-semibold text-white"><Lock className="h-2.5 w-2.5" /> FIXED LAYOUT</span>
            <PortalTemplateArt template={{ name, category, fields }} values={previewValues} className="rounded-md text-xl" />
          </div>
          <Alert tone="blue" icon={<Lock className="h-3.5 w-3.5 shrink-0" />} className="bg-slate-50 border-slate-200 text-slate-500">Customers can only fill in the fields you define here. Layout, fonts, and positions stay locked.</Alert>
        </div>

        {step === 2 ? (
          <Card className="px-5 py-5">
            <div className="flex items-center gap-2"><h2 className="text-base font-bold text-slate-900">Editable Fields</h2><Badge tone="red">{category}</Badge><Badge tone="slate">{label(orientation)}</Badge></div>
            <p className="mt-0.5 text-xs text-slate-400">Each field becomes an input in the customer&apos;s template form.</p>
            <ul className="mt-4 space-y-3">
              {fields.map((f, i) => (
                <li key={i} className="rounded-lg border border-slate-200 p-3">
                  <div className="grid gap-2 sm:grid-cols-2">
                    <div><Label required>Label</Label><Input value={f.label} onChange={(e) => setField(i, { label: e.target.value, key: f.key === slug(f.label) || !f.key ? slug(e.target.value) : f.key })} placeholder="Headline" /></div>
                    <div><Label required>Key</Label><Input value={f.key} onChange={(e) => setField(i, { key: slug(e.target.value) })} className="font-mono" placeholder="headline" /></div>
                    <div><Label>Type</Label><Select value={f.type} onChange={(e) => setField(i, { type: e.target.value as Field["type"] })}><option value="text">Text</option><option value="image">Image</option><option value="color">Color</option></Select></div>
                    <div><Label>Max length</Label><Input type="number" min={1} value={f.max ?? ""} onChange={(e) => setField(i, { max: e.target.value ? Number(e.target.value) : undefined })} placeholder="optional" /></div>
                  </div>
                  <div className="mt-2 flex items-center justify-between"><label className="flex items-center gap-2 text-xs text-slate-600"><Checkbox checked={!!f.required} onChange={(v) => setField(i, { required: v })} /> Required</label><button type="button" onClick={() => setFields((x) => x.filter((_, j) => j !== i))} disabled={fields.length === 1} className="flex items-center gap-1 text-[11px] text-red-600 hover:underline disabled:opacity-40"><Trash2 className="h-3 w-3" /> Remove</button></div>
                </li>
              ))}
            </ul>
            {!keysUnique && <p className="mt-2 text-[11px] text-red-600">Field keys must be unique.</p>}
            <Button variant="secondary" size="sm" className="mt-3" onClick={() => setFields((f) => [...f, { key: "", label: "", type: "text", required: false }])} disabled={fields.length >= 20}><Plus className="h-3.5 w-3.5" /> Add Field</Button>
            <div className="mt-5 flex justify-between"><Button variant="secondary" href="/layouts"><ArrowLeft className="h-3.5 w-3.5" /> Cancel</Button><Button onClick={() => setStep(3)} disabled={!valid}>Review <ArrowRight className="h-3.5 w-3.5" /></Button></div>
          </Card>
        ) : (
          <Card className="px-5 py-5">
            <h2 className="text-base font-bold text-slate-900">Review</h2>
            <dl className="mt-3 divide-y divide-slate-100 text-xs">
              {[["Name", name], ["Category", category], ["Orientation", label(orientation)], ["Fields", `${fields.length}`], ["Scope", "Global — available to every company"]].map(([k, v]) => <div key={k} className="flex justify-between py-2"><dt className="text-slate-400">{k}</dt><dd className="font-semibold text-slate-800">{v}</dd></div>)}
            </dl>
            <SectionLabel className="mt-4">Fields</SectionLabel>
            <ul className="mt-2 space-y-1.5">{fields.map((f) => <li key={f.key} className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/60 px-3 py-2 text-xs"><span className="font-semibold text-slate-800">{f.label} <span className="font-mono font-normal text-slate-400">{f.key}</span></span><span className="flex items-center gap-1.5 text-[10px] text-slate-400">{f.type}{f.required && <Badge tone="red">Required</Badge>}{f.max && <span>max {f.max}</span>}</span></li>)}</ul>
            <div className="mt-5 flex justify-between"><Button variant="secondary" onClick={() => setStep(2)}><ArrowLeft className="h-3.5 w-3.5" /> Back</Button><Button onClick={submit} disabled={create.isPending}><Save className="h-3.5 w-3.5" /> {create.isPending ? "Creating…" : "Create Template"}</Button></div>
          </Card>
        )}
      </div>
    </div>
  );
}

/**
 * `/layouts/new/configure?t=<templateId>&company=` → use an existing template for a company;
 * `/layouts/new/configure?name=&category=&o=` → define a new global template.
 */
export function ConfigureTemplate() {
  const sp = useSearchParams();
  const scope = useCompanyScope();
  const t = sp.get("t");
  if (t) return <UseTemplate id={t} companyId={scope.companyId} basePath="/layouts" />;
  const name = sp.get("name")?.trim();
  if (!name) return <div className="space-y-3"><Alert tone="amber">Start from the Templates page to define a new template.</Alert><Button href="/layouts" variant="secondary">Back to Templates</Button></div>;
  return <DefineTemplate name={name} category={sp.get("category") || "Corporate"} orientation={sp.get("o") === "PORTRAIT" ? "PORTRAIT" : "LANDSCAPE"} />;
}
