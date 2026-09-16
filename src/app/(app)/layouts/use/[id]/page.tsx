import { UseLayout } from "@/components/layouts/use-layout";
import { Suspense } from "react";

export default async function Page({ params }: PageProps<"/layouts/use/[id]">) {
  const { id } = await params;
  return <Suspense><UseLayout id={id} /></Suspense>;
}
