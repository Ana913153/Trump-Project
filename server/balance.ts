export type BalanceReservations = {
  balanceCents: number;
  lockedAmountCents?: number | null;
  stakingAmountCents?: number | null;
  pendingWithdrawalCents?: number | null;
};

function nonNegativeInteger(value: number | null | undefined) {
  return Number.isFinite(value) ? Math.max(0, Math.trunc(value as number)) : 0;
}

export function calculateReservedBalanceCents({ lockedAmountCents = 0, stakingAmountCents = 0, pendingWithdrawalCents = 0 }: Omit<BalanceReservations, "balanceCents">) {
  return nonNegativeInteger(lockedAmountCents)
    + nonNegativeInteger(stakingAmountCents)
    + nonNegativeInteger(pendingWithdrawalCents);
}

export function calculateAvailableBalanceCents({
  balanceCents,
  lockedAmountCents = 0,
  stakingAmountCents = 0,
  pendingWithdrawalCents = 0,
}: BalanceReservations) {
  const balance = Number.isFinite(balanceCents) ? Math.trunc(balanceCents) : 0;
  const reserved = calculateReservedBalanceCents({ lockedAmountCents, stakingAmountCents, pendingWithdrawalCents });
  return Math.max(0, balance - reserved);
}

export function canReserveBalanceCents(amountCents: number, availableCents: number) {
  return Number.isSafeInteger(amountCents)
    && amountCents >= 0
    && Number.isSafeInteger(availableCents)
    && amountCents <= Math.max(0, availableCents);
}
