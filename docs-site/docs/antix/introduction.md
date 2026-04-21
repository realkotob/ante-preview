---
title: "Introduction"
description: "Antix is an LLM Proxy, Identity Provider (IdP), and Organization Manager built by Antigma."
sidebar_position: 1
---

# Antix

**Antix** is Antigma's LLM Proxy, Identity Provider, and Organization Manager — the collaborative backend that makes AI scalable, secure, and observable for teams.

While [Ante](/) delivers autonomous AI capabilities to your local terminal, Antix is the control plane: a unified gateway that routes models across multiple wire protocols, governs organizations, issues budget-capped keys, and tracks AI spend across your company.

### Key features

<CardGroup cols={3}>
  <Card title="Multi-protocol gateway" icon="route">
    Speaks OpenAI Chat Completions, OpenAI Responses, Anthropic Messages, and Gemini native on the same base URL. Point any existing SDK at Antix with one line of config.
  </Card>
  <Card title="Hard-budget virtual keys" icon="shield-halved">
    Issue scoped `sk-antix-…` (portal) or `sk-vk-…` (admin) keys with atomic `max_budget` caps per day, month, or lifetime. Strict enforcement blocks overruns before upstream is called.
  </Card>
  <Card title="Built-in Identity Provider" icon="id-badge">
    A full OAuth 2.0 IdP with SSO (Google, GitHub), S256 PKCE, RS256 JWTs, Refresh Token Rotation, and published JWKS / OIDC discovery.
  </Card>
  <Card title="Production observability" icon="chart-line">
    Comprehensive metrics track TTFT, tokens, and costs without impacting hot-path latency.
  </Card>
  <Card title="Ante control plane" icon="plug">
    Governance for local coding agents. `ante auth login` authenticates each developer via PKCE loopback, attributes every prompt, and revokes access within the 15-minute access-token TTL.
  </Card>
  <Card title="Bring Your Own Key (BYOK)" icon="key">
    Send your own provider credentials in `Authorization` and declare the provider with `X-Antix-Provider`. Antix routes, observes, and meters without re-billing.
  </Card>
</CardGroup>

### Why Antix?

- **Fail-closed by default.** If the billing backend is unreachable, Antix refuses to serve traffic. Override explicitly with `ANTIX_DANGER_ALLOW_UNBILLED_USAGE` only during controlled incident response.
- **High-performance hot path.** A streaming pipeline normalizes SSE across providers, and atomic budget enforcement is guaranteed under concurrent load.
- **Multi-tenant from day one.** Organizations, RBAC (`admin` / `member`), and scoped virtual keys — not bolted on.
- **Honest about retention.** Antix persists request and response bodies for cost attribution and admin analytics. Payload redaction is a deployment concern — see [Privacy & Data Retention](/antix/concepts/security).

### Next steps

<CardGroup cols={2}>
  <Card title="Quickstart" icon="rocket" href="/antix/quickstart">
    Make your first request to the Antix proxy in under 5 minutes.
  </Card>
  <Card title="Routing & BYOK" icon="route" href="/antix/concepts/routing">
    Endpoints, SDK compatibility, and provider overrides.
  </Card>
  <Card title="Virtual keys & budgets" icon="shield-halved" href="/antix/concepts/virtual-keys">
    Provision scoped keys with hard spend and rate limits.
  </Card>
  <Card title="Organizations & RBAC" icon="users" href="/antix/concepts/organizations">
    Multi-tenant boundaries, roles, and admin APIs.
  </Card>
  <Card title="Observability" icon="chart-line" href="/antix/concepts/observability">
    TTFT, error codes, and telemetry.
  </Card>
  <Card title="Identity Provider" icon="id-badge" href="/antix/concepts/identity">
    OAuth 2.0, PKCE, JWT specs, and revocation.
  </Card>
</CardGroup>
