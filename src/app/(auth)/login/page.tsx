"use client";
import { useAuth } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Alert } from "@/components/ui/misc";
import { errorMessage, isSuperAdmin } from "@/lib/format";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

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

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { status, user, login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const next = params.get("next");

  // Already signed in: skip the form.
  useEffect(() => { if (status === "authenticated") router.replace(destinationFor(isSuperAdmin(user), next)); }, [status, user, next, router]);

  const submit = async (creds: { email: string; password: string }) => {
    setError(null);
    setPending(true);
    try {
      const u = await login(creds.email, creds.password);
      router.replace(destinationFor(isSuperAdmin(u), next));
    } catch (e) {
      setError(errorMessage(e));
      setPending(false);
    }
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); submit({ email, password }); }} className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Welcome back</h1>
        <p className="mt-1.5 text-sm text-slate-500">Sign in to manage your digital signage platform.</p>
      </div>
      {error && <Alert tone="red">{error}</Alert>}
      <div className="space-y-4">
        <div>
          <Label>Email address</Label>
          <Input type="email" placeholder="you@company.com" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <Label>Password</Label>
          <div className="relative">
            <Input type={show ? "text" : "password"} placeholder="Enter your password" autoComplete="current-password" className="pr-10" value={password} onChange={(e) => setPassword(e.target.value)} required />
            <button type="button" onClick={() => setShow((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-500 hover:text-blue-700" aria-label="Toggle password visibility">
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <div className="mt-2 text-right">
            <Link href="/forgot-password" className="text-xs font-medium text-blue-600 hover:underline">Forgot password?</Link>
          </div>
        </div>
      </div>
      <Button type="submit" size="lg" className="w-full" disabled={pending}>{pending ? "Signing in…" : "Sign In"}</Button>
      <p className="text-center text-xs text-slate-500">
        Don&apos;t have an account? <a href="#" className="font-medium text-blue-600 hover:underline">Request access</a>
      </p>
      {SHOW_DEMO && (
        <div className="flex items-center justify-center gap-4 border-t border-slate-100 pt-4 text-[11px] text-slate-400">
          <span>Demo:</span>
          <button type="button" disabled={pending} onClick={() => { setEmail(DEMO.admin.email); setPassword(DEMO.admin.password); submit(DEMO.admin); }} className="font-medium text-blue-600 hover:underline">Super Admin</button>
          <button type="button" disabled={pending} onClick={() => { setEmail(DEMO.customer.email); setPassword(DEMO.customer.password); submit(DEMO.customer); }} className="font-medium text-blue-600 hover:underline">Customer Portal</button>
        </div>
      )}
    </form>
  );
}

export default function LoginPage() {
  return <Suspense><LoginForm /></Suspense>;
}
