import { MarketplaceOffer } from "@/components/offers/offer-detail";

export default async function Page({ params }: PageProps<"/offers/marketplace/[id]">) {
  const { id } = await params;
  return <MarketplaceOffer id={id} />;
}
