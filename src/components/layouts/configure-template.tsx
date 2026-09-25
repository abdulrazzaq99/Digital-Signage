"use client";
import { useCompanyScope } from "@/components/admin/company-scope";
import { PortalTemplateArt } from "@/components/portal/template-art";
import { UseTemplate } from "@/components/portal/use-template";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, SectionLabel } from "@/components/ui/card";
import { applyApiError, Field as FormField, fieldError, FormError, maskedRegister, SubmitButton, useZodForm } from "@/components/ui/form";
import { Checkbox, Input, Select } from "@/components/ui/input";
import { Alert, BackLink, Stepper } from "@/components/ui/misc";
import { useToast } from "@/components/ui/toast";
import { useCreateTemplate } from "@/lib/api/hooks/templates";
import { label } from "@/lib/format";
import { maskInteger, maskName } from "@/lib/validation/masks";
import { ArrowLeft, ArrowRight, Lock, Plus, Save, Trash2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useFieldArray, useWatch } from "react-hook-form";
import { KEY_MAX, keyFromLabel, MAX_FIELDS, maskTemplateKey, templateSchema, toTemplateBody } from "./template-schema";

/** Steps 2–3 of defining a template: the editable fields, then review and create. */
function DefineTemplate({ name, category, orientation }: { name: string; category: string; orientation: "LANDSCAPE" | "PORTRAIT" }) {
  const router = useRouter();
  const toast = useToast();
  const create = useCreateTemplate();
  const [step, setStep] = useState<2 | 3>(2);
  const form = useZodForm(templateSchema, { defaultValues: { name, category, orientation, fields: [{ key: "title", label: "Title", type: "text", required: true, max: "60" }] } });
  const { register, control, formState, setValue, getValues } = form;
  const fieldArray = useFieldArray({ control, name: "fields" });
  const fields = useWatch({ control, name: "fields" }) ?? [];
  const previewFields = fields.map((f) => ({ key: f.key || "field", label: f.label, type: f.type as "text" | "image" | "color", required: f.required }));
  const previewValues = Object.fromEntries(fields.map((f) => [f.key, f.label]));
  const fieldsError = (formState.errors.fields as { root?: { message?: string }; message?: string } | undefined);
  const basicsError = formState.errors.name?.message ?? formState.errors.category?.message;

  const next = form.handleSubmit(() => setStep(3), (errors) => { if (errors.name || errors.category) setStep(3); });
  const submit = form.handleSubmit(async (v) => {
    try {
      const t = await create.mutateAsync(toTemplateBody(v));
      toast.success("Template created", t.name);
      router.replace(`/layouts/${t.id}`);
    } catch (e) {
      applyApiError(form, e);
      if (Object.keys(form.formState.errors).includes("fields")) setStep(2);
    }
  });
  /** Typing a label fills the key until the key is edited by hand. */
  const onLabel = (i: number, prevLabel: string) => (e: { target: { value: string } }) => {
    const key = getValues(`fields.${i}.key`);
    if (!key || key === keyFromLabel(prevLabel)) setValue(`fields.${i}.key`, keyFromLabel(e.target.value), { shouldValidate: formState.isSubmitted });
  };

  return (
    <div className="space-y-5">
      <BackLink href="/layouts" label="Templates" current={name} />
      <div className="flex justify-end"><Stepper steps={["Basic Info", "Fields", "Review"]} current={step} compact className="w-full max-w-md" /></div>
      <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
        <div className="space-y-3">
          <div className="relative rounded-xl border-[6px] border-slate-900 bg-slate-900 shadow-2xl">
            <span className="absolute right-3 top-3 z-10 flex items-center gap-1 rounded bg-slate-800 px-2 py-0.5 text-[10px] font-semibold text-white"><Lock className="h-2.5 w-2.5" /> FIXED LAYOUT</span>
            <PortalTemplateArt template={{ name, category, fields: previewFields }} values={previewValues} className="rounded-md text-xl" />
          </div>
          <Alert tone="blue" icon={<Lock className="h-3.5 w-3.5 shrink-0" />} className="bg-slate-50 border-slate-200 text-slate-500">Customers can only fill in the fields you define here. Layout, fonts, and positions stay locked.</Alert>
        </div>

        {step === 2 ? (
          <Card className="px-5 py-5">
            <form onSubmit={next} noValidate>
              <div className="flex items-center gap-2"><h2 className="text-base font-bold text-slate-900">Editable Fields</h2><Badge tone="red">{category}</Badge><Badge tone="slate">{label(orientation)}</Badge></div>
              <p className="mt-0.5 text-xs text-slate-400">Each field becomes an input in the customer&apos;s template form. {fields.length}/{MAX_FIELDS} fields.</p>
              <ul className="mt-4 space-y-3">
                {fieldArray.fields.map((row, i) => {
                  const f = fields[i] ?? row;
                  const labelReg = register(`fields.${i}.label`);
                  return (
                    <li key={row.id} className="rounded-lg border border-slate-200 p-3">
                      <div className="grid gap-2 sm:grid-cols-2">
                        <FormField label="Label" required error={fieldError(form, `fields.${i}.label`)}><Input placeholder="Headline" maxLength={80} {...labelReg} onChange={(e) => { onLabel(i, f.label)(e); e.target.value = maskName(e.target.value); return labelReg.onChange(e); }} /></FormField>
                        <FormField label="Key" required error={fieldError(form, `fields.${i}.key`)}><Input className="font-mono" placeholder="headline" maxLength={KEY_MAX} autoCapitalize="off" spellCheck={false} {...maskedRegister(form, `fields.${i}.key`, maskTemplateKey)} /></FormField>
                        <FormField label="Type"><Select {...register(`fields.${i}.type`)}><option value="text">Text</option><option value="image">Image</option><option value="color">Color</option></Select></FormField>
                        <FormField label="Max length" error={fieldError(form, `fields.${i}.max`)} hint={f.type === "text" ? "1–2000 · blank = no limit" : "Text fields only"}><Input inputMode="numeric" placeholder="No limit" disabled={f.type !== "text"} {...maskedRegister(form, `fields.${i}.max`, (v) => maskInteger(v, 4))} /></FormField>
                      </div>
                      <div className="mt-2 flex items-center justify-between"><label className="flex items-center gap-2 text-xs text-slate-600"><Checkbox checked={!!f.required} onChange={(v) => setValue(`fields.${i}.required`, v, { shouldDirty: true })} /> Required</label><button type="button" onClick={() => fieldArray.remove(i)} disabled={fields.length === 1} className="flex items-center gap-1 text-[11px] text-red-600 hover:underline disabled:opacity-40"><Trash2 className="h-3 w-3" /> Remove</button></div>
                    </li>
                  );
                })}
              </ul>
              {(fieldsError?.root?.message ?? fieldsError?.message) && <p role="alert" className="mt-2 text-[11px] font-medium text-red-600">{fieldsError?.root?.message ?? fieldsError?.message}</p>}
              <Button type="button" variant="secondary" size="sm" className="mt-3" onClick={() => fieldArray.append({ key: "", label: "", type: "text", required: false, max: "" })} disabled={fields.length >= MAX_FIELDS}><Plus className="h-3.5 w-3.5" /> Add Field</Button>
              <div className="mt-5 flex justify-between"><Button type="button" variant="secondary" href="/layouts"><ArrowLeft className="h-3.5 w-3.5" /> Cancel</Button><Button type="submit">Review <ArrowRight className="h-3.5 w-3.5" /></Button></div>
            </form>
          </Card>
        ) : (
          <Card className="px-5 py-5">
            <form onSubmit={submit} noValidate>
              <h2 className="text-base font-bold text-slate-900">Review</h2>
              <dl className="mt-3 divide-y divide-slate-100 text-xs">
                {[["Name", name], ["Category", category], ["Orientation", label(orientation)], ["Fields", `${fields.length}`], ["Scope", "Global — available to every company"]].map(([k, v]) => <div key={k} className="flex justify-between py-2"><dt className="text-slate-400">{k}</dt><dd className="font-semibold text-slate-800">{v}</dd></div>)}
              </dl>
              {basicsError && <Alert tone="red" className="mt-3">{formState.errors.name ? `Name: ${formState.errors.name.message}` : `Category: ${formState.errors.category?.message}`}. Start again from the Templates page.</Alert>}
              <SectionLabel className="mt-4">Fields</SectionLabel>
              <ul className="mt-2 space-y-1.5">{fields.map((f, i) => <li key={`${f.key}-${i}`} className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/60 px-3 py-2 text-xs"><span className="font-semibold text-slate-800">{f.label} <span className="font-mono font-normal text-slate-400">{f.key}</span></span><span className="flex items-center gap-1.5 text-[10px] text-slate-400">{f.type}{f.required && <Badge tone="red">Required</Badge>}{f.type === "text" && (f.max ? <span>max {f.max}</span> : <span>no limit</span>)}</span></li>)}</ul>
              <FormError form={form} className="mt-3" />
              <div className="mt-5 flex justify-between"><Button type="button" variant="secondary" onClick={() => setStep(2)} disabled={formState.isSubmitting}><ArrowLeft className="h-3.5 w-3.5" /> Back</Button><SubmitButton form={form} disabled={!!basicsError} pendingText="Creating…"><Save className="h-3.5 w-3.5" /> Create Template</SubmitButton></div>
            </form>
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
