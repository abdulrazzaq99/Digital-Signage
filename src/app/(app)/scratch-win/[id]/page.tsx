import { CampaignDetail } from "@/components/scratch/campaign-detail";

export default async function Page({ params }: PageProps<"/scratch-win/[id]">) {
  const { id } = await params;
  return <CampaignDetail id={id} />;
}
