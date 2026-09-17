import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { TRPCError } from "@trpc/server";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { addFundingEntry, createArticle, createBtcTransfer, deleteArticle, deleteCurrency, deleteFaq, updateArticle, createChild, createContactSubmission, createContributionPlan, createCurrency, createFaq, createLocalUser, createWithdrawalRequest, getChildById, getChildrenForUser, getFundingForChildren, getPlanForChild, getPlansForChildren, getSiteSettings, getDonationArticle, getUserByEmail, getUserByIdentifier, getUserByValidResetToken, listAllArticles, listAllFaqs, listArticles, listBtcTransfers, listContactSubmissions, listCurrencies, listFaqs, listUsersForAdmin, listWithdrawalsForAdmin, listWithdrawalsForUser, savePasswordResetToken, updateBtcAddress, updateBtcTransfer, updateBtcTransferStatus, updateFaq, updatePassword, updateSiteSettings, updateWithdrawalStatus, getAllChildrenForAdmin } from "./db";
import { createResetToken, hashPassword, hashResetToken, localOpenId, normalizeEmail, setLocalSession, validatePassword, verifyPassword } from "./auth";
import { calculateProjection } from "./projection";
import { storagePut } from "./storage";

const passwordSchema = z.string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain an uppercase letter")
  .regex(/[a-z]/, "Password must contain a lowercase letter")
  .regex(/\d/, "Password must contain a number");
const contentImageUrl = z.string().trim().max(500).refine((value) => value.startsWith("/manus-storage/") || /^https?:\/\//.test(value), "Invalid image path");
const contentLinkUrl = z.string().trim().max(500).refine((value) => value.startsWith("/") || /^https?:\/\//.test(value), "Invalid link");

const safeUser = (user: any) => ({ id: user.id, name: user.name, email: user.email, username: user.username, role: user.role, loginMethod: user.loginMethod });
const cents = z.number().int().positive().max(100_000_000);

async function buildAccountSummary(child: any) {
  const entries = await getFundingForChildren([child.id]);
  const plan = await getPlanForChild(child.id);
  return { child, entries, plan, projection: calculateProjection(entries, plan, child) };
}

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    register: publicProcedure.input(z.object({ email: z.string().email(), password: passwordSchema, name: z.string().trim().min(1).max(80).optional() })).mutation(async ({ input, ctx }) => {
      const email = normalizeEmail(input.email);
      if (await getUserByEmail(email)) throw new TRPCError({ code: "CONFLICT", message: "This email is already registered. Please log in" });
      try { const user = await createLocalUser({ openId: localOpenId(email), email, name: input.name?.trim() || email.split("@")[0], passwordHash: hashPassword(input.password), loginMethod: "email", role: "user", lastSignedIn: new Date() }); if (!user) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Account creation failed." }); await setLocalSession(ctx.req, ctx.res, user); return safeUser(user); } catch (error: any) { if (error?.code === "ER_DUP_ENTRY") throw new TRPCError({ code: "CONFLICT", message: "That email is already registered. Please log in." }); throw error; }
    }),
    login: publicProcedure.input(z.object({ identifier: z.string().trim().min(1), password: z.string().min(1) })).mutation(async ({ input, ctx }) => { const user = await getUserByIdentifier(input.identifier); if (!user?.passwordHash || !verifyPassword(input.password, user.passwordHash)) throw new TRPCError({ code: "UNAUTHORIZED", message: "The account or password is not correct." }); await setLocalSession(ctx.req, ctx.res, user); return safeUser(user); }),
    logout: publicProcedure.mutation(({ ctx }) => { const cookieOptions = getSessionCookieOptions(ctx.req); ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 }); return { success: true } as const; }),
    requestPasswordReset: publicProcedure.input(z.object({ email: z.string().email() })).mutation(async ({ input }) => { const email = normalizeEmail(input.email); const user = await getUserByEmail(email); if (!user || !user.passwordHash) return { success: true, devResetUrl: null }; const token = createResetToken(); await savePasswordResetToken(user.id, hashResetToken(token), new Date(Date.now() + 15 * 60 * 1000)); return { success: true, devResetUrl: process.env.NODE_ENV === "production" ? null : `/reset-password?token=${token}` }; }),
    resetPassword: publicProcedure.input(z.object({ token: z.string().min(20), password: passwordSchema })).mutation(async ({ input }) => { const user = await getUserByValidResetToken(hashResetToken(input.token)); if (!user) throw new TRPCError({ code: "BAD_REQUEST", message: "The reset link is invalid or expired." }); await updatePassword(user.id, hashPassword(input.password)); return { success: true } as const; }),
    changePassword: protectedProcedure.input(z.object({ currentPassword: z.string().min(1), newPassword: passwordSchema })).mutation(async ({ input, ctx }) => { if (!ctx.user.passwordHash || !verifyPassword(input.currentPassword, ctx.user.passwordHash)) throw new TRPCError({ code: "UNAUTHORIZED", message: "The current password is not correct." }); await updatePassword(ctx.user.id, hashPassword(input.newPassword)); return { success: true } as const; }),
  }),
  accounts: router({
    mine: protectedProcedure.query(async ({ ctx }) => { const childrenForUser = await getChildrenForUser(ctx.user.id); return Promise.all(childrenForUser.map(buildAccountSummary)); }),
    withdrawals: protectedProcedure.query(({ ctx }) => listWithdrawalsForUser(ctx.user.id)),
    requestWithdrawal: protectedProcedure.input(z.object({ amountCents: cents, destination: z.string().trim().min(10).max(255), note: z.string().trim().max(500).optional() })).mutation(({ input, ctx }) => createWithdrawalRequest({ ...input, userId: ctx.user.id })),
  }),
  content: router({
    public: publicProcedure.query(async () => ({ settings: await getSiteSettings(), currencies: await listCurrencies(), faqs: await listFaqs(), donation: await getDonationArticle(), articles: await listArticles() })),
    contact: publicProcedure.input(z.object({ email: z.string().trim().toLowerCase().email() })).mutation(async ({ input, ctx }) => createContactSubmission({ email: input.email, userId: ctx.user?.id ?? null })),
    submitBtcTransfer: publicProcedure.input(z.object({ txHash: z.string().trim().min(20).max(160), amount: z.string().trim().max(64).optional(), email: z.string().email().optional(), childId: z.number().int().positive().optional() })).mutation(async ({ input, ctx }) => createBtcTransfer({ ...input, userId: ctx.user?.id ?? null })),
  }),
  admin: router({
    listUsers: adminProcedure.query(async () => listUsersForAdmin()),
    listWithdrawals: adminProcedure.query(() => listWithdrawalsForAdmin()),
    updateWithdrawal: adminProcedure.input(z.object({ id: z.number().int().positive(), status: z.enum(["approved", "rejected"]) })).mutation(({ input }) => updateWithdrawalStatus(input.id, input.status)),
    setUserPassword: adminProcedure.input(z.object({ userId: z.number().int().positive(), password: passwordSchema })).mutation(async ({ input }) => { const db = await import("./db").then((module) => module.getDb()); if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database is not available." }); const { users } = await import("../drizzle/schema"); const { eq } = await import("drizzle-orm"); const target = await db.select({ id: users.id }).from(users).where(eq(users.id, input.userId)).limit(1); if (!target[0]) throw new TRPCError({ code: "NOT_FOUND", message: "User not found." }); await db.update(users).set({ passwordHash: hashPassword(input.password), resetTokenHash: null, resetTokenExpiresAt: null, updatedAt: new Date() }).where(eq(users.id, input.userId)); return { success: true } as const; }),
    listContactSubmissions: adminProcedure.query(async () => listContactSubmissions()),
    listBtcTransfers: adminProcedure.query(async () => listBtcTransfers()),
    updateBtcTransferStatus: adminProcedure.input(z.object({ id: z.number().int().positive(), status: z.enum(["pending", "confirmed", "rejected"]) })).mutation(({ input }) => updateBtcTransferStatus(input.id, input.status)),
    updateBtcTransfer: adminProcedure.input(z.object({ id: z.number().int().positive(), txHash: z.string().trim().min(20).max(160), amount: z.string().trim().max(64).optional(), email: z.string().email().optional(), status: z.enum(["pending", "confirmed", "rejected"]) })).mutation(({ input }) => updateBtcTransfer(input.id, input)),
    listChildren: adminProcedure.query(async () => { const rows = await getAllChildrenForAdmin(); return Promise.all(rows.map(async (row) => ({ ...row, ...(await buildAccountSummary(row.child)) }))); }),
    createChild: adminProcedure.input(z.object({ userId: z.number().int().positive(), name: z.string().trim().min(1).max(80), targetYears: z.number().int().min(1).max(50), annualReturnBps: z.number().int().min(0).max(2000), treasuryAmountCents: cents.optional() })).mutation(async ({ input }) => { const child = await createChild({ userId: input.userId, name: input.name, targetYears: input.targetYears, annualReturnBps: input.annualReturnBps }); if (input.treasuryAmountCents) await addFundingEntry({ childId: child!.id, type: "treasury", amountCents: input.treasuryAmountCents, note: "美国财政部一次性注资" }); return child; }),
    addFunding: adminProcedure.input(z.object({ childId: z.number().int().positive(), amountCents: cents, type: z.enum(["treasury", "deposit", "contribution", "withdrawal"]), currencyCode: z.string().trim().min(2).max(12).default("BTC"), note: z.string().max(255).optional() })).mutation(async ({ input }) => { const child = await getChildById(input.childId); if (!child) throw new TRPCError({ code: "NOT_FOUND", message: "Child account not found." }); if (input.type === "withdrawal") { const entries = await getFundingForChildren([input.childId]); const currentBalance = calculateProjection(entries, undefined, child).principalCents; if (input.amountCents > currentBalance) throw new TRPCError({ code: "BAD_REQUEST", message: `The withdrawal cannot exceed the current balance (${(currentBalance / 100).toFixed(2)}).` }); } return addFundingEntry(input); }),
    updateInterestRate: adminProcedure.input(z.object({ childId: z.number().int().positive(), annualReturnBps: z.number().int().min(0).max(5000) })).mutation(async ({ input }) => { const db = await import("./db").then((module) => module.getDb()); if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database is not available." }); const child = await getChildById(input.childId); if (!child) throw new TRPCError({ code: "NOT_FOUND", message: "Child account not found." }); const { children } = await import("../drizzle/schema"); const { eq } = await import("drizzle-orm"); await db.update(children).set({ annualReturnBps: input.annualReturnBps, updatedAt: new Date() }).where(eq(children.id, input.childId)); return getChildById(input.childId); }),
    updateBalance: adminProcedure.input(z.object({ childId: z.number().int().positive(), balanceCents: z.number().int().min(0).max(2_000_000_000) })).mutation(async ({ input }) => { const db = await import("./db").then((module) => module.getDb()); if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database is not available." }); const child = await getChildById(input.childId); if (!child) throw new TRPCError({ code: "NOT_FOUND", message: "Child account not found." }); const { children } = await import("../drizzle/schema"); const { eq } = await import("drizzle-orm"); await db.update(children).set({ balanceOverrideCents: input.balanceCents, updatedAt: new Date() }).where(eq(children.id, input.childId)); return getChildById(input.childId); }),
    setContributionPlan: adminProcedure.input(z.object({ childId: z.number().int().positive(), monthlyAmountCents: cents, nextContributionAt: z.coerce.date() })).mutation(async ({ input }) => { const child = await getChildById(input.childId); if (!child) throw new TRPCError({ code: "NOT_FOUND", message: "Child account not found." }); return createContributionPlan(input); }),
    getContent: adminProcedure.query(async () => ({ settings: await getSiteSettings(), currencies: await listCurrencies(), faqs: await listAllFaqs(), donation: await getDonationArticle(), articles: await listAllArticles() })),
    uploadContentImage: adminProcedure.input(z.object({ fileName: z.string().trim().min(1).max(120), mimeType: z.string().regex(/^image\/(jpeg|png|webp|gif)$/), base64: z.string().min(100).max(8_000_000) })).mutation(async ({ input }) => { const raw = input.base64.replace(/^data:[^;]+;base64,/, ""); const result = await storagePut(`content/${Date.now()}-${input.fileName.replace(/[^a-zA-Z0-9._-]/g, "-")}`, Buffer.from(raw, "base64"), input.mimeType); return result; }),
    updateBtcAddress: adminProcedure.input(z.object({ btcAddress: z.string().trim().min(26).max(128).regex(/^bc1[a-zA-Z0-9]+$/, "请输入有效的 Bitcoin bc1 地址") })).mutation(({ input }) => updateBtcAddress(input.btcAddress)),
    updateSettings: adminProcedure.input(z.object({ btcAddress: z.string().trim().min(26).max(128).regex(/^bc1[a-zA-Z0-9]+$/).optional(), usdcAddress: z.string().trim().min(10).max(128), defaultCurrencyCode: z.string().trim().min(2).max(12).refine((value) => value.toUpperCase() !== "USD", "默认币种不能设置为美元"), contactEmail: z.string().email(), contactName: z.string().trim().min(1).max(100) })).mutation(({ input }) => updateSiteSettings({ ...input, btcAddress: input.btcAddress?.trim().toLowerCase() })),
    listCurrencies: adminProcedure.query(() => listCurrencies()),
    createCurrency: adminProcedure.input(z.object({ code: z.string().trim().min(2).max(12).regex(/^[A-Za-z0-9]+$/).refine((value) => value.toUpperCase() !== "USD", "不支持添加美元类型"), name: z.string().trim().min(1).max(80), symbol: z.string().trim().min(1).max(8) })).mutation(({ input }) => createCurrency(input)),
    deleteCurrency: adminProcedure.input(z.object({ id: z.number().int().positive() })).mutation(({ input }) => deleteCurrency(input.id)),
    createFaq: adminProcedure.input(z.object({ question: z.string().trim().min(3).max(255), answer: z.string().trim().min(3).max(4000) })).mutation(({ input }) => createFaq(input)),
    updateFaq: adminProcedure.input(z.object({ id: z.number().int().positive(), question: z.string().trim().min(3).max(255), answer: z.string().trim().min(3).max(4000) })).mutation(({ input }) => updateFaq(input.id, input)),
    deleteFaq: adminProcedure.input(z.object({ id: z.number().int().positive() })).mutation(({ input }) => deleteFaq(input.id)),
    updateArticle: adminProcedure.input(z.object({ id: z.number().int().positive(), title: z.string().trim().min(2).max(160), body: z.string().trim().min(2).max(4000), catalog: z.string().trim().max(120).optional().or(z.literal("")), imageUrl: contentImageUrl.optional().or(z.literal("")), linkUrl: contentLinkUrl.optional().or(z.literal("")), placement: z.enum(["donation", "carousel"]).default("carousel") })).mutation(({ input }) => updateArticle(input.id, { title: input.title, body: input.body, catalog: input.catalog || undefined, imageUrl: input.imageUrl || undefined, linkUrl: input.linkUrl || undefined, placement: input.placement })),
    createArticle: adminProcedure.input(z.object({ title: z.string().trim().min(2).max(160), body: z.string().trim().min(2).max(4000), catalog: z.string().trim().max(120).optional().or(z.literal("")), imageUrl: contentImageUrl.optional().or(z.literal("")), linkUrl: contentLinkUrl.optional().or(z.literal("")), placement: z.enum(["donation", "carousel"]).default("carousel") })).mutation(({ input }) => createArticle({ ...input, imageUrl: input.imageUrl || undefined, linkUrl: input.linkUrl || undefined, placement: input.placement })),
    deleteArticle: adminProcedure.input(z.object({ id: z.number().int().positive() })).mutation(({ input }) => deleteArticle(input.id)),
  }),
});

export type AppRouter = typeof appRouter;
import { normalizeContactEmail } from "./contact";
