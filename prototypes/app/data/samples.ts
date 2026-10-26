// Fictional examples for interviews, not verified providers or local requirements.
export type Provider = {
  name: string;
  initials: string;
  trade: string;
  location: string;
  description: string;
  checks: { title: string; detail: string }[];
  unchecked: string[];
};

export const sampleProvider: Provider = {
  name: "Construção Horizonte",
  initials: "CH",
  trade: "Residential building team",
  location: "Praia, Santiago",
  description: "A fictional team showing how a profile could help you choose. A real introduction would depend on your project, budget, and their availability.",
  checks: [
    { title: "Two customer references contacted", detail: "Example check: asked past customers about communication, attendance, and how problems were handled." },
    { title: "One completed project visited", detail: "Example check: a past project was visited. This would not certify the quality of your future home." },
    { title: "Service area discussed", detail: "Example check: the team discussed its service area. Coverage and availability for your specific project still need checking." },
  ],
  unchecked: ["License or registration status", "Current availability and project quote", "Independent technical assessment of past work"],
};
