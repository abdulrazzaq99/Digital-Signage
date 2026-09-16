import { LayoutsPage } from "@/components/portal/layouts-page";

export default async function Page({ searchParams }: PageProps<"/portal/layouts">) {
  const { tab } = await searchParams;
  return <LayoutsPage tab={tab === "templates" ? "templates" : "layouts"} />;
}
