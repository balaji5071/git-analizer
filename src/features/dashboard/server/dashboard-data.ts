import { connectToDatabase } from "@/lib/mongoose";
import { Analysis } from "@/models/Analysis";
import { User } from "@/models/User";
import type { AnalysisDocument } from "@/models/Analysis";
import type { AnalysisDocumentShape } from "@/types/analysis";
import type { UserRole } from "@/types/auth";
import { normalizeGitHubProfileSummary } from "@/utils/analysis";

function serializeAnalysis(analysis: AnalysisDocument): AnalysisDocumentShape {
  const githubProfile = {
    username: analysis.githubProfile.username,
    displayName: analysis.githubProfile.displayName ?? null,
    bio: analysis.githubProfile.bio ?? null,
    location: analysis.githubProfile.location ?? null,
    company: analysis.githubProfile.company ?? null,
    avatarUrl: analysis.githubProfile.avatarUrl,
    profileUrl: analysis.githubProfile.profileUrl,
    followers: analysis.githubProfile.followers,
    following: analysis.githubProfile.following,
    publicRepos: analysis.githubProfile.publicRepos,
  };

  const metrics = {
    totalRepos: analysis.metrics.totalRepos,
    totalStars: analysis.metrics.totalStars,
    totalForks: analysis.metrics.totalForks,
    followerCount: analysis.metrics.followerCount,
    followingCount: analysis.metrics.followingCount,
    topLanguages: analysis.metrics.topLanguages.map((language) => ({
      name: language.name,
      count: language.count,
    })),
  };

  return {
    id: analysis._id.toString(),
    githubUsername: analysis.githubUsername,
    requestedByRole: analysis.requestedByRole,
    createdAt: analysis.createdAt.toISOString(),
    githubProfile: normalizeGitHubProfileSummary(githubProfile),
    metrics,
    summary: analysis.summary,
    strengths: [...analysis.strengths],
    weaknesses: [...analysis.weaknesses],
    suggestions: [...analysis.suggestions],
    hireabilityScore: analysis.hireabilityScore,
    source: analysis.source,
  };
}

function serializeUser(user: {
  _id: { toString(): string };
  name?: string | null;
  email: string;
  role: UserRole;
  githubUsername?: string | null;
  bookmarks?: string[];
  createdAt: Date;
  lastLoginAt?: Date | null;
}) {
  return {
    id: user._id.toString(),
    name: user.name ?? null,
    email: user.email,
    role: user.role,
    githubUsername: user.githubUsername ?? null,
    bookmarksCount: user.bookmarks?.length ?? 0,
    createdAt: user.createdAt.toISOString(),
    lastLoginAt: user.lastLoginAt?.toISOString() ?? null,
  };
}

export async function getUserHistory(userId: string) {
  await connectToDatabase();

  const analyses = await Analysis.find({ userId }).sort({ createdAt: -1 }).limit(12);

  return analyses.map(serializeAnalysis);
}

export async function getRecruiterDashboardData(userId: string) {
  await connectToDatabase();

  const [user, analyses] = await Promise.all([
    User.findById(userId),
    Analysis.find({ userId }).sort({ createdAt: -1 }).limit(12),
  ]);

  const serializedAnalyses = analyses.map(serializeAnalysis);
  const averageScore =
    serializedAnalyses.length > 0
      ? Math.round(
          serializedAnalyses.reduce(
            (sum, analysis) => sum + analysis.hireabilityScore,
            0,
          ) / serializedAnalyses.length,
        )
      : 0;

  return {
    analyses: serializedAnalyses,
    bookmarks: user?.bookmarks ? [...user.bookmarks] : [],
    stats: {
      analysisCount: serializedAnalyses.length,
      bookmarksCount: user?.bookmarks.length ?? 0,
      averageScore,
      latestAnalysisAt: serializedAnalyses[0]?.createdAt ?? null,
    },
  };
}

export async function getIndividualDashboardData(userId: string) {
  await connectToDatabase();

  const [user, analyses] = await Promise.all([
    User.findById(userId),
    Analysis.find({ userId }).sort({ createdAt: -1 }).limit(12),
  ]);

  const serializedAnalyses = analyses.map(serializeAnalysis);

  return {
    profile: user
      ? {
          name: user.name ?? null,
          email: user.email,
          githubUsername: user.githubUsername ?? null,
          role: user.role,
        }
      : null,
    analyses: serializedAnalyses,
    stats: {
      analysisCount: serializedAnalyses.length,
      bestScore:
        serializedAnalyses.length > 0
          ? Math.max(...serializedAnalyses.map((item) => item.hireabilityScore))
          : 0,
      topLanguage:
        serializedAnalyses[0]?.metrics.topLanguages[0]?.name ?? "Not available",
    },
  };
}

export async function getAdminDashboardData() {
  await connectToDatabase();

  const [users, analyses, userCount, analysisCount, roleCounts, scoreSnapshot] =
    await Promise.all([
      User.find().sort({ createdAt: -1 }).limit(20),
      Analysis.find().sort({ createdAt: -1 }).limit(25),
      User.countDocuments(),
      Analysis.countDocuments(),
      User.aggregate<{ _id: UserRole; count: number }>([
        {
          $group: {
            _id: "$role",
            count: { $sum: 1 },
          },
        },
      ]),
      Analysis.aggregate<{ averageScore: number }>([
        {
          $group: {
            _id: null,
            averageScore: { $avg: "$hireabilityScore" },
          },
        },
      ]),
    ]);

  const roleMap = roleCounts.reduce<Record<string, number>>((acc, item) => {
    acc[item._id] = item.count;
    return acc;
  }, {});

  return {
    users: users.map(serializeUser),
    analyses: analyses.map(serializeAnalysis),
    stats: {
      userCount,
      analysisCount,
      recruiterCount: roleMap.recruiter ?? 0,
      individualCount: roleMap.individual ?? 0,
      adminCount: roleMap.admin ?? 0,
      averageScore: Math.round(scoreSnapshot[0]?.averageScore ?? 0),
    },
  };
}
