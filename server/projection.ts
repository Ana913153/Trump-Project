export type ProjectionEntry = { amountCents: number; type?: string; createdAt?: Date };
export type ProjectionPlan = { monthlyAmountCents: number } | undefined;
export type ProjectionChild = { targetYears: number; planStartedAt?: Date | string | null; annualReturnBps: number; balanceOverrideCents?: number | null };
export function calculateProjection(entries: ProjectionEntry[], plan: ProjectionPlan, child: ProjectionChild) {
  const ledgerPrincipalCents = entries.reduce((sum, entry) => sum + (entry.type === "withdrawal" ? -entry.amountCents : entry.amountCents), 0);
  const principalCents = child.balanceOverrideCents == null ? ledgerPrincipalCents : Math.max(0, child.balanceOverrideCents);
  const monthlyCents = plan?.monthlyAmountCents ?? 0;
  const configuredDays = Math.max(0, Math.round(child.targetYears || 0)); const startedAt = child.planStartedAt ? new Date(child.planStartedAt).getTime() : Date.now(); const elapsedDays = Math.max(0, Math.floor((Date.now() - startedAt) / 86400000)); const days = Math.max(0, configuredDays - elapsedDays);
  const annualReturnBps = child.annualReturnBps ?? 600;
  const dailyRate = annualReturnBps / 10000 / 365;
  const dailyCompound = Math.pow(1 + dailyRate, days);
  const futurePrincipal = principalCents * dailyCompound;
  const contributionMonths = Math.floor(days / 30);
  let futureContributions = 0;
  for (let month = 1; month <= contributionMonths; month += 1) futureContributions += monthlyCents * Math.pow(1 + dailyRate, Math.max(0, days - month * 30));
  const projectedCents = Math.round(futurePrincipal + futureContributions);
  const plannedContributionCents = monthlyCents * contributionMonths;
  const monthlyEarningsCents = Math.round(Math.max(0, principalCents) * dailyRate * 30);
  const firstEntry = entries.filter((entry) => entry.createdAt).sort((a, b) => Number(a.createdAt) - Number(b.createdAt))[0];
  return { principalCents, monthlyCents, days, years: days / 365, annualReturnBps, projectedCents, projectedGainCents: projectedCents - principalCents - plannedContributionCents, plannedContributionCents, monthlyEarningsCents, investedAt: firstEntry?.createdAt ?? null };
}
