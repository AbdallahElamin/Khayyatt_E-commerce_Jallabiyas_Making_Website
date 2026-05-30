import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Calculates the number of fully completed years of experience from a given
 * ISO date string (e.g. "2002-03-15") to today's date.
 *
 * Returns 0 for invalid or future dates so the UI degrades gracefully.
 *
 * @example
 *   calculateExperienceYears("2002-03-15") // → 22 (as of 2024)
 */
export function calculateExperienceYears(startDate: string): number {
  const start = new Date(startDate);
  if (isNaN(start.getTime())) return 0;

  const today = new Date();
  if (start > today) return 0;

  let years = today.getFullYear() - start.getFullYear();

  // Subtract one year if we haven't yet passed the anniversary date this year
  const hasHadAnniversary =
    today.getMonth() > start.getMonth() ||
    (today.getMonth() === start.getMonth() && today.getDate() >= start.getDate());

  if (!hasHadAnniversary) years -= 1;

  return Math.max(0, years);
}
