import { describe, expect, it } from "vitest";
import { formatNewYorkDate, formatNewYorkDateTime, formatNewYorkMonth } from "./time";

describe("New York frontend time formatting", () => {
  it("formats timestamps in America/New_York regardless of the viewer timezone", () => {
    const formatted = formatNewYorkDateTime("2026-09-28T12:00:00.000Z");
    expect(formatted).toContain("Sep 28, 2026");
    expect(formatted).toContain("8:00 AM");
  });

  it("keeps date-only values on the intended calendar day", () => {
    expect(formatNewYorkDate("2026-09-28")).toBe("Sep 28, 2026");
  });

  it("uses New York time for month boundaries", () => {
    expect(formatNewYorkMonth("2026-01-01T02:00:00.000Z")).toBe("December 2025");
  });

  it("interprets timezone-less server timestamps consistently as UTC", () => {
    expect(formatNewYorkDateTime("2026-09-28 12:00:00")).toContain("8:00 AM");
  });

  it("returns a safe placeholder for missing or invalid dates", () => {
    expect(formatNewYorkDateTime(null)).toBe("—");
    expect(formatNewYorkDate("not-a-date")).toBe("—");
  });
});
