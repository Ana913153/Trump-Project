import { describe, expect, it } from "vitest";
import { normalizeContactEmail } from "./contact";
import { appRouter } from "./routers";

const publicCaller = () => appRouter.createCaller({ user: null, req: {} as any, res: {} as any });

describe("contact submissions", () => {
  it("normalizes submitted email addresses before persistence", () => {
    expect(normalizeContactEmail("  Customer@Example.COM ")).toBe("customer@example.com");
  });

  it.each(["BTC", "USDC"] as const)("rejects short %s transaction hashes with a clear English message", async (currencyCode) => {
    const caller = publicCaller();
    const input = { txHash: "abcd", currencyCode, ...(currencyCode === "USDC" ? { amount: "50", email: "customer@example.com" } : {}) };
    let caught: any;
    try {
      await caller.content.submitBtcTransfer(input as any);
    } catch (error) {
      caught = error;
    }
    expect(caught).toMatchObject({ code: "BAD_REQUEST" });
    expect(caught.message).toContain("Enter a valid transaction hash (at least 20 characters).");
    expect(caught.message).not.toMatch(/[\u4e00-\u9fff]/);
  });
});
