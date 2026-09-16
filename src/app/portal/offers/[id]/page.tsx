import { OfferDetail } from "@/components/portal/offer-detail";

export default async function Page({ params }: PageProps<"/portal/offers/[id]">) {
  const { id } = await params;
  return <OfferDetail id={id} />;
}
