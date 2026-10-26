// ---- approveAndRelease.ts FUNCTION: It runs when the payer taps "approve" on a milestone. That milestone is in EVIDENCE_SUBMITTED, meaning the builder
// has uploaded proof of work. It runs in three phases:
// Phase A: Checks: 
// 1. Status Check: assertTransition confirms that moving to APPROVED is allowed from the current status.
// 2. Dependency check: every milestone this one depends on must already be RELEASED. One can't pay for the roof before the foundation is paid. 
// 3. Escrow check: It sums the project's ESCROW postings to get the balance (never stored always computed) and confirms there's enough to cover amountMinor.

//Phase B: Building the money movement
// 1. SplitTranche: splits the amount into retainage, fee, and builder payout
// 2. Release entry: money leaves escrow (-) and goes into three buckets: builder payable, retainage, and fees (+). The total must be summed to zero.
// 3. Payout entry: builder payable (-) moves to paid out (+). This is the simulated bank transfer. 
// assertBalanced checks each entry before anything is queued. 

// Phase C: Queing the writes: It queues 2 journal entries, 6 postings, the milestone update to RELEASED/SETLED with an audit link releaseEntryId, and a ReviewDecisions record that notes whetehr the p[ayer agreed with the AI.


//imports
import {
  Milestone,
  Posting,
  JournalEntries,
  ReviewDecisions,
  AiReview,
} from "@ontology/sdk";
import { Client, Osdk } from "@osdk/client";
import { createEditBatch, Edits } from "@osdk/functions";
import {
  assertTransition,
  assertBalanced,
  splitTranche,
  newId,
  nowIso,
  PostingDraft,
} from "../domain/escrow.js";

//OntologyEdit: permission list that tells TS and Foundry: this function is allowed to create, update, or delete objects of these types and no others
// in this case, we approveAndRelease needs 4 objects: Milestone (updates it to RELEASED), JournalEntries (creates 2, release + payout)
// Posting  - payer's decision, and ReviewDecisions 
type OntologyEdit =
  | Edits.Object<Milestone>
  | Edits.Object<JournalEntries>
  | Edits.Object<Posting>
  | Edits.Object<ReviewDecisions>;

// ---- THE FUNCTION: Approving milestones and sending associated payment to the builder. ----

//Payer approves a milestone and now the money moves. Transaction so all edits must land together orn othing passes.
//the milestone status is at EVIDENCE_SUBMITTED waiting for human decision. So payer manually approves, thus we have to first
// assert it can move to approved and change milestone status to approved.
export default async function approveAndRelease(
  client: Client,
  milestone: Osdk.Instance<Milestone>,
  decidedBy: string,
  reason: string,
  requestId: string            // TODO 1: new parameter (see below)
): Promise<OntologyEdit[]> {
  const batch = createEditBatch<OntologyEdit>(client);
  // ... milestoneId, projectId, amountMinor as before ...

  // TODO 2: Fetch the saved approvals for this requestId.
  // TODO 3: Call findCompletedApproval(saved, requestId, milestoneId).
  // TODO 4: If it found one, return [] early. Nothing new to write.

  assertTransition(milestone.status, "APPROVED"); // unchanged
  // ... dependency check, escrow check, ledger, decision, all unchanged ...

  // TODO 5: Before `return batch.getEdits()`, add a batch.create(...) that
  //         saves { requestId, milestoneId, releaseEntryId: releaseId }.


// What each TODO does:
// 1. TODO 1: Add the request ID that the app sends. Also add findCompletedApproval to the import list from ../domain/escrow.js at the top.
// 2. TODO 2: Read the saved approvals. Use the same pattern as the AiReview fetch on lines 182 to 184: client(SomeType).where({ requestId: { $eq: requestId } }).fetchPage(...). Then .data gives you the array.
// 3. TODO 3: Pass that array to your Part G function and store the result in a const.
// 4. TODO 4: This is an early return, which is new syntax for you:
// if (existing !== undefined) {
//   return [];   // leaves the function right here; nothing below runs
// }
// 5. TODO 5: This creates the record that TODO 2 will find on the next retry. Use batch.create(...), like the ReviewDecisions one on line 192.


  // ---- THE MONEY: split the payment and build the two journal entries ----
  // TODO 7: call splitTranche(amountMinor) and pull out retainageMinor, feeMinor, netMinor
  //         also: const at = nowIso();   one timestamp for everything in this approval
  const split = splitTranche(amountMinor);
  const retainageMinor = split.retainageMinor;
  const feeMinor = split.feeMinor;
  const netMinor = split.netMinor;
  const at = nowIso();

  // release = bookkeeping. money leaves escrow into the three buckets --> record of payment
  const releaseId = newId("JE"); //the id will begin with letters JE then randomly generated numbers and chars

  //for this posting - payer approves and releases - money will
  // 1. leave escrow, so it's negative
  // 2. enter the builder payable, so it's positive
  // 3. enter the retainage, so it's positive
  // 4. enter the fees, so it's positive
  const releasePostings: PostingDraft[] = [
    { account: "ESCROW", amountMinor: -amountMinor },
    { account: "BUILDER_PAYABLE", amountMinor: netMinor },
    { account: "RETAINAGE", amountMinor: retainageMinor },
    { account: "FEES", amountMinor: feeMinor },
  ];

  //then we have to check if all amountMinor entries in this "table" sum to 0 AKA are balanced.
  assertBalanced(releasePostings);

  // payout = the builder's share actually leaves (simulated bank transfer)
  // an account has 6 different fields export type Account =
  //   "FUNDING" | "ESCROW" | "BUILDER_PAYABLE" | "RETAINAGE" | "FEES" | "PAID_OUT";
  //first create a new JE detailing the actual payout
  const payoutId = newId("JE");

  // so here we are editing the builder pauable and paid out fields
  const payoutPostings: PostingDraft[] = [
    { account: "BUILDER_PAYABLE", amountMinor: -netMinor }, //IOU, so negative. Remember, the netMinor is the amount actually paid out to the builder.
    { account: "PAID_OUT", amountMinor: netMinor }, //Credit, so positive.
  ];

  // then we check if the payout is balanced.
  assertBalanced(payoutPostings);

  // ---- WRITE IT: queue the entries and their postings ----
  // TODO 10: for EACH of the two entries:
  //          batch.create(JournalEntries, { entryId, projectId, milestoneId, memo, at })
  //          then batch.create(Posting, { postingId, entryId, projectId, account, amountMinor })
  //          once per line, with postingId like `${releaseId}-P1`, `${releaseId}-P2`, ...

  batch.create(JournalEntries, {
    entryId: releaseId,
    projectId: projectId,
    milestoneId: milestoneId,
    memo: `Release for "${milestone.title}"`,
    at: at
  });

  batch.create(JournalEntries, {
    entryId: payoutId,
    projectId: projectId,
    milestoneId: milestoneId,
    memo: `Payout for "${milestone.title} (simulated)"`,
    at: at,
  });

  // one Posting per release line. i starts at 0, so ids end -P1 to -P4
  releasePostings.forEach((line, i) => {
    batch.create(Posting, {
      postingId: `${releaseId}-P${i + 1}`,
      entryId: releaseId,
      projectId: projectId,
      account: line.account,
      amountMinor: line.amountMinor,
    });
  });

  // one Posting per payout line: -P1 and -P2
  payoutPostings.forEach((line, i) => {
    batch.create(Posting, {
      postingId: `${payoutId}-P${i + 1}`,
      entryId: payoutId,
      projectId: projectId,
      account: line.account,
      amountMinor: line.amountMinor,
    });
  });

  // ---- MARK IT PAID ----
  // releaseEntryId = audit trail from the milestone to the ledger entry that paid it
  batch.update(milestone, {
    status: "RELEASED",
    payoutStatus: "SETTLED",
    releaseEntryId: releaseId,
  });

  // ---- THE DECISION RECORD: payer's decision + whether they agreed with the AI ----
  const reviews = await client(AiReview)
    .where({ milestoneId: { $eq: milestoneId } })
    .fetchPage({ $orderBy: { createdAt: "desc" }, $pageSize: 1 });
  const latestReview = reviews.data[0]; // undefined if the AI never reviewed it

  // payer approved, so she agreed only if the AI also said APPROVE. no review = blank
  const agreedWithAI = latestReview
    ? latestReview.recommendation === "APPROVE"
    : undefined;

  batch.create(ReviewDecisions, {
    decisionId: newId("RD"),
    milestoneId: milestoneId,
    aiReviewId: latestReview?.reviewId ?? "",
    decidedBy: decidedBy,
    decision: "APPROVED",
    agreedWithAi: agreedWithAI,
    reason: reason,
    decidedAt: at,
  });

  // hand the full list of edits to foundry
  return batch.getEdits();
}
