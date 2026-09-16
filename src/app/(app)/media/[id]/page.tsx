import { MediaDetail } from "@/components/media/media-detail";
import { Suspense } from "react";

export default async function Page({ params }: PageProps<"/media/[id]">) {
  const { id } = await params;
  return <Suspense><MediaDetail id={id} /></Suspense>;
}
