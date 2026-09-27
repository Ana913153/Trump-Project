import { describe, expect, it } from "vitest";
import { calculateAvailableBalanceCents } from "./balance";
import { calculateActiveStakingCents, isStakingMatured, stakingMaturityDate } from "./staking";

describe("independent staking positions", () => {
  const start = new Date("2026-01-01T12:00:00.000Z");
  const firstMaturity = stakingMaturityDate(start, 30);

  it("allows a second $500 plan from the remaining $500 of a $1,000 balance", () => {
    const first = [{ amountCents: 50_000, status: "active", maturesAt: firstMaturity }];
    const afterFirst = calculateAvailableBalanceCents({ balanceCents: 100_000, stakingAmountCents: calculateActiveStakingCents(first, start.getTime()) });
    expect(afterFirst).toBe(50_000);
    const withSecond = [...first, { amountCents: 50_000, status: "active", maturesAt: stakingMaturityDate(start, 45) }];
    const afterSecond = calculateAvailableBalanceCents({ balanceCents: 100_000, stakingAmountCents: calculateActiveStakingCents(withSecond, start.getTime()) });
    expect(afterSecond).toBe(0);
  });

  it("releases each plan on its own 24-hour-based maturity date", () => {
    const positions = [
      { amountCents: 50_000, status: "active", maturesAt: firstMaturity },
      { amountCents: 50_000, status: "active", maturesAt: stakingMaturityDate(start, 45) },
    ];
    const justBefore = firstMaturity.getTime() - 1;
    const exactlyAtMaturity = firstMaturity.getTime();
    expect(calculateActiveStakingCents(positions, justBefore)).toBe(100_000);
    expect(calculateActiveStakingCents(positions, exactlyAtMaturity)).toBe(50_000);
    expect(calculateAvailableBalanceCents({ balanceCents: 100_000, stakingAmountCents: calculateActiveStakingCents(positions, exactlyAtMaturity) })).toBe(50_000);
  });

  it("does not reserve released or already-matured positions", () => {
    const positions = [
      { amountCents: 50_000, status: "released", maturesAt: stakingMaturityDate(start, 30) },
      { amountCents: 25_000, status: "active", maturesAt: start },
    ];
    expect(calculateActiveStakingCents(positions, start.getTime())).toBe(0);
    expect(isStakingMatured(start, 30, firstMaturity.getTime())).toBe(true);
    expect(isStakingMatured(start, 30, firstMaturity.getTime() - 1)).toBe(false);
  });
});
