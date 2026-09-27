import { describe, expect, it } from "vitest";
import { calculateAvailableBalanceCents, calculateReservedBalanceCents, canReserveBalanceCents } from "./balance";

describe("shared account reservations", () => {
  it("leaves exactly $500 available from a $1,000 balance with $500 locked", () => {
    const available = calculateAvailableBalanceCents({
      balanceCents: 100_000,
      lockedAmountCents: 50_000,
    });
    expect(available).toBe(50_000);
    expect(canReserveBalanceCents(50_100, available)).toBe(false);
    expect(canReserveBalanceCents(50_000, available)).toBe(true);
  });

  it("rejects a $501 second stake when $500 is already staked from a $1,000 balance", () => {
    const available = calculateAvailableBalanceCents({
      balanceCents: 100_000,
      stakingAmountCents: 50_000,
    });
    expect(available).toBe(50_000);
    expect(canReserveBalanceCents(50_100, available)).toBe(false);
    expect(canReserveBalanceCents(50_000, available)).toBe(true);
  });

  it("combines locked, staked, and pending withdrawal amounts", () => {
    expect(calculateAvailableBalanceCents({
      balanceCents: 100_000,
      lockedAmountCents: 20_000,
      stakingAmountCents: 30_000,
      pendingWithdrawalCents: 10_000,
    })).toBe(40_000);
  });

  it("uses the aggregate of separate staking positions for all reservation paths", () => {
    const reserved = calculateReservedBalanceCents({ lockedAmountCents: 10_000, stakingAmountCents: 100_000, pendingWithdrawalCents: 5_000 });
    expect(reserved).toBe(115_000);
    expect(calculateAvailableBalanceCents({ balanceCents: 150_000, lockedAmountCents: 10_000, stakingAmountCents: 100_000, pendingWithdrawalCents: 5_000 })).toBe(35_000);
  });

  it("never reports a negative available balance", () => {
    expect(calculateAvailableBalanceCents({
      balanceCents: 10_000,
      lockedAmountCents: 8_000,
      stakingAmountCents: 5_000,
    })).toBe(0);
  });
});
