import { ScreensPage } from "@/components/portal/screens-page";

export default async function Page({ searchParams }: PageProps<"/portal/screens">) {
  const { tab } = await searchParams;
  return <ScreensPage tab={tab === "groups" ? "groups" : "all"} />;
}
