import { LicenseDetail } from "@/components/licenses/license-detail";

export default async function Page({ params }: PageProps<"/licenses/[id]">) {
  const { id } = await params;
  return <LicenseDetail companyId={id} />;
}
