// this schema.ts file is where I define all 9 tables.
// 1. projects
// 2. milestones (foreign key - project.id)
// 3. milestoneDependencies (foreign key - milestoneID)
// 4. evidenceSubmissions (foreignkeys - milestoneID)
// 5. aiReviews (foreign key - evidenceSubmissionID)
// 6. reviewDecisions (foreign keys - milestone ID, aiReviewID)
// 7. journalEntries(milestoneID)
// 8. postings
// 9. completedApprovals

import { pgTable, text, bigint, boolean, timestamp, primaryKey } from "drizzle-orm/pg-core";
import type {MilestoneStatus, Account} from "../domain/escrow.js";

//creating the projects datatable
export const projects = pgTable("projects", {
    projectId: text("project_id").primaryKey(),
    title: text("title").notNull(),
});

// one row per stage of the build (foundation, walls, roof)
export const milestones = pgTable("milestones", {
    milestoneId: text("milestone_id").primaryKey(),
    projectId: text("project_id").notNull().references(() => projects.projectId),
    title: text("title").notNull(),
    status: text("status").$type<MilestoneStatus>().notNull(),
    amountMinor: bigint("amount_minor", { mode: "number" }).notNull(),
    // empty until the milestone is paid
    payoutStatus: text("payout_status"),
    // no .references() here: journalEntries points back at milestones, so a foreign key both ways
    // would be a chicken-and-egg problem. this link is kept by the code, not the database.
    releaseEntryId: text("release_entry_id"),
});

// join table: one row per "milestoneId depends on dependsOnId"
export const milestoneDependencies = pgTable(
    "milestone_dependencies",
    {
        milestoneId: text("milestone_id").notNull().references(() => milestones.milestoneId),
        dependsOnId: text("depends_on_id").notNull().references(() => milestones.milestoneId),
    },
    // the pair is the primary key, so the same dependency can't be stored twice
    (t) => [primaryKey({ columns: [t.milestoneId, t.dependsOnId] })]
);

// the header of one ledger entry. its lines live in postings
export const journalEntries = pgTable("journal_entries", {
    entryId: text("entry_id").primaryKey(),
    projectId: text("project_id").notNull().references(() => projects.projectId),
    // optional: a FUNDING entry has no milestone
    milestoneId: text("milestone_id").references(() => milestones.milestoneId),
    memo: text("memo").notNull(),
    at: timestamp("at", { withTimezone: true, mode: "string" }).notNull(),
});

// one line of a journal entry. balances are summed from these, never stored
export const postings = pgTable("postings", {
    postingId: text("posting_id").primaryKey(),
    entryId: text("entry_id").notNull().references(() => journalEntries.entryId),
    // copied from the entry so the escrow balance query doesn't need a join
    projectId: text("project_id").notNull().references(() => projects.projectId),
    account: text("account").$type<Account>().notNull(),
    amountMinor: bigint("amount_minor", { mode: "number" }).notNull(),
});

// the builder's proof of work for a milestone
export const evidenceSubmissions = pgTable("evidence_submissions", {
    evidenceId: text("evidence_id").primaryKey(),
    milestoneId: text("milestone_id").notNull().references(() => milestones.milestoneId),
    submittedBy: text("submitted_by").notNull(),
    note: text("note").notNull(),
    invoiceLines: text("invoice_lines").notNull(),
    source: text("source").notNull(),
    submittedAt: timestamp("submitted_at", { withTimezone: true, mode: "string" }).notNull(),
});

// the AI's recommendation. the only table the AI path may write to
export const aiReviews = pgTable("ai_reviews", {
    reviewId: text("review_id").primaryKey(),
    evidenceId: text("evidence_id").notNull().references(() => evidenceSubmissions.evidenceId),
    milestoneId: text("milestone_id").notNull().references(() => milestones.milestoneId),
    recommendation: text("recommendation").notNull(),
    confidence: text("confidence").notNull(),
    issues: text("issues").notNull(),
    draftReworkMessage: text("draft_rework_message").notNull(),
    model: text("model").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }).notNull(),
});

// the payer's decision: APPROVED or REWORK
export const reviewDecisions = pgTable("review_decisions", {
    decisionId: text("decision_id").primaryKey(),
    milestoneId: text("milestone_id").notNull().references(() => milestones.milestoneId),
    // optional: the AI may never have reviewed this milestone. null, not ""
    aiReviewId: text("ai_review_id").references(() => aiReviews.reviewId),
    decidedBy: text("decided_by").notNull(),
    decision: text("decision").notNull(),
    // optional: blank when there was no AI review to agree with
    agreedWithAi: boolean("agreed_with_ai"),
    reason: text("reason").notNull(),
    decidedAt: timestamp("decided_at", { withTimezone: true, mode: "string" }).notNull(),
});

// one row per successful approval. requestId as the primary key is the unique constraint
// that stops the same approval from paying twice, even when two copies run at once
export const completedApprovals = pgTable("completed_approvals", {
    requestId: text("request_id").primaryKey(),
    milestoneId: text("milestone_id").notNull().references(() => milestones.milestoneId),
    releaseEntryId: text("release_entry_id").notNull().references(() => journalEntries.entryId),
});
