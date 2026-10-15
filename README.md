# ArkivSight — Query-to-Dashboard Studio

Turn public Arkiv entities into queries, visualizations and wallet-owned dashboards.

**14 October 2026: working local implementation; live reads verified; signed writes and public deployment pending.** This is an independent MIT tool, not an official Arkiv product. See [HISTORY.md](HISTORY.md) for verified milestones and [HACKATHON.md](HACKATHON.md) for submission gates.

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

The optional public sample reads two pages of canonical entity metadata only. It does not seed anything. The initial demo query can legitimately return zero records until a user seeds the dataset.

## What is implemented

- No-code AND filters with exact SDK types: str, i32, u64, u256, dec, bool, addr, key; equality, numeric comparisons, and string prefixes.
- Direct browser-to-Tiramisu reads; 10–100 rows per page, snapshot-pinned cursor pagination, canonical creator/owner, bounded payload inspection, and observed attribute schema.
- Table, bar, line and KPI views; count, sum and average; page-only sorting and aggregation. Large integers beyond safe JS chart precision are excluded. Decimal charts use approximate JavaScript arithmetic.
- Dashboard composition: one shared query, up to eight ordered widgets, titles, description, and 30–3600-second polling. This v1 deliberately uses a CSS grid and one query instead of the originally proposed multi-query/freeform layout.
- Versioned Zod-validated definitions; browser-wallet publication, readonly creation, receipt journal and strict read-back. **Real wallet execution remains untested.**
- `/d/[key]` and `/embed/[key]?widget=overview` public readers. They require no wallet, pause polling while hidden, cancel on unmount, and back off after failure. Offline browser fixtures are not on-chain proof.
- [Independent iframe consumer](examples/independent-consumer/index.html), served on another origin using any static file server.

No backend database, private indexer, API keys or shared signing account. Payloads render as text; no arbitrary scripts or HTML are executed. A namespace is not proof of identity: use the `$creator` filter when choosing a trusted publisher. Creator identifies the original creator, not institutional verification.

## First real demo

1. Open the app in a browser with an EIP-1193 EOA wallet such as MetaMask. Install from the wallet's official site; never share its recovery phrase or private key.
2. Connect to Tiramisu, chain `7738577`. Obtain test GLM through the [Arkiv Hub faucet](https://hub.arkiv.network/faucet).
3. Expand **Need a dataset? Publish synthetic demo metrics**. Review the 12 synthetic records / 30-day lifetime description, check consent, and approve the transaction fee in your wallet. The app checks for existing records from your wallet before seeding.
4. Record the actual transaction and 12 entity keys shown only after read-back. Run the default `app=arkivsight AND kind=demo_metric` query. Add `$creator`, type `addr`, equal to your address to isolate your records.
5. Select Visualize, group by `category`, measure `value`, aggregation `sum`. Add to dashboard, name it, and publish. Publishing creates a readonly snapshot with an approximately 90-day lifetime.
6. Record the displayed transaction, entity key and actual expiry block. Open the public link in a separate browser with no wallet. Load its iframe from the independent example. Verify refresh after a separate user-approved data write.

Do not automatically retry an uncertain write. **Publication recovery** displays the saved intent/hash/keys. The journal blocks another write for that account until the original outcome is reconciled. Recovery is currently manual: inspect the original transaction and compare entities with the saved parameters before clearing a journal. Keep the journal; clearing it without reconciliation can duplicate writes. Web Locks serialize this app's tabs, not other apps using the same wallet.

## Verification boundaries

Live SDK 0.8.1 reads succeeded on 14 October at block 575291, including two distinct keys and canonical creator/owner. The ArkivSight demo namespace was empty. **No project wallet, seed transaction, dashboard transaction, deployed URL or live independent embed is yet verified.** Full M1/M4/M5 completion and hackathon readiness depend on those steps.

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
- `lib/wallet.ts`: injected-wallet checks, synthetic seed, serialized writes, journal and read-back.
- `components/`: studio, chart renderer, seed UI, independent public reader.
- `tests/`, `e2e/`: offline logic and browser regressions; `scripts/live-read.ts`: separate live proof.

The checked-in lockfile pins SDK **0.8.1**, viem **2.57.7**, Next **15.5.27**, React **19.3.1**, ECharts **6.1.0**, and Zod **4.6.7**. Styling uses local CSS and locally hosted Fontsource fonts. The PostCSS 8.5.30 override fixes advisories in Next's transitive version. Standard TypeScript ESLint rules avoid the unpatched braces dependency in Next's lint plugin; Next emits an informational missing-plugin warning during build. All source is new on top of documentation baseline `6265194`; third-party libraries and fonts are reused with their respective licenses.

Official Arkiv skills were read at `Arkiv-Network/skills` commit `b18c19a80c95a8a077f594f5977889244f225fdb`. No Arkiv MCP connection is configured in this agent host; the SDK is sufficient for actual entity operations. The guidance clone is ignored local reference material, not a runtime dependency.

## Remaining roadmap

Install/fund the user's wallet; verify seed and dashboard writes; independently verify live share/embed; deploy with the user's approval; record public MIT repo/demo links, <=3-minute video and submission evidence. Widget editing, keyboard dialog handling and hostile-input regressions are implemented; verified check results are recorded in HISTORY. Resizing and multiple queries remain optional extensions to the documented v1 contract. Do not claim a deployed, complete or prize-ready application yet.

Use [the release checklist](RELEASE.md) for wallet setup, exact expected synthetic values and deployment preparation. [The submission draft](SUBMISSION.md) explicitly marks missing public evidence; [the timed demo script](DEMO.md) is ready for recording after live verification. GitHub Actions runs lint, types, unit tests, production build and offline browser checks when the workflow is pushed.

Sources: [Arkiv docs](https://docs.arkiv.network/), [AI tools](https://hub.arkiv.network/ai-tools), [schema](arkiv/schema.md), [measured friction](arkiv/friction.md), [official event](https://github.com/Arkiv-Network/global-tour-stop-pre-devcon).
