import { TemplateDetail } from "@/components/layouts/template-detail";
import { Suspense } from "react";

export default async function Page({ params }: PageProps<"/layouts/[id]">) {
  const { id } = await params;
  return <Suspense><TemplateDetail id={id} /></Suspense>;
}
