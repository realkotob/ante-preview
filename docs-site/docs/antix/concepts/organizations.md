---
title: "Organizations & RBAC"
description: "Multi-tenant boundaries, roles, and the super-admin surface."
sidebar_position: 2
---

# Organizations & RBAC

Antix is multi-tenant by design. **Organizations** are the top-level billing and access boundary — users, virtual keys, spend, and analytics are all scoped to an organization.

## Role model

There are two organization roles:

- **Admin** — manages members, invitations, virtual keys, budgets, and organization settings.
- **Member** — consumes APIs using provided keys. Cannot manage members, view pending invites, or change organization settings.

Role enforcement is **per-handler**, not in a global middleware. The authentication middleware resolves the caller's identity and `AuthTier`; each admin-only handler then checks the caller's role in `organization_members` before mutating state.

### Super-admin (platform operator)

Separate from Org Admin, Antix has a **super-admin** tier (`AuthTier::AdminOnly`) that gates the `/admin/*` surface. Super-admin access is granted by the master key or a JWT with admin privileges and is meant for platform operators, not organization owners.

| Surface | Audience | Auth |
|---|---|---|
| `/api/portal/*` | Org Admins and Members (self-serve) | JWT access token |
| `/admin/*` | Platform super-admins | Master key or admin JWT |

## Managing members

Org Admins invite members via `POST /api/portal/organizations/{org_id}/invite` (distinct from the super-admin-only `/admin/invites`), assign a role on acceptance, and can revoke access at any time. Organization settings — default rate limits, allowed providers, invitation policy — live under `/admin/organizations/{id}/settings`.

Revocation works across two layers:

- **Access tokens** — the JWT `jti` is added to the Redis blocklist at `antix:jti:blocklist:{jti}`. Existing access tokens stop authorizing within seconds, and are guaranteed to die within the 15-minute TTL.
- **Refresh tokens** — marked revoked in Postgres, preventing any further access-token issuance for that family.
- **Virtual keys** — revoked independently via `/admin/virtual-keys/{token}/revoke`. Virtual keys are not tied to the user's JWT family, so a member's keys must be revoked explicitly when offboarding.

See [Identity Provider](/antix/concepts/identity) for JWT, RTR, and blocklist mechanics.
