import { ScreenDetail } from "@/components/portal/screen-detail";

export default async function Page({ params }: PageProps<"/portal/screens/[id]">) {
  const { id } = await params;
  return <ScreenDetail id={id} />;
}
