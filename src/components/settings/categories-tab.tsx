"use client";
/** Super Admin: the location categories (Kiosk, Restaurant, ...) used to aim Head Office content. */
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { applyApiError, Field, fieldError, FormError, maskedRegister, SubmitButton, useZodForm } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Alert } from "@/components/ui/misc";
import { useToast } from "@/components/ui/toast";
import { useCategories, useCreateCategory, useDeleteCategory, useRenameCategory } from "@/lib/api/hooks/categories";
import type { LocationCategory } from "@/lib/api/types";
import { errorMessage } from "@/lib/format";
import { text } from "@/lib/validation/fields";
import { maskName } from "@/lib/validation/masks";
import { AlertCircle, Check, Pencil, Trash2, X } from "lucide-react";
import { useState } from "react";
import { z } from "zod";

const nameSchema = z.object({ name: text(60, 2) });

function AddCategory() {
  const create = useCreateCategory();
  const toast = useToast();
  const form = useZodForm(nameSchema, { defaultValues: { name: "" } });
  const submit = form.handleSubmit(async (v) => {
    try { await create.mutateAsync(v.name); toast.success("Category added", v.name); form.reset({ name: "" }); } catch (e) { applyApiError(form, e); }
  });
  return (
    <form onSubmit={submit} noValidate className="flex flex-wrap items-start gap-2">
      <Field className="min-w-0 flex-1" error={fieldError(form, "name")}><Input placeholder="New category, e.g. Bar" maxLength={60} aria-label="New category name" {...maskedRegister(form, "name", maskName)} /></Field>
      <SubmitButton form={form} pendingText="Adding…">Add</SubmitButton>
      <FormError form={form} className="w-full" />
    </form>
  );
}

/** Asks first; the API still refuses while a location or any content uses the category, and the reason shows here. */
function DeleteCategoryModal({ c, onClose }: { c: LocationCategory; onClose: () => void }) {
  const remove = useDeleteCategory();
  const toast = useToast();
  const [error, setError] = useState("");
  const del = () => { setError(""); remove.mutate(c.id, { onSuccess: () => { toast.success("Category deleted", c.name); onClose(); }, onError: (e) => setError(errorMessage(e)) }); };
  return (
    <Modal open onClose={() => !remove.isPending && onClose()} width="max-w-[440px]">
      <div className="p-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50 text-red-600"><Trash2 className="h-4 w-4" /></div>
        <h2 className="mt-4 text-base font-semibold text-slate-900">Delete &quot;{c.name}&quot;?</h2>
        <p className="mt-1.5 text-xs leading-5 text-slate-500">A category can only be deleted when no location is in it and no offer, template, campaign, push or scheduled notification is aimed at it.</p>
        {error && <Alert tone="red" className="mt-4" icon={<AlertCircle className="h-3.5 w-3.5 shrink-0" />}><span role="alert">{error}</span></Alert>}
        <div className="mt-6 flex justify-end gap-2"><Button variant="secondary" onClick={onClose} disabled={remove.isPending}>Cancel</Button><Button variant="danger" onClick={del} disabled={remove.isPending}><Trash2 className="h-3.5 w-3.5" /> {remove.isPending ? "Deleting…" : "Delete Category"}</Button></div>
      </div>
    </Modal>
  );
}

function Row({ c }: { c: LocationCategory }) {
  const rename = useRenameCategory();
  const toast = useToast();
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const form = useZodForm(nameSchema, { defaultValues: { name: c.name } });
  const save = form.handleSubmit(async (v) => {
    if (v.name === c.name) { setEditing(false); return; }
    try { await rename.mutateAsync({ id: c.id, name: v.name }); setEditing(false); toast.success("Category renamed", v.name); } catch (e) { applyApiError(form, e); }
  });
  return (
    <li className="border-t border-slate-100 py-3 first:border-t-0">
      {editing ? (
        <form onSubmit={save} noValidate className="flex items-start gap-2">
          <Field className="min-w-0 flex-1" error={fieldError(form, "name")}><Input autoFocus maxLength={60} aria-label="Category name" {...maskedRegister(form, "name", maskName)} /></Field>
          <SubmitButton form={form} size="sm" aria-label="Save"><Check className="h-3.5 w-3.5" /></SubmitButton>
          <Button type="button" size="sm" variant="secondary" onClick={() => { form.reset({ name: c.name }); setEditing(false); }} aria-label="Cancel"><X className="h-3.5 w-3.5" /></Button>
        </form>
      ) : (
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1"><div className="truncate text-sm font-medium text-slate-900">{c.name}</div><div className="text-[11px] text-slate-400">{c.companies} location{c.companies === 1 ? "" : "s"}</div></div>
          <Button size="sm" variant="secondary" onClick={() => setEditing(true)}><Pencil className="h-3.5 w-3.5" /> Rename</Button>
          <Button size="sm" variant="danger-outline" onClick={() => setDeleting(true)}><Trash2 className="h-3.5 w-3.5" /> Delete</Button>
        </div>
      )}
      {deleting && <DeleteCategoryModal c={c} onClose={() => setDeleting(false)} />}
    </li>
  );
}

export function CategoriesTab() {
  const categories = useCategories();
  return (
    <Card className="px-5 py-5 animate-fade-in">
      <div className="text-sm font-semibold text-slate-900">Location categories</div>
      <div className="mt-0.5 text-[11px] text-slate-400">Give each location a category on its company page. Offers, templates, campaigns and notifications can then be aimed at a category.</div>
      <div className="mt-4"><AddCategory /></div>
      {categories.isPending ? <p className="mt-4 text-xs text-slate-400">Loading…</p>
        : categories.isError ? <p className="mt-4 text-xs text-red-600">{errorMessage(categories.error)}</p>
          : <ul className="mt-3">{(categories.data ?? []).map((c) => <Row key={c.id} c={c} />)}</ul>}
    </Card>
  );
}
