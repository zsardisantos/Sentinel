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
