# LifeOS — Your Personal AI Life Agent

> Type a message. Your agent handles the rest.

LifeOS is a personal AI assistant you chat with in your browser. You type a request in plain English — *"what emails do I have from today?"* or *"book me a 1-hour slot tomorrow afternoon"* — and it connects to your real Gmail, Google Calendar, and Google Drive accounts to get it done. Every message, action, and setting is saved to your own private database.

---

## ✨ MVP Features

### 🤖 AI Chat Interface
- Natural language conversation with your personal life agent
- Streaming responses with real-time typing indicators
- Persistent conversation history saved to your database
- Suggested prompts to get started quickly
- Soft audio chime when the agent finishes responding (configurable in Settings)

### 📧 Gmail Integration
- **Summarise your inbox** — get a quick overview of unread emails
- **Search emails** — find specific messages by keyword, sender, or topic
- **Draft replies** — let the agent compose a reply for your review
- **Send emails** — dispatch messages on your behalf (with approval control)

### 📅 Google Calendar Integration
- **Get your schedule** — view today's or any day's events at a glance
- **Create events** — add meetings, reminders, and appointments by just describing them
- **Reschedule events** — update existing events without opening Google Calendar
- **Find free slots** — ask "when am I free tomorrow afternoon?" and get real answers

### 🗂 Google Drive Integration
- **List recent documents** — see your latest Google Docs at a glance
- **Summarise a document** — get a concise summary of any Doc's content
- **Create documents** — generate new Google Docs with AI-written content

### 🔐 Security & Connections
- Secure sign-in via **Auth0 + Google OAuth 2.0**
- Each Google service (Gmail, Calendar, Drive) is connected **individually** with granular scopes
- OAuth tokens stored in your **own private Convex database** — never on a shared server
- Automatic token refresh — connections stay alive without re-authorising
- Revoke access to any service at any time from the Connections page

### ⚙️ Settings & Control
- **Agent Behaviour** — auto-approve low-risk (read-only) actions, or require manual approval for all write actions (sending emails, creating events)
- **Security** — step-up authentication for sensitive operations
- **Audit Log** — every agent action is logged to your Convex database for review
- **Notifications** — toggle the completion chime on or off
- All settings are persisted to your database and sync across sessions

### 📜 History
- Full timeline of every action the agent has taken on your behalf
- Filterable by service (Gmail, Calendar, Drive) and status (success, pending, failed)

---

## How it is built

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| Authentication | Auth0 v4 + Google OAuth 2.0 |
| Database | Convex (real-time, serverless) |
| AI model | OpenRouter (default: GPT-4.1 Mini) |
| AI SDK | Vercel AI SDK v6 |
| Google APIs | Gmail API, Calendar API, Drive API, Docs API |
| Animations | Framer Motion |
| Icons | Lucide React |
| Styling | Vanilla CSS with CSS custom properties + Tailwind v4 |

---

## ⚠️ "Google hasn't verified this app" — Don't Panic, You're Safe

When you connect a Google service you will see a screen like this:

> **"Google hasn't verified this app"**
> *The app is requesting access to sensitive info in your Google Account. Until the developer verifies this app with Google, you shouldn't use it.*

This is **normal** for any personal project that has not gone through Google's formal app-review programme. It does not mean anything is wrong.

**Your data is safe because:**

- Your Google password is never seen by LifeOS. Sign-in goes through Google and Auth0 only.
- OAuth tokens are stored in your own private Convex database, not on any shared server.
- The AI only acts on your data when you explicitly ask it to.
- Nothing is shared or sold to any third party.
- You can revoke access at any time at [myaccount.google.com/permissions](https://myaccount.google.com/permissions).

**To get past the screen:**

1. Click **"Advanced"** (bottom-left of the warning screen)
2. Click **"Go to LifeOS (unsafe)"** — "unsafe" is Google's standard label for unreviewed apps, not a real warning about this app
3. Click **"Allow"**

The warning will not appear again for that service after you allow it.

---

## Setup

### 1. Environment variables

Copy `.env.example` to `.env.local` and fill in the values:

```bash
cp .env.example .env.local
```

All required variables are listed and explained in `.env.example`.

### 2. Auth0

Create a **Regular Web Application** in your [Auth0 dashboard](https://manage.auth0.com/) and set:

| Auth0 field | Value |
|---|---|
| Allowed Callback URLs | `http://localhost:3000/auth/callback` |
| Allowed Logout URLs | `http://localhost:3000` |
| Allowed Web Origins | `http://localhost:3000` |

Copy the Domain, Client ID, and Client Secret into `.env.local`.

Enable **Google** as a social connection in Auth0 → Authentication → Social.

### 3. Google Cloud

1. Go to [console.cloud.google.com](https://console.cloud.google.com) → **APIs & Services → Credentials**
2. Create an OAuth 2.0 Client ID (Web Application)
3. Add these Authorised Redirect URIs:
   - `http://localhost:3000/api/auth/google/callback`
   - `https://YOUR_AUTH0_DOMAIN/login/callback`
4. Enable these APIs in the library:
   - Gmail API
   - Google Calendar API
   - Google Drive API
   - Google Docs API
5. Copy the Client ID and Secret into `.env.local`

> If your Google Cloud project is in **Testing** status, go to **APIs & Services → Audience** and either add your email as a test user or click **Publish App**.

### 4. Convex

```bash
npx convex dev
```

This sets up your database and writes `NEXT_PUBLIC_CONVEX_URL` and `CONVEX_DEPLOYMENT` into `.env.local` automatically.

### 5. OpenRouter

Sign up at [openrouter.ai](https://openrouter.ai), create an API key, and add it to `.env.local`.

Default model: `openai/gpt-4.1-mini`. Change it via the `AI_MODEL` variable.

---

## Running locally

```bash
# Terminal 1 — Convex dev server
npx convex dev

# Terminal 2 — Next.js dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Deploying to Vercel

1. Push your code to GitHub
2. Import the repo in [vercel.com](https://vercel.com)
3. Add all environment variables in **Project → Settings → Environment Variables** (`.env.local` is gitignored and not included in the repo)
4. Set `APP_BASE_URL` to your Vercel production URL
5. Also update the Authorised Redirect URIs in Google Cloud Console to include your production URL

---

## Useful commands

```bash
npm run dev          # Start development server
npm run build        # Production build
npm run typecheck    # TypeScript check
npx convex dev       # Start Convex backend
npx convex codegen   # Regenerate Convex TypeScript types
```
