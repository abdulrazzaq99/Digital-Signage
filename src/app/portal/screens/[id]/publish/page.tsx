import { ScreenPublish } from "@/components/portal/screen-publish";
import { Suspense } from "react";

export default async function Page({ params }: PageProps<"/portal/screens/[id]/publish">) {
  const { id } = await params;
  return <Suspense><ScreenPublish id={id} /></Suspense>;
}
