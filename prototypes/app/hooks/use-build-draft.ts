"use client";

import { useSyncExternalStore } from "react";
import { homeTypes, type HomeType } from "@/app/data/builders";
import { careFrequencies, projectGoals, type CareFrequency, type ProjectGoal } from "@/app/data/property-goals";

export type BuildDraft = {
  location: string;
  searchGoal: "first" | "replacement" | "";
  homeType: HomeType;
  projectGoal: ProjectGoal;
  careFrequency: CareFrequency;
  bedrooms: number;
  bathrooms: number;
  selectedBuilderId: string;
  contactMethod: "video" | "message";
  timePreference: string;
  message: string;
};

type Snapshot = {
  draft: BuildDraft;
  status: "empty" | "saved" | "unavailable";
};

const storageKey = "sentinel-build-draft-v1";
const emptyDraft: BuildDraft = {
  location: "",
  searchGoal: "",
  homeType: "Family house",
  projectGoal: "build",
  careFrequency: "Monthly",
  bedrooms: 3,
  bathrooms: 2,
  selectedBuilderId: "",
  contactMethod: "video",
  timePreference: "To be agreed",
  message: "",
};
const serverSnapshot: Snapshot = { draft: emptyDraft, status: "empty" };
let snapshot = serverSnapshot;
let loaded = false;
const listeners = new Set<() => void>();

// Stored browser data can be old or edited. Validate it before using it as a plan.
function readStoredDraft(): Snapshot {
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return serverSnapshot;
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return serverSnapshot;
    const value = parsed as Record<string, unknown>;
    const text = (key: string, limit: number) =>
      typeof value[key] === "string" ? value[key].slice(0, limit) : "";
    const count = (key: string, fallback: number) =>
      typeof value[key] === "number" && Number.isInteger(value[key])
        ? Math.min(8, Math.max(1, value[key]))
        : fallback;

    return {
      status: "saved",
      draft: {
        location: text("location", 120),
        searchGoal: value.searchGoal === "first" || value.searchGoal === "replacement" ? value.searchGoal : "",
        homeType: homeTypes.includes(value.homeType as HomeType) ? value.homeType as HomeType : "Family house",
        // Migrate earlier drafts that treated renovation as a property type.
        projectGoal: projectGoals.includes(value.projectGoal as ProjectGoal) ? value.projectGoal as ProjectGoal : value.homeType === "Renovation" ? "renovate" : "build",
        careFrequency: careFrequencies.includes(value.careFrequency as CareFrequency) ? value.careFrequency as CareFrequency : "Monthly",
        bedrooms: count("bedrooms", 3),
        bathrooms: count("bathrooms", 2),
        selectedBuilderId: text("selectedBuilderId", 60),
        contactMethod: value.contactMethod === "message" ? "message" : "video",
        timePreference: text("timePreference", 80) || "To be agreed",
        message: text("message", 800),
      },
    };
  } catch {
    return { draft: emptyDraft, status: "unavailable" };
  }
}

function notify() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  // Loading on subscription keeps the server render consistent with hydration.
  if (!loaded) {
    snapshot = readStoredDraft();
    loaded = true;
  }
  function syncFromAnotherTab(event: StorageEvent) {
    if (event.key === storageKey || event.key === null) {
      snapshot = readStoredDraft();
      notify();
    }
  }
  window.addEventListener("storage", syncFromAnotherTab);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", syncFromAnotherTab);
  };
}

function getSnapshot() {
  return snapshot;
}

function getServerSnapshot() {
  return serverSnapshot;
}

export function updateBuildDraft(patch: Partial<BuildDraft>) {
  const draft = { ...snapshot.draft, ...patch };
  let status: Snapshot["status"] = "saved";
  try {
    window.localStorage.setItem(storageKey, JSON.stringify(draft));
  } catch {
    // Keep the draft usable in memory when browser storage is unavailable.
    status = "unavailable";
  }
  snapshot = { draft, status };
  notify();
}

export function clearBuildDraft() {
  let status: Snapshot["status"] = "empty";
  try {
    window.localStorage.removeItem(storageKey);
  } catch {
    status = "unavailable";
  }
  snapshot = { draft: emptyDraft, status };
  notify();
}

export function useBuildDraft() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
