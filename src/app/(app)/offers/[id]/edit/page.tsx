import { OfferForm } from "@/components/offers/offer-form";

export default async function Page({ params }: PageProps<"/offers/[id]/edit">) {
  const { id } = await params;
  return <OfferForm id={id} mode="edit" />;
}
