import { ReconfigureCanvas } from "@/components/canvas/reconfigure-canvas";
import { canvases } from "@/lib/data";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return canvases.map((c) => ({ id: c.id }));
}

export default async function Page({ params }: PageProps<"/screens/canvas/[id]/reconfigure">) {
  const { id } = await params;
  const canvas = canvases.find((c) => c.id === id);
  if (!canvas) notFound();
  return <ReconfigureCanvas canvas={canvas} />;
}
