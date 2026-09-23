import path from "node:path";
import crypto from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";

const uploadRoot = path.resolve(process.cwd(), "uploads");

function normalizeKey(relKey: string): string {
  return relKey
    .replace(/^\/+/, "")
    .replace(/\\/g, "/")
    .replace(/\.\.+/g, "_");
}

function appendHashSuffix(relKey: string): string {
  const hash = crypto.randomUUID().replace(/-/g, "").slice(0, 8);
  const dot = relKey.lastIndexOf(".");
  return dot < 0
    ? `${relKey}_${hash}`
    : `${relKey.slice(0, dot)}_${hash}${relKey.slice(dot)}`;
}

export async function storagePut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  _contentType = "application/octet-stream",
): Promise<{ key: string; url: string }> {
  const key = appendHashSuffix(normalizeKey(relKey));
  const target = path.resolve(uploadRoot, key);

  if (!target.startsWith(`${uploadRoot}${path.sep}`)) {
    throw new Error("Invalid storage path");
  }

  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, data);

  return {
    key,
    url: `/manus-storage/${key}`,
  };
}

export async function storageGet(
  relKey: string,
): Promise<{ key: string; url: string }> {
  const key = normalizeKey(relKey);
  return { key, url: `/manus-storage/${key}` };
}

export async function storageGetSignedUrl(relKey: string): Promise<string> {
  const key = normalizeKey(relKey);
  return `/manus-storage/${key}`;
}
