import type { GitHubProfileSummary } from "@/types/analysis";

type NormalizableGitHubProfileSummary = Omit<
  GitHubProfileSummary,
  "displayName" | "bio" | "location" | "company"
> & {
  displayName?: string | null;
  bio?: string | null;
  location?: string | null;
  company?: string | null;
};

export function normalizeGitHubProfileSummary(
  profile: NormalizableGitHubProfileSummary,
): GitHubProfileSummary {
  return {
    ...profile,
    displayName: profile.displayName ?? null,
    bio: profile.bio ?? null,
    location: profile.location ?? null,
    company: profile.company ?? null,
  };
}
