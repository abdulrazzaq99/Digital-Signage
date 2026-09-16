import { CompanyDetail } from "@/components/companies/company-detail";

export default async function Page({ params }: PageProps<"/companies/[id]">) {
  const { id } = await params;
  return <CompanyDetail id={id} />;
}
