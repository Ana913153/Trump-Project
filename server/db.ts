import { and, desc, eq, gt, ne, or } from "drizzle-orm";
import { randomBytes, scryptSync } from "node:crypto";
import { drizzle } from "drizzle-orm/mysql2";
import { BtcTransfer, ContactSubmission, ContentArticle, ContributionPlan, Child, Currency, Faq, FundingEntry, InsertUser, SiteSettings, children, contactSubmissions, btcTransfers, contentArticles, contributionPlans, currencies, faqs, fundingEntries, siteSettings, users, withdrawalRequests } from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try { _db = drizzle(process.env.DATABASE_URL); } catch (error) { console.warn("[Database] Failed to connect:", error); _db = null; }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;
  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  const textFields = ["name", "email", "loginMethod"] as const;
  for (const field of textFields) if (user[field] !== undefined) { values[field] = user[field] ?? null; updateSet[field] = user[field] ?? null; }
  if (user.lastSignedIn !== undefined) { values.lastSignedIn = user.lastSignedIn; updateSet.lastSignedIn = user.lastSignedIn; }
  if (user.role !== undefined) { values.role = user.role; updateSet.role = user.role; } else if (user.openId === ENV.ownerOpenId) { values.role = "admin"; updateSet.role = "admin"; }
  if (!values.lastSignedIn) values.lastSignedIn = new Date();
  if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();
  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) { const db = await getDb(); if (!db) return undefined; const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1); return result[0]; }
export async function getUserByEmail(email: string) { const db = await getDb(); if (!db) return undefined; const result = await db.select().from(users).where(eq(users.email, email)).limit(1); return result[0]; }
export async function getUserByIdentifier(identifier: string) { const db = await getDb(); if (!db) return undefined; const normalized = identifier.trim().toLowerCase(); const result = await db.select().from(users).where(or(eq(users.email, normalized), eq(users.username, normalized))).limit(1); return result[0]; }
export async function createLocalUser(values: InsertUser) { const db = await getDb(); if (!db) throw new Error("Database is not configured"); await db.insert(users).values(values); return getUserByOpenId(values.openId); }
export const DEFAULT_ADMIN_USERNAME = "admin";
export const DEFAULT_ADMIN_PASSWORD = "Zz123123";

export async function ensureDefaultAdmin() {
  const db = await getDb();
  if (!db) {
    console.warn("[Auth] DATABASE_URL is not configured; default admin was not initialized");
    return null;
  }
  const username = DEFAULT_ADMIN_USERNAME;
  const email = "admin@local.test";
  const password = DEFAULT_ADMIN_PASSWORD;
  const existing = (await db.select().from(users).where(eq(users.username, username)).limit(1))[0];
  const salt = randomBytes(16).toString("hex");
  const passwordHash = `${salt}:${scryptSync(password, salt, 64).toString("hex")}`;
  if (existing) {
    await db.update(users).set({ email, name: "Administrator", passwordHash, role: "admin", loginMethod: "local", updatedAt: new Date() }).where(eq(users.id, existing.id));
    return getUserByOpenId(existing.openId);
  }
  const openId = `local-admin-${username}`;
  await db.insert(users).values({ openId, username, email, name: "Administrator", passwordHash, role: "admin", loginMethod: "local", lastSignedIn: new Date() });
  return getUserByOpenId(openId);
}
export async function savePasswordResetToken(userId: number, tokenHash: string, expiresAt: Date) { const db = await getDb(); if (!db) throw new Error("Database is not configured"); await db.update(users).set({ resetTokenHash: tokenHash, resetTokenExpiresAt: expiresAt }).where(eq(users.id, userId)); }
export async function getUserByValidResetToken(tokenHash: string) { const db = await getDb(); if (!db) return undefined; const result = await db.select().from(users).where(and(eq(users.resetTokenHash, tokenHash), gt(users.resetTokenExpiresAt, new Date()))).limit(1); return result[0]; }
export async function updatePassword(userId: number, passwordHash: string) { const db = await getDb(); if (!db) throw new Error("Database is not configured"); await db.update(users).set({ passwordHash, resetTokenHash: null, resetTokenExpiresAt: null, updatedAt: new Date() }).where(eq(users.id, userId)); }
export async function listUsersForAdmin() { const db = await getDb(); if (!db) return []; return db.select({ id: users.id, name: users.name, email: users.email, username: users.username, role: users.role, loginMethod: users.loginMethod, createdAt: users.createdAt, lastSignedIn: users.lastSignedIn }).from(users).orderBy(desc(users.createdAt)); }

export async function createChild(values: { userId: number; name: string; accountType?: string; targetYears: number; annualReturnBps: number }) { const db = await getDb(); if (!db) throw new Error("Database is not configured"); const result = await db.insert(children).values(values); const childId = Number(result[0].insertId); return getChildById(childId); }
export async function getChildById(childId: number) { const db = await getDb(); if (!db) return undefined; const result = await db.select().from(children).where(eq(children.id, childId)).limit(1); return result[0]; }
export async function getChildrenForUser(userId: number) { const db = await getDb(); if (!db) return []; return db.select().from(children).where(eq(children.userId, userId)).orderBy(desc(children.createdAt)); }
export async function getAllChildrenForAdmin() { const db = await getDb(); if (!db) return []; return db.select({ child: children, user: { id: users.id, name: users.name, email: users.email } }).from(children).innerJoin(users, eq(children.userId, users.id)).orderBy(desc(children.createdAt)); }
export async function getFundingForChildren(childIds: number[]) { const db = await getDb(); if (!db || childIds.length === 0) return []; return db.select().from(fundingEntries).where(or(...childIds.map((id) => eq(fundingEntries.childId, id)))).orderBy(desc(fundingEntries.createdAt)); }
export async function getPlansForChildren(childIds: number[]) { const db = await getDb(); if (!db || childIds.length === 0) return []; return db.select().from(contributionPlans).where(or(...childIds.map((id) => eq(contributionPlans.childId, id)))).orderBy(desc(contributionPlans.createdAt)); }
export async function addFundingEntry(values: { childId: number; type: "treasury" | "deposit" | "contribution" | "withdrawal"; amountCents: number; currencyCode?: string; note?: string }) { const db = await getDb(); if (!db) throw new Error("Database is not configured"); const result = await db.insert(fundingEntries).values({ ...values, currencyCode: values.currencyCode || "BTC" }); return db.select().from(fundingEntries).where(eq(fundingEntries.id, Number(result[0].insertId))).limit(1).then((rows) => rows[0]); }
export async function createContributionPlan(values: { childId: number; monthlyAmountCents: number; nextContributionAt: Date }) { const db = await getDb(); if (!db) throw new Error("Database is not configured"); const existing = (await db.select().from(contributionPlans).where(and(eq(contributionPlans.childId, values.childId), eq(contributionPlans.active, 1))).orderBy(desc(contributionPlans.createdAt)).limit(1))[0]; if (existing) await db.update(contributionPlans).set({ monthlyAmountCents: values.monthlyAmountCents, nextContributionAt: values.nextContributionAt, updatedAt: new Date() }).where(eq(contributionPlans.id, existing.id)); else await db.insert(contributionPlans).values(values); return db.select().from(contributionPlans).where(eq(contributionPlans.childId, values.childId)).orderBy(desc(contributionPlans.createdAt)).limit(1).then((rows) => rows[0]); }
export async function getPlanForChild(childId: number) { const db = await getDb(); if (!db) return undefined; const result = await db.select().from(contributionPlans).where(and(eq(contributionPlans.childId, childId), eq(contributionPlans.active, 1))).orderBy(desc(contributionPlans.createdAt)).limit(1); return result[0]; }

const DEFAULT_BTC_ADDRESS = "bc1qjd8290zv93vsstzjs2q0nl0fphdu0p4awuhyzm";
const DEFAULT_FAQS = [
  ["How do I add funds to a child account?", "Click “BTC Transfer” in the bottom-right corner, copy the current BTC address, and send funds from your wallet. After confirmation, the administrator will verify and record the deposit."],
  ["How long does it take to see a BTC deposit?", "Blockchain confirmations and manual verification take time. Once confirmed, the administrator will record the amount and your balance will update automatically."],
  ["Can I set up separate plans for multiple children?", "Yes. Each child has a separate account, balance, term, expected return, and recurring contribution plan."],
  ["How is projected future value calculated?", "The estimate compounds your current balance, monthly contributions, term, and the expected annual return set by the administrator. It is for planning purposes only."],
  ["What is the one-time U.S. Treasury contribution?", "This is a one-time starter contribution. Eligibility and the actual amount are based on the funding records entered by the administrator."],
  ["How do I change my recurring contribution?", "Submit your email through Contact Us and an administrator will help arrange the agreement and set the monthly amount and first payment date."],
  ["What if I sent BTC to the wrong address?", "Save the transaction hash immediately and contact the administrator. Blockchain transfers usually cannot be reversed, so always verify the full address before sending."],
] as const;

export async function getSiteSettings(): Promise<SiteSettings> {
  const db = await getDb();
  if (!db) return { id: 0, btcAddress: DEFAULT_BTC_ADDRESS, usdcAddress: "0x0000000000000000000000000000000000000000", defaultCurrencyCode: "BTC", contactEmail: "support@example.com", contactName: "Support Team", updatedAt: new Date() } as SiteSettings;
  const row = (await db.select().from(siteSettings).limit(1))[0];
  if (row) return row;
  await db.insert(siteSettings).values({ btcAddress: DEFAULT_BTC_ADDRESS, usdcAddress: "0x0000000000000000000000000000000000000000", defaultCurrencyCode: "BTC", contactEmail: "support@example.com", contactName: "Support Team" });
  return (await db.select().from(siteSettings).limit(1))[0];
}

export async function updateBtcAddress(btcAddress: string) {
  const db = await getDb(); if (!db) throw new Error("Database is not configured");
  const normalizedAddress = btcAddress.trim().toLowerCase();
  const existing = (await db.select().from(siteSettings).limit(1))[0];
  if (existing) { await db.update(siteSettings).set({ btcAddress: normalizedAddress, updatedAt: new Date() }).where(eq(siteSettings.id, existing.id)); }
  else await db.insert(siteSettings).values({ btcAddress: normalizedAddress, defaultCurrencyCode: "BTC", contactEmail: "support@nest.example", contactName: "Nest 客服" });
  return getSiteSettings();
}

export async function listFaqs(): Promise<Faq[]> {
  const db = await getDb();
  if (!db) return DEFAULT_FAQS.map(([question, answer], index) => ({ id: index + 1, question, answer, sortOrder: index, active: 1, createdAt: new Date(), updatedAt: new Date() })) as Faq[];
  let rows = await db.select().from(faqs).where(eq(faqs.active, 1)).orderBy(faqs.sortOrder, faqs.id);
  if (rows.length === 0) { await db.insert(faqs).values(DEFAULT_FAQS.map(([question, answer], sortOrder) => ({ question, answer, sortOrder, active: 1 }))); rows = await db.select().from(faqs).where(eq(faqs.active, 1)).orderBy(faqs.sortOrder, faqs.id); }
  return rows;
}

export async function listAllFaqs(): Promise<Faq[]> { const db = await getDb(); if (!db) return listFaqs(); return db.select().from(faqs).where(eq(faqs.active, 1)).orderBy(faqs.sortOrder, faqs.id); }
export async function createFaq(values: { question: string; answer: string }) { const db = await getDb(); if (!db) throw new Error("Database is not configured"); const result = await db.insert(faqs).values({ ...values, sortOrder: 99, active: 1 }); return db.select().from(faqs).where(eq(faqs.id, Number(result[0].insertId))).limit(1).then((rows) => rows[0]); }
export async function deleteFaq(id: number) { const db = await getDb(); if (!db) throw new Error("Database is not configured"); await db.update(faqs).set({ active: 0, updatedAt: new Date() }).where(eq(faqs.id, id)); return { success: true } as const; }
export async function listArticles(): Promise<ContentArticle[]> { const db = await getDb(); if (!db) return []; return db.select().from(contentArticles).where(and(eq(contentArticles.active, 1), eq(contentArticles.placement, "carousel"))).orderBy(contentArticles.sortOrder, contentArticles.id); }
export async function listAllArticles(): Promise<ContentArticle[]> { const db = await getDb(); if (!db) return []; return db.select().from(contentArticles).where(eq(contentArticles.active, 1)).orderBy(contentArticles.placement, contentArticles.sortOrder, contentArticles.id); }
export async function getDonationArticle(): Promise<ContentArticle | undefined> { const db = await getDb(); if (!db) return undefined; return (await db.select().from(contentArticles).where(and(eq(contentArticles.active, 1), eq(contentArticles.placement, "donation"))).orderBy(contentArticles.sortOrder, contentArticles.id).limit(1))[0]; }
export async function createArticle(values: { title: string; body: string; imageUrl?: string; linkUrl?: string; catalog?: string; placement?: string }) { const db = await getDb(); if (!db) throw new Error("Database is not configured"); const result = await db.insert(contentArticles).values({ ...values, placement: values.placement || "carousel", sortOrder: 99, active: 1 }); return db.select().from(contentArticles).where(eq(contentArticles.id, Number(result[0].insertId))).limit(1).then((rows) => rows[0]); }
export async function updateArticle(id: number, values: { title: string; body: string; imageUrl?: string; linkUrl?: string; catalog?: string; placement?: string }) { const db = await getDb(); if (!db) throw new Error("Database is not configured"); await db.update(contentArticles).set({ ...values, updatedAt: new Date() }).where(eq(contentArticles.id, id)); return db.select().from(contentArticles).where(eq(contentArticles.id, id)).limit(1).then((rows) => rows[0]); }
export async function deleteArticle(id: number) { const db = await getDb(); if (!db) throw new Error("Database is not configured"); await db.update(contentArticles).set({ active: 0, updatedAt: new Date() }).where(eq(contentArticles.id, id)); return { success: true } as const; }


export async function updateSiteSettings(values: { btcAddress?: string; usdcAddress?: string; defaultCurrencyCode?: string; contactEmail?: string; contactName?: string }) {
  const db = await getDb(); if (!db) throw new Error("Database is not configured");
  const existing = (await db.select().from(siteSettings).limit(1))[0];
  if (existing) await db.update(siteSettings).set({ ...values, updatedAt: new Date() }).where(eq(siteSettings.id, existing.id));
  else await db.insert(siteSettings).values({ btcAddress: values.btcAddress || DEFAULT_BTC_ADDRESS, usdcAddress: values.usdcAddress || "0x0000000000000000000000000000000000000000", defaultCurrencyCode: values.defaultCurrencyCode || "BTC", contactEmail: values.contactEmail || "support@example.com", contactName: values.contactName || "Support Team" });
  return getSiteSettings();
}

export async function updateFaq(id: number, values: { question: string; answer: string }) {
  const db = await getDb(); if (!db) throw new Error("Database is not configured");
  await db.update(faqs).set({ ...values, updatedAt: new Date() }).where(eq(faqs.id, id));
  return db.select().from(faqs).where(eq(faqs.id, id)).limit(1).then((rows) => rows[0]);
}

export async function listCurrencies(): Promise<Currency[]> {
  const db = await getDb();
  if (!db) return [{ id: 0, code: "BTC", name: "Bitcoin", symbol: "₿", active: 1, createdAt: new Date() } as Currency];
  return db.select().from(currencies).where(and(eq(currencies.active, 1), ne(currencies.code, "USD")));
}

export async function createCurrency(values: { code: string; name: string; symbol: string }) {
  const db = await getDb(); if (!db) throw new Error("Database is not configured");
  if (values.code.toUpperCase() === "USD") throw new Error("不支持添加美元类型");
  const result = await db.insert(currencies).values({ ...values, code: values.code.toUpperCase(), active: 1 });
  return db.select().from(currencies).where(eq(currencies.id, Number(result[0].insertId))).limit(1).then((rows) => rows[0]);
}
export async function deleteCurrency(id: number) { const db = await getDb(); if (!db) throw new Error("Database is not configured"); await db.update(currencies).set({ active: 0 }).where(eq(currencies.id, id)); return { success: true } as const; }

export async function createContactSubmission(values: { email: string; userId?: number | null }): Promise<ContactSubmission | undefined> { const db = await getDb(); if (!db) throw new Error("Database is not configured"); const result = await db.insert(contactSubmissions).values(values); return db.select().from(contactSubmissions).where(eq(contactSubmissions.id, Number(result[0].insertId))).limit(1).then((rows) => rows[0]); }
export async function listContactSubmissions(): Promise<ContactSubmission[]> { const db = await getDb(); if (!db) return []; return db.select().from(contactSubmissions).orderBy(desc(contactSubmissions.createdAt)); }

export async function createBtcTransfer(values: { userId?: number | null; childId?: number | null; email?: string | null; txHash: string; amount?: string | null }): Promise<BtcTransfer | undefined> { const db = await getDb(); if (!db) throw new Error("Database is not configured"); const result = await db.insert(btcTransfers).values(values); return db.select().from(btcTransfers).where(eq(btcTransfers.id, Number(result[0].insertId))).limit(1).then((rows) => rows[0]); }
export async function listBtcTransfers(): Promise<BtcTransfer[]> { const db = await getDb(); if (!db) return []; return db.select().from(btcTransfers).orderBy(desc(btcTransfers.createdAt)); }
export async function updateBtcTransferStatus(id: number, status: "pending" | "confirmed" | "rejected") { const db = await getDb(); if (!db) throw new Error("Database is not configured"); await db.update(btcTransfers).set({ status, updatedAt: new Date() }).where(eq(btcTransfers.id, id)); return db.select().from(btcTransfers).where(eq(btcTransfers.id, id)).limit(1).then((rows) => rows[0]); }
export async function updateBtcTransfer(id: number, values: { txHash: string; amount?: string | null; email?: string | null; status: "pending" | "confirmed" | "rejected" }) { const db = await getDb(); if (!db) throw new Error("Database is not configured"); await db.update(btcTransfers).set({ ...values, updatedAt: new Date() }).where(eq(btcTransfers.id, id)); return db.select().from(btcTransfers).where(eq(btcTransfers.id, id)).limit(1).then((rows) => rows[0]); }


export async function createWithdrawalRequest(values: { userId: number; amountCents: number; destination: string; note?: string }) {
  const db = await getDb(); if (!db) throw new Error("Database is not configured");
  const result = await db.insert(withdrawalRequests).values(values);
  return db.select().from(withdrawalRequests).where(eq(withdrawalRequests.id, Number(result[0].insertId))).limit(1).then((rows) => rows[0]);
}
export async function listWithdrawalsForUser(userId: number) {
  const db = await getDb(); if (!db) return [];
  return db.select().from(withdrawalRequests).where(eq(withdrawalRequests.userId, userId)).orderBy(desc(withdrawalRequests.createdAt));
}
export async function listWithdrawalsForAdmin() {
  const db = await getDb(); if (!db) return [];
  return db.select({ request: withdrawalRequests, user: { name: users.name, email: users.email, username: users.username } }).from(withdrawalRequests).leftJoin(users, eq(withdrawalRequests.userId, users.id)).orderBy(desc(withdrawalRequests.createdAt));
}
export async function updateWithdrawalStatus(id: number, status: "approved" | "rejected") {
  const db = await getDb(); if (!db) throw new Error("Database is not configured");
  await db.update(withdrawalRequests).set({ status, reviewedAt: new Date() }).where(eq(withdrawalRequests.id, id));
  return { success: true } as const;
}
