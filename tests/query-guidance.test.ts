import { describe, expect, it } from "vitest";
import {
  chooseField,
  publisherQuery,
  operatorChoices,
} from "../lib/query-guidance";
import { compileQuery, type Filter } from "../lib/query";
const address = "0x" + "1".repeat(40);
const filter: Filter = {
  field: "status",
  type: "str",
  op: "prefix",
  value: "ready",
};
describe("guided query fields and canonical publisher filters", () => {
  it("selects canonical types and legal operators instead of trusting custom names", () => {
    expect(chooseField(filter, "$creator", [])).toMatchObject({
      field: "$creator",
      type: "addr",
      op: "eq",
    });
    expect(chooseField(filter, "$expiresAt", [])).toMatchObject({
      type: "u64",
      op: "eq",
    });
    expect(chooseField(filter, "creator", [])).toMatchObject({
      type: "str",
      op: "prefix",
    });
    expect(operatorChoices("addr")).toEqual(["eq"]);
    expect(operatorChoices("u64")).not.toContain("prefix");
  });
  it("infers an unambiguous observed type and preserves exact values", () => {
    const result = chooseField(
      { ...filter, value: "9007199254740993" },
      "amount",
      [["amount", new Set(["u64"])]],
    );
    expect(compileQuery({ filters: [result], limit: 10 })).toContain(
      "u64(9007199254740993)",
    );
  });
  it("replaces existing publisher predicates, keeps other conditions and uses metadata", () => {
    const original = {
      filters: [
        { ...filter, op: "eq" as const },
        {
          field: "$creator",
          type: "addr" as const,
          op: "eq" as const,
          value: "0x" + "2".repeat(40),
        },
      ],
      limit: 25,
    };
    const result = publisherQuery(original, ` ${address} `);
    expect(result.filters).toHaveLength(2);
    expect(result.filters[0]).toEqual(original.filters[0]);
    expect(result.filters[1]).toEqual({
      field: "$creator",
      type: "addr",
      op: "eq",
      value: address,
    });
    expect(compileQuery(result)).toContain(`$creator = addr(${address})`);
    expect(original.filters[1].value).not.toBe(address);
    expect(
      publisherQuery(result, address, "$owner").filters.at(-1)?.field,
    ).toBe("$owner");
  });
  it("rejects invalid wallet addresses and enforces the condition limit", () => {
    expect(() =>
      publisherQuery({ filters: [], limit: 50 }, "$creator"),
    ).toThrow("valid wallet address");
    const full = {
      filters: Array.from({ length: 12 }, () => filter),
      limit: 50,
    };
    expect(() => publisherQuery(full, address)).toThrow("12 conditions");
    expect(
      publisherQuery(
        {
          ...full,
          filters: [
            ...full.filters.slice(1),
            { field: "$creator", type: "addr", op: "eq", value: address },
          ],
        },
        address,
      ).filters,
    ).toHaveLength(12);
  });
});
