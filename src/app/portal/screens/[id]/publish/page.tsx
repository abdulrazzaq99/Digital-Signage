import { ScreenPublish } from "@/components/portal/screen-publish";
import { portalScreens } from "@/lib/portal-data";
import { notFound } from "next/navigation";
import { Suspense } from "react";

export function generateStaticParams() {
  return portalScreens.map((s) => ({ id: s.id }));
}

export default async function Page({ params }: PageProps<"/portal/screens/[id]/publish">) {
  const { id } = await params;
  const screen = portalScreens.find((s) => s.id === id);
  if (!screen) notFound();
  return <Suspense><ScreenPublish screen={screen} /></Suspense>;
}
