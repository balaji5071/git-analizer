import { NextResponse } from "next/server";
import { z } from "zod";

import { getCurrentSession } from "@/features/auth/server/session";
import { getAdminDashboardData } from "@/features/dashboard/server/dashboard-data";
import { connectToDatabase } from "@/lib/mongoose";
import { User } from "@/models/User";
import { hashPassword } from "@/utils/password";

const createUserSchema = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  email: z.string().trim().email(),
  password: z.string().min(8).max(128),
  role: z.enum(["individual", "recruiter", "admin"]),
  githubUsername: z.string().trim().max(80).optional(),
});

const updateRoleSchema = z.object({
  userId: z.string().trim().min(1),
  role: z.enum(["individual", "recruiter", "admin"]),
});

const deleteUserSchema = z.object({
  userId: z.string().trim().min(1),
});

export async function GET() {
  try {
    const session = await getCurrentSession();

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const data = await getAdminDashboardData();

    return NextResponse.json(
      {
        users: data.users,
        stats: data.stats,
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unable to load admin users.",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getCurrentSession();

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const parsedBody = createUserSchema.safeParse(body);

    if (!parsedBody.success) {
      return NextResponse.json(
        {
          error: "Please provide valid user details.",
          issues: parsedBody.error.flatten(),
        },
        { status: 400 },
      );
    }

    await connectToDatabase();

    const email = parsedBody.data.email.toLowerCase();
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return NextResponse.json(
        { error: "A user with that email already exists." },
        { status: 409 },
      );
    }

    const createdUser = await User.create({
      email,
      password: await hashPassword(parsedBody.data.password),
      name: parsedBody.data.name,
      role: parsedBody.data.role,
      githubUsername: parsedBody.data.githubUsername || undefined,
      bookmarks: [],
    });

    return NextResponse.json(
      {
        user: {
          id: createdUser._id.toString(),
          name: createdUser.name ?? null,
          email: createdUser.email,
          role: createdUser.role,
          githubUsername: createdUser.githubUsername ?? null,
          bookmarksCount: createdUser.bookmarks?.length ?? 0,
          createdAt: createdUser.createdAt.toISOString(),
          lastLoginAt: createdUser.lastLoginAt?.toISOString() ?? null,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unable to create user.",
      },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getCurrentSession();

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const parsedBody = updateRoleSchema.safeParse(body);

    if (!parsedBody.success) {
      return NextResponse.json(
        {
          error: "Please provide a valid user and role.",
          issues: parsedBody.error.flatten(),
        },
        { status: 400 },
      );
    }

    if (parsedBody.data.userId === session.user.id && parsedBody.data.role !== "admin") {
      return NextResponse.json(
        { error: "You cannot remove your own admin role." },
        { status: 400 },
      );
    }

    await connectToDatabase();

    const updatedUser = await User.findByIdAndUpdate(
      parsedBody.data.userId,
      { role: parsedBody.data.role },
      { new: true },
    );

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    return NextResponse.json(
      {
        user: {
          id: updatedUser._id.toString(),
          name: updatedUser.name ?? null,
          email: updatedUser.email,
          role: updatedUser.role,
          githubUsername: updatedUser.githubUsername ?? null,
          bookmarksCount: updatedUser.bookmarks?.length ?? 0,
          createdAt: updatedUser.createdAt.toISOString(),
          lastLoginAt: updatedUser.lastLoginAt?.toISOString() ?? null,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unable to update user role.",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getCurrentSession();

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const parsedBody = deleteUserSchema.safeParse(body);

    if (!parsedBody.success) {
      return NextResponse.json(
        {
          error: "Please provide a valid user id.",
          issues: parsedBody.error.flatten(),
        },
        { status: 400 },
      );
    }

    if (parsedBody.data.userId === session.user.id) {
      return NextResponse.json(
        { error: "You cannot delete your own admin account." },
        { status: 400 },
      );
    }

    await connectToDatabase();

    const deletedUser = await User.findByIdAndDelete(parsedBody.data.userId);

    if (!deletedUser) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unable to delete user.",
      },
      { status: 500 },
    );
  }
}
