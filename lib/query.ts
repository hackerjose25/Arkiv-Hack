import { z } from "zod";
import {
  addr,
  bool,
  dec,
  i32,
  key,
  str,
  u64,
  u256,
} from "@arkiv-network/sdk/attr";
import {
  and,
  eq,
  gt,
  gte,
  lt,
  lte,
  render,
  startsWith,
} from "@arkiv-network/sdk/query";

export const fieldSchema = z
  .string()
  .max(32)
  .regex(/^(?:[a-z][a-z0-9_]*|\$(?:creator|owner|key|expiresAt))$/);
export const filterSchema = z
  .object({
    field: fieldSchema,
    type: z.enum(["str", "i32", "u64", "u256", "dec", "bool", "addr", "key"]),
    op: z.enum(["eq", "gt", "gte", "lt", "lte", "prefix"]),
    value: z.string().max(512),
  })
  .strict();
export const querySchema = z
  .object({
    filters: z.array(filterSchema).min(1).max(12),
    limit: z.number().int().min(1).max(100),
  })
  .strict();
export type QuerySpec = z.infer<typeof querySchema>;
export type Filter = z.infer<typeof filterSchema>;
export const demoQuery: QuerySpec = {
  filters: [
    { field: "app", type: "str", op: "eq", value: "arkivsight" },
    { field: "kind", type: "str", op: "eq", value: "demo_metric" },
  ],
  limit: 25,
};
export function predicates(input: QuerySpec) {
  return querySchema.parse(input).filters.map((f) => {
    const expected: Record<string, string> = {
      $creator: "addr",
      $owner: "addr",
      $key: "key",
      $expiresAt: "u64",
    };
    if (expected[f.field] && expected[f.field] !== f.type)
      throw new Error(`${f.field} requires ${expected[f.field]}`);
    if (f.type !== "str" && !f.value.trim())
      throw new Error("A typed value is required");
    if (f.type === "bool" && !["true", "false"].includes(f.value))
      throw new Error("Boolean must be true or false");
    if (["i32", "u64", "u256"].includes(f.type) && !/^-?\d+$/.test(f.value))
      throw new Error("Use an exact integer");
    const value =
      f.type === "str"
        ? str(f.value)
        : f.type === "i32"
          ? i32(Number(f.value))
          : f.type === "u64"
            ? u64(BigInt(f.value))
            : f.type === "u256"
              ? u256(BigInt(f.value))
              : f.type === "dec"
                ? dec(f.value)
                : f.type === "bool"
                  ? bool(f.value === "true")
                  : f.type === "addr"
                    ? addr(f.value as `0x${string}`)
                    : key(f.value as `0x${string}`);
    if (f.op === "prefix") {
      if (f.type !== "str") throw new Error("Prefix requires a string");
      return startsWith(f.field, f.value);
    }
    if (f.op !== "eq" && !["i32", "u64", "u256", "dec"].includes(f.type))
      throw new Error("Range comparisons require numeric attributes");
    return { eq, gt, gte, lt, lte }[f.op](f.field, value);
  });
}
export function compileQuery(input: QuerySpec) {
  return render(and(...predicates(input)));
}
