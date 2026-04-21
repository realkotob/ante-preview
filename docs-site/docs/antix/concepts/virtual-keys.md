---
title: "Virtual Keys & Budgets"
description: "Scoped keys with atomic rate limits and hard spend caps."
sidebar_position: 3
---

# Virtual Keys, Rate Limits & Hard Budgets

Never distribute raw provider keys. Antix issues **Virtual Keys** that act as middleware interceptors, validating budgets and rate limits in Redis before routing traffic upstream.

## Two issuance paths

| Path | Endpoint | Prefix | Audience |
|---|---|---|---|
| **Portal (self-serve)** | `POST /api/portal/keys` | `sk-antix-…` | Org users, authenticated with JWT |
| **Admin (super-admin)** | `POST /admin/virtual-keys` | `sk-vk-…` | Platform operators, authenticated with master key or admin JWT |

Both prefixes are accepted on every proxy route. Keys are stored securely — plaintext is returned **exactly once** at creation. The per-user cap is configured via `users.max_virtual_keys`.

## Creating a key (admin)

`POST /admin/virtual-keys` takes a flat JSON body:

```bash
curl -X POST https://antix.antigma.ai/admin/virtual-keys \
  -H "Authorization: Bearer <super-admin-key-or-jwt>" \
  -H "Content-Type: application/json" \
  -d '{
    "key_name": "CI/CD Testing Key",
    "key_alias": "ci-cd",
    "organization_id": "<org-uuid>",
    "user_id": "<user-uuid>",
    "models": ["gpt-4o-mini", "claude-3-haiku-20240307"],
    "max_budget": 50.00,
    "period": "month",
    "rpm_limit": 60,
    "tpm_limit": 100000,
    "max_total_tokens": 5000000,
    "expires": "2026-12-31T23:59:59Z"
  }'
```

| Field | Type | Notes |
|---|---|---|
| `key_name` | string | Required. Human-readable name. |
| `key_alias` | string | Optional short alias for dashboards. |
| `organization_id` | uuid | Required scope. |
| `user_id` | uuid | Optional. Attributes usage to a specific user. |
| `models` | `string[]` | Optional allow-list. Omit for unrestricted. |
| `max_budget` | number (USD) | Hard cap per `period`. |
| `period` | `"lifetime" \| "day" \| "month"` | Budget window. |
| `rpm_limit`, `tpm_limit` | int | Requests/tokens per minute. |
| `max_total_tokens` | int | Optional absolute token ceiling. |
| `expires` | RFC 3339 | Absolute expiry timestamp. |
| `allowed_providers` | `string[]` | Denies requests whose inferred upstream provider isn't in the list. Omit for unrestricted. |

## CRUD surface

**Admin (`/admin/virtual-keys`):**

- `GET /admin/virtual-keys/{token}` — metadata.
- `PATCH /admin/virtual-keys/{token}` — update limits or models.
- `DELETE /admin/virtual-keys/{token}` — delete.
- `POST /admin/virtual-keys/{token}/revoke` — soft-revoke.
- `GET /admin/virtual-keys/{token}/usage/events`, `.../usage/summary` — usage reporting.
- `GET /admin/virtual-keys/{token}/quota` — remaining quota.

**Portal (`/api/portal/keys`):**

- `GET /api/portal/keys` — list the caller's keys.
- `POST /api/portal/keys` — create a `sk-antix-…` key.
- `DELETE /api/portal/keys/{token}` — delete.

## The BillingGuard

Antix enforces budgets through a three-stage pipeline:

1. **Pre-flight estimation** — the pricing layer estimates token cost from the request body. If the model has no pricing row, the request is rejected with `503 model_not_priced`.
2. **Atomic reservation** — atomically reserves the estimated cost against the key's current period. If it would exceed `max_budget`, the request is rejected with `402 Payment Required` before any upstream call.
3. **Async settlement** — on completion, the difference between estimated and actual cost is reconciled. If the stream is cancelled mid-flight, the unused reservation is returned to the pool.

This reserve/settle/release discipline eliminates double-spend and preserves fail-closed behavior under concurrent load.

## Cost reconciliation

Background tasks periodically reconcile fast-budgets against the durable spend ledger to prevent drift over long-running periods.
