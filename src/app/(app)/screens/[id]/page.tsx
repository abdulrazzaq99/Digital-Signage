import { ScreenDetail } from "@/components/screens/screen-detail";

export default async function ScreenPage({ params }: PageProps<"/screens/[id]">) {
  const { id } = await params;
  return <ScreenDetail id={id} />;
}
