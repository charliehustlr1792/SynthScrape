This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Architecture

SynthScrape is a single Next.js 15 App Router deployment — no separate worker, no queue, no cache
layer. Everything (UI, server actions, API routes, and the Puppeteer scraping engine) runs inside
the same Node process. State lives in one PostgreSQL database reached through Prisma 7 with the
`pg` driver adapter (`src/lib/prisma.ts`). Identity is delegated to Clerk; payments to Stripe.

### Components as they actually exist

| Layer | Where | Notes |
| --- | --- | --- |
| Auth | `src/middleware.ts` | `clerkMiddleware`; `/`, `/sign-in*`, `/sign-up*`, `/api/webhooks/stripe` and **all** of `/api/workflows/*` are public routes |
| Mutations/queries | `actions/**` (`"use server"`) | Server Actions, not a REST API. Each re-checks `auth()` itself |
| HTTP endpoints | `src/app/api/**` | Only three: Stripe webhook, cron poller, workflow executor |
| Flow editor | `src/app/workflow/_components/**` | `@xyflow/react` canvas; graph serialized to a JSON string in `Workflow.definition` |
| Task/executor registries | `src/lib/workflow/task/registry.tsx`, `src/lib/workflow/executor/registry.ts` | Two parallel maps keyed by `TaskType` — one for UI metadata, one for runtime behaviour |
| Execution engine | `src/lib/workflow/executeWorkflow.ts` | In-process, sequential, `await`-driven; no queue, no retries |
| Browser automation | `src/lib/workflow/executor/*Executor.ts` | `puppeteer.launch()` in-process; one `Browser` + one `Page` per execution |
| Billing | `actions/billing/**`, `src/lib/stripe/**` | Stripe Checkout → webhook → `UserBalance.credits` |
| Secrets at rest | `src/lib/encryption.ts` | AES-256-CBC with a single `ENCRYPTION_KEY` |

### Flow 1 — workflow authoring and execution

```mermaid
flowchart TD
    subgraph Client["Browser"]
        Editor["Flow editor<br/>(@xyflow/react canvas)"]
        RunsUI["Run viewer<br/>(react-query poll, 1s)"]
    end

    subgraph Next["Next.js server process"]
        MW["middleware.ts<br/>clerkMiddleware"]
        SA["Server Actions<br/>actions/workflows/*"]
        Plan["FlowToExecutionPlan<br/>executionPlan.ts"]
        CronAPI["GET /api/workflows/cron<br/>(no auth check)"]
        ExecAPI["GET /api/workflows/execute<br/>(Bearer API_SECRET)"]
        Engine["ExecuteWorkflow<br/>executeWorkflow.ts"]
        ExecReg["ExecutorRegistry<br/>12 task executors"]
        Enc["symmetricDecrypt<br/>AES-256-CBC"]
    end

    subgraph External["External"]
        Clerk["Clerk"]
        PG[("PostgreSQL<br/>via Prisma + pg")]
        Chrome["Chromium<br/>puppeteer.launch"]
        Target["Target websites"]
        Hook["User-supplied webhook URL"]
    end

    Editor -->|save / publish / execute| MW
    MW -->|verify session| Clerk
    MW --> SA
    SA --> Plan
    Plan -->|executionPlan JSON| PG
    SA -->|create WorkflowExecution + ExecutionPhases| PG
    SA -->|"deferred via after()"| Engine

    CronAPI -->|"find nextRunAt <= now"| PG
    CronAPI -->|"fan-out fetch, not awaited"| ExecAPI
    ExecAPI -->|create execution rows| PG
    ExecAPI -->|awaited| Engine

    Engine -->|"per phase: atomic credit decrement"| PG
    Engine --> ExecReg
    ExecReg --> Chrome
    Chrome --> Target
    ExecReg -->|EXTRACT_DATA_WITH_AI| Enc
    Enc -->|read Credential row| PG
    ExecReg -->|DELIVER_VIA_WEBHOOK| Hook
    Engine -->|phase status, outputs, logs| PG

    RunsUI -->|GetWorkflowExecutionWithPhases| SA
```

Notes that the diagram encodes deliberately:

- The cron poller does **not** claim or advance `nextRunAt`; that only happens later inside
  `initializeWorkflowExecution` (`src/lib/workflow/executeWorkflow.ts:55`).
- `RunWorkflow` defers the engine with `after()` (`actions/workflows/runWorkflow.ts:98`),
  while `/api/workflows/execute` awaits it directly (`src/app/api/workflows/execute/route.ts:83`).
  Two different lifetimes for the same engine. The call was originally a bare unawaited promise,
  which worked on a long-lived local server and silently abandoned every run on serverless, where the
  instance is frozen once the response is sent.
- Phases execute strictly sequentially in the order Postgres returns them
  (`src/lib/workflow/executeWorkflow.ts:38`); the phase *numbers* produced by the planner are not
  used to parallelise anything at runtime.

### Flow 2 — credits and billing

```mermaid
sequenceDiagram
    autonumber
    participant U as User
    participant SA as PurchaseCredits<br/>(server action)
    participant S as Stripe Checkout
    participant WH as POST /api/webhooks/stripe
    participant H as HandleCheckoutSessionCompleted
    participant DB as PostgreSQL

    U->>SA: pick pack (SMALL/MEDIUM/LARGE)
    SA->>S: checkout.sessions.create<br/>metadata { userId, packId }
    SA-->>U: redirect to session.url
    U->>S: pay
    S->>WH: checkout.session.completed
    WH->>WH: stripe.webhooks.constructEvent<br/>(signature verified)
    WH->>H: call WITHOUT await
    WH-->>S: 200 returned immediately
    H->>DB: UserBalance.upsert (increment credits)
    H->>DB: UserPurchase.create (stripeId = session id)
    Note over WH,H: if H throws, Stripe has already<br/>been told 200 — no retry, credits lost

    U->>DB: run workflow
    DB-->>DB: per phase: UPDATE UserBalance<br/>SET credits = credits - n<br/>WHERE credits >= n
```

### Data model

Six tables, no `User` table — Clerk's `userId` is a bare `String` column on five of them with no
foreign key and, as of this writing, **no `@@index`** anywhere in `prisma/schema.prisma`.

```mermaid
erDiagram
    Workflow ||--o{ WorkflowExecution : "onDelete: Cascade"
    WorkflowExecution ||--o{ ExecutionPhase : "onDelete: Cascade"
    ExecutionPhase ||--o{ ExecutionLog : "onDelete: Cascade"

    Workflow {
        string id PK
        string userId "no FK, no index"
        string definition "JSON-in-TEXT"
        string executionPlan "JSON-in-TEXT, nullable"
        string status "DRAFT or PUBLISHED, stored as String"
        string cron "nullable"
        datetime nextRunAt "polled by cron route"
    }
    WorkflowExecution {
        string id PK
        string userId "denormalized"
        string definition "JSON snapshot at run time"
        string status "String, not enum"
        int creditsConsumed
    }
    ExecutionPhase {
        string id PK
        string userId "denormalized again"
        int number
        string node "JSON-in-TEXT"
        string inputs "JSON-in-TEXT"
        string outputs "JSON-in-TEXT, holds full page HTML"
    }
    ExecutionLog {
        string id PK
        string logLevel "String"
        string message
    }
    UserBalance {
        string userId PK
        int credits
    }
    Credential {
        string id PK
        string userId
        string name
        string value "AES-256-CBC, iv:ciphertext hex"
    }
    UserPurchase {
        string id PK
        string userId
        string stripeId "checkout session id"
        int amount "minor units"
    }
```

### Environment

Required at runtime (names only; see `.env`, which is git-ignored):
`DATABASE_URL`, `ENCRYPTION_KEY` (32-byte hex), `API_SECRET`, `NEXT_PUBLIC_APP_URL`,
`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `STRIPE_SECRET_KEY`,
`STRIPE_WEBHOOK_SECRET`, and `STRIPE_{SMALL,MEDIUM,LARGE}_PACK_ID`.


## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

streak maintain rehna chahiye
