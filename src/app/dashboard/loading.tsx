import PageLoader from "@/components/ui/PageLoader";

export default function DashboardLoading() {
  return (
    <PageLoader
      title="Loading dashboard insights…"
      description="Fetching your latest stats and activity."
    />
  );
}
