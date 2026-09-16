import { TemplatesPage } from "@/components/layouts/templates-page";
import { Suspense } from "react";

export default async function Page({ searchParams }: PageProps<"/layouts">) {
  const { tab } = await searchParams;
  return <Suspense><TemplatesPage initialTab={tab === "zones" ? "zones" : "fixed"} /></Suspense>;
}
