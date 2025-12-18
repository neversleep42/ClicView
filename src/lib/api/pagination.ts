import { z } from "zod";

const cursorSchema = z.object({
  v: z.literal(1),
  sortValue: z.union([z.string(), z.number()]),
  id: z.string().min(1),
});

export type CursorPayload = z.infer<typeof cursorSchema>;

export function encodeCursor(payload: CursorPayload): string {
  const json = JSON.stringify(payload);
  return Buffer.from(json).toString("base64url");
}

export function decodeCursor(cursor: string): CursorPayload {
  let json: string;
  try {
    json = Buffer.from(cursor, "base64url").toString("utf8");
  } catch {
    throw new Error("Invalid cursor encoding.");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    throw new Error("Invalid cursor JSON.");
  }

  const result = cursorSchema.safeParse(parsed);
  if (!result.success) throw new Error("Invalid cursor payload.");
  return result.data;
}

export function parseLimit(raw: string | null, { defaultLimit, maxLimit }: { defaultLimit: number; maxLimit: number }) {
  if (!raw) return defaultLimit;
  const limit = Number(raw);
  if (!Number.isFinite(limit) || limit <= 0) return defaultLimit;
  return Math.min(Math.floor(limit), maxLimit);
}

export function parseOrder(raw: string | null): "asc" | "desc" {
  return raw === "asc" ? "asc" : "desc";
}

export function parseOrderWithDefault(raw: string | null, defaultOrder: "asc" | "desc"): "asc" | "desc" {
  if (raw === "asc") return "asc";
  if (raw === "desc") return "desc";
  return defaultOrder;
}

export function pgTextValue(value: string) {
  const escaped = value.replace(/"/g, '""');
  return `"${escaped}"`;
}
