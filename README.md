## LifeOS Setup

This project uses Next.js 16, Auth0 v4, Convex, and OpenRouter.

### Required Auth0 setup

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

If these values are missing or still placeholders, the app now fails fast with a clear Auth0 configuration error instead of an OpenID discovery 404.

If you change `AUTH0_SECRET`, switch tenants, or move between incompatible local auth setups, your browser can keep stale Auth0 cookies. The app now clears invalid Auth0 cookies automatically and redirects you to a fresh login flow instead of crashing with `Invalid Compact JWE`.

### Google connection setup for LifeOS

The app now uses one Auth0 Google social connection, `google-oauth2`, and requests different scopes at runtime for Gmail, Calendar, and Drive.

Auth0 Connected Accounts also requires the Auth0 My Account API flow to be available to this application. The app uses `create:me:connected_accounts` before redirecting to Google, so a failure before Google opens is an Auth0 setup issue, not a Google consent-screen issue.

In Auth0, use the existing `google-oauth2` connection and make sure:

- the Google Client ID and Client Secret are valid
- the connection is enabled for the same Regular Web Application used by LifeOS login
- Token Vault is enabled
- Offline Access is enabled
- Connected Accounts is enabled

In Google Cloud, create or repair a `Web application` OAuth client and add this redirect URI exactly:

- `https://dev-63uejigf065ebwtx.us.auth0.com/login/callback`

The Google Client ID and Secret from that OAuth client must be entered into the Auth0 `google-oauth2` social connection settings.

Required Google scopes:

- Gmail:
  - `https://www.googleapis.com/auth/gmail.readonly`
  - `https://www.googleapis.com/auth/gmail.compose`
  - `https://www.googleapis.com/auth/gmail.send`
- Calendar:
  - `https://www.googleapis.com/auth/calendar.events`
- Drive:
  - `https://www.googleapis.com/auth/documents`
  - `https://www.googleapis.com/auth/drive.metadata.readonly`
- All services:
  - `openid`
  - `email`
  - `profile`

In Google Cloud, enable:

- Gmail API
- Google Calendar API
- Google Drive API
- Google Docs API

Also configure the OAuth consent screen and add your test users before trying the per-service connection flow.

If you want the app to preflight-check your tenant setup before starting authorization, add Auth0 Management API credentials to `.env.local`:

```bash
AUTH0_MANAGEMENT_CLIENT_ID=your_management_client_id
AUTH0_MANAGEMENT_CLIENT_SECRET=your_management_client_secret
```

These Management API credentials should come from a Machine-to-Machine Auth0 application. They should not reuse the same client ID and secret as your main LifeOS login app.

With those values present, LifeOS can detect common setup problems earlier, such as a missing `google-oauth2` connection or a connection that is not enabled for the current app.

### Hosted login copy and dev-key cleanup

The text on Auth0's hosted login page and the `Dev Keys` warning are controlled by Auth0, not by the Next.js UI in this repo.

To apply the LifeOS copy and remove the Google dev-keys warning for this app:

1. Create or reuse a Machine to Machine Auth0 application.
2. Authorize it for the Auth0 Management API.
3. Grant these scopes:
   - `update:prompts`
   - `read:connections`
   - `update:connections`
4. Add these values to `.env.local`:

```bash
AUTH0_MANAGEMENT_CLIENT_ID=your_management_client_id
AUTH0_MANAGEMENT_CLIENT_SECRET=your_management_client_secret
AUTH0_HOSTED_LOGIN_TEXT="Log in to LifeOS to continue."
AUTH0_HOSTED_SIGNUP_TEXT="Log in to LifeOS to continue."
AUTH0_SOCIAL_CONNECTION_TO_DISABLE=google-oauth2
```

5. Run:

```bash
npm run auth0:hosted-login
```

By default, this updates the hosted login and sign-up descriptions, then disables the app's Google connection so the Auth0 developer-keys alert is no longer shown. If you later add your own production Google OAuth keys in Auth0, you can re-enable the connection there.

## Getting Started

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Verification

```bash
npm run typecheck
npm run build
```

You also need a real `OPENROUTER_API_KEY` if you want the AI chat flow to work end to end.

## Learn More

Useful docs:

- [Next.js Documentation](https://nextjs.org/docs)
- [Auth0 Next.js SDK](https://auth0.github.io/nextjs-auth0/)
- [Convex Documentation](https://docs.convex.dev/)
- [OpenRouter](https://openrouter.ai/)
