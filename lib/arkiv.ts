import { createPublicClient, type Entity } from "@arkiv-network/sdk";
import { tiramisu } from "@arkiv-network/sdk/chains";
import { http } from "viem";
import { predicates, querySchema, type QuerySpec } from "./query";

export const RPC = tiramisu.rpcUrls.default.http[0];
export function publicClient(signal?: AbortSignal) {
  return createPublicClient({
    chain: tiramisu,
    cacheTime: 0,
    transport: http(RPC, {
      timeout: 15_000,
      retryCount: 0,
      fetchOptions: { cache: "no-store", redirect: "error", signal },
    }),
  });
}
export async function runQuery(spec: QuerySpec, signal?: AbortSignal) {
  const parsed = querySchema.parse(spec);
  const filters = predicates(parsed);
  const client = publicClient(signal);
  const block = await client.getBlockNumber({ cacheTime: 0 });
  const page = await client
    .select({
      key: true,
      attributes: true,
      creator: true,
      owner: true,
      createdAt: true,
      expiresAt: true,
    })
    .where(...filters)
    .atBlock(block)
    .limit(parsed.limit)
    .fetch();
  if (page.blockNumber !== block)
    throw new Error("Snapshot mismatch. Run the query again.");
  return page;
}
export type Page = Awaited<ReturnType<typeof runQuery>>;
export type Row = Page["entities"][number];
export function attributeText(
  value: NonNullable<Entity["attributes"]>[string] | undefined,
) {
  return value ? String(value.value) : "—";
}
export async function inspectEntity(
  entityKey: `0x${string}`,
  signal?: AbortSignal,
) {
  const entity = await publicClient(signal).getEntity(entityKey);
  if (!entity.payload || entity.payload.length > 64 * 1024)
    throw new Error("Payload unavailable or exceeds the 64 KiB preview limit");
  return {
    entity,
    text: new TextDecoder("utf-8", { fatal: true }).decode(entity.payload),
  };
}
