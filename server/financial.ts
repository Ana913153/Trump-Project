import { and, eq, gt, lte, sql } from "drizzle-orm";
import { children, fundingEntries, stakingPositions, withdrawalRequests } from "../drizzle/schema";
import { getDb } from "./db";
import { calculateAvailableBalanceCents, calculateReservedBalanceCents, canReserveBalanceCents } from "./balance";
import { calculateProjection } from "./projection";
import { calculateActiveStakingCents, isStakingMatured, stakingMaturityDate } from "./staking";

export type FinancialFailure = {
  ok: false;
  reason: "not_found" | "forbidden" | "insufficient" | "not_pending" | "over_reserved";
  availableCents: number;
};

export type FinancialSuccess = { ok: true; availableCents: number; requestId?: number; positionId?: number };

async function loadAccountState(tx: any, childId: number, forUpdate = false) {
  const query = tx.select().from(children).where(eq(children.id, childId)).limit(1);
  const childRows = forUpdate ? await query.for("update") : await query;
  let child = childRows[0];
  if (!child) return null;

  const now = new Date();
  // Expired positions stop reserving funds at their exact maturity timestamp.
  await tx.update(stakingPositions).set({ status: "released", releaseReason: "matured", releasedAt: now })
    .where(and(eq(stakingPositions.childId, childId), eq(stakingPositions.status, "active"), lte(stakingPositions.maturesAt, now)));

  let legacyStakingCents = Math.max(0, Number(child.stakingAmountCents) || 0);
  if (legacyStakingCents > 0 && isStakingMatured(child.stakingStartedAt, child.stakingDays, now.getTime())) {
    await tx.update(children).set({ stakingAmountCents: 0, stakingStartedAt: null, updatedAt: now }).where(eq(children.id, childId));
    child = { ...child, stakingAmountCents: 0, stakingStartedAt: null, updatedAt: now };
    legacyStakingCents = 0;
  }

  const activePositions = await tx.select().from(stakingPositions)
    .where(and(eq(stakingPositions.childId, childId), eq(stakingPositions.status, "active"), gt(stakingPositions.maturesAt, now)));
  const positionStakingCents = calculateActiveStakingCents(activePositions, now.getTime());
  const stakingAmountCents = legacyStakingCents + positionStakingCents;
  const entries = await tx.select().from(fundingEntries).where(eq(fundingEntries.childId, childId));
  const pendingRows = await tx
    .select({ total: sql<number>`COALESCE(SUM(${withdrawalRequests.amountCents}), 0)` })
    .from(withdrawalRequests)
    .where(and(eq(withdrawalRequests.childId, childId), eq(withdrawalRequests.status, "pending")));
  const pendingWithdrawalCents = Number(pendingRows[0]?.total ?? 0);
  const balanceCents = calculateProjection(entries, undefined, child).principalCents;

  return { child, balanceCents, pendingWithdrawalCents, stakingAmountCents, legacyStakingCents };
}

function availableFor(state: NonNullable<Awaited<ReturnType<typeof loadAccountState>>>) {
  return calculateAvailableBalanceCents({
    balanceCents: state.balanceCents,
    lockedAmountCents: state.child.lockedAmountCents,
    stakingAmountCents: state.stakingAmountCents,
    pendingWithdrawalCents: state.pendingWithdrawalCents,
  });
}

export async function getAccountAvailability(childId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  return db.transaction(async (tx) => {
    const state = await loadAccountState(tx, childId, true);
    if (!state) return null;
    return {
      balanceCents: state.balanceCents,
      availableCents: availableFor(state),
      lockedAmountCents: state.child.lockedAmountCents || 0,
      stakingAmountCents: state.stakingAmountCents,
      legacyStakingCents: state.legacyStakingCents,
      pendingWithdrawalCents: state.pendingWithdrawalCents,
    };
  });
}

export async function createReservedWithdrawalRequest(input: {
  childId: number;
  userId: number;
  amountCents: number;
  destination: string;
  note?: string;
}): Promise<FinancialFailure | FinancialSuccess> {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  return db.transaction(async (tx) => {
    const state = await loadAccountState(tx, input.childId, true);
    if (!state || state.child.userId !== input.userId) return { ok: false, reason: "not_found", availableCents: 0 };
    const availableCents = availableFor(state);
    if (!canReserveBalanceCents(input.amountCents, availableCents)) {
      return { ok: false, reason: "insufficient", availableCents };
    }
    const result = await tx.insert(withdrawalRequests).values(input);
    return { ok: true, availableCents, requestId: Number(result[0].insertId) };
  });
}

export async function setAccountStakingPlan(input: {
  childId: number;
  stakingAmountCents: number;
  stakingDays: number;
  ownerUserId?: number;
}): Promise<FinancialFailure | FinancialSuccess> {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  return db.transaction(async (tx) => {
    const state = await loadAccountState(tx, input.childId, true);
    if (!state) return { ok: false, reason: "not_found", availableCents: 0 };
    if (input.ownerUserId !== undefined && state.child.userId !== input.ownerUserId) {
      return { ok: false, reason: "not_found", availableCents: 0 };
    }
    const availableCents = availableFor(state);
    if (input.stakingAmountCents <= 0 || !canReserveBalanceCents(input.stakingAmountCents, availableCents)) {
      return { ok: false, reason: "insufficient", availableCents };
    }
    const startedAt = new Date();
    const result = await tx.insert(stakingPositions).values({
      childId: input.childId,
      amountCents: input.stakingAmountCents,
      stakingDays: input.stakingDays,
      dailyRateBps: Math.max(0, Number(state.child.annualReturnBps) || 0),
      startedAt,
      maturesAt: stakingMaturityDate(startedAt, input.stakingDays),
      status: "active",
    });
    return {
      ok: true,
      positionId: Number(result[0].insertId),
      availableCents: calculateAvailableBalanceCents({
        balanceCents: state.balanceCents,
        lockedAmountCents: state.child.lockedAmountCents,
        stakingAmountCents: state.stakingAmountCents + input.stakingAmountCents,
        pendingWithdrawalCents: state.pendingWithdrawalCents,
      }),
    };
  });
}

export async function setAccountLockedAmount(input: {
  childId: number;
  lockedAmountCents: number;
}): Promise<FinancialFailure | FinancialSuccess> {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  return db.transaction(async (tx) => {
    const state = await loadAccountState(tx, input.childId, true);
    if (!state) return { ok: false, reason: "not_found", availableCents: 0 };
    const lockableCents = calculateAvailableBalanceCents({
      balanceCents: state.balanceCents,
      stakingAmountCents: state.stakingAmountCents,
      pendingWithdrawalCents: state.pendingWithdrawalCents,
    });
    if (!canReserveBalanceCents(input.lockedAmountCents, lockableCents)) {
      return { ok: false, reason: "insufficient", availableCents: lockableCents };
    }
    await tx.update(children).set({
      lockedAmountCents: input.lockedAmountCents,
      lockedAt: input.lockedAmountCents > 0 ? new Date() : null,
      updatedAt: new Date(),
    }).where(eq(children.id, input.childId));
    return { ok: true, availableCents: Math.max(0, lockableCents - input.lockedAmountCents) };
  });
}

export async function addAdminFundingWithLimit(input: {
  childId: number;
  type: "treasury" | "deposit" | "contribution" | "withdrawal";
  amountCents: number;
  currencyCode?: string;
  note?: string;
}): Promise<FinancialFailure | FinancialSuccess> {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  return db.transaction(async (tx) => {
    const state = await loadAccountState(tx, input.childId, true);
    if (!state) return { ok: false, reason: "not_found", availableCents: 0 };
    const availableCents = availableFor(state);
    if (input.type === "withdrawal" && !canReserveBalanceCents(input.amountCents, availableCents)) {
      return { ok: false, reason: "insufficient", availableCents };
    }

    await tx.insert(fundingEntries).values({
      childId: input.childId,
      type: input.type,
      amountCents: input.amountCents,
      currencyCode: input.currencyCode || "BTC",
      note: input.note,
    });

    const delta = input.type === "withdrawal" ? -input.amountCents : input.amountCents;
    if (state.child.balanceOverrideCents !== null && state.child.balanceOverrideCents !== undefined) {
      await tx.update(children).set({
        balanceOverrideCents: Math.max(0, state.balanceCents + delta),
        updatedAt: new Date(),
      }).where(eq(children.id, input.childId));
    }
    const nextBalance = state.balanceCents + delta;
    const nextAvailable = calculateAvailableBalanceCents({
      balanceCents: nextBalance,
      lockedAmountCents: state.child.lockedAmountCents,
      stakingAmountCents: state.stakingAmountCents,
      pendingWithdrawalCents: state.pendingWithdrawalCents,
    });
    return { ok: true, availableCents: nextAvailable };
  });
}

export async function setAccountBalance(input: {
  childId: number;
  balanceCents: number;
}): Promise<FinancialFailure | FinancialSuccess> {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  return db.transaction(async (tx) => {
    const state = await loadAccountState(tx, input.childId, true);
    if (!state) return { ok: false, reason: "not_found", availableCents: 0 };
    const reservedCents = calculateReservedBalanceCents({
      lockedAmountCents: state.child.lockedAmountCents,
      stakingAmountCents: state.stakingAmountCents,
      pendingWithdrawalCents: state.pendingWithdrawalCents,
    });
    const availableCents = Math.max(0, input.balanceCents - reservedCents);
    if (input.balanceCents < reservedCents) return { ok: false, reason: "insufficient", availableCents };
    await tx.update(children).set({ balanceOverrideCents: input.balanceCents, updatedAt: new Date() }).where(eq(children.id, input.childId));
    return { ok: true, availableCents };
  });
}

export type StakingReleaseResult = { ok: true; childId: number } | { ok: false; reason: "not_found" | "not_active" };

export async function releaseStakingPosition(positionId: number): Promise<StakingReleaseResult> {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  return db.transaction(async (tx) => {
    const initial = await tx.select({ childId: stakingPositions.childId }).from(stakingPositions)
      .where(eq(stakingPositions.id, positionId)).limit(1);
    const childId = initial[0]?.childId;
    if (!childId) return { ok: false, reason: "not_found" };
    const childRows = await tx.select({ id: children.id }).from(children).where(eq(children.id, childId)).limit(1).for("update");
    if (!childRows[0]) return { ok: false, reason: "not_found" };
    const rows = await tx.select().from(stakingPositions).where(eq(stakingPositions.id, positionId)).limit(1).for("update");
    const position = rows[0];
    if (!position || position.status !== "active") return { ok: false, reason: "not_active" };
    const now = new Date();
    const matured = new Date(position.maturesAt).getTime() <= now.getTime();
    await tx.update(stakingPositions).set({ status: "released", releaseReason: matured ? "matured" : "admin", releasedAt: now })
      .where(and(eq(stakingPositions.id, positionId), eq(stakingPositions.status, "active")));
    return { ok: true, childId };
  });
}

export async function releaseLegacyStaking(childId: number): Promise<StakingReleaseResult> {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  return db.transaction(async (tx) => {
    const rows = await tx.select().from(children).where(eq(children.id, childId)).limit(1).for("update");
    const child = rows[0];
    if (!child) return { ok: false, reason: "not_found" };
    if (!(Number(child.stakingAmountCents) > 0)) return { ok: false, reason: "not_active" };
    await tx.update(children).set({ stakingAmountCents: 0, stakingStartedAt: null, updatedAt: new Date() }).where(eq(children.id, childId));
    return { ok: true, childId };
  });
}

export async function reviewWithdrawal(input: {
  id: number;
  status: "approved" | "rejected";
}): Promise<FinancialFailure | FinancialSuccess> {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  return db.transaction(async (tx) => {
    const initialRows = await tx.select({ childId: withdrawalRequests.childId })
      .from(withdrawalRequests).where(eq(withdrawalRequests.id, input.id)).limit(1);
    const childId = initialRows[0]?.childId;
    if (!childId) return { ok: false, reason: "not_found", availableCents: 0 };

    const state = await loadAccountState(tx, childId, true);
    if (!state) return { ok: false, reason: "not_found", availableCents: 0 };
    const requestRows = await tx.select().from(withdrawalRequests)
      .where(eq(withdrawalRequests.id, input.id)).limit(1).for("update");
    const request = requestRows[0];
    if (!request || request.status !== "pending") {
      return { ok: false, reason: "not_pending", availableCents: availableFor(state) };
    }

    if (input.status === "approved") {
      const unreserved = state.balanceCents - calculateReservedBalanceCents({
        lockedAmountCents: state.child.lockedAmountCents,
        stakingAmountCents: state.stakingAmountCents,
        pendingWithdrawalCents: state.pendingWithdrawalCents,
      });
      if (unreserved < 0) return { ok: false, reason: "over_reserved", availableCents: 0 };
      await tx.insert(fundingEntries).values({
        childId,
        type: "withdrawal",
        amountCents: request.amountCents,
        currencyCode: "USD",
        note: `Approved withdrawal request #${request.id}`,
      });
      if (state.child.balanceOverrideCents !== null && state.child.balanceOverrideCents !== undefined) {
        await tx.update(children).set({
          balanceOverrideCents: Math.max(0, state.balanceCents - request.amountCents),
          updatedAt: new Date(),
        }).where(eq(children.id, childId));
      }
    }

    await tx.update(withdrawalRequests).set({ status: input.status, reviewedAt: new Date() })
      .where(eq(withdrawalRequests.id, input.id));
    return { ok: true, availableCents: availableFor(state) };
  });
}
