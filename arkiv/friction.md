# Arkiv developer friction — measured integration findings

Updated 14 October 2026, Codex. Windows; system Node 20.18.0/npm 11.13.0, bundled Node 24.19.0 used for Vitest. Supported project runtime Node >=22.13. SDK **0.8.1**, viem **2.57.7**. Tiramisu chain **7738577**, public HTTP RPC `https://rpc.tiramisu.db-chain.testnet.arkiv.network`. Baseline commit **6265194**; implementation currently uncommitted. No signing key, API key or project wallet used.

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

## Local tooling findings (not Arkiv defects)

- Sandboxed npm DNS requests failed; permitted network execution succeeded.
- Vitest sandbox temporary-file rename returned EPERM; running under bundled Node 24.19.0 outside sandbox passed the unit suite.
- Playwright browser download failed with ECONNRESET/ENOTFOUND; installed Microsoft Edge runs browser tests via PLAYWRIGHT_CHANNEL=msedge.
- Two simultaneous Next development instances corrupted generated build artifacts; stop both, rebuild, and run a single production preview before browser verification. No source data lost.
- Initial dependencies had 10 audit findings. Updated Vitest to 4.1.11, overrode PostCSS with 8.5.30, replaced Next lint plugin's unpatched braces dependency chain with standard TypeScript ESLint. Latest install audit: 0 vulnerabilities. Next emits a missing-Next-plugin warning; separate lint/typecheck remain required.
- Remote font requests replaced with locally served Fontsource assets.

## Not yet tested

### 15 October 2026 re-verification

Sandbox execution of the public read script failed at `eth_chainId` with `ENOTFOUND`. The same script outside sandbox network restrictions succeeded at 04:37:58 UTC, chain 7738577, block 594656; the namespace was empty, and two metadata-only cursor pages returned distinct keys. See schema.md for the observed keys. This is a local execution restriction, not evidence of an Arkiv outage. TLS validation remained enabled.

The sandbox temporary-file rename restriction also reproduced in Vitest; the same suite outside it passed. Wallet safety tests use mocked providers and never broadcast transactions. Live seed and dashboard writes remain pending because the user has no wallet installed.

Wallet transaction, funded-gas workflow, synthetic seed read-back, dashboard save/read-back, live independent public/embed load, expiry extension, WebSockets, deployment/faucet sign-in and submission. User confirmed **no wallet installed**. No transactions were broadcast. Required next action: user installs an EOA wallet, obtains test GLM, and signs the reviewed seed through the app; capture the real receipt and keys before marking write milestones complete.

Sources: [official query guide](https://docs.arkiv.network/typescript-sdk/querying-data/), [skills](https://github.com/Arkiv-Network/skills), [AI tools](https://hub.arkiv.network/ai-tools). Do not submit this report as feedback without the user's separate authorization.
