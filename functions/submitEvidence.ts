// This is the builder's button. The builder will send new proof of work (note and invoice) for am ilestone.
// Function records it as a new EvidenceSUbmissions object and moves the milestone to EVIDENCE_SUBMITTED so the payer and AI can review it.

import { EvidenceSubmissions, Milestone } from "@ontology/sdk";
import { Client, Osdk } from "@osdk/client";
import { createEditBatch, Edits } from "@osdk/functions";
import { assertTransition, newId, nowIso } from "../domain/escrow.js";

// TODO 2: OntologyEdit: this function edits 2 types: Milestone (status) and EvidenceSubmissions (new record)
type OntologyEdit = Edits.Object<Milestone> | Edits.Object<EvidenceSubmissions>;

// TODO 3: the only allowed evidence sources: WHATSAPP, EMAIL, CAMERA (a const list, like createAiReview)
const evidenceSources = ["WHATSAPP", "EMAIL", "CAMERA"];

// the builder submits proof of work for a milestone. records the evidence and hands it to review
export default async function submitEvidence(
    client: Client,
    milestone: Osdk.Instance<Milestone>,
    submittedBy: string,
    note: string,
    invoiceLines: string,
    source: string,
): Promise<OntologyEdit[]>{
    // ---- CHECK 1: can this milestone take evidence? ----
    // TODO 4: assertTransition to "EVIDENCE_SUBMITTED"
    // only PENDING (first time) or REWORK_REQUESTED (resubmission) can move to EVIDENCE_SUBMITTED
    //in order to check this I must use the assertTransitions function and check if the current milestone status can move to Evidence submitted - in the ALLOWED TRANSITIONS list
    assertTransition(milestone.status, "EVIDENCE_SUBMITTED");

    // ---- CHECK 2: is the source allowed? ----
    // TODO 5: if source isn't in your list, throw (same pattern as createAiReview)
    if (!evidenceSources.includes(source)){
        throw new Error (`Evidence source, ${source}, not accepted. Please refer to the valid sources, ${evidenceSources}, to see what evidence is accepted.`);
    }

    // ---- CHECK 3: is the invoice valid JSON? (optional, see the example below) ----
    // TODO 6
    //JSOn.parse turns JSON text into real data and it throws if ther text isn't valid JSON. try/catch.
    try {
        const parsed = JSON.parse(invoiceLines);
        if(!Array.isArray(parsed)){
            throw new Error();
        }
    } catch {
        throw new Error("The invoice must be a JSON list!");
    }

    // ---- WRITE IT ----
    // TODO 7: create the batch, then batch.create(EvidenceSubmissions, {...}) with 7 properties:
    //   evidenceId (newId "EV"), milestoneId (off the milestone, with !), submittedBy, note,
    //   invoiceLines, source, submittedAt (nowIso)

    const batch = createEditBatch<OntologyEdit>(client);
    batch.create(EvidenceSubmissions, {
        evidenceId: newId("EV"), 
        milestoneId: milestone.milestoneId!,
        submittedBy: submittedBy,
        note: note,
        invoiceLines: invoiceLines,
        source: source,
        submittedAt: nowIso(),
    })

    // TODO 8: batch.update the milestone: status "EVIDENCE_SUBMITTED"
    batch.update(milestone, {status: "EVIDENCE_SUBMITTED"});
    
    // TODO 9: return the edits
    return batch.getEdits();


}



