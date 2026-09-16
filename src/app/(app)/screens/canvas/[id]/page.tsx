import { CanvasDetail } from "@/components/canvas/canvas-detail";
import { Suspense } from "react";

export default async function Page({ params }: PageProps<"/screens/canvas/[id]">) {
  const { id } = await params;
  return <Suspense><CanvasDetail id={id} /></Suspense>;
}
