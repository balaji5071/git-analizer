import type { ReactNode } from "react";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { requirePageSession } from "@/features/auth/server/session";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await requirePageSession();

  return (
    <DashboardShell
      role={session.user.role}
      email={session.user.email}
      name={session.user.name}
    >
      {children}
    </DashboardShell>
  );
}
