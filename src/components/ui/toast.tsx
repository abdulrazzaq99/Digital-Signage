"use client";
import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { errorMessage } from "@/lib/format";
import { cn } from "@/lib/utils";

type Tone = "success" | "error" | "info";
interface Toast { id: number; title: string; body?: string; tone: Tone }
interface ToastApi {
  toast(t: { title: string; body?: string; tone?: Tone }): void;
  success(title: string, body?: string): void;
  error(e: unknown, title?: string): void;
}

const ToastContext = createContext<ToastApi | null>(null);
let seq = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const dismiss = useCallback((id: number) => setToasts((t) => t.filter((x) => x.id !== id)), []);
  const toast = useCallback((t: { title: string; body?: string; tone?: Tone }) => {
    const id = ++seq;
    setToasts((list) => [...list, { id, title: t.title, body: t.body, tone: t.tone ?? "info" }]);
    setTimeout(() => dismiss(id), 4500);
  }, [dismiss]);
  const value = useMemo<ToastApi>(() => ({
    toast,
    success: (title, body) => toast({ title, body, tone: "success" }),
    error: (e, title = "Something went wrong") => toast({ title, body: errorMessage(e), tone: "error" }),
  }), [toast]);

  const style: Record<Tone, string> = { success: "border-green-200 bg-green-50 text-green-800", error: "border-red-200 bg-red-50 text-red-800", info: "border-blue-200 bg-blue-50 text-blue-800" };
  const Icon = { success: CheckCircle2, error: AlertCircle, info: Info };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-x-4 bottom-4 z-[70] flex flex-col items-end gap-2 sm:inset-x-auto sm:right-4" aria-live="polite">
        {toasts.map((t) => {
          const I = Icon[t.tone];
          return (
            <div key={t.id} className={cn("pointer-events-auto flex w-full max-w-sm items-start gap-2.5 rounded-lg border px-4 py-3 text-xs shadow-lg animate-fade-in", style[t.tone])}>
              <I className="mt-0.5 h-4 w-4 shrink-0" />
              <div className="min-w-0 flex-1"><div className="font-semibold">{t.title}</div>{t.body && <div className="mt-0.5 opacity-90">{t.body}</div>}</div>
              <button type="button" onClick={() => dismiss(t.id)} className="opacity-60 hover:opacity-100" aria-label="Dismiss"><X className="h-3.5 w-3.5" /></button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside ToastProvider");
  return ctx;
}
