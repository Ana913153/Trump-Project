export const NEW_YORK_TIME_ZONE = "America/New_York";

type DateValue = string | number | Date | null | undefined;

function parseDateValue(value: DateValue): Date | null {
  if (value === null || value === undefined || value === "") return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return null;
    // Calendar-only values are held at midday UTC to avoid shifting the day in New York.
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      const date = new Date(`${trimmed}T12:00:00.000Z`);
      return Number.isNaN(date.getTime()) ? null : date;
    }
    // Treat timezone-less server datetime strings as UTC so every visitor sees the same instant.
    if (/^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?$/.test(trimmed)) {
      const date = new Date(`${trimmed.replace(" ", "T")}Z`);
      return Number.isNaN(date.getTime()) ? null : date;
    }
    const date = new Date(trimmed);
    return Number.isNaN(date.getTime()) ? null : date;
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatInNewYork(value: DateValue, locale: string, options: Intl.DateTimeFormatOptions) {
  const date = parseDateValue(value);
  if (!date) return "—";
  return new Intl.DateTimeFormat(locale, { ...options, timeZone: NEW_YORK_TIME_ZONE }).format(date);
}

export function formatNewYorkDateTime(value: DateValue, locale = "en-US") {
  return formatInNewYork(value, locale, { dateStyle: "medium", timeStyle: "short" });
}

export function formatNewYorkDate(value: DateValue, locale = "en-US") {
  return formatInNewYork(value, locale, { dateStyle: "medium" });
}

export function formatNewYorkMonth(value: DateValue, locale = "en-US") {
  return formatInNewYork(value, locale, { year: "numeric", month: "long" });
}
