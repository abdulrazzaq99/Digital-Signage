"use client";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Alert } from "@/components/ui/misc";
import { useResetPassword } from "@/lib/api/hooks/auth";
import { ApiError } from "@/lib/api/client";
import { errorMessage } from "@/lib/format";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

/**
 * Landing page for emailed password links (forgot-password and user invites):
 * `/reset-password?token=…`. The mobile apps claim the same URL as a Universal / App Link.
 */
function ResetForm() {
  const token = useSearchParams().get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [done, setDone] = useState(false);
  const reset = useResetPassword();
  const mismatch = confirm.length > 0 && confirm !== password;
  const expired = reset.error instanceof ApiError && reset.error.code === "RESET_INVALID";

  if (done) {
    return (
      <div className="space-y-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-50 text-green-600"><CheckCircle2 className="h-5 w-5" /></div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Password saved</h1>
          <p className="mt-1.5 text-sm text-slate-500">You can now sign in with your new password. Any other signed-in devices have been signed out.</p>
        </div>
        <Button href="/login" size="lg" className="w-full">Sign In</Button>
      </div>
    );
  }

  if (!token || expired) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">{token ? "This link has expired" : "This link is incomplete"}</h1>
          <p className="mt-1.5 text-sm text-slate-500">Password links can be used once. Reset links last an hour and invitation links last 7 days. Request a new link to continue.</p>
        </div>
        <Button href="/forgot-password" size="lg" className="w-full">Request a New Link</Button>
      </div>
    );
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); if (!mismatch) reset.mutate({ token, password }, { onSuccess: () => setDone(true) }); }} className="space-y-6">
      <Link href="/login" className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-800">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Sign In
      </Link>
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Set your password</h1>
        <p className="mt-1.5 text-sm text-slate-500">Choose a password for your Digital Signage account. Use at least 8 characters.</p>
      </div>
      {reset.isError && <Alert tone="red">{errorMessage(reset.error)}</Alert>}
      <div>
        <Label>New password</Label>
        <Input type="password" autoComplete="new-password" minLength={8} maxLength={128} value={password} onChange={(e) => setPassword(e.target.value)} required />
      </div>
      <div>
        <Label>Confirm password</Label>
        <Input type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
        {mismatch && <p className="mt-1 text-xs text-red-600">Passwords don&apos;t match.</p>}
      </div>
      <Button type="submit" size="lg" className="w-full" disabled={reset.isPending || password.length < 8 || mismatch}>{reset.isPending ? "Saving…" : "Save Password"}</Button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return <Suspense><ResetForm /></Suspense>;
}
