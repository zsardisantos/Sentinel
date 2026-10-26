# Prototype session (A2I2 build session, Oct 26, 2026)

Read AGENTS.md first. Zac directs the product; the coding agent implements, explains decisions before writing, and teaches from the resulting code. This session explicitly uses AI implementation for speed. Later learning sessions return to skeletons unless Zac asks otherwise. Keep Zac’s comments and connect explanations to LEARNING.md.

## Goal and evidence

Concept-test with 5 to 10 Cape Verdean diaspora customers building, renovating, buying, or maintaining homes back home. This is not a statistical A/B test. Learn what they would use, what evidence they trust, who should pay, and why.

[Armindo meeting notes](https://notes.granola.ai/t/ad5f65a6-2a4d-43cf-addb-3a0297032190-00b881l8) suggest mapping the build process and connecting people to labor, materials, and permitting guidance. They also describe quality problems. These are meeting notes, not a verbatim transcript; one conversation does not validate a product or business model.

## Current product decisions

- Next.js App Router, React, TypeScript, and Tailwind in `prototypes/`. Mobile-first, blue and dark blue, English only today. Portuguese is a later exercise.
- No database, ledger, authentication, or real requests. Providers, evidence, availability, and verification outcomes are fictional.
- Animated particle homepage with one primary action: **Find my property team**. Secondary action: **See how builder verification works**. Reliable providers are the core selling point, rather than a paid standalone stage-inspection concept. Customer screens do not use numbered option labels.
- Finding a first team and replacing an existing team share the same journey. Teams can be builders, renovation providers, or property managers. Property purchase is a goal for local viewing coordination and subsequent upkeep; the demo has no listings or purchase transactions.
- Location and home-plan drafts save only in this browser using `localStorage`. Refreshing starts at step 1 with the saved fields. No cross-device sync. Clear the draft between interviews.
- Location input accepts free text and offers local sample suggestions. No Google Maps API or address verification. Map autocomplete can be added after testing the flow.
- Builder-paid listings, customer payment, and verification methods remain hypotheses. Do not promise licensing checks or call a provider vetted without substantiating the checks.
- Original logos are in the Entrepreneur folder under “Sentinel website.” The current mark is provisional.

## Builder-search flow

Customer outcome: “I know what to do next, who can help, and why I should trust them.”

1. **Location:** type a town or neighborhood, or choose a sample suggestion. No exact address required.
2. **Confirm the search:** choose first builder or replacement builder. Both continue through the same working flow.
3. **Simple property plan:** choose new build, renovation, upkeep, or buying with upkeep. Separately choose family house, villa, or apartment and room counts. Upkeep goals include monthly, quarterly, or as-needed care. The goal and frequency save with the draft. Earlier renovation drafts migrate to the new goal field.
4. **Browse teams:** automatically filter by the requested service, then optionally filter property type and availability. Sort by name, experience, or track-record count. Counts distinguish homes completed from properties managed. Inspect example checks or open the team’s verification record. Profiles are not verified location matches.
5. **Connect:** choose a video introduction or a message, optionally add a question, and preview the request. Video can include a general time preference. No message is sent, Google Meet link created, or time booked. Full chat is deferred.

Sample team metadata lives in `app/data/builders.ts`: services offered, team type, service areas, property types, experience, track-record count and its label, languages, availability, approach, and check evidence. A real provider onboarding process must collect and verify these fields.

## Builder verification: second prototype

`/b` now demonstrates provider verification. A card links to `/b?team=...` so the record opens for that sample team.

- Online review: business and team identity, past work, independent customer references, relevant credentials, and project fit. Evidence can be reviewed, need follow-up, or remain unassessed.
- Targeted local follow-up: visit past work or resolve gaps that remote evidence cannot answer. The demo does not claim these visits happened.
- Interactive onboarding: mark four fictional evidence sections ready, then preview submitting them for human review. No documents are collected or transmitted, and submission never changes verification status.
- The operating target is about 90% of onboarding online. This is Zac’s hypothesis, not a measured result or a guarantee that every provider can be checked remotely. Public copy says digital first, local when it matters.
- The example checklist is shared across teams. A real process needs service-specific requirements, evidence sources, reviewer accountability, review dates, and refresh rules. Do not treat a builder review as verification of purchase-related or management services.

## Proposed bank partnership

- The intended payment model is bank-operated escrow. A partner bank would hold funds and execute payments under the agreed terms and required authorizations.
- Sentinel would verify providers and separately coordinate milestone evidence and human review. Reports describe completed work, gaps, and unresolved issues; they do not themselves instruct a payment.
- Owner, provider, and bank would agree scope, milestones, and release conditions. For upkeep, scope could cover visits, repairs, and reports. Existing-home purchases need a separate agreed process.
- The clickable milestone-handoff example has unresolved evidence and no payment action. It does not transmit a report or connect to a bank.
- No bank partnership, integration, account, or legal structure is established by this prototype. Existing escrow code in `domain/` and `functions/` has not been rewritten to implement this direction.

## Implementation pieces and learning

| Piece | File | Teaches |
|---|---|---|
| Landing page | `app/page.tsx`, `components/particle-field.tsx` | Server versus client components, canvas, animation cleanup |
| Journey controller | `app/a/page.tsx` | React state, conditional rendering, component composition |
| Location input | `components/location-step.tsx` | Controlled inputs, datalist suggestions, form submission |
| Property plan | `components/home-plan-step.tsx`, `data/property-goals.ts` | Separating work goals from property types, reusable controls |
| Builder carousel | `components/builder-browser.tsx` | Filtering, sorting, selection, scrolling |
| Connection preview | `components/connection-step.tsx` | Forms, radio groups, local preview |
| Saved draft | `hooks/use-build-draft.ts` | Browser storage, validation, hydration, external store subscriptions |
| Provider metadata | `data/builders.ts` | Types, unions, services and roles |
| Verification | `app/b/page.tsx`, `components/verification-preview.tsx`, `data/verification.ts` | Evidence status, human review, URL parameters, separate payment responsibility |

Files above are relative to `prototypes/app/` except the two page paths, which are relative to `prototypes/`.

## Interview plan

- Ask about a recent construction decision before showing screens: how they found help, what went wrong, and what it cost.
- Record location and build stage. Explore both discovery and verification, and alternate which is shown first by opening the relevant route directly.
- Ask what evidence would make them trust a builder or manager, what they would do next, and who should pay. No customer price is currently displayed.
- For builder search, seek an actual upcoming need and agreement to a separate manual introduction pilot.
- For verification, ask what would make them accept or reject a provider, what needs local follow-up, and what they expect the bank to do. Prototype clicks do not establish willingness to pay. Interview banks separately about escrow operations and acceptable milestone evidence.
- Follow through manually with one customer before expanding the software. Record what actually happens.

## Status and next work

- Expanded property journey and builder-verification prototype implemented. No Google Maps, bank integration, real scheduling, chat, property listings, or deployment.
- ESLint and the production build pass. Browser checks cover service-specific results for renovation, upkeep, and buying with upkeep; saved goal and care frequency; the connection brief; a team-specific verification record; local evidence; onboarding handoff; bank milestone preview; and 390-pixel mobile layouts. Earlier checks covered sorting, contact previews, and draft clearing.
- The separate backend typecheck still reports undefined names in `functions/approveAndRelease.ts` (`amountMinor`, `projectId`, `milestoneId`). That function has not been changed for the prototype.
- Next: Zac reviews the experience. Refine it, finish sample evidence, then deploy to Vercel with root directory `prototypes` and test on a physical phone. Local requirements, real provider checks, bank partnerships, costs, and willingness to pay still need validation.
