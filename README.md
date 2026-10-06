# Sentinel

Escrow for families abroad who pay for homes being built back home, starting with Cabo Verde.

My dad built our family's house in Praia while living in Boston. He paid the builder in stages, and all he got back were WhatsApp photos and invoices he had no way to check. Invoices got padded, prices went up because the money came from abroad, and work was reported as done before it was. Sentinel holds the money in escrow and only pays a stage once the evidence matches the plan.

## How it works

1. A project is split into milestones (foundation, walls, roof, and so on). Each milestone has a spec, an amount, and a status. Some milestones depend on others, so the roof can't be paid before the walls.
2. The builder submits evidence for a milestone: a note, an itemized invoice, and photos.
3. An AI reviewer compares the photos, note, and invoice against the milestone's spec and recommends APPROVE, REWORK, or NEEDS_VERIFIER, with a confidence level and a list of issues. The AI can only record a review. It cannot approve anything or move money.
4. The payer decides: request rework (with a reason) or approve. Every decision records whether the payer agreed with the AI.
5. On approval, the money moves through a double-entry ledger. The payment is split into the builder's share (87.5%), retainage held until the house is finished (10%), and a fee (2.5%).

## The money rules

- Amounts are stored as whole cents (`amountMinor`), never as decimals.
- Percentages are in basis points (1000 = 10%). Retainage and fee are rounded down, and the builder gets the remainder, so no cent is lost to rounding.
- Every journal entry's postings must add up to zero.
- Balances are never stored. They are always summed from the postings.
- An approval writes all of its changes (two journal entries, six postings, the milestone update, and the decision) as one batch. Either everything saves or nothing does.

## Milestone statuses

```
BLOCKED -> PENDING -> EVIDENCE_SUBMITTED -> APPROVED -> RELEASED
                            ^       |
                            |       v
                        REWORK_REQUESTED
```

Every function checks the current status with `assertTransition` before changing anything, so a milestone can't skip review or be paid twice.

## Repository layout

```
domain/escrow.ts                 status rules, ledger types, the payment split, the balance check
functions/submitEvidence.ts      builder submits a note, invoice, and source
functions/createAiReview.ts      saves the AI's review (the only thing the AI can write)
functions/requestRework.ts       payer sends a milestone back with a reason
functions/approveAndRelease.ts   payer approves; checks status, dependencies, and escrow balance, then writes the ledger
```

## Status

This code was written for Palantir Foundry as part of a build challenge. The functions in `functions/` import `@ontology/sdk`, `@osdk/client`, and `@osdk/functions`, which only exist inside a Foundry environment, so they will not compile or run on their own yet. The AI reviewer itself was built in AIP Logic and is not in this repository.

`domain/escrow.ts` has no Foundry dependencies and can run anywhere.

Next steps:

- Replace the Foundry data layer with a standalone database and API.
- Give the builder their own way to submit evidence, for example through WhatsApp.
- Lock each milestone plan before it is funded.
- Add site cameras so damage or theft between visits is caught.
