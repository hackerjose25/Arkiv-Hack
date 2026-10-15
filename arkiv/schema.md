# ArkivSight schema — runtime v1, public data browser

Updated 15 October 2026, Codex. SDK 0.8.1 / viem 2.57.7. The app reads existing public records and writes only dashboard definitions through user-approved wallets. Dataset generation/publication has been removed. Previously published entities remain historical chain evidence below.

## Indexed attributes versus payload

Application attribute names are lowercase `[a-z][a-z0-9_]*`, at most 32 characters. Strings use SDK `str` (implicit bare strings on writes); integers use `i32`. Payload JSON is not queryable. `$creator`, `$owner`, `$key` and `$expiresAt` are authoritative system metadata with types addr, addr, key and u64. Returned creator/owner are taken from entity metadata, never identically named custom attributes. Created/expiry fields are block heights, not timestamps.

## Retired synthetic metric schema — historical evidence only

The removed `syntheticParameters()` previously prepared 12 fictional metrics. No application UI, generator or seed write path remains. Existing public entities have not been deleted and can still match broad public queries; an unfiltered reader cannot certify whether an arbitrary publisher's content is factual or synthetic.

| Attribute | Type | Value |
|---|---|---|
| app | str | arkivsight |
| kind | str | demo_metric |
| dataset | str | sample_metrics_v1 |
| category | str | Compute / Storage / Indexing |
| region | str | Chennai / Mumbai |
| period | i32 | YYYYMMDD: 20261001–20261004 |
| value | i32 | `20 + (sequence * 17) % 90` |
| sequence | i32 | 0–11 |

Payload: `{ "label": "Synthetic metric", "description": "Fabricated demonstration values; no personal data", "unit": "requests" }`. Content type application/json; readonly true; permissionlessExtension false; requested expiration `ExpirationTime.fromDays(30)`. Actual expiry must come from read-back. One atomic `executeBatch({creates})`; existing creator-scoped dataset is checked first. No claimed permanent retention or auto-renewal.

## Dashboard definition

| Attribute | Type | Value |
|---|---|---|
| app | str | arkivsight |
| kind | str | dashboard |
| schema_version | i32 | 1 |
| public_id | str | random UUID |

Payload validated by `lib/dashboard.ts`: strict version 1; network tiramisu; title 1–100 characters; description <=500; one `query`; 1–8 widgets with unique IDs; refreshSeconds 30–3600; ISO createdAt. Maximum encoded JSON 32 KiB. Unknown fields rejected. Readonly true; permissionlessExtension false; application/json; requested expiration 90 days. This replaces the proposal's camelCase indexed fields and multiple query/layout arrays before any deployment, so there is no on-chain migration.

Example payload (schema fixture, NOT an on-chain artifact):

```json
{"version":1,"network":"tiramisu","title":"Metrics","description":"Synthetic dataset","query":{"filters":[{"field":"app","type":"str","op":"eq","value":"arkivsight"},{"field":"kind","type":"str","op":"eq","value":"demo_metric"}],"limit":25},"widgets":[{"id":"overview","title":"Requests by category","type":"bar","groupBy":"category","measure":"value","aggregation":"sum"}],"refreshSeconds":60,"createdAt":"2026-10-14T12:00:00.000Z"}
```

Widget types: table, bar, line, kpi. Aggregation: count/sum/average. Array order is layout order, with responsive CSS grid. Every widget uses the same query. No scripts, URLs, HTML, arbitrary iframe settings or payload-based query fields in this contract.

## Actual queries

`QuerySpec = { filters: {field,type,op,value:string}[], limit:number }`. 0–12 AND conditions, limit 1–100. Types: str/i32/u64/u256/dec/bool/addr/key. Constructors validate exact numeric ranges; bigint typed values are parsed without Number conversion. Prefix is string-only; range is numeric-only.

Default query: `{filters: [], limit: 50}`. SDK 0.8.1 refuses a builder without predicates; zero user filters compile to `$expiresAt >= u64(0)`. Every currently queryable entity has a nonnegative unsigned expiry block, so this places no app/dataset/creator restriction. Public Database automatically runs this bounded query and uses its pinned cursors. Query studio allows deleting the last filter and clearing all filters. Existing filtered dashboard definitions still parse; new zero-filter definitions require this updated reader. The version-1 JSON structure is unchanged.

`runQuery()` reads a fresh head, then selects key, attributes, creator, owner, createdAt and expiresAt using `.atBlock(block).limit(limit).fetch()`. No payload in the table projection. Next page uses immutable `page.next()`; prior pages remain readable. Changing filters invalidates navigation until rerun. Cursor failures ask for a fresh query. Sorting is client-side **current page only**; SDK 0.8.1 has no server ORDER BY. Counts and chart totals are always current-page counts, never a global chain count.

Public dashboard: `getEntity(key)` (SDK performs `$key = key(...)`, full projection, limit 1), verify app/kind/schema_version/contentType, size-bound and Zod-validate payload, run its query. Payload inspection is capped at 64 KiB after SDK retrieval; this does not cap the provider's HTTP body before parsing.

Runtime polling policy (15 October): studio first-page queries, public dashboards and embeds refresh 30 seconds after each completed successful read. Hidden tabs pause, failures back off; studio polling also pauses on edited filters and later cursor pages. New dashboard definitions write refreshSeconds=30. Existing readonly definitions retain their stored fields; the current reader uses 30 seconds, including for older 60-second definitions. No on-chain schema version or entity was rewritten.

MCP observations are supplemental and are not persisted as Arkiv entities. `/api/mcp/entity?key=<public-key>` sends only that key and publicEvidenceReviewed=true to the fixed Devfolio `verify_entity` tool. Validated response fields include status, created/updated/expiry block, creation flags, warnings and observation (Tiramisu chain 7738577, query-page block, time and server version). No dataset rows, attributes, payload or canonical creator/owner are provided by that tool. Those still come from direct SDK queries.

## Live read evidence

`npm run test:live -- --public-sample`, 2026-10-14 17:52 UTC (23:22 IST), chain ID 7738577. Demo query: block 575290, 0 records, no next page.

Deliberate metadata-only sample: `$expiresAt >= u64(575291)`, atBlock 575291, limit 1. Only key/creator/owner/expiresAt selected. `hasNextPage()` true; `.next()` retained snapshot 575291 and returned a distinct key.

- First key: `0x8698a23494ad282fcf80edd546ad0670d1f6a67d2a12248b394077aeffc28e6e`
- Creator and owner: `0x679B5Ab1cd4B488D73025d0D72d4017Fa2d97B59`
- Observed expiry block: 576190
- Second key: `0xbaa578cf5212bed7cff354883fe3d18f91c2c13f42b24f47c66593b173b37863`

These are third-party public metadata observations, **not project-written artifacts**. No payload or user-defined attributes were fetched in the sample. References can expire; this record proves the observed test, not current availability. Explorer entity URL patterns have not been verified, so no guessed entity links are shown.

## Project write ledger

### Read re-verification — 15 October 2026

At 04:37:58–04:37:59 UTC (10:07:58–10:07:59 IST), SDK 0.8.1 on chain 7738577 returned zero demo records at block 594656. A bounded metadata-only sample at the same snapshot returned:

- First key: `0x95bc88ffdc04c7767c1b5ecb8ae55d880dc602386d56835aeb8577aac41ce3f5`
- Creator and owner: `0x6CB41094b6AE370454C2c34Cf91Cf02e768A5E22`
- Expiry block: 595556
- Second key: `0x47525ca46c6f07377a798ca5550d979cd10e3f9ef6c606dd0227ec7cfd7c65fd`

Command: `npm run test:live -- --public-sample`, using bundled Node 24.19.0 outside sandbox DNS restrictions. No TLS bypass. These are third-party public metadata observations, not project-created records. User confirms wallet is not yet set up.

### Verified on-chain writes — 15 October 2026

- **Writer / Creator Address:** `0x9cC4bc554C544856E9DE2D244F05c0d6E8Be099A`
- **Synthetic metrics batch (12 entities verified at snapshot 596064):**
  - `0xeaa7287a23de6198732a0004313073f795549cdc176834c725570c9c8a0f5bed`
  - `0xd1ee0e7427466e8d4e25cccd95cdfccf8fe33cbd6df81409b3ef68ea77f37ef9`
  - `0xcde9877e4dbb5eb0e3e68ab67f110fe651c803888e398fa5f6749cf651b50d69`
  - `0xca3664071e6d21b52a2f9db256afa5078e9800ada5c221a042c01d46a1526c0f`
  - `0xc90b2b7af38aa8822b483dac2f7261baa33179a5a3bd902405ba9b211189e53b`
  - `0xb1af9f9bc2722878daba498e128c349805ced2ec38cebc7386e264aacbbc0cbe`
  - `0x9e8d93847fcae6ba265f70c4f8ac5c9ff4a67d6a1ca5ca3d9f701e42ae823cce`
  - `0x906a575443875a4dc541da1e848e5c19b1ef3367d13743fd40de54787f4484ec`
  - `0x8a7dbf642bab59e7ed4773599792a3c2af68d14f801e070191f6085d371400aa`
  - `0x6c2ce4281d1d2a8c229bc13257180e09663793943f9a83c8fc8c189f10f1aed9`
  - `0x672713a510ad39df277f89f16b6aa200349f9a89b2ca437326acc7e503c523cd`
  - `0x5cb970766f082ebaef4b3e9b21d8d23301fea230b954056e88eafbc9a761065b`
- **Published dashboard definition keys:**
  - `0x249da0c2b8ad2aa5def9d60f963d5c8fbb68084979d7f53054476f87408b3363`
  - `0x8ca8fd6a7ff57eddcfd5b711579e10d4cacd644a618b00c02844a93710908bec`

| Type | Writer | Entity count / Sample key | Expiry |
|---|---|---|---|
| demo_metric | `0x9cC4bc554C544856E9DE2D244F05c0d6E8Be099A` | 12 records (`0xeaa7287a...`) | ~30 days |
| dashboard | `0x9cC4bc554C544856E9DE2D244F05c0d6E8Be099A` | 2 records (`0x249da0c2...`) | ~90 days |

Official sources: https://docs.arkiv.network/typescript-sdk/querying-data/ and installed SDK source under `src/query`, `src/actions/wallet`, `src/types/entity.ts`.
