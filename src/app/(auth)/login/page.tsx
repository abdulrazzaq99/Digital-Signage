"use client";
import { useAuth } from "@/components/auth/auth-provider";
import { applyApiError, Field, FormError, SubmitButton, useZodForm } from "@/components/ui/form";
import { Input, PasswordInput } from "@/components/ui/input";
import { isSuperAdmin } from "@/lib/format";
import { email, passwordInput } from "@/lib/validation/fields";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import { z } from "zod";

/** Seeded demo accounts from the API (prisma/seed.ts). */
const DEMO = {
  admin: { email: "admin@dsp.local", password: "Admin123!" },
  customer: { email: "sarah.mitchell@acmecorp.com", password: "Customer123!" },
};

/** Demo shortcuts only work against a seeded API: on in `next dev`, off in production builds unless NEXT_PUBLIC_DEMO_LOGIN=true. */
const SHOW_DEMO = (process.env.NEXT_PUBLIC_DEMO_LOGIN ?? (process.env.NODE_ENV === "production" ? "false" : "true")) === "true";

/** Honour `?next=` only when it belongs to the dashboard this user can access. */
function destinationFor(superAdmin: boolean, next: string | null) {
  const inArea = next && (superAdmin ? !next.startsWith("/portal") : next.startsWith("/portal"));
  return inArea ? next : superAdmin ? "/" : "/portal";
}

const loginSchema = z.object({ email: email(), password: passwordInput() });

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { status, user, login } = useAuth();
  const form = useZodForm(loginSchema, { defaultValues: { email: "", password: "" } });
  const { register, handleSubmit, setValue, formState } = form;
  const next = params.get("next");

  // Already signed in: skip the form.
  useEffect(() => { if (status === "authenticated") router.replace(destinationFor(isSuperAdmin(user), next)); }, [status, user, next, router]);

  const submit = handleSubmit(async (creds) => {
    try {
      const u = await login(creds.email, creds.password);
      router.replace(destinationFor(isSuperAdmin(u), next));
    } catch (e) {
      applyApiError(form, e);
    }
  });

  const demo = (creds: { email: string; password: string }) => {
    setValue("email", creds.email);
    setValue("password", creds.password);
    void submit();
  };

  return (
    <form onSubmit={submit} noValidate className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Welcome back</h1>
        <p className="mt-1.5 text-sm text-slate-500">Sign in to manage your digital signage platform.</p>
      </div>
      <FormError form={form} />
      <div className="space-y-4">
        <Field label="Email address" error={formState.errors.email?.message}>
          <Input type="email" inputMode="email" placeholder="you@company.com" autoComplete="email" autoCapitalize="off" maxLength={254} {...register("email")} />
        </Field>
        <div>
          <Field label="Password" error={formState.errors.password?.message}>
            <PasswordInput placeholder="Enter your password" autoComplete="current-password" maxLength={128} {...register("password")} />
          </Field>
          <div className="mt-2 text-right">
            <Link href="/forgot-password" className="text-xs font-medium text-blue-600 hover:underline">Forgot password?</Link>
          </div>
        </div>
      </div>
      <SubmitButton form={form} size="lg" className="w-full" pendingText="Signing in…">Sign In</SubmitButton>
      {SHOW_DEMO && (
        <div className="flex items-center justify-center gap-4 border-t border-slate-100 pt-4 text-[11px] text-slate-400">
          <span>Demo:</span>
          <button type="button" disabled={formState.isSubmitting} onClick={() => demo(DEMO.admin)} className="font-medium text-blue-600 hover:underline">Super Admin</button>
          <button type="button" disabled={formState.isSubmitting} onClick={() => demo(DEMO.customer)} className="font-medium text-blue-600 hover:underline">Customer Portal</button>
        </div>
      )}
    </form>
  );
}

export default function LoginPage() {
  return <Suspense><LoginForm /></Suspense>;
}
