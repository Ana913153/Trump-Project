import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";

describe("crypto donation reports", () => {
  it("requires donor email and amount for USDC reports before touching the database", async () => {
    const caller = appRouter.createCaller({ user: undefined, req: {} as any, res: {} as any });
    await expect(caller.content.submitBtcTransfer({
      currencyCode: "USDC",
      txHash: "0x12345678901234567890123456789012345678901234567890",
    })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("rejects a short USDC transaction hash with a clear English message", async () => {
    const caller = appRouter.createCaller({ user: undefined, req: {} as any, res: {} as any });
    await expect(caller.content.submitBtcTransfer({
      currencyCode: "USDC",
      txHash: "ab",
      amount: "10",
      email: "donor@example.com",
    })).rejects.toThrow(/Enter a valid transaction hash \(at least 20 characters\)/);
  });

  it("keeps the existing BTC report route available", () => {
    const caller = appRouter.createCaller({ user: undefined, req: {} as any, res: {} as any });
    expect(typeof caller.content.submitBtcTransfer).toBe("function");
  });
});
