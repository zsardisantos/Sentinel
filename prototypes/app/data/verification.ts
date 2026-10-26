export type VerificationCheck = {
  title: string;
  status: "Reviewed" | "Follow-up needed" | "Not assessed";
  evidence: string;
  limitation: string;
};

// These statuses describe a fictional review. They do not verify a real business.
export const onlineChecks: VerificationCheck[] = [
  { title: "Business and team identity", status: "Reviewed", evidence: "Sample business profile and team details compared during a reviewer video call.", limitation: "Identity review does not establish workmanship or future reliability." },
  { title: "Past work and relevant experience", status: "Reviewed", evidence: "Sample project portfolio reviewed, with scope and the team’s role discussed.", limitation: "Photos alone do not establish construction quality or ownership of the work." },
  { title: "Independent customer references", status: "Reviewed", evidence: "Example reviewer contacted two former customers about attendance, communication, and resolving problems.", limitation: "References are one signal; they do not guarantee future performance." },
  { title: "Credentials relevant to the service", status: "Follow-up needed", evidence: "Example document list supplied, but applicability and issuing-source checks remain open.", limitation: "No license, registration, or insurance verification is claimed here." },
  { title: "Scope, reporting, and availability", status: "Not assessed", evidence: "Project-specific responsibilities, reporting expectations, quote, and dates have not been agreed.", limitation: "A profile review does not replace agreement on your own project." },
];

export const localChecks: VerificationCheck[] = [
  { title: "Targeted visit to past work", status: "Follow-up needed", evidence: "A local reviewer could visit a relevant past project if remote evidence leaves material gaps.", limitation: "No visit has taken place in this demo. A visit does not certify a future project." },
  { title: "Local follow-up on unresolved evidence", status: "Not assessed", evidence: "A reviewer could meet the team or follow up with references when remote checks are inconclusive.", limitation: "The need for a local check depends on the service, evidence, and concerns identified." },
];

export const onboardingSections = [
  { title: "Business & team", detail: "Business profile, team members, service areas, languages, and services offered." },
  { title: "Experience & references", detail: "Past-project examples, the team’s role, and customer references for independent follow-up." },
  { title: "Supporting documents", detail: "Relevant registration, credentials, and insurance documents where applicable. Requirements still need local research." },
  { title: "Working together", detail: "Availability, example quotes, reporting practices, and how changes or disputes are handled." },
];
