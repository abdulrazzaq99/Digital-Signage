"use client";
import { ErrorView } from "@/components/errors/error-view";

/** Keeps the portal shell when a page fails, so the user can navigate away. */
export default function PortalError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return <ErrorView error={error} retry={retry} home="/portal" compact />;
}
