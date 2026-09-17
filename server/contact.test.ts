import { describe, expect, it } from "vitest";
import { normalizeContactEmail } from "./contact";

describe("contact submissions", () => {
  it("normalizes submitted email addresses before persistence", () => {
    expect(normalizeContactEmail("  Customer@Example.COM ")).toBe("customer@example.com");
  });
});
