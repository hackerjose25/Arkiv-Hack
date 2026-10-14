# ArkivSight — Query-to-Dashboard Studio

> Turn Arkiv entities into live, shareable, embeddable dashboards—without writing query or frontend code.

**Status: DOCUMENTATION ONLY (14 October 2026).** No application, integration, tests, deployed URL, or on-chain transaction has yet been verified. Do not claim anything is implemented until independently tested. Read [AGENTS.md](AGENTS.md), [HISTORY.md](HISTORY.md), [HACKATHON.md](HACKATHON.md) before coding.

## 1. Problem and product

Developers typically use Arkiv's SDK to query, fetch, transform, and visualize on-chain entities. ArkivSight turns this into a five-step no-code workflow:
1. **Build queries:** select entity type / project namespace, typed attributes, operators, sorts, and pagination visually.
2. **Explore real results:** run queries against Tiramisu; inspect entities, attributes, payload previews, creator, owner, keys, and query details.
3. **Visualize automatically:** recommend safe table, KPI, bar, line, and pie views from returned data with explicit aggregations.
4. **Compose dashboards:** add/edit/reorder/resize widgets and configure poll-refresh, titles, and descriptions.
5. **Publish and embed:** persist non-secret dashboard definitions as Arkiv entities; offer public view URLs and isolated iframe widget embeds, re-querying Arkiv without a custom indexer.

**Tagline:** The missing read-side interface for Arkiv. **Audience:** Arkiv builders, hackathon teams, analysts and non-developers who want to explore public Arkiv datasets.

## 2. Goals and non-goals

### Required MVP
- A public judge-accessible URL with a readable demo dashboard even before wallet connection.
- Query builder with typed `eq`, numeric/date range (where supported), compound filters, sort, limits and cursor pagination; constrain queries to manageable cost and validate types.
- Real Tiramisu query using `@arkiv-network/sdk` 0.8.x; no fake blockchain success, no chart filled with fake data labeled live.
- Explicit `no results`, `schema mismatch`, `RPC failed`, `loading`, `stale data` UX.
- Schema discovery from a real query's attributes / JSON payload; display schema confidence and avoid treating arbitrary payload fields as indexed filters.
- Dataset view with tabular entity metadata and drill-down; creator (`$creator`) must come from Arkiv's canonical fields, not user-defined attributes.
- Charts: table, KPI count/sum/average, bar and line; pie if time allows. State aggregation scope (fetched page vs entire dataset); never label a page-only count as global.
- Save a dashboard definition on Tiramisu with creator-signed write; retrieve it from another device/browser without the app's private database.
- Share route `/d/[key]`, embed `/embed/[key]?widget=...`, usable iframe snippet; query data live on open and at polling intervals. Pause while hidden and rate-limit refresh. Read-only viewers need no wallet.
- Public open-source reference/example showing that another application can reuse an embed or configuration contract without asking permission.
- Documentation, MIT license, demo, test suite and reproducible friction report.

### Later only if MVP works
- Drag-and-drop resizing via react-grid-layout, chart themes, saved query presets, multiple dashboard versions, WebSocket `watchEntityEvents` if confirmed viable, live event badge, CSV export, typed schema contracts, permalink revision history.

### Explicit non-goals
- Arbitrary SQL, server-side joins, a universal custom indexer, guaranteed real-time streaming, unrestricted full-chain scans, authentication-only/private datasets, personal data collection, paid analytics services, on-chain secrets or exposing RPC access credentials.

## 3. Tech stack (free/open-source first)

| Concern | Default | Notes |
|---|---|---|
| App | Next.js App Router + React + TypeScript | Version locked in package manifest after scaffolding |
| Styling | Tailwind CSS, shadcn/ui (Radix), Lucide | Accessible, responsive, premium dark/light design |
| Visualization | Apache ECharts (`echarts-for-react` optional) | Tables, bar/line/pie/KPI |
| Grid | CSS grid initially; react-grid-layout later | Do not block MVP on drag-drop |
| Data validation | Zod | Strict versioned dashboard schemas and filters |
| Chain | Arkiv Tiramisu, chain ID `7738577` | Query via Arkiv public client SDK |
| Arkiv SDK | `@arkiv-network/sdk` 0.8.x, `viem` | Verify exact APIs against installed version/docs |
| Wallet writes | MetaMask / EIP-1193 + SDK wallet client | No shared private key in browser/server |
| Tests | Vitest + Testing Library; Playwright smoke | Mock-only tests explicitly labeled; separate live network tests |
| Deploy | Vercel Hobby or compatible free host | Check free-tier limitations; keep live through judging |

**Network:** `https://rpc.tiramisu.db-chain.testnet.arkiv.network`; WebSocket `wss://rpc.tiramisu.db-chain.testnet.arkiv.network`; explorer `https://tiramisu.explorer.arkiv.network`; faucet `https://hub.arkiv.network/`. RPC is a public service with usage policies and limits. Verify access-key requirements from live docs before implementation.

## 4. Architecture and boundaries

```
User -> Next.js UI (Query Builder / Explorer / Dashboard Studio)
                |                          |
                v                          v
     Typed query compiler             Dashboard config editor
                |                          |
                v                          v
       Arkiv public SDK read       Wallet-signed Arkiv entity write
                |                          |
                +----------> Tiramisu <----+
                                  |
                      Public share / embed page
                          loads config by key,
                         re-runs source queries
```

**No custom indexer** = the product queries Arkiv's built-in indexed attributes directly. Client-side/chart aggregations only cover the fetched dataset; explicitly label sampling/truncation and pages. Configurations contain safe query specifications and widget definitions, not live result caches by default. No central database required for core use.

## 5. Product flows and UX

**Main UI:** left navigation (Discover, Query Studio, Dashboards), persistent active network badge, dataset/attribute sidebar, visual query controls, center preview table/chart, right properties inspector; rich empty/loading/error states; keyboard focus and mobile layout. Dark professional theme with restrained teal/violet accents, crisp typography and legible dense data tables. Branding must not look like an Arkiv-operated official product.

**Demo story:** choose a seeded synthetic public dataset -> inspect typed fields -> filter (`project=arkivsight_demo`, `kind=metric`) -> visualize grouped categories and a time-series -> save dashboard to Tiramisu -> open public link in private browsing window -> paste iframe in independent demo page -> change dataset with wallet-authorized write -> verify refresh updates the chart. All outputs must be real results. Seed sample data can be **synthetic but actually written to Tiramisu**; label them as demo data.

**Trust cues:** transaction/record explorer links, canonical creator and owner, last successful refresh, errors, result count and aggregation limitations. No claim that creator is institutionally verified without a trusted allowlist.

## 6. Proposed data contracts (must adjust against verified SDK)

See [`arkiv/schema.md`](arkiv/schema.md) for full entities, indexed attributes, example predicates, expiry and validation rules.
- `arkivsight_dataset`: synthetic demo records (typed numeric metrics, category, time bucket; public payload).
- `arkivsight_dashboard`: layout, widget configs, named query DSL and refresh interval; versioned JSON payload, indexed `app`, `kind`, `schemaVersion`, `publicId`.
- Optional `arkivsight_dashboard_revision`: append-only snapshots when revising a shared dashboard; never silently overwrite an existing public revision without explaining it.
- `DashboardSpec` (frontend data model): `version`, `title`, `description`, `network`, `queries[]`, `widgets[]`, `layout[]`, `refreshSeconds`, `createdAt`; Zod-validate on both load and save, cap payload and widget count.

**Never store wallet private keys, account secrets, hashed personal data, raw untrusted HTML, sensitive personal data or privileged credentials on Arkiv.** Treat all public Arkiv payloads as untrusted and sanitize rendered content.

## 7. Suggested repository structure

```
arkivsight/
  app/(studio)/query/page.tsx
  app/(studio)/dashboards/page.tsx
  app/d/[key]/page.tsx
  app/embed/[key]/page.tsx
  components/query/  components/charts/  components/dashboard/
  lib/arkiv/  lib/query/  lib/charts/  lib/dashboard/
  tests/  e2e/
  arkiv/schema.md  arkiv/friction.md
  README.md  AGENTS.md  HISTORY.md  HACKATHON.md
  LICENSE  .env.example
```

Exact structure may change for technical reasons; document deviations in HISTORY.md.

## 8. Milestones and definition of done

| ID | Deliverable | Acceptance evidence |
|---|---|---|
| M0 | App scaffold + docs | `npm run build`, lint, local instructions, MIT license |
| M1 | Real Arkiv access | Direct query of real Tiramisu entities incl. inspectable keys, errors, wallet/tx when seeding |
| M2 | Visual query builder + explorer | Build filters without code; page results; correct typed mapping and empty states |
| M3 | Charts + stats | Chart from fetched data; appropriate aggregations / caveats; test fixtures |
| M4 | Builder + persistence | Wallet signs dashboard entity; open its key elsewhere; refresh survives reload |
| M5 | Share + embed | Independent no-auth browser, iframe on demo page; polling; safe query failure |
| M6 | Quality + submission | E2E smoke, live deployment, schema/friction, reproducibility, demo <=3 min |

**Hard gate:** no presentation-only mock may be shown as a working Arkiv integration. The app is not complete until actual Tiramisu query evidence, dashboard creation transaction and independent public read are demonstrated.

## 9. Development commands (planned, verify after scaffold)

```bash
npm install
npm run dev
npm run lint
npm run test
npm run build
```

No install scripts or tests exist at the time this file is written. Agents must add and validate them instead of asserting they work.

## 10. Sources and compliance

- Hackathon overview: https://arkiv.devfolio.co/overview
- Canonical rules: https://github.com/Arkiv-Network/global-tour-stop-pre-devcon
- Scoring rubric: https://github.com/Arkiv-Network/global-tour-stop-pre-devcon/blob/main/docs/scoring-rubric.md
- Submission checklist: https://github.com/Arkiv-Network/global-tour-stop-pre-devcon/blob/main/docs/submission-checklist.md
- Arkiv docs: https://docs.arkiv.network/

See HACKATHON.md for selection strategy and gates. The canonical rules take precedence in case of discrepancy.
