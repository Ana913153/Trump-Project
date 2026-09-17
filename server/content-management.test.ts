import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

const context = (user: TrpcContext["user"]): TrpcContext => ({
  user,
  req: { protocol: "https", headers: {} } as TrpcContext["req"],
  res: { clearCookie: () => undefined } as TrpcContext["res"],
});

describe("content management", () => {
  it("requires an administrator to upload a content image", async () => {
    const caller = appRouter.createCaller(context(null));
    await expect(caller.admin.uploadContentImage({ fileName: "project.png", mimeType: "image/png", base64: `data:image/png;base64,${"a".repeat(100)}` })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("requires an administrator to manage carousel content", async () => {
    const caller = appRouter.createCaller(context(null));
    await expect(caller.admin.createArticle({ title: "Project", body: "Project details", placement: "carousel" })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
});
