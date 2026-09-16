import { ReconfigureCanvas } from "@/components/canvas/reconfigure-canvas";
import { Suspense } from "react";

export default async function Page({ params }: PageProps<"/screens/canvas/[id]/reconfigure">) {
  const { id } = await params;
  return <Suspense><ReconfigureCanvas id={id} /></Suspense>;
}
