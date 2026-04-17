import { NextResponse } from "next/server";

import { getCurrentSession } from "@/features/auth/server/session";
import { getUserHistory } from "@/features/dashboard/server/dashboard-data";
import { connectToDatabase } from "@/lib/mongoose";
import { User } from "@/models/User";

export async function GET() {
  try {
    const session = await getCurrentSession();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const history = await getUserHistory(session.user.id);
    await connectToDatabase();
    const user = await User.findById(session.user.id);

    return NextResponse.json(
      {
        history,
        bookmarks: user?.bookmarks ?? [],
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unable to load analysis history.",
      },
      { status: 500 },
    );
  }
}
