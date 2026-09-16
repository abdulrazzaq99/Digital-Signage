import { OfferDetail } from "@/components/offers/offer-detail";

export default async function Page({ params }: PageProps<"/offers/[id]">) {
  const { id } = await params;
  return <OfferDetail id={id} />;
}
