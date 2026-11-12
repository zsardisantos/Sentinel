"use client";

import { useSyncExternalStore } from "react";
import { sampleProject, type Lang } from "@/app/data/builder-project";
import { assertStageTransition, isStageStatus, type StageStatus } from "@/app/data/stage-status";
import type { GeoReading } from "@/app/utils/geo";
import { nowIso } from "@/app/utils/clock";

// Demo-only shared state. /builder writes it and /review (Piece 2) will read it, in the same browser.
// A real version keeps this in Postgres behind a server with sign-in, and photos in file storage.

export type ItemEvidence = {
  photo: string; // downscaled JPEG data URL
  capturedAt: string; // when the photo was chosen on this device (device clock, can be wrong)
  fileModifiedAt: string; // the file's own timestamp; for a camera capture it is close to capturedAt
  location: GeoReading;
  note: string;
};

export type StageEvent = { status: StageStatus; at: string };

export type StageRecord = {
  status: StageStatus;
  history: StageEvent[];
  evidence: Record<string, ItemEvidence>; // key = checklist item id, or "invoice"
  rework: { itemId: string; reason: string; at: string } | null; // written by the reviewer in Piece 2
};

export type BuilderWorkspace = {
  lang: Lang;
  offer: "pending" | "accepted" | "declined";
  stages: Record<string, StageRecord>;
};

type Snapshot = {
  workspace: BuilderWorkspace;
  status: "empty" | "saved" | "unavailable";
};

export const invoiceKey = "invoice";
const storageKey = "sentinel-builder-workspace-v1";

function initialStage(index: number): StageRecord {
  // Stage 1 starts funded so the demo has money "held"; later stages wait for the client's deposit.
  const status: StageStatus = index === 0 ? "funded" : "scheduled";
  return { status, history: index === 0 ? [{ status, at: "2026-11-02T09:00:00.000Z" }] : [], evidence: {}, rework: null };
}

const initialWorkspace: BuilderWorkspace = {
  lang: "pt",
  offer: "pending",
  stages: Object.fromEntries(sampleProject.stages.map((stage, index) => [stage.id, initialStage(index)])),
};
const serverSnapshot: Snapshot = { workspace: initialWorkspace, status: "empty" };
let snapshot = serverSnapshot;
let loaded = false;
const listeners = new Set<() => void>();

// Evidence can only change while the builder holds the stage.
export function canEditEvidence(status: StageStatus) {
  return status === "funded" || status === "rework_requested";
}

// Stored data can be old, edited by hand, or written by an earlier version. Check every field.
function parseLocation(value: unknown): GeoReading {
  const raw = value as Record<string, unknown> | null;
  if (raw?.status === "shared" && typeof raw.lat === "number" && typeof raw.lng === "number" && typeof raw.accuracyM === "number") {
    return { status: "shared", lat: raw.lat, lng: raw.lng, accuracyM: raw.accuracyM };
  }
  if (raw?.status === "refused") return { status: "refused" };
  // "pending" after a reload means the answer never arrived, so treat it as unavailable.
  return { status: "unavailable" };
}

function readEvidence(value: unknown): ItemEvidence | null {
  const raw = value as Record<string, unknown> | null;
  if (typeof raw?.photo !== "string" || !raw.photo.startsWith("data:image/") || typeof raw.capturedAt !== "string") return null;
  return {
    photo: raw.photo,
    capturedAt: raw.capturedAt,
    fileModifiedAt: typeof raw.fileModifiedAt === "string" ? raw.fileModifiedAt : raw.capturedAt,
    location: parseLocation(raw.location),
    note: typeof raw.note === "string" ? raw.note.slice(0, 300) : "",
  };
}

function readStage(value: unknown, fallback: StageRecord): StageRecord {
  const raw = value as Record<string, unknown> | null;
  if (!raw || !isStageStatus(raw.status)) return fallback;
  const evidence: Record<string, ItemEvidence> = {};
  if (raw.evidence && typeof raw.evidence === "object") {
    for (const [key, item] of Object.entries(raw.evidence)) {
      const parsed = readEvidence(item);
      if (parsed) evidence[key] = parsed;
    }
  }
  const history = Array.isArray(raw.history)
    ? raw.history.filter((event): event is StageEvent => isStageStatus(event?.status) && typeof event?.at === "string")
    : [];
  const rework = raw.rework as Record<string, unknown> | null;
  return {
    status: raw.status,
    history,
    evidence,
    rework: typeof rework?.itemId === "string" && typeof rework.reason === "string" && typeof rework.at === "string"
      ? { itemId: rework.itemId, reason: rework.reason, at: rework.at }
      : null,
  };
}

function readStoredWorkspace(): Snapshot {
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return serverSnapshot;
    const value = JSON.parse(raw) as Record<string, unknown> | null;
    if (!value || typeof value !== "object") return serverSnapshot;
    const stages = (value.stages ?? {}) as Record<string, unknown>;
    return {
      status: "saved",
      workspace: {
        lang: value.lang === "en" ? "en" : "pt",
        offer: value.offer === "accepted" || value.offer === "declined" ? value.offer : "pending",
        stages: Object.fromEntries(sampleProject.stages.map((stage, index) => [stage.id, readStage(stages[stage.id], initialStage(index))])),
      },
    };
  } catch {
    return { workspace: initialWorkspace, status: "unavailable" };
  }
}

function notify() {
  listeners.forEach((listener) => listener());
}

function write(workspace: BuilderWorkspace) {
  let status: Snapshot["status"] = "saved";
  try {
    window.localStorage.setItem(storageKey, JSON.stringify(workspace));
  } catch {
    // Usually QuotaExceededError when photos fill the browser's storage. Keep working in memory.
    status = "unavailable";
  }
  snapshot = { workspace, status };
  notify();
}

function updateStage(stageId: string, change: (stage: StageRecord) => StageRecord) {
  const current = snapshot.workspace.stages[stageId];
  if (!current) throw new Error(`Unknown stage ${stageId}`);
  write({ ...snapshot.workspace, stages: { ...snapshot.workspace.stages, [stageId]: change(current) } });
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  // Loading on subscription keeps the server render consistent with hydration.
  if (!loaded) {
    snapshot = readStoredWorkspace();
    loaded = true;
  }
  // The storage event fires in OTHER tabs, so /review and /builder stay in sync side by side.
  function syncFromAnotherTab(event: StorageEvent) {
    if (event.key === storageKey || event.key === null) {
      snapshot = readStoredWorkspace();
      notify();
    }
  }
  window.addEventListener("storage", syncFromAnotherTab);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", syncFromAnotherTab);
  };
}

export function setBuilderLang(lang: Lang) {
  write({ ...snapshot.workspace, lang });
}

export function decideOffer(offer: BuilderWorkspace["offer"]) {
  write({ ...snapshot.workspace, offer });
}

export function saveEvidence(stageId: string, itemKey: string, evidence: ItemEvidence) {
  updateStage(stageId, (stage) => {
    if (!canEditEvidence(stage.status)) throw new Error(`Stage ${stageId} is ${stage.status}; evidence is locked`);
    return { ...stage, evidence: { ...stage.evidence, [itemKey]: evidence } };
  });
}

// Location arrives seconds after the photo. If the builder retook the photo in the meantime,
// capturedAt no longer matches and the late answer is dropped instead of landing on the wrong photo.
export function patchEvidence(stageId: string, itemKey: string, capturedAt: string, patch: Partial<Pick<ItemEvidence, "location" | "note">>) {
  const existing = snapshot.workspace.stages[stageId]?.evidence[itemKey];
  if (!existing || existing.capturedAt !== capturedAt) return;
  updateStage(stageId, (stage) => ({ ...stage, evidence: { ...stage.evidence, [itemKey]: { ...existing, ...patch } } }));
}

// Moves one step through the state machine and records it. Piece 2 uses this for review decisions.
export function moveStage(stageId: string, to: StageStatus, extra: Partial<Pick<StageRecord, "rework">> = {}) {
  updateStage(stageId, (stage) => {
    assertStageTransition(stage.status, to);
    return { ...stage, ...extra, status: to, history: [...stage.history, { status: to, at: nowIso() }] };
  });
}

// Submitting puts the stage straight into the review queue: two recorded steps, one save.
export function submitStage(stageId: string, requiredItemIds: string[]) {
  updateStage(stageId, (stage) => {
    const missing = requiredItemIds.filter((id) => !stage.evidence[id]);
    if (missing.length) throw new Error(`Missing evidence: ${missing.join(", ")}`);
    assertStageTransition(stage.status, "submitted");
    assertStageTransition("submitted", "under_review");
    const at = nowIso();
    return {
      ...stage,
      status: "under_review",
      rework: null,
      history: [...stage.history, { status: "submitted", at }, { status: "under_review", at }],
    };
  });
}

export function resetBuilderWorkspace() {
  let status: Snapshot["status"] = "empty";
  try {
    window.localStorage.removeItem(storageKey);
  } catch {
    status = "unavailable";
  }
  snapshot = { workspace: { ...initialWorkspace, lang: snapshot.workspace.lang }, status };
  notify();
}

export function useBuilderWorkspace() {
  return useSyncExternalStore(subscribe, () => snapshot, () => serverSnapshot);
}
