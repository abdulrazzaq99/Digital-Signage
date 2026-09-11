import { CampaignForm } from "@/components/scratch/campaign-form";
import { campaigns } from "@/lib/data";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return campaigns.map((c) => ({ id: c.id }));
}

export default async function Page({ params }: PageProps<"/scratch-win/[id]/edit">) {
  const { id } = await params;
  const c = campaigns.find((x) => x.id === id);
  if (!c) notFound();
  return <CampaignForm campaign={c} />;
}
