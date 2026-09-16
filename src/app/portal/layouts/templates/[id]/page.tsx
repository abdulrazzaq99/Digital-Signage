import { UseTemplate } from "@/components/portal/use-template";

export default async function Page({ params }: PageProps<"/portal/layouts/templates/[id]">) {
  const { id } = await params;
  return <UseTemplate id={id} />;
}
