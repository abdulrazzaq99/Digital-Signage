"use client";
import { Button } from "@/components/ui/button";
import { applyApiError, Field, FormError, SubmitButton, useZodForm } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/misc";
import { useForgotPassword } from "@/lib/api/hooks/auth";
import { errorMessage } from "@/lib/format";
import { email } from "@/lib/validation/fields";
import { maskEmail } from "@/lib/validation/masks";
import { ArrowLeft, Mail } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { z } from "zod";

const forgotSchema = z.object({ email: email() });

export default function ForgotPasswordPage() {
  const [sentTo, setSentTo] = useState<string | null>(null);
  const forgot = useForgotPassword();
  const resend = useForgotPassword();
  const form = useZodForm(forgotSchema, { defaultValues: { email: "" } });
  const { register, formState } = form;

  const submit = form.handleSubmit(async (v) => {
    try {
      await forgot.mutateAsync({ email: v.email });
      setSentTo(v.email);
    } catch (e) {
      applyApiError(form, e);
    }
  });

  if (sentTo) {
    return (
      <div className="space-y-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600">
          <Mail className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Check your inbox</h1>
          <p className="mt-1.5 text-sm text-slate-500">
            We sent a password reset link to <span className="font-semibold text-slate-900">{maskEmail(sentTo)}</span>. It may take a few minutes to arrive.
          </p>
        </div>
        {resend.isError && <Alert tone="red">{errorMessage(resend.error)}</Alert>}
        {resend.isSuccess && <Alert tone="green">We sent another link.</Alert>}
        <Button href="/login" size="lg" className="w-full">Back to Sign In</Button>
        <p className="text-center text-xs text-slate-500">
          Didn&apos;t receive it? <button type="button" onClick={() => resend.mutate({ email: sentTo })} disabled={resend.isPending} className="font-medium text-blue-600 hover:underline disabled:opacity-50">{resend.isPending ? "Sending…" : "Resend email"}</button>
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-6">
      <Link href="/login" className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-800">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Sign In
      </Link>
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Forgot your password?</h1>
        <p className="mt-1.5 text-sm text-slate-500">Enter your email address and we&apos;ll send you a link to reset your password.</p>
      </div>
      <FormError form={form} />
      <Field label="Email address" required error={formState.errors.email?.message}>
        <Input type="email" inputMode="email" placeholder="you@company.com" autoComplete="email" autoCapitalize="off" maxLength={254} {...register("email")} />
      </Field>
      <SubmitButton form={form} size="lg" className="w-full" pendingText="Sending…">Send Reset Link</SubmitButton>
      <p className="text-center text-xs text-slate-500">
        Don&apos;t have an account? <a href="#" className="font-medium text-blue-600 hover:underline">Request access</a>
      </p>
    </form>
  );
}
