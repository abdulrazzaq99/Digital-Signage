import { PortalUseLayout } from "@/components/portal/use-layout";

export default async function Page({ params }: PageProps<"/portal/layouts/use/[id]">) {
  const { id } = await params;
  return <PortalUseLayout id={id} />;
}
