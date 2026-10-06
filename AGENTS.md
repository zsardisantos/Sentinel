# Instructions for AI coding agents

## About this project

Sentinel is an escrow app for families abroad who pay for homes being built back home. Read README.md first for how it works.

The code was written for Palantir Foundry. Files in `functions/` import `@ontology/sdk`, `@osdk/client`, and `@osdk/functions`, which are not available outside Foundry. Do not add these packages to a package.json or try to install them. `domain/escrow.ts` is plain TypeScript.

## How to help me

I am learning TypeScript and want to understand every line in this repo.

- Explain before you write. Use plain language.
- When I ask for a new function, give me a skeleton first: the signature, numbered TODOs, and a short description of what each TODO does. Do not fill in the full solution unless I ask for it.
- When you review my code, point out the exact line and say why it is wrong. Do not silently rewrite it.
- Keep my comments. They are my notes.

## Rules the code must keep

- Every function that changes a milestone calls `assertTransition` from `domain/escrow.ts` before changing anything.
- Money is always whole cents (`amountMinor`). Never use decimals for money.
- Percentages are basis points. Round the small parts down and give the remainder to the builder.
- Every journal entry must pass `assertBalanced` (postings sum to zero) before it is written.
- Never store a balance. Always sum it from postings.
- The AI may only create an AiReview. Never give the AI path a way to approve, release, or edit a milestone or the ledger.
- All edits in one function are written as one batch, so they save together or not at all.

## Conventions

- Relative imports use the `.js` extension, for example `../domain/escrow.js`, because the project uses NodeNext module resolution.
- Do not name a folder `lib`. The original Foundry repo's .gitignore ignored any folder called `lib`, which once hid `escrow.ts` from git.
- New IDs come from `newId(prefix)`, and timestamps from `nowIso()`.

## Known issues

- `splitTranche` allows an amount of 0, but its error message says the amount must be greater than zero. Decide which one is right.
- `assertBalanced` throws when there are fewer than 2 postings, but its message says "more than two".

## Writing style

- No em dashes in docs, comments, or messages.
- Keep docs short and specific. Every claim should be checkable against the code.
