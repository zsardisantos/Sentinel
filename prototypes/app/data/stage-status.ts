// Stage status for the builder demo. This mirrors ALLOWED_TRANSITIONS in domain/escrow.ts.
// It is a copy, not an import, because domain/escrow.ts uses node:crypto, which does not run in the browser.
// A real version would share one module between the server and the screens.

export const stageStatuses = [
  "scheduled",
  "funded",
  "submitted",
  "under_review",
  "rework_requested",
  "approved",
  "released",
] as const;

export type StageStatus = (typeof stageStatuses)[number];

// Key = current status, value = where it may go next.
// Who moves each step: the bank funds and releases, the builder submits, a human reviewer decides.
export const stageTransitions: Record<StageStatus, readonly StageStatus[]> = {
  scheduled: ["funded"], // bank confirms the stage money is held
  funded: ["submitted"], // builder sends evidence
  submitted: ["under_review"], // stage enters Sentinel's review queue
  under_review: ["approved", "rework_requested"], // human reviewer decides (Piece 2)
  rework_requested: ["submitted"], // builder fixes and resubmits
  approved: ["released"], // only the partner bank releases money
  released: [],
};

export function assertStageTransition(from: StageStatus, to: StageStatus): void {
  if (!stageTransitions[from].includes(to)) {
    throw new Error(`Cannot move a stage from ${from} to ${to}`);
  }
}

export function isStageStatus(value: unknown): value is StageStatus {
  return stageStatuses.includes(value as StageStatus);
}
