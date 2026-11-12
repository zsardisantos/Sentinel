// Browser versions of nowIso and newId from domain/escrow.ts (that file uses node:crypto).

export function nowIso(): string {
  return new Date().toISOString();
}

export function newId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID()}`;
}
