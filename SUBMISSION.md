# LifeOS — Hackathon Submission Materials (Nebius x NVIDIA Global AI Hackathon, Oct 2026)

## Final Project Description
LifeOS is a personal AI life manager for Gmail, Google Calendar and Google Drive. It provides a natural-language chat interface with persistent conversation memory, human-in-the-loop approval for write actions, and a full audit trail. During this hackathon, LifeOS was migrated to run on Nebius Token Factory using the NVIDIA open model Nemotron-3-Nano-30B-A3B, and gained a "Daily Personal Briefing" workflow that synthesizes unread email + today's calendar into a prioritised plan with approval-gated calendar actions.

## Built With
- Next.js 16 (App Router, Turbopack)
- React 19, TypeScript, Tailwind CSS v4
- Auth0 (app sign-in) + direct Google OAuth 2.0 per service
- Convex (database, real-time, serverless)
- Vercel AI SDK v6
- Nebius Token Factory (OpenAI-compatible) — NVIDIA Nemotron-3-Nano-30B-A3B
- Gmail API, Google Calendar API, Google Drive API, Google Docs API
- Framer Motion, Lucide React

## Public GitHub repository checklist
- [ ] Branch `hackathon/nebius-nemotron` pushed to `origin`
- [ ] MIT LICENSE at repo root (added)
- [ ] README with setup instructions (present, updated)
- [ ] No secrets/OAuth tokens committed (verified)
- [ ] Open-source license visible at top of repo page

## Public demo URL checklist
- [ ] Vercel deployment live (reuse existing project URL or new)
- [ ] `NEBIUS_API_KEY` set in Vercel env (if available) — else clearly labelled mock mode
- [ ] Auth0 callback URLs include production URL
- [ ] Google OAuth redirect URIs include production URL
- [ ] Convex deployment linked

## YouTube demo script (<3 min)
0:00–0:20 — Problem: personal AI scattered across Gmail/Calendar/Drive; need control.
0:20–0:50 — LifeOS overview: chat, persistent memory, per-service Google OAuth, approval cards, audit log.
0:50–1:00 — Hackathon update: now runs on Nebius Token Factory / NVIDIA Nemotron-3-Nano-30B-A3B (show code + env).
1:00–1:50 — Daily Personal Briefing: unread email summary + today's calendar + conflicts + prioritised plan.
1:50–2:20 — Approval flow: proposed calendar action → explicit approve → execute → audit record.
2:20–2:50 — Mock-mode labelling + Nebius/NVIDIA feedback (billing card, OpenAI-compatible API).
2:50–3:00 — Roadmap + call to action.

## Nebius / NVIDIA feedback (honest)
- Billing onboarding requires a bank card; RuPay cards may be declined by Stripe. A Visa/Mastercard card or contacting Nebius support via Discord is the legitimate path. Promo code NEBIUS-DEVPOST-GLOBAL26 and the Nebius Builders Program provide Token Factory credits.
- The OpenAI-compatible API and exact model IDs made integration straightforward; the model catalogue and pricing page are clear.
- Suggestion: a card-free trial or country-aware onboarding would help developers in regions where local cards are declined.

## Final Devpost checklist
- [ ] Working project (demo URL)
- [ ] Category: Personal AI
- [ ] Project description (above)
- [ ] Working demo URL
- [ ] Demo video <3 min public YouTube
- [ ] Public repo URL with open-source license + README
- [ ] Feedback on Nebius Token Factory / NVIDIA tools (above)
- [ ] Hackathon-period changelog (in README)
- [ ] If pre-existing project: written explanation of significant updates (README changelog)

## Known limitations
- Nebius integration implemented but not yet live-verified (no authorised API key in this environment).
- Google OAuth in Testing status requires test users; demo account must be added.
- Mock mode is dev-only and clearly labelled; never used as production inference.
- No Tavily, additional agents, databases, or mobile app (out of scope).