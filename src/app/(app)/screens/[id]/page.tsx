import { ScreenDetail } from "@/components/screens/screen-detail";
import { screens } from "@/lib/data";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return screens.map((s) => ({ id: s.id }));
}

export default async function ScreenPage({ params }: PageProps<"/screens/[id]">) {
  const { id } = await params;
  const screen = screens.find((s) => s.id === id);
  if (!screen) notFound();
  return <ScreenDetail screen={screen} />;
}
