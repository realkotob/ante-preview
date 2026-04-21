---
title: "Virtual Keys & Budgets"
description: "Scoped keys with atomic rate limits and hard spend caps."
sidebar_position: 3
---

# Virtual Keys, Rate Limits & Hard Budgets

Never distribute raw provider keys. Antix issues **Virtual Keys** that act as middleware interceptors, validating budgets and rate limits in Redis before routing traffic upstream.

## Creating a key

Keys can be generated directly from the Antix portal dashboard at `/portal`. 

When creating a key, you can configure:
- **Models:** Restrict which models the key can access.
- **Budget:** Hard spend cap (`max_budget`) per day, month, or lifetime.
- **Rate Limits:** Maximum requests or tokens per minute.

Keys are stored securely — plaintext is returned **exactly once** at creation.

## The BillingGuard

Antix enforces budgets through a three-stage pipeline:

1. **Pre-flight estimation** — the pricing layer estimates token cost from the request body. If the model has no pricing row, the request is rejected with `503 model_not_priced`.
2. **Atomic reservation** — atomically reserves the estimated cost against the key's current period. If it would exceed `max_budget`, the request is rejected with `402 Payment Required` before any upstream call.
3. **Async settlement** — on completion, the difference between estimated and actual cost is reconciled. If the stream is cancelled mid-flight, the unused reservation is returned to the pool.

This reserve/settle/release discipline eliminates double-spend and preserves fail-closed behavior under concurrent load.

## Cost reconciliation

Background tasks periodically reconcile fast-budgets against the durable spend ledger to prevent drift over long-running periods.
