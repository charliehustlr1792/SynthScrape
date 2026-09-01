# SynthScrape — deep-dive prep

## 1. What this actually is

SynthScrape is a single Next.js 15 app that lets a signed-in user draw a directed graph of browser
actions on a canvas — launch browser, navigate, fill input, click, wait, dump HTML, pull text out of
HTML with a CSS selector, read/write JSON properties, POST to a webhook — and then run that graph,
either by pressing a button or on a cron schedule. Each node costs credits; credits are bought
through Stripe Checkout; every run is recorded phase-by-phase with logs you can inspect afterwards.
It is a re-implementation of the "visual scraper with a credit meter" product category, aimed at
nobody in particular — there is no tenancy, no team model, no sharing, no API for third parties, and
no user table (Clerk's `userId` is a loose string on five tables). It does **not** solve: anti-bot
evasion (`puppeteer.launch({headless:true})`, stock Chromium, no stealth plugin, no proxy —
`src/lib/workflow/executor/LaunchBrowserExecutor.ts:8`), concurrency of any kind (one execution =
one blocking loop inside a web request), durability (a crashed process loses the run permanently),
pagination/looping/branching in the workflow language (the graph is a DAG executed once, top to
bottom), or "AI" — the node labelled **Extract data with AI** returns three hardcoded strings
(`src/lib/workflow/executor/ExtractDataWithAIExecutor.ts:41-47`) and charges 4 credits to do it.

---

## 2. Architecture walkthrough

### Flow A — "user presses Execute in the editor"

1. **`src/app/workflow/_components/topbar/ExecuteButton.tsx:33`** — the click first calls
   `generate()` from `useExecutionPlan`. This is *client-side* validation only; it builds the
   execution plan in the browser, throws away the result, and uses it purely as a gate.
2. **`src/components/hooks/useExecutionPlan.tsx:26`** — `toObject()` from React Flow gives
   `{nodes, edges, viewport}`; that goes into `FlowToExecutionPlan`.
3. **`src/lib/workflow/executionPlan.ts:18`** — the actual planner. Finds the node whose registry
   entry has `isEntryPoint` (only `LAUNCH_BROWSER`, `src/lib/workflow/task/LaunchBrowser.tsx:11`),
   seeds it as phase 1, then loops `phase = 2..nodes.length`, each iteration sweeping all unplanned
   nodes and admitting any whose inputs are either literal values or wired to an already-planned
   node (`getInvalidInputs`, line 89). It's a Kahn-style topological layering done in O(V²·E) with
   `Array.filter` inside the inner loop. Output is `[{phase: 1, nodes: [...]}, ...]`.
4. **`src/app/workflow/_components/topbar/ExecuteButton.tsx:39`** — mutate with the *client's*
   serialized flow (`JSON.stringify(toObject())`).
5. **`actions/workflows/runWorkflow.ts:11`** — server action. `auth()` → `userId`. Loads the
   workflow scoped by `{userId, id}` (line 21), so cross-tenant access is blocked here.
   - If `status === PUBLISHED`: uses the stored `executionPlan` and stored `definition`, ignoring
     what the client sent (line 37-44). Correct.
   - If `DRAFT`: **trusts the client-supplied `flowDefinition` verbatim** (line 45-57), re-planning
     it server-side. It re-validates structure but never re-validates that the definition belongs to
     this workflow or that inputs are sane.
6. **`actions/workflows/runWorkflow.ts:62`** — one `prisma.workflowExecution.create` with a nested
   `phases.create` array. Node payloads are `JSON.stringify(node)` into a TEXT column.
7. **`actions/workflows/runWorkflow.ts:98`** — `after(() => ExecuteWorkflow(execution.id))`, then
   `redirect(...)`. This *was* a bare unawaited call, which worked locally and silently abandoned
   every run on Vercel, since the instance is frozen once the response is sent. `after()` defers the
   engine until after the response and keeps the instance alive for it. Still bounded by the function
   timeout (`maxDuration = 60` is now set on the two invoking route segments), and still no reaper.
8. **`src/lib/workflow/executeWorkflow.ts:17`** — re-reads the execution with
   `include:{workflow:true, phases:true}` and **no `orderBy`** (line 20). Parses `definition` to get
   `edges` (line 27). Sets `nextRunAt` and `status=RUNNING` (`initializeWorkflowExecution`, line 55),
   flips every phase to `PENDING` in one `updateMany` (`initializePhaseStatuses`, line 78).
9. **`src/lib/workflow/executeWorkflow.ts:38`** — `for (const phase of execution.phases)`. Strictly
   sequential, in whatever order the driver handed back. `phase.number` — the entire point of the
   planner — is never read here.
10. **`executeWorkflowPhase` (line 120)** — parses `phase.node`, calls `setupEnvironmentForPhase`
    (line 197) which resolves each input either from the node's literal `inputs` map or by walking
    `edges` to find `edge.target === node.id && edge.targetHandle === input.name` and reading
    `environment.phases[source].outputs[sourceHandle]`. The whole intermediate state is a plain
    in-memory object (`types/executor.ts:4`) — one `Browser`, one `Page`, one bag of phase
    inputs/outputs. Nothing is persisted between phases except for logging.
11. **`decrementCredits` (line 248, conditional UPDATE at line 250)** — `prisma.userBalance.update({where:{userId, credits:{gte:amount}}})`.
    This *is* atomic (single conditional UPDATE), and a failure is caught and converted to "Insufficient
    balance". Credits are taken **before** the phase runs and `creditsConsumed` is fixed at that
    moment (line 140) — a phase that then fails still bills.
12. **`executePhase` (line 176)** → `ExecutorRegistry[node.data.type]` → e.g.
    `LaunchBrowserExecutor` calls `puppeteer.launch()` inside this same Node process, `page.goto(url)`
    with no timeout and no URL validation.
13. **`finalizePhase` (line 150)** — one update writing status, `outputs` as JSON, credits, and a
    nested `logs.createMany`. For a `PAGE_TO_HTML` phase, `outputs` is the entire page source.
14. **`finalizeWorkflowExecution` (line 91)** — writes final status, then updates the workflow's
    `lastRunStatus` guarded by `where:{id, lastRunId:executionId}` and swallows the failure with a
    bare `.catch(()=>{})` (line 113). The comment says this is intentional (concurrent runs), which
    is the one place in the codebase where a race is acknowledged.
15. **`cleanupEnvironment` (line 240)** — closes the browser, error swallowed.
16. **line 52** — `revalidatePath('/workflows/runs')`. That route does not exist. Real routes are
    `/dashboard/workflows` and `/workflow/runs/[workflowId]`. This cache invalidation is a no-op, as
    are `revalidatePath("/workflows")` in `deleteWorkflow.ts:19`, `updateWorkflow.ts:42`,
    `duplicateWorkflow.ts:42`, `removeWorkflowSchedule.ts:20`, `updateWorkflowCron.ts:34`, and
    `revalidatePath("/credentials")` in `createCredential.ts:33` and `deleteCredential.ts:22`. The UI
    only looks live because `ExecutionsTable.tsx:22` polls every 5s and
    `ExecutionViewer.tsx:36` polls every 1s.

### Flow B — "cron fires"

1. **`src/app/api/workflows/cron/route.ts:5`** — `GET`, **zero authentication**. `src/middleware.ts:3`
   lists `'/api/workflows/(.*)*'` as a public route, so Clerk never sees it either.
2. Line 7-14: `findMany` for `status=PUBLISHED AND cron IS NOT NULL AND nextRunAt <= now`, selecting
   only `id`.
3. Line 16-18: for each, calls `triggerWorkflow(id)` — which at line 25 issues a `fetch` that is
   **never awaited** and whose only handling is `.catch(console.error)`. The route returns
   `{workflowsToRun: n}` and the serverless invocation is free to be frozen mid-flight.
4. **`src/app/api/workflows/execute/route.ts:17`** — this one *is* protected, by a Bearer token
   compared with `timingSafeEqual` (line 12, wrapped in try/catch because it throws on length
   mismatch). Then:
   - Line 41: `findUnique({where:{id: workflowId}})` — **no `userId` scoping**. Whoever holds
     `API_SECRET` can run anyone's workflow.
   - Line 49: `JSON.parse(workflow.executionPlan!)` sits **outside** the try/catch. A published-then-
     unpublished workflow has `executionPlan = null` (`unpublishWorkflow.ts:36`) → `JSON.parse(null)`
     returns `null`, so it degrades to a 400 rather than throwing. A *draft* workflow with a cron set
     hits the same path.
   - Line 58: `CronExpressionParser.parse(workflow.cron!)` — a null cron throws into the generic
     `catch` and returns an opaque 500.
   - Line 83: `await ExecuteWorkflow(execution.id, nextRun)` — awaited here, unlike the manual path.
     So a cron run holds an HTTP connection open for the full duration of a headless browser session.

### Flow C — "user buys credits"

`actions/billing/purchaseCredits.ts:23` creates a Stripe Checkout session with
`metadata:{userId, packId}` and redirects. Stripe posts to
`src/app/api/webhooks/stripe/route.ts:6`, which reads the raw body, verifies the signature with
`constructEvent` (line 11 — this part is correct), and then at **line 19 calls
`HandleCheckoutSessionCompleted(...)` without `await`**, returning 200 at line 25 regardless.
`src/lib/stripe/handleCheckoutSessionCompleted.ts:29` increments `UserBalance` and creates a
`UserPurchase` — with no idempotency key, no dedupe on `stripeId`, and no transaction wrapping the
two writes.

---

## 3. Decisions & alternatives

**Next.js App Router as the entire backend (no separate service).**
Chosen: server actions in `actions/**` for all mutations, three API routes only where an external
caller demands HTTP (Stripe, cron, secret-authed executor). Alternatives: Express/Fastify worker
service, or tRPC. The real trade-off *here*: this codebase runs Puppeteer — a 300MB+ process that
lives for the length of a scrape — inside the same runtime that serves React. On Vercel that is a
hard incompatibility (no bundled Chromium, 250MB unzipped function limit, execution time caps); on a
long-lived Node host it works but couples page-render latency to browser memory pressure. There is no
`vercel.json` and no Dockerfile in the repo, so the deploy target is undeclared.
> *"You call `puppeteer.launch()` from inside a request handler. Where is this deployed, and what
> happens to an in-flight scrape when the platform recycles that instance?"*

**No queue at all.**
Chosen: direct in-process `await`. Alternatives that were clearly available given the stack: BullMQ +
Redis, or Postgres-as-queue (`SELECT ... FOR UPDATE SKIP LOCKED`) since Postgres is already there.
The specific cost in this codebase: `runWorkflow.ts:98` now uses `after()`, which keeps the run
alive past the response on serverless — but it is still bounded by the function timeout, and if the
instance dies mid-run the row sits at `RUNNING` forever with nothing to notice. There is no retry,
no dead-letter, no backoff, no concurrency cap. `after()` bought correctness for short runs; it is
not a queue.
> *"You built an execution-plan data structure with numbered phases and then executed it with a flat
> `for` loop that ignores the numbers (`executeWorkflow.ts:38`). Why build the phases at all?"*

**Prisma 7 with the `pg` driver adapter and a manual `Pool`.**
`src/lib/prisma.ts` constructs its own `Pool` with default settings (max 10) and a global singleton
guarded only in non-production. Alternative: Prisma's built-in connection handling, or Accelerate/
PgBouncer for serverless. Trade-off here: every workflow execution holds connections for minutes
while a browser scrapes; ten concurrent runs exhaust the pool and block the UI's own queries.
> *"Your pool default is 10 connections and a single execution can hold one for two minutes. What is
> the maximum number of concurrent workflow runs this app supports before the dashboard stops
> loading?"*

**Clerk for auth, with no `User` table.**
Alternatives: NextAuth/Auth.js with a local user table, or Clerk *plus* a mirrored local `User` row
via webhook. The cost here is visible in `scripts/assign-credits.js:16` — because there is no local
user record, granting credits required a script that pages the Clerk Admin API to enumerate user IDs.
It also means no FK integrity: deleting a Clerk user orphans their `Workflow`, `UserBalance`,
`Credential` and `UserPurchase` rows forever.
> *"There's a script in `scripts/` that hits the Clerk Admin API to list every user and `updateMany`
> their balances. What broke that made you write that?"* **[INFERRED — verify with candidate]**

**Two parallel registries keyed by the same enum.**
`src/lib/workflow/task/registry.tsx` (label, icon, credits, input/output schema) and
`src/lib/workflow/executor/registry.ts` (the function). Both are typed as mapped types over
`TaskType`, so a missing entry is a compile error — this is the strongest piece of design in the
repo. Alternative: one registry object holding both, which would have avoided the `.tsx`/`.ts` split
caused by JSX icons. Trade-off: the split keeps React out of the server bundle, at the cost of
editing two files per new task.
> *"Adding a task means touching four files. Walk me through what stops someone from shipping a task
> that's in the UI registry but missing from the executor registry."*

**Graph stored as an opaque JSON string in a TEXT column.**
`Workflow.definition`, `Workflow.executionPlan`, `ExecutionPhase.node/inputs/outputs` are all
`String`. Alternatives: Postgres `Json`/`Jsonb` (Prisma supports it natively), or normalized
node/edge tables. Trade-off specific here: you can never query "which workflows scrape example.com",
you get zero schema validation on a value that is `JSON.parse`d and then executed, and
`ExecutionPhase.outputs` stores entire HTML documents — this table is the one that will blow up the
database first.
> *"Why `String` and not `Json`? And what's the largest single row this schema can produce?"*

**Credits decremented per-phase, before execution.**
`executeWorkflow.ts:139-143`. Alternative: reserve the whole workflow's `creditsCost` up front (which
is already computed and stored, `helpers.ts:4`) and settle at the end, or bill only on success. The
trade-off chosen bills for failed phases and cannot refund. It does at least stop mid-run when the
balance hits zero, which the whole-workflow reservation wouldn't need to.
> *"A workflow fails on phase 3 of 8. The user is charged for phases 1, 2 and 3 including the one
> that failed. Defend that, and tell me how a user would dispute it."*

**AES-256-CBC for credential storage.**
`src/lib/encryption.ts:4`, with a comment pointing at `openssl rand -hex 32`. Alternatives:
AES-256-GCM (authenticated), or a KMS/Vault. The cost here: CBC is unauthenticated and malleable, and
there is no key version prefix, so rotating `ENCRYPTION_KEY` permanently bricks every stored
credential.
> *"Why CBC and not GCM? What's your key rotation story?"*

**Client-side validation reused as the only pre-flight check.**
`useExecutionPlan` runs the planner in the browser; `PublishWorkflow` (`publishWorkflows.ts:34`) and
`RunWorkflow` re-run it server-side. That's the right call — worth having the candidate say it out
loud, because `handleError` in `useExecutionPlan.tsx:12` lists `setInvalidInputs` as a dependency but
never calls it, so the red-highlight-the-broken-node UX the `FlowValidationContext` exists for is
dead code.

---

## 4. Data & schema interrogation

`prisma/schema.prisma`, 13 migrations, all from a single week in August/September 2025.

**Normalization.** `userId` is duplicated onto `Workflow`, `WorkflowExecution`, `ExecutionPhase`,
`UserBalance`, `Credential`, `UserPurchase` with no parent row and no FK. That's deliberate
denormalization for query convenience, but it produces two sources of truth that the code actually
disagrees on: `getWorkflowPhaseDetails.ts:12` authorizes via the relation (`execution:{userId}`)
while `getCreditsUsageInPeriod.ts:26` trusts the denormalized `ExecutionPhase.userId`. If those ever
diverge, one of the two is wrong and nothing detects it.

**Enums.** There are none. `Workflow.status`, `WorkflowExecution.status`, `WorkflowExecution.trigger`,
`ExecutionPhase.status`, `ExecutionLog.logLevel` are all `String`, mirrored by TypeScript enums in
`types/workflow.ts` and `types/log.ts` that the database has never heard of. A bad migration or a
direct `psql` write can put `"RUNNIG"` in that column and every consumer will silently treat it as
not-running.

**Indexes.** Zero `@@index` in the entire schema. Present unique constraints:
`Workflow @@unique([name, userId])` and `Credential @@unique([userId, name])`. Everything else is a
sequential scan:
- `GetWorkflowsForUser` → `WHERE userId = ?`
- `GetWorkflowExecutions` → `WHERE workflowId = ? AND userId = ?` + `ORDER BY createdAt DESC`, polled
  every 5 seconds per open tab (`ExecutionsTable.tsx:22`)
- `getCreditsUsageInPeriod.ts:24` → `ExecutionPhase WHERE userId AND startedAt BETWEEN AND status IN`
  — full scan of the largest table in the schema
- `cron/route.ts:7` → `WHERE status AND cron IS NOT NULL AND nextRunAt <= now` — full scan of
  `Workflow` on every poll
The obvious missing set: `@@index([userId])` on `Workflow`, `@@index([workflowId, createdAt])` on
`WorkflowExecution`, `@@index([userId, startedAt])` on `ExecutionPhase`,
`@@index([status, nextRunAt])` on `Workflow`, and a `@@unique([stripeId])` on `UserPurchase`.

**Migrations.** Linear, `prisma migrate` generated, and honest about the history — one is literally
named `fix_change_node_from_int_to_string`. No data backfills, no down migrations, no seed file. The
credit-granting "migration" was done by an ad-hoc Node script instead
(`scripts/assign-credits.js:110` — `updateMany` with **no `where` clause**, i.e. set every user in the
system to 1000 credits; running it without `--from-clerk` is a one-keystroke way to hand out free
money or wipe balances).

**Concurrent writes.**
- `UserBalance` is safe: `credits:{decrement}` guarded by `credits:{gte}` is a single conditional
  UPDATE (`executeWorkflow.ts:250`). This is the one correct concurrency primitive in the codebase.
- `Workflow.nextRunAt` is **not** safe — see §5.
- `SetupUser` (`actions/billing/setupUser.ts:14`) is check-then-act, saved only by `userId` being the
  primary key; two concurrent calls produce one success and one unhandled unique-violation 500.
- The webhook's two writes (`handleCheckoutSessionCompleted.ts:29` and `:43`) are not in a
  transaction. A crash between them credits the user with no purchase record — meaning no invoice,
  and no way to reconcile.

**What a bad actor does to this schema.** `Workflow.definition` is a user-controlled string that is
`JSON.parse`d and then structurally interpreted (`executeWorkflow.ts:27`, `:123`). Nothing bounds its
size — `createWorkflowSchema` (`schema/workflow.ts:2`) validates only `name` and `description`, and
`UpdateWorkflow` (`actions/workflows/updateWorkflow.ts:9`) accepts `definition: string` with **no
Zod schema at all**. A single POST with a 50MB definition string is stored as-is, then copied into
every `WorkflowExecution.definition` and re-parsed on every run. Separately, `ExecutionPhase.outputs`
holds full page HTML with no truncation, so a workflow pointed at a large page and scheduled
`* * * * *` writes megabytes per minute forever — there is no retention policy or cleanup job
anywhere in the repo.

---

## 5. Scalability & failure modes

**1. The cron poller has no claim step — duplicate concurrent runs.**
`cron/route.ts:7` selects workflows due now; `nextRunAt` is only advanced later, inside
`initializeWorkflowExecution` (`executeWorkflow.ts:69`), after the executor route has created rows
and started a browser. The window between select and update is the length of a Chromium launch. Any
second poll in that window re-selects the same workflow. And since the route is unauthenticated
(§6), an attacker doesn't need to wait for a poll — they can `curl` it in a loop and multiply every
due workflow arbitrarily, draining credits and forking a browser per hit.
*Falls over at:* two overlapping polls, or one malicious client.
*Fix:* claim-then-run — `UPDATE Workflow SET nextRunAt = <next> WHERE id = ? AND nextRunAt <= now()
RETURNING id`, and only dispatch rows the UPDATE actually claimed. *Cost:* one extra write per
workflow per tick, and you must decide whether a crashed run re-fires (it won't, with this fix — you
need a lease/heartbeat column to get that back).

**2. Phase order is not guaranteed.**
`executeWorkflow.ts:18-21` loads phases with `include:{phases:true}` and **no `orderBy`**, then
executes them in array order at line 38. Postgres makes no ordering promise without `ORDER BY`, and
`initializePhaseStatuses` (line 78) issues an `updateMany` across every phase immediately before the
loop — in Postgres an UPDATE writes a new heap tuple, so physical order after that statement is
explicitly not insertion order. Today it usually works. Under a different plan, after a VACUUM, or on
a larger table, `NAVIGATE_URL` can run before `LAUNCH_BROWSER` and the run fails with
`Cannot read properties of undefined (reading 'goto')`. Compare `getWorkflowExecutionWithPhases.ts:20`,
which *does* specify `orderBy:{number:"asc"}` for display — so the UI is ordered and the executor
isn't.
*Fix:* `orderBy:[{number:"asc"}, {id:"asc"}]` in the engine query. Cost: nothing. This is a one-line
fix and should be done before any interview.

**3. Everything is sequential that doesn't have to be.**
The planner groups nodes into phases precisely because nodes in the same phase have no dependency on
each other, and then `executeWorkflow.ts:38` runs them one at a time anyway. A 12-node workflow that
could be 4 rounds deep runs as 12 serial browser operations.
*Falls over at:* wide workflows — latency is O(nodes), not O(depth).
*Fix:* group by `phase.number`, `Promise.all` within a group. *Cost:* the shared single-`Page`
environment (`types/executor.ts:5`) makes this unsafe today — two parallel nodes would fight over the
same tab. Real parallelism requires a page-per-branch model first.

**4. No pagination, anywhere, on polled endpoints.**
`GetWorkflowExecutions` (`getWorkflowExecutions.ts:12`) returns every execution ever, unbounded, and
`ExecutionsTable.tsx:22` refetches it every 5 seconds. A workflow on `*/5 * * * *` produces ~105k
executions a year; that's the payload on every poll. Same pattern:
`GetWorkflowsForUser`, `GetUserPurchaseHistory`, and `GetCredentialsForUser` — the last polled every
10s from *every credential dropdown on the canvas* (`CredentialsParam.tsx:15`), so a workflow with
five AI nodes issues five identical queries every ten seconds.
*Fix:* cursor pagination + `staleTime`/shared query keys. *Cost:* the "auto-refresh" UX becomes
explicit, and you need a total count for the table.

**5. In-memory aggregation of unbounded row sets.**
`getStatsCardsValues.ts:17` pulls every execution for the month *with all its phases* into Node and
reduces in JavaScript. `getCreditsUsageInPeriod.ts:24` pulls every phase for the month.
`getWorkflowExecutionStats.ts:22` pulls every execution for the month. Three dashboard cards, three
full-table reads, no index, no `groupBy`.
*Falls over at:* a user with a few thousand runs/month — the dashboard becomes multi-second and it's
all N rows over the wire.
*Fix:* `prisma.executionPhase.groupBy({by:['status'], _sum:{creditsConsumed}})` or raw SQL with
`date_trunc`. *Cost:* you lose the day-bucket zero-filling that `eachDayOfInterval` currently gives
you for free; you'd fill gaps in SQL or in JS over a tiny result set.

**6. Non-idempotent Stripe webhook, acknowledged before the work is done.**
`stripe/route.ts:19` — `HandleCheckoutSessionCompleted(event.data.object)` with no `await`, then a
hard 200 at line 25. Two independent failures:
- *Money lost:* if the DB write throws (or the process is recycled first), Stripe already has its
  200, will never retry, and the user paid for nothing. The rejection is unhandled.
- *Money duplicated:* Stripe delivers at-least-once. A retried or replayed
  `checkout.session.completed` runs the `increment` again — there is no dedupe on `event.id`, no
  unique constraint on `UserPurchase.stripeId`, and the two writes aren't transactional.
Also, `catch` at line 26 logs a bare string and returns **nothing** — a route handler that returns
`undefined`, which in Next 15 is an error, so a signature failure produces a 500 rather than the 400
Stripe expects.
*Fix:* `await` the handler, wrap both writes in `prisma.$transaction`, add
`@@unique` on `UserPurchase.stripeId` and treat a unique-violation as success, return 400 on
signature failure and 500 on handler failure so Stripe retries. *Cost:* webhook latency now includes
two DB writes; if you exceed Stripe's timeout you get retries you must be idempotent against — which
you now are.

**7. Deferred execution with no reaper.** *(partially fixed)*
`runWorkflow.ts:98` used to start the engine and redirect immediately, which abandoned every run on
serverless. `after()` fixed that. What remains: the run is still capped by the function timeout, and
if the instance dies mid-run the `WorkflowExecution` row is stuck at `RUNNING` forever,
`ExecutionViewer.tsx:36` polls it at 1Hz indefinitely, and the credits already deducted are never
reconciled.
*Fix:* a queue with visibility timeouts, or at minimum a `startedAt < now() - interval` sweeper that
marks stale runs `FAILED`. *Cost:* you need a heartbeat to distinguish "slow" from "dead".

**8. No timeouts on any browser operation.**
`LaunchBrowserExecutor.ts:20` — `page.goto(websiteUrl)` with default options.
`WaitForElementExecutor.ts:17` — `waitForSelector` with no `timeout`. Puppeteer's 30s default applies
to those two, but there is no overall execution budget: a 20-node workflow can legitimately run for
ten minutes holding a DB connection and a Chromium process. Nothing caps concurrent browsers either —
N concurrent runs = N Chromium instances on one box.
*Fix:* per-phase timeout + a global execution deadline + a semaphore on browser count.

**9. Webhook delivery is not a delivery mechanism.**
`DeliverViaWebhookExecutor.ts:16` POSTs once, requires `status === 200` exactly (a 201/202/204 is
treated as failure, line 28), then calls `response.json()` (line 30) which throws on an empty body —
so a receiver that correctly returns `200` with no content fails the phase *after* the POST already
landed. No retry, no backoff, no signature on the outbound request. It also double-encodes: `body` is
already a JSON string coming out of the environment (all outputs are `string`), and line 26 wraps it
in `JSON.stringify` again, so receivers get `"{\"a\":1}"` — a JSON string, not a JSON object.

---

## 6. Security review

**`GET /api/workflows/cron` is completely unauthenticated.** `src/middleware.ts:3` puts
`'/api/workflows/(.*)*'` in `createRouteMatcher` for public routes, and `cron/route.ts:5` performs no
check of its own — unlike its sibling `execute/route.ts`, which does. Anyone on the internet can
`GET /api/workflows/cron` in a loop. Each call fans out one unbounded `fetch` per due workflow, using
the server's own `API_SECRET`. This is simultaneously an unauthenticated DoS, an unauthenticated
credit-drain against other users, and an unauthenticated way to launch arbitrary numbers of Chromium
processes on the host. **Fix this before showing anyone the repo.**

**`GET /api/workflows/execute` is not tenant-scoped.** Line 41 loads the workflow by `id` alone. The
Bearer check is correct in isolation (`timingSafeEqual`, length-mismatch handled), but the endpoint
will happily execute *any* user's workflow against *that user's* credit balance, given only the
single global secret.

**IDOR on credential decryption.** `ExtractDataWithAIExecutor.ts:26` does
`prisma.credential.findUnique({where:{id: credentials}})` — **no `userId` filter**. The credential id
comes straight from the user-controlled node definition. A user can paste another tenant's credential
ID into their own workflow and the server will fetch and `symmetricDecrypt` it (line 35). Today the
plaintext isn't returned (the executor discards it and emits mock data), so it's a decrypt-oracle
rather than a direct exfil — but the moment the AI node is implemented for real, that plaintext goes
into a prompt and comes back out in `ExecutionPhase.outputs`. Contrast every server action in
`actions/**`, which correctly scopes by `userId`; the executor path is the one place the pattern was
dropped.

**SSRF, unauthenticated by way of the cron route.** `LaunchBrowserExecutor.ts:20` and
`NavigatUrlExecutor.ts:9` call `page.goto()` on an arbitrary user string with no scheme allowlist, no
DNS resolution check, no private-range block. `PageToHtmlExecutor.ts:7` then returns the full response
body to the user. That is a complete read-SSRF: `http://169.254.169.254/latest/meta-data/iam/...`,
`http://localhost:5432`, internal admin panels, `file:///etc/passwd`. `DeliverViaWebhookExecutor.ts:16`
gives the same primitive for POST. There is no egress restriction anywhere in the repo.

**Secrets committed to git.** `LaunchBrowserExecutor.ts:16-19` contains a commented-out
`page.authenticate({username:"brd-customer-hl_...-zone-synth_scrape", password:"..."})` — a live-
looking BrightData proxy credential, plus the proxy host at line 10. Commenting it out does not remove
it from history. Rotate that credential and treat it as compromised. Everything else is correctly
env-based, `.env` is covered by `.env*` in `.gitignore`, and there is no `.env.example` for anyone to
reproduce the setup from.

**Encryption is unauthenticated.** `src/lib/encryption.ts:4` — AES-256-CBC, random IV, `iv:ciphertext`
hex. No MAC, so ciphertext is malleable and there is no integrity check on decrypt. No key ID prefix,
so `ENCRYPTION_KEY` can never be rotated without a full re-encrypt migration that doesn't exist. Use
`aes-256-gcm` and store `v1:iv:tag:ct`.

**Input validation is decorative.** `schema/workflow.ts:2` — `z.string().max(50)` with no `.min(1)`,
so empty names pass; `schema/credential.ts:3` — same, no `.min`. `UpdateWorkflow`
(`updateWorkflow.ts:9`) and `PublishWorkflow` (`publishWorkflows.ts:10`) accept the entire flow
definition as a raw `string` with **no schema validation at all** before it's stored and later parsed
and executed. `FlowToExecutionPlan` validates structure, not content — a `Website Url` of
`file:///etc/passwd` is a perfectly valid plan.

**Injection surfaces.** No raw SQL anywhere, so SQL injection is not a concern. The real injection
surface is `ScrollToElementExecutor.ts:12` — `page.evaluate((selector)=>{ document.querySelector(selector) })`
passes a user string into the page context. Puppeteer serializes arguments rather than interpolating
them, so this is not arbitrary JS execution, but a thrown `element not found` inside `evaluate`
propagates as a generic failure. The broader issue: every selector-based executor takes an arbitrary
string with no validation and reports failures identically.

**No rate limiting of any kind.** No middleware limits, no Upstash, nothing on the cron route, the
webhook, the server actions, or `PurchaseCredits`.

**Error handling leaks nothing but tells you nothing.** `execute/route.ts:86` returns a bare
`Internal server error` for every failure. Good for disclosure, bad for operability — there is no
structured logging, no Sentry, no request ID anywhere in the codebase.

**What's actually right:** Stripe signature verification is present and correct
(`stripe/route.ts:11`, raw body via `request.text()`, not a parsed body). `timingSafeEqual` for the
API secret. Every server action independently re-checks `auth()` rather than trusting the middleware.
Credentials are encrypted at rest and never returned to the client — `GetCredentialsForUser` returns
the row including `value`, but the UI only renders `name`, so the ciphertext (not plaintext) reaches
the browser. Say that last part precisely if asked; don't claim it's filtered server-side, because it
isn't.

---

## 7. Testing & code quality critique

**Tests: zero.** No test runner in `package.json`, no `__tests__`, no `.spec`/`.test` files, no CI
workflow, no Dockerfile. `npm run lint` invokes `next lint`, which is deprecated in Next 15.4 and will
warn or fail. `eslint.config.mjs:29` has an empty `rules` block containing only commented-out
suggestions. Nothing in this repo has ever been checked by a machine other than `tsc`.

The things that most obviously needed a test and don't have one: `FlowToExecutionPlan` (pure,
deterministic, complex, ~140 lines of graph logic — this is a five-test file that would have caught
real bugs), `symmetricEncrypt`/`symmetricDecrypt` round-tripping, `decrementCredits` under
concurrency, and the Stripe webhook handler with a duplicate event.

**Live bug — the success series on both dashboard charts is permanently zero.**
`getWorkflowExecutionStats.ts:39` initialises each day as `{success: 0, failed: 0}`, but line 55
increments `stats[date].sucess` (missing an `s`). `undefined + 1` is `NaN`, written to a key nothing
reads; `success` stays `0` forever. `ExecutionStatusChart.tsx:53` charts `dataKey="success"`.
Identical bug in `getCreditsUsageInPeriod.ts:44` vs `:60`, charted by `CreditsUsageChart.tsx:52`. The
`Stats` type at line 10 of both files declares `sucess`, and the `reduce` is cast `{} as any`
(line 43/48) — the cast is exactly what let this through the type checker. Two files, one typo,
propagated by copy-paste. The `chartConfig` objects (`ExecutionStatusChart.tsx:12`) also key on
`sucess`, so the `--color-success` CSS variable those charts reference is never defined either.

**Dead and mock code shipped as a feature.** `ExtractDataWithAIExecutor.ts:41-47` returns three
hardcoded selector strings and calls it "Extracted data". It charges 4 credits
(`ExtractDataWithAI.tsx:12`), requires a credential, decrypts it, and then throws it away. The landing
page and `layout.tsx:18` (`"AI-powered visual web scraper"`) both market this.

**Inconsistent error handling across executors — clear copy-paste.** `ExtractTextFromElementExecutor.ts:9`
logs *and* `return false` on a missing input. `ClickElementExecutor.ts:9`, `FillInputExecutor.ts:9`,
`NavigatUrlExecutor.ts:9`, `WaitForElementExecutor.ts:8`, `AddPropertyToJsonExecutor.ts:9`,
`ScrollToElementExecutor.ts:9` and `DeliverViaWebhookExecutor.ts:8` log the same message and then
**continue anyway**, passing `undefined` to Puppeteer. Same shape, different behaviour, no reason.

**Copy-paste residue in imports.** `ScrollToElementExecutor.ts:2-3` imports `ClickElementTask` and
`FillInputTask` and uses neither. `ExtractDataWithAIExecutor.ts:3,5` — same. `ClickElementExecutor.ts:3`
imports `FillInputTask`, unused. `handleCheckoutSessionCompleted.ts:1` imports `writeFile` from `fs`
and line 6 imports `eventNames` from `process` — neither is used, in a payments file.
`createWorkflow.ts:11` imports `init` from `next/dist/compiled/webpack/webpack` — an IDE auto-import
from Next's internal bundle, in a server action. `types/appNode.ts:3` imports `StringifyOptions` from
`querystring`.

**Unreachable checks.** `ExtractTextFromElementExecutor.ts:19` — `if(!element)` after
`$(selector)`; Cheerio always returns a truthy object for an empty match, so "Element not found" can
never fire and an empty selection falls through to `$.text(element)`.
`getInvalidInputs` (`executionPlan.ts:94`) does `inputValue?.length > 0` — comparing `undefined > 0`,
which is `false` by coercion; it works, but it's a `strict: true` codebase with `noImplicitAny` on and
this only compiles because the value is typed `string`.

**Crash-on-empty in the run viewer.** `ExecutionViewer.tsx:53-58` — `phases.toSorted(...)[0]` then
`.id` with no guard. An execution with zero phases (possible: a workflow with no valid plan, or a
partially-created row) throws `Cannot read properties of undefined`. Also `toSorted` is ES2023 while
`tsconfig.json` targets ES2017 — it compiles only because `lib` includes `esnext`, and will throw at
runtime on any Node below 20.

**`hasCycle` has no terminal return.** `FlowEditor.tsx:103-111` falls off the end returning
`undefined`; line 114 does `!detectedCycle`, so it coerces correctly, but the function's declared
return type is `boolean | undefined`.

**Import paths.** `actions/` and `types/` live outside `src/`, and `tsconfig.json:24` only aliases
`@/*` → `./src/*`. The result is `ExecutionViewer.tsx:4` importing
`'../../../../../../../actions/workflows/getWorkflowExecutionWithPhases'` — seven levels. Worse,
`types/workflow.ts:1` and `getWorkflowExecutionWithPhases.ts:3` import from
`'./../src/generated/prisma/index.d'` — importing a declaration file by path, from a git-ignored
generated directory.

**Typos in user-facing strings and identifiers**, unreviewed: `exectutions` (schema.prisma, the
relation name), `worklowExecutions` (`getStatsCardsValues.ts:42`, rendered on the dashboard),
`"No runs ahve been triggered yes"` (`runs/[workflowId]/page.tsx:120`), `"emsuring you data remains
minimum safe"` (credentials page), `"suffiecient"`, `"triggerign"`, `"fould"`, `"WOrkflow not
published"`, `flex-xol`, `contianer`, `aniamte-spin`, `text0muted-foreground`, `font-bol`,
`bordere-destructive`, `p-` — the last several are broken Tailwind classes that silently do nothing.

**Swallowed exceptions.** `FlowEditor.tsx:37` — empty `catch` around definition parsing.
`executeWorkflow.ts:113` — `.catch(()=>{})` (this one is commented and justified).
`executeWorkflow.ts:241` — browser close failure logged only. `SchedulerDialog.tsx:217` — `catch` sets
`validCron=false` and drops the error. `stripe/route.ts:27` — logs a constant string, not the error.

---

## 8. "Why did you..." rapid fire

1. Why does `FlowToExecutionPlan` produce numbered phases when `executeWorkflow.ts:38` iterates a flat
   array and never reads `phase.number`?
2. Why does `getWorkflowExecutionWithPhases.ts:20` specify `orderBy:{number:"asc"}` but the executor's
   own query at `executeWorkflow.ts:20` doesn't?
3. `runWorkflow.ts:98` wraps `ExecuteWorkflow` in `after()`; `execute/route.ts:83` plainly
   awaits it. Why the difference, and what did the original bare call do on a serverless host?
4. Why is `/api/workflows/cron` in the public route matcher in `middleware.ts:3` when
   `/api/workflows/execute` right next to it does its own Bearer check?
5. `execute/route.ts:41` looks up the workflow by `id` with no `userId`. Every server action in
   `actions/` scopes by `userId`. Why the difference?
6. `ExtractDataWithAIExecutor.ts:26` fetches a `Credential` by id with no `userId` filter. Walk me
   through what I can read with that.
7. Why does `ExtractDataWithAITask` charge 4 credits
   (`ExtractDataWithAI.tsx:12`) when the executor returns three hardcoded strings?
8. Why decrypt the credential at `ExtractDataWithAIExecutor.ts:35` and then never use
   `plainCredentialValue`?
9. Why AES-256-CBC in `encryption.ts:4` instead of GCM, and how do you rotate `ENCRYPTION_KEY`?
10. `Workflow.definition` and `ExecutionPhase.outputs` are `String`, not `Json`. Why? What's the
    biggest row a `PAGE_TO_HTML` phase can write?
11. There are no `@@index` declarations in `prisma/schema.prisma`. Which query hurts first at 100k
    executions?
12. `revalidatePath('/workflows/runs')` at `executeWorkflow.ts:52` — what route is that? Show me it in
    the app directory.
13. `getWorkflowExecutionStats.ts:39` writes `success` and line 55 reads `sucess`. What does the chart
    show right now, and why did `strict: true` not catch it?
14. What is `{} as any` doing at `getCreditsUsageInPeriod.ts:48`?
15. `stripe/route.ts:19` calls the handler without `await` and returns 200 at line 25. What happens to
    a user whose `UserBalance.upsert` fails?
16. Stripe delivers webhooks at-least-once. What in `handleCheckoutSessionCompleted.ts` stops the same
    `checkout.session.completed` from crediting twice?
17. `UserPurchase.stripeId` has no unique constraint. Deliberate?
18. `DeliverViaWebhookExecutor.ts:21` — `body` is already a JSON string and you `JSON.stringify` it
    again. What does the receiver actually get?
19. Why does that executor require exactly `status === 200` (line 25) and then call `response.json()`
    (line 30)?
20. `LaunchBrowserExecutor.ts:16-19` has a commented-out BrightData username and password. Is that
    credential still live?
21. `scripts/assign-credits.js:110` — `updateMany` with no `where`. What was this script for, and who
    can run it?
22. `types/executor.ts:5` holds one `Browser` and one `Page` for an entire execution. How do I build a
    workflow that opens two sites?
23. `setupEnvironmentForPhase` (`executeWorkflow.ts:197`) does `edges.find(...)` inside a loop over
    inputs, inside a loop over phases. What's the complexity, and when does it matter?
24. `ExecutionViewer.tsx:53` does `phases.toSorted(...)[0].id`. What happens for an execution with no
    phases?
25. `useExecutionPlan.tsx:23` lists `setInvalidInputs` as a dependency but never calls it. What is
    `FlowValidationContext` for, then?

---

## 9. Tiered mock interview

### Tier 1 — campus / service-based

- Explain SynthScrape in two minutes to someone who has never seen a workflow builder. What's the
  user's job-to-be-done?
- Which parts did you write versus follow from a tutorial? Be specific about which files you'd change
  first if I gave you a day. **(Be honest here. The commit history — `feat:billing setup`,
  `feat:setting up stripe`, `feat:setup user with 100 free credits` — reads as a build-along, and a
  senior interviewer will assume so. Owning it costs nothing; being caught costs everything.)**
- `TaskRegistry` and `ExecutorRegistry` are both typed as `{[K in TaskType]: ...}`. What OOP/type-system
  principle is that enforcing, and what breaks if I add a `TaskType` and forget one map?
- Walk me through `FlowToExecutionPlan` (`executionPlan.ts:18`). What classic graph algorithm is this?
  What's its time complexity as written?
- What does `setupEnvironmentForPhase` (`executeWorkflow.ts:197`) do? Trace one input value from a
  `PAGE_TO_HTML` output into an `EXTRACT_TEXT_FROM_ELEMENT` input.
- Why does `createLogCollector` (`src/lib/log.ts:3`) build its methods from a `LogLevels` array
  instead of writing `info` and `error` by hand?
- What data structure is `planned` in `executionPlan.ts:36` and why a `Set`?
- `symmetricEncrypt` returns `iv.toString("hex") + ":" + encrypted`. Why store the IV at all, and why
  is it safe to store it in plaintext next to the ciphertext?

### Tier 2 — product company / startup bar

- Your entire mutation surface is Server Actions. Critique that as an API: how does a third party
  integrate? How do you version it? How do you rate-limit it?
- Defend the schema. No enums, no indexes, no user table, JSON in TEXT columns. Pick the one you'd fix
  first and tell me the migration.
- `ExecutionPhase.outputs` stores full page HTML. Give me a retention policy and tell me what it costs
  you to implement.
- `executeWorkflow.ts:38` — you have phase numbers and you execute sequentially. Make it parallel.
  What breaks first? (Answer must reach: the shared single `Page` in `types/executor.ts:5`.)
- Two browser tabs, same user, both press Run on the same published workflow at the same time. Trace
  what happens to `UserBalance`, to `Workflow.lastRunStatus`, and to the two Chromium processes.
- The cron poller selects on `nextRunAt <= now` and something else advances `nextRunAt` a browser-
  launch later. Design the fix. Now tell me what your fix does when the runner crashes mid-execution.
- **System design extension:** add "retry a failed phase up to 3 times with exponential backoff."
  Where does the state live? What does it do to credit accounting? What does it do to
  `ExecutionPhase`, which currently models exactly one attempt?
- **System design extension:** the product now needs a workflow that scrapes 10,000 product pages from
  one site. The current model is one node = one action. Redesign the task model.
- `GetWorkflowExecutions` is unpaginated and polled every 5s. Fix it without losing the live-updating
  feel.

### Tier 3 — FAANG-tier

- **Capacity.** Today: single Next.js process, one Postgres, `pg` pool default max 10, one Chromium
  per execution at ~300MB RSS. Give me the arithmetic for 1,000 users each running one 10-node
  workflow hourly. Then 100,000. Tell me the first three things that break and in what order.
  (Expected: browser memory and CPU on the single host long before Postgres; then the connection pool
  at ~10 concurrent runs; then `ExecutionPhase` table size from HTML outputs; then the cron poller's
  sequential scan.)
- **Storage.** Estimate the annual growth of `ExecutionPhase` if 1,000 workflows run hourly and each
  contains one `PAGE_TO_HTML` node against a 500KB page. Now propose the split between Postgres and
  object storage and tell me what queries you lose.
- **Consistency vs availability.** The credit balance is the system's money. `decrementCredits`
  (`executeWorkflow.ts:250`) uses a conditional UPDATE — strongly consistent, single-node, and a
  bottleneck on that one row per user. If you shard or add a read replica, what do you give up?
  Design a version that survives the ledger being eventually consistent, and tell me what a user can
  do to exploit the gap.
- **Redesign for 1M concurrent users:** take the execution subsystem — `runWorkflow.ts`,
  `executeWorkflow.ts`, and the executors — and make it a real system. I want: how work is enqueued
  and claimed, how a browser pool is managed and isolated per tenant, what happens when a worker dies
  holding credits it already deducted, how you bound egress for SSRF, and how the UI still gets 1Hz
  phase updates without polling a table.
- **Webhook deep dive.** `src/app/api/webhooks/stripe/route.ts` and
  `src/lib/stripe/handleCheckoutSessionCompleted.ts`. Enumerate every way this loses or duplicates
  money: unawaited handler, premature 200, no `event.id` dedupe, no unique on `stripeId`, two writes
  outside a transaction, catch block returning `undefined`. Then reconcile: given a Stripe account and
  this database, write the query that finds every paid session with no matching `UserPurchase`.
- **Find the race — live.** Here are two files. Tell me why this is a bug and construct the sequence
  of events that triggers it:
  - `src/app/api/workflows/cron/route.ts:7-18` — select all workflows with `nextRunAt <= now()`, then
    fire an unawaited `fetch` per workflow.
  - `src/lib/workflow/executeWorkflow.ts:55-73` — `nextRunAt` is only advanced here, after the
    executor route has created the execution rows.
  *(Expected answer: TOCTOU. Two polls inside the browser-launch window select the same row. No
  claim, no lease, no lock, no idempotency key. Then: the route is unauthenticated per
  `middleware.ts:3`, so this isn't a timing accident — it's a remote credit-drain and a fork bomb.
  Fix: atomic claim via conditional UPDATE ... RETURNING, plus auth, plus a unique constraint on
  `(workflowId, scheduledFor)`.)*
- **Find the second bug — live.** `src/lib/workflow/executeWorkflow.ts:18-21` loads phases with no
  `ORDER BY`, and line 76 issues an `updateMany` across all of them immediately before the execution
  loop at line 38. Why is this latent rather than immediate, and what makes it fire?
  *(Expected: Postgres gives no ordering guarantee without `ORDER BY`; an UPDATE writes new heap
  tuples, so post-`updateMany` physical order is explicitly not insert order. It survives today on
  small tables with a seq scan reading in insert order. It fires after enough churn, a different plan,
  or a VACUUM — and then `NAVIGATE_URL` runs before `LAUNCH_BROWSER` and `getPage()` is `undefined`.)*
- **Anti-bot reality check.** `puppeteer.launch({headless:true})`, stock Chromium, no
  `puppeteer-extra-plugin-stealth`, no proxy (the BrightData config at `LaunchBrowserExecutor.ts:10-19`
  is commented out), no user-agent override, no viewport (`:15`, also commented out), default
  `navigator.webdriver === true`. What fraction of commercially interesting targets does this actually
  scrape? What's your plan for Cloudflare Turnstile, and what's your legal position on ToS and
  `robots.txt` — neither of which this code reads?

---

## 10. Weaknesses & landmines — ranked

1. **`/api/workflows/cron` is unauthenticated** (`middleware.ts:3` + `cron/route.ts:5`). Unauthenticated
   DoS, credit drain, and remote process-spawning. → **Fix before the interview.** It's four lines
   (copy `isValidSecret` from the sibling route) and leaving it in is the single worst signal in the
   repo.
2. **The "AI" node is a hardcoded mock that charges 4 credits**
   (`ExtractDataWithAIExecutor.ts:41-47`) while the app markets itself as AI-powered
   (`layout.tsx:18`). → **Own it, loudly and first.** Either wire it to a real model or relabel the
   node. Do not let an interviewer discover this before you say it.
3. **Stripe webhook is non-idempotent and acknowledged before the work happens**
   (`stripe/route.ts:19,25`; `handleCheckoutSessionCompleted.ts:29-51`). Loses and duplicates money. →
   **Fix.** `await`, `$transaction`, `@@unique` on `stripeId`, correct status codes. See §11 — it is
   also the fix that makes the resume claim bulletproof.
4. **IDOR on credential decryption** (`ExtractDataWithAIExecutor.ts:26`, missing `userId` filter). →
   **Fix.** One line. It's the kind of bug that ends an interview.
5. **Unrestricted SSRF** via `page.goto` and the webhook executor. → **Own it** with a concrete plan
   (scheme allowlist, DNS resolution + private-CIDR rejection, egress proxy). A real fix is more than a
   pre-interview evening.
6. **Phases loaded with no `ORDER BY`** (`executeWorkflow.ts:20`). Latent correctness bug in the core
   engine. → **Fix.** One line, and it makes a great story: "I found this while writing up the
   architecture."
7. **No job queue — execution still rides the request.** *(the acute bug is fixed)*
   Execution now works in production: `after()` (`runWorkflow.ts:98`) keeps the engine alive past
   the response, and `puppeteer-core` + `@sparticuz/chromium` launches fine on Vercel — verified end
   to end against quotes.toscrape.com. What is left is the architectural half: the run is capped by
   the function timeout, nothing retries, nothing reaps a run whose instance died, and there is no
   concurrency cap on browsers. → **Own it.** "`after()` made it correct for short runs; a queue with
   a worker and a visibility timeout is the real answer" is a strong, honest response — and see §12
   Set E, where diagnosing this is now your best debugging story.
   **Separately, scheduled runs still never fire in production** — there is no `vercel.json` cron
   entry calling `/api/workflows/cron`, and that endpoint has no auth. Know this before you demo.
8. **Zero indexes on a schema whose every query filters `userId`.** → **Fix.** Five `@@index` lines and
   one migration. Cheap, and it lets you talk about query plans instead of apologising.
9. **Dashboard success metrics are permanently zero** (`sucess`/`success` typo,
   `getWorkflowExecutionStats.ts:39,55` and `getCreditsUsageInPeriod.ts:44,60`). Someone will open the
   dashboard. → **Fix**, and be ready to explain why `{} as any` defeated the type checker.
10. **Committed BrightData proxy credential** (`LaunchBrowserExecutor.ts:17-18`). → **Rotate it now**,
    then remove the block. History rewriting is optional; rotation is not.
11. **`/api/workflows/execute` executes any workflow by id with one global secret**
    (`execute/route.ts:41`). → Fix alongside #1; scope by the workflow's own `userId` and verify it's
    published with a cron.
12. **No tests, no CI, `next lint` deprecated.** → **Own it**, but land two or three tests on
    `FlowToExecutionPlan` first. "Untested" is forgivable at final-year level; "untested and I never
    thought about what to test" isn't.
13. **No pagination on unbounded, polled queries** (`getWorkflowExecutions.ts:12` + 5s poll;
    `CredentialsParam.tsx:15` + 10s poll per node). → Own it with the cursor-pagination answer ready.
14. **In-memory analytics aggregation** (`getStatsCardsValues.ts:17`, both chart actions). → Own it;
    know that `groupBy` and `date_trunc` are the answer.
15. **AES-256-CBC with no MAC and no key rotation path** (`encryption.ts:4`). → Own it. Knowing *why*
    GCM matters is worth more than having switched.
16. **Every `revalidatePath` targets a route that doesn't exist** (8 call sites). Cosmetically fine
    because everything polls, which is worse. → **Fix**; it's find-and-replace and it demonstrates you
    understand your own routing.
17. **Credits billed for failed phases, no refund** (`executeWorkflow.ts:140`). → Own it as a product
    decision you'd revisit; have the "reserve then settle" alternative ready.
18. **Webhook delivery double-encodes the body and rejects 201/204**
    (`DeliverViaWebhookExecutor.ts:21,28,33`). → Fix; it's three lines and it's the only outbound
    integration you own end to end.
19. **Executors inconsistently `return false` on missing input** (7 of 8 log and continue). → Fix or
    own as copy-paste under deadline. Don't claim it was intentional.
20. **Dead imports from Next internals and `fs`/`process` in a payments file**
    (`createWorkflow.ts:11`, `handleCheckoutSessionCompleted.ts:1,6`), plus ~15 broken Tailwind classes
    and misspelled user-facing strings. → **Fix the imports** (30 seconds, and `handleCheckoutSessionCompleted`
    is a file an interviewer *will* open). The typos are lower stakes but they compound the impression
    that nothing was re-read.
21. **`scripts/assign-credits.js:110` — `updateMany` with no `where`.** A single flag away from
    resetting every balance in production. → Add a `--confirm` guard, or explain what it was for.
    **[INFERRED — verify: this looks like a manual patch for a broken free-credit flow, but nothing in
    the code proves that.]**

---

## 11. Resume claims — the Stripe / India question

The resume says "implemented Stripe." The worry is that Stripe "isn't available in India" and that
this reads as a padded claim. **The premise is wrong in two ways, and knowing why is the whole
answer.**

### The facts

- **Stripe test mode has no country restriction.** Anyone, anywhere, signs up and gets `sk_test_`
  keys with zero business verification. There is nothing to be exempted from.
- **Stripe does operate in India for live payments.** Onboarding has been invite-limited, but "not
  available" is inaccurate — and saying it out loud invites an interviewer who knows better to
  correct you.
- **What was genuinely unavailable is live payments**, which need a registered entity, a business
  bank account and KYC. That is equally true of Razorpay, PayU and Cashfree. It is a
  company-registration constraint, not a Stripe constraint and not an India constraint.

### What this repo actually proves

Verified in the working tree, not claimed:

| Evidence | Where |
| --- | --- |
| Test-mode keys — `sk_test` / `pk_test` | `.env` |
| Real Price objects created in a Stripe dashboard (`price_...` ×3) | `.env`, consumed at `types/billing.ts:23,31,39` |
| A webhook signing secret was provisioned (`whsec_...`) | `.env` |
| Checkout Session with `metadata`, `line_items`, `invoice_creation` | `actions/billing/purchaseCredits.ts:23` |
| Signature verification against the **raw** body | `src/app/api/webhooks/stripe/route.ts:7,11` |
| Fulfilment: credit grant + purchase record | `src/lib/stripe/handleCheckoutSessionCompleted.ts:29,43` |
| Invoice retrieval, ownership-scoped | `actions/billing/downloadInvoice.ts` |
| Pinned API version `2025-08-27.basil` | `src/lib/stripe/stripe.ts:4` |

That is a real Checkout integration. "Implemented Stripe" is a true statement. Nothing here needs
defending.

### The scripted answer

> "Test mode. It's a portfolio project — I don't have a registered entity, so live keys were never on
> the table. The full path works against test cards: Checkout Session with the user and pack in
> metadata, `checkout.session.completed` webhook, signature verified against the raw body, then the
> credit grant."

Flat delivery. No apology, no preamble about India. An interviewer who hears a student claim they
processed **live** card payments gets *more* suspicious, not less — test mode is the expected and
correct answer.

### The follow-ups you will actually get

1. **"Did you process real payments?"** — see above. One sentence, move on.
2. **"Why `request.text()` instead of `request.json()`?"** (`route.ts:7`) — because signature
   verification hashes the raw bytes; parsing and re-serialising changes them and the signature
   fails. This is the most common Stripe interview question in existence and your code gets it right.
   Have it ready.
3. **"How did you test the webhook with no public URL?"** — expected answer is
   `stripe listen --forward-to localhost:3000/api/webhooks/stripe`. **If you never ran that, say so.**
   "I registered the endpoint in the dashboard and exercised the fulfilment logic directly" is
   survivable. Inventing a CLI workflow you didn't run is not — it's one follow-up question deep.
4. **"Stripe delivers at-least-once. What stops a duplicate event from double-crediting?"** — right
   now, nothing. No dedupe on `event.id`, no `@@unique` on `UserPurchase.stripeId`, and the two
   writes at `handleCheckoutSessionCompleted.ts:29,43` aren't in a transaction. See §10 item 3.
5. **"What happens if your DB write fails?"** — `route.ts:19` doesn't `await` the handler and returns
   200 at line 25, so Stripe never retries and the user paid for nothing. Own this before they find
   it.
6. **"Why store `session.id` rather than the PaymentIntent?"**
   (`handleCheckoutSessionCompleted.ts:46`) — because `downloadInvoice.ts` re-retrieves the session
   to reach the invoice. Defensible; just know that's why.

### The thread that actually hurts

Not geography — `scripts/assign-credits.js`. A script that pages the Clerk Admin API and
`updateMany`s balances (line 110, no `where` clause) invites: *"why did you need this?"* If the real
answer is "Stripe fulfilment wasn't reliably granting credits so I patched it by hand," that implies
the payment path never worked end to end — which is the actual version of this question that does
damage.

Decide your true answer now. If the webhook worked and the script seeded demo accounts, say that. If
it didn't, "the webhook fires but I never built idempotency or retries, so I kept a manual fallback"
is honest and sets up the fix. **[INFERRED — only you know which of these is true.]**

### What not to say

- Do not volunteer "Stripe isn't available in India." It's shaky on the facts, it sounds
  pre-rehearsed, and it draws scrutiny toward the one area you're trying to move past.
- Do not say "I integrated payments" if pressed for specifics you don't have. Say *Checkout*, say
  *webhook*, say *test mode* — the specific words prove you did it.
- Do not claim transaction volume, revenue, or "processed ₹X." That is the claim that would actually
  be a lie.

### The move that turns this into a strength

Fix §10 item 3 before the interview: `await` the handler, wrap both writes in `prisma.$transaction`,
add `@@unique` on `UserPurchase.stripeId`, treat the unique-violation as success, and return 400 on
signature failure so Stripe retries. It is roughly twenty lines. It converts "did you really do
Stripe?" into "here's the at-least-once delivery problem and here's the constraint that solves it" —
which is a senior answer, and it is the single highest-leverage edit in this repo relative to effort.

---

## 12. Offline / on-campus round — the interviewer has NOT read your code


### Set A — Opening and framing

**"Tell me about your project."**
Use the two-minute pitch: a web scraping tool where you build the scraper visually instead of writing
code — drag blocks onto a canvas, connect them with arrows, and the backend runs them in order using
a real browser. Stop after ~70 seconds. Do not narrate the whole feature list.

**"What is the tech stack and why?"**
Next.js for frontend and backend in one project, Postgres for the database, Prisma to talk to it,
Clerk for login, Puppeteer to control the browser, Stripe for payments. The one-line reason for
Next.js: I needed server-side code anyway because a browser cannot run Puppeteer, so keeping both in
one project meant one deployment and one language.

### Set B — "Explain this concept" questions

These come from your resume keywords. Each answer should be two or three sentences, no jargon.

**"What is a headless browser, and why did you need one?"**
It is a real Chrome browser running without a visible window, controlled by code. I needed it because
most modern websites build their content with JavaScript after the page loads — if you just download
the HTML you get an empty shell. A real browser runs that JavaScript, so I see the same page a human
would.

**"What is a webhook? Why not just check Stripe every few seconds?"**
A webhook is Stripe calling my server when something happens, instead of my server repeatedly asking
Stripe "did it happen yet?". It is faster and it is far fewer requests. Polling means choosing an
interval, and any interval is either too slow for the user or too wasteful for the server.

**"Difference between authentication and authorization — where is each in your project?"**
Authentication is *who are you*; authorization is *are you allowed to do this*. Clerk handles the
first — login, sessions, the sign-in page. The second is mine: every time someone opens or runs a
workflow, I check that the workflow belongs to the logged-in user before doing anything.

**"You encrypt user credentials. Why not hash them like passwords?"**
Hashing is one-way — you can check if an input matches but you can never get the original back. That
is right for passwords, because I never need to know your password, only whether you typed the right
one. Here I need the actual value back so I can use it, so I encrypt it with a key the server holds
and decrypt it at run time.

**"Why Postgres and not MongoDB?"**
The data is naturally relational — a workflow has many runs, a run has many steps, a step has many
log lines. That is a clean parent-child structure, and I wanted foreign keys so deleting a workflow
cleanly removes everything under it. Credits also need reliable arithmetic, and I would rather have
transactions for that.

**"What is an ORM? Why Prisma?"**
It is a layer that lets me write database queries in TypeScript instead of raw SQL, and it maps the
results into typed objects. Prisma specifically gives me a schema file that generates both the
migrations and the types, so if I rename a column the code stops compiling instead of failing at run
time.

**"What is a cron expression?"**
A five-field string that describes a repeating schedule — minute, hour, day of month, month, day of
week. `0 * * * *` means every hour on the hour. I store it on the workflow and compute the next run
time from it.

**"What does an index do?"** *(and own the gap)*
It works like the index at the back of a book — instead of scanning every row to find matches, the
database jumps straight to them. I should be honest here: I have not added any yet. Every one of my
queries filters by user ID, so that is the first index I would add, and it is on my list.

### Set C — Applied CS fundamentals

This is the campus favourite: they take one word from your project and turn it into a DSA question.
Your project is built on a graph, so expect all of these.

**"You said the workflow is a graph. What kind of graph?"**
Directed and acyclic. Directed because the arrows have a direction — output of one block feeds the
input of the next. Acyclic because a loop would mean a step waiting on itself, which can never run,
so I block the user from creating one in the editor.

**"How do you work out what order to run the steps in?"**
Topological sort. I repeatedly take every block whose inputs are already satisfied, run those, mark
them done, and repeat with whatever became ready. If I ever get stuck with blocks remaining and none
of them ready, that means there is a cycle.

**"Write topological sort."** *(Kahn's algorithm — be ready to write this on paper)*
Count how many incoming edges each node has. Put every node with zero into a queue. Pop one, add it
to the output, and for each of its neighbours reduce their count by one — if a neighbour hits zero,
push it. If the output has fewer nodes than the graph, there is a cycle. `O(V + E)` time, `O(V)`
space.

**"What is the complexity of yours?"**
Worse than that, and I know it. Mine re-scans every unplaced block on each round instead of keeping a
running count of unmet dependencies, so it is roughly quadratic in the number of blocks. For
workflows of ten or fifteen blocks it makes no measurable difference, but the proper Kahn's version
with an in-degree map is the fix.

**"How do you stop a user creating a loop in the editor?"**
Before I accept a new arrow, I walk forward from the block it points to and follow every outgoing
arrow. If I can reach the block it started from, then adding this arrow would close a loop, so I
reject the connection. That is a depth-first search.

**"Why a set and not an array for tracking finished blocks?"**
Because I check membership constantly — "have I already scheduled this block?" A set answers that in
constant time; an array would be a linear scan on every single check, inside a loop that already runs
many times.

**"Where would you use BFS instead of DFS here?"**
DFS is right for cycle detection because I only care whether a path exists. The layered execution
order is closer to BFS in spirit — I process everything at one level before moving to the next, which
is also what would let me run independent blocks in parallel later.

### Set D — If they ask you to draw it

Six boxes and five arrows. Practise it until it takes ninety seconds.

1. **Browser** — the canvas where the user drags blocks and draws arrows.
2. **Next.js server** — one box; say "frontend and backend are the same app."
3. **Database (Postgres)** — the diagram is saved here as JSON, along with every run and its logs.
4. **Execution engine** — inside the server box. Reads the plan, runs the steps in order.
5. **Chrome (Puppeteer)** — a separate process the engine controls; arrow out to "target website."
6. **Stripe** — off to the side, arrow back into the server labelled "webhook."

Then draw one dotted arrow from a **Scheduler** box into the server, and say "a cron schedule can
trigger the same run path without a user pressing anything." That dotted arrow is what makes the
diagram look like a system instead of a CRUD app.

### Set E — "Did you actually build this?" probes

The most important set. Vague answers here sink you. Have these ready.

**"What was the hardest bug?"** ← lead with this one
Runs hanging in production. Locally everything worked; deployed to Vercel, every run stuck at
RUNNING forever, no credits recorded, and — this was the confusing part — nothing at all in the
error logs. The cause was that the code kicked off the scraping engine without waiting for it and
then immediately redirected. On a normal server that is fine, the process stays alive and the work
finishes in the background. On serverless the function is frozen the moment the response is sent, so
the run was being abandoned halfway through. Nothing was logged because the error handling never got
to run. I fixed it by deferring the engine with `after()`, which tells the framework to keep the
instance alive until the work finishes.

Why this is your best story: it is a bug that **only exists in production**, you diagnosed it from
indirect evidence (status written but no credits, zero errors logged), and the fix required
understanding the serverless execution model rather than looking something up. It also proves you
deployed the thing rather than just running it locally.

If they push — *"how did you narrow it down?"*: the status said RUNNING, which meant the engine had
started, and credits were zero, which meant no step had finished. So it died between those two
points, and it died silently. That pointed at the process being killed rather than the code throwing.

**"Was there a knock-on effect from that?"** (only if the conversation is going well)
Yes, and it confirmed the diagnosis. Locally I was also getting an unhandled rejection saying a
revalidate call happened "during render". That was the same loose promise finishing inside some other
request's rendering work, where that call is not allowed. Deferring the engine properly fixed both
symptoms at once, which is how I knew it was one root cause and not two bugs.

**"Tell me about something that was broken and you did not notice for a while."**
The dashboard chart. I had a typo — I initialised the counter with one spelling and incremented a
different spelling — so the "successful runs" line sat at zero permanently while the "failed" line
worked fine. I only caught it when the numbers did not match what was actually in the database.

**"Any smaller UI bug worth mentioning?"**
The blocks on the canvas contain text inputs, so clicking into a field to type was being interpreted
as grabbing the block and dragging it. The fix was to make only the block's header draggable, so the
body behaves like a normal form.

**"Was there anything you had to think about carefully rather than just look up?"**
Deducting credits. If two runs start at the same moment, reading the balance and then writing it back
can let both of them pass when only one should. I made it a single conditional update in the
database — subtract this amount only if the balance is at least this much — so the database decides,
not my code.

**"If I asked you to add a new type of block right now, what would you do?"**
Three things: describe the block — its name, its inputs and outputs, and what it costs; write the
function that actually performs it; and register both in the two lookup tables so the editor and the
engine can find it. It is designed so the compiler complains if I register one and forget the other.

**"What part are you least happy with?"**
There is still no job queue. `after()` keeps the run alive long enough to finish, but it is bounded
by the platform's function timeout, and if the instance dies mid-run there is nothing that notices or
retries — the row just sits at RUNNING. A queue with a worker, a visibility timeout and a retry
policy is the proper answer, and it is the first thing I would build next.

### Set F — Hypothetical extensions

**"How would you add a loop — scrape 100 product pages?"**
Right now the graph runs once, top to bottom, so there is no repeat. I would add a block that takes a
list and runs the blocks after it once per item. The real work is state: each iteration needs its own
set of inputs and outputs instead of the single shared one I have now.

**"What if the website blocks your scraper?"**
That is a real limitation of what I built — I use a plain Chrome with default settings, so a site
looking for automation will spot it. The usual answers are rotating IPs through a proxy service,
masking the automation signals the browser exposes, and slowing the request rate down. I would also
want to respect robots.txt, which I currently do not read.

**"How would two users share a workflow?"**
Today a workflow belongs to exactly one user ID, so sharing means introducing a proper owner-and-
members model — a table of who has access to what, and a permission level. Every query I have would
need to change from "does this belong to me" to "do I have access to this."

**"How would you handle 1000 users?"**
The browser is the bottleneck long before the database. Each run holds a Chrome process, so I would
move execution off the web server onto separate worker machines pulling from a job queue, cap how
many browsers run at once, and add the database indexes. The web app then only writes the job and
shows progress.

### Set G — Demo and deployment

**The app is deployed at https://synth-scrape.vercel.app/ and workflow execution works there.**
Verified: a two-block scrape of quotes.toscrape.com completes in about three seconds and returns real
page HTML. Give out the link.

This was not true until recently, and the reason it is true now is the story in Set E. If you only
remember one thing from this document, it is that those two facts are connected — you can demo it
because you found and fixed the reason it did not work.

**"Can I see it?"**
Yes. Hand them the URL. Have a workflow already built and saved in your account so you are not
constructing one from scratch under observation.

**The demo, in order:**

1. `/dashboard/workflows` — show the list, open a saved workflow.
2. The editor — point at the canvas. Say the one-liner: "each block is a step, the arrows define what
   feeds what, and the backend works out the order to run them in."
3. Press **Execute**. It redirects to the run page.
4. Watch the phases turn green. This is the payoff — narrate it: "each step is being saved as it
   runs, with its inputs, outputs and logs."
5. Click the extract step — the scraped content is right there in the outputs panel.
6. Point at Credits Consumed, then the **Runs** tab for the history.

**What can still go wrong on the day:**

- **Cold start.** The first run after a period of inactivity is slower — the serverless Chromium
  binary has to be unpacked. Do one throwaway run a few minutes before you present.
- **Credits.** Check your balance at `/dashboard/billing` first. At zero, every run fails on step one.
- **Selector typos.** Use `.text` or `.author` on quotes.toscrape.com. Both verified.
- **Never demo against google.com.** Aggressive anti-bot, consent redirects. It will embarrass you.

**Keep the local setup as a backup anyway.** `npm run dev` works and has no function timeout. If the
deployment misbehaves — or the venue's wifi does — you still have something to show. Also record a
two-minute screen capture and keep it on your phone as a last resort.

**One thing that still does not work in production, and you should know it:** scheduled runs. There
is no `vercel.json` with a cron entry, so nothing ever calls the scheduler endpoint on the
deployment. The scheduling UI works, the cron expression is stored and parsed, the next run time is
computed — but no timer fires it. Manual runs are unaffected.

If asked: "The scheduling is built end to end, but I never wired up the platform's cron trigger to
call it, so on the deployed version schedules are stored and never fired. It works if you hit the
endpoint yourself. That endpoint also has no authentication on it, which is the other thing I would
fix before anyone else used this."

That answer is better than pretending it works. It is one honest sentence, and it shows you know the
difference between a feature being written and a feature being wired up.
