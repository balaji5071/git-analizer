import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { authOptions } from "@/features/auth/server/auth-options";
import type { UserRole } from "@/types/auth";

export async function getCurrentSession() {
  return getServerSession(authOptions);
}

export async function requirePageSession(allowedRoles?: UserRole[]) {
  const session = await getCurrentSession();

  if (!session?.user) {
    redirect("/sign-in");
  }

  if (allowedRoles && !allowedRoles.includes(session.user.role)) {
    redirect("/unauthorized");
  }

  return session;
}
