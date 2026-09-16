import { PortalUseLayout } from "@/components/portal/use-layout";
import { zoneLayouts } from "@/lib/data";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return zoneLayouts.map((z) => ({ id: z.id }));
}

export default async function Page({ params }: PageProps<"/portal/layouts/use/[id]">) {
  const { id } = await params;
  const layout = zoneLayouts.find((z) => z.id === id);
  if (!layout) notFound();
  return <PortalUseLayout layout={layout} />;
}
