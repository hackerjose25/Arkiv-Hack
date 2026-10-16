# ArkivSight — Query-to-Dashboard Studio

Turn public Arkiv entities into queries, visualizations and wallet-owned dashboards.

**16 October 2026: live public database browser, no-code queries, charts, portable dashboard JSON and wallet-signed definitions; public deployment pending.** This is an independent MIT tool, not an official Arkiv product. See [HISTORY.md](HISTORY.md) for verified milestones and [HACKATHON.md](HACKATHON.md) for submission gates.

## Run locally

Use **Node 22.13+ (24 LTS recommended)** and npm. No environment secrets are required.

```sh
npm ci
npm run dev
```

Open http://127.0.0.1:3000 for the single-viewport video landing page, then **Get Started** to enter the existing app at http://127.0.0.1:3000/studio. Run only one Next process per checkout; stop development before building. The landing and app share a monochrome theme. Inter and Bubbledot load from the requested external font CDNs with system/local fallbacks; the supplied CloudFront video has a local static poster if unavailable. Background motion can be paused and honors reduced-motion preferences.

```sh
npm run lint
npm run typecheck
npm test
npm run build
npm run start
npm run test:live
npm run test:live -- --public-sample
```

The default live check reads one bounded page across public publishers. The optional public sample also reads two metadata-only cursor pages. No data is generated or published by either command.

## What is implemented

- No-code AND filters with exact SDK types: str, i32, u64, u256, dec, bool, addr, key; equality, numeric comparisons, and string prefixes.
- Guided field choices show **Created by**, **Owned by**, **Entity key** and **Expiry block** with fixed canonical types. Indexed fields discovered on the current page infer their type when unambiguous; custom fields remain available. Operators are limited to those supported for the selected type. **My records** requests only a wallet address, with no signature or network switch; **Filter by publisher** accepts a pasted address without connecting a wallet. Shortcuts preserve other conditions and apply when you select Run query. Changing wallet accounts does not silently rewrite an existing query.
- **Public Database** sidebar section and default workspace view: automatically reads live public entities across publishers, displays indexed attributes and canonical creator/owner, inspects records on demand, and walks cursor pages. Open its query in the studio to build charts.
- Zero user filters are supported. Remove the last condition or click **Clear all filters**. SDK 0.8.1 requires an indexed predicate, so the match-all equivalent is `$expiresAt >= u64(0)`, including every currently queryable entity without an app/dataset/creator restriction.
- Direct browser-to-Tiramisu reads; 10–100 rows per page, snapshot-pinned cursor pagination, canonical creator/owner, bounded payload inspection, and observed attribute schema.
- Table, bar, line and KPI views; count, sum and average; page-only sorting and aggregation. Widgets can use canonical `$creator`, `$owner`, `$key` and `$expiresAt` as well as indexed attributes. System fields always resolve from authoritative metadata. Large integers beyond safe JS chart precision are excluded. Decimal charts use approximate JavaScript arithmetic.
- Query studio starts with **Records by creator**, a count chart that works without publisher-specific numeric fields. For sum or average, choose a numeric measure suggested from the current page. Missing/non-numeric measures show an explanation and cannot be added as an empty chart. Chart, table and KPI switches keep renderer-owned elements separate from empty-state messages.
- Dashboard composition: one shared query, up to eight ordered widgets, titles, description, and 30-second polling. Readers use 30 seconds even for older definitions; the v1 parser retains compatibility with saved refreshSeconds values from 30–3600. This v1 deliberately uses a CSS grid and one query instead of the originally proposed multi-query/freeform layout.
- Versioned Zod-validated definitions; browser-wallet publication, readonly creation, receipt journal and strict read-back. A populated creator-filtered dashboard and its creation receipt are verified in [schema.md](arkiv/schema.md); two older empty definitions remain labeled historical evidence.
- Import/export dashboard definitions in Dashboard builder. These files hold Arkiv query and widget settings; this control does not import local datasets, packet captures or model-analysis reports. Imports enforce the same strict schema and 32 KiB limit as public readers before replacing the draft; invalid files show a concise explanation and preserve the draft. Export moves a reviewed definition between browsers without publishing it. Importing uses this app's 30-second refresh policy.
- `/d/[key]` and `/embed/[key]?widget=overview` public readers. They require no wallet, pause polling while hidden, cancel on unmount, and back off after failure. Offline browser fixtures are not on-chain proof.
- [Independent iframe consumer](examples/independent-consumer/index.html), served on another origin using any static file server.
- [Independent SDK reader](examples/independent-reader/README.md): `npm run read:dashboard -- --key <published-key>` works with the Next server stopped. It reuses the MIT validator/compiler/transforms and reads the definition and first query page directly from Tiramisu, with no wallet or app HTTP API.
- `/evidence` presents dated receipt/query observations, source/contract links, explicit release gaps and a downloadable unpublished public-records definition. These are recorded observations, not live status. Public and embed readers expose their actual query snapshot, definition expiry, canonical creator/owner and compiled query under **Query & provenance**.
- Query studio refreshes the first result page every 30 seconds after Run query. It pauses when hidden, while filters are changed, and on later cursor pages so pagination retains its snapshot. Uncheck the refresh control to pause it manually. Failures retain stale results and back off.
- Live MCP metadata panel: the official Devfolio endpoint observes one public entity key, showing query-page block, observation time and expiry. Its bounded server route is separate from chart reads; an MCP outage does not replace or prevent direct Arkiv data queries.

No backend database, private indexer, API keys or shared signing account. Payloads render as text; no arbitrary scripts or HTML are executed. A namespace is not proof of identity: use the `$creator` filter when choosing a trusted publisher. Creator identifies the original creator, not institutional verification.

The anonymous public RPC has strict limits. HTTP429 / `ANON_COST_LIMITED` means Arkiv is limiting reads; Vercel sign-in does not change that quota. Public Database pauses reads for at least two minutes after this response, backs off further on repeated failures, retains any previous results as stale, and offers an auto-refresh pause control. Visibility changes respect the cooldown. Close unused live readers to reduce requests; a cooldown does not guarantee the upstream quota has reset. The [official access-key guide](https://docs.arkiv.network/start-here/access-keys/) describes higher limits; keys must stay out of browser code. No key or authenticated proxy is configured in this build.

## Explore public data and publish a dashboard

1. Open the app. **Public Database** automatically loads the latest 50 live public records; use Next public page for more. Reads require no wallet. Totals describe the current page, not the entire database.
2. Inspect a record and its indexed attribute types. Click **Open in query studio** to query across all publishers. Use **My records**, or **Filter by publisher** and paste a wallet address. Choose **Created by** for original authorship or **Currently owned by** for current ownership. For other filters, Add condition and choose a field; canonical metadata types are selected automatically. Remove individual conditions or use **Clear all filters** to return to all public entities.
3. Run the query. In Visualize, choose grouping/measure fields that actually exist in the result page, or use a count KPI. Missing or unsafe numeric values are excluded; arbitrary public records do not share one schema.
4. Add widgets and name the dashboard. To publish its definition only, connect an EIP-1193 wallet, select Tiramisu (7738577), obtain test GLM from the [faucet](https://hub.arkiv.network/faucet), review the public definition and approve the transaction. No dataset-publishing or synthetic-seeding flow exists.
5. Record the confirmed transaction and dashboard entity key. Open `/d/<key>` without a wallet and test its iframe on a separate origin. Readers query Arkiv directly and poll every 30 seconds.

Every displayed record is fetched from Tiramisu; no local fixtures are substituted. Public testnet content can itself be demonstration or synthetic content supplied by publishers. Previously created project demo entities remain on chain and may appear in an unfiltered public query; removing the publishing feature does not delete them or certify other publishers' factual claims.

Do not automatically retry an uncertain write. **Publication recovery** displays the saved intent/hash/keys. The journal blocks another write for that account until the original outcome is reconciled. Recovery is currently manual: inspect the original transaction and compare entities with the saved parameters before clearing a journal. Keep the journal; clearing it without reconciliation can duplicate writes. Web Locks serialize this app's tabs, not other apps using the same wallet.

## Verification boundaries

Live SDK reads observed the 12 historical project metrics and multiple dashboard definitions from `0x9cC4bc554C544856E9DE2D244F05c0d6E8Be099A`. The populated dashboard `0x5dba036694a998c9b9a6eda06d974bace7e30d5947d5090161427f029f83668f` returned18 records at snapshot638153; its successful creation transaction is `0x4d939029ea70c4b74018f790d59b0c279b2386dcd319bdd722f1e0e2bd3a298e`. The independent reader reproduced18 at638179 without the web app. Keys/receipts are in schema.md. Historical metric values remain synthetic despite their actual on-chain storage. Public deployment and deployed independent embed verification remain pending.

Browser tests use explicitly labeled offline RPC fixtures for populated charts and sharing. For the suite:

```sh
npx playwright install chromium
npm run test:e2e
```

On Windows, installed Edge can be used with `$env:PLAYWRIGHT_CHANNEL='msedge'`. If an existing server is already running, set `$env:E2E_EXISTING_SERVER='1'`; otherwise Playwright starts development. Do not run build and browser development simultaneously.

The original college Wi-Fi connection failed certificate validation. Live access later succeeded without disabling TLS. Switch to a trusted working network if this recurs; never set `NODE_TLS_REJECT_UNAUTHORIZED=0`.

## Architecture and reuse

- `lib/query.ts`: validated query DSL mapped to installed SDK constructors and operators.
- `lib/arkiv.ts`: public client and page snapshots; no payload fetching in table queries.
- `lib/charts.ts`: page-scoped transforms, independent of React.
- `lib/dashboard.ts`: strict JSON contract and safe iframe builder.
- `lib/wallet.ts`: injected-wallet checks, serialized dashboard-definition writes, journal and read-back.
- `lib/mcp.ts`, `app/api/mcp/entity/route.ts`: fixed-endpoint, read-only public metadata verification with strict network validation, response-size limits and a bounded 25-second in-memory cache. This route accepts entity keys, not arbitrary MCP tools, URLs or queries.
- `components/`: public database browser, query studio, chart renderer, MCP observation panel and independent public reader.
- `tests/`, `e2e/`: offline logic and browser regressions; `scripts/live-read.ts`: separate live proof.

The checked-in lockfile pins SDK **0.8.1**, viem **2.57.7**, Next **15.5.27**, React **19.3.1**, ECharts **6.1.0**, and Zod **4.6.7**. Styling uses local CSS, CDN Inter/Bubbledot fonts and locally hosted fallback fonts. The PostCSS 8.5.30 override fixes advisories in Next's transitive version. Standard TypeScript ESLint rules avoid the unpatched braces dependency in Next's lint plugin; Next emits an informational missing-plugin warning during build. All source is new on top of documentation baseline `6265194`; third-party libraries and fonts are reused with their respective licenses.

Official Arkiv skills were read at `Arkiv-Network/skills` commit `b18c19a80c95a8a077f594f5977889244f225fdb`. On 15 October, an explicitly authorized direct MCP session at `https://mcp.arkiv.network/devfolio` negotiated protocol 2025-06-18 and verified live metadata with server 1.1.24. No Codex plugin or host connector was installed; npm dependencies and lockfile were unchanged. The guidance clone is ignored local reference material.

MCP is an additional observation surface, not a dataset API: its reviewed `verify_entity` excludes attributes, payload, creator and owner. Query results and charts continue to read directly from Tiramisu. Reproduce discovery with `node scripts/mcp-evidence.mjs`; use `node scripts/mcp-evidence.mjs network_status` for the live chain-ID check, or `node scripts/mcp-evidence.mjs verify_entity path/to/public-key.json` with `{ "entityKey": "0x…64 hex digits…", "publicEvidenceReviewed": true }`. Review identifiers as public before sharing them. No feedback, signing or write tool is exposed by this client.

## Remaining roadmap

Use the verified populated publisher dashboard for final live share/embed and approved public deployment, then record the <=3-minute video and submission evidence. No additional publication or seed step is required to reuse that existing definition. Verified check results are recorded in HISTORY. Resizing and multiple queries remain optional extensions to the documented v1 contract.

For a portable starting point, import [examples/public-dashboard.json](examples/public-dashboard.json) in Dashboard builder. It uses no filters, a 50-record page, a count KPI and a table of canonical creator/expiry metadata; its final preview returned 50 actual records at block 636023 on 16 October. It is an **unpublished definition**, not an on-chain dashboard. Review it before approving any wallet transaction.

Read-only evidence commands:

```sh
npm run verify:dashboard -- --definition examples/public-dashboard.json
npm run verify:dashboard -- --key <actual-dashboard-entity-key> --out arkiv/new-dashboard-evidence.json
```

The verifier checks the network, definition, query, canonical metadata and creation receipt for a published key. It reads only the entity's creation block, validates the engine event and sender, and never signs or broadcasts. Output files must be new paths to preserve prior observations. Evidence omits payload text and table rows. This does not prove hosted browser or iframe behavior.

Use [the release checklist](RELEASE.md) for public-data reproduction, wallet publication and deployment preparation. [The submission draft](SUBMISSION.md) explicitly marks missing public evidence; [the timed demo script](DEMO.md) is ready for recording after live verification. GitHub Actions runs lint, types, unit tests, production build and offline browser checks when the workflow is pushed.

Sources: [Arkiv docs](https://docs.arkiv.network/), [AI tools](https://hub.arkiv.network/ai-tools), [schema](arkiv/schema.md), [measured friction](arkiv/friction.md), [official event](https://github.com/Arkiv-Network/global-tour-stop-pre-devcon).
