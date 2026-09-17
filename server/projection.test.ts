import { describe, expect, it } from "vitest";
import { calculateProjection } from "./projection";

describe("calculateProjection", () => {
  it("combines current deposits and monthly contributions into a future value", () => {
    const result = calculateProjection(
      [{ amountCents: 100_000 }, { amountCents: 50_000 }],
      { monthlyAmountCents: 10_000 },
      { targetYears: 1, annualReturnBps: 600 },
    );

    expect(result.principalCents).toBe(150_000);
    expect(result.monthlyCents).toBe(10_000);
    expect(result.projectedCents).toBeGreaterThan(270_000);
    expect(result.projectedGainCents).toBeGreaterThan(0);
  });

  it("does not create artificial investment gains when the expected rate is zero", () => {
    const result = calculateProjection(
      [{ amountCents: 100_000 }],
      { monthlyAmountCents: 10_000 },
      { targetYears: 2, annualReturnBps: 0 },
    );

    expect(result.projectedCents).toBe(340_000);
    expect(result.projectedGainCents).toBe(0);
  });

  it("subtracts withdrawal entries from the current principal", () => {
    const result = calculateProjection(
      [{ amountCents: 100_000, type: "deposit" }, { amountCents: 25_000, type: "withdrawal" }],
      undefined,
      { targetYears: 1, annualReturnBps: 0 },
    );

    expect(result.principalCents).toBe(75_000);
    expect(result.monthlyEarningsCents).toBe(0);
  });

  it("uses the administrator balance override when one is set", () => {
    const result = calculateProjection(
      [{ amountCents: 100_000 }],
      undefined,
      { targetYears: 1, annualReturnBps: 0, balanceOverrideCents: 42_500 },
    );

    expect(result.principalCents).toBe(42_500);
    expect(result.projectedCents).toBe(42_500);
  });
});
