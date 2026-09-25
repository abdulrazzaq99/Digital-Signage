"use client";
import { ErrorView } from "@/components/errors/error-view";

/** Keeps the admin shell (sidebar, top bar) when a page fails, so the user can navigate away. */
export default function AdminError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return <ErrorView error={error} retry={retry} home="/" compact />;
}
