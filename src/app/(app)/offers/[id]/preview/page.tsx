import { MarketplaceOffer } from "@/components/offers/offer-detail";

export default async function Page({ params }: PageProps<"/offers/[id]/preview">) {
  const { id } = await params;
  return <MarketplaceOffer id={id} preview />;
}
