"use client";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { errorMessage } from "@/lib/format";

/**
 * Fallback UI for a route that threw while rendering. The message is the friendly API/client text
 * when there is one; a server-component digest is shown so support can find it in the logs.
 */
export function ErrorView({ error, retry, home = "/", compact }: { error: Error & { digest?: string }; retry?: () => void; home?: string; compact?: boolean }) {
  useEffect(() => {
    console.error("[route error]", error);
  }, [error]);
  return (
    <div className={compact ? "flex items-center justify-center p-10" : "flex min-h-screen items-center justify-center bg-slate-50 p-6"}>
      <div role="alert" className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-red-50 text-red-600"><AlertTriangle className="h-5 w-5" /></div>
        <h1 className="text-base font-semibold text-slate-900">Something went wrong</h1>
        <p className="mt-2 text-sm text-slate-500">{errorMessage(error)}</p>
        {error.digest && <p className="mt-2 font-mono text-[11px] text-slate-400">Reference: {error.digest}</p>}
        <div className="mt-6 flex justify-center gap-2">
          {retry && <Button onClick={retry}><RefreshCw className="h-4 w-4" /> Try again</Button>}
          <Button variant="secondary" href={home}><Home className="h-4 w-4" /> Go to dashboard</Button>
        </div>
      </div>
    </div>
  );
}
