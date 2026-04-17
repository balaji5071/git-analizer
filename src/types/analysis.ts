import type { UserRole } from "@/types/auth";

export type AnalysisSource = "groq" | "nvidia" | "heuristic";

export interface LanguageStat {
  name: string;
  count: number;
}

export interface GitHubRepositorySnapshot {
  id: number;
  name: string;
  description: string | null;
  stars: number;
  forks: number;
  language: string | null;
  htmlUrl: string;
  homepage: string | null;
  updatedAt: string;
}

export interface GitHubProfileMetrics {
  totalRepos: number;
  totalStars: number;
  totalForks: number;
  followerCount: number;
  followingCount: number;
  topLanguages: LanguageStat[];
}

export interface GitHubProfileSummary {
  username: string;
  displayName: string | null;
  bio: string | null;
  location: string | null;
  company: string | null;
  avatarUrl: string;
  profileUrl: string;
  followers: number;
  following: number;
  publicRepos: number;
}

export interface GitHubProfileData {
  user: GitHubProfileSummary;
  repos: GitHubRepositorySnapshot[];
  metrics: GitHubProfileMetrics;
}

export interface AIAnalysisResult {
  summary: string;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  hireabilityScore: number;
  source: AnalysisSource;
}

export interface AnalysisDocumentShape extends AIAnalysisResult {
  id: string;
  githubUsername: string;
  requestedByRole: UserRole;
  createdAt: string;
  githubProfile: GitHubProfileSummary;
  metrics: GitHubProfileMetrics;
}
