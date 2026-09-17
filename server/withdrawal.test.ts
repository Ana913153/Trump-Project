import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

const context = (user: TrpcContext["user"]): TrpcContext => ({
  user,
  req: { protocol: "https", headers: {} } as TrpcContext["req"],
  res: { clearCookie: () => undefined } as TrpcContext["res"],
});

describe("withdrawal workflow", () => {
  it("requires an authenticated account to request a withdrawal", async () => {
    const caller = appRouter.createCaller(context(null));
    await expect(caller.accounts.requestWithdrawal({ amountCents: 5000, destination: "0x1234567890" })).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("requires an administrator to change withdrawal status", async () => {
    const caller = appRouter.createCaller(context({ id: 7, openId: "user-7", name: "User", email: "user@example.com", username: "user7", passwordHash: null, resetTokenHash: null, resetTokenExpiresAt: null, loginMethod: "email", role: "user", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() }));
    await expect(caller.admin.updateWithdrawal({ id: 1, status: "approved" })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("rejects invalid withdrawal amounts before database access", async () => {
    const caller = appRouter.createCaller(context({ id: 7, openId: "user-7", name: "User", email: "user@example.com", username: "user7", passwordHash: null, resetTokenHash: null, resetTokenExpiresAt: null, loginMethod: "email", role: "user", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() }));
    await expect(caller.accounts.requestWithdrawal({ amountCents: 0, destination: "0x1234567890" })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });
});
