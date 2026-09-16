import { UseTemplate } from "@/components/portal/use-template";
import { portalTemplates } from "@/lib/portal-data";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return portalTemplates.map((t) => ({ id: t.id }));
}

export default async function Page({ params }: PageProps<"/portal/layouts/templates/[id]">) {
  const { id } = await params;
  const template = portalTemplates.find((t) => t.id === id);
  if (!template) notFound();
  return <UseTemplate template={template} />;
}
