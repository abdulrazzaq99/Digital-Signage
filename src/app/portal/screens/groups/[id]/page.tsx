import { GroupForm } from "@/components/portal/group-form";

export default async function Page({ params }: PageProps<"/portal/screens/groups/[id]">) {
  const { id } = await params;
  return <GroupForm id={id} />;
}
