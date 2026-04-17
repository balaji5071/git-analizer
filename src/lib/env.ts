const DEFAULT_GITHUB_API_BASE_URL = "https://api.github.com";
const DEFAULT_GROQ_API_BASE_URL = "https://api.groq.com/openai/v1";
const DEFAULT_GROQ_MODEL = "llama-3.3-70b-versatile";

function requireEnv(name: string, value?: string) {
  if (!value) {
    throw new Error(`${name} is not configured.`);
  }

  return value;
}

export const appEnv = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  githubApiBaseUrl: process.env.GITHUB_API_BASE_URL ?? DEFAULT_GITHUB_API_BASE_URL,
  githubToken: process.env.GITHUB_TOKEN,
  groqApiBaseUrl: process.env.GROQ_API_BASE_URL ?? DEFAULT_GROQ_API_BASE_URL,
  groqModel: process.env.GROQ_MODEL ?? DEFAULT_GROQ_MODEL,
  groqApiKey: process.env.GROQ_API_KEY,
  googleClientId: process.env.GOOGLE_CLIENT_ID,
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
  adminEmails: (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean),
};

export const secrets = {
  mongoUri: () => requireEnv("MONGODB_URI", process.env.MONGODB_URI),
  nextAuthSecret: () =>
    requireEnv("NEXTAUTH_SECRET", process.env.NEXTAUTH_SECRET),
};
