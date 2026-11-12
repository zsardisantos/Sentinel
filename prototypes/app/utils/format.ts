import type { Lang } from "@/app/data/builder-project";

const locales: Record<Lang, string> = { pt: "pt-CV", en: "en-US" };

// Money stays an integer until the moment it is shown. pt-CV prints the Cape Verdean style, e.g. "780 000$00".
export function formatCve(amountMinor: number, lang: Lang): string {
  return new Intl.NumberFormat(locales[lang], { style: "currency", currency: "CVE" }).format(amountMinor / 100);
}

// For date-only values like "2026-12-04". JavaScript reads them as midnight UTC, so formatting in the
// phone's own zone (Cape Verde is UTC-1) would show the day before. Format in UTC to keep the same day.
export function formatDate(day: string, lang: Lang): string {
  return new Intl.DateTimeFormat(locales[lang], { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(day));
}

export function formatDateTime(iso: string, lang: Lang): string {
  return new Intl.DateTimeFormat(locales[lang], { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(iso));
}
