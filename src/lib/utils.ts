import { type ClassValue, clsx } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatDate(date: Date | string) {
  return new Intl.DateTimeFormat("pl-PL", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Europe/Warsaw",
  }).format(new Date(date));
}

export function formatDateTime(date: Date | string) {
  return new Intl.DateTimeFormat("pl-PL", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Warsaw",
  }).format(new Date(date));
}

export function formatTime(date: Date | string) {
  return new Intl.DateTimeFormat("pl-PL", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Warsaw",
  }).format(new Date(date));
}

export function formatRelative(date: Date | string) {
  const now = new Date();
  const d = new Date(date);
  const diffMs = d.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Dzisiaj";
  if (diffDays === 1) return "Jutro";
  if (diffDays === -1) return "Wczoraj";
  if (diffDays > 0 && diffDays <= 7) return `Za ${diffDays} dni`;
  if (diffDays < 0 && diffDays >= -7) return `${Math.abs(diffDays)} dni temu`;
  return formatDate(date);
}

export const FOLLOWER_RANGE_LABELS: Record<string, string> = {
  UNDER_2K: "< 2k",
  FROM_2K_TO_10K: "2k - 10k",
  FROM_10K_TO_30K: "10k - 30k",
  FROM_30K_TO_100K: "30k - 100k",
  OVER_100K: "100k+",
};

export const NICHE_OPTIONS = [
  "food",
  "lifestyle",
  "travel",
  "fashion",
  "beauty",
  "fitness",
  "tech",
  "parenting",
  "photography",
];

export const BOOKING_STATUS_LABELS: Record<string, string> = {
  BOOKED: "Zarezerwowano",
  CONFIRMATION_PENDING: "Do potwierdzenia",
  CONFIRMED: "Potwierdzona",
  CANCELLED_BY_CREATOR: "Anulowana przez twórcę",
  CANCELLED_BY_RESTAURANT: "Anulowana przez restaurację",
  NO_SHOW: "Nie pojawił się",
  VISITED: "Wizyta odbyła się",
  CONTENT_PENDING: "Oczekuje na content",
  CONTENT_SUBMITTED: "Content wysłany",
  COMPLETED: "Zakończona",
  DISPUTED: "Sporna",
};

export const APPLICATION_STATUS_LABELS: Record<string, string> = {
  APPLIED: "Wysłano",
  ACCEPTED: "Zaakceptowano",
  REJECTED: "Odrzucono",
  WITHDRAWN: "Wycofano",
};

export const CAMPAIGN_STATUS_LABELS: Record<string, string> = {
  DRAFT: "Szkic",
  ACTIVE: "Aktywna",
  PAUSED: "Wstrzymana",
  ARCHIVED: "Archiwalna",
};

export const USER_STATUS_LABELS: Record<string, string> = {
  PENDING_VERIFICATION: "Oczekuje na weryfikację",
  ACTIVE: "Aktywny",
  SUSPENDED: "Zawieszony",
  BANNED: "Zbanowany",
};

export const AGREEMENT_STATUS_LABELS: Record<string, string> = {
  PENDING_RESTAURANT: "Oczekuje na podpis restauracji",
  PENDING_CREATOR: "Oczekuje na podpis twórcy",
  SIGNED: "Podpisana",
  REJECTED: "Odrzucona",
};
