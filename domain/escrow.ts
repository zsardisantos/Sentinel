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
