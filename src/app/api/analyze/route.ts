import { NextResponse } from "next/server";
import { z } from "zod";

import { analyzeGitHubProfile } from "@/features/analysis/server/analyze-github-profile";
import { getCurrentSession } from "@/features/auth/server/session";
import { connectToDatabase } from "@/lib/mongoose";
import { User } from "@/models/User";
import { normalizeGitHubUsernameInput } from "@/utils/github";

const analyzeSchema = z.object({
  githubUsername: z
    .string()
    .trim()
    .min(1)
    .max(39)
    .regex(/^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i, {
      message: "Enter a valid GitHub username.",
    }),
});

export async function POST(request: Request) {
  try {
    const session = await getCurrentSession();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsedBody = analyzeSchema.safeParse({
      githubUsername: normalizeGitHubUsernameInput(
        typeof body === "object" && body !== null
          ? (body as { githubUsername?: unknown }).githubUsername
          : undefined,
      ),
    });

    if (!parsedBody.success) {
      return NextResponse.json(
        {
          error: "Please enter a valid GitHub username.",
          issues: parsedBody.error.flatten(),
        },
        { status: 400 },
      );
    }

    let targetGitHubUsername = parsedBody.data.githubUsername;

    if (session.user.role === "individual") {
      const accountGitHubUsername = normalizeGitHubUsernameInput(
        session.user.githubUsername,
      );

      if (!accountGitHubUsername) {
        return NextResponse.json(
          {
            error:
              "Your account does not have a GitHub username. Please sign up again with a valid GitHub username.",
          },
          { status: 400 },
        );
      }

      targetGitHubUsername = accountGitHubUsername;
    }

    const analysis = await analyzeGitHubProfile(targetGitHubUsername, {
      id: session.user.id,
      email: session.user.email ?? "",
      role: session.user.role,
      name: session.user.name,
      image: session.user.image,
      githubUsername: session.user.githubUsername,
    });

    if (session.user.role === "individual") {
      await connectToDatabase();
      await User.findByIdAndUpdate(session.user.id, {
        githubUsername: analysis.githubUsername,
      });
    }

    return NextResponse.json({ analysis }, { status: 200 });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unable to analyze the profile.";

    if (errorMessage.includes("GitHub request failed (404)")) {
      return NextResponse.json(
        {
          error: "GitHub user not found. Check the username and try again.",
        },
        { status: 404 },
      );
    }

    if (errorMessage.includes("GitHub request failed (401)")) {
      return NextResponse.json(
        {
          error:
            "GitHub API authentication failed. Verify GITHUB_TOKEN or remove it to use public-rate requests.",
        },
        { status: 502 },
      );
    }

    if (errorMessage.includes("GitHub request failed (403)")) {
      return NextResponse.json(
        {
          error:
            "GitHub API rate limit reached. Add a valid GITHUB_TOKEN or try again shortly.",
        },
        { status: 429 },
      );
    }

    return NextResponse.json(
      {
        error: errorMessage,
      },
      { status: 500 },
    );
  }
}
