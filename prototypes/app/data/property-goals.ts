export const projectGoals = ["build", "renovate", "upkeep", "buy-and-upkeep"] as const;
export type ProjectGoal = (typeof projectGoals)[number];
export const careFrequencies = ["Monthly", "Quarterly", "As needed"] as const;
export type CareFrequency = (typeof careFrequencies)[number];

export const goalDetails: Record<ProjectGoal, { title: string; description: string }> = {
  build: { title: "Build a new home", description: "Find a team to bring your plans to life." },
  renovate: { title: "Renovate an existing home", description: "Repairs, improvements, or a fresh start." },
  upkeep: { title: "Look after a property", description: "Routine visits, maintenance, and repairs." },
  "buy-and-upkeep": { title: "Buy a home + arrange upkeep", description: "Local help before buying, and ongoing care afterward." },
};

export function projectBrief(plan: {
  projectGoal: ProjectGoal;
  bedrooms: number;
  bathrooms: number;
  homeType: string;
  careFrequency: CareFrequency;
}) {
  const care = plan.projectGoal === "upkeep" || plan.projectGoal === "buy-and-upkeep";
  return `${goalDetails[plan.projectGoal].title} · ${plan.bedrooms} beds · ${plan.bathrooms} baths · ${plan.homeType.toLowerCase()}${care ? ` · ${plan.careFrequency.toLowerCase()} care` : ""}`;
}
