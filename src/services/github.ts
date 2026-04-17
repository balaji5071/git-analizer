import { unstable_cache } from "next/cache";

import { appEnv } from "@/lib/env";
import type {
  GitHubProfileData,
  GitHubRepositorySnapshot,
  LanguageStat,
} from "@/types/analysis";

interface GitHubUserResponse {
  avatar_url: string;
  bio: string | null;
  company: string | null;
  followers: number;
  following: number;
  html_url: string;
  location: string | null;
  login: string;
  name: string | null;
  public_repos: number;
}

interface GitHubRepoResponse {
  id: number;
  name: string;
  description: string | null;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  html_url: string;
  homepage: string | null;
  updated_at: string;
}

const MAX_REPO_PAGES = 3;

async function githubFetch<T>(path: string) {
  const request = (useAuthToken: boolean) =>
    fetch(`${appEnv.githubApiBaseUrl}${path}`, {
      headers: {
        Accept: "application/vnd.github+json",
        ...(useAuthToken && appEnv.githubToken
          ? {
              Authorization: `Bearer ${appEnv.githubToken}`,
            }
          : {}),
      },
      next: {
        revalidate: 3600,
      },
    });

  let response = await request(Boolean(appEnv.githubToken));

  // Fall back to unauthenticated requests when the configured token is invalid.
  if (!response.ok && appEnv.githubToken && [401, 403].includes(response.status)) {
    response = await request(false);
  }

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(
      `GitHub request failed (${response.status}): ${errorText || response.statusText}`,
    );
  }

  return (await response.json()) as T;
}

async function getUserRepos(username: string) {
  const repos: GitHubRepoResponse[] = [];

  for (let page = 1; page <= MAX_REPO_PAGES; page += 1) {
    const pageItems = await githubFetch<GitHubRepoResponse[]>(
      `/users/${username}/repos?per_page=100&page=${page}&sort=updated`,
    );

    repos.push(...pageItems);

    if (pageItems.length < 100) {
      break;
    }
  }

  return repos;
}

const getCachedGitHubProfile = unstable_cache(
  async (username: string): Promise<GitHubProfileData> => {
    const [user, repos] = await Promise.all([
      githubFetch<GitHubUserResponse>(`/users/${username}`),
      getUserRepos(username),
    ]);

    const languageCounter = repos.reduce<Record<string, number>>((acc, repo) => {
      if (repo.language) {
        acc[repo.language] = (acc[repo.language] ?? 0) + 1;
      }

      return acc;
    }, {});

    const topLanguages: LanguageStat[] = Object.entries(languageCounter)
      .sort(([, countA], [, countB]) => countB - countA)
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    const repoSnapshots: GitHubRepositorySnapshot[] = repos.map((repo) => ({
      id: repo.id,
      name: repo.name,
      description: repo.description,
      stars: repo.stargazers_count,
      forks: repo.forks_count,
      language: repo.language,
      htmlUrl: repo.html_url,
      homepage: repo.homepage,
      updatedAt: repo.updated_at,
    }));

    const totalStars = repoSnapshots.reduce((sum, repo) => sum + repo.stars, 0);
    const totalForks = repoSnapshots.reduce((sum, repo) => sum + repo.forks, 0);

    return {
      user: {
        username: user.login,
        displayName: user.name,
        bio: user.bio,
        location: user.location,
        company: user.company,
        avatarUrl: user.avatar_url,
        profileUrl: user.html_url,
        followers: user.followers,
        following: user.following,
        publicRepos: user.public_repos,
      },
      repos: repoSnapshots,
      metrics: {
        totalRepos: repoSnapshots.length,
        totalStars,
        totalForks,
        followerCount: user.followers,
        followingCount: user.following,
        topLanguages,
      },
    };
  },
  ["github-profile"],
  {
    revalidate: 3600,
  },
);

export async function getGitHubProfile(username: string) {
  return getCachedGitHubProfile(username.trim());
}
