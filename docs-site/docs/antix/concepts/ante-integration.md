---
title: "Ante Control Plane"
description: "Govern local coding agents with PKCE, attribution, and revocation."
sidebar_position: 7
---

# Native Agent Integration

Antix is the centralized control plane for the **Ante CLI**, bringing enterprise governance to local coding agents.

## Connecting Ante to Antix

Developers authenticate their local Ante instance against your Antix server:

```bash
ante auth login
```

This triggers a local OAuth loopback flow (RFC 8252). Antix issues a short-lived **RS256 access token** with `aud: ante-cli` and a 15-minute TTL, plus a rotating refresh token. The refresh token is stored on disk by the CLI; the access token is presented on each API call.

Ante does **not** synthesize Virtual Keys from the refresh token. It uses the access token directly — requests from the CLI carry the JWT in `Authorization: Bearer …`, and the CLI refreshes via `/oauth/token` (`grant_type=refresh_token`) when the access token expires.

## Benefits

- **Cost attribution** — every prompt run from an engineer's Ante CLI is attributed to their user ID in the billing ledger and analytics timeline.
- **Model governance** — restrict which models local agents can use via the `models` allow-list on the user's Virtual Key, or via organization-level defaults.
- **Instant offboarding** — when an employee leaves, revoke their access in the Antix dashboard:
  - the refresh token is marked revoked, and
  - the active access-token is added to the blocklist.

  The CLI disconnects within seconds, and is guaranteed to stop authorizing within the 15-minute access-token TTL.

## Client-side details

- **Client ID** — `ante-cli` (one of only two recognized values alongside `antix-portal`).
- **Family cap** — refresh-token families are scoped per `client_id`. Signing in on the portal does not evict an active CLI session.
- **Token shape** — `{ access_token, refresh_token, expires_in: 900, token_type: "Bearer" }`.

See [Identity Provider](/antix/concepts/identity) for PKCE, JWT specs, and revocation mechanics.
