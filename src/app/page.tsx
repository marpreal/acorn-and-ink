import { getCurrentUser } from "@/lib/auth";
import Landing from "@/components/landing/Landing";

export default async function Home() {
  const user = await getCurrentUser();
  return <Landing signedIn={!!user} name={user?.name ?? null} />;
}
