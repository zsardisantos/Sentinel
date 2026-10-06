// Local stand-ins for packages that only exist inside Palantir Foundry.
// They let the editor and `npm run typecheck` work outside Foundry. They are loose on purpose:
// object properties are `any` here, so the real property checks only happen inside Foundry.
// Do not deploy this file to Foundry, where the real packages provide these types.

declare module "@ontology/sdk" {
  // Each object type is both a value (passed to batch.create) and a type (used in Edits.Object<X>).
  interface ObjectType {
    readonly apiName: string;
  }
  export interface AiReview extends ObjectType {}
  export const AiReview: AiReview;
  export interface EvidenceSubmissions extends ObjectType {}
  export const EvidenceSubmissions: EvidenceSubmissions;
  export interface JournalEntries extends ObjectType {}
  export const JournalEntries: JournalEntries;
  export interface Milestone extends ObjectType {}
  export const Milestone: Milestone;
  export interface Posting extends ObjectType {}
  export const Posting: Posting;
  export interface ReviewDecisions extends ObjectType {}
  export const ReviewDecisions: ReviewDecisions;
}

declare module "@osdk/client" {
  // client(ObjectType) starts a query, for example client(Posting).where({...}).aggregate({...}).
  export interface ObjectSet {
    where(filter: Record<string, unknown>): ObjectSet;
    fetchPage(options?: Record<string, unknown>): Promise<{ data: Osdk.Instance<unknown>[] }>;
    aggregate(options: Record<string, unknown>): Promise<any>;
  }
  export interface Client {
    (objectType: unknown): ObjectSet;
  }
  export namespace Osdk {
    // A loaded object. Any property name is allowed and has type `any`.
    type Instance<T> = { readonly [property: string]: any };
  }
}

declare module "@osdk/functions" {
  import type { Client, Osdk } from "@osdk/client";

  export namespace Edits {
    // One planned change to an object of type T.
    type Object<T> = { readonly type: T; readonly kind: "create" | "update" | "delete" };
  }

  export interface EditBatch<E> {
    create(objectType: unknown, properties: Record<string, unknown>): void;
    update(object: Osdk.Instance<unknown>, properties: Record<string, unknown>): void;
    delete(object: Osdk.Instance<unknown>): void;
    getEdits(): E[];
  }

  export function createEditBatch<E>(client: Client): EditBatch<E>;
}
