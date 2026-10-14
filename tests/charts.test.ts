import { describe, it, expect } from "vitest";
import { i32, str, u256 } from "@arkiv-network/sdk/attr";
import { aggregate } from "../lib/charts";
import { defaultWidget } from "../lib/dashboard";
import type { Row } from "../lib/arkiv";
const row = (category: string, value: number): Row => ({
  key: "0x01",
  creator: "0x01",
  owner: "0x01",
  createdAt: 1n,
  expiresAt: 100n,
  attributes: { category: str(category), value: i32(value) },
});
describe("page-scoped transforms (synthetic offline fixtures)", () => {
  it("sums and averages groups", () => {
    const rows = [row("A", 10), row("A", 20), row("B", 5)];
    expect(aggregate(rows, defaultWidget).points).toEqual([
      { name: "A", value: 30 },
      { name: "B", value: 5 },
    ]);
    expect(
      aggregate(rows, { ...defaultWidget, aggregation: "average" }).points[0]
        .value,
    ).toBe(15);
  });
  it("skips missing and unsafe values without coercing strings", () => {
    const missing = {
      ...row("A", 1),
      attributes: { category: str("A"), value: str("100") },
    };
    const unsafe = {
      ...row("A", 1),
      attributes: { value: u256(9007199254740993n) },
    };
    expect(aggregate([missing, unsafe], defaultWidget)).toEqual({
      points: [],
      skipped: 2,
    });
  });
  it("counts rows without requiring a numeric measure", () => {
    expect(
      aggregate([row("A", 10), row("B", 20)], {
        ...defaultWidget,
        type: "kpi",
        aggregation: "count",
      }).points,
    ).toEqual([{ name: "Current page", value: 2 }]);
  });
  it("uses Map for hostile group names", () =>
    expect(
      aggregate([row("__proto__", 2)], defaultWidget).points[0].value,
    ).toBe(2));
});
