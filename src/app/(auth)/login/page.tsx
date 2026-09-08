"use client";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [show, setShow] = useState(false);
  return (
    <form onSubmit={(e) => { e.preventDefault(); router.push("/"); }} className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Welcome back</h1>
        <p className="mt-1.5 text-sm text-slate-500">Sign in to manage your digital signage platform.</p>
      </div>
      <div className="space-y-4">
        <div>
          <Label>Email address</Label>
          <Input type="email" placeholder="you@company.com" autoComplete="email" />
        </div>
        <div>
          <Label>Password</Label>
          <div className="relative">
            <Input type={show ? "text" : "password"} placeholder="Enter your password" autoComplete="current-password" className="pr-10" />
            <button type="button" onClick={() => setShow((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-500 hover:text-blue-700" aria-label="Toggle password visibility">
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <div className="mt-2 text-right">
            <Link href="/forgot-password" className="text-xs font-medium text-blue-600 hover:underline">Forgot password?</Link>
          </div>
        </div>
      </div>
      <Button type="submit" size="lg" className="w-full">Sign In</Button>
      <p className="text-center text-xs text-slate-500">
        Don&apos;t have an account? <a href="#" className="font-medium text-blue-600 hover:underline">Request access</a>
      </p>
    </form>
  );
}
