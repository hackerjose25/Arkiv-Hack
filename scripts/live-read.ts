import { publicClient, runQuery } from "../lib/arkiv";
import { demoQuery } from "../lib/query";
import { u64 } from "@arkiv-network/sdk/attr";
import { gte } from "@arkiv-network/sdk/query";
const client = publicClient();
const chainId = await client.getChainId();
if (chainId !== 7738577) throw new Error("Wrong network");
const page = await runQuery(demoQuery);
console.log(
  JSON.stringify(
    {
      observedAt: new Date().toISOString(),
      sdk: "0.8.1",
      chainId,
      query: demoQuery,
      block: page.blockNumber.toString(),
      count: page.entities.length,
      hasNext: page.hasNextPage(),
      entities: page.entities.map((e) => ({
        key: e.key,
        creator: e.creator,
        owner: e.owner,
      })),
    },
    null,
    2,
  ),
);
if (process.argv.includes("--public-sample")) {
  const snapshot = await client.getBlockNumber({ cacheTime: 0 });
  let sample = await client
    .select({ key: true, creator: true, owner: true, expiresAt: true })
    .where(gte("$expiresAt", u64(snapshot)))
    .atBlock(snapshot)
    .limit(1)
    .fetch();
  const first = sample.entities[0];
  const proof = {
    observedAt: new Date().toISOString(),
    snapshot: snapshot.toString(),
    first: first
      ? {
          key: first.key,
          creator: first.creator,
          owner: first.owner,
          expiresAt: first.expiresAt.toString(),
        }
      : null,
    hasNext: sample.hasNextPage(),
    nextKey: "",
  };
  if (sample.hasNextPage()) {
    sample = await sample.next();
    if (sample.blockNumber !== snapshot)
      throw new Error("Pagination snapshot changed");
    proof.nextKey = sample.entities[0]?.key ?? "";
  }
  console.log(
    "Explicit bounded public metadata sample (no payload or attributes):",
  );
  console.log(JSON.stringify(proof, null, 2));
}
