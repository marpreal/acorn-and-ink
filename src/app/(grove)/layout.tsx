import { requireUser } from "@/lib/auth";
import GroveShell from "@/components/shell/GroveShell";

export default async function GroveLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  return (
    <GroveShell user={{ name: user.name, email: user.email }}>
      {children}
    </GroveShell>
  );
}
