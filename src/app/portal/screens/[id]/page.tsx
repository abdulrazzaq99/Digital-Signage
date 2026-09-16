import { ScreenDetail } from "@/components/portal/screen-detail";
import { portalScreens } from "@/lib/portal-data";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return portalScreens.map((s) => ({ id: s.id }));
}

export default async function Page({ params }: PageProps<"/portal/screens/[id]">) {
  const { id } = await params;
  const screen = portalScreens.find((s) => s.id === id);
  if (!screen) notFound();
  return <ScreenDetail screen={screen} />;
}
