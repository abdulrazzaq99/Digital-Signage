import { GroupForm } from "@/components/portal/group-form";
import { portalGroups } from "@/lib/portal-data";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return portalGroups.map((g) => ({ id: g.id }));
}

export default async function Page({ params }: PageProps<"/portal/screens/groups/[id]">) {
  const { id } = await params;
  const group = portalGroups.find((g) => g.id === id);
  if (!group) notFound();
  return <GroupForm group={group} />;
}
