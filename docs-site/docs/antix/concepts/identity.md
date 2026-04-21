---
title: "Identity Provider"
description: "OAuth 2.0, PKCE, JWT specs, discovery, and revocation."
sidebar_position: 6
---

# Built-in Identity Provider (IdP)

Antix is a full **OAuth 2.0 Identity Provider**. Internal web apps and local CLI agents authenticate against Antix end-to-end.

- **SSO** — Google and GitHub.
- **Sessions** — Refresh Token Rotation with a 30-second grace window.
- **PKCE** — S256 challenges are required for all flows; the `plain` method is rejected.
- **Client IDs** — only `antix-portal` (web) and `ante-cli` (local agents) are recognized. Third-party OAuth client registration is not currently supported.

## Discovery endpoints

- `/.well-known/openid-configuration` — OIDC discovery document.
- `/.well-known/jwks.json` — public JWKS for verifying issued access tokens.

Third-party services can verify Antix-issued JWTs using the published JWKS without contacting Antix per-request.

## Authentication flow (PKCE)

1. **Initiate login** — your app redirects the user to Antix:

   ```
   GET https://antix.antigma.ai/auth/public/login
       ?client_id=antix-portal
       &redirect_uri=https://antix.antigma.ai/portal/callback
       &state=<csrf-random>
       &code_challenge=<base64url-sha256-of-verifier>
       &code_challenge_method=S256
   ```

   `state`, `code_challenge`, and `code_challenge_method=S256` are required. `redirect_uri` must match the value registered for the given `client_id` — third-party client registration is not supported, so substitute `antix-portal` / `ante-cli` and their registered callbacks.

2. **User authenticates** via Google or GitHub.

3. **Token exchange:**

   ```bash
   curl -X POST https://antix.antigma.ai/oauth/token \
     -d "grant_type=authorization_code" \
     -d "code=<authorization_code>" \
     -d "code_verifier=<original-verifier>" \
     -d "client_id=antix-portal" \
     -d "redirect_uri=https://antix.antigma.ai/portal/callback"
   ```

   Response shape:

   ```json
   {
     "access_token": "<rs256-jwt>",
     "refresh_token": "<opaque>",
     "expires_in": 900,
     "token_type": "Bearer"
   }
   ```

   :::note
   Antix advertises OIDC discovery for JWKS and metadata reuse, but issues OAuth 2.0 access tokens only — there is no `id_token` in the token response today.
   :::

## Session endpoints

- `/auth/establish-session` and `/auth/session-code` — short-code session bootstrap used by the portal.
- `/oauth/authorize` — authorization endpoint used in the PKCE flow.
- `/oauth/revoke` — revoke a refresh token or active session.

## JWT specification

Antix issues `RS256` JWTs.

- **TTL** — `expires_in: 900` (15 minutes).
- **Audience (`aud`)** — `antix-portal` for web apps, `ante-cli` for local agents.
- **Key ID (`kid`)** — `antix-1`.

## Refresh Token Rotation

Refresh tokens are single-use and rotate on every exchange. To tolerate client retries and network flakes, Antix accepts the previous refresh token for **30 seconds** after rotation.

Refresh-token families are capped per `client_id` (`MAX_ACTIVE_FAMILIES_PER_CLIENT`). Signing in on the portal does **not** evict an active CLI session — the two `client_id` values have independent family caps.

## Revocation

- **Access tokens** — the token is added to the blocklist. The authentication middleware reads this on every request in strict mode.
- **Refresh tokens** — marked revoked via `/oauth/revoke` or by the logout handler.

Revocation propagates within seconds and is guaranteed to take effect within the 15-minute access-token TTL.
