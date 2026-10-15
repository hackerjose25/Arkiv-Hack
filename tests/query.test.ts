import { describe, it, expect } from "vitest";
import { compileQuery, publicQuery, type Filter } from "../lib/query";
const one = (patch: Partial<Filter>) => ({
  filters: [
    {
      field: "status",
      type: "str" as const,
      op: "eq" as const,
      value: "ready",
      ...patch,
    },
  ],
  limit: 10,
});
describe("typed query compiler (offline)", () => {
  it("escapes literals using the real SDK", () => {
    const q = compileQuery(one({ value: "maker's" }));
    expect(q).toContain("maker''s");
    expect(q).toContain("str(");
  });
  it("keeps u64 precision", () =>
    expect(
      compileQuery(
        one({
          field: "period",
          type: "u64",
          op: "gte",
          value: "9007199254740993",
        }),
      ),
    ).toContain("9007199254740993"));
  it("rejects oversized pages", () =>
    expect(() => compileQuery({ ...publicQuery, limit: 201 })).toThrow());
  it("accepts zero user filters without a namespace or creator restriction", () =>
    expect(compileQuery({ filters: [], limit: 10 })).toBe(
      "$expiresAt >= u64(0)",
    ));
  it("rejects payload paths and uppercase names", () => {
    for (const field of ["payload.value", "schemaVersion"])
      expect(() => compileQuery(one({ field }))).toThrow();
  });
  it("rejects wrong canonical metadata type", () =>
    expect(() =>
      compileQuery(one({ field: "$creator", type: "str", value: "anything" })),
    ).toThrow());
  it("rejects numeric range on strings", () =>
    expect(() => compileQuery(one({ op: "gte" }))).toThrow());
  it("rejects invalid boolean and integer literals", () => {
    expect(() => compileQuery(one({ type: "bool", value: "yes" }))).toThrow();
    expect(() => compileQuery(one({ type: "i32", value: "1.2" }))).toThrow();
  });
  it("rejects out of range i32 values", () =>
    expect(() =>
      compileQuery(one({ type: "i32", value: "9999999999" })),
    ).toThrow());
  it("combines filters with AND", () =>
    expect(
      compileQuery({
        filters: [
          ...one({}).filters,
          ...one({ field: "region", value: "west" }).filters,
        ],
        limit: 25,
      }),
    ).toBe("status = str('ready') AND region = str('west')"));
});
