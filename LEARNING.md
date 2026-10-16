# Learning plan

My plan for becoming as technical as possible before I start as Member of Technical Staff at Savvy Wealth on November 30, 2026, and for continuing after that. Sentinel is the practice ground.

## The goal

Hand-writing code is no longer the core skill. The skills I am building:

1. **Understand systems deeply:** how data, networks, databases, and processes actually work, so I can judge whether code is correct.
2. **Design:** data models, boundaries, tradeoffs, failure modes.
3. **Direct coding agents well:** give them the right context, review their output critically, and catch wrong code and weak architecture.
4. **Think like a founder:** understand the user, ship, and measure whether it mattered.

## What Savvy expects

From the "Engineer - Future Founder" blog post and the "Engineer - Technical Staff" posting:

- **Stack:** Rails, React, Next.js, PostgreSQL, GraphQL. Infrastructure on AWS.
- **AI:** "Daily, fluent use of AI development tools (Claude Code, Cursor, Codex). This isn't occasional or experimental; it's how you work." Newer postings add: "Faster output alone is not the bar," and want engineers who can show how they "decompose tasks, manage context, choose models, inspect failures."
- **Role:** own features from first prompt to production, talk directly with financial advisors, learn product, design, and how product choices affect the P&L.
- **Nice to have:** LLM features in production, retrieval, evals, vector databases, fintech knowledge, CI/CD, observability.

## Where I stand

| Area | Savvy uses | My gap |
|---|---|---|
| Database | PostgreSQL | Small. Sentinel is teaching this now |
| Frontend | React, Next.js | TypeScript foundation in progress |
| Backend | Rails (Ruby) | Biggest gap. New language and new style |
| API | GraphQL | Concepts only |
| AI coding | Claude Code and others | Good start (AGENTS.md). Go deeper |
| AI in product | LLM APIs, retrieval, evals | Not started |
| Domain | Wealth management | Ledger work transfers |

## Track 1: Sentinel off Foundry (Postgres, Drizzle, transactions)

| Phase | Work | Teaches |
|---|---|---|
| 1 | Postgres in Docker, Drizzle schema, first migration | Tables, keys, foreign keys, migrations, containers |
| 2 | Seed script: a project, milestones, a funding entry | Inserts, running TypeScript scripts |
| 3 | Rewrite `submitEvidence` | First `db.transaction`, reading inside the transaction |
| 4 | Rewrite `requestRework` | Select, `orderBy`, `limit`, null instead of `""` |
| 5 | Rewrite `createAiReview` | When a transaction is or is not needed |
| 6 | Rewrite `approveAndRelease` | `FOR UPDATE` locks, `SUM`, unique constraints, idempotency |
| 7 | Tests for `domain/escrow.ts` with `node:test` | Unit tests, edge cases, fixing the Known issues in AGENTS.md |
| 8 | Delete `foundry.d.ts`, update README and AGENTS.md | Keeping docs honest |

## Track 2: Savvy's stack

- **Rails:** the official Getting Started guide, then a small app. Focus on convention over configuration, ActiveRecord (compare with Drizzle), migrations, models, controllers, and the request lifecycle. Learn enough Ruby to read code fluently.
- **React and Next.js:** build a Sentinel frontend where a payer sees milestones and taps "approve." Components, state, data fetching, server versus client code. The approve button generates the `requestId`.
- **GraphQL:** queries, mutations, schemas, resolvers, and why a frontend would choose it over REST. Rails apps usually use the `graphql-ruby` gem.

## Track 3: AI engineering and coding agents

- **Writing instructions:** treat AGENTS.md as practice for Savvy's internal skills system. Write one reusable skill, for example "review a migration for safety."
- **Context:** decide what an agent needs up front and what it can discover. Notice when a session has too much irrelevant context.
- **Review:** read every agent diff as if a junior engineer wrote it. Check it against the rules in AGENTS.md. Note each mistake and what instruction would have prevented it.
- **Choosing a mode:** know when to let an agent run alone, when to pair step by step, and when to write it myself.
- **LLM features:** call the Claude API directly once. Build something small with tool use. Learn what an eval is and write a tiny one, for example "does the AI reviewer reject a bad invoice?"

## Track 4: CS and engineering foundations

These make every other track easier. Each item links to something concrete in Sentinel where possible.

**Databases** (highest priority, since Sentinel and Savvy both run on Postgres)
- ACID and isolation levels: what `READ COMMITTED` and `SERIALIZABLE` actually prevent.
- Indexes and B-trees: why a query is slow, reading `EXPLAIN ANALYZE`.
- Normalization and when to break it (Sentinel stores `projectId` on postings for the balance query).
- Locks, deadlocks, and how two transactions can block each other.

**Distributed systems and reliability**
- Idempotency, retries, timeouts (already started with `requestId`).
- Background jobs and queues: why slow work leaves the request path.
- Consistency: what happens when two systems disagree, like a bank transfer that succeeds after our database times out.

**Networking and the web**
- What happens when you type a URL: DNS, TCP, TLS, HTTP.
- HTTP methods, status codes, headers, cookies, caching.
- REST versus GraphQL versus RPC.

**Operating systems and runtime**
- Processes, threads, and the Node.js event loop: why `await` does not block other requests.
- Memory, the stack and the heap (builds on CS61).
- Containers versus virtual machines (Docker, done).

**Security** (fiduciary data makes this serious at Savvy)
- Authentication versus authorization. Sessions versus tokens.
- OWASP Top 10, especially injection and broken access control.
- Secrets handling: why `.env` stays out of git.
- The Sentinel rule that the AI may only create an AiReview is a least-privilege design. Know how to explain it.

**Testing and delivery**
- Unit, integration, and end-to-end tests, and what each one catches.
- CI: run `typecheck` and tests on every push with GitHub Actions.
- Git: branches, rebasing, small pull requests, writing a good PR description.

**Observability**
- Logs, metrics, traces. How to debug a production bug you cannot reproduce.

**Design and data structures**
- Big-O as a tool for judging code, not for interviews. Know which structure fits: map, set, array, queue, tree.
- Modules with simple interfaces that hide complex work (`assertTransition` is a good example).
- Write a one-page design doc for Sentinel: data model, the approval flow, failure modes, and what I would change at 1,000 projects.

## Track 5: Domain

- What an RIA is and what fiduciary duty means.
- How AUM fees work.
- What custodians (Schwab, Fidelity) do and how account data reaches an advisor.
- The day-to-day of a financial advisor: what takes their time.

## Schedule

| Week | Dates | Build | Learn |
|---|---|---|---|
| 1 | Oct 14 to 19 | Sentinel phases 1 and 2 | Docker, Postgres basics, migrations |
| 2 | Oct 20 to 26 | Phases 3 to 5 | Transactions, isolation levels |
| 3 | Oct 27 to Nov 2 | Phases 6 to 8 | Locks, indexes, `EXPLAIN`, testing |
| 4 | Nov 3 to 9 | Rails guide and a small app | Ruby, HTTP and networking |
| 5 | Nov 10 to 16 | Next.js frontend for Sentinel | React, event loop, auth basics |
| 6 | Nov 17 to 23 | CI with GitHub Actions, one Claude API feature | GraphQL, observability, evals |
| 7 | Nov 24 to 29 | Sentinel design doc | Domain reading, rest before starting |

The schedule flexes. If a phase takes longer, understanding it fully beats moving on.

## Daily habits

- Use a coding agent for real work every day, and review every diff.
- When something is new, ask why it works, not only how.
- Write down one thing learned per day in a commit message or a note.

## Reading list

- Designing Data-Intensive Applications, Martin Kleppmann. Chapters 2, 3, 7, and 9 first. The single most useful book for this plan.
- A Philosophy of Software Design, John Ousterhout. Short. About keeping modules simple.
- PostgreSQL documentation, the chapters on transactions and indexes.
- Use The Index, Luke (use-the-index-luke.com). Indexes and query plans.
- Ruby on Rails Guides (guides.rubyonrails.org).
- Next.js Learn course (nextjs.org/learn).
- GraphQL Learn (graphql.org/learn).
- OWASP Top 10 (owasp.org).
- Anthropic: "Building effective agents" and "Claude Code best practices."

## Before I start

- [ ] Email my recruiter or manager: which team, and anything to look at before day one?
- [ ] Sentinel phases 1 to 8 done
- [ ] One small Rails app built
- [ ] Sentinel has a Next.js frontend
- [ ] CI runs typecheck and tests
- [ ] One feature that calls the Claude API, with an eval
- [ ] Sentinel design doc written
- [ ] DDIA chapters 2, 3, 7, and 9 read
