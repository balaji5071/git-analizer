import { NextResponse } from "next/server";
import { z } from "zod";

import { getCurrentSession } from "@/features/auth/server/session";
import { connectToDatabase } from "@/lib/mongoose";
import { User } from "@/models/User";

const bookmarkSchema = z.object({
  githubUsername: z.string().trim().min(1).max(39),
});

export async function GET() {
  const session = await getCurrentSession();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== "recruiter") {
    return NextResponse.json(
      { error: "Bookmarks are only available to recruiters." },
      { status: 403 },
    );
  }

  await connectToDatabase();
  const user = await User.findById(session.user.id);

  return NextResponse.json(
    { bookmarks: user?.bookmarks ?? [] },
    {
      status: 200,
    },
  );
}

export async function POST(request: Request) {
  try {
    const session = await getCurrentSession();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "recruiter") {
      return NextResponse.json(
        { error: "Bookmarks are only available to recruiters." },
        { status: 403 },
      );
    }

    const body = await request.json();
    const parsedBody = bookmarkSchema.safeParse(body);

    if (!parsedBody.success) {
      return NextResponse.json(
        { error: "Enter a valid GitHub username." },
        { status: 400 },
      );
    }

    await connectToDatabase();
    const user = await User.findById(session.user.id);

    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    const githubUsername = parsedBody.data.githubUsername;
    const exists = user.bookmarks.includes(githubUsername);

    user.bookmarks = exists
      ? user.bookmarks.filter((item: string) => item !== githubUsername)
      : [...user.bookmarks, githubUsername];

    await user.save();

    return NextResponse.json(
      {
        bookmarks: user.bookmarks,
        bookmarked: !exists,
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unable to update bookmarks.",
      },
      { status: 500 },
    );
  }
}
