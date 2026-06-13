import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import EnterForm from "@/components/auth/EnterForm";

export default async function EnterPage({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string }>;
}) {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");
  const { mode } = await searchParams;
  return <EnterForm initialMode={mode === "signup" ? "signup" : "signin"} />;
}
