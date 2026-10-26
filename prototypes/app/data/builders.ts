import { sampleProvider, type Provider } from "@/app/data/samples";
import type { ProjectGoal } from "@/app/data/property-goals";

export const homeTypes = ["Family house", "Villa", "Apartment"] as const;
export type HomeType = (typeof homeTypes)[number];

// This is the metadata a real provider onboarding process would need to collect.
// Every provider, availability claim, and check in this file is fictional.
export type Builder = Provider & {
  id: string;
  homeTypes: HomeType[];
  services: ProjectGoal[];
  teamType: "Builder" | "Builder & property care" | "Property management";
  trackRecordLabel: "Homes completed" | "Properties managed";
  serviceAreas: string[];
  yearsExperience: number;
  completedProjects: number;
  languages: string[];
  availability: "Soon" | "Later";
  approach: string;
  accent: string;
};

export const sampleBuilders: Builder[] = [
  {
    ...sampleProvider,
    id: "horizonte",
    services: ["build", "renovate"],
    teamType: "Builder",
    trackRecordLabel: "Homes completed",
    homeTypes: ["Family house", "Villa"],
    serviceAreas: ["Praia", "São Domingos"],
    yearsExperience: 12,
    completedProjects: 24,
    languages: ["Portuguese", "Kriolu", "English"],
    availability: "Soon",
    approach: "A small team focused on family homes and keeping owners abroad in the loop.",
    accent: "ocean",
  },
  {
    ...sampleProvider,
    id: "morabeza",
    services: ["build", "renovate", "upkeep"],
    teamType: "Builder & property care",
    trackRecordLabel: "Homes completed",
    name: "Morabeza Obras",
    initials: "MO",
    location: "Praia, Santiago",
    homeTypes: ["Family house", "Apartment"],
    serviceAreas: ["Praia", "Santa Cruz"],
    yearsExperience: 8,
    completedProjects: 16,
    languages: ["Portuguese", "Kriolu"],
    availability: "Later",
    approach: "Family houses, renovations, and maintenance visits for owners living abroad.",
    accent: "sand",
  },
  {
    ...sampleProvider,
    id: "atlantico",
    services: ["build", "renovate"],
    teamType: "Builder",
    trackRecordLabel: "Homes completed",
    name: "Atlântico Habitat",
    initials: "AH",
    location: "Mindelo, São Vicente",
    homeTypes: ["Family house", "Villa"],
    serviceAreas: ["Mindelo"],
    yearsExperience: 15,
    completedProjects: 31,
    languages: ["Portuguese", "Kriolu", "English"],
    availability: "Later",
    approach: "Contemporary homes with open living spaces and a close eye on the details.",
    accent: "slate",
  },
  {
    ...sampleProvider,
    id: "raizes",
    services: ["build", "renovate", "upkeep"],
    teamType: "Builder & property care",
    trackRecordLabel: "Homes completed",
    name: "Raízes Construções",
    initials: "RC",
    location: "Assomada, Santiago",
    homeTypes: ["Family house", "Apartment"],
    serviceAreas: ["Assomada", "Tarrafal"],
    yearsExperience: 10,
    completedProjects: 19,
    languages: ["Portuguese", "Kriolu", "French"],
    availability: "Soon",
    approach: "A hands-on team for family homes, renovations, and ongoing repairs.",
    accent: "sage",
  },
  {
    ...sampleProvider,
    id: "casa-serena",
    name: "Casa Serena Gestão",
    initials: "CS",
    trade: "Property management and maintenance",
    location: "Praia, Santiago",
    services: ["upkeep", "buy-and-upkeep"],
    teamType: "Property management",
    trackRecordLabel: "Properties managed",
    homeTypes: ["Family house", "Villa", "Apartment"],
    serviceAreas: ["Praia", "Mindelo"],
    yearsExperience: 6,
    completedProjects: 18,
    languages: ["Portuguese", "Kriolu", "English"],
    availability: "Soon",
    approach: "Local viewing coordination, maintenance visits, and property care after you buy. A fictional management team, not a property listing or purchase service.",
    checks: [
      { title: "Owner references reviewed", detail: "Example: two owners were asked about reporting, maintenance, and communication." },
      { title: "Sample care report reviewed", detail: "Example: a maintenance report was reviewed remotely. It does not establish how future visits will be performed." },
      { title: "Service area discussed", detail: "Example: coverage was discussed. Capacity, responsibilities, and fees still need agreement." },
    ],
    unchecked: ["Registration and applicable credentials", "Authority to arrange purchase-related services", "Property access arrangements and maintenance quote"],
    accent: "sage",
  },
];

// Suggestions are local sample data, not Google Maps results or verified addresses.
export const locationSuggestions = [
  "Praia, Santiago",
  "Mindelo, São Vicente",
  "Assomada, Santiago",
  "São Domingos, Santiago",
  "Santa Cruz, Santiago",
  "Tarrafal, Santiago",
  "São Filipe, Fogo",
];
