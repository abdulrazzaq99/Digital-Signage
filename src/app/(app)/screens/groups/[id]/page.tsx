import { GroupDetail } from "@/components/groups/group-detail";
import { Suspense } from "react";

export default async function GroupPage({ params }: PageProps<"/screens/groups/[id]">) {
  const { id } = await params;
  return <Suspense><GroupDetail id={id} /></Suspense>;
}
