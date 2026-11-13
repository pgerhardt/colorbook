export const PALETTE_COUNT = 348;

/** Local calendar fields with UTC arithmetic so DST never adds/removes a day. */
export function getDayOfYear(date: Date): number {
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();
  return Math.floor((Date.UTC(year, month, day) - Date.UTC(year, 0, 1)) / 86_400_000) + 1;
}

export function getDailyPaletteNumber(date: Date): number {
  return ((getDayOfYear(date) - 1) % PALETTE_COUNT) + 1;
}

export function adjacentPalette(number: number, direction: -1 | 1): number {
  return ((number - 1 + direction + PALETTE_COUNT) % PALETTE_COUNT) + 1;
}

/** A numbered edition's date in the visitor's year, including December repeats. */
export function getPaletteDate(number: number, today: Date): Date {
  const year = today.getFullYear();
  const todayOrdinal = getDayOfYear(today);
  const repeatedOrdinal = number + PALETTE_COUNT;
  const daysInYear = getDayOfYear(new Date(year, 11, 31));
  // A few combinations appear twice. Use the occurrence closest to today so
  // browsing around a wrapped December edition keeps its December dates.
  const ordinal = repeatedOrdinal <= daysInYear &&
    Math.abs(repeatedOrdinal - todayOrdinal) < Math.abs(number - todayOrdinal)
    ? repeatedOrdinal
    : number;
  return new Date(year, 0, ordinal);
}

export function formatWrittenDate(date: Date): string {
  const day = date.getDate();
  const suffix = day >= 11 && day <= 13 ? "th" : ({ 1: "st", 2: "nd", 3: "rd" } as Record<number, string>)[day % 10] ?? "th";
  const weekday = new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(date);
  const month = new Intl.DateTimeFormat("en-US", { month: "long" }).format(date);
  return `${weekday}, ${month} ${day}${suffix}, ${date.getFullYear()}`;
}

export function localDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function dateFromKey(key: string): Date {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, month - 1, day);
}

/** Construct the NEXT LOCAL midnight; adding 24 hours is wrong across DST. */
export function millisecondsToNextDay(now: Date): number {
  const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  return Math.max(1, next.getTime() - now.getTime());
}
