import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";

describe("admin management features", () => {
  it("exposes funding, schedule, content, footer editing, BTC, currency, and password management routes", () => {
    const caller = appRouter.createCaller({
      user: { id: 1, openId: "admin", name: "Admin", email: "admin@local.test", username: "admin", passwordHash: null, resetTokenHash: null, resetTokenExpiresAt: null, loginMethod: "local", role: "admin", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() },
      req: {} as any,
      res: {} as any,
    });
    const admin = caller.admin as any;
    for (const route of ["addFunding", "updateBalance", "updateInterestRate", "updateStakingPlan", "releaseStakingPosition", "releaseLegacyStaking", "setContributionPlan", "updateBtcAddress", "updateBtcTransfer", "createCurrency", "deleteCurrency", "createFaq", "updateFaq", "deleteFaq", "createArticle", "updateArticle", "deleteArticle", "createFooterLink", "updateFooterLink", "deleteFooterLink", "setUserPassword"]) {
      expect(typeof admin[route]).toBe("function");
    }
  });
});
