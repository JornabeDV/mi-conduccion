import { redirect } from "next/navigation";
import { getSession } from "@/server/services/session-service";
import { DashboardShell } from "@/components/templates/dashboard-shell";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession().catch(() => null);

  if (!session) {
    redirect("/login");
  }

  return (
    <DashboardShell user={session.user}>{children}</DashboardShell>
  );
}
