import { TemplatesPage } from "@/components/layouts/templates-page";

export default async function Page({ searchParams }: PageProps<"/layouts">) {
  const { tab } = await searchParams;
  return <TemplatesPage initialTab={tab === "zones" ? "zones" : "fixed"} />;
}
