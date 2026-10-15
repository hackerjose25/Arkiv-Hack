# ArkivSight schema — runtime v1, writes pending

Updated 14 October 2026, Codex. SDK 0.8.1 / viem 2.57.7. This file describes implemented serializers and verified read operations. **No ArkivSight entities have yet been written.** The transaction ledger remains empty until wallet-approved live verification.

## Indexed attributes versus payload

Application attribute names are lowercase `[a-z][a-z0-9_]*`, at most 32 characters. Strings use SDK `str` (implicit bare strings on writes); integers use `i32`. Payload JSON is not queryable. `$creator`, `$owner`, `$key` and `$expiresAt` are authoritative system metadata with types addr, addr, key and u64. Returned creator/owner are taken from entity metadata, never identically named custom attributes. Created/expiry fields are block heights, not timestamps.

## Synthetic metric

`lib/wallet.ts: syntheticParameters()` prepares 12 records; all values are fictional.

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

`QuerySpec = { filters: {field,type,op,value:string}[], limit:number }`. 1–12 AND conditions, limit 1–100. Types: str/i32/u64/u256/dec/bool/addr/key. Constructors validate exact numeric ranges; bigint typed values are parsed without Number conversion. Prefix is string-only; range is numeric-only.

Default rendered query: `app = str('arkivsight') AND kind = str('demo_metric')`.

`runQuery()` reads a fresh head, then selects key, attributes, creator, owner, createdAt and expiresAt using `.atBlock(block).limit(limit).fetch()`. No payload in the table projection. Next page uses immutable `page.next()`; prior pages remain readable. Changing filters invalidates navigation until rerun. Cursor failures ask for a fresh query. Sorting is client-side **current page only**; SDK 0.8.1 has no server ORDER BY. Counts and chart totals are always current-page counts, never a global chain count.

Public dashboard: `getEntity(key)` (SDK performs `$key = key(...)`, full projection, limit 1), verify app/kind/schema_version/contentType, size-bound and Zod-validate payload, run its query. Payload inspection is capped at 64 KiB after SDK retrieval; this does not cap the provider's HTTP body before parsing.

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

### Pending writes

| Type | Writer | Entity key | Tx hash | Expiry |
|---|---|---|---|---|
| demo_metric | PENDING wallet | PENDING | PENDING | PENDING |
| dashboard | PENDING wallet | PENDING | PENDING | PENDING |

Next: user installs and funds an EOA wallet, signs seed, record actual read-back; then publish/read dashboard independently. Do not mark M1/M4 complete before this evidence.

Official sources: https://docs.arkiv.network/typescript-sdk/querying-data/ and installed SDK source under `src/query`, `src/actions/wallet`, `src/types/entity.ts`.
