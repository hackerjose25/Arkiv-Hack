# Independent dashboard reader

Read a published ArkivSight definition and execute its typed query directly against Tiramisu. This is a Node command, independent of the deployed website, its Next server and its optional MCP metadata service. Reading needs no wallet or account.

From the repository root, using Node 22.13+ (tested with 24):

```sh
npm ci
npm run read:dashboard -- --key <actual-published-dashboard-key>
```

You do not need to start the app. The command checks chain 7738577, reads the entity with SDK 0.8.1, verifies its app/kind/schema/content type, validates its size-bounded payload, compiles its indexed filters, and fetches the first query page at a fixed block. JSON output includes authoritative dashboard creator/owner, expiry block, query, page scope and widget results. It never signs or sends transactions. Query failures are errors, never replaced with fixture data.

The script imports the reusable v1 contract, query compiler and chart transforms from `lib/dashboard.ts`, `lib/query.ts` and `lib/charts.ts`. Those are plain TypeScript modules with no Next server dependency. A different application can reuse them under MIT, together with the lockfile's SDK, viem and Zod versions. Keep the same validation, field projections and page-scoped labels when adapting it. Payload fields are not queried.

Populated publisher-dashboard reproduction key:

```sh
npm run read:dashboard -- --key 0x5dba036694a998c9b9a6eda06d974bace7e30d5947d5090161427f029f83668f
```

That definition filters canonical creator metadata and returned18 records in its 16 October query/receipt verification. Results may change. Its creation transaction is recorded in `arkiv/dashboard-receipt-5dba03.json`. The older key `0x249da0c2b8ad2aa5def9d60f963d5c8fbb68084979d7f53054476f87408b3363` retained category=jose and returned zero; it remains a historical empty-query example. `examples/public-dashboard.json` is a different, still-unpublished file. Keys may expire. Use `npm run verify:dashboard` separately to recover and check a creation receipt.

An independent website can also serve `examples/independent-consumer/index.html` and embed `/embed/<key>` from a reviewed deployment. The iframe depends on its hosting origin, whereas this command reads Arkiv without the app host. Both still depend on a functioning public Arkiv RPC endpoint.
