---
title: "Observability & Errors"
description: "Standardized error codes, metrics, and ClickHouse telemetry."
sidebar_position: 4
---

# Error Handling & Observability

Because Antix sits on the critical path of your applications, understanding its error codes and metrics is essential.

## Standardized error codes {#errors}

Antix intercepts and standardizes errors across providers:

- **`400 Bad Request`** — malformed payload or requesting a model unsupported by the upstream.
- **`401 Unauthorized`** — missing or malformed `Authorization` header, unknown virtual key, revoked or deleted key, expired JWT (past the 15-minute TTL), or JWT `jti` found in the Redis blocklist.
- **`402 Payment Required`** — the Virtual Key has exceeded its `max_budget` for the current `period`.
- **`429 Too Many Requests`** — the request exceeded the `rpm_limit` or `tpm_limit` on the Virtual Key.
- **`503 Service Unavailable`** — Antix's fail-closed path. Triggered when the Redis billing backend is unreachable, or when a requested model has no pricing row (`model_not_priced`). Override with `ANTIX_DANGER_ALLOW_UNBILLED_USAGE=true` at your own risk — see [Privacy & Security](/antix/concepts/security#antix_danger_allow_unbilled_usage).

## Metrics

Antix is instrumented with OpenTelemetry end-to-end. Billing and telemetry events are offloaded via a Dead Letter Queue so your hot path stays low-latency.

### Latency histograms

- `antix_stream_ttft_seconds` — Time-to-First-Token for streaming requests.
- `antix_stream_total_duration_seconds` — end-to-end stream duration.
- `antix_upstream_request_duration_seconds` — upstream provider latency.
- `antix_redis_operation_duration_seconds` — Redis operation latency.
- `antix_http_request_duration_seconds` — HTTP request duration.

Tokens/second is not a first-class metric — derive it in Grafana from `antix_tokens_consumed_total` over `antix_stream_total_duration_seconds`.

### Request & billing counters

- `antix_ai_proxy_requests_total` — inbound proxy requests.
- `antix_tokens_consumed_total` — tokens billed.
- `antix_billing_deduction_total` — successful budget deductions.
- `antix_billing_fail_closed_total` — requests rejected because billing was unreachable.
- `antix_pre_auth_cost_rejection_total` — requests rejected at pricing before upstream.
- `antix_quota_exhausted_total` — `402` budget exhaustions.
- `antix_rate_limit_triggered_total` — `429` rate-limit hits.
- `antix_stream_cancelled_total` — client disconnects mid-stream.
- `antix_upstream_errors_total` — upstream provider errors.

### Auth & session counters

- `antix_auth_failures_total`, `antix_auth_mode_total`.
- `antix_vk_cache_hits_total`, `antix_vk_cache_misses_total`.
- `antix_oauth_login_total`, `antix_portal_requests_total`.
- `antix_portal_key_operations_total`, `antix_portal_org_operations_total`.

### Reliability gauges

- `antix_billing_dlq_depth` / `antix_billing_dlq_lost_total` — DLQ backlog and losses.
- `antix_active_sse_connections` — in-flight streams.
- `antix_db_pool_connections` — Postgres pool.
- `antix_background_task_last_run_timestamp` / `antix_background_task_errors_total`.
- `antix_dangerous_mode_enabled` — pinned to `1` when `ANTIX_DANGER_ALLOW_UNBILLED_USAGE` is set. Alert on this.
- `antix_build_info`, `antix_registered_users`, `antix_dau`, `antix_portal_dau`.
- `antix_clickhouse_writes_total`, `antix_redis_operation_errors_total`.

All series carry an `ANTIX_ENV` resource attribute for Grafana environment filtering.

## Telemetry pipeline

Billing and analytics events flow through a Redis-backed Dead Letter Queue, which prevents event loss when the primary ClickHouse / Postgres bounded channels saturate. For the background reconciliation loop that reconciles Redis fast-budgets against the Postgres spend ledger, see [Virtual Keys — Cost reconciliation](/antix/concepts/virtual-keys#cost-reconciliation).

## Environment knobs

- `ANTIX_ENV` — environment label applied to all metrics.
- `ANTIX_DANGER_ALLOW_UNBILLED_USAGE` — disables fail-closed billing. Emits an `ERROR` banner at startup.
- `CORS_ALLOWED_ORIGINS` — comma-separated list of allowed origins.
