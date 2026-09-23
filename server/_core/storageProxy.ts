import path from "node:path";
import express, { type Express } from "express";

const uploadRoot = path.resolve(process.cwd(), "uploads");

export function registerStorageProxy(app: Express) {
  app.use(
    "/manus-storage",
    express.static(uploadRoot, {
      fallthrough: false,
      index: false,
      maxAge: "1h",
    }),
  );
}
