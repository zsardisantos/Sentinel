// this function is the AI Review - When the AI reviewer in AIP Logic finishes looking at the evidence, it can't write anything directly. It has to call this function.
// Checks the AI's answer is valid: the recommendation is one of APPROVE / REWORK / NEEDS_VERIFIER, and the confidence is LOW / MEDIUM / HIGH. A model that goes off-script and answers "MAYBE" gets rejected.
// Creates exactly one AiReview object.

//The AI can recommend but it can't move money - this is intended! Human always is in control and responsible for moving money. 

// // TODO 1: imports
//   from "@ontology/sdk":       AiReview, EvidenceSubmissions
//   from "@osdk/client":        Client, Osdk
//   from "@osdk/functions":     createEditBatch, Edits
//   from "../domain/escrow.js": newId, nowIso

import { AiReview, EvidenceSubmissions } from "@ontology/sdk";
import { Client, Osdk } from "@osdk/client";
import { createEditBatch, Edits } from "@osdk/functions";
import { newId, nowIso} from "../domain/escrow.js";

// TODO 2: OntologyEdit: the AI may edit ONE object type only. Which one?
type OntologyEdit = Edits.Object<AiReview>;


// TODO 3: two constant lists of the only allowed values:
//   recommendations: APPROVE, REWORK, NEEDS_VERIFIER
//   confidence levels: LOW, MEDIUM, HIGH
const recommendations = ["APPROVE", "REWORK", "NEEDS_VERIFIER"];
const confidences = ["LOW", "MEDIUM", "HIGH"];

// AIP Logic calls this to record its review of one evidence submission. it can't do anything else
// TODO 4: function signature: same shape as requestRework, with the 7 parameters from the table above

    export default async function createAiReview(
        client: Client,
        evidence: Osdk.Instance<EvidenceSubmissions>,
        recommendation: string,
        confidence: string,
        issues: string,
        draftReworkMessage: string,
        model: string,
    ): Promise<OntologyEdit[]> {
        //if the recommendation from AI is not within the above list, throw new error.
        if(!recommendations.includes(recommendation)){
            throw new Error(`Please re-do the AI Review as the recommendation, ${recommendation}, does not fall within the purview of allowed recommendations: ["APPROVE", "REWORK", "NEEDS_VERIFIER"]`)
        }
        // same for confidence
        if(!confidences.includes(confidence)){
            throw new Error(`Please re-do the AI Review as the confidence rating, ${confidence}, does not fall within the purview of allowed confidence assessments: ["LOW", "MEDIUM", "HIGH"] `)
        }
        //create an empty list of planned changes
        const batch = createEditBatch<OntologyEdit>(client);
        ///create a new AIReview object with the input parameters
        batch.create(AiReview,{reviewId: newId("AIR"), evidenceId: evidence.evidenceId!, milestoneId: evidence.milestoneId!, confidence:confidence, recommendation: recommendation, issues:issues, draftReworkMessage: draftReworkMessage, model: model, createdAt:nowIso()});
        //return the list of edits
        return batch.getEdits();
    }

