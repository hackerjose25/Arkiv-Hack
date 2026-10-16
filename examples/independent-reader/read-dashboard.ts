// Standalone public consumer: no Next server, wallet, MCP service or ArkivSight HTTP API.
import { parseArgs } from "node:util";
import { createPublicClient } from "@arkiv-network/sdk";
import { tiramisu } from "@arkiv-network/sdk/chains";
import { http } from "viem";
import { decodeDashboard, entityKeySchema } from "../../lib/dashboard";
import { predicates } from "../../lib/query";
import { aggregate } from "../../lib/charts";

const { values } = parseArgs({ options: { key: { type: "string" } } });
if (!values.key)
  throw new Error(
    "Usage: npm run read:dashboard -- --key <published-entity-key>",
  );
const key = entityKeySchema.parse(values.key) as `0x${string}`;
const client = createPublicClient({
  chain: tiramisu,
  cacheTime: 0,
  transport: http(tiramisu.rpcUrls.default.http[0], {
    timeout: 15_000,
    retryCount: 0,
    fetchOptions: { cache: "no-store", redirect: "error" },
  }),
});
if ((await client.getChainId()) !== tiramisu.id)
  throw new Error("RPC is not Tiramisu");
const entity = await client.getEntity(key);
if (
  entity.attributes.app?.value !== "arkivsight" ||
  entity.attributes.kind?.value !== "dashboard" ||
  entity.attributes.schema_version?.value !== 1 ||
  entity.contentType !== "application/json"
)
  throw new Error("Entity is not an ArkivSight v1 dashboard");
const definition = decodeDashboard(entity.payload);
const snapshot = await client.getBlockNumber({ cacheTime: 0 });
const page = await client
  .select({
    key: true,
    attributes: true,
    creator: true,
    owner: true,
    createdAt: true,
    expiresAt: true,
  })
  .where(...predicates(definition.query))
  .atBlock(snapshot)
  .limit(definition.query.limit)
  .fetch();
if (page.blockNumber !== snapshot) throw new Error("Unexpected query snapshot");
console.log(
  JSON.stringify(
    {
      observedAt: new Date().toISOString(),
      source: "direct-tiramisu-sdk",
      chainId: tiramisu.id,
      definition: {
        key,
        creator: entity.creator,
        owner: entity.owner,
        expiresAtBlock: entity.expiresAt.toString(),
      },
      query: definition.query,
      page: {
        snapshotBlock: snapshot.toString(),
        count: page.entities.length,
        hasNext: page.hasNextPage(),
      },
      widgets: definition.widgets.map((widget) => ({
        id: widget.id,
        type: widget.type,
        ...(widget.type === "table"
          ? { count: page.entities.length }
          : aggregate(page.entities, widget)),
      })),
      scope:
        "Current query page only. No global dataset totals or creation receipt verification claimed.",
    },
    null,
    2,
  ),
);
