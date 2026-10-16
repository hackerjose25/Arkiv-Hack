import { isAddress } from "viem";
import type { Filter, QuerySpec } from "./query";

export const systemFields = {
  $creator: {
    label: "Created by (wallet)",
    type: "addr",
    help: "Original creator from Arkiv metadata.",
  },
  $owner: {
    label: "Owned by (wallet)",
    type: "addr",
    help: "Current owner from Arkiv metadata.",
  },
  $key: {
    label: "Entity key",
    type: "key",
    help: "The entity's unique Arkiv key.",
  },
  $expiresAt: {
    label: "Expiry block",
    type: "u64",
    help: "Expiry is a block height, not a date.",
  },
} as const;
export type ObservedFields = [string, Set<string>][];
export function systemField(field: string) {
  return Object.hasOwn(systemFields, field)
    ? systemFields[field as keyof typeof systemFields]
    : undefined;
}
export function operatorChoices(type: Filter["type"]) {
  if (type === "str") return ["eq", "prefix"] as const;
  if (["i32", "u64", "u256", "dec"].includes(type))
    return ["eq", "gt", "gte", "lt", "lte"] as const;
  return ["eq"] as const;
}
export function chooseField(
  filter: Filter,
  field: string,
  observed: ObservedFields,
): Filter {
  const types = observed.find(([name]) => name === field)?.[1];
  const inferred =
    systemField(field)?.type ?? (types?.size === 1 ? [...types][0] : undefined);
  const type =
    inferred &&
    ["str", "i32", "u64", "u256", "dec", "bool", "addr", "key"].includes(
      inferred,
    )
      ? (inferred as Filter["type"])
      : filter.type;
  return {
    ...filter,
    field,
    type,
    op: operatorChoices(type).some((op) => op === filter.op) ? filter.op : "eq",
  };
}
export function publisherQuery(
  query: QuerySpec,
  address: string,
  field: "$creator" | "$owner" = "$creator",
): QuerySpec {
  const value = address.trim();
  if (!isAddress(value))
    throw new Error(
      "Enter a valid wallet address: 0x followed by 40 hexadecimal characters.",
    );
  const filters = query.filters.filter((filter) => filter.field !== field);
  if (filters.length >= 12)
    throw new Error(
      "A query supports 12 conditions. Remove one before adding a publisher filter.",
    );
  return {
    ...query,
    filters: [...filters, { field, type: "addr", op: "eq", value }],
  };
}
