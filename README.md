# LifeOS — Your Personal AI Life Agent

> Chat with an AI that manages your Gmail, Google Calendar, and Google Drive — autonomously, securely, and all in one place.

---

## 🌟 Project Overview

**LifeOS** is a personal AI-powered life management assistant. Instead of juggling multiple apps, you simply *talk* to LifeOS in plain English and it takes care of the rest — summarising your inbox, checking your schedule, finding free slots, reading documents, and more.

Built as a modern full-stack web application, LifeOS connects your Google services through direct OAuth 2.0, stores everything in your own private database, and uses a powerful language model to understand your requests and act on them intelligently.

**This is your own personal agent — built by you, running under your own accounts, and fully under your control.**

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

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 16 (App Router, Turbopack) |
| **Authentication** | Auth0 v4 + Google OAuth 2.0 |
| **Database & Backend** | Convex (real-time, serverless) |
| **AI Model** | OpenRouter → GPT-4.1 Mini |
| **AI SDK** | Vercel AI SDK v6 |
| **Styling** | Vanilla CSS with CSS variables, Framer Motion |
| **Google APIs** | Gmail API, Calendar API, Drive API, Docs API |

---

## ⚠️ "Google hasn't verified this app" — Don't Panic, You're Safe

When you sign in with Google or connect your Gmail, Calendar, or Drive, you might see a screen that says:

> **"Google hasn't verified this app"**
> *The app is requesting access to sensitive info in your Google Account. Until the developer verifies this app with Google, you shouldn't use it.*

**This is completely normal for a personal project, and your data is 100% safe.** Here's why:

### Why does this warning appear?

Google shows this warning for any app that hasn't gone through their formal **OAuth verification process**. That verification is designed for apps distributed to thousands of strangers — it involves submitting documentation, a privacy policy, and a security review that can take weeks.

**LifeOS is a personal AI agent built for *you*.** It is not a public product. Because it hasn't been submitted for Google's formal review process yet, Google displays this generic caution screen as a precaution for all unreviewed apps.

### Is my data at risk?

**No.** Here's exactly what happens with your data:

- ✅ Your Google password is **never seen or stored** by LifeOS. Sign-in is handled entirely by Google and Auth0 — LifeOS only receives a confirmation that you signed in successfully.
- ✅ Any Gmail, Calendar, or Drive access tokens are stored **only in your own private Convex database** — isolated to this project and accessible only by you.
- ✅ LifeOS only reads or acts on your data **when you explicitly ask it to** (e.g. *"summarise my inbox"* or *"what's on my calendar today?"*).
- ✅ No data is sold, shared, or forwarded to any third party. Ever.
- ✅ You can revoke LifeOS's access at any time by visiting [myaccount.google.com/permissions](https://myaccount.google.com/permissions) and removing it — no questions asked.

### How do I get past the warning?

1. On the warning screen, click **"Advanced"** (small link in the bottom-left corner)
2. Then click **"Go to LifeOS (unsafe)"** — the word *"unsafe"* is Google's standard legal boilerplate shown for **every** unverified app and does **not** reflect any actual risk
3. Review the list of permissions Google shows and click **"Allow"**

You're in! Once you allow access, the warning will **not appear again** for that service.

### When will the warning disappear permanently?

Once LifeOS is submitted to Google's OAuth verification programme and approved, the warning disappears for all users. This is a one-time administrative process on the developer's side and has no effect on the safety or functionality of the app in the meantime.

---

## 🚀 Getting Started

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

---

## ⚙️ Setup & Configuration

### 1. Required Auth0 setup

Before testing `Sign in` or `Sign up`, replace the Auth0 placeholders in `.env.local`:

```bash
AUTH0_DOMAIN=your-tenant.us.auth0.com
AUTH0_CLIENT_ID=your_real_client_id
AUTH0_CLIENT_SECRET=your_real_client_secret
AUTH0_SECRET=your_real_32_plus_char_secret
APP_BASE_URL=http://localhost:3000
```

Use `AUTH0_DOMAIN` without `https://`.

In your Auth0 application settings, configure:

- Allowed Callback URLs: `http://localhost:3000/auth/callback`
- Allowed Logout URLs: `http://localhost:3000`
- Allowed Web Origins: `http://localhost:3000`

`AUTH0_CLIENT_ID` and `AUTH0_CLIENT_SECRET` must come from your Auth0 **Regular Web Application**. Do not point them at a Machine-to-Machine app. If you also use Auth0 Management API features in this repo, those credentials belong in `AUTH0_MANAGEMENT_CLIENT_ID` and `AUTH0_MANAGEMENT_CLIENT_SECRET`, and they should usually be a separate Machine-to-Machine application.

If these values are missing or still placeholders, the app fails fast with a clear Auth0 configuration error instead of an OpenID discovery 404.

If you change `AUTH0_SECRET`, switch tenants, or move between incompatible local auth setups, your browser can keep stale Auth0 cookies. The app clears invalid Auth0 cookies automatically and redirects you to a fresh login flow instead of crashing with `Invalid Compact JWE`.

---

### 2. Google OAuth 2.0 setup (for Gmail / Calendar / Drive)

LifeOS uses direct Google OAuth 2.0 (not Auth0 Token Vault) to connect Google services. You need a Google Cloud project with an OAuth 2.0 client.

**Steps:**

1. Go to [console.cloud.google.com](https://console.cloud.google.com) → APIs & Services → **Credentials**
2. Create → OAuth 2.0 Client ID → **Web Application**
3. Add Authorized Redirect URIs:
   - `http://localhost:3000/api/auth/google/callback` (local development)
   - Your production URL + `/api/auth/google/callback` (when deployed)
4. Also add `https://YOUR_AUTH0_DOMAIN/login/callback` for the Auth0 sign-in flow
5. Enable these APIs in the Google API Library:
   - Gmail API
   - Google Calendar API
   - Google Drive API
   - Google Docs API
6. Copy the Client ID and Secret into `.env.local`:

```bash
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

Required Google scopes (the app requests these automatically):

| Service | Scopes |
|---|---|
| Gmail | `gmail.readonly`, `gmail.compose`, `gmail.send` |
| Calendar | `calendar.events` |
| Drive | `documents`, `drive.metadata.readonly` |
| All | `openid`, `email`, `profile` |

> **Tip:** If your Google Cloud project is in "Testing" status on the OAuth consent screen, only users listed as Test Users can sign in. Go to **APIs & Services → Audience** and either add your email as a test user, or click "Publish App" to remove the restriction entirely.

---

### 3. Convex setup

```bash
npx convex dev
```

This creates your Convex deployment and populates `CONVEX_DEPLOYMENT` and `NEXT_PUBLIC_CONVEX_URL` in `.env.local` automatically.

---

### 4. OpenRouter AI setup

Sign up at [openrouter.ai](https://openrouter.ai), create an API key, and add it to `.env.local`:

```bash
OPENROUTER_API_KEY=sk-or-v1-...
AI_MODEL=openai/gpt-4.1-mini   # or any OpenRouter-supported model
```

---

## ✅ Verification

```bash
npm run typecheck
npm run build
```

---

## 📚 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Auth0 Next.js SDK](https://auth0.github.io/nextjs-auth0/)
- [Convex Documentation](https://docs.convex.dev/)
- [OpenRouter](https://openrouter.ai/)
- [Vercel AI SDK](https://sdk.vercel.ai/docs)
- [Google Cloud Console](https://console.cloud.google.com/)
