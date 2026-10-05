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

//Payer approves a milestone and now the money moves. Transaction so all edits must land together orn othing passes.
//the milestone status is at EVIDENCE_SUBMITTED waiting for human decision. So payer manually approves, thus we have to first
// assert it can move to approved and change milestone status to approved.
export default async function approveAndRelease(
  client: Client,
  milestone: Osdk.Instance<Milestone>,
  decidedBy: string,
  reason: string
): Promise<OntologyEdit[]> {
  const batch = createEditBatch<OntologyEdit>(client);

  //pull three values - milestoneId, projectId, amountMinor, off the milestone (using !)
  const milestoneId = milestone.milestoneId!;
  const projectId = milestone.projectId!;
  const amountMinor = milestone.amountMinor!;

  //First check: status --> assertTransition to "APPROVED"
  assertTransition(milestone.status, "APPROVED"); //will throw if illegal

  //Second check: everything it depends on is "RELEASED"
  const dependencies = await milestone.$link.dependsOn.fetchPage({
    $pageSize: 100,
  });

  //from deps.data, keep only the ones whose status is NOT "RELEASED". If there are any, throw an error that names them.
  const dependenciesNotReleased: Osdk.Instance<Milestone>[] = [];
  //so loop through each dependency in the dependencies object (.data gives the list)
  for (const dependency of dependencies.data) {
    // if the dependency status is not released, we want to add it to the not yet released milestone list above.
    if (dependency.status !== "RELEASED") {
      dependenciesNotReleased.push(dependency);
    }
  }
  //if the list actually exists and is populated, we want to throw an error and show the user what dependencies still have yet to be released
  if (dependenciesNotReleased.length > 0) {
    const names = dependenciesNotReleased.map((d) => `"${d.title}" (${d.status})`).join(", ");
    throw new Error(`"${milestone.title}" depends on ${names}, which must be released first.`);
}

  // CLAUDE CHECK 3: escrow holds enough (balance = sum of ESCROW postings, never stored) ----
  // layman terms - balances are never stored, query computes it form the ledger.
  // SQL equivalent is SELECT SUM(amountMinor) FROM Posting WHERE projectId = 'PRJ-001' AND account = 'ESCROW'.
  const agg = await client(Posting)
    .where({
      $and: [{ projectId: { $eq: projectId } }, { account: { $eq: "ESCROW" } }],
    })
    .aggregate({ $select: { "amountMinor:sum": "unordered" } });
  const escrowMinor = agg.amountMinor.sum ?? 0; //here is escrowMinor which is the amount currently in escrow

  // Fourth Check: if escrowMinor is less than amountMinor, throw an error and put both numbers in the message
  if (escrowMinor < amountMinor) {
    throw new Error(
      `Amount inside escrow, ${escrowMinor}, is less than amount owed for payout, ${amountMinor}.`
    );
  }

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
