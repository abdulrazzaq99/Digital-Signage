"use client";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { ArrowLeft, Mail } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  if (sent) {
    return (
      <div className="space-y-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600">
          <Mail className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Check your inbox</h1>
          <p className="mt-1.5 text-sm text-slate-500">
            We sent a password reset link to <span className="font-semibold text-slate-900">{email || "company@example.com"}</span>. It may take a few minutes to arrive.
          </p>
        </div>
        <Button href="/login" size="lg" className="w-full">Back to Sign In</Button>
        <p className="text-center text-xs text-slate-500">
          Didn&apos;t receive it? <button type="button" className="font-medium text-blue-600 hover:underline">Resend email</button>
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); setSent(true); }} className="space-y-6">
      <Link href="/login" className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-800">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Sign In
      </Link>
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Forgot your password?</h1>
        <p className="mt-1.5 text-sm text-slate-500">Enter your email address and we&apos;ll send you a link to reset your password.</p>
      </div>
      <div>
        <Label>Email address</Label>
        <Input type="email" placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <Button type="submit" size="lg" className="w-full">Send Reset Link</Button>
      <p className="text-center text-xs text-slate-500">
        Don&apos;t have an account? <a href="#" className="font-medium text-blue-600 hover:underline">Request access</a>
      </p>
    </form>
  );
}
