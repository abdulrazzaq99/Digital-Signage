"use client";
import { Button } from "@/components/ui/button";
import { Field, maskedRegister, SubmitButton, useZodForm } from "@/components/ui/form";
import { Input, Label, RadioCard, Select } from "@/components/ui/input";
import { Modal, ModalHeader } from "@/components/ui/modal";
import { Stepper } from "@/components/ui/misc";
import { maskName } from "@/lib/validation/masks";
import { useRouter } from "next/navigation";
import { useWatch } from "react-hook-form";
import { TEMPLATE_CATEGORIES, templateBasicsSchema } from "./template-schema";

const EMPTY = { name: "", category: TEMPLATE_CATEGORIES[0]!, orientation: "LANDSCAPE" as const };

/** Step 1 of defining a template: basics here, fields on the configure page. */
export function CreateTemplateModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const form = useZodForm(templateBasicsSchema, { defaultValues: EMPTY });
  const { register, formState, setValue, control } = form;
  const [name = "", orientation = "LANDSCAPE"] = useWatch({ control, name: ["name", "orientation"] });
  const close = () => { onClose(); form.reset(EMPTY); };
  const submit = form.handleSubmit((v) => {
    router.push(`/layouts/new/configure?name=${encodeURIComponent(v.name)}&category=${encodeURIComponent(v.category)}&o=${v.orientation}`);
    close();
  });
  return (
    <Modal open={open} onClose={close} width="max-w-[480px]">
      <ModalHeader title="Create New Template" onClose={close} />
      <div className="px-6 pt-4"><Stepper steps={["Basic Info", "Fields", "Review"]} current={1} compact /></div>
      <form onSubmit={submit} noValidate className="space-y-4 px-6 py-5">
        <Field label="Template Name" required error={formState.errors.name?.message} hint={`${name.length}/120 · at least 2 characters`}><Input placeholder="e.g. Summer Sale 2026" maxLength={120} autoFocus {...maskedRegister(form, "name", maskName)} /></Field>
        <Field label="Category" error={formState.errors.category?.message}><Select {...register("category")}>{TEMPLATE_CATEGORIES.map((c) => <option key={c}>{c}</option>)}</Select></Field>
        <div><Label>Orientation</Label><div className="grid grid-cols-2 gap-2"><RadioCard checked={orientation === "LANDSCAPE"} onSelect={() => setValue("orientation", "LANDSCAPE")} title="Landscape" sub="16:9 · 1920×1080" /><RadioCard checked={orientation === "PORTRAIT"} onSelect={() => setValue("orientation", "PORTRAIT")} title="Portrait" sub="9:16 · 1080×1920" /></div></div>
        <div className="flex justify-end gap-2 pt-2"><Button type="button" variant="secondary" onClick={close}>Cancel</Button><SubmitButton form={form}>Next ›</SubmitButton></div>
      </form>
    </Modal>
  );
}
