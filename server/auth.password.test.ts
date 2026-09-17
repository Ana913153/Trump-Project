import { describe, expect, it } from "vitest";
import { hashPassword, validatePassword, verifyPassword } from "./auth";

describe("local password authentication", () => {
  it("accepts the configured bootstrap password shape and verifies only its hash", () => {
    const bootstrapPassword = "Aa123123";
    expect(validatePassword(bootstrapPassword)).toBe(true);
    const storedHash = hashPassword(bootstrapPassword);
    expect(storedHash).not.toContain(bootstrapPassword);
    expect(verifyPassword(bootstrapPassword, storedHash)).toBe(true);
    expect(verifyPassword("wrong-password", storedHash)).toBe(false);
  });

  it("normalizes registration identifiers before account lookup", async () => {
    const { normalizeEmail, localOpenId } = await import("./auth");
    expect(normalizeEmail("  NewUser@Example.COM ")).toBe("newuser@example.com");
    expect(localOpenId(" NewUser@Example.COM ")).toBe(localOpenId("newuser@example.com"));
  });
});
