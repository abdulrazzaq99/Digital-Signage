"use client";
/**
 * Form plumbing shared by every form: a zod-backed react-hook-form hook, a Field wrapper that ties
 * label, input, hint and error together (ids + aria), the server-error mapper, and a submit button
 * that blocks double submits.
 */
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle } from "lucide-react";
import { cloneElement, isValidElement, useId, type ReactElement, type ReactNode } from "react";
import { useForm, type FieldValues, type Path, type UseFormProps, type UseFormReturn } from "react-hook-form";
import type { z } from "zod";
import { ApiError } from "@/lib/api/client";
import { errorMessage } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Button, type ButtonProps } from "./button";
import { Label } from "./input";

/** react-hook-form with the zod schema as resolver. Validates on blur, then on every change once touched. */
export function useZodForm<TIn extends FieldValues, TOut extends FieldValues>(schema: z.ZodType<TOut, TIn>, options?: Omit<UseFormProps<TIn, unknown, TOut>, "resolver">) {
  return useForm<TIn, unknown, TOut>({ resolver: zodResolver(schema), mode: "onTouched", ...options });
}

type AnyForm = UseFormReturn<FieldValues, unknown, FieldValues>;

/**
 * Puts an API failure on the form: `VALIDATION_ERROR` / `DUPLICATE` details (`body.name`) land on the
 * matching fields (renamed through `fieldMap` when the form's names differ from the API's); anything
 * else, including details for fields the form doesn't have, becomes the form-level error.
 */
export function applyApiError<T extends FieldValues, O extends FieldValues>(form: UseFormReturn<T, unknown, O>, error: unknown, fieldMap: Record<string, string> = {}) {
  const f = form as unknown as AnyForm;
  const names = new Set(Object.keys(f.getValues() ?? {}));
  const unmatched: string[] = [];
  let first: string | null = null;
  if (error instanceof ApiError && Array.isArray(error.details)) {
    for (const d of error.details as { path?: string; message?: string }[]) {
      const raw = (d.path ?? "").replace(/^(body|query|params)\.?/, "");
      const name = fieldMap[raw] ?? raw;
      const top = name.split(".")[0] ?? "";
      if (name && (names.has(top) || fieldMap[raw])) {
        f.setError(name, { type: "server", message: d.message ?? "Invalid value" });
        first ??= name;
      } else if (d.message) unmatched.push(raw ? `${raw}: ${d.message}` : d.message);
    }
  }
  if (first) f.setFocus(first);
  if (!first || unmatched.length) f.setError("root.server", { type: "server", message: first ? unmatched.join(" · ") : errorMessage(error) });
}

/**
 * Label + control + hint + error. Pass the control as the single child; it receives `id`,
 * `aria-invalid` and `aria-describedby`, so screen readers announce the error with the field.
 */
export function Field({ label, required, hint, error, className, children }: { label?: ReactNode; required?: boolean; hint?: ReactNode; error?: string; className?: string; children: ReactElement<Record<string, unknown>> }) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const control = isValidElement(children)
    ? cloneElement(children, { id: (children.props.id as string | undefined) ?? id, "aria-invalid": error ? true : undefined, "aria-describedby": [hintId, errorId].filter(Boolean).join(" ") || undefined })
    : children;
  return (
    <div className={className}>
      {label && <Label htmlFor={(children.props.id as string | undefined) ?? id} required={required}>{label}</Label>}
      {control}
      {hint && !error && <p id={hintId} className="mt-1 text-[11px] text-slate-400">{hint}</p>}
      {error && <p id={errorId} role="alert" className="mt-1 flex items-center gap-1 text-[11px] font-medium text-red-600"><AlertCircle className="h-3 w-3 shrink-0" />{error}</p>}
    </div>
  );
}

/** The form-level (non-field) error, e.g. a network failure or a business rule. */
export function FormError({ form, className }: { form: { formState: { errors: FieldValues } }; className?: string }) {
  const message = (form.formState.errors.root as { server?: { message?: string } } | undefined)?.server?.message;
  if (!message) return null;
  return (
    <div role="alert" className={cn("flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700", className)}>
      <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
      <span>{message}</span>
    </div>
  );
}

/** Submit button that disables itself while the form submits, so a double click can't send twice. */
export function SubmitButton({ form, children, pendingText, disabled, ...rest }: Omit<ButtonProps, "form" | "type"> & { form: { formState: { isSubmitting: boolean } }; pendingText?: ReactNode }) {
  const busy = form.formState.isSubmitting;
  return (
    <Button type="submit" disabled={busy || disabled} aria-busy={busy || undefined} {...rest}>
      {busy ? (pendingText ?? "Saving…") : children}
    </Button>
  );
}

/** `register` with an input mask applied before react-hook-form sees the value. */
export function maskedRegister<T extends FieldValues, O extends FieldValues>(form: UseFormReturn<T, unknown, O>, name: Path<T>, mask: (v: string) => string) {
  const reg = form.register(name);
  return {
    ...reg,
    onChange: (e: { target: { value: string } }) => {
      e.target.value = mask(e.target.value);
      return reg.onChange(e);
    },
  };
}

/** The error message for a (possibly nested) field, for passing to `<Field error>`. */
export function fieldError<T extends FieldValues, O extends FieldValues>(form: UseFormReturn<T, unknown, O>, name: Path<T>): string | undefined {
  const parts = String(name).split(".");
  let node: unknown = form.formState.errors;
  for (const p of parts) node = (node as Record<string, unknown> | undefined)?.[p];
  return (node as { message?: string } | undefined)?.message;
}
