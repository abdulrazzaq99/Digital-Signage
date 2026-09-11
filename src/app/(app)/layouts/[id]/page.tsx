import { TemplateDetail } from "@/components/layouts/template-detail";
import { templates } from "@/lib/data";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return templates.map((t) => ({ id: t.id }));
}

export default async function Page({ params }: PageProps<"/layouts/[id]">) {
  const { id } = await params;
  const t = templates.find((x) => x.id === id);
  if (!t) notFound();
  return <TemplateDetail t={t} />;
}
