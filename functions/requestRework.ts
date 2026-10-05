// "This function, requestRework, is the payer taking an action to request rework (via clicking a button in Foundry)";

//Imports
//importing object types from my ontology - ontlogy/sdk
import { Milestone } from "@ontology/sdk";
import { ReviewDecisions } from "@ontology/sdk";
import { AiReview } from "@ontology/sdk";

//importing client = my connectio to the ontology
import { Client } from "@osdk/client";
import { Osdk } from "@osdk/client";

//importing tools for building a list of edits that foundry applies all at once
import { createEditBatch } from "@osdk/functions";
import { Edits } from "@osdk/functions";

//importing my own rules from escrow.ts rulebook.
import { assertTransition } from "../domain/escrow.js";
import { newId } from "../domain/escrow.js";
import { nowIso } from "../domain/escrow.js";

//Step 1: Instantiating the two objects types that requesting rework changes
//Edits.Object<X> works at the object-type level. It says "this function may create, update or delete objects of type X. So I list types, never individual propertties"
export type OntologyEdit =
  Edits.Object<Milestone> | Edits.Object<ReviewDecisions>;

export default async function requestRework(
  client: Client,
  milestone: Osdk.Instance<Milestone>,
  decidedBy: string,
  reason: string
): Promise<OntologyEdit[]> {
  //empty list of edits. nothing is saved until foundry applies it.
  const batch = createEditBatch<OntologyEdit>(client);

  // milestoneId is the primary key so it always exists.
  //! forces the attribute to always be defined
  const milestoneId = milestone.milestoneId!;

  //rule check: only EVIDENCE_SUBMITTED can go to REWORK_REQUESTED. thrwos otherwise.
  assertTransition(milestone.status, "REWORK_REQUESTED");

  // the payer has to say why and give ar eason for the reqeust otherwise the builder won't know what to fix
  if (!reason.trim()) {
    throw new Error("Please tell the builder what needs to be redone!");
  }

  //get the newest AI review for this milestone if it exists

  const reviews = await client(AiReview) // await is used in this asynch function. it waits until the data arrives. //client(AiReview) is connecting to Foundry and searching for AiReview object
    .where({ milestoneId: { $eq: milestoneId } }) //where the ID of this object's milestone is equal to the milestoneID of said milestone we're currently focused on
    .fetchPage({ $orderBy: { createdAt: "desc" }, $pageSize: 1 }); //fetching the most recent AI review descending order timewise
  const latestReview = reviews.data[0]; //most recent AI review. reviews.data holds at most 1 review.

  //now we set the boolean if payer agreed with the AI review or not
  const agreedWithAI = latestReview
    ? latestReview.recommendation !== "APPROVE"
    : undefined;

  //record the payer's decision as its own object
  batch.create(ReviewDecisions, {
    decisionId: newId("RD"),
    milestoneId: milestoneId,
    aiReviewId: latestReview?.reviewId ?? "",
    decidedBy: decidedBy,
    decision: "REWORK",
    agreedWithAi: agreedWithAI,
    reason: reason,
    decidedAt: nowIso(),
  });

  //move the milestone back to the builder
  batch.update(milestone, { status: "REWORK_REQUESTED" });

  //hand the list of edits to foundry
  return batch.getEdits();
}
