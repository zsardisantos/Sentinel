//node's built-in random id generator, used by newId below
import { randomUUID } from "node:crypto";

//every status a milestone can be in. union type, so a typo like "APROVED" won't compile
export type MilestoneStatus =
  | "BLOCKED"
  | "PENDING"
  | "EVIDENCE_SUBMITTED"
  | "REWORK_REQUESTED"
  | "APPROVED"
  | "RELEASED";

//the state machine. key = current status, value = the statuses it's allowed to move to
// Record forces me to list every status, readonly means nobody can push to these lists later
export const ALLOWED_TRANSITIONS: Record<
  MilestoneStatus,
  readonly MilestoneStatus[]
> = {
  BLOCKED: ["PENDING"], // unlocks once its dependencies are released
  PENDING: ["EVIDENCE_SUBMITTED"], // builder sends photos + invoice
  EVIDENCE_SUBMITTED: ["APPROVED", "REWORK_REQUESTED"], // payuer decides
  REWORK_REQUESTED: ["EVIDENCE_SUBMITTED"], // builder fixes it and resubmits
  APPROVED: ["RELEASED"], // money moves to the builder
  RELEASED: [], // final, nothing comes after
};

// throws if from -> to isn't allowed. every action calls this before changing anything
// from is string | undefined because that's how the ontology hands me milestone.status
export function assertTransition(
  from: string | undefined,
  to: MilestoneStatus
): void {
  // look up the allowed next statuses. unknown or missing status -> empty list, so it fails safe
  const allowed = ALLOWED_TRANSITIONS[from as MilestoneStatus] ?? [];
  // not in the list = illegal move, stop everything
  if (!allowed.includes(to)) {
    throw new Error(`Cannot move a milestone from ${from} to ${to}`);
  }
}

// current time as text, since my date properties are String in the ontology
export function nowIso(): string {
  return new Date().toISOString();
}

// unique id with a readable prefix, e.g. newId("DEC") -> "DEC-3f9a2c1e-..."
export function newId(prefix: string): string {
  return `${prefix}-${randomUUID()}`;
}

//Part A: six account names as a union type just like MilestoneStatus. What goes on the journal entries / ledger.
export type Account =
  "FUNDING" | "ESCROW" | "BUILDER_PAYABLE" | "RETAINAGE" | "FEES" | "PAID_OUT";

//Part B: percentages in basis points. 1 basis point is 0.01% so 100% = 10000. Retainage is 10% would be 100/10 --> 1000. Sentinel fee is 2.5% so 100 * 2.5 = 250.
export const RETAINAGE_BPS = 1000;
export const FEE_BPS = 250;

//Part C: one line of a journal entry before it's saved. Has an account and the amount to be paid.
export interface PostingDraft {
  account: Account;
  amountMinor: number;
}

//Part D: split one milestone payment three ways. TRANCHE. When escrow releases payment it gets split 3 ways. Retainage (10% held back until whole house is finished). Fee (2.5%). Net (rest goes to the builder).
//cents can't be split cleanly into half percentages, so need to round. Round down the two small parts and give the builder whatever is left.

export function splitTranche(amountMinor: number): {
  retainageMinor: number;
  feeMinor: number;
  netMinor: number;
} {
  //throw if amountMinor is not a whole number or negative
  if (amountMinor < 0 || !Number.isInteger(amountMinor)) {
    throw new Error(
      `The payment must be positive and greater than zero. ${amountMinor} is not a valid payment amount.`
    );
  }

  //const retainageMinor is amountMinor x retainage BPS divided by 10000, rounded down
  const retainageMinor = Math.floor(amountMinor * (RETAINAGE_BPS / 10000));

  //const feeMinor is same idea w/ fee BPS
  const feeMinor = Math.floor(amountMinor * (FEE_BPS / 10000));

  const netMinor = amountMinor - retainageMinor - feeMinor;

  // return all three values
  return { retainageMinor, feeMinor, netMinor };
}

//PART E: make rule that eveyr journal entry sums to zero
export function assertBalanced(postings: PostingDraft[]): void {
  //throw if postings has fewer than 2 items
  if (postings.length < 2) {
    throw new Error(
      `Posting must have more than two accounts affected by this transaction.`
    );
  }

  //add up eveyr posting's amountMinor through a for loop - total.
  let total = 0;
  for (const posting of postings) {
    total += posting.amountMinor;
  }

  if (total !== 0) {
    throw new Error(`Amount must add to 0. The current total is ${total}`);
  }
}

//PART F: Building an ACID rule for escrow calculations given two requests made on milestones - i.e. request A approves milestone 1 stage 2, pays out escrow, then request B works on milestone 1 stage 3 but has to recalculate escrow as it has now changed!


// The function receives freshly fetched postings and a project ID. 
// It adds only that project’s `ESCROW` postings and returns the total in cents. The transaction and locks belong to the calling code.

// Here’s your skeleton, using the existing `PostingDraft` type from `domain/escrow.ts`:

//draft: one line of a journal entry before it's saved. Has an account and the amount to be paid.
// export interface PostingDraft {
//   account: Account;
//   amountMinor: number;
// }

//interface is a check that helps TypeScript check the types of objects at runtime (compiled)
export interface ProjectPosting extends PostingDraft {
  projectId: string
}

//calculateEscrowBalance sums the escrow postings belonging to a certain project to calculate the total amount in escrow.
export function calculateEscrowBalance(
  postings: readonly ProjectPosting[],
  projectId: string //separate projectId parameter tells the function which project's balance you want.
): number{
   // TODO 1: Create a running total starting at zero.
  let runningTotal = 0; // let declares a local variable whose value can change. 
  // TODO 2: Loop through the postings.
  //loops in Typescript:
  //1. Iterating over Arrays or Collections --> for(const iterator of iterableList){}
  for(const posting of postings){
    //  TODO 3: For each posting, check that its projectId matches
// and its account is "ESCROW".
    if (posting.projectId === projectId && posting.account == "ESCROW"){
      // TODO 4: Add each matching posting's amountMinor to the total.
      runningTotal+=posting.amountMinor;
    }

    //   

}
return runningTotal;
}

//PART G. Recognize a retry by finding its saved approval result. Searching an array and returning either an object or undefined. 
//architectural decision: we only store successful approvals.

//these are the completed approvals we save in the followign schema. its request ID (Idempotency key), its relevant milestone, and its entryID in journal entries
export interface CompletedApproval{
  requestId: string;
  milestoneId: string;
  releaseEntryId: string;
}

//function to find the completed approvals regarding a specific milestone and requestID (every single milestone status change has an associated request ID)

export function findCompletedApproval(
  approvals: readonly CompletedApproval[],
  requestId: string,
  milestoneId: string
): CompletedApproval | undefined {
//   // TODO 1: Loop through the saved approvals.
for(const approval of approvals){
  //   // TODO 2: Find an approval whose requestId matches.
//   // Skip records with other request IDs.
  if (approval.requestId === requestId){
    //   // TODO 3: If that record's milestoneId differs, throw an error.
    if(approval.milestoneId !== milestoneId){
      throw new Error (`The expected Milestone for this request type, ${milestoneId}, is different than the actual milestone this request is being performed on, ${approval.milestoneId}. Please ensure you are working on the correct milestone!`)
    }
//   // The same key cannot represent approval of a different milestone.

//   // TODO 4: Return the matching record.
  return approval;

  }

  }
  return undefined;
}

