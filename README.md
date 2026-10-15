# ArkivSight — Query-to-Dashboard Studio

Turn public Arkiv entities into queries, visualizations and wallet-owned dashboards.

**15 October 2026: live public database browser, no-code queries, charts and wallet-signed dashboard definitions; public deployment pending.** This is an independent MIT tool, not an official Arkiv product. See [HISTORY.md](HISTORY.md) for verified milestones and [HACKATHON.md](HACKATHON.md) for submission gates.

## Run locally

Use **Node 22.13+ (24 LTS recommended)** and npm. No environment secrets are required.

```sh
npm ci
npm run dev
```

Open http://127.0.0.1:3000. Run only one Next process per checkout; stop development before building. Fonts are served locally.

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
- **Public Database** sidebar section and default landing view: automatically reads live public entities across publishers, displays indexed attributes and canonical creator/owner, inspects records on demand, and walks cursor pages. Open its query in the studio to build charts.
- Zero user filters are supported. Remove the last condition or click **Clear all filters**. SDK 0.8.1 requires an indexed predicate, so the match-all equivalent is `$expiresAt >= u64(0)`, including every currently queryable entity without an app/dataset/creator restriction.
- Direct browser-to-Tiramisu reads; 10–100 rows per page, snapshot-pinned cursor pagination, canonical creator/owner, bounded payload inspection, and observed attribute schema.
- Table, bar, line and KPI views; count, sum and average; page-only sorting and aggregation. Large integers beyond safe JS chart precision are excluded. Decimal charts use approximate JavaScript arithmetic.
- Dashboard composition: one shared query, up to eight ordered widgets, titles, description, and 30-second polling. Readers use 30 seconds even for older definitions; the v1 parser retains compatibility with saved refreshSeconds values from 30–3600. This v1 deliberately uses a CSS grid and one query instead of the originally proposed multi-query/freeform layout.
- Versioned Zod-validated definitions; browser-wallet publication, readonly creation, receipt journal and strict read-back. **Real wallet execution remains untested.**
- `/d/[key]` and `/embed/[key]?widget=overview` public readers. They require no wallet, pause polling while hidden, cancel on unmount, and back off after failure. Offline browser fixtures are not on-chain proof.
- [Independent iframe consumer](examples/independent-consumer/index.html), served on another origin using any static file server.
- Query studio refreshes the first result page every 30 seconds after Run query. It pauses when hidden, while filters are changed, and on later cursor pages so pagination retains its snapshot. Uncheck the refresh control to pause it manually. Failures retain stale results and back off.
- Live MCP metadata panel: the official Devfolio endpoint observes one public entity key, showing query-page block, observation time and expiry. Its bounded server route is separate from chart reads; an MCP outage does not replace or prevent direct Arkiv data queries.

No backend database, private indexer, API keys or shared signing account. Payloads render as text; no arbitrary scripts or HTML are executed. A namespace is not proof of identity: use the `$creator` filter when choosing a trusted publisher. Creator identifies the original creator, not institutional verification.

## Explore public data and publish a dashboard

1. Open the app. **Public Database** automatically loads the latest 50 live public records; use Next public page for more. Reads require no wallet. Totals describe the current page, not the entire database.
2. Inspect a record and its indexed attribute types. Click **Open in query studio** to query across all publishers. Optionally add filters for an app, category or authoritative `$creator`. Remove individual conditions or use **Clear all filters** to return to all public entities.
3. Run the query. In Visualize, choose grouping/measure fields that actually exist in the result page, or use a count KPI. Missing or unsafe numeric values are excluded; arbitrary public records do not share one schema.
4. Add widgets and name the dashboard. To publish its definition only, connect an EIP-1193 wallet, select Tiramisu (7738577), obtain test GLM from the [faucet](https://hub.arkiv.network/faucet), review the public definition and approve the transaction. No dataset-publishing or synthetic-seeding flow exists.
5. Record the confirmed transaction and dashboard entity key. Open `/d/<key>` without a wallet and test its iframe on a separate origin. Readers query Arkiv directly and poll every 30 seconds.

Every displayed record is fetched from Tiramisu; no local fixtures are substituted. Public testnet content can itself be demonstration or synthetic content supplied by publishers. Previously created project demo entities remain on chain and may appear in an unfiltered public query; removing the publishing feature does not delete them or certify other publishers' factual claims.

Do not automatically retry an uncertain write. **Publication recovery** displays the saved intent/hash/keys. The journal blocks another write for that account until the original outcome is reconciled. Recovery is currently manual: inspect the original transaction and compare entities with the saved parameters before clearing a journal. Keep the journal; clearing it without reconciliation can duplicate writes. Web Locks serialize this app's tabs, not other apps using the same wallet.

## Verification boundaries

Live SDK reads subsequently observed all 12 project metrics and two dashboard definitions from `0x9cC4bc554C544856E9DE2D244F05c0d6E8Be099A`; keys are in schema.md. MCP `verify_entity` independently observed a project metric at block 603626 on 15 October. These are synthetic values actually stored on Tiramisu. Transaction receipt capture, corrected public dashboard filters, public deployment and live independent embed remain pending.

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

The checked-in lockfile pins SDK **0.8.1**, viem **2.57.7**, Next **15.5.27**, React **19.3.1**, ECharts **6.1.0**, and Zod **4.6.7**. Styling uses local CSS and locally hosted Fontsource fonts. The PostCSS 8.5.30 override fixes advisories in Next's transitive version. Standard TypeScript ESLint rules avoid the unpatched braces dependency in Next's lint plugin; Next emits an informational missing-plugin warning during build. All source is new on top of documentation baseline `6265194`; third-party libraries and fonts are reused with their respective licenses.

Official Arkiv skills were read at `Arkiv-Network/skills` commit `b18c19a80c95a8a077f594f5977889244f225fdb`. On 15 October, an explicitly authorized direct MCP session at `https://mcp.arkiv.network/devfolio` negotiated protocol 2025-06-18 and verified live metadata with server 1.1.24. No Codex plugin or host connector was installed; npm dependencies and lockfile were unchanged. The guidance clone is ignored local reference material.

MCP is an additional observation surface, not a dataset API: its reviewed `verify_entity` excludes attributes, payload, creator and owner. Query results and charts continue to read directly from Tiramisu. Reproduce discovery with `node scripts/mcp-evidence.mjs`; use `node scripts/mcp-evidence.mjs network_status` for the live chain-ID check, or `node scripts/mcp-evidence.mjs verify_entity path/to/public-key.json` with `{ "entityKey": "0x…64 hex digits…", "publicEvidenceReviewed": true }`. Review identifiers as public before sharing them. No feedback, signing or write tool is exposed by this client.

## Remaining roadmap

Publish a dashboard against selected existing public records, capture its transaction receipt, independently verify live share/embed, deploy with the user's approval, and record the <=3-minute video and submission evidence. No seed step is needed. Verified check results are recorded in HISTORY. Resizing and multiple queries remain optional extensions to the documented v1 contract.

Use [the release checklist](RELEASE.md) for public-data reproduction, wallet publication and deployment preparation. [The submission draft](SUBMISSION.md) explicitly marks missing public evidence; [the timed demo script](DEMO.md) is ready for recording after live verification. GitHub Actions runs lint, types, unit tests, production build and offline browser checks when the workflow is pushed.

Sources: [Arkiv docs](https://docs.arkiv.network/), [AI tools](https://hub.arkiv.network/ai-tools), [schema](arkiv/schema.md), [measured friction](arkiv/friction.md), [official event](https://github.com/Arkiv-Network/global-tour-stop-pre-devcon).
