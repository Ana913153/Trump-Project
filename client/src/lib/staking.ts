const DAY_MS = 24 * 60 * 60 * 1000;

/** Simple-interest estimate: principal × daily rate × elapsed staking days. */
export function calculateDailySimpleStakingProfitCents(
  principalCents: number,
  dailyRateBps: number,
  stakingDays: number,
): number {
  const principal = Math.max(0, Math.round(Number(principalCents) || 0));
  const rateBps = Math.max(0, Math.round(Number(dailyRateBps) || 0));
  const days = Math.max(0, Math.floor(Number(stakingDays) || 0));
  return Math.round((principal * rateBps * days) / 10_000);
}

/** Number of 24-hour periods remaining, rounded up so the count drops on each full-day boundary. */
export function getRemainingStakingDays(
  startedAt: string | Date | null | undefined,
  durationDays: number,
  now = Date.now(),
): number {
  const days = Math.max(0, Math.floor(Number(durationDays) || 0));
  if (!days) return 0;
  if (!startedAt) return days;

  const startMs = new Date(startedAt).getTime();
  if (!Number.isFinite(startMs)) return days;

  const endsAt = startMs + days * DAY_MS;
  return Math.max(0, Math.ceil((endsAt - now) / DAY_MS));
}
