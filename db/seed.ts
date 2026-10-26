// TODO 1: imports
//   db from "./client.js"
//   projects, milestones, milestoneDependencies, journalEntries, postings from "./schema.js"
//   newId, nowIso, assertBalanced, and the type PostingDraft from "../domain/escrow.js"

import {db} from "./client.js";
import{projects,milestones,milestoneDependencies,journalEntries,postings} from "./schema.js";
import{newId,nowIso,assertBalanced, PostingDraft} from "../domain/escrow.js";


// TODO 2: make the IDs you'll reuse: one project, three milestones, one funding entry
//   (const + newId with prefixes like "PRJ", "MS", "JE")

const projectID = newId("PRJ");
const milestoneOneID = newId("MS");
const milestoneTwoID = newId("MS");
const milestoneThreeID = newId("MS");
const fundingEntryID = newId("JE");

// TODO 3: insert the project
//inserting a row in db TS -> await db.insert(projects).values({projectId: "", title: ""});

await db.insert(projects).values({projectId: projectID, title: "TestProject"});

// TODO 4: insert the 3 milestones in one .values([...]) call
//   amounts in cents: 1_500_000, 2_500_000, 2_000_000
//   statuses: PENDING, BLOCKED, BLOCKED

await db.insert(milestones).values([{
    milestoneId: milestoneOneID, 
    projectId: projectID,
    title:"Foundation",
    status:"PENDING",
    amountMinor: 1_500_000
},
{   milestoneId: milestoneTwoID,
    projectId: projectID,
    title:"Walls",
    status:"BLOCKED",
    amountMinor:2_500_000
},
{   milestoneId: milestoneThreeID,
    projectId: projectID,
    title:"Roof",
    status:"BLOCKED",
    amountMinor: 2_000_000
}]);

// TODO 5: insert the 2 dependencies: walls depends on foundation, roof depends on walls

// export const milestoneDependencies = pgTable(
//     "milestone_dependencies",
//     {
//         milestoneId: text("milestone_id").notNull().references(() => milestones.milestoneId),
//         dependsOnId: text("depends_on_id").notNull().references(() => milestones.milestoneId),
//     },
//     (t) => [primaryKey({ columns: [t.milestoneId, t.dependsOnId] })]
// );

await db.insert(milestoneDependencies).values([{
    milestoneId: milestoneTwoID,
    dependsOnId: milestoneOneID

},
{   milestoneId: milestoneThreeID,
    dependsOnId: milestoneTwoID
}]);

// TODO 6: build the funding postings as a PostingDraft[]:
//   FUNDING -6_000_000, ESCROW +6_000_000
//   then call assertBalanced on them (AGENTS.md rule: before any journal entry is written)

// export interface PostingDraft {
// account: Account;
// amountMinor: number;}

const fundingPostings: PostingDraft[] = [{
    account: "FUNDING",
    amountMinor: -6_000_000 },
    
    {account: "ESCROW",
        amountMinor: 6_000_000
    }];


// TODO 7: insert the funding journal entry (no milestoneId: funding belongs to the project)
//journal entry is like a receipt. The header says what happened and when. i.e. $60,000 deposited into escrow, October 18.
// the lines/postings say which accounts the momey moved between

//each posting's entry_id must point at a journal entry that already exists. 

//so the $60k deposited into escrow has two postings. header holds what is shared.


// TODO 8: insert the 2 postings, using `${entryId}-P1` style IDs like approveAndRelease

// TODO 9: print a summary with console.log (project ID, milestone IDs)

// TODO 10: close the pool