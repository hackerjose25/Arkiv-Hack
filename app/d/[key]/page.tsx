import PublicDashboard from "@/components/public-dashboard";
export default async function Page({
  params,
}: {
  params: Promise<{ key: string }>;
}) {
  const { key } = await params;
  return <PublicDashboard entityKey={key} />;
}
