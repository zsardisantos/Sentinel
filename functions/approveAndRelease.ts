//imports
import { Milestone, Posting, JournalEntries, ReviewDecisions, AiReview } from "@ontology/sdk";
import {Client, Osdk} from "@osdk/client";
import { createEditBatch, Edits } from "@osdk/functions";
import { assertTransition, assertBalanced, splitTranche, newId, nowIso, PostingDraft } from "../domain/escrow.js";

//OntologyEdit: permission list that tells TS and Foundry: this function is allowed to create, update, or delete objects of these types and no others
// in this case, we approveAndRelease needs 4 objects: Milestone (updates it to RELEASED), JournalEntries (creates 2, release + payout)
// Posting (creates 1 - payer's decision), and ReviewDecisions (creates 1 - payer's decision)
type OntologyEdit = Edits.Object<Milestone> | Edits.Object<JournalEntries> | Edits.Object<Posting> | Edits.Object<ReviewDecisions>;

//Payer approves a milestone and now the money moves. Transaction so all edits must land together orn othing passes.
//the milestone status is at EVIDENCE_SUBMITTED waiting for human decision. So payer manually approves, thus we have to first 
// assert it can move to approved and change milestone status to approved.
export default async function approveAndRelease(
    client: Client,
    milestone: Osdk.Instance<Milestone>,
    decidedBy: string,
    reason: string,
): Promise<OntologyEdit[]> {
    const batch = createEditBatch<OntologyEdit>(client);
    
    //pull three values - milestoneId, projectId, amountMinor, off the milestone (using !)
    const milestoneId = milestone.milestoneId!;
    const projectId = milestone.projectId!;
    const amountMinor = milestone.amountMinor!;

    //First check: status --> assertTransition to "APPROVED"
    assertTransition(milestone.status, "APPROVED"); //will throw if illegal

    //Second check: everything it depends on is "RELEASED"
    const dependencies = await milestone.$link.dependsOn.fetchPage({$pageSize: 100});

    //from deps.data, keep only the ones whose status is NOT "RELEASED". If there are any, throw an error that names them.
    const dependenciesNotReleased = [];
    //so loop through each dependency in the dependencies object (.data gives the list)
    for(const dependency of dependencies.data){
        // if the dependency status is not released, we want to add it to the not yet released milestone list above.
        if (dependency.status !== "RELEASED"){
            dependenciesNotReleased.push([dependency.milestoneId, dependency.title]);
        }
        
    }
    //if the list actually exists and is populated, we want to throw an error and show the user what dependencies still have yet to be released
    if (dependenciesNotReleased){
        throw new Error (`The following milestones have not yet been released ${dependenciesNotReleased}`)
    }

    // CLAUDE CHECK 3: escrow holds enough (balance = sum of ESCROW postings, never stored) ----
    // layman terms - balances are never stored, query computes it form the ledger.
    // SQL equivalent is SELECT SUM(amountMinor) FROM Posting WHERE projectId = 'PRJ-001' AND account = 'ESCROW'.
    const agg = await client(Posting)
        .where({ $and: [
            { projectId: { $eq: projectId } },
            { account: { $eq: "ESCROW" } },
        ] })
        .aggregate({ $select: { "amountMinor:sum": "unordered" } });
    const escrowMinor = agg.amountMinor.sum ?? 0; //here is escrowMinor which is the amount currently in escrow

    // Fourth Check: if escrowMinor is less than amountMinor, throw an error and put both numbers in the message
    if(escrowMinor < amountMinor){
        throw new Error(`Amount inside escrow, ${escrowMinor}, is less than amount owed for payout, ${amountMinor}.`)
    }



    

    // throws if from -> to isn't allowed. every action calls this before changing anything
    // from is string | undefined because that's how the ontology hands me milestone.status
    // export function assertTransition(
    //   from: string | undefined,
    //   to: MilestoneStatus
    // ): void {
    //   // look up the allowed next statuses. unknown or missing status -> empty list, so it fails safe
    //   const allowed = ALLOWED_TRANSITIONS[from as MilestoneStatus] ?? [];
    //   // not in the list = illegal move, stop everything
    //   if (!allowed.includes(to)) {
    //     throw new Error(`Cannot move a milestone from ${from} to ${to}`);
    //   }
    // }

}



// 