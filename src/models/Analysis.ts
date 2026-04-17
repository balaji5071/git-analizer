import { model, models, Schema, Types, type Model } from "mongoose";

import type { UserRole } from "@/types/auth";

const analysisSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    requestedByRole: {
      type: String,
      enum: ["recruiter", "individual", "admin"] satisfies UserRole[],
      required: true,
    },
    githubUsername: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    githubProfile: {
      username: { type: String, required: true },
      displayName: { type: String },
      bio: { type: String },
      location: { type: String },
      company: { type: String },
      avatarUrl: { type: String, required: true },
      profileUrl: { type: String, required: true },
      followers: { type: Number, required: true },
      following: { type: Number, required: true },
      publicRepos: { type: Number, required: true },
    },
    metrics: {
      totalRepos: { type: Number, required: true },
      totalStars: { type: Number, required: true },
      totalForks: { type: Number, required: true },
      followerCount: { type: Number, required: true },
      followingCount: { type: Number, required: true },
      topLanguages: [
        {
          name: { type: String, required: true },
          count: { type: Number, required: true },
        },
      ],
    },
    summary: { type: String, required: true },
    strengths: { type: [String], default: [] },
    weaknesses: { type: [String], default: [] },
    suggestions: { type: [String], default: [] },
    hireabilityScore: { type: Number, required: true },
    source: {
      type: String,
      enum: ["groq", "nvidia", "heuristic"],
      default: "heuristic",
    },
  },
  {
    timestamps: true,
  },
);

export interface AnalysisDocument {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  requestedByRole: UserRole;
  githubUsername: string;
  githubProfile: {
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
  };
  metrics: {
    totalRepos: number;
    totalStars: number;
    totalForks: number;
    followerCount: number;
    followingCount: number;
    topLanguages: Array<{
      name: string;
      count: number;
    }>;
  };
  summary: string;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  hireabilityScore: number;
  source: "groq" | "nvidia" | "heuristic";
  createdAt: Date;
  updatedAt: Date;
}

export const Analysis =
  (models.Analysis as Model<AnalysisDocument>) ||
  model<AnalysisDocument>("Analysis", analysisSchema);
