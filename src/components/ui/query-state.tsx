"use client";
import { RefreshCw } from "lucide-react";
import type { ReactNode } from "react";
import { errorMessage } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Button } from "./button";

interface QueryLike<T> { data?: T; isPending: boolean; isError: boolean; error: unknown; refetch: () => unknown }

const defaultIsEmpty = (d: unknown) => (Array.isArray(d) ? d.length === 0 : Array.isArray((d as { data?: unknown[] } | null)?.data) ? (d as { data: unknown[] }).data.length === 0 : false);

/** Renders skeleton / error / empty / data for a query so pages share one loading contract. */
export function QueryState<T>({ query, skeleton, empty, isEmpty, children }: { query: QueryLike<T>; skeleton?: ReactNode; empty?: ReactNode; isEmpty?: (data: T) => boolean; children: (data: T) => ReactNode }) {
  if (query.isPending) return <>{skeleton ?? <TableSkeleton />}</>;
  if (query.isError) return <ErrorState error={query.error} onRetry={() => query.refetch()} />;
  const data = query.data as T;
  if (empty && (isEmpty ?? defaultIsEmpty)(data)) return <>{empty}</>;
  return <>{children(data)}</>;
}

export function ErrorState({ error, onRetry, className }: { error: unknown; onRetry?: () => void; className?: string }) {
  return (
    <div className={cn("rounded-xl border border-red-200 bg-red-50 p-6 text-center", className)}>
      <p className="text-sm font-semibold text-red-700">Couldn&apos;t load this</p>
      <p className="mt-1 text-xs text-red-600">{errorMessage(error)}</p>
      {onRetry && <Button variant="secondary" size="sm" className="mt-3" onClick={onRetry}><RefreshCw className="h-3.5 w-3.5" /> Try again</Button>}
    </div>
  );
}

export const Skeleton = ({ className }: { className?: string }) => <div className={cn("animate-pulse rounded-md bg-slate-200/70", className)} />;
export const CardGridSkeleton = ({ count = 6, className }: { count?: number; className?: string }) => (
  <div className={cn("grid gap-4 sm:grid-cols-2 xl:grid-cols-3", className)}>{Array.from({ length: count }).map((_, i) => <Skeleton key={i} className="h-40" />)}</div>
);
export const TableSkeleton = ({ rows = 6 }: { rows?: number }) => <div className="space-y-2">{Array.from({ length: rows }).map((_, i) => <Skeleton key={i} className="h-11" />)}</div>;

export function EmptyState({ icon, title, body, action, className }: { icon?: ReactNode; title: string; body?: string; action?: ReactNode; className?: string }) {
  return (
    <div className={cn("rounded-xl border border-dashed border-slate-200 bg-white p-10 text-center", className)}>
      {icon && <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-400">{icon}</div>}
      <p className="text-sm font-semibold text-slate-900">{title}</p>
      {body && <p className="mt-1 text-xs text-slate-500">{body}</p>}
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  );
}
