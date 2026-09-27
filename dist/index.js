var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// drizzle/schema.ts
var schema_exports = {};
__export(schema_exports, {
  btcTransfers: () => btcTransfers,
  children: () => children,
  contactSubmissions: () => contactSubmissions,
  contentArticles: () => contentArticles,
  contributionPlans: () => contributionPlans,
  currencies: () => currencies,
  faqs: () => faqs,
  footerLinks: () => footerLinks,
  fundingEntries: () => fundingEntries,
  projectMilestones: () => projectMilestones,
  projectPeople: () => projectPeople,
  projectProgress: () => projectProgress,
  siteSettings: () => siteSettings,
  stakingPositions: () => stakingPositions,
  userMessages: () => userMessages,
  users: () => users,
  withdrawalRequests: () => withdrawalRequests
});
import { index, int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";
var users, children, stakingPositions, fundingEntries, contributionPlans, siteSettings, currencies, faqs, contentArticles, footerLinks, userMessages, contactSubmissions, btcTransfers, withdrawalRequests, projectProgress, projectMilestones, projectPeople;
var init_schema = __esm({
  "drizzle/schema.ts"() {
    "use strict";
    users = mysqlTable("users", {
      id: int("id").autoincrement().primaryKey(),
      openId: varchar("openId", { length: 64 }).notNull().unique(),
      name: text("name"),
      email: varchar("email", { length: 320 }).unique(),
      username: varchar("username", { length: 64 }).unique(),
      passwordHash: varchar("passwordHash", { length: 255 }),
      resetTokenHash: varchar("resetTokenHash", { length: 64 }).unique(),
      resetTokenExpiresAt: timestamp("resetTokenExpiresAt"),
      loginMethod: varchar("loginMethod", { length: 64 }),
      role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
      lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull()
    });
    children = mysqlTable("children", { id: int("id").autoincrement().primaryKey(), userId: int("userId").notNull(), name: varchar("name", { length: 80 }).notNull(), accountType: varchar("accountType", { length: 80 }).default("Gold Eagle Growth Account").notNull(), targetYears: int("targetYears").default(18).notNull(), planStartedAt: timestamp("planStartedAt").defaultNow().notNull(), annualReturnBps: int("annualReturnBps").default(600).notNull(), balanceOverrideCents: int("balanceOverrideCents"), stakingAmountCents: int("stakingAmountCents").default(0).notNull(), stakingDays: int("stakingDays").default(30).notNull(), stakingStartedAt: timestamp("stakingStartedAt"), lockedAmountCents: int("lockedAmountCents").default(0).notNull(), lockedAt: timestamp("lockedAt"), createdAt: timestamp("createdAt").defaultNow().notNull(), updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull() });
    stakingPositions = mysqlTable("stakingPositions", { id: int("id").autoincrement().primaryKey(), childId: int("childId").notNull(), amountCents: int("amountCents").notNull(), stakingDays: int("stakingDays").notNull(), dailyRateBps: int("dailyRateBps").notNull(), startedAt: timestamp("startedAt").notNull(), maturesAt: timestamp("maturesAt").notNull(), status: mysqlEnum("status", ["active", "released"]).default("active").notNull(), releaseReason: mysqlEnum("releaseReason", ["matured", "admin"]), releasedAt: timestamp("releasedAt"), createdAt: timestamp("createdAt").defaultNow().notNull() }, (table) => ({ childStatusIndex: index("stakingPositions_child_status_idx").on(table.childId, table.status), maturityIndex: index("stakingPositions_maturity_idx").on(table.maturesAt) }));
    fundingEntries = mysqlTable("fundingEntries", { id: int("id").autoincrement().primaryKey(), childId: int("childId").notNull(), type: mysqlEnum("type", ["treasury", "deposit", "contribution", "withdrawal"]).notNull(), amountCents: int("amountCents").notNull(), currencyCode: varchar("currencyCode", { length: 12 }).default("USD").notNull(), note: varchar("note", { length: 255 }), createdAt: timestamp("createdAt").defaultNow().notNull() });
    contributionPlans = mysqlTable("contributionPlans", { id: int("id").autoincrement().primaryKey(), childId: int("childId").notNull(), monthlyAmountCents: int("monthlyAmountCents").notNull(), frequency: mysqlEnum("frequency", ["monthly"]).default("monthly").notNull(), active: int("active").default(1).notNull(), nextContributionAt: timestamp("nextContributionAt"), createdAt: timestamp("createdAt").defaultNow().notNull(), updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull() });
    siteSettings = mysqlTable("siteSettings", { id: int("id").autoincrement().primaryKey(), btcAddress: varchar("btcAddress", { length: 128 }).notNull(), usdcAddress: varchar("usdcAddress", { length: 128 }).default("0x0000000000000000000000000000000000000000").notNull(), defaultCurrencyCode: varchar("defaultCurrencyCode", { length: 12 }).default("BTC").notNull(), contactEmail: varchar("contactEmail", { length: 320 }).default("support@example.com").notNull(), contactName: varchar("contactName", { length: 100 }).default("Support Team").notNull(), updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull() });
    currencies = mysqlTable("currencies", { id: int("id").autoincrement().primaryKey(), code: varchar("code", { length: 12 }).notNull().unique(), name: varchar("name", { length: 80 }).notNull(), symbol: varchar("symbol", { length: 8 }).notNull(), active: int("active").default(1).notNull(), createdAt: timestamp("createdAt").defaultNow().notNull() });
    faqs = mysqlTable("faqs", { id: int("id").autoincrement().primaryKey(), question: varchar("question", { length: 255 }).notNull(), answer: text("answer").notNull(), sortOrder: int("sortOrder").default(0).notNull(), active: int("active").default(1).notNull(), createdAt: timestamp("createdAt").defaultNow().notNull(), updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull() });
    contentArticles = mysqlTable("contentArticles", { id: int("id").autoincrement().primaryKey(), title: varchar("title", { length: 160 }).notNull(), body: text("body").notNull(), imageUrl: varchar("imageUrl", { length: 500 }), linkUrl: varchar("linkUrl", { length: 500 }), catalog: varchar("catalog", { length: 120 }), placement: varchar("placement", { length: 20 }).default("carousel").notNull(), sortOrder: int("sortOrder").default(0).notNull(), active: int("active").default(1).notNull(), createdAt: timestamp("createdAt").defaultNow().notNull(), updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull() });
    footerLinks = mysqlTable("footerLinks", { id: int("id").autoincrement().primaryKey(), title: varchar("title", { length: 120 }).notNull(), url: varchar("url", { length: 500 }).notNull(), body: text("body"), sortOrder: int("sortOrder").default(0).notNull(), active: int("active").default(1).notNull(), createdAt: timestamp("createdAt").defaultNow().notNull(), updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull() });
    userMessages = mysqlTable("userMessages", { id: int("id").autoincrement().primaryKey(), userId: int("userId").notNull(), title: varchar("title", { length: 160 }).notNull(), body: text("body").notNull(), readAt: timestamp("readAt"), createdAt: timestamp("createdAt").defaultNow().notNull() });
    contactSubmissions = mysqlTable("contactSubmissions", { id: int("id").autoincrement().primaryKey(), email: varchar("email", { length: 320 }).notNull(), userId: int("userId"), status: mysqlEnum("status", ["new", "contacted", "closed"]).default("new").notNull(), createdAt: timestamp("createdAt").defaultNow().notNull(), updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull() });
    btcTransfers = mysqlTable("btcTransfers", { id: int("id").autoincrement().primaryKey(), userId: int("userId"), childId: int("childId"), email: varchar("email", { length: 320 }), txHash: varchar("txHash", { length: 160 }).notNull(), amount: varchar("amount", { length: 64 }), currencyCode: varchar("currencyCode", { length: 12 }).default("BTC").notNull(), status: mysqlEnum("status", ["pending", "confirmed", "rejected"]).default("pending").notNull(), note: varchar("note", { length: 255 }), createdAt: timestamp("createdAt").defaultNow().notNull(), updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull() });
    withdrawalRequests = mysqlTable("withdrawalRequests", { id: int("id").autoincrement().primaryKey(), userId: int("userId").notNull(), childId: int("childId").notNull(), amountCents: int("amountCents").notNull(), destination: varchar("destination", { length: 255 }).notNull(), note: varchar("note", { length: 500 }), status: mysqlEnum("status", ["pending", "approved", "rejected"]).default("pending").notNull(), createdAt: timestamp("createdAt").defaultNow().notNull(), reviewedAt: timestamp("reviewedAt") }, (table) => ({ childIdIndex: index("withdrawalRequests_childId_idx").on(table.childId) }));
    projectProgress = mysqlTable("project_progress", { id: int("id").autoincrement().primaryKey(), title: varchar("title", { length: 160 }).notNull(), description: text("description").notNull(), imageUrl: varchar("imageUrl", { length: 500 }), targetAmountCents: int("targetAmountCents").default(0).notNull(), raisedAmountCents: int("raisedAmountCents").default(0).notNull(), currencyCode: varchar("currencyCode", { length: 12 }).default("USD").notNull(), eyebrow: varchar("eyebrow", { length: 120 }).default("Project Transparency").notNull(), sectionTitle: varchar("sectionTitle", { length: 160 }).default("Community Project Progress").notNull(), milestonesLabel: varchar("milestonesLabel", { length: 120 }).default("Milestones").notNull(), milestonesTitle: varchar("milestonesTitle", { length: 120 }).default("Project Milestones").notNull(), peopleLabel: varchar("peopleLabel", { length: 120 }).default("Team").notNull(), peopleTitle: varchar("peopleTitle", { length: 120 }).default("Project Team").notNull(), updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull() });
    projectMilestones = mysqlTable("project_milestones", { id: int("id").autoincrement().primaryKey(), title: varchar("title", { length: 160 }).notNull(), description: text("description").notNull(), sortOrder: int("sortOrder").default(0).notNull(), createdAt: timestamp("createdAt").defaultNow().notNull(), updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull() });
    projectPeople = mysqlTable("project_people", { id: int("id").autoincrement().primaryKey(), name: varchar("name", { length: 120 }).notNull(), role: varchar("role", { length: 160 }).notNull(), bio: text("bio").notNull(), imageUrl: varchar("imageUrl", { length: 500 }), sortOrder: int("sortOrder").default(0).notNull(), createdAt: timestamp("createdAt").defaultNow().notNull(), updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull() });
  }
});

// server/_core/env.ts
var ENV;
var init_env = __esm({
  "server/_core/env.ts"() {
    "use strict";
    ENV = {
      appId: process.env.VITE_APP_ID ?? "",
      cookieSecret: process.env.JWT_SECRET ?? "",
      databaseUrl: process.env.DATABASE_URL ?? "",
      oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
      ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
      isProduction: process.env.NODE_ENV === "production",
      forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
      forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? ""
    };
  }
});

// server/db.ts
var db_exports = {};
__export(db_exports, {
  DEFAULT_ADMIN_USERNAME: () => DEFAULT_ADMIN_USERNAME,
  addFundingEntry: () => addFundingEntry,
  createAnnouncement: () => createAnnouncement,
  createArticle: () => createArticle,
  createBtcTransfer: () => createBtcTransfer,
  createChild: () => createChild,
  createContactSubmission: () => createContactSubmission,
  createContributionPlan: () => createContributionPlan,
  createCurrency: () => createCurrency,
  createFaq: () => createFaq,
  createFooterLink: () => createFooterLink,
  createLocalUser: () => createLocalUser,
  createProjectMilestone: () => createProjectMilestone,
  createProjectPerson: () => createProjectPerson,
  createUserMessage: () => createUserMessage,
  deleteAnnouncement: () => deleteAnnouncement,
  deleteArticle: () => deleteArticle,
  deleteCurrency: () => deleteCurrency,
  deleteFaq: () => deleteFaq,
  deleteFooterLink: () => deleteFooterLink,
  deleteProjectMilestone: () => deleteProjectMilestone,
  deleteProjectPerson: () => deleteProjectPerson,
  ensureDefaultAdmin: () => ensureDefaultAdmin,
  getAllChildrenForAdmin: () => getAllChildrenForAdmin,
  getChildById: () => getChildById,
  getChildrenForUser: () => getChildrenForUser,
  getDb: () => getDb,
  getDonationArticle: () => getDonationArticle,
  getFundingForChildren: () => getFundingForChildren,
  getPlanForChild: () => getPlanForChild,
  getPlansForChildren: () => getPlansForChildren,
  getProjectContent: () => getProjectContent,
  getPublishedAnnouncement: () => getPublishedAnnouncement,
  getSiteSettings: () => getSiteSettings,
  getUserByEmail: () => getUserByEmail,
  getUserByIdentifier: () => getUserByIdentifier,
  getUserByOpenId: () => getUserByOpenId,
  getUserByValidResetToken: () => getUserByValidResetToken,
  listAllArticles: () => listAllArticles,
  listAllFaqs: () => listAllFaqs,
  listAllFooterLinks: () => listAllFooterLinks,
  listAnnouncementsForAdmin: () => listAnnouncementsForAdmin,
  listArticles: () => listArticles,
  listBtcTransfers: () => listBtcTransfers,
  listContactSubmissions: () => listContactSubmissions,
  listCurrencies: () => listCurrencies,
  listFaqs: () => listFaqs,
  listFooterLinks: () => listFooterLinks,
  listMessagesForUser: () => listMessagesForUser,
  listStakingPositionsForChild: () => listStakingPositionsForChild,
  listUsersForAdmin: () => listUsersForAdmin,
  listWithdrawalsForAdmin: () => listWithdrawalsForAdmin,
  listWithdrawalsForUser: () => listWithdrawalsForUser,
  markUserMessageRead: () => markUserMessageRead,
  savePasswordResetToken: () => savePasswordResetToken,
  setAnnouncementActive: () => setAnnouncementActive,
  updateAnnouncement: () => updateAnnouncement,
  updateArticle: () => updateArticle,
  updateBtcAddress: () => updateBtcAddress,
  updateBtcTransfer: () => updateBtcTransfer,
  updateBtcTransferStatus: () => updateBtcTransferStatus,
  updateFaq: () => updateFaq,
  updateFooterLink: () => updateFooterLink,
  updatePassword: () => updatePassword,
  updateProjectMilestone: () => updateProjectMilestone,
  updateProjectPerson: () => updateProjectPerson,
  updateProjectProgress: () => updateProjectProgress,
  updateSiteSettings: () => updateSiteSettings,
  upsertUser: () => upsertUser
});
import { and, desc, eq, gt, ne, or } from "drizzle-orm";
import { randomBytes, scryptSync } from "node:crypto";
import { drizzle } from "drizzle-orm/mysql2";
async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}
async function upsertUser(user) {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;
  const values = { openId: user.openId };
  const updateSet = {};
  const textFields = ["name", "email", "loginMethod"];
  for (const field of textFields) if (user[field] !== void 0) {
    values[field] = user[field] ?? null;
    updateSet[field] = user[field] ?? null;
  }
  if (user.lastSignedIn !== void 0) {
    values.lastSignedIn = user.lastSignedIn;
    updateSet.lastSignedIn = user.lastSignedIn;
  }
  if (user.role !== void 0) {
    values.role = user.role;
    updateSet.role = user.role;
  } else if (user.openId === ENV.ownerOpenId) {
    values.role = "admin";
    updateSet.role = "admin";
  }
  if (!values.lastSignedIn) values.lastSignedIn = /* @__PURE__ */ new Date();
  if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = /* @__PURE__ */ new Date();
  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}
async function getUserByOpenId(openId) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}
async function getUserByEmail(email) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result[0];
}
async function getUserByIdentifier(identifier) {
  const db = await getDb();
  if (!db) return void 0;
  const normalized = identifier.trim().toLowerCase();
  const result = await db.select().from(users).where(or(eq(users.email, normalized), eq(users.username, normalized))).limit(1);
  return result[0];
}
async function createLocalUser(values) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  await db.insert(users).values(values);
  return getUserByOpenId(values.openId);
}
async function ensureDefaultAdmin() {
  const db = await getDb();
  if (!db) {
    console.warn("[Auth] DATABASE_URL is not configured; admin initialization was skipped");
    return null;
  }
  const username = process.env.ADMIN_USERNAME?.trim() || DEFAULT_ADMIN_USERNAME;
  const email = process.env.ADMIN_EMAIL?.trim() || "admin@local.test";
  const existing = (await db.select().from(users).where(eq(users.username, username)).limit(1))[0];
  if (existing) {
    if (existing.role !== "admin") throw new Error("Configured administrator username is already owned by a non-admin user");
    return existing;
  }
  const password = process.env.ADMIN_INITIAL_PASSWORD;
  if (!password || password.length < 8 || !/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/\d/.test(password)) {
    console.warn("[Auth] ADMIN_INITIAL_PASSWORD is missing or does not meet the password policy; no default admin was created");
    return null;
  }
  const salt = randomBytes(16).toString("hex");
  const passwordHash = `${salt}:${scryptSync(password, salt, 64).toString("hex")}`;
  const openId = `local-admin-${username}`;
  await db.insert(users).values({ openId, username, email, name: "Administrator", passwordHash, role: "admin", loginMethod: "local", lastSignedIn: /* @__PURE__ */ new Date() });
  return getUserByOpenId(openId);
}
async function savePasswordResetToken(userId, tokenHash, expiresAt) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  await db.update(users).set({ resetTokenHash: tokenHash, resetTokenExpiresAt: expiresAt }).where(eq(users.id, userId));
}
async function getUserByValidResetToken(tokenHash) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db.select().from(users).where(and(eq(users.resetTokenHash, tokenHash), gt(users.resetTokenExpiresAt, /* @__PURE__ */ new Date()))).limit(1);
  return result[0];
}
async function updatePassword(userId, passwordHash) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  await db.update(users).set({ passwordHash, resetTokenHash: null, resetTokenExpiresAt: null, updatedAt: /* @__PURE__ */ new Date() }).where(eq(users.id, userId));
}
async function createUserMessage(values) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  const result = await db.insert(userMessages).values(values);
  return db.select().from(userMessages).where(eq(userMessages.id, Number(result[0].insertId))).limit(1).then((rows) => rows[0]);
}
async function listMessagesForUser(userId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(userMessages).where(eq(userMessages.userId, userId)).orderBy(desc(userMessages.createdAt));
}
async function markUserMessageRead(userId, id) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  await db.update(userMessages).set({ readAt: /* @__PURE__ */ new Date() }).where(and(eq(userMessages.id, id), eq(userMessages.userId, userId)));
  return { success: true };
}
async function listUsersForAdmin() {
  const db = await getDb();
  if (!db) return [];
  return db.select({ id: users.id, name: users.name, email: users.email, username: users.username, role: users.role, loginMethod: users.loginMethod, createdAt: users.createdAt, lastSignedIn: users.lastSignedIn }).from(users).orderBy(desc(users.createdAt));
}
async function createChild(values) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  const result = await db.insert(children).values(values);
  const childId = Number(result[0].insertId);
  return getChildById(childId);
}
async function getChildById(childId) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db.select().from(children).where(eq(children.id, childId)).limit(1);
  return result[0];
}
async function getChildrenForUser(userId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(children).where(eq(children.userId, userId)).orderBy(desc(children.createdAt));
}
async function getAllChildrenForAdmin() {
  const db = await getDb();
  if (!db) return [];
  return db.select({ child: children, user: { id: users.id, name: users.name, email: users.email } }).from(children).innerJoin(users, eq(children.userId, users.id)).orderBy(desc(children.createdAt));
}
async function listStakingPositionsForChild(childId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(stakingPositions).where(eq(stakingPositions.childId, childId)).orderBy(desc(stakingPositions.createdAt));
}
async function getFundingForChildren(childIds) {
  const db = await getDb();
  if (!db || childIds.length === 0) return [];
  return db.select().from(fundingEntries).where(or(...childIds.map((id) => eq(fundingEntries.childId, id)))).orderBy(desc(fundingEntries.createdAt));
}
async function getPlansForChildren(childIds) {
  const db = await getDb();
  if (!db || childIds.length === 0) return [];
  return db.select().from(contributionPlans).where(or(...childIds.map((id) => eq(contributionPlans.childId, id)))).orderBy(desc(contributionPlans.createdAt));
}
async function addFundingEntry(values) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  const result = await db.insert(fundingEntries).values({ ...values, currencyCode: values.currencyCode || "BTC" });
  return db.select().from(fundingEntries).where(eq(fundingEntries.id, Number(result[0].insertId))).limit(1).then((rows) => rows[0]);
}
async function createContributionPlan(values) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  const existing = (await db.select().from(contributionPlans).where(and(eq(contributionPlans.childId, values.childId), eq(contributionPlans.active, 1))).orderBy(desc(contributionPlans.createdAt)).limit(1))[0];
  if (existing) await db.update(contributionPlans).set({ monthlyAmountCents: values.monthlyAmountCents, nextContributionAt: values.nextContributionAt, updatedAt: /* @__PURE__ */ new Date() }).where(eq(contributionPlans.id, existing.id));
  else await db.insert(contributionPlans).values(values);
  return db.select().from(contributionPlans).where(eq(contributionPlans.childId, values.childId)).orderBy(desc(contributionPlans.createdAt)).limit(1).then((rows) => rows[0]);
}
async function getPlanForChild(childId) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db.select().from(contributionPlans).where(and(eq(contributionPlans.childId, childId), eq(contributionPlans.active, 1))).orderBy(desc(contributionPlans.createdAt)).limit(1);
  return result[0];
}
async function getSiteSettings() {
  const db = await getDb();
  if (!db) return { id: 0, btcAddress: DEFAULT_BTC_ADDRESS, usdcAddress: "0x0000000000000000000000000000000000000000", defaultCurrencyCode: "BTC", contactEmail: "support@example.com", contactName: "Support Team", updatedAt: /* @__PURE__ */ new Date() };
  const row = (await db.select().from(siteSettings).limit(1))[0];
  if (row) return row;
  await db.insert(siteSettings).values({ btcAddress: DEFAULT_BTC_ADDRESS, usdcAddress: "0x0000000000000000000000000000000000000000", defaultCurrencyCode: "BTC", contactEmail: "support@example.com", contactName: "Support Team" });
  return (await db.select().from(siteSettings).limit(1))[0];
}
async function updateBtcAddress(btcAddress) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  const normalizedAddress = btcAddress.trim().toLowerCase();
  const existing = (await db.select().from(siteSettings).limit(1))[0];
  if (existing) {
    await db.update(siteSettings).set({ btcAddress: normalizedAddress, updatedAt: /* @__PURE__ */ new Date() }).where(eq(siteSettings.id, existing.id));
  } else await db.insert(siteSettings).values({ btcAddress: normalizedAddress, defaultCurrencyCode: "BTC", contactEmail: "support@example.com", contactName: "Nest Support" });
  return getSiteSettings();
}
async function listFaqs() {
  const db = await getDb();
  if (!db) return DEFAULT_FAQS.map(([question, answer], index2) => ({ id: index2 + 1, question, answer, sortOrder: index2, active: 1, createdAt: /* @__PURE__ */ new Date(), updatedAt: /* @__PURE__ */ new Date() }));
  let rows = await db.select().from(faqs).where(eq(faqs.active, 1)).orderBy(faqs.sortOrder, faqs.id);
  if (rows.length === 0) {
    await db.insert(faqs).values(DEFAULT_FAQS.map(([question, answer], sortOrder) => ({ question, answer, sortOrder, active: 1 })));
    rows = await db.select().from(faqs).where(eq(faqs.active, 1)).orderBy(faqs.sortOrder, faqs.id);
  }
  return rows;
}
async function listAllFaqs() {
  const db = await getDb();
  if (!db) return listFaqs();
  return db.select().from(faqs).where(eq(faqs.active, 1)).orderBy(faqs.sortOrder, faqs.id);
}
async function createFaq(values) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  const result = await db.insert(faqs).values({ ...values, sortOrder: 99, active: 1 });
  return db.select().from(faqs).where(eq(faqs.id, Number(result[0].insertId))).limit(1).then((rows) => rows[0]);
}
async function deleteFaq(id) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  await db.update(faqs).set({ active: 0, updatedAt: /* @__PURE__ */ new Date() }).where(eq(faqs.id, id));
  return { success: true };
}
async function listFooterLinks() {
  const db = await getDb();
  const fallback = DEFAULT_FOOTER_LINKS.map(([title, url], index2) => ({ id: index2 + 1, title, url, body: null, sortOrder: index2, active: 1 }));
  if (!db) return fallback;
  const rows = await db.select().from(footerLinks).where(eq(footerLinks.active, 1)).orderBy(footerLinks.sortOrder, footerLinks.id);
  return rows.length ? rows : fallback;
}
async function createFooterLink(values) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  const result = await db.insert(footerLinks).values({ ...values, sortOrder: 99, active: 1 });
  return db.select().from(footerLinks).where(eq(footerLinks.id, Number(result[0].insertId))).limit(1).then((rows) => rows[0]);
}
async function updateFooterLink(id, values) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  await db.update(footerLinks).set({ ...values, updatedAt: /* @__PURE__ */ new Date() }).where(eq(footerLinks.id, id));
  return db.select().from(footerLinks).where(eq(footerLinks.id, id)).limit(1).then((rows) => rows[0]);
}
async function deleteFooterLink(id) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  await db.update(footerLinks).set({ active: 0, updatedAt: /* @__PURE__ */ new Date() }).where(eq(footerLinks.id, id));
  return { success: true };
}
async function listArticles() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(contentArticles).where(and(eq(contentArticles.active, 1), eq(contentArticles.placement, "carousel"))).orderBy(contentArticles.sortOrder, contentArticles.id);
}
async function getPublishedAnnouncement() {
  const db = await getDb();
  if (!db) return void 0;
  return (await db.select().from(contentArticles).where(and(eq(contentArticles.active, 1), eq(contentArticles.placement, "announcement"))).orderBy(desc(contentArticles.createdAt), desc(contentArticles.id)).limit(1))[0];
}
async function listAnnouncementsForAdmin() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(contentArticles).where(eq(contentArticles.placement, "announcement")).orderBy(desc(contentArticles.createdAt), desc(contentArticles.id));
}
async function createAnnouncement(values) {
  return createArticle({ title: values.title, body: values.body, imageUrl: values.imageUrl || "/gold-eagle-initiative.png", placement: "announcement" });
}
async function updateAnnouncement(id, values) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  await db.update(contentArticles).set({ title: values.title, body: values.body, imageUrl: values.imageUrl || "/gold-eagle-initiative.png", placement: "announcement", updatedAt: /* @__PURE__ */ new Date() }).where(and(eq(contentArticles.id, id), eq(contentArticles.placement, "announcement")));
  return db.select().from(contentArticles).where(eq(contentArticles.id, id)).limit(1).then((rows) => rows[0]);
}
async function setAnnouncementActive(id, active) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  await db.update(contentArticles).set({ active: active ? 1 : 0, updatedAt: /* @__PURE__ */ new Date() }).where(and(eq(contentArticles.id, id), eq(contentArticles.placement, "announcement")));
  return { success: true };
}
async function deleteAnnouncement(id) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  await db.delete(contentArticles).where(and(eq(contentArticles.id, id), eq(contentArticles.placement, "announcement")));
  return { success: true };
}
async function listAllFooterLinks() {
  return listFooterLinks();
}
async function listAllArticles() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(contentArticles).where(eq(contentArticles.active, 1)).orderBy(contentArticles.placement, contentArticles.sortOrder, contentArticles.id);
}
async function getDonationArticle() {
  const db = await getDb();
  if (!db) return void 0;
  return (await db.select().from(contentArticles).where(and(eq(contentArticles.active, 1), eq(contentArticles.placement, "donation"))).orderBy(contentArticles.sortOrder, contentArticles.id).limit(1))[0];
}
async function createArticle(values) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  const result = await db.insert(contentArticles).values({ ...values, placement: values.placement || "carousel", sortOrder: 99, active: 1 });
  return db.select().from(contentArticles).where(eq(contentArticles.id, Number(result[0].insertId))).limit(1).then((rows) => rows[0]);
}
async function updateArticle(id, values) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  await db.update(contentArticles).set({ ...values, updatedAt: /* @__PURE__ */ new Date() }).where(eq(contentArticles.id, id));
  return db.select().from(contentArticles).where(eq(contentArticles.id, id)).limit(1).then((rows) => rows[0]);
}
async function deleteArticle(id) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  await db.update(contentArticles).set({ active: 0, updatedAt: /* @__PURE__ */ new Date() }).where(eq(contentArticles.id, id));
  return { success: true };
}
async function updateSiteSettings(values) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  const existing = (await db.select().from(siteSettings).limit(1))[0];
  if (existing) await db.update(siteSettings).set({ ...values, updatedAt: /* @__PURE__ */ new Date() }).where(eq(siteSettings.id, existing.id));
  else await db.insert(siteSettings).values({ btcAddress: values.btcAddress || DEFAULT_BTC_ADDRESS, usdcAddress: values.usdcAddress || "0x0000000000000000000000000000000000000000", defaultCurrencyCode: values.defaultCurrencyCode || "BTC", contactEmail: values.contactEmail || "support@example.com", contactName: values.contactName || "Support Team" });
  return getSiteSettings();
}
async function updateFaq(id, values) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  await db.update(faqs).set({ ...values, updatedAt: /* @__PURE__ */ new Date() }).where(eq(faqs.id, id));
  return db.select().from(faqs).where(eq(faqs.id, id)).limit(1).then((rows) => rows[0]);
}
async function listCurrencies() {
  const db = await getDb();
  if (!db) return [{ id: 0, code: "BTC", name: "Bitcoin", symbol: "\u20BF", active: 1, createdAt: /* @__PURE__ */ new Date() }];
  return db.select().from(currencies).where(and(eq(currencies.active, 1), ne(currencies.code, "USD")));
}
async function createCurrency(values) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  if (values.code.toUpperCase() === "USD") throw new Error("\u4E0D\u652F\u6301\u6DFB\u52A0\u7F8E\u5143\u7C7B\u578B");
  const result = await db.insert(currencies).values({ ...values, code: values.code.toUpperCase(), active: 1 });
  return db.select().from(currencies).where(eq(currencies.id, Number(result[0].insertId))).limit(1).then((rows) => rows[0]);
}
async function deleteCurrency(id) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  await db.update(currencies).set({ active: 0 }).where(eq(currencies.id, id));
  return { success: true };
}
async function createContactSubmission(values) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  const result = await db.insert(contactSubmissions).values(values);
  return db.select().from(contactSubmissions).where(eq(contactSubmissions.id, Number(result[0].insertId))).limit(1).then((rows) => rows[0]);
}
async function listContactSubmissions() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(contactSubmissions).orderBy(desc(contactSubmissions.createdAt));
}
async function createBtcTransfer(values) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  const result = await db.insert(btcTransfers).values({ ...values, currencyCode: values.currencyCode || "BTC" });
  return db.select().from(btcTransfers).where(eq(btcTransfers.id, Number(result[0].insertId))).limit(1).then((rows) => rows[0]);
}
async function listBtcTransfers() {
  const db = await getDb();
  if (!db) return [];
  return db.select({ id: btcTransfers.id, userId: btcTransfers.userId, childId: btcTransfers.childId, email: btcTransfers.email, txHash: btcTransfers.txHash, amount: btcTransfers.amount, currencyCode: btcTransfers.currencyCode, status: btcTransfers.status, note: btcTransfers.note, createdAt: btcTransfers.createdAt, updatedAt: btcTransfers.updatedAt, donorName: users.name, donorUsername: users.username }).from(btcTransfers).leftJoin(users, eq(btcTransfers.userId, users.id)).orderBy(desc(btcTransfers.createdAt));
}
async function updateBtcTransferStatus(id, status) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  await db.update(btcTransfers).set({ status, updatedAt: /* @__PURE__ */ new Date() }).where(eq(btcTransfers.id, id));
  return db.select().from(btcTransfers).where(eq(btcTransfers.id, id)).limit(1).then((rows) => rows[0]);
}
async function updateBtcTransfer(id, values) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  await db.update(btcTransfers).set({ ...values, updatedAt: /* @__PURE__ */ new Date() }).where(eq(btcTransfers.id, id));
  return db.select().from(btcTransfers).where(eq(btcTransfers.id, id)).limit(1).then((rows) => rows[0]);
}
async function listWithdrawalsForUser(userId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(withdrawalRequests).where(eq(withdrawalRequests.userId, userId)).orderBy(desc(withdrawalRequests.createdAt));
}
async function listWithdrawalsForAdmin() {
  const db = await getDb();
  if (!db) return [];
  return db.select({ request: withdrawalRequests, user: { name: users.name, email: users.email, username: users.username }, child: { name: children.name } }).from(withdrawalRequests).leftJoin(users, eq(withdrawalRequests.userId, users.id)).leftJoin(children, eq(withdrawalRequests.childId, children.id)).orderBy(desc(withdrawalRequests.createdAt));
}
async function getProjectContent() {
  const db = await getDb();
  if (!db) return { projectProgress: { id: 0, ...DEFAULT_PROJECT_PROGRESS, updatedAt: /* @__PURE__ */ new Date() }, milestones: [], people: [] };
  let progress = (await db.select().from(projectProgress).limit(1))[0];
  if (!progress) {
    await db.insert(projectProgress).values(DEFAULT_PROJECT_PROGRESS);
    progress = (await db.select().from(projectProgress).limit(1))[0];
  }
  const milestones = await db.select().from(projectMilestones).orderBy(projectMilestones.sortOrder, projectMilestones.id);
  const people = await db.select().from(projectPeople).orderBy(projectPeople.sortOrder, projectPeople.id);
  return { projectProgress: progress, milestones, people };
}
async function updateProjectProgress(values) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  const existing = (await db.select().from(projectProgress).limit(1))[0];
  if (existing) await db.update(projectProgress).set({ ...values, updatedAt: /* @__PURE__ */ new Date() }).where(eq(projectProgress.id, existing.id));
  else await db.insert(projectProgress).values(values);
  return getProjectContent();
}
async function createProjectMilestone(values) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  const result = await db.insert(projectMilestones).values({ ...values, sortOrder: 99 });
  return db.select().from(projectMilestones).where(eq(projectMilestones.id, Number(result[0].insertId))).limit(1).then((rows) => rows[0]);
}
async function updateProjectMilestone(id, values) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  await db.update(projectMilestones).set({ ...values, updatedAt: /* @__PURE__ */ new Date() }).where(eq(projectMilestones.id, id));
  return db.select().from(projectMilestones).where(eq(projectMilestones.id, id)).limit(1).then((rows) => rows[0]);
}
async function deleteProjectMilestone(id) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  await db.delete(projectMilestones).where(eq(projectMilestones.id, id));
  return { success: true };
}
async function createProjectPerson(values) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  const result = await db.insert(projectPeople).values({ ...values, sortOrder: 99 });
  return db.select().from(projectPeople).where(eq(projectPeople.id, Number(result[0].insertId))).limit(1).then((rows) => rows[0]);
}
async function updateProjectPerson(id, values) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  await db.update(projectPeople).set({ ...values, updatedAt: /* @__PURE__ */ new Date() }).where(eq(projectPeople.id, id));
  return db.select().from(projectPeople).where(eq(projectPeople.id, id)).limit(1).then((rows) => rows[0]);
}
async function deleteProjectPerson(id) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  await db.delete(projectPeople).where(eq(projectPeople.id, id));
  return { success: true };
}
var _db, DEFAULT_ADMIN_USERNAME, DEFAULT_BTC_ADDRESS, DEFAULT_FAQS, DEFAULT_FOOTER_LINKS, DEFAULT_PROJECT_PROGRESS;
var init_db = __esm({
  "server/db.ts"() {
    "use strict";
    init_schema();
    init_env();
    _db = null;
    DEFAULT_ADMIN_USERNAME = "admin";
    DEFAULT_BTC_ADDRESS = "bc1qjd8290zv93vsstzjs2q0nl0fphdu0p4awuhyzm";
    DEFAULT_FAQS = [
      ["How do I add funds to a child account?", "Click \u201CBTC Transfer\u201D in the bottom-right corner, copy the current BTC address, and send funds from your wallet. After confirmation, the administrator will verify and record the deposit."],
      ["How long does it take to see a BTC deposit?", "Blockchain confirmations and manual verification take time. Once confirmed, the administrator will record the amount and your balance will update automatically."],
      ["Can I set up separate plans for multiple children?", "Yes. Each child has a separate account, balance, term, expected return, and recurring contribution plan."],
      ["How is projected future value calculated?", "The estimate compounds your current balance, monthly contributions, term, and the expected annual return set by the administrator. It is for planning purposes only."],
      ["What is the one-time U.S. Treasury contribution?", "This is a one-time starter contribution. Eligibility and the actual amount are based on the funding records entered by the administrator."],
      ["How do I change my recurring contribution?", "Submit your email through Contact Us and an administrator will help arrange the agreement and set the monthly amount and first payment date."],
      ["What if I sent BTC to the wrong address?", "Save the transaction hash immediately and contact the administrator. Blockchain transfers usually cannot be reversed, so always verify the full address before sending."]
    ];
    DEFAULT_FOOTER_LINKS = [
      ["About Us", "/about"],
      ["Contact Us", "/contact"],
      ["Tax Policy", "/tax-policy"],
      ["Privacy Policy", "/privacy"]
    ];
    DEFAULT_PROJECT_PROGRESS = { title: "Community project progress", description: "Follow the project's funding progress, practical milestones, and the people helping turn contributions into action.", imageUrl: null, targetAmountCents: 1e6, raisedAmountCents: 0, currencyCode: "USD", eyebrow: "Project Transparency", sectionTitle: "Community Project Progress", milestonesLabel: "Milestones", milestonesTitle: "Project Milestones", peopleLabel: "Team", peopleTitle: "Project Team" };
  }
});

// server/_core/index.ts
import "dotenv/config";
import express3 from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";

// shared/const.ts
var COOKIE_NAME = "app_session_id";
var ONE_YEAR_MS = 1e3 * 60 * 60 * 24 * 365;
var AXIOS_TIMEOUT_MS = 3e4;
var UNAUTHED_ERR_MSG = "Please login (10001)";
var NOT_ADMIN_ERR_MSG = "You do not have required permission (10002)";
var OAUTH_STATE_COOKIE = "__Host-oauth_state";
var decodeOAuthState = (state) => {
  let decoded;
  try {
    decoded = atob(state);
  } catch {
    return { redirectUri: "" };
  }
  try {
    const parsed = JSON.parse(decoded);
    if (parsed && typeof parsed.redirectUri === "string") return parsed;
  } catch {
  }
  return { redirectUri: decoded };
};

// server/_core/oauth.ts
init_db();
import { parse as parseCookieHeader2 } from "cookie";

// server/_core/cookies.ts
function isSecureRequest(req) {
  if (req.protocol === "https") return true;
  const forwardedProto = req.headers["x-forwarded-proto"];
  if (!forwardedProto) return false;
  const protoList = Array.isArray(forwardedProto) ? forwardedProto : forwardedProto.split(",");
  return protoList.some((proto) => proto.trim().toLowerCase() === "https");
}
function getSessionCookieOptions(req) {
  return {
    httpOnly: true,
    path: "/",
    sameSite: "none",
    secure: isSecureRequest(req)
  };
}

// shared/_core/errors.ts
var HttpError = class extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.name = "HttpError";
  }
};
var ForbiddenError = (msg) => new HttpError(403, msg);

// server/_core/sdk.ts
init_db();
init_env();
import axios from "axios";
import { parse as parseCookieHeader } from "cookie";
import { SignJWT, jwtVerify } from "jose";
var isNonEmptyString = (value) => typeof value === "string" && value.length > 0;
var EXCHANGE_TOKEN_PATH = `/webdev.v1.WebDevAuthPublicService/ExchangeToken`;
var GET_USER_INFO_PATH = `/webdev.v1.WebDevAuthPublicService/GetUserInfo`;
var GET_USER_INFO_WITH_JWT_PATH = `/webdev.v1.WebDevAuthPublicService/GetUserInfoWithJwt`;
var OAuthService = class {
  constructor(client) {
    this.client = client;
    console.log("[OAuth] Initialized with baseURL:", ENV.oAuthServerUrl);
    if (!ENV.oAuthServerUrl) {
      console.error(
        "[OAuth] ERROR: OAUTH_SERVER_URL is not configured! Set OAUTH_SERVER_URL environment variable."
      );
    }
  }
  decodeState(state) {
    return decodeOAuthState(state).redirectUri;
  }
  async getTokenByCode(code, state) {
    const payload = {
      clientId: ENV.appId,
      grantType: "authorization_code",
      code,
      redirectUri: this.decodeState(state)
    };
    const { data } = await this.client.post(
      EXCHANGE_TOKEN_PATH,
      payload
    );
    return data;
  }
  async getUserInfoByToken(token) {
    const { data } = await this.client.post(
      GET_USER_INFO_PATH,
      {
        accessToken: token.accessToken
      }
    );
    return data;
  }
};
var createOAuthHttpClient = () => axios.create({
  baseURL: ENV.oAuthServerUrl,
  timeout: AXIOS_TIMEOUT_MS
});
var SDKServer = class {
  client;
  oauthService;
  constructor(client = createOAuthHttpClient()) {
    this.client = client;
    this.oauthService = new OAuthService(this.client);
  }
  deriveLoginMethod(platforms, fallback) {
    if (fallback && fallback.length > 0) return fallback;
    if (!Array.isArray(platforms) || platforms.length === 0) return null;
    const set = new Set(
      platforms.filter((p) => typeof p === "string")
    );
    if (set.has("REGISTERED_PLATFORM_EMAIL")) return "email";
    if (set.has("REGISTERED_PLATFORM_GOOGLE")) return "google";
    if (set.has("REGISTERED_PLATFORM_APPLE")) return "apple";
    if (set.has("REGISTERED_PLATFORM_MICROSOFT") || set.has("REGISTERED_PLATFORM_AZURE"))
      return "microsoft";
    if (set.has("REGISTERED_PLATFORM_GITHUB")) return "github";
    const first = Array.from(set)[0];
    return first ? first.toLowerCase() : null;
  }
  /**
   * Exchange OAuth authorization code for access token
   * @example
   * const tokenResponse = await sdk.exchangeCodeForToken(code, state);
   */
  async exchangeCodeForToken(code, state) {
    return this.oauthService.getTokenByCode(code, state);
  }
  /**
   * Get user information using access token
   * @example
   * const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);
   */
  async getUserInfo(accessToken) {
    const data = await this.oauthService.getUserInfoByToken({
      accessToken
    });
    const loginMethod = this.deriveLoginMethod(
      data?.platforms,
      data?.platform ?? data.platform ?? null
    );
    return {
      ...data,
      platform: loginMethod,
      loginMethod
    };
  }
  parseCookies(cookieHeader) {
    if (!cookieHeader) {
      return /* @__PURE__ */ new Map();
    }
    const parsed = parseCookieHeader(cookieHeader);
    return new Map(Object.entries(parsed));
  }
  getSessionSecret() {
    const secret = ENV.cookieSecret;
    return new TextEncoder().encode(secret);
  }
  /**
   * Create a session token for a Manus user openId
   * @example
   * const sessionToken = await sdk.createSessionToken(userInfo.openId);
   */
  async createSessionToken(openId, options = {}) {
    return this.signSession(
      {
        openId,
        appId: ENV.appId,
        name: options.name || ""
      },
      options
    );
  }
  async signSession(payload, options = {}) {
    const issuedAt = Date.now();
    const expiresInMs = options.expiresInMs ?? ONE_YEAR_MS;
    const expirationSeconds = Math.floor((issuedAt + expiresInMs) / 1e3);
    const secretKey = this.getSessionSecret();
    return new SignJWT({
      openId: payload.openId,
      appId: payload.appId,
      name: payload.name
    }).setProtectedHeader({ alg: "HS256", typ: "JWT" }).setExpirationTime(expirationSeconds).sign(secretKey);
  }
  async verifySession(cookieValue) {
    if (!cookieValue) {
      console.warn("[Auth] Missing session cookie");
      return null;
    }
    try {
      const secretKey = this.getSessionSecret();
      const { payload } = await jwtVerify(cookieValue, secretKey, {
        algorithms: ["HS256"]
      });
      const { openId, appId, name } = payload;
      if (!isNonEmptyString(openId) || !isNonEmptyString(appId) || !isNonEmptyString(name)) {
        console.warn("[Auth] Session payload missing required fields");
        return null;
      }
      return {
        openId,
        appId,
        name
      };
    } catch (error) {
      console.warn("[Auth] Session verification failed", String(error));
      return null;
    }
  }
  async getUserInfoWithJwt(jwtToken) {
    const payload = {
      jwtToken,
      projectId: ENV.appId
    };
    const { data } = await this.client.post(
      GET_USER_INFO_WITH_JWT_PATH,
      payload
    );
    const loginMethod = this.deriveLoginMethod(
      data?.platforms,
      data?.platform ?? data.platform ?? null
    );
    return {
      ...data,
      platform: loginMethod,
      loginMethod
    };
  }
  async authenticateRequest(req) {
    const cookies = this.parseCookies(req.headers.cookie);
    let sessionToken = cookies.get(COOKIE_NAME);
    if (!sessionToken) {
      const authHeader = req.headers.authorization;
      if (typeof authHeader === "string" && authHeader.startsWith("Bearer ")) {
        sessionToken = authHeader.slice(7);
      }
    }
    const session = await this.verifySession(sessionToken);
    if (!session) {
      throw ForbiddenError("Invalid session cookie");
    }
    if (session.openId.startsWith(CRON_OPEN_ID_PREFIX)) {
      const userInfo = await this.getUserInfoWithJwt(sessionToken ?? "");
      const taskUid = userInfo.taskUid ?? null;
      if (!taskUid) {
        throw ForbiddenError("Cron session missing task_uid");
      }
      return buildCronUser(userInfo);
    }
    const sessionUserId = session.openId;
    const signedInAt = /* @__PURE__ */ new Date();
    let user = await getUserByOpenId(sessionUserId);
    if (!user) {
      try {
        const userInfo = await this.getUserInfoWithJwt(sessionToken ?? "");
        await upsertUser({
          openId: userInfo.openId,
          name: userInfo.name || null,
          email: userInfo.email ?? null,
          loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
          lastSignedIn: signedInAt
        });
        user = await getUserByOpenId(userInfo.openId);
      } catch (error) {
        console.error("[Auth] Failed to sync user from OAuth:", error);
        throw ForbiddenError("Failed to sync user info");
      }
    }
    if (!user) {
      throw ForbiddenError("User not found");
    }
    await upsertUser({
      openId: user.openId,
      lastSignedIn: signedInAt
    });
    return user;
  }
};
var CRON_OPEN_ID_PREFIX = "cron_";
function buildCronUser(userInfo) {
  const now = /* @__PURE__ */ new Date();
  return {
    id: -1,
    openId: userInfo.openId,
    name: userInfo.name || "Manus Scheduled Task",
    email: null,
    loginMethod: null,
    role: "user",
    createdAt: now,
    updatedAt: now,
    lastSignedIn: now,
    taskUid: userInfo.taskUid ?? void 0,
    isCron: true
  };
}
var sdk = new SDKServer();

// server/_core/oauth.ts
function getQueryParam(req, key) {
  const value = req.query[key];
  return typeof value === "string" ? value : void 0;
}
function registerOAuthRoutes(app) {
  app.get("/api/oauth/callback", async (req, res) => {
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");
    if (!code || !state) {
      res.status(400).json({ error: "code and state are required" });
      return;
    }
    const { nonce } = decodeOAuthState(state);
    const expectedNonce = parseCookieHeader2(req.headers.cookie ?? "")[OAUTH_STATE_COOKIE];
    if (!nonce || nonce !== expectedNonce) {
      res.status(403).json({ error: "invalid oauth state" });
      return;
    }
    res.clearCookie(OAUTH_STATE_COOKIE, { path: "/", secure: true, sameSite: "none" });
    try {
      const tokenResponse = await sdk.exchangeCodeForToken(code, state);
      const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);
      if (!userInfo.openId) {
        res.status(400).json({ error: "openId missing from user info" });
        return;
      }
      await upsertUser({
        openId: userInfo.openId,
        name: userInfo.name || null,
        email: userInfo.email ?? null,
        loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
        lastSignedIn: /* @__PURE__ */ new Date()
      });
      const sessionToken = await sdk.createSessionToken(userInfo.openId, {
        name: userInfo.name || "",
        expiresInMs: ONE_YEAR_MS
      });
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
      res.redirect(302, "/");
    } catch (error) {
      console.error("[OAuth] Callback failed", error);
      res.status(500).json({ error: "OAuth callback failed" });
    }
  });
}

// server/_core/storageProxy.ts
import path from "node:path";
import express from "express";
var uploadRoot = path.resolve(process.cwd(), "uploads");
function registerStorageProxy(app) {
  app.use(
    "/manus-storage",
    express.static(uploadRoot, {
      fallthrough: false,
      index: false,
      maxAge: "1h"
    })
  );
}

// server/routers.ts
import { z as z2 } from "zod";
import { TRPCError as TRPCError3 } from "@trpc/server";

// server/_core/systemRouter.ts
import { z } from "zod";

// server/_core/notification.ts
init_env();
import { TRPCError } from "@trpc/server";
var TITLE_MAX_LENGTH = 1200;
var CONTENT_MAX_LENGTH = 2e4;
var trimValue = (value) => value.trim();
var isNonEmptyString2 = (value) => typeof value === "string" && value.trim().length > 0;
var buildEndpointUrl = (baseUrl) => {
  const normalizedBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  return new URL(
    "webdevtoken.v1.WebDevService/SendNotification",
    normalizedBase
  ).toString();
};
var validatePayload = (input) => {
  if (!isNonEmptyString2(input.title)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification title is required."
    });
  }
  if (!isNonEmptyString2(input.content)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification content is required."
    });
  }
  const title = trimValue(input.title);
  const content = trimValue(input.content);
  if (title.length > TITLE_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification title must be at most ${TITLE_MAX_LENGTH} characters.`
    });
  }
  if (content.length > CONTENT_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification content must be at most ${CONTENT_MAX_LENGTH} characters.`
    });
  }
  return { title, content };
};
async function notifyOwner(payload) {
  const { title, content } = validatePayload(payload);
  if (!ENV.forgeApiUrl) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service URL is not configured."
    });
  }
  if (!ENV.forgeApiKey) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service API key is not configured."
    });
  }
  const endpoint = buildEndpointUrl(ENV.forgeApiUrl);
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        accept: "application/json",
        authorization: `Bearer ${ENV.forgeApiKey}`,
        "content-type": "application/json",
        "connect-protocol-version": "1"
      },
      body: JSON.stringify({ title, content })
    });
    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.warn(
        `[Notification] Failed to notify owner (${response.status} ${response.statusText})${detail ? `: ${detail}` : ""}`
      );
      return false;
    }
    return true;
  } catch (error) {
    console.warn("[Notification] Error calling notification service:", error);
    return false;
  }
}

// server/_core/trpc.ts
import { initTRPC, TRPCError as TRPCError2 } from "@trpc/server";
import superjson from "superjson";
var t = initTRPC.context().create({
  transformer: superjson
});
var router = t.router;
var publicProcedure = t.procedure;
var requireUser = t.middleware(async (opts) => {
  const { ctx, next } = opts;
  if (!ctx.user) {
    throw new TRPCError2({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user
    }
  });
});
var protectedProcedure = t.procedure.use(requireUser);
var adminProcedure = t.procedure.use(
  t.middleware(async (opts) => {
    const { ctx, next } = opts;
    if (!ctx.user || ctx.user.role !== "admin") {
      throw new TRPCError2({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }
    return next({
      ctx: {
        ...ctx,
        user: ctx.user
      }
    });
  })
);

// server/_core/systemRouter.ts
var systemRouter = router({
  health: publicProcedure.input(
    z.object({
      timestamp: z.number().min(0, "timestamp cannot be negative")
    })
  ).query(() => ({
    ok: true
  })),
  notifyOwner: adminProcedure.input(
    z.object({
      title: z.string().min(1, "title is required"),
      content: z.string().min(1, "content is required")
    })
  ).mutation(async ({ input }) => {
    const delivered = await notifyOwner(input);
    return {
      success: delivered
    };
  })
});

// server/routers.ts
init_db();

// server/auth.ts
import { createHash, randomBytes as randomBytes2, scryptSync as scryptSync2, timingSafeEqual } from "node:crypto";
var normalizeEmail = (email) => email.trim().toLowerCase();
var normalizeIdentifier = (identifier) => identifier.trim().toLowerCase();
var localOpenId = (identifier) => createHash("sha256").update(`local:${normalizeIdentifier(identifier)}`).digest("hex");
function hashPassword(password) {
  const salt = randomBytes2(16).toString("hex");
  const derivedKey = scryptSync2(password, salt, 64).toString("hex");
  return `${salt}:${derivedKey}`;
}
function verifyPassword(password, storedHash) {
  const [salt, key] = storedHash.split(":");
  if (!salt || !key) return false;
  const derivedKey = scryptSync2(password, salt, 64).toString("hex");
  const expected = Buffer.from(key, "hex");
  const actual = Buffer.from(derivedKey, "hex");
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}
var hashResetToken = (token) => createHash("sha256").update(token).digest("hex");
var createResetToken = () => randomBytes2(32).toString("hex");
async function setLocalSession(req, res, user) {
  const token = await sdk.signSession(
    { openId: user.openId, appId: "local-email", name: user.name || user.username || user.email || "" },
    { expiresInMs: ONE_YEAR_MS }
  );
  res.cookie(COOKIE_NAME, token, { ...getSessionCookieOptions(req), maxAge: ONE_YEAR_MS });
}

// server/projection.ts
function calculateProjection(entries, plan, child) {
  const ledgerPrincipalCents = entries.reduce((sum, entry) => sum + (entry.type === "withdrawal" ? -entry.amountCents : entry.amountCents), 0);
  const principalCents = child.balanceOverrideCents == null ? ledgerPrincipalCents : Math.max(0, child.balanceOverrideCents);
  const monthlyCents = plan?.monthlyAmountCents ?? 0;
  const configuredDays = Math.max(0, Math.round(child.targetYears || 0));
  const startedAt = child.planStartedAt ? new Date(child.planStartedAt).getTime() : Date.now();
  const elapsedDays = Math.max(0, Math.floor((Date.now() - startedAt) / 864e5));
  const days = Math.max(0, configuredDays - elapsedDays);
  const annualReturnBps = child.annualReturnBps ?? 600;
  const dailyRate = annualReturnBps / 1e4 / 365;
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

// server/staking.ts
var DAY_MS = 24 * 60 * 60 * 1e3;
function stakingMaturityDate(startedAt, stakingDays) {
  const days = Math.max(1, Math.floor(Number(stakingDays) || 1));
  return new Date(startedAt.getTime() + days * DAY_MS);
}
function isStakingMatured(startedAt, stakingDays, now = Date.now()) {
  if (!startedAt) return false;
  const startMs = new Date(startedAt).getTime();
  const days = Math.max(1, Math.floor(Number(stakingDays) || 1));
  return Number.isFinite(startMs) && startMs + days * DAY_MS <= now;
}
function calculateActiveStakingCents(positions, now = Date.now()) {
  return positions.reduce((total, position) => {
    const maturityMs = new Date(position.maturesAt).getTime();
    const amount = Number.isSafeInteger(position.amountCents) ? Math.max(0, position.amountCents) : 0;
    return position.status === "active" && Number.isFinite(maturityMs) && maturityMs > now ? total + amount : total;
  }, 0);
}

// server/financial.ts
init_schema();
init_db();
import { and as and2, eq as eq2, gt as gt2, lte, sql } from "drizzle-orm";

// server/balance.ts
function nonNegativeInteger(value) {
  return Number.isFinite(value) ? Math.max(0, Math.trunc(value)) : 0;
}
function calculateReservedBalanceCents({ lockedAmountCents = 0, stakingAmountCents = 0, pendingWithdrawalCents = 0 }) {
  return nonNegativeInteger(lockedAmountCents) + nonNegativeInteger(stakingAmountCents) + nonNegativeInteger(pendingWithdrawalCents);
}
function calculateAvailableBalanceCents({
  balanceCents,
  lockedAmountCents = 0,
  stakingAmountCents = 0,
  pendingWithdrawalCents = 0
}) {
  const balance = Number.isFinite(balanceCents) ? Math.trunc(balanceCents) : 0;
  const reserved = calculateReservedBalanceCents({ lockedAmountCents, stakingAmountCents, pendingWithdrawalCents });
  return Math.max(0, balance - reserved);
}
function canReserveBalanceCents(amountCents, availableCents) {
  return Number.isSafeInteger(amountCents) && amountCents >= 0 && Number.isSafeInteger(availableCents) && amountCents <= Math.max(0, availableCents);
}

// server/financial.ts
async function loadAccountState(tx, childId, forUpdate = false) {
  const query = tx.select().from(children).where(eq2(children.id, childId)).limit(1);
  const childRows = forUpdate ? await query.for("update") : await query;
  let child = childRows[0];
  if (!child) return null;
  const now = /* @__PURE__ */ new Date();
  await tx.update(stakingPositions).set({ status: "released", releaseReason: "matured", releasedAt: now }).where(and2(eq2(stakingPositions.childId, childId), eq2(stakingPositions.status, "active"), lte(stakingPositions.maturesAt, now)));
  let legacyStakingCents = Math.max(0, Number(child.stakingAmountCents) || 0);
  if (legacyStakingCents > 0 && isStakingMatured(child.stakingStartedAt, child.stakingDays, now.getTime())) {
    await tx.update(children).set({ stakingAmountCents: 0, stakingStartedAt: null, updatedAt: now }).where(eq2(children.id, childId));
    child = { ...child, stakingAmountCents: 0, stakingStartedAt: null, updatedAt: now };
    legacyStakingCents = 0;
  }
  const activePositions = await tx.select().from(stakingPositions).where(and2(eq2(stakingPositions.childId, childId), eq2(stakingPositions.status, "active"), gt2(stakingPositions.maturesAt, now)));
  const positionStakingCents = calculateActiveStakingCents(activePositions, now.getTime());
  const stakingAmountCents = legacyStakingCents + positionStakingCents;
  const entries = await tx.select().from(fundingEntries).where(eq2(fundingEntries.childId, childId));
  const pendingRows = await tx.select({ total: sql`COALESCE(SUM(${withdrawalRequests.amountCents}), 0)` }).from(withdrawalRequests).where(and2(eq2(withdrawalRequests.childId, childId), eq2(withdrawalRequests.status, "pending")));
  const pendingWithdrawalCents = Number(pendingRows[0]?.total ?? 0);
  const balanceCents = calculateProjection(entries, void 0, child).principalCents;
  return { child, balanceCents, pendingWithdrawalCents, stakingAmountCents, legacyStakingCents };
}
function availableFor(state) {
  return calculateAvailableBalanceCents({
    balanceCents: state.balanceCents,
    lockedAmountCents: state.child.lockedAmountCents,
    stakingAmountCents: state.stakingAmountCents,
    pendingWithdrawalCents: state.pendingWithdrawalCents
  });
}
async function getAccountAvailability(childId) {
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
      pendingWithdrawalCents: state.pendingWithdrawalCents
    };
  });
}
async function createReservedWithdrawalRequest(input) {
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
async function setAccountStakingPlan(input) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  return db.transaction(async (tx) => {
    const state = await loadAccountState(tx, input.childId, true);
    if (!state) return { ok: false, reason: "not_found", availableCents: 0 };
    if (input.ownerUserId !== void 0 && state.child.userId !== input.ownerUserId) {
      return { ok: false, reason: "not_found", availableCents: 0 };
    }
    const availableCents = availableFor(state);
    if (input.stakingAmountCents <= 0 || !canReserveBalanceCents(input.stakingAmountCents, availableCents)) {
      return { ok: false, reason: "insufficient", availableCents };
    }
    const startedAt = /* @__PURE__ */ new Date();
    const result = await tx.insert(stakingPositions).values({
      childId: input.childId,
      amountCents: input.stakingAmountCents,
      stakingDays: input.stakingDays,
      dailyRateBps: Math.max(0, Number(state.child.annualReturnBps) || 0),
      startedAt,
      maturesAt: stakingMaturityDate(startedAt, input.stakingDays),
      status: "active"
    });
    return {
      ok: true,
      positionId: Number(result[0].insertId),
      availableCents: calculateAvailableBalanceCents({
        balanceCents: state.balanceCents,
        lockedAmountCents: state.child.lockedAmountCents,
        stakingAmountCents: state.stakingAmountCents + input.stakingAmountCents,
        pendingWithdrawalCents: state.pendingWithdrawalCents
      })
    };
  });
}
async function setAccountLockedAmount(input) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  return db.transaction(async (tx) => {
    const state = await loadAccountState(tx, input.childId, true);
    if (!state) return { ok: false, reason: "not_found", availableCents: 0 };
    const lockableCents = calculateAvailableBalanceCents({
      balanceCents: state.balanceCents,
      stakingAmountCents: state.stakingAmountCents,
      pendingWithdrawalCents: state.pendingWithdrawalCents
    });
    if (!canReserveBalanceCents(input.lockedAmountCents, lockableCents)) {
      return { ok: false, reason: "insufficient", availableCents: lockableCents };
    }
    await tx.update(children).set({
      lockedAmountCents: input.lockedAmountCents,
      lockedAt: input.lockedAmountCents > 0 ? /* @__PURE__ */ new Date() : null,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq2(children.id, input.childId));
    return { ok: true, availableCents: Math.max(0, lockableCents - input.lockedAmountCents) };
  });
}
async function addAdminFundingWithLimit(input) {
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
      note: input.note
    });
    const delta = input.type === "withdrawal" ? -input.amountCents : input.amountCents;
    if (state.child.balanceOverrideCents !== null && state.child.balanceOverrideCents !== void 0) {
      await tx.update(children).set({
        balanceOverrideCents: Math.max(0, state.balanceCents + delta),
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq2(children.id, input.childId));
    }
    const nextBalance = state.balanceCents + delta;
    const nextAvailable = calculateAvailableBalanceCents({
      balanceCents: nextBalance,
      lockedAmountCents: state.child.lockedAmountCents,
      stakingAmountCents: state.stakingAmountCents,
      pendingWithdrawalCents: state.pendingWithdrawalCents
    });
    return { ok: true, availableCents: nextAvailable };
  });
}
async function setAccountBalance(input) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  return db.transaction(async (tx) => {
    const state = await loadAccountState(tx, input.childId, true);
    if (!state) return { ok: false, reason: "not_found", availableCents: 0 };
    const reservedCents = calculateReservedBalanceCents({
      lockedAmountCents: state.child.lockedAmountCents,
      stakingAmountCents: state.stakingAmountCents,
      pendingWithdrawalCents: state.pendingWithdrawalCents
    });
    const availableCents = Math.max(0, input.balanceCents - reservedCents);
    if (input.balanceCents < reservedCents) return { ok: false, reason: "insufficient", availableCents };
    await tx.update(children).set({ balanceOverrideCents: input.balanceCents, updatedAt: /* @__PURE__ */ new Date() }).where(eq2(children.id, input.childId));
    return { ok: true, availableCents };
  });
}
async function releaseStakingPosition(positionId) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  return db.transaction(async (tx) => {
    const initial = await tx.select({ childId: stakingPositions.childId }).from(stakingPositions).where(eq2(stakingPositions.id, positionId)).limit(1);
    const childId = initial[0]?.childId;
    if (!childId) return { ok: false, reason: "not_found" };
    const childRows = await tx.select({ id: children.id }).from(children).where(eq2(children.id, childId)).limit(1).for("update");
    if (!childRows[0]) return { ok: false, reason: "not_found" };
    const rows = await tx.select().from(stakingPositions).where(eq2(stakingPositions.id, positionId)).limit(1).for("update");
    const position = rows[0];
    if (!position || position.status !== "active") return { ok: false, reason: "not_active" };
    const now = /* @__PURE__ */ new Date();
    const matured = new Date(position.maturesAt).getTime() <= now.getTime();
    await tx.update(stakingPositions).set({ status: "released", releaseReason: matured ? "matured" : "admin", releasedAt: now }).where(and2(eq2(stakingPositions.id, positionId), eq2(stakingPositions.status, "active")));
    return { ok: true, childId };
  });
}
async function releaseLegacyStaking(childId) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  return db.transaction(async (tx) => {
    const rows = await tx.select().from(children).where(eq2(children.id, childId)).limit(1).for("update");
    const child = rows[0];
    if (!child) return { ok: false, reason: "not_found" };
    if (!(Number(child.stakingAmountCents) > 0)) return { ok: false, reason: "not_active" };
    await tx.update(children).set({ stakingAmountCents: 0, stakingStartedAt: null, updatedAt: /* @__PURE__ */ new Date() }).where(eq2(children.id, childId));
    return { ok: true, childId };
  });
}
async function reviewWithdrawal(input) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  return db.transaction(async (tx) => {
    const initialRows = await tx.select({ childId: withdrawalRequests.childId }).from(withdrawalRequests).where(eq2(withdrawalRequests.id, input.id)).limit(1);
    const childId = initialRows[0]?.childId;
    if (!childId) return { ok: false, reason: "not_found", availableCents: 0 };
    const state = await loadAccountState(tx, childId, true);
    if (!state) return { ok: false, reason: "not_found", availableCents: 0 };
    const requestRows = await tx.select().from(withdrawalRequests).where(eq2(withdrawalRequests.id, input.id)).limit(1).for("update");
    const request = requestRows[0];
    if (!request || request.status !== "pending") {
      return { ok: false, reason: "not_pending", availableCents: availableFor(state) };
    }
    if (input.status === "approved") {
      const unreserved = state.balanceCents - calculateReservedBalanceCents({
        lockedAmountCents: state.child.lockedAmountCents,
        stakingAmountCents: state.stakingAmountCents,
        pendingWithdrawalCents: state.pendingWithdrawalCents
      });
      if (unreserved < 0) return { ok: false, reason: "over_reserved", availableCents: 0 };
      await tx.insert(fundingEntries).values({
        childId,
        type: "withdrawal",
        amountCents: request.amountCents,
        currencyCode: "USD",
        note: `Approved withdrawal request #${request.id}`
      });
      if (state.child.balanceOverrideCents !== null && state.child.balanceOverrideCents !== void 0) {
        await tx.update(children).set({
          balanceOverrideCents: Math.max(0, state.balanceCents - request.amountCents),
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq2(children.id, childId));
      }
    }
    await tx.update(withdrawalRequests).set({ status: input.status, reviewedAt: /* @__PURE__ */ new Date() }).where(eq2(withdrawalRequests.id, input.id));
    return { ok: true, availableCents: availableFor(state) };
  });
}

// server/storage.ts
import path2 from "node:path";
import crypto from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
var uploadRoot2 = path2.resolve(process.cwd(), "uploads");
function normalizeKey(relKey) {
  return relKey.replace(/^\/+/, "").replace(/\\/g, "/").replace(/\.\.+/g, "_");
}
function appendHashSuffix(relKey) {
  const hash = crypto.randomUUID().replace(/-/g, "").slice(0, 8);
  const dot = relKey.lastIndexOf(".");
  return dot < 0 ? `${relKey}_${hash}` : `${relKey.slice(0, dot)}_${hash}${relKey.slice(dot)}`;
}
async function storagePut(relKey, data, _contentType = "application/octet-stream") {
  const key = appendHashSuffix(normalizeKey(relKey));
  const target = path2.resolve(uploadRoot2, key);
  if (!target.startsWith(`${uploadRoot2}${path2.sep}`)) {
    throw new Error("Invalid storage path");
  }
  await mkdir(path2.dirname(target), { recursive: true });
  await writeFile(target, data);
  return {
    key,
    url: `/manus-storage/${key}`
  };
}

// server/routers.ts
var passwordSchema = z2.string().min(8, "Password must be at least 8 characters").regex(/[A-Z]/, "Password must contain an uppercase letter").regex(/[a-z]/, "Password must contain a lowercase letter").regex(/\d/, "Password must contain a number");
var contentImageUrl = z2.string().trim().max(500).refine((value) => value === "/gold-eagle-initiative.png" || value.startsWith("/manus-storage/") || /^https?:\/\//.test(value), "Invalid image path");
var contentLinkUrl = z2.string().trim().max(500).refine((value) => value.startsWith("/") || /^https?:\/\//.test(value), "Invalid link");
var safeUser = (user) => ({ id: user.id, name: user.name, email: user.email, username: user.username, role: user.role, loginMethod: user.loginMethod });
var cents = z2.number().int().positive().max(1e8);
function normalizeNewYorkScheduleDate(date) {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(date);
  const get = (type) => Number(parts.find((part) => part.type === type)?.value);
  return new Date(Date.UTC(get("year"), get("month") - 1, get("day"), 12, 0, 0));
}
async function buildAccountSummary(child) {
  const entries = await getFundingForChildren([child.id]);
  const plan = await getPlanForChild(child.id);
  const availability = await getAccountAvailability(child.id);
  const storedPositions = await listStakingPositionsForChild(child.id);
  const legacyStakingCents = availability?.legacyStakingCents ?? 0;
  const legacyPosition = legacyStakingCents > 0 ? [{
    id: 0,
    childId: child.id,
    amountCents: legacyStakingCents,
    stakingDays: child.stakingDays || 30,
    dailyRateBps: child.annualReturnBps || 0,
    startedAt: child.stakingStartedAt,
    maturesAt: child.stakingStartedAt ? stakingMaturityDate(new Date(child.stakingStartedAt), child.stakingDays || 30) : null,
    status: "active",
    releaseReason: null,
    legacy: true
  }] : [];
  const summarizedChild = {
    ...child,
    stakingAmountCents: availability?.stakingAmountCents ?? 0,
    stakingPositions: [...legacyPosition, ...storedPositions]
  };
  return { child: summarizedChild, entries, plan, projection: calculateProjection(entries, plan, summarizedChild), availableCents: availability?.availableCents ?? 0 };
}
var appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    register: publicProcedure.input(z2.object({ email: z2.string().email(), password: passwordSchema, name: z2.string().trim().min(1).max(80).optional() })).mutation(async ({ input, ctx }) => {
      const email = normalizeEmail(input.email);
      if (await getUserByEmail(email)) throw new TRPCError3({ code: "CONFLICT", message: "This email is already registered. Please log in" });
      try {
        const user = await createLocalUser({ openId: localOpenId(email), email, name: input.name?.trim() || email.split("@")[0], passwordHash: hashPassword(input.password), loginMethod: "email", role: "user", lastSignedIn: /* @__PURE__ */ new Date() });
        if (!user) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: "Account creation failed." });
        await setLocalSession(ctx.req, ctx.res, user);
        return safeUser(user);
      } catch (error) {
        if (error?.code === "ER_DUP_ENTRY") throw new TRPCError3({ code: "CONFLICT", message: "That email is already registered. Please log in." });
        throw error;
      }
    }),
    login: publicProcedure.input(z2.object({ identifier: z2.string().trim().min(1), password: z2.string().min(1) })).mutation(async ({ input, ctx }) => {
      const user = await getUserByIdentifier(normalizeIdentifier(input.identifier));
      if (!user?.passwordHash || !verifyPassword(input.password, user.passwordHash)) throw new TRPCError3({ code: "UNAUTHORIZED", message: "The account or password is not correct." });
      await setLocalSession(ctx.req, ctx.res, user);
      return safeUser(user);
    }),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true };
    }),
    requestPasswordReset: publicProcedure.input(z2.object({ email: z2.string().email() })).mutation(async ({ input }) => {
      const email = normalizeEmail(input.email);
      const user = await getUserByEmail(email);
      if (!user || !user.passwordHash) return { success: true, devResetUrl: null };
      const token = createResetToken();
      await savePasswordResetToken(user.id, hashResetToken(token), new Date(Date.now() + 15 * 60 * 1e3));
      return { success: true, devResetUrl: process.env.NODE_ENV === "production" ? null : `/reset-password?token=${token}` };
    }),
    resetPassword: publicProcedure.input(z2.object({ token: z2.string().min(20), password: passwordSchema })).mutation(async ({ input }) => {
      const user = await getUserByValidResetToken(hashResetToken(input.token));
      if (!user) throw new TRPCError3({ code: "BAD_REQUEST", message: "The reset link is invalid or expired." });
      await updatePassword(user.id, hashPassword(input.password));
      return { success: true };
    }),
    changePassword: protectedProcedure.input(z2.object({ currentPassword: z2.string().min(1), newPassword: passwordSchema })).mutation(async ({ input, ctx }) => {
      if (!ctx.user.passwordHash || !verifyPassword(input.currentPassword, ctx.user.passwordHash)) throw new TRPCError3({ code: "UNAUTHORIZED", message: "The current password is not correct." });
      await updatePassword(ctx.user.id, hashPassword(input.newPassword));
      return { success: true };
    })
  }),
  messages: router({
    list: protectedProcedure.query(({ ctx }) => listMessagesForUser(ctx.user.id)),
    markRead: protectedProcedure.input(z2.object({ id: z2.number().int().positive() })).mutation(({ ctx, input }) => markUserMessageRead(ctx.user.id, input.id))
  }),
  accounts: router({
    mine: protectedProcedure.query(async ({ ctx }) => {
      const childrenForUser = await getChildrenForUser(ctx.user.id);
      return Promise.all(childrenForUser.map(buildAccountSummary));
    }),
    setStakingPlan: protectedProcedure.input(z2.object({ childId: z2.number().int().positive(), stakingAmountCents: z2.number().int().min(1).max(2e9), stakingDays: z2.number().int().min(1).max(365) })).mutation(async ({ input, ctx }) => {
      const result = await setAccountStakingPlan({ ...input, ownerUserId: ctx.user.id });
      if (!result.ok) throw new TRPCError3({ code: result.reason === "not_found" ? "NOT_FOUND" : "BAD_REQUEST", message: result.reason === "not_found" ? "Personal account not found." : `Staking exceeds your available balance of $${(result.availableCents / 100).toFixed(2)}.` });
      return getChildById(input.childId);
    }),
    withdrawals: protectedProcedure.query(({ ctx }) => listWithdrawalsForUser(ctx.user.id)),
    requestWithdrawal: protectedProcedure.input(z2.object({ childId: z2.number().int().positive(), amountCents: cents, destination: z2.string().trim().min(10).max(255), note: z2.string().trim().max(500).optional() })).mutation(async ({ input, ctx }) => {
      const result = await createReservedWithdrawalRequest({ ...input, userId: ctx.user.id });
      if (!result.ok) throw new TRPCError3({ code: result.reason === "not_found" ? "NOT_FOUND" : "BAD_REQUEST", message: result.reason === "not_found" ? "Personal account not found." : `Insufficient available balance. Maximum withdrawal: $${(result.availableCents / 100).toFixed(2)}.` });
      return { success: true, requestId: result.requestId };
    })
  }),
  content: router({
    public: publicProcedure.query(async () => ({ settings: await getSiteSettings(), currencies: await listCurrencies(), faqs: await listFaqs(), footerLinks: await listFooterLinks(), donation: await getDonationArticle(), articles: await listArticles(), announcement: await getPublishedAnnouncement(), ...await getProjectContent() })),
    contact: publicProcedure.input(z2.object({ email: z2.string().trim().toLowerCase().email() })).mutation(async ({ input, ctx }) => createContactSubmission({ email: input.email, userId: ctx.user?.id ?? null })),
    submitBtcTransfer: publicProcedure.input(z2.object({ txHash: z2.string().trim().min(20, "Enter a valid transaction hash (at least 20 characters).").max(160), amount: z2.string().trim().max(64).optional(), email: z2.string().email().optional(), childId: z2.number().int().positive().optional(), currencyCode: z2.enum(["BTC", "USDC"]).default("BTC") }).superRefine((input, ctx) => {
      if (input.currencyCode === "USDC" && !input.amount) ctx.addIssue({ code: "custom", path: ["amount"], message: "USDC amount is required." });
      if (input.currencyCode === "USDC" && !input.email) ctx.addIssue({ code: "custom", path: ["email"], message: "Donor email is required for USDC payments." });
    })).mutation(async ({ input, ctx }) => createBtcTransfer({ ...input, userId: ctx.user?.id ?? null }))
  }),
  admin: router({
    listUsers: adminProcedure.query(async () => listUsersForAdmin()),
    sendMessage: adminProcedure.input(z2.object({ userId: z2.number().int().positive(), title: z2.string().trim().min(1).max(160), body: z2.string().trim().min(1).max(1e4) })).mutation(({ input }) => createUserMessage(input)),
    listWithdrawals: adminProcedure.query(() => listWithdrawalsForAdmin()),
    updateWithdrawal: adminProcedure.input(z2.object({ id: z2.number().int().positive(), status: z2.enum(["approved", "rejected"]) })).mutation(async ({ input }) => {
      const result = await reviewWithdrawal(input);
      if (!result.ok) throw new TRPCError3({ code: result.reason === "not_found" ? "NOT_FOUND" : "BAD_REQUEST", message: result.reason === "not_found" ? "Withdrawal request not found." : result.reason === "not_pending" ? "This request is no longer pending." : "\u9501\u5B9A\u3001\u8D28\u62BC\u4E0E\u5F85\u63D0\u73B0\u91D1\u989D\u8D85\u8FC7\u8D26\u6237\u4F59\u989D\uFF0C\u8BF7\u5148\u68C0\u67E5\u8D26\u6237\u8BBE\u7F6E\u3002" });
      return { success: true };
    }),
    setUserPassword: adminProcedure.input(z2.object({ userId: z2.number().int().positive(), password: passwordSchema })).mutation(async ({ input }) => {
      const db = await Promise.resolve().then(() => (init_db(), db_exports)).then((module) => module.getDb());
      if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: "Database is not available." });
      const { users: users2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
      const { eq: eq3 } = await import("drizzle-orm");
      const target = await db.select({ id: users2.id }).from(users2).where(eq3(users2.id, input.userId)).limit(1);
      if (!target[0]) throw new TRPCError3({ code: "NOT_FOUND", message: "User not found." });
      await db.update(users2).set({ passwordHash: hashPassword(input.password), resetTokenHash: null, resetTokenExpiresAt: null, updatedAt: /* @__PURE__ */ new Date() }).where(eq3(users2.id, input.userId));
      return { success: true };
    }),
    listContactSubmissions: adminProcedure.query(async () => listContactSubmissions()),
    listBtcTransfers: adminProcedure.query(async () => listBtcTransfers()),
    updateBtcTransferStatus: adminProcedure.input(z2.object({ id: z2.number().int().positive(), status: z2.enum(["pending", "confirmed", "rejected"]) })).mutation(({ input }) => updateBtcTransferStatus(input.id, input.status)),
    updateBtcTransfer: adminProcedure.input(z2.object({ id: z2.number().int().positive(), txHash: z2.string().trim().min(20).max(160), amount: z2.string().trim().max(64).optional(), email: z2.string().email().optional(), status: z2.enum(["pending", "confirmed", "rejected"]) })).mutation(({ input }) => updateBtcTransfer(input.id, input)),
    listChildren: adminProcedure.query(async () => {
      const rows = await getAllChildrenForAdmin();
      return Promise.all(rows.map(async (row) => ({ ...row, ...await buildAccountSummary(row.child) })));
    }),
    createChild: adminProcedure.input(z2.object({ userId: z2.number().int().positive(), name: z2.string().trim().min(1).max(80), targetYears: z2.number().int().min(1).max(365), annualReturnBps: z2.number().int().min(0).max(1e5), treasuryAmountCents: cents.optional() })).mutation(async ({ input }) => {
      const child = await createChild({ userId: input.userId, name: input.name, targetYears: input.targetYears, annualReturnBps: input.annualReturnBps });
      if (input.treasuryAmountCents) await addFundingEntry({ childId: child.id, type: "treasury", amountCents: input.treasuryAmountCents, note: "\u91D1\u9E70\u8BA1\u5212\u6350\u6B3E\u4F53\u9A8C\u8D77\u59CB\u8D44\u91D1" });
      return child;
    }),
    addFunding: adminProcedure.input(z2.object({ childId: z2.number().int().positive(), amountCents: cents, type: z2.enum(["treasury", "deposit", "contribution", "withdrawal"]), currencyCode: z2.string().trim().min(2).max(12).default("BTC"), note: z2.string().max(255).optional() })).mutation(async ({ input }) => {
      const result = await addAdminFundingWithLimit(input);
      if (!result.ok) throw new TRPCError3({ code: result.reason === "not_found" ? "NOT_FOUND" : "BAD_REQUEST", message: result.reason === "not_found" ? "Account not found." : `\u53EF\u7528\u4F59\u989D\u4E0D\u8DB3\uFF0C\u5F53\u524D\u53EF\u7528\u91D1\u989D\u4E3A ${(result.availableCents / 100).toFixed(2)}\u3002` });
      return getChildById(input.childId);
    }),
    updateInterestRate: adminProcedure.input(z2.object({ childId: z2.number().int().positive(), annualReturnBps: z2.number().int().min(0).max(1e5), targetYears: z2.number().int().positive() })).mutation(async ({ input }) => {
      const db = await Promise.resolve().then(() => (init_db(), db_exports)).then((module) => module.getDb());
      if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: "Database is not available." });
      const child = await getChildById(input.childId);
      if (!child) throw new TRPCError3({ code: "NOT_FOUND", message: "Child account not found." });
      const { children: children2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
      const { eq: eq3 } = await import("drizzle-orm");
      await db.update(children2).set({ annualReturnBps: input.annualReturnBps, targetYears: input.targetYears, planStartedAt: /* @__PURE__ */ new Date(), updatedAt: /* @__PURE__ */ new Date() }).where(eq3(children2.id, input.childId));
      return getChildById(input.childId);
    }),
    updateStakingPlan: adminProcedure.input(z2.object({ childId: z2.number().int().positive(), stakingAmountCents: z2.number().int().min(1).max(2e9), stakingDays: z2.number().int().min(1).max(365) })).mutation(async ({ input }) => {
      const result = await setAccountStakingPlan(input);
      if (!result.ok) throw new TRPCError3({ code: result.reason === "not_found" ? "NOT_FOUND" : "BAD_REQUEST", message: result.reason === "not_found" ? "Account not found." : `\u8D28\u62BC\u91D1\u989D\u8D85\u8FC7\u53EF\u7528\u4F59\u989D\uFF08${(result.availableCents / 100).toFixed(2)}\uFF09\u3002` });
      return getChildById(input.childId);
    }),
    releaseStakingPosition: adminProcedure.input(z2.object({ id: z2.number().int().positive() })).mutation(async ({ input }) => {
      const result = await releaseStakingPosition(input.id);
      if (!result.ok) throw new TRPCError3({ code: result.reason === "not_found" ? "NOT_FOUND" : "BAD_REQUEST", message: result.reason === "not_found" ? "\u8D28\u62BC\u8BB0\u5F55\u4E0D\u5B58\u5728\u3002" : "\u8BE5\u7B14\u8D28\u62BC\u5DF2\u89E3\u9664\u6216\u5DF2\u5230\u671F\u3002" });
      return { success: true, childId: result.childId };
    }),
    releaseLegacyStaking: adminProcedure.input(z2.object({ childId: z2.number().int().positive() })).mutation(async ({ input }) => {
      const result = await releaseLegacyStaking(input.childId);
      if (!result.ok) throw new TRPCError3({ code: result.reason === "not_found" ? "NOT_FOUND" : "BAD_REQUEST", message: result.reason === "not_found" ? "\u8D26\u6237\u4E0D\u5B58\u5728\u3002" : "\u8BE5\u8D26\u6237\u6CA1\u6709\u5C1A\u672A\u89E3\u9664\u7684\u65E7\u8D28\u62BC\u3002" });
      return { success: true, childId: result.childId };
    }),
    setLockedAmount: adminProcedure.input(z2.object({ childId: z2.number().int().positive(), lockedAmountCents: z2.number().int().min(0).max(2e9) })).mutation(async ({ input }) => {
      const result = await setAccountLockedAmount(input);
      if (!result.ok) throw new TRPCError3({ code: result.reason === "not_found" ? "NOT_FOUND" : "BAD_REQUEST", message: result.reason === "not_found" ? "Account not found." : `\u9501\u5B9A\u91D1\u989D\u8D85\u8FC7\u53EF\u9501\u5B9A\u4F59\u989D\uFF08${(result.availableCents / 100).toFixed(2)}\uFF09\u3002` });
      return getChildById(input.childId);
    }),
    updateBalance: adminProcedure.input(z2.object({ childId: z2.number().int().positive(), balanceCents: z2.number().int().min(0).max(2e9) })).mutation(async ({ input }) => {
      const result = await setAccountBalance(input);
      if (!result.ok) throw new TRPCError3({ code: result.reason === "not_found" ? "NOT_FOUND" : "BAD_REQUEST", message: result.reason === "not_found" ? "Account not found." : "\u65B0\u4F59\u989D\u4E0D\u80FD\u4F4E\u4E8E\u9501\u5B9A\u3001\u8D28\u62BC\u548C\u5F85\u5904\u7406\u63D0\u73B0\u91D1\u989D\u7684\u603B\u548C\u3002" });
      return getChildById(input.childId);
    }),
    setContributionPlan: adminProcedure.input(z2.object({ childId: z2.number().int().positive(), monthlyAmountCents: cents, nextContributionAt: z2.coerce.date() })).mutation(async ({ input }) => {
      const child = await getChildById(input.childId);
      if (!child) throw new TRPCError3({ code: "NOT_FOUND", message: "Child account not found." });
      return createContributionPlan({ ...input, nextContributionAt: normalizeNewYorkScheduleDate(input.nextContributionAt) });
    }),
    getContent: adminProcedure.query(async () => ({ settings: await getSiteSettings(), currencies: await listCurrencies(), faqs: await listAllFaqs(), footerLinks: await listAllFooterLinks(), donation: await getDonationArticle(), articles: await listAllArticles() })),
    listAnnouncements: adminProcedure.query(() => listAnnouncementsForAdmin()),
    createAnnouncement: adminProcedure.input(z2.object({ title: z2.string().trim().min(1).max(160), body: z2.string().trim().min(1).max(1e4), imageUrl: contentImageUrl.optional().or(z2.literal("")) })).mutation(({ input }) => createAnnouncement({ title: input.title, body: input.body, imageUrl: input.imageUrl || "/gold-eagle-initiative.png" })),
    updateAnnouncement: adminProcedure.input(z2.object({ id: z2.number().int().positive(), title: z2.string().trim().min(1).max(160), body: z2.string().trim().min(1).max(1e4), imageUrl: contentImageUrl.optional().or(z2.literal("")) })).mutation(({ input }) => updateAnnouncement(input.id, { title: input.title, body: input.body, imageUrl: input.imageUrl || "/gold-eagle-initiative.png" })),
    setAnnouncementActive: adminProcedure.input(z2.object({ id: z2.number().int().positive(), active: z2.boolean() })).mutation(({ input }) => setAnnouncementActive(input.id, input.active)),
    deleteAnnouncement: adminProcedure.input(z2.object({ id: z2.number().int().positive() })).mutation(({ input }) => deleteAnnouncement(input.id)),
    getProjectContent: adminProcedure.query(() => getProjectContent()),
    updateProjectProgress: adminProcedure.input(z2.object({ title: z2.string().trim().min(1).max(160), description: z2.string().trim().min(1).max(1e4), imageUrl: contentImageUrl.optional().or(z2.literal("")), targetAmountCents: z2.number().int().min(0).max(2e9), raisedAmountCents: z2.number().int().min(0).max(2e9), currencyCode: z2.string().trim().min(2).max(12), eyebrow: z2.string().trim().min(1).max(120), sectionTitle: z2.string().trim().min(1).max(160), milestonesLabel: z2.string().trim().min(1).max(120), milestonesTitle: z2.string().trim().min(1).max(120), peopleLabel: z2.string().trim().min(1).max(120), peopleTitle: z2.string().trim().min(1).max(120) })).mutation(({ input }) => updateProjectProgress({ ...input, imageUrl: input.imageUrl || null, currencyCode: input.currencyCode.toUpperCase() })),
    createProjectMilestone: adminProcedure.input(z2.object({ title: z2.string().trim().min(1).max(160), description: z2.string().trim().min(1).max(1e4) })).mutation(({ input }) => createProjectMilestone(input)),
    updateProjectMilestone: adminProcedure.input(z2.object({ id: z2.number().int().positive(), title: z2.string().trim().min(1).max(160), description: z2.string().trim().min(1).max(1e4) })).mutation(({ input }) => updateProjectMilestone(input.id, { title: input.title, description: input.description })),
    deleteProjectMilestone: adminProcedure.input(z2.object({ id: z2.number().int().positive() })).mutation(({ input }) => deleteProjectMilestone(input.id)),
    createProjectPerson: adminProcedure.input(z2.object({ name: z2.string().trim().min(1).max(120), role: z2.string().trim().min(1).max(160), bio: z2.string().trim().min(1).max(1e4), imageUrl: contentImageUrl.optional().or(z2.literal("")) })).mutation(({ input }) => createProjectPerson({ ...input, imageUrl: input.imageUrl || null })),
    updateProjectPerson: adminProcedure.input(z2.object({ id: z2.number().int().positive(), name: z2.string().trim().min(1).max(120), role: z2.string().trim().min(1).max(160), bio: z2.string().trim().min(1).max(1e4), imageUrl: contentImageUrl.optional().or(z2.literal("")) })).mutation(({ input }) => updateProjectPerson(input.id, { name: input.name, role: input.role, bio: input.bio, imageUrl: input.imageUrl || null })),
    deleteProjectPerson: adminProcedure.input(z2.object({ id: z2.number().int().positive() })).mutation(({ input }) => deleteProjectPerson(input.id)),
    uploadContentImage: adminProcedure.input(z2.object({ fileName: z2.string().trim().min(1).max(120), mimeType: z2.string().regex(/^image\/(jpeg|png|webp|gif)$/), base64: z2.string().min(100).max(16e6) })).mutation(async ({ input }) => {
      const raw = input.base64.replace(/^data:[^;]+;base64,/, "");
      const result = await storagePut(`content/${Date.now()}-${input.fileName.replace(/[^a-zA-Z0-9._-]/g, "-")}`, Buffer.from(raw, "base64"), input.mimeType);
      return result;
    }),
    createArticleWithImage: adminProcedure.input(z2.object({ title: z2.string().trim().min(2).max(160), body: z2.string().trim().min(2).max(4e3), catalog: z2.string().trim().max(120).optional().or(z2.literal("")), linkUrl: contentLinkUrl.optional().or(z2.literal("")), placement: z2.enum(["donation", "carousel"]).default("carousel"), fileName: z2.string().trim().min(1).max(120), mimeType: z2.string().regex(/^image\/(jpeg|png|webp|gif)$/), base64: z2.string().min(100).max(16e6) })).mutation(async ({ input }) => {
      const raw = input.base64.replace(/^data:[^;]+;base64,/, "");
      const image = await storagePut(`content/${Date.now()}-${input.fileName.replace(/[^a-zA-Z0-9._-]/g, "-")}`, Buffer.from(raw, "base64"), input.mimeType);
      return createArticle({ title: input.title, body: input.body, catalog: input.catalog || void 0, imageUrl: image.url, linkUrl: input.linkUrl || void 0, placement: input.placement });
    }),
    updateBtcAddress: adminProcedure.input(z2.object({ btcAddress: z2.string().trim().min(26, "Enter a valid Bitcoin wallet address.").max(128).regex(/^bc1[a-zA-Z0-9]+$/, "Enter a valid Bitcoin bc1 address.") })).mutation(({ input }) => updateBtcAddress(input.btcAddress)),
    updateSettings: adminProcedure.input(z2.object({ btcAddress: z2.string().trim().min(26, "Enter a valid Bitcoin wallet address.").max(128).regex(/^bc1[a-zA-Z0-9]+$/, "Enter a valid Bitcoin bc1 address.").optional(), usdcAddress: z2.string().trim().min(20, "Enter a valid USDC wallet address.").max(128), defaultCurrencyCode: z2.string().trim().min(2).max(12).refine((value) => value.toUpperCase() !== "USD", "\u9ED8\u8BA4\u5E01\u79CD\u4E0D\u80FD\u8BBE\u7F6E\u4E3A\u7F8E\u5143"), contactEmail: z2.string().email(), contactName: z2.string().trim().min(1).max(100) })).mutation(({ input }) => updateSiteSettings({ ...input, btcAddress: input.btcAddress?.trim().toLowerCase() })),
    listCurrencies: adminProcedure.query(() => listCurrencies()),
    createCurrency: adminProcedure.input(z2.object({ code: z2.string().trim().min(2).max(12).regex(/^[A-Za-z0-9]+$/).refine((value) => value.toUpperCase() !== "USD", "\u4E0D\u652F\u6301\u6DFB\u52A0\u7F8E\u5143\u7C7B\u578B"), name: z2.string().trim().min(1).max(80), symbol: z2.string().trim().min(1).max(8) })).mutation(({ input }) => createCurrency(input)),
    deleteCurrency: adminProcedure.input(z2.object({ id: z2.number().int().positive() })).mutation(({ input }) => deleteCurrency(input.id)),
    createFaq: adminProcedure.input(z2.object({ question: z2.string().trim().min(3).max(255), answer: z2.string().trim().min(3).max(4e3) })).mutation(({ input }) => createFaq(input)),
    updateFaq: adminProcedure.input(z2.object({ id: z2.number().int().positive(), question: z2.string().trim().min(3).max(255), answer: z2.string().trim().min(3).max(4e3) })).mutation(({ input }) => updateFaq(input.id, input)),
    deleteFaq: adminProcedure.input(z2.object({ id: z2.number().int().positive() })).mutation(({ input }) => deleteFaq(input.id)),
    createFooterLink: adminProcedure.input(z2.object({ title: z2.string().trim().min(2).max(120), url: z2.string().trim().min(1).max(500).refine((value) => value.startsWith("/") || /^https?:\/\//.test(value), "Invalid footer link"), body: z2.string().trim().min(2).max(1e4) })).mutation(({ input }) => createFooterLink(input)),
    updateFooterLink: adminProcedure.input(z2.object({ id: z2.number().int().positive(), title: z2.string().trim().min(2).max(120), url: z2.string().trim().min(1).max(500).refine((value) => value.startsWith("/") || /^https?:\/\//.test(value), "Invalid footer link"), body: z2.string().trim().min(2).max(1e4) })).mutation(({ input }) => updateFooterLink(input.id, { title: input.title, url: input.url, body: input.body })),
    deleteFooterLink: adminProcedure.input(z2.object({ id: z2.number().int().positive() })).mutation(({ input }) => deleteFooterLink(input.id)),
    updateArticle: adminProcedure.input(z2.object({ id: z2.number().int().positive(), title: z2.string().trim().min(2).max(160), body: z2.string().trim().min(2).max(4e3), catalog: z2.string().trim().max(120).optional().or(z2.literal("")), imageUrl: contentImageUrl.optional().or(z2.literal("")), linkUrl: contentLinkUrl.optional().or(z2.literal("")), placement: z2.enum(["donation", "carousel"]).default("carousel") })).mutation(({ input }) => updateArticle(input.id, { title: input.title, body: input.body, catalog: input.catalog || void 0, imageUrl: input.imageUrl || void 0, linkUrl: input.linkUrl || void 0, placement: input.placement })),
    createArticle: adminProcedure.input(z2.object({ title: z2.string().trim().min(2).max(160), body: z2.string().trim().min(2).max(4e3), catalog: z2.string().trim().max(120).optional().or(z2.literal("")), imageUrl: contentImageUrl.optional().or(z2.literal("")), linkUrl: contentLinkUrl.optional().or(z2.literal("")), placement: z2.enum(["donation", "carousel"]).default("carousel") })).mutation(({ input }) => createArticle({ ...input, imageUrl: input.imageUrl || void 0, linkUrl: input.linkUrl || void 0, placement: input.placement })),
    deleteArticle: adminProcedure.input(z2.object({ id: z2.number().int().positive() })).mutation(({ input }) => deleteArticle(input.id))
  })
});

// server/_core/context.ts
async function createContext(opts) {
  let user = null;
  try {
    user = await sdk.authenticateRequest(opts.req);
  } catch (error) {
    user = null;
  }
  return {
    req: opts.req,
    res: opts.res,
    user
  };
}

// server/_core/vite.ts
import express2 from "express";
import fs2 from "fs";
import { nanoid } from "nanoid";
import path4 from "path";
import { createServer as createViteServer } from "vite";

// vite.config.ts
import { jsxLocPlugin } from "@builder.io/vite-plugin-jsx-loc";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import fs from "node:fs";
import path3 from "node:path";
import { defineConfig } from "vite";
import { vitePluginManusRuntime } from "vite-plugin-manus-runtime";
var PROJECT_ROOT = import.meta.dirname;
var LOG_DIR = path3.join(PROJECT_ROOT, ".manus-logs");
var MAX_LOG_SIZE_BYTES = 1 * 1024 * 1024;
var TRIM_TARGET_BYTES = Math.floor(MAX_LOG_SIZE_BYTES * 0.6);
function ensureLogDir() {
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  }
}
function trimLogFile(logPath, maxSize) {
  try {
    if (!fs.existsSync(logPath) || fs.statSync(logPath).size <= maxSize) {
      return;
    }
    const lines = fs.readFileSync(logPath, "utf-8").split("\n");
    const keptLines = [];
    let keptBytes = 0;
    const targetSize = TRIM_TARGET_BYTES;
    for (let i = lines.length - 1; i >= 0; i--) {
      const lineBytes = Buffer.byteLength(`${lines[i]}
`, "utf-8");
      if (keptBytes + lineBytes > targetSize) break;
      keptLines.unshift(lines[i]);
      keptBytes += lineBytes;
    }
    fs.writeFileSync(logPath, keptLines.join("\n"), "utf-8");
  } catch {
  }
}
function writeToLogFile(source, entries) {
  if (entries.length === 0) return;
  ensureLogDir();
  const logPath = path3.join(LOG_DIR, `${source}.log`);
  const lines = entries.map((entry) => {
    const ts = (/* @__PURE__ */ new Date()).toISOString();
    return `[${ts}] ${JSON.stringify(entry)}`;
  });
  fs.appendFileSync(logPath, `${lines.join("\n")}
`, "utf-8");
  trimLogFile(logPath, MAX_LOG_SIZE_BYTES);
}
function vitePluginManusDebugCollector() {
  return {
    name: "manus-debug-collector",
    transformIndexHtml(html) {
      if (process.env.NODE_ENV === "production") {
        return html;
      }
      return {
        html,
        tags: [
          {
            tag: "script",
            attrs: {
              src: "/__manus__/debug-collector.js",
              defer: true
            },
            injectTo: "head"
          }
        ]
      };
    },
    configureServer(server) {
      server.middlewares.use("/__manus__/logs", (req, res, next) => {
        if (req.method !== "POST") {
          return next();
        }
        const handlePayload = (payload) => {
          if (payload.consoleLogs?.length > 0) {
            writeToLogFile("browserConsole", payload.consoleLogs);
          }
          if (payload.networkRequests?.length > 0) {
            writeToLogFile("networkRequests", payload.networkRequests);
          }
          if (payload.sessionEvents?.length > 0) {
            writeToLogFile("sessionReplay", payload.sessionEvents);
          }
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: true }));
        };
        const reqBody = req.body;
        if (reqBody && typeof reqBody === "object") {
          try {
            handlePayload(reqBody);
          } catch (e) {
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: false, error: String(e) }));
          }
          return;
        }
        let body = "";
        req.on("data", (chunk) => {
          body += chunk.toString();
        });
        req.on("end", () => {
          try {
            const payload = JSON.parse(body);
            handlePayload(payload);
          } catch (e) {
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: false, error: String(e) }));
          }
        });
      });
    }
  };
}
var plugins = [react(), tailwindcss(), jsxLocPlugin(), vitePluginManusRuntime(), vitePluginManusDebugCollector()];
var vite_config_default = defineConfig({
  plugins,
  resolve: {
    alias: {
      "@": path3.resolve(import.meta.dirname, "client", "src"),
      "@shared": path3.resolve(import.meta.dirname, "shared"),
      "@assets": path3.resolve(import.meta.dirname, "attached_assets")
    }
  },
  envDir: path3.resolve(import.meta.dirname),
  root: path3.resolve(import.meta.dirname, "client"),
  publicDir: path3.resolve(import.meta.dirname, "client", "public"),
  build: {
    outDir: path3.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    host: true,
    allowedHosts: [
      ".manuspre.computer",
      ".manus.computer",
      ".manus-asia.computer",
      ".manuscomputer.ai",
      ".manusvm.computer",
      "localhost",
      "127.0.0.1"
    ],
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/_core/vite.ts
async function setupVite(app, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    server: serverOptions,
    appType: "custom"
  });
  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path4.resolve(
        import.meta.dirname,
        "../..",
        "client",
        "index.html"
      );
      let template = await fs2.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app) {
  const distPath = process.env.NODE_ENV === "development" ? path4.resolve(import.meta.dirname, "../..", "dist", "public") : path4.resolve(import.meta.dirname, "public");
  if (!fs2.existsSync(distPath)) {
    console.error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app.use(express2.static(distPath));
  app.use("*", (_req, res) => {
    res.sendFile(path4.resolve(distPath, "index.html"));
  });
}

// server/_core/index.ts
init_db();
function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}
async function findAvailablePort(startPort = 3e3) {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}
async function startServer() {
  await ensureDefaultAdmin().catch((error) => console.warn("[Auth] Default admin initialization failed:", error));
  const app = express3();
  const server = createServer(app);
  app.use(express3.json({ limit: "50mb" }));
  app.use(express3.urlencoded({ limit: "50mb", extended: true }));
  registerStorageProxy(app);
  registerOAuthRoutes(app);
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext
    })
  );
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);
  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }
  const host = process.env.HOST || (process.env.NODE_ENV === "production" ? "127.0.0.1" : "0.0.0.0");
  server.listen(port, host, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}
startServer().catch(console.error);
