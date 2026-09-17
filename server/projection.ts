export type ProjectionEntry = { amountCents: number; type?: string; createdAt?: Date };
export type ProjectionPlan = { monthlyAmountCents: number } | undefined;
export type ProjectionChild = { targetYears: number; annualReturnBps: number; balanceOverrideCents?: number | null };

export function calculateProjection(entries: ProjectionEntry[], plan: ProjectionPlan, child: ProjectionChild) {
  const ledgerPrincipalCents = entries.reduce((sum, entry) => sum + (entry.type === "withdrawal" ? -entry.amountCents : entry.amountCents), 0);
  const principalCents = child.balanceOverrideCents == null ? ledgerPrincipalCents : Math.max(0, child.balanceOverrideCents);
  const monthlyCents = plan?.monthlyAmountCents ?? 0;
  const years = Math.max(1, child.targetYears || 18);
  const annualReturnBps = child.annualReturnBps ?? 600;
  const annualRate = annualReturnBps / 10000;
  const months = years * 12;
  const monthlyRate = annualRate / 12;
  const compound = Math.pow(1 + monthlyRate, months);
  const futurePrincipal = principalCents * compound;
  const futureContributions = monthlyRate === 0 ? monthlyCents * months : monthlyCents * ((compound - 1) / monthlyRate);
  const projectedCents = Math.round(futurePrincipal + futureContributions);
  const plannedContributionCents = monthlyCents * months;
  const monthlyEarningsCents = Math.round(Math.max(0, principalCents) * monthlyRate);
  const firstEntry = entries.filter((entry) => entry.createdAt).sort((a, b) => Number(a.createdAt) - Number(b.createdAt))[0];
  return { principalCents, monthlyCents, years, annualReturnBps, projectedCents, projectedGainCents: projectedCents - principalCents - plannedContributionCents, plannedContributionCents, monthlyEarningsCents, investedAt: firstEntry?.createdAt ?? null };
}
