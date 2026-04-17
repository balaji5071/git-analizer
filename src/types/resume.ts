export interface ResumeProfileContext {
  name?: string | null;
  email?: string | null;
  githubUsername?: string | null;
  latestSummary?: string | null;
  latestStrengths?: string[];
  topLanguages?: string[];
}

export interface AtsResumeResult {
  title: string;
  professionalSummary: string;
  coreSkills: string[];
  impactBullets: string[];
  projectHighlights: string[];
  atsKeywords: string[];
  detectedMistakes: string[];
  changesMade: string[];
  remainingGaps: string[];
  plainTextResume: string;
}
