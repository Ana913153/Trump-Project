import { describe, expect, it } from "vitest";
import {
  calculateDailySimpleStakingProfitCents,
  getRemainingStakingDays,
} from "./staking";

const DAY_MS = 24 * 60 * 60 * 1000;

describe("daily simple staking earnings", () => {
  it("calculates $100 per day on $1,000 at 10%", () => {
    expect(calculateDailySimpleStakingProfitCents(100_000, 1_000, 1)).toBe(10_000);
  });

  it("calculates $500 total simple interest for five days", () => {
    expect(calculateDailySimpleStakingProfitCents(100_000, 1_000, 5)).toBe(50_000);
  });

  it("returns zero for an empty amount, rate, or term", () => {
    expect(calculateDailySimpleStakingProfitCents(0, 1_000, 5)).toBe(0);
    expect(calculateDailySimpleStakingProfitCents(100_000, 0, 5)).toBe(0);
    expect(calculateDailySimpleStakingProfitCents(100_000, 1_000, 0)).toBe(0);
  });
});

describe("remaining staking days", () => {
  const startedAt = Date.UTC(2026, 0, 1, 12);

  it("shows the full five-day term at the start", () => {
    expect(getRemainingStakingDays(new Date(startedAt), 5, startedAt)).toBe(5);
  });

  it("drops from five days to four after one full 24-hour period", () => {
    expect(getRemainingStakingDays(new Date(startedAt), 5, startedAt + DAY_MS)).toBe(4);
  });

  it("shows zero at the exact end of the term", () => {
    expect(getRemainingStakingDays(new Date(startedAt), 5, startedAt + 5 * DAY_MS)).toBe(0);
  });
});


describe("backend-configured staking duration", () => {
  const startedAt = Date.UTC(2026, 0, 1, 12);

  it("uses a different configured term and decrements after each full day", () => {
    expect(getRemainingStakingDays(new Date(startedAt), 2, startedAt)).toBe(2);
    expect(getRemainingStakingDays(new Date(startedAt), 2, startedAt + DAY_MS)).toBe(1);
    expect(getRemainingStakingDays(new Date(startedAt), 2, startedAt + 2 * DAY_MS)).toBe(0);
  });
});
