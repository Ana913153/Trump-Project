const DAY_MS = 24 * 60 * 60 * 1000;

export type StakingPositionState = {
  amountCents: number;
  status: "active" | "released" | string;
  maturesAt: string | Date;
};

export function stakingMaturityDate(startedAt: Date, stakingDays: number): Date {
  const days = Math.max(1, Math.floor(Number(stakingDays) || 1));
  return new Date(startedAt.getTime() + days * DAY_MS);
}

export function isStakingMatured(startedAt: string | Date | null | undefined, stakingDays: number, now = Date.now()): boolean {
  if (!startedAt) return false;
  const startMs = new Date(startedAt).getTime();
  const days = Math.max(1, Math.floor(Number(stakingDays) || 1));
  return Number.isFinite(startMs) && startMs + days * DAY_MS <= now;
}

export function calculateActiveStakingCents(positions: readonly StakingPositionState[], now = Date.now()): number {
  return positions.reduce((total, position) => {
    const maturityMs = new Date(position.maturesAt).getTime();
    const amount = Number.isSafeInteger(position.amountCents) ? Math.max(0, position.amountCents) : 0;
    return position.status === "active" && Number.isFinite(maturityMs) && maturityMs > now
      ? total + amount
      : total;
  }, 0);
}
