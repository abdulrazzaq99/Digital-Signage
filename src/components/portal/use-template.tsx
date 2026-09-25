"use client";
import { Button } from "@/components/ui/button";
import { applyApiError, Field, fieldError, FormError, maskedRegister, SubmitButton, useZodForm } from "@/components/ui/form";
import { Input, Select } from "@/components/ui/input";
import { QueryState, Skeleton } from "@/components/ui/query-state";
import { useToast } from "@/components/ui/toast";
import { useMedia } from "@/lib/api/hooks/media";
import { useCreateInstance, usePublishInstance, useRenderInstance, useTemplateInstance, useTemplates, useUpdateInstance } from "@/lib/api/hooks/templates";
import type { Template, TemplateInstance } from "@/lib/api/types";
import { errorMessage, label } from "@/lib/format";
import { hexColour, optionalText, text } from "@/lib/validation/fields";
import { maskHexColour, maskName } from "@/lib/validation/masks";
import { Lock, RefreshCw, Save, Send, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useWatch, type UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { BackLinkButton } from "./portal-stepper";
import { PublishTarget } from "./publish-target";
import { PortalTemplateArt } from "./template-art";

type TemplateField = Template["fields"][number];
const DEFAULT_COLOUR = "#000000";
const isHex6 = (v: string) => /^#[0-9a-fA-F]{6}$/.test(v);
/** A colour field starts on a colour a native picker can show: the field's own colour, else black. */
const colourDefault = (f: TemplateField) => (f.color && isHex6(f.color) ? f.color.toLowerCase() : DEFAULT_COLOUR);

/**
 * Instance form rules from the template itself: the name is 1–120 characters; a text field is capped
 * at its `max` (and the API's 2000) and must be non-blank when required; a colour is a hex colour;
 * a required image must be picked.
 */
function instanceSchema(fields: TemplateField[]) {
  const shape: Record<string, z.ZodType<string, string>> = {};
  for (const f of fields) {
    if (f.type === "color") shape[f.key] = f.required ? hexColour() : z.union([z.literal(""), hexColour()]);
    else if (f.type === "image") shape[f.key] = f.required ? z.string().min(1, "Choose an image") : z.string();
    else {
      const max = Math.min(f.max && f.max > 0 ? f.max : 2000, 2000);
      shape[f.key] = f.required ? text(max) : optionalText(max);
    }
  }
  return z.object({ name: text(120), values: z.object(shape) });
}

type InstanceValues = { name: string; values: Record<string, string> };
type AriaProps = { id?: string; "aria-invalid"?: boolean; "aria-describedby"?: string };

/** Image fields take a ready image from the company's media library; the API draws it into the render. */
function ImagePicker({ value, onChange, companyId, ...aria }: { value: string; onChange: (v: string) => void; companyId?: string | null } & AriaProps) {
  const media = useMedia({ type: "IMAGE", status: "READY", pageSize: 100 }, { companyId });
  const images = media.data?.data ?? [];
  const selected = images.find((m) => m.id === value);
  if (media.isError) return (
    <div role="alert" className="flex items-center justify-between gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
      <span>Couldn&apos;t load your images. {errorMessage(media.error)}</span>
      <Button type="button" size="sm" variant="secondary" onClick={() => media.refetch()}><RefreshCw className="h-3.5 w-3.5" /> Retry</Button>
    </div>
  );
  return (
    <div className="flex items-center gap-3">
      {selected?.thumbnailUrl && <img src={selected.thumbnailUrl} alt="" className="h-10 w-10 shrink-0 rounded-md border border-slate-200 object-cover" />}
      <Select className="flex-1" value={value} onChange={(e) => onChange(e.target.value)} disabled={media.isPending} {...aria}>
        <option value="">{media.isPending ? "Loading images…" : images.length ? "No image" : "No ready images in your media library"}</option>
        {images.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
      </Select>
    </div>
  );
}

/** Hex text box and a colour swatch bound to the same value. */
function ColourInput({ form, name, ...aria }: { form: UseFormReturn<InstanceValues>; name: `values.${string}` } & AriaProps) {
  const value = useWatch({ control: form.control, name }) ?? "";
  return (
    <div className="flex items-center gap-2">
      <input type="color" aria-label="Pick a colour" value={isHex6(value) ? value : DEFAULT_COLOUR} onChange={(e) => form.setValue(name, e.target.value.toLowerCase(), { shouldValidate: true, shouldDirty: true })} className="h-10 w-12 shrink-0 cursor-pointer rounded-lg border border-slate-200 bg-white p-1" />
      <Input className="font-mono" placeholder="#1a73e8" maxLength={7} autoCapitalize="off" spellCheck={false} {...aria} {...maskedRegister(form, name, maskHexColour)} />
    </div>
  );
}

/**
 * Fill a template's fields → create the instance → render it on the API → publish.
 * The instance is created on "Generate" so the rendered output is real, not a client mock-up.
 */
function Flow({ template, companyId, basePath }: { template: Template; companyId?: string | null; basePath: string }) {
  const router = useRouter();
  const toast = useToast();
  const create = useCreateInstance(companyId);
  const update = useUpdateInstance(companyId);
  const render = useRenderInstance(companyId);
  const publish = usePublishInstance(companyId);
  const fields = useMemo(() => template.fields ?? [], [template.fields]);
  const schema = useMemo(() => instanceSchema(fields), [fields]);
  const form = useZodForm(schema, { defaultValues: { name: (template.name ?? "").slice(0, 120), values: Object.fromEntries(fields.map((f) => [f.key, f.type === "color" ? colourDefault(f) : ""])) } }) as unknown as UseFormReturn<InstanceValues>;
  const { formState } = form;
  const values = (useWatch({ control: form.control, name: "values" }) ?? {}) as Record<string, string>;
  const [instance, setInstance] = useState<TemplateInstance | null>(null);
  const [phase, setPhase] = useState<"edit" | "output" | "publish">("edit");
  // Rendering is asynchronous (202); poll the instance until the worker has produced the output image.
  const live = useTemplateInstance(instance?.id ?? "", { companyId, enabled: !!instance && !instance.rendered, refetchInterval: 2000 });
  const current = live.data && instance && live.data.id === instance.id ? live.data : instance;
  const listHref = `${basePath}?tab=templates`;
  const busy = create.isPending || update.isPending || render.isPending || formState.isSubmitting;

  const generate = form.handleSubmit(async (v) => {
    try {
      // Blank optional fields are left out; the template's defaults fill them in the render.
      const filled = Object.fromEntries(Object.entries(v.values).map(([k, x]) => [k, x.trim()]).filter(([, x]) => x !== ""));
      const inst = instance ? await update.mutateAsync({ id: instance.id, name: v.name.trim(), values: filled }) : await create.mutateAsync({ templateId: template.id, name: v.name.trim(), values: filled });
      // Remember the saved instance first, so a failed render retries as an update instead of a duplicate.
      setInstance(inst);
      setInstance(await render.mutateAsync(inst.id));
      setPhase("output");
    } catch (e) { applyApiError(form, e); }
  });

  if (phase === "publish" && current) return <PublishTarget subject={current.name} companyId={companyId} onPublish={(sel) => publish.mutateAsync({ id: current.id, ...sel })} onBack={() => setPhase("output")} onDone={() => router.push(listHref)} />;

  if (phase === "output" && current) return (
    <div className="space-y-4 animate-fade-in">
      <BackLinkButton label="Edit Template" onClick={() => setPhase("edit")} />
      <div className="flex flex-wrap items-center justify-between gap-3"><div><h1 className="text-xl font-bold tracking-tight text-slate-900">{current.name} — Output</h1><p className="text-xs text-slate-400">{current.rendered ? "Rendered and saved to your library." : "Saved; rendering is still in progress."}</p></div><div className="flex flex-wrap gap-2"><Button variant="secondary" onClick={() => setPhase("edit")}>Back to Edit</Button><Button variant="secondary" onClick={() => { toast.success("Saved", current.name); router.push(listHref); }}><Save className="h-3.5 w-3.5" /> Save</Button><Button onClick={() => setPhase("publish")}><Send className="h-3.5 w-3.5" /> Publish</Button></div></div>
      <div className="max-w-[580px]">
        {current.outputUrl ? <img src={current.outputUrl} alt={current.name} className="aspect-video w-full rounded-lg bg-slate-900 object-contain shadow-xl" /> : <PortalTemplateArt template={template} values={values} className="text-2xl shadow-xl" />}
        <div className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-400"><Lock className="h-3 w-3" /> Design locked — only the fields are editable.</div>
      </div>
    </div>
  );

  return (
    <div className="space-y-4 animate-fade-in">
      <BackLinkButton label="Templates" onClick={() => router.push(listHref)} />
      <div><h1 className="text-lg font-bold tracking-tight text-slate-900">{template.name}</h1><p className="text-xs text-slate-400">{template.category} · {label(template.orientation).toLowerCase()}</p></div>
      <div className="grid gap-6 xl:grid-cols-[400px_1fr]">
        <div><PortalTemplateArt template={template} values={values} className="text-xl shadow-xl" /><div className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-400"><Lock className="h-3 w-3" /> Live preview — the API renders the final image.</div></div>
        <form onSubmit={generate} noValidate className="space-y-4">
          <FormError form={form} />
          <Field label="Name" required error={formState.errors.name?.message}><Input placeholder="e.g. Weekend Flash Sale" maxLength={120} {...maskedRegister(form, "name", maskName)} /></Field>
          {fields.map((f) => {
            const name = `values.${f.key}` as const;
            const max = f.type === "text" ? Math.min(f.max && f.max > 0 ? f.max : 2000, 2000) : undefined;
            return (
              <Field key={f.key} label={f.label} required={f.required} error={fieldError(form, name)} hint={f.type === "text" && f.max ? `${(values[f.key] ?? "").length}/${max}` : undefined}>
                {f.type === "image" ? <ImagePicker value={values[f.key] ?? ""} onChange={(v) => form.setValue(name, v, { shouldValidate: formState.isSubmitted, shouldDirty: true })} companyId={companyId} />
                  : f.type === "color" ? <ColourInput form={form} name={name} />
                  : <Input placeholder={f.label} maxLength={max} {...form.register(name)} />}
              </Field>
            );
          })}
          <SubmitButton form={form} className="w-full" disabled={busy} pendingText="Generating…"><Sparkles className="h-3.5 w-3.5" /> Generate Output</SubmitButton>
        </form>
      </div>
    </div>
  );
}

export function UseTemplate({ id, companyId, basePath = "/portal/layouts" }: { id: string; companyId?: string | null; basePath?: string }) {
  const templates = useTemplates();
  return (
    <QueryState query={templates} skeleton={<div className="grid gap-6 xl:grid-cols-[400px_1fr]"><Skeleton className="aspect-video" /><Skeleton className="h-64" /></div>}>
      {({ data }) => { const t = (data ?? []).find((x) => x.id === id); return t ? <Flow key={t.id} template={t} companyId={companyId} basePath={basePath} /> : <div className="text-sm text-slate-500">Template not found.</div>; }}
    </QueryState>
  );
}
