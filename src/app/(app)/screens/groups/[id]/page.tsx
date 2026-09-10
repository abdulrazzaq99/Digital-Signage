import { GroupDetail } from "@/components/groups/group-detail";
import { screenGroups } from "@/lib/data";

export function generateStaticParams() {
  return [{ id: "main-lobby" }, ...screenGroups.map((g) => ({ id: g.id }))];
}

export default function GroupPage() {
  return <GroupDetail />;
}
