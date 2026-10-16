CREATE TABLE "ai_reviews" (
	"review_id" text PRIMARY KEY NOT NULL,
	"evidence_id" text NOT NULL,
	"milestone_id" text NOT NULL,
	"recommendation" text NOT NULL,
	"confidence" text NOT NULL,
	"issues" text NOT NULL,
	"draft_rework_message" text NOT NULL,
	"model" text NOT NULL,
	"created_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "completed_approvals" (
	"request_id" text PRIMARY KEY NOT NULL,
	"milestone_id" text NOT NULL,
	"release_entry_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "evidence_submissions" (
	"evidence_id" text PRIMARY KEY NOT NULL,
	"milestone_id" text NOT NULL,
	"submitted_by" text NOT NULL,
	"note" text NOT NULL,
	"invoice_lines" text NOT NULL,
	"source" text NOT NULL,
	"submitted_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "journal_entries" (
	"entry_id" text PRIMARY KEY NOT NULL,
	"project_id" text NOT NULL,
	"milestone_id" text,
	"memo" text NOT NULL,
	"at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "milestone_dependencies" (
	"milestone_id" text NOT NULL,
	"depends_on_id" text NOT NULL,
	CONSTRAINT "milestone_dependencies_milestone_id_depends_on_id_pk" PRIMARY KEY("milestone_id","depends_on_id")
);
--> statement-breakpoint
CREATE TABLE "milestones" (
	"milestone_id" text PRIMARY KEY NOT NULL,
	"project_id" text NOT NULL,
	"title" text NOT NULL,
	"status" text NOT NULL,
	"amount_minor" bigint NOT NULL,
	"payout_status" text,
	"release_entry_id" text
);
--> statement-breakpoint
CREATE TABLE "postings" (
	"posting_id" text PRIMARY KEY NOT NULL,
	"entry_id" text NOT NULL,
	"project_id" text NOT NULL,
	"account" text NOT NULL,
	"amount_minor" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"project_id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "review_decisions" (
	"decision_id" text PRIMARY KEY NOT NULL,
	"milestone_id" text NOT NULL,
	"ai_review_id" text,
	"decided_by" text NOT NULL,
	"decision" text NOT NULL,
	"agreed_with_ai" boolean,
	"reason" text NOT NULL,
	"decided_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
ALTER TABLE "ai_reviews" ADD CONSTRAINT "ai_reviews_evidence_id_evidence_submissions_evidence_id_fk" FOREIGN KEY ("evidence_id") REFERENCES "public"."evidence_submissions"("evidence_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_reviews" ADD CONSTRAINT "ai_reviews_milestone_id_milestones_milestone_id_fk" FOREIGN KEY ("milestone_id") REFERENCES "public"."milestones"("milestone_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "completed_approvals" ADD CONSTRAINT "completed_approvals_milestone_id_milestones_milestone_id_fk" FOREIGN KEY ("milestone_id") REFERENCES "public"."milestones"("milestone_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "completed_approvals" ADD CONSTRAINT "completed_approvals_release_entry_id_journal_entries_entry_id_fk" FOREIGN KEY ("release_entry_id") REFERENCES "public"."journal_entries"("entry_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "evidence_submissions" ADD CONSTRAINT "evidence_submissions_milestone_id_milestones_milestone_id_fk" FOREIGN KEY ("milestone_id") REFERENCES "public"."milestones"("milestone_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "journal_entries" ADD CONSTRAINT "journal_entries_project_id_projects_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("project_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "journal_entries" ADD CONSTRAINT "journal_entries_milestone_id_milestones_milestone_id_fk" FOREIGN KEY ("milestone_id") REFERENCES "public"."milestones"("milestone_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "milestone_dependencies" ADD CONSTRAINT "milestone_dependencies_milestone_id_milestones_milestone_id_fk" FOREIGN KEY ("milestone_id") REFERENCES "public"."milestones"("milestone_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "milestone_dependencies" ADD CONSTRAINT "milestone_dependencies_depends_on_id_milestones_milestone_id_fk" FOREIGN KEY ("depends_on_id") REFERENCES "public"."milestones"("milestone_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "milestones" ADD CONSTRAINT "milestones_project_id_projects_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("project_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "postings" ADD CONSTRAINT "postings_entry_id_journal_entries_entry_id_fk" FOREIGN KEY ("entry_id") REFERENCES "public"."journal_entries"("entry_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "postings" ADD CONSTRAINT "postings_project_id_projects_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("project_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review_decisions" ADD CONSTRAINT "review_decisions_milestone_id_milestones_milestone_id_fk" FOREIGN KEY ("milestone_id") REFERENCES "public"."milestones"("milestone_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review_decisions" ADD CONSTRAINT "review_decisions_ai_review_id_ai_reviews_review_id_fk" FOREIGN KEY ("ai_review_id") REFERENCES "public"."ai_reviews"("review_id") ON DELETE no action ON UPDATE no action;