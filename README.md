# Eutian Ai

Eutian Ai is a role-based GitHub intelligence platform built with Next.js, TypeScript, and MongoDB. It helps recruiters evaluate developer profiles, helps individuals improve their own profile quality, and gives admins full operational control.

## Core Features

- Authentication with email/password and optional Google OAuth
- Role-based access for individual, recruiter, and admin users
- GitHub profile analysis with AI + deterministic fallback logic
- Analysis history with downloadable report files
- Recruiter bookmarks workflow with dedicated bookmarks page
- ATS resume optimizer (beta) from existing resume + job description
- Resume upload support for PDF, DOCX, and text files
- User settings for profile, security, and resume management
- Admin dashboard with user creation, role change, and user deletion
- Theme support (light/dark) and responsive dashboard layout

## Tech Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- MongoDB + Mongoose
- NextAuth (JWT sessions)
- GitHub REST API
- Groq OpenAI-compatible API (via OpenAI SDK)
- Zod validation
- pdf-parse and mammoth for resume parsing

## Role Capabilities

### Individual

- Analyze own GitHub profile
- Open ATS Resume beta page
- Upload or paste existing resume
- Generate optimized resume from job description
- View history and download reports
- Update settings: name, email, phone, country, password, resume

### Recruiter

- Analyze candidate GitHub usernames
- Bookmark candidates
- Access dedicated bookmarks page
- View history and download reports

### Admin

- View platform stats and analysis overview
- Create users
- Change user roles
- Delete users

## Quick Start

1. Install dependencies

```bash
npm install
```

2. Create local environment file

```bash
cp .env.example .env.local
```

3. Configure required env variables

```bash
MONGODB_URI=
NEXTAUTH_SECRET=
NEXTAUTH_URL=
```

4. Start development server

```bash
npm run dev
```

5. Open app

```text
http://localhost:3000
```

## Environment Variables

### Required

```bash
MONGODB_URI=
NEXTAUTH_SECRET=
NEXTAUTH_URL=
```

### Optional

```bash
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_TOKEN=
GITHUB_API_BASE_URL=https://api.github.com
GROQ_API_KEY=
GROQ_API_BASE_URL=https://api.groq.com/openai/v1
GROQ_MODEL=llama-3.3-70b-versatile
ADMIN_EMAILS=admin@example.com
```

Notes:

- `ADMIN_EMAILS` is a comma-separated list of emails that should be treated as admin.
- If `GROQ_API_KEY` is missing/unavailable, analysis falls back to heuristic mode.

## Main Routes

- `/` Home
- `/sign-in` Login
- `/sign-up` Register
- `/dashboard/recruiter` Recruiter hub
- `/dashboard/recruiter/bookmarks` Recruiter bookmarks
- `/dashboard/individual` Individual profile analysis
- `/dashboard/individual/ats-resume` ATS Resume beta
- `/dashboard/history` Analysis history
- `/dashboard/settings` User settings
- `/dashboard/admin` Admin dashboard

## API Overview

### Authentication

- `POST /api/auth/register`
- `GET|POST /api/auth/[...nextauth]`

### Analysis and History

- `POST /api/analyze`
- `GET /api/history`
- `GET|POST /api/bookmarks`

### ATS Resume

- `POST /api/resume/build`

Accepts multipart form data:

- `jobDescription`
- `existingResume` (optional text fallback)
- `resumeFile` (optional PDF/DOCX)

### User Settings

- `GET /api/settings/profile`
- `PATCH /api/settings/profile`

Settings update supports:

- Name, email, phone, country
- Password change (requires current password)
- Resume upload (PDF/DOCX/TXT) or pasted resume text

### Admin APIs

- `GET /api/admin/users`
- `POST /api/admin/users` create user
- `PATCH /api/admin/users` update role
- `DELETE /api/admin/users` delete user
- `GET /api/admin/analyses`

## ATS Resume (Beta)

ATS Resume is marked beta and in testing.

Current behavior:

- Uses existing resume + job description
- Generates optimized resume draft
- Shows detailed optimization audit:
	- Mistakes detected
	- Changes made
	- Remaining gaps

## Admin Setup Notes

1. Add admin email to `ADMIN_EMAILS`
2. Ensure that user record has role `admin`
3. For credentials login, user must have a hashed password in MongoDB

## Security Notes

- Never commit real secrets to git
- Keep tokens and keys in `.env.local` or deployment secret manager
- Rotate keys immediately if exposed

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```
