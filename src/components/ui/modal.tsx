"use client";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { useEffect, type ReactNode } from "react";

export function Modal({ open, onClose, children, className, width = "max-w-lg" }: { open: boolean; onClose: () => void; children: ReactNode; className?: string; width?: string }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] animate-fade-in" onClick={onClose} />
      <div className={cn("relative max-h-[92dvh] w-full overflow-y-auto overscroll-contain rounded-t-2xl bg-white pb-[env(safe-area-inset-bottom)] shadow-2xl animate-pop-in sm:rounded-2xl sm:pb-0", width, className)} role="dialog" aria-modal>
        {children}
      </div>
    </div>
  );
}

export function ModalHeader({ title, subtitle, onClose, className }: { title: ReactNode; subtitle?: ReactNode; onClose?: () => void; className?: string }) {
  return (
    <div className={cn("flex items-start justify-between gap-4 px-4 pt-5 sm:px-6 sm:pt-6", className)}>
      <div>
        <h2 className="text-base font-semibold text-slate-900">{title}</h2>
        {subtitle && <p className="mt-1 text-xs text-slate-500">{subtitle}</p>}
      </div>
      {onClose && (
        <button type="button" onClick={onClose} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md sm:h-6 sm:w-6 border border-slate-200 text-slate-400 hover:bg-slate-50 hover:text-slate-600" aria-label="Close">
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}

export function ModalFooter({ children, className }: { children: ReactNode; className?: string }) {
  // Phones: full-width stacked buttons, primary (last) on top; desktop: right-aligned row.
  return <div className={cn("flex flex-col-reverse gap-2 border-t border-slate-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-end sm:px-6 [&>*]:w-full sm:[&>*]:w-auto", className)}>{children}</div>;
}
