// Read-only release evidence. Never connects a wallet or broadcasts a transaction.
import { readFile, stat, writeFile } from "node:fs/promises";
import { parseArgs } from "node:util";
import { ENTITY_EVENTS_ABI } from "@arkiv-network/sdk";
import { keccak256, parseEventLogs } from "viem";
import { publicClient, runQuery } from "../lib/arkiv";
import { aggregate } from "../lib/charts";
import { decodeDashboard, entityKeySchema } from "../lib/dashboard";

const { values } = parseArgs({
  options: {
    key: { type: "string" },
    definition: { type: "string" },
    out: { type: "string" },
  },
});
if (!!values.key === !!values.definition)
  throw new Error(
    "Use exactly one of --key <entity-key> or --definition <JSON-file>",
  );
if (values.key) entityKeySchema.parse(values.key);
if (values.definition && (await stat(values.definition)).size > 32768)
  throw new Error("Dashboard exceeds 32 KiB");
const client = publicClient();
const chainId = await client.getChainId();
if (chainId !== 7738577) throw new Error("Wrong network");
// Address confirmed against installed SDK 0.8.1 src/consts.ts.
const engine = "0x4400000000000000000000000000000000000044" as const;
const entity = values.key
  ? await client.getEntity(entityKeySchema.parse(values.key) as `0x${string}`)
  : undefined;
if (
  entity &&
  (entity.attributes.app?.value !== "arkivsight" ||
    entity.attributes.kind?.value !== "dashboard" ||
    entity.attributes.schema_version?.type !== "i32" ||
    entity.attributes.schema_version.value !== 1 ||
    entity.contentType !== "application/json" ||
    !entity.creationFlags.readonly ||
    entity.creationFlags.permissionlessExtension)
)
  throw new Error("Entity is not a readonly ArkivSight v1 dashboard");
const bytes =
  entity?.payload ?? new Uint8Array(await readFile(values.definition!));
const spec = decodeDashboard(bytes);
const page = await runQuery(spec.query);
let creation;
if (entity) {
  const logs = await client.getLogs({
    address: engine,
    event: ENTITY_EVENTS_ABI[0],
    args: { entityKey: entity.key },
    fromBlock: entity.createdAt,
    toBlock: entity.createdAt,
  });
  if (logs.length !== 1 || !logs[0].transactionHash || logs[0].removed)
    throw new Error("Could not uniquely recover a canonical creation event");
  const receipt = await client.getTransactionReceipt({
    hash: logs[0].transactionHash,
  });
  const events = parseEventLogs({
    abi: ENTITY_EVENTS_ABI,
    eventName: "EntityCreated",
    logs: receipt.logs.filter((log) => log.address.toLowerCase() === engine),
    strict: true,
  });
  const event = events.find(
    (log) => log.args.entityKey.toLowerCase() === entity.key.toLowerCase(),
  );
  if (
    receipt.status !== "success" ||
    receipt.blockNumber !== entity.createdAt ||
    receipt.blockHash !== logs[0].blockHash ||
    receipt.from.toLowerCase() !== entity.creator.toLowerCase() ||
    receipt.to?.toLowerCase() !== engine ||
    !event ||
    event.args.owner.toLowerCase() !== entity.creator.toLowerCase() ||
    event.args.creationFlags !== 1
  )
    throw new Error(
      "Creation receipt does not match authoritative entity metadata",
    );
  creation = {
    txHash: receipt.transactionHash,
    status: receipt.status,
    blockNumber: receipt.blockNumber.toString(),
    blockHash: receipt.blockHash,
    sender: receipt.from,
    engine,
    logIndex: event.logIndex,
    initialExpiresAt: event.args.expiresAt.toString(),
    creationFlags: event.args.creationFlags,
  };
}
const evidence = {
  observedAt: new Date().toISOString(),
  sdk: "0.8.1",
  chainId,
  kind: entity ? "published-dashboard" : "unpublished-definition-preview",
  entity: entity
    ? {
        key: entity.key,
        creator: entity.creator,
        owner: entity.owner,
        createdAt: entity.createdAt.toString(),
        expiresAt: entity.expiresAt.toString(),
      }
    : null,
  payloadHash: keccak256(bytes),
  creation: creation ?? null,
  query: spec.query,
  page: {
    blockNumber: page.blockNumber.toString(),
    count: page.entities.length,
    hasNext: page.hasNextPage(),
  },
  widgets: spec.widgets.map((widget) => ({
    id: widget.id,
    type: widget.type,
    aggregation: widget.aggregation,
    // Table rows and public attribute values are deliberately omitted from evidence.
    ...(widget.type === "kpi"
      ? { result: aggregate(page.entities, widget) }
      : {}),
  })),
  warnings: [
    ...(page.entities.length === 0
      ? ["Saved query currently returns zero records"]
      : []),
    "Counts and chart aggregates are page-scoped; this is not a full-chain count",
    "This command does not verify a hosted browser, wallet signature or iframe",
  ],
};
const output = JSON.stringify(evidence, null, 2) + "\n";
if (values.out) await writeFile(values.out, output, { flag: "wx" });
console.log(output);
