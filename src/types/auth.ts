export type UserRole = "recruiter" | "individual" | "admin";

export interface SessionUser {
  id: string;
  email: string;
  role: UserRole;
  name?: string | null;
  image?: string | null;
  githubUsername?: string | null;
}
