# AI GitHub Profile Analyzer

A production-ready SaaS scaffold built with Next.js App Router, TypeScript, Tailwind CSS, MongoDB, GitHub API integration, and Groq-backed AI analysis.

## Features

- JWT session-based authentication with `next-auth`
- Email/password registration and sign-in
- Optional Google OAuth sign-in
- Role-based dashboards for recruiters, individuals, and admins
- GitHub profile ingestion with cached repository statistics
- AI analysis pipeline with Groq API integration and heuristic fallback
- MongoDB persistence for users, analysis history, and recruiter bookmarks
- Dark/light theme toggle persisted through local storage
- Middleware-based route protection

## Tech Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- MongoDB + Mongoose
- NextAuth.js with JWT sessions
- GitHub REST API
- Groq OpenAI-compatible chat completions API
- OpenAI Node SDK configured against Groq's compatible base URL

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Copy the environment template and fill in the values in a local-only file:

```bash
cp .env.example .env.local
```

3. Start the development server:

```bash
npm run dev
```

4. Open `http://localhost:3000`

## Required Environment Variables

```bash
MONGODB_URI=
NEXTAUTH_SECRET=
NEXTAUTH_URL=
```

## Optional Environment Variables

```bash
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_TOKEN=
GROQ_API_KEY=
GROQ_API_BASE_URL=
GROQ_MODEL=
ADMIN_EMAILS=
```

## Key Routes

- `/` landing page
- `/sign-in` sign in
- `/sign-up` registration
- `/dashboard/recruiter` recruiter dashboard
- `/dashboard/individual` individual dashboard
- `/dashboard/admin` admin dashboard

## API Routes

- `POST /api/auth/register`
- `GET|POST /api/auth/[...nextauth]`
- `POST /api/analyze`
- `GET /api/history`
- `GET|POST /api/bookmarks`
- `GET /api/admin/users`
- `GET /api/admin/analyses`

## Deployment

- Deploy the app to Vercel
- Use MongoDB Atlas for the database
- Set all secrets in the Vercel project environment settings
- Add GitHub and Groq credentials before enabling full analysis in production
- Keep real secrets in `.env.local` or your hosting provider's secret manager, not in `.env.example`

## Notes

- If `GROQ_API_KEY` is missing or the upstream request fails, the app falls back to a deterministic heuristic analysis instead of breaking the flow.
- Google OAuth buttons appear only when Google credentials are configured.
- Admin access is controlled through the comma-separated `ADMIN_EMAILS` environment variable.
# git-analizer
# git-analizer
