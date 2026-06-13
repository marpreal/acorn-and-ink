import { requireUser } from "@/lib/auth";
import { getReadingStats } from "@/lib/stats";
import StatsGrove from "@/components/stats/StatsGrove";

export default async function StatsPage() {
  const user = await requireUser();
  const stats = await getReadingStats(user.id);
  return <StatsGrove stats={stats} />;
}
