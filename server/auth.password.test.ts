import { describe, expect, it } from "vitest";
import { hashPassword, normalizeIdentifier, validatePassword, verifyPassword } from "./auth";
import { DEFAULT_ADMIN_PASSWORD, DEFAULT_ADMIN_USERNAME } from "./db";

describe("local password authentication", () => {
  it("uses the requested default admin credentials", () => {
    expect(DEFAULT_ADMIN_USERNAME).toBe("admin");
    expect(DEFAULT_ADMIN_PASSWORD).toBe("Zz123123");
    expect(validatePassword(DEFAULT_ADMIN_PASSWORD)).toBe(true);
  });

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
    expect(normalizeIdentifier("  ADMIN ")).toBe("admin");
  });
});
