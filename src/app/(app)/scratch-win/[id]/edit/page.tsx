import { CampaignForm } from "@/components/scratch/campaign-form";

export default async function Page({ params }: PageProps<"/scratch-win/[id]/edit">) {
  const { id } = await params;
  return <CampaignForm id={id} />;
}
