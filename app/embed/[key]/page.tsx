import PublicDashboard from "@/components/public-dashboard";
export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ key: string }>;
  searchParams: Promise<{ widget?: string }>;
}) {
  const { key } = await params;
  const { widget } = await searchParams;
  return <PublicDashboard entityKey={key} embed widgetId={widget} />;
}
