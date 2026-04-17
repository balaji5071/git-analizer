import { NextResponse } from "next/server";
import { z } from "zod";

import { appEnv } from "@/lib/env";
import { connectToDatabase } from "@/lib/mongoose";
import { User } from "@/models/User";
import {
  isValidGitHubUsername,
  normalizeGitHubUsernameInput,
} from "@/utils/github";
import { hashPassword } from "@/utils/password";

const registerSchema = z
  .object({
    name: z.string().trim().min(2).max(80),
    email: z.string().trim().email(),
    password: z.string().min(8).max(128),
    role: z.enum(["recruiter", "individual"]),
    githubUsername: z.string().trim().max(200).optional().or(z.literal("")),
  })
  .superRefine((data, context) => {
    const normalizedGitHubUsername = normalizeGitHubUsernameInput(data.githubUsername);

    if (data.role === "individual" && !normalizedGitHubUsername) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["githubUsername"],
        message: "GitHub username is required for individual accounts.",
      });
      return;
    }

    if (normalizedGitHubUsername && !isValidGitHubUsername(normalizedGitHubUsername)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["githubUsername"],
        message: "Enter a valid GitHub username.",
      });
    }
  });

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsedBody = registerSchema.safeParse(body);

    if (!parsedBody.success) {
      return NextResponse.json(
        {
          error: "Please provide valid registration details.",
          issues: parsedBody.error.flatten(),
        },
        { status: 400 },
      );
    }

    if (!process.env.MONGODB_URI?.trim()) {
      return NextResponse.json(
        {
          error:
            "Registration is unavailable because MONGODB_URI is not configured.",
        },
        { status: 503 },
      );
    }

    await connectToDatabase();

    const email = parsedBody.data.email.toLowerCase();
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with that email already exists." },
        { status: 409 },
      );
    }

    const role = appEnv.adminEmails.includes(email)
      ? "admin"
      : parsedBody.data.role;
    const normalizedGitHubUsername = normalizeGitHubUsernameInput(
      parsedBody.data.githubUsername,
    );

    const user = await User.create({
      email,
      password: await hashPassword(parsedBody.data.password),
      name: parsedBody.data.name,
      role,
      githubUsername: normalizedGitHubUsername || undefined,
    });

    return NextResponse.json(
      {
        message: "Account created successfully.",
        user: {
          id: user._id.toString(),
          email: user.email,
          role: user.role,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unable to register the account.",
      },
      { status: 500 },
    );
  }
}
