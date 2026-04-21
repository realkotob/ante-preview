---
title: "Privacy & Data Retention"
description: "What Antix persists, what it doesn't, and the operational guards around billing."
sidebar_position: 5
---

# Privacy, Security & Data Retention

Antix is designed for **fail-closed billing** and **credential isolation**, not blanket zero-retention. Be explicit with your team about what the platform persists so compliance expectations match reality.

## What Antix persists

- **Request and response bodies** are recorded on every proxy call for cost attribution, retry-safety, and the admin analytics timeline. This is a deployment decision, not an opt-in toggle today.
- **Billing events** — token counts, model, user, organization, virtual-key identifiers, TTFT, duration — are persisted securely.
- **Identity state** — OAuth sessions, refresh-token families, and blocklist entries — is persisted for session management and revocation.

If your compliance posture requires payload redaction, treat it as a **deployment concern**: scrub at the log sink or run Antix behind a redacting gateway. Antix does not currently ship a first-class payload-scrubbing toggle.

## What Antix does not do

- **No model training.** Traffic through Antix is never used to train Antigma models. You must still verify the upstream provider's data policy for each model you route to.
- **No credential leakage to logs.** Virtual keys are stored securely; plaintext is returned exactly once at creation.
- **No silent unbilled traffic.** If the billing backend is unreachable, Antix fails closed with `503` rather than serving requests it can't meter.

## Operational guards

### Fail-closed billing

The billing pipeline reserves cost before calling upstream and settles after completion. If the billing backend is unreachable, requests are rejected with `503`.

### `ANTIX_DANGER_ALLOW_UNBILLED_USAGE`

Setting this environment variable to `true` disables the fail-closed check and allows traffic through when Redis is unreachable. This is a **dangerous mode**:

- Antix emits a loud `ERROR`-level banner at startup.
- The `antix_dangerous_mode_enabled` gauge is pinned to `1` for dashboard alerts.
- Use only for controlled incident response, never as a default.

### JTI blocklist (strict mode)

When a user logs out or is offboarded, the access token is added to the blocklist. The authentication middleware operates in strict mode — if the blocklist is unreachable during validation, the request is rejected with `503` rather than waved through.

### Token classification

Every inbound credential is classified by prefix before any routing decision:

- `sk-vk-…` — admin-minted Virtual Key.
- `sk-antix-…` — portal-minted Virtual Key.
- Master key — SHA-256 constant-time compare; grants platform-operator access.
- Any other value, on a proxy route, is treated as a BYOK provider key. Antix selects the upstream from the client-supplied `X-Antix-Provider` header if present, or infers it from the key prefix.

See [Virtual Keys](/antix/concepts/virtual-keys) for the full lifecycle.
