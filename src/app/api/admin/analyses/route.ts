import { NextResponse } from "next/server";

import { getCurrentSession } from "@/features/auth/server/session";
import { getAdminDashboardData } from "@/features/dashboard/server/dashboard-data";

export async function GET() {
  try {
    const session = await getCurrentSession();

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const data = await getAdminDashboardData();

    return NextResponse.json(
      {
        analyses: data.analyses,
        stats: data.stats,
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unable to load admin analyses.",
      },
      { status: 500 },
    );
  }
}
