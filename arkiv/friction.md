# Arkiv developer friction — measured integration findings

Updated 16 October 2026, Codex. Windows; system Node 20.18.0/npm 11.13.0, bundled Node 24.19.0 used for verification. Supported project runtime Node >=22.13. SDK **0.8.1**, viem **2.57.7**. Tiramisu chain **7738577**, public HTTP RPC `https://rpc.tiramisu.db-chain.testnet.arkiv.network`. Documentation baseline **6265194**; current reviewed source baseline **97bfc7b**. Historical user-wallet writes and their receipts are verified below; current audit calls are read-only. No private key or API key is required by the frontend.

## F-001 — Certificate validation blocked first network access, then recovered

- Expected: public `eth_chainId` succeeds without credentials.
- Repro: `npm run test:live`; client uses SDK createPublicClient, Tiramisu, viem HTTP, no retries, 15-second timeout.
- Initial actual: Node HttpRequestError -> fetch failed -> `UNABLE_TO_VERIFY_LEAF_SIGNATURE`. Independent PowerShell POST returned certificate-chain `PartialChain`. In-app Hub navigation returned `ERR_CERT_AUTHORITY_INVALID`; a subsequent Hub attempt timed out.
- Measured Root Cause: Diagnostic probe revealed institutional firewall SSL deep-packet inspection (DPI). The returned certificate issuer was:
  `Issuer: E=support@fortinet.com, CN=FG4H0ETB20904227, OU=Certificate Authority, O=Fortinet, L=Sunnyvale, S=California, C=US`.
  When on college/campus Wi-Fi, the FortiGate firewall intercepts HTTPS connections and re-signs them with an untrusted internal certificate. Standard browser fetch and Node TLS strict validation rightly block this as untrusted. This is not an Arkiv RPC server issue.
- Remedy tested: Switching network to a mobile hotspot or direct non-intercepted connection immediately restores clean TLS verification with the authentic certificate without bypassing security.
- Success evidence: 2026-10-14T17:49:11.366Z, chain 7738577, block 575198, scoped demo query returned 0; later 2026-10-15 block 596064 returned 12 entities. Empty/valid results are authentic.
- Outcome: SDK connectivity recovered; hub/wallet UI not fully verified. Keep explicit RPC failure UI, avoid mock fallback, never bypass TLS with rejectUnauthorized=false.

## F-002 — Typed query and pinned cursor path succeeded

- Expected: exact str predicates for demo namespace, canonical metadata projections and stable next-page snapshot.
- Repro: `npm run test:live -- --public-sample` (deliberately bounded public metadata-only sample); see `scripts/live-read.ts`.
- Actual: demo namespace empty; `$expiresAt >= u64(575291)` at block 575291, limit 1 returned a key and authoritative creator/owner. hasNextPage true; `page = await page.next()` returned a distinct key at the same snapshot.
- Evidence: first `0x8698a23494ad282fcf80edd546ad0670d1f6a67d2a12248b394077aeffc28e6e`, second `0xbaa578cf5212bed7cff354883fe3d18f91c2c13f42b24f47c66593b173b37863`; metadata/expiry in schema.md. These are not project entities. No third-party payload was read.
- Outcome: successful SDK public read + cursor path. No invented defect or global count inference.

## F-003 — Proposed sorting and indexed naming needed correction before implementation

- Expected in initial spec: arbitrary attribute sorting and camelCase schemaVersion/publicId.
- Investigation: inspected installed `src/query/queryBuilder.ts`, `queryResult.ts`, `selection.ts`, `engine.ts`, `types/entity.ts`, `attr/types.ts`, wallet createEntity/executeBatch and official focused skills at `b18c19a80c95a8a077f594f5977889244f225fdb`.
- Actual source: no ORDER BY builder. SDK cursor is immutable and carries the original query/block/projection. Creator/owner are selected canonical fields. Official guidance warns that Tiramisu's accepted attribute charset is stricter than SDK validation.
- Remedy: page-only sorting labeled in UI; exact type selectors; lowercase schema_version/public_id for future writes. No live uppercase write attempted, so the charset warning is guidance, not our own observed rejection.
- Suggested improvement: make node-supported sorting and name restrictions prominent in the current API reference.
- Outcome: proposal corrected; native arbitrary sorting is not claimed.

## F-004 — AI tools discovery differed by source

- Hub web extraction advertised MCP as coming soon. Official current skills describe a Devfolio MCP profile. No Arkiv MCP tools are connected in this host; we did not invent or configure a connection.
- Direct raw GitHub retrieval failed/time-out; `git clone --depth 1 https://github.com/Arkiv-Network/skills.git .arkiv-guidance` succeeded. Read router, first-write, query, app-integration, MCP, write-safety and troubleshooting guidance. Ignored clone is reference-only.
- npm registry successfully supplied SDK 0.8.1. SDK/source verification and direct network tests are the integration authority.
- Suggested improvement: keep Hub availability text aligned with released profile documentation.

## F-005 — Direct MCP connection works; live entity scope is metadata only

- Expected: use the official MCP endpoint for real on-chain observations, determine whether it can supply dashboard rows, and keep npm packages/plugin unchanged.
- Repro: Node 24 `scripts/mcp-evidence.mjs` initializes `https://mcp.arkiv.network/devfolio`, sends notifications/initialized, paginates tools/list, then calls server_status/network_status/verify_entity using their discovered schemas.
- Actual: negotiated 2025-06-18; server arkiv-devfolio 1.1.24, config 2026-10-14.1, content 27b032f009c234b8. Network status confirmed fresh live chain ID 7738577. At 2026-10-15T09:36:58.336Z, verify_entity observed project metric `0xeaa7287a23de6198732a0004313073f795549cdc176834c725570c9c8a0f5bed` at query-page block 603626, created block 595453, expiry 1891453, readonly true and permissionlessExtension false. No warnings/error.
- Capability limit: actual tools expose a bounded key-based metadata observation, not arbitrary indexed queries or attribute/payload reads. The service explicitly excludes creator/owner too. This is a capability boundary, not a fabricated failure.
- Remedy: keep direct Tiramisu chart queries; add a clearly separate MCP metadata panel using a fixed read-only route. Both refresh at 30 seconds, pause while hidden, cancel on unmount and back off on error. MCP failure never substitutes data or prevents direct reads. Requests are bounded and duplicate checks briefly cached.
- No package/plugin installation, host configuration changes, feedback submission, wallet access or chain writes performed. `publicEvidenceReviewed` refers to an already published project synthetic entity key.

## F-006 — Zero user filters require a match-all equivalent in SDK 0.8.1

- Expected: remove every user condition and browse public entities across publishers, in bounded pages.
- Source inspected: installed `src/query/queryBuilder.ts` `toString()` throws InvalidPredicateError when its predicate list is empty; its message says the query language has no match-every-entity spelling. Passing an empty array to `where()` does not bypass this.
- Remedy: application QuerySpec accepts 0–12 conditions. Zero user conditions compile to `$expiresAt >= u64(0)`, a comparison on nonnegative unsigned canonical expiry that covers all currently queryable entities. No app, creator or dataset constraint is added. Both UI and schema distinguish user filters from this SDK implementation detail.
- Actual live verification: 2026-10-15T10:01:19.819Z, block 604353, public first page 25 records, hasNext true; second page 25 records at the same snapshot with a distinct key. First key `0x03840b9201a03d29d42f5dcf59c8b33dc81f7c1fb6858d51ad5b98fbff91e549`; next page first key `0xf7bb61708efa4f0f619d4716e17ceeacafb2a93d6b7fbf981ea92d697d93f64b`. Payloads were not fetched. No global count or full-database download is claimed.
- Product change: synthetic seeder UI/generator/write path removed by user request. Public Database is now the landing view; any pre-existing synthetic chain entities remain public records. Arbitrary public testnet content cannot be certified as factual by the reader.

## Local tooling findings (not Arkiv defects)

- 16 October visualization report: Query studio still initialized a category/value sum chart, inherited from the retired demo. Actual public records observed in the app use publisher-specific fields (including baseload project/random fields), so those defaults can exclude every row. Changed new-draft defaults to count by canonical creator; missing numeric measures now show an explanation and cannot be added as a blank widget. Kept the chart renderer's DOM separate from React empty/KPI messages when switching chart types. Live browser verification showed34 and16 creator-group records (50 total) at snapshot636689 and one rendered chart canvas. This is an application default/rendering correction, not an SDK/RPC defect; no on-chain definition was rewritten.

- Sandboxed npm DNS requests failed; permitted network execution succeeded.
- Vitest sandbox temporary-file rename returned EPERM; running under bundled Node 24.19.0 outside sandbox passed the unit suite.
- Playwright browser download failed with ECONNRESET/ENOTFOUND; installed Microsoft Edge runs browser tests via PLAYWRIGHT_CHANNEL=msedge.
- Two simultaneous Next development instances corrupted generated build artifacts; stop both, rebuild, and run a single production preview before browser verification. No source data lost.
- Initial dependencies had 10 audit findings. Updated Vitest to 4.1.11, overrode PostCSS with 8.5.30, replaced Next lint plugin's unpatched braces dependency chain with standard TypeScript ESLint. Latest install audit: 0 vulnerabilities. Next emits a missing-Next-plugin warning; separate lint/typecheck remain required.
- Earlier remote font requests were replaced with locally served Fontsource assets. The later landing theme uses external Inter/Bubbledot fonts and a video with local/system fallbacks; external availability remains a release consideration.

## Historical local re-verification

### 15 October 2026 re-verification

Sandbox execution of the public read script failed at `eth_chainId` with `ENOTFOUND`. The same script outside sandbox network restrictions succeeded at 04:37:58 UTC, chain 7738577, block 594656; the namespace was empty, and two metadata-only cursor pages returned distinct keys. See schema.md for the observed keys. This is a local execution restriction, not evidence of an Arkiv outage. TLS validation remained enabled.

The sandbox temporary-file rename restriction also reproduced in Vitest; the same suite outside it passed. Wallet safety tests use mocked providers and never broadcast transactions. At that early session the user had no installed wallet; later user-wallet writes are recorded in schema.md and supersede that old blocker. The synthetic publisher has since been removed from the product.

## F-007 — Creation receipts recovered with exact-block event queries

- Expected: recover missing transaction hashes for two known dashboard entity keys without another wallet signature or full-chain scan.
- Repro: `npm run verify:dashboard -- --key <known-key>`; read entity metadata, request `EntityCreated` from SDK-exported `ENTITY_EVENTS_ABI` at exactly `entity.createdAt`, then read its transaction receipt. Engine address confirmed against installed SDK 0.8.1 `src/consts.ts`.
- Actual, 16 October: receipts `0x867fed3eac0a3b1f5ee2d44cca8818bca2d9e6935762f1cbd4f7aabed16d1a6d` (block 595532) and `0x6f3e7d3960913081c30096b91f8d8afe098e398bac5015164084ff0924d79f5b` (595488) both succeeded. Engine address, matching creation event/key, creator/sender, block hash, readonly flags and expiry were checked. Evidence: `dashboard-receipt-249da0.json`, `dashboard-receipt-8ca8fd.json`.
- Both saved queries still include `category = str('jose')` and returned zero at observations 635765 and 635783. Receipt success does not mean a useful dashboard result. The immutable definitions need a new, reviewed publication; the reader cannot silently repair them.
- Prepared replacement: `examples/public-dashboard.json` uses no filters and a count KPI/table. The initial preview returned 50 records at block635752 but kind/value attributes were absent from current baseload records. Fixed widget system-field resolution and switched the table to canonical creator/expiry metadata. Final preview: 50 records at636023; `prepared-dashboard-provenance-evidence.json` explicitly labels it unpublished. Portable import/export allows moving this reviewed definition into a wallet browser. No synthetic source rows are generated.
- Outcome: receipt evidence recovered through read-only calls; no new transaction or signing request. The current connected browser has no wallet session, so corrected publication still needs the user's wallet browser.

## F-008 — Guided canonical filters and an existing populated publication

- User reproduction: entering `$creator` in the address value box produced an invalid-address error; the field box still contained `field`. This is application guidance friction, not an SDK failure. Canonical fields now have readable choices with their types fixed; My records reads the connected address only, and Filter by publisher accepts a pasted address. Observed attribute types guide custom fields. Shortcuts preserve other conditions and require Run query.
- Actual creator-only query returned18 records at block638114, all with matching authoritative creator metadata (`publisher-read-evidence.json`). No payload was fetched for that check.
- Read-only discovery found an already-published, populated dashboard `0x5dba036694a998c9b9a6eda06d974bace7e30d5947d5090161427f029f83668f`. Exact-block receipt verification confirmed successful creation transaction `0x4d939029ea70c4b74018f790d59b0c279b2386dcd319bdd722f1e0e2bd3a298e`, readonly definition, expiry4525419, and18 query rows at638153. This supersedes the earlier assumption that a new publication was necessary; no new signature or write was made.
- A standalone SDK consumer, with the Next server stopped, independently returned18 rows at638179. Later actual public reader and cross-origin iframe returned18 rows at638310/638337 without wallet access or mocked routes. The iframe's displayed update advanced after polling. Evidence: `dashboard-receipt-5dba03.json`, `independent-read-evidence.json`, `live-reader-evidence.json`. These are local live observations, not public-hosting evidence or new-write propagation proof.

## F-009 — Anonymous public RPC rejected a browser read

- Actual user screenshot,16 October: Public Database `arkiv_query` to the public Tiramisu RPC returned HTTP429 with `ANON_COST_LIMITED`, SDK0.8.1/viem2.57.7. This is upstream anonymous rate limiting, unrelated to hosting authentication. The response does not establish the quota duration, IP scope or exact cause of exhaustion; multiple polling readers can add request load.
- Official [access-key guide](https://docs.arkiv.network/start-here/access-keys/) and [query guide](https://docs.arkiv.network/typescript-sdk/querying-data/) confirm strict anonymous endpoint limits and server-only key handling. No access key requested, exposed or installed, and no repeated live quota probes made.
- App remedy: Public Database shows a concise rate-limit explanation, pauses manual/automatic reads for120seconds initially (increasing to300seconds on repeated failures), respects cooldown on tab visibility changes, preserves prior rows as stale, and offers an auto-refresh pause control. Query studio can be opened without a successful public sample. Error state takes precedence over the loading heading during retries. This reduces avoidable traffic; it cannot guarantee an upstream quota reset. Other independent public/embed readers still have their existing polling/backoff policy.

## Still unverified

Public deployment and hosted independent embed, expiry extension, WebSockets, final video and submission. Existing creation receipts do not prove a fresh UI signature in the current app. Reuse the verified populated dashboard for the release; no duplicate publication or seed step is needed. The prepared no-filter example remains an unpublished configuration file.

Sources: [official query guide](https://docs.arkiv.network/typescript-sdk/querying-data/), [skills](https://github.com/Arkiv-Network/skills), [AI tools](https://hub.arkiv.network/ai-tools). Do not submit this report as feedback without the user's separate authorization.
