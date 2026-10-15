# HISTORY.md — ArkivSight progress and agent handoff ledger

**Last reviewed:** 2026-10-15 IST (Asia/Kolkata). **Current phase:** public database browser, optional filters, live reads/MCP metadata and 30-second polling verified locally; public release pending. **Owner:** Codex / user for wallet and release approval. **Source of truth:** verified file state + command results; entries below must never claim unobserved success.

## CURRENT STATE / HANDOFF SUMMARY
- Project: **ArkivSight — Query-to-Dashboard Studio** (replaces CivicProof AI entirely).
- Objective: no-code Arkiv query builder, explorer, automatic charts, configurable dashboard, public share/iframe embed, auto-refresh, Arkiv-backed config persistence.
- Primary target: Open Source. Additional tracks considered only when concrete evidence meets rubric.
- Implemented: Public Database landing/sidebar view across publishers, zero-filter query studio, cursor explorer, chart transforms, dashboard composition/editing, wallet publication journal and public/embed readers. Synthetic publishing UI/generator/write path removed by user request. Runtime records come only from Tiramisu; existing on-chain test content is not certified as factual.
- Verified public writer: `0x9cC4bc554C544856E9DE2D244F05c0d6E8Be099A`; 12 metrics and two dashboard entity keys observed on Tiramisu (schema.md). Transaction receipts still need capture.
- Verified checks: 28 unit tests, 12 production browser tests, lint, typecheck and production build pass. Unfiltered public reads returned two pages of 25 at block 604353. MCP server 1.1.24 previously observed a project entity; live app-route observations advanced from block 603938 to 603954. No public deployment verified.
- Active blockers: the two earlier saved dashboards filter category=jose and return zero; corrected definition publication, receipt capture, deployment approval/account and live recording/submission remain pending.
- **Next atomic task: choose existing public records in Public Database, optionally filter/group their real indexed fields, publish a dashboard definition with user wallet approval and capture its receipt/key; verify independent public/embed readers. Follow RELEASE.md. There is no dataset-publishing step.**

## Milestone board

| ID | Stage | Status | Evidence / remaining |
|---|---|---|---|
| M0 | Scaffold, environment, MIT license | VERIFIED | Build/lint/types pass; MIT source and pinned SDK 0.8.1 |
| M1 | Query real Tiramisu data + synthetic seed | VERIFIED | 12 live demo records on Tiramisu created by 0x9cC4bc554C544856E9DE2D244F05c0d6E8Be099A, verified at block 596064 |
| M2 | Query UI + dataset explorer | VERIFIED | Typed validation tests; browser filters/errors/schema/cursor tests pass; live SDK reads verified |
| M3 | Chart engine and scoped aggregation | VERIFIED | Unit/browser transforms pass; live dataset aggregation sums to 732 (Compute 206, Storage 274, Indexing 252) |
| M4 | Dashboard editor and Arkiv persistence | IN PROGRESS | Composition/editing verified; 2 dashboard entities written on-chain (keys 0x249da0... and 0x8ca8fd...); publication with default filters pending |
| M5 | Public dashboard, auto-refresh, iframe embed | IN PROGRESS | Wallet-free route and independent consumer ready; live public URL check pending |
| M6 | Hardening, deployment, evidence and submission | IN PROGRESS | Baseline committed at e733bb6d08b8c16d5b614d2d0013179aa897f14f; deployment, video recording and Devfolio submission pending |

Statuses: NOT STARTED / IN PROGRESS / BLOCKED / VERIFIED. **VERIFIED** requires specific evidence, not an agent's assertion.

## Decisions log

| Date | Decision | Rationale |
|---|---|---|
| 2026-10-14 | Switch from CivicProof to ArkivSight | More focused reusable read-side devtool and Open Source alignment |
| 2026-10-14 | No custom indexer | Query typed indexed Arkiv attributes using network SDK; client calculates display analytics |
| 2026-10-14 | Saved configs live on Arkiv | Demonstrate meaningful write + public read and portable sharing |
| 2026-10-14 | Use polling initially | Do not assume WebSocket event behavior; upgrade after testing |
| 2026-10-14 | Documentation-only truthful starting point | Cross-agent continuity without fabricated implementation |

## Session record (append chronologically)

### Session 000 — 2026-10-14 — specification authoring
**Agent:** ChatGPT (documentation preparation only).
**Changes:** README.md, AGENTS.md, HISTORY.md, HACKATHON.md, arkiv/schema.md, arkiv/friction.md written as planned specifications/templates.
**Verified:** reviewed event overview, canonical scoring rubric and checklist. No project code or network interaction executed.
**Tests:** none; there is no code yet.
**Next:** M0 project scaffold. Then direct Arkiv query and safe demo data publication.

### Session 001 — 2026-10-14 22:50 IST — Gemini (Antigravity)
**Starting commit / status:** b65d8f6bb0c59c1a4ff3683ff3b5ec125f585606 (remote `origin/main` had only `LICENSE`)
**Goal:** Initialize local git repo, track `origin/main`, add specifications, documentation, and `.gitignore`, push initial baseline to remote `https://github.com/hackerjose25/Arkiv-Hack.git`.
**Files changed:** `.gitignore`, `HISTORY.md`, `LICENSE` (pulled from remote `main`). Untracked files committed: `AGENTS.md`, `HACKATHON.md`, `README.md`, `arkiv/friction.md`, `arkiv/schema.md`.
**Actions and commands:**
- `git init; git remote add origin https://github.com/hackerjose25/Arkiv-Hack.git; git fetch origin`
- `git checkout -b main origin/main` (synced `LICENSE` from remote)
- Created `.gitignore`
- Staged all documentation, specs, and config files
- Pushed commit to `origin/main`
**Verification:** `git status` clean, `git push origin main` passed.
**Network proof:** none (repo setup only).
**Blockers / limitations:** None for repo baseline; Next.js scaffolding (M0) remains next task.
**Milestone status updates:** M0 in progress (repo connected, MIT license present, specs tracked).
**Next exact task:** M0 scaffold Next.js App Router project with TypeScript, Tailwind CSS, install `@arkiv-network/sdk` 0.8.x and `viem`, setup test runner.

### Session template (copy for each subsequent agent)
```markdown
### Session NNN — YYYY-MM-DD HH:mm TZ — <agent>
**Starting commit / status:** ...
**Goal:** ...
**Files changed:** ...
**Actions and commands:** ...
**Verification:** command, pass/fail, evidence URLs or hashes (non-secret)
**Network proof:** wallet, tx hash, entity key, explorer link or explicitly none
**Blockers / limitations:** ...
**Milestone status updates:** ...
**Next exact task:** ...
```

## Open questions to verify, not assume
1. Installed SDK version's exact create/query/metadata APIs, filter operators and supported sorts.
2. Whether direct browser RPC needs access keys or CORS allowances; choose safe fallback without making it the data authority.
3. Entity payload size / maximum useful dashboard config complexity and optimal expiration/extension flow.
4. `watchEntityEvents` event semantics for relevant query result sets versus manual polling.
5. How the public share page resolves an entity key reliably with public client.

### Session 002 start — 2026-10-14 22:59 IST — Codex
Starting commit: 6265194; clean working tree. Goal: M0 scaffold and verify M1 direct Tiramisu reads, then continue roadmap. Existing project contains documentation only. Blockers: no wallet connected or signed transactions; SDK not installed yet. Hub AI tools lists MCP as coming soon; browser access hit a certificate error (not bypassed).


### Session 002 progress — 2026-10-14 IST — Codex
Scaffold and production build passed on Next 15.5.27 / React 19.3.1 / Arkiv SDK 0.8.1 / viem 2.57.7. Query compiler, explorer, scoped chart transforms, strict dashboard payload, wallet publication journal, public/embed routes implemented; live behavior NOT verified. M1 blocked: direct eth_chainId fails TLS UNABLE_TO_VERIFY_LEAF_SIGNATURE in Node; PowerShell independent check fails PartialChain. No TLS bypass, no write, no entity/tx evidence. Official skills checked at b18c19a80c95a8a077f594f5977889244f225fdb. SDK has no server sort; page-only sort implemented. First offline tests: 18 passed, 1 assertion incorrectly expected && instead of SDK AND; corrected. Sandbox Vitest temp rename EPERM worked outside sandbox. Test runner upgraded to 4.1.11 for security fixes; PostCSS override 8.5.30; remaining audit advisories are ESLint glob dependency chain (braces has no patched release). Next: finish tests, seed signing preparation, browser QA, final evidence ledger.

### Session 003 start — 2026-10-15 10:06 IST — Codex
Starting commit: f3e511d; working tree clean. Goal: finish remaining implementation hardening and verification, prepare deployment/submission evidence. Next incomplete milestone M1: live reads exist in prior evidence, but synthetic write is pending. User confirms wallet is not set up, so M1/M4 live writes cannot yet be verified. Continue independent hardening and release preparation without marking these gates complete. Earlier milestone table is stale and will be reconciled with observed results.

### Session 003 outcome — 2026-10-15 10:18 IST — Codex
**Observed commit:** f3e511d. Changes remain local and uncommitted; no remote push, deployment, wallet transaction or submission performed.
**Files changed:** HISTORY.md, README.md, arkiv/schema.md, arkiv/friction.md, app/globals.css, components/chart.tsx, components/public-dashboard.tsx, components/studio.tsx, lib/wallet.ts, e2e/fixtures.spec.ts, playwright.config.ts. Added tests/wallet.test.ts, .github/workflows/ci.yml, RELEASE.md, SUBMISSION.md, DEMO.md.
**Implementation:** native modal with Escape/focus return and keyboard containment; chart accessibility descriptions no longer overwritten by ECharts; edit/validate an existing widget without duplication; reset public data on key change and expose canonical owner. Explicit EIP-1193 4001 rejection clears its unsent journal; timeout/read-back uncertainty preserves evidence and blocks duplicate sends. Provider request retains its receiver.
**Commands and verified results:** Commands used bundled Node 24.19.0 at C:/Users/joser/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe because system Node is 20.18.0, below project minimum. Equivalent npm commands:
- npm test: initial sandbox run failed EPERM before collecting tests. Outside sandbox: 19 baseline tests passed, then 22 tests in 4 files passed after wallet regressions. Fixtures do not broadcast transactions.
- npm run lint: PASS, exit 0; npm run typecheck: PASS, exit 0 (repeated after final source/test changes).
- npm run build: PASS, all routes generated; informational missing Next ESLint plugin warning remains. Build ran after the development server had stopped.
- PLAYWRIGHT_CHANNEL=msedge E2E_PRODUCTION=1 npm run test:e2e: final PASS, 9/9 in 34.6 seconds. Includes query pagination/chart composition/editing, malicious title rendered as text, rejected unknown payload field, keyboard modal, mobile width, wallet-free public/embed and a second local HTTP server consumer. Browser data explicitly mocked offline.
- Earlier browser run: 5 failures (ECharts description override, modal focus, ambiguous alert selector and synthetic-origin local-network blocking); corrected. Production rerun: 8/9, then final 9/9 after using a real second-origin HTTP server. Browser safety was not disabled.
- npm run test:live -- --public-sample: sandbox ENOTFOUND; normal TLS outside sandbox PASS, chain 7738577, SDK 0.8.1, snapshot 594656 at 2026-10-15T04:37:59Z. Demo count 0, two distinct public metadata keys; exact evidence in arkiv/schema.md. No project writes.
- git diff --check: PASS. Inspected source diff and rendered test-results/studio-desktop.png; desktop layout has no observed clipping. Screenshot is local ignored test output, not chain evidence.
**Decisions / limits:** Keep v1 one-query responsive grid; editing added, freeform resizing and multiple queries remain optional future scope. CI is prepared but not yet pushed/run on GitHub. Production browser verification is reproducible with E2E_PRODUCTION=1. Current test coverage does not prove live wallet compatibility, live data-change polling, deployment availability or faucet success. No fabricated completion percentages or gate promotion.
**Release materials:** RELEASE.md provides actual synthetic expectations (206/274/252 by category; 732 total), exact live checklist and proposed Vercel settings. SUBMISSION.md labels missing evidence and user-owned attestations. DEMO.md is a timed recording script, not a video. Official Arkiv network and Vercel deployment sources consulted; deployment requires the user's project-level approval under AGENTS.md.
**Next:** user-controlled wallet installation and faucet funding, then sign seed and dashboard separately through the app. Record actual receipts/keys, verify public/embed from a wallet-free browser, approve/publish to the chosen hosting account, record the real demo and complete submission fields. Do not mark M1/M4/M5 or the full project complete before that evidence.

Local handoff preview: next start --hostname 127.0.0.1 succeeded (Ready in 2.3s); http://127.0.0.1:3000 is running for user review. Stop this preview before the next build. Codex browser-panel open request was queued. No public deployment.

### Session 004 start — 2026-10-15 10:31 IST — Codex
Goal: diagnose browser eth_blockNumber Failed to fetch after wallet setup. Preserve existing local changes at f3e511d. User now reports wallet ready; screenshots show Tiramisu selected. Read-only SDK test succeeded at block 595339, demo namespace empty. Browser-specific cause under investigation; no write attempted.
### Session 004 outcome — 2026-10-15 10:32 IST — Codex
Files modified this session: HISTORY.md only. Read-only diagnosis, no app code changes or wallet requests. SDK live-read command (bundled Node 24, outside sandbox) PASS at 2026-10-15T05:00:44Z, chain 7738577, block 595339, demo count 0. PowerShell OPTIONS from Origin http://127.0.0.1:3000 returned 204, Access-Control-Allow-Origin *, POST/OPTIONS allowed, Content-Type allowed; POST eth_blockNumber returned 200. In-app browser Run query independently succeeded, snapshot 595365 at 10:31:36 IST, zero matching entities, no captured console errors. This does not establish why the user's wallet browser previously failed; transient/browser-specific failure remains possible. No TLS or browser protections changed, no proxy introduced, no seed or publication broadcast. Existing build/unit checks not rerun because source unchanged. Next: user retries Run query in wallet browser, then uses the explicit synthetic-seed flow and approves the transaction. If failure persists, obtain that browser's specific console network error before altering network configuration.

### Session 005 — 2026-10-15 10:44 IST — Codex — empty dashboard diagnosis
User reported duplicate-seed prevention. Read-only checks at f3e511d with existing edits preserved: live-read PASS at 2026-10-15T05:13:36Z, snapshot 595724, 12 actual demo records, no next page, creator/owner 0x9cC4bc554C544856E9DE2D244F05c0d6E8Be099A. Creator-scoped dashboard reads found keys 0x249da0c2b8ad2aa5def9d60f963d5c8fbb68084979d7f53054476f87408b3363 and 0x8ca8fd6a7ff57eddcfd5b711579e10d4cacd644a618b00c02844a93710908bec. Both validated v1 definitions have an extra category=str('jose') predicate; running those exact saved queries returned zero. Default query returned actual sums Indexing 252, Storage 274, Compute 206, skipped 0. Cause confirmed: saved filter does not match existing demo categories. User should remove category=jose, run query, then publish a corrected readonly snapshot through wallet approval; old snapshots do not change. No writes or new signatures requested by tools. Temporary read-only scripts in ignored test-results/inspect-dashboard.ts and inspect-metrics.ts; HISTORY.md is the only tracked file modified this session. No source changes, so build/tests not repeated. Project records and dashboard payloads now observed on chain; receipt transaction hashes and full publication evidence still need capture before milestone promotion.

### Session 006 — 2026-10-15 11:26 IST — Gemini (Antigravity)
**Starting commit:** `e733bb6d08b8c16d5b614d2d0013179aa897f14f` (user committed and pushed studio, chart transforms, and wallet-signed publishing flow to origin/main).
**Goal:** Verify on-chain state, reconcile project evidence in `arkiv/schema.md` and `SUBMISSION.md`, verify local suite, provide live browser walkthrough and usage artifact.
**Actions and commands:**
- Ran `npm run typecheck` (PASS, exit 0) and `npm run lint` (PASS, exit 0).
- Ran unit test suite (22/22 tests pass in 4 files).
- Executed `scripts/live-read.ts`: PASS at block 596064 (2026-10-15T05:24:56Z), returned 12 demo entities authored by creator `0x9cC4bc554C544856E9DE2D244F05c0d6E8Be099A`.
- Updated `arkiv/schema.md` and `SUBMISSION.md` with verified writer address, 12 demo keys, and 2 on-chain dashboard keys. Promoted M1 and M3 to VERIFIED.
- Automated browser session verified local UI at `http://127.0.0.1:3000`. Created visual user guide artifact with screenshots and flow diagrams.
**Blockers / Next exact task:** User publishes clean dashboard in UI without `category = jose`, copy entity key for public reader `/d/<key>`, push evidence updates, then proceed to Vercel deployment and demo recording.

### Session 007 start — 2026-10-15 15:05 IST — Codex
Starting commit: 6be4f4e; clean working tree. User requests actual MCP live Tiramisu reads and 30-second refresh, leaving npm packages/Codex plugin alone. Goal: protocol discovery on official /devfolio endpoint, verify public entity data using exposed read-only tools, then implement and test 30-second polling without dependency/plugin changes. No Arkiv connector tools exposed in current host; plugin discovery returned no matching plugin. Use explicitly authorized direct Streamable HTTP protocol preflight; do not install/configure a connector or assume arbitrary query support. Preserve user evidence updates since earlier sessions.

### Session 007 outcome — 2026-10-15 15:18 IST — Codex
**Baseline:** 6be4f4e; clean at start. Changes remain local/uncommitted. User requested live MCP data, 30-second refresh and no npm package/Codex plugin changes.
**Files changed:** components/studio.tsx, components/public-dashboard.tsx, e2e/fixtures.spec.ts, playwright.config.ts, README.md, HISTORY.md, SUBMISSION.md, arkiv/schema.md, arkiv/friction.md. Added lib/mcp.ts, components/mcp-observation.tsx, app/api/mcp/entity/route.ts, scripts/mcp-evidence.mjs, tests/mcp.test.ts, arkiv/mcp-evidence.json.
**MCP verification:** explicit direct Streamable HTTP at https://mcp.arkiv.network/devfolio. Initialize negotiated 2025-06-18, initialized notification, complete tool catalog discovery; successful server_status identifies devfolio 1.1.24 / config 2026-10-14.1 / content 27b032f009c234b8. network_status freshly verified chain ID 7738577. verify_entity of known public project metric 0xeaa7287a23de6198732a0004313073f795549cdc176834c725570c9c8a0f5bed returned observed at block 603626, created/updated block 595453, expiry 1891453, readonly true. Exact structured observation retained in arkiv/mcp-evidence.json.
**Architecture decision:** exposed MCP tools do not run arbitrary dataset queries; verify_entity omits payload, attributes, creator and owner. Keep existing direct SDK chart reads as source of truth; supplement with clearly labeled MCP metadata observations. Fixed server route accepts only a validated public key, calls only verify_entity at the approved endpoint, validates Tiramisu profile/network, caps remote response at 128 KiB, uses request timeouts, a bounded 25-second cache and no retries. No MCP feedback, transaction, wallet access, new plugin/host connection or dependency installation. package.json and package-lock.json have no changes.
**Polling:** studio first page auto-refreshes 30 seconds after successful completion; manual pause, hidden-tab pause, edited-filter pause and later-cursor-page pause preserve snapshot behavior. Public and embed readers now use 30 seconds, including old definitions storing 60; new definitions write refreshSeconds=30. Readonly on-chain definitions were not modified. MCP panel polls separately at 30 seconds, labels stale observations and backs off on failures; chart reads remain usable independently.
**Checks (bundled Node 24.19.0):** node node_modules/vitest/vitest.mjs run PASS, 27/27 in 5 files. node node_modules/typescript/bin/tsc --noEmit PASS. node node_modules/eslint/bin/eslint.js . initially found missing JS environment declarations in the new standalone script; corrected, final PASS. node node_modules/next/dist/bin/next build PASS, including /api/mcp/entity; known informational missing Next ESLint plugin warning remains. PLAYWRIGHT_CHANNEL=msedge E2E_PRODUCTION=1 node node_modules/@playwright/test/cli.js test final PASS, 11/11 in 35.9s; includes exact 30-second studio/public/MCP refresh and charts surviving MCP failure. Tests use labeled fixtures. First browser run reused an older production preview with obsolete assets, so hydration failed; stopped the verified Next preview listener, restarted and reran successfully. Production tests now refuse implicit existing-server reuse. git diff --check PASS.
**Actual runtime evidence:** new production preview ready at http://127.0.0.1:3000 (1887ms startup). Two real GET /api/mcp/entity requests 31 seconds apart returned blocks 603938 at 2026-10-15T09:47:22.586Z and 603954 at 09:47:55.894Z, no errors/warnings. Browser independently rendered 12 real metrics, snapshot 603955, and an observed MCP metadata panel for that metric at block 603954. No RPC mocks used in these runtime checks; API observations saved alongside protocol proof. No TLS validation bypass.
**Limits / next:** no full dataset fetched through MCP because the official service does not expose that capability; no app data fabricated. Existing synthetic data values remain synthetic, although entities are real on-chain records. Refresh is polling, not push streaming; hidden tabs and errors intentionally alter cadence. Live data mutation was not performed, so no claim of testing a new write propagating during polling. Earlier saved category=jose definitions still need a corrected wallet-approved publication. Preview remains running; stop it before building. Continue receipt capture, wallet-free live corrected dashboard/embed checks and approved deployment. No new on-chain writes, remote push, submission or deployment this session.

### Session 008 start — 2026-10-15 15:30 IST — Codex
Starting commit 6be4f4e with Session 007 changes uncommitted; preserve those edits. User requests complete removal of synthetic publishing, live public-only data, zero user filters, and a separate Public Database sidebar view. Scope: remove seeder UI/generator/write path, default to public browse, allow empty QuerySpec filters and roundtrip, retain bounded cursor pagination/30-second polling. SDK 0.8.1 source rejects zero predicates and has no match-all spelling; verify a nonrestrictive indexed $expiresAt >= u64(0) predicate on live chain as the implementation of zero user filters. No chain deletions or publications authorized/needed. Existing on-chain synthetic entities remain public; the app cannot certify factual content of arbitrary publishers.

### Session 008 outcome — 2026-10-15 IST — Codex
**Observed baseline:** 6be4f4e with Session 007 changes already uncommitted; preserved them. No commits/push, deployment or chain mutations performed.
**Files modified this session:** components/studio.tsx, app/globals.css, lib/query.ts, lib/wallet.ts, scripts/live-read.ts, tests/query.test.ts, tests/dashboard.test.ts, tests/wallet.test.ts, e2e/fixtures.spec.ts, e2e/studio.spec.ts, README.md, RELEASE.md, DEMO.md, SUBMISSION.md, arkiv/schema.md, arkiv/friction.md, HISTORY.md. Added components/public-database.tsx and arkiv/public-read-evidence.json. Deleted components/seed-panel.tsx.
**Product:** Public Database is a separate sidebar item and the default landing view. It reads existing public Tiramisu entities across all publishers automatically, shows indexed attributes, canonical creator/owner and creation/expiry blocks, allows on-demand payload inspection, pinned Previous/Next pages and transfer into Query studio. Current page counts are labeled; no whole-database count/download is claimed. Public first-page polling is 30 seconds with visibility pause/cancellation/backoff and pauses on later cursor pages.
**Synthetic flow removed completely:** deleted seeder UI, seedDemo export, syntheticParameters generator and duplicate-seed query branch; no runtime demoQuery namespace remains. Wallet writes now only expose dashboard-definition publication. No local fixtures or generated rows are loaded by the app. Historical synthetic entities remain on chain; user asked to remove the publishing flow, not approve deleting on-chain records. Unfiltered public browsing cannot certify whether publishers' testnet content is factual or synthetic; this distinction is documented.
**Zero filters / schema:** QuerySpec now accepts 0–12 conditions. Clear all filters and individual last-filter removal work. Default publicQuery has filters:[] and limit:25. Installed SDK 0.8.1 toString() rejects no predicates; empty user filters compile to $expiresAt >= u64(0), covering nonnegative canonical expiries without an app/dataset/creator restriction. Existing filtered v1 definitions still decode; empty-filter definitions require the updated reader. Dashboard JSON shape/version remains v1; schema and release/demo instructions updated.
**Actual network proof:** bundled Node24/tsx read-only script, 2026-10-15T10:01:19.819Z, snapshot604353, 25 public records then 25 more via cursor at the same snapshot, distinct first keys 0x03840b9201a03d29d42f5dcf59c8b33dc81f7c1fb6858d51ad5b98fbff91e549 and 0xf7bb61708efa4f0f619d4716e17ceeacafb2a93d6b7fbf981ea92d697d93f64b. No payloads fetched or saved. Exact bounded proof in arkiv/public-read-evidence.json; no global completeness claim.
**Checks:** used bundled Node24.19.0 executable with existing dependencies. node node_modules/vitest/vitest.mjs run PASS 28/28 in5 files; query tests cover empty filters, typed validation, and nonempty AND; dashboard tests cover empty-filter roundtrip and existing filtered definitions. node node_modules/eslint/bin/eslint.js . PASS; node node_modules/typescript/bin/tsc --noEmit PASS. node node_modules/next/dist/bin/next build PASS (twice: initial implementation and after mobile CSS fix); known informational missing Next ESLint plugin warning remains. PLAYWRIGHT_CHANNEL=msedge E2E_PRODUCTION=1 node node_modules/@playwright/test/cli.js test initial11/12 due mobile nav width; fixed wrapping. Final12/12 PASS in52.8s, including automatic public browse, 30-second public polling, cursor pause, canonical metadata, zero-filter transfer, clear-all, final-filter deletion and populated mobile viewport. Browser fixtures are labeled offline, never live chain evidence. Existing wallet-free route/embed and MCP outage regressions still pass. git diff --check PASS. package.json/package-lock.json unchanged; no plugin installed or modified.
**Remaining:** capture a new wallet-approved dashboard using chosen public records and fields; verify its live independent embed, complete receipt evidence and approved public deployment/video/submission. Existing old dashboards still retain category=jose until user publishes a corrected definition. No wallet signatures were requested during this work. No new unit/browser checks needed for documentation-only final edits. Stop preview before any subsequent build.

Session 008 live handoff verification: production preview restarted successfully (Ready in1868ms). Current public live-read script PASS again at2026-10-15T10:14:44.007Z, snapshot604757, 25 records and next cursor. In-app browser initially reported Failed to fetch; direct RPC navigation returned the expected JSON POST-only message, and subsequent public query retry succeeded without code/TLS/security changes. Browser Public Database visibly rendered25 real records at snapshot604761, then refreshed to604777 at15:45:24 IST; Next public page enabled. Some current public records identify as third-party chain-indexer baseload/test content, reinforcing that on-chain/public does not certify real-world factual meaning. No payloads fetched in this browse. Known browser failure was transient in this observation; cause not established. User-facing Public Database tab left open and preview remains running. No mock routes used in this live browser verification.

### Session 009 start — 2026-10-15 15:53 IST — Codex
Baseline 6be4f4e with prior local changes preserved. Goal: increase publicQuery page size from25 to50 as requested; update current docs, verify a real50-record read, rebuild/restart local preview. Existing historical25-record evidence remains unchanged.
Session 009 live check: current scripts/live-read.ts returned50 records with filters:[], limit:50, snapshot605036 at2026-10-15T10:24:01.627Z, hasNext=true. No writes or payload reads. Changed lib/query.ts default only; README.md and arkiv/schema.md updated. Historical25-record evidence retained. No dependency/plugin changes. No new tests added for this low-impact constant change; production build checks and actual live read are the relevant verification.
Session 009 completion — 2026-10-15 IST — Codex: production build PASS (known informational missing Next ESLint plugin warning); git diff --check PASS. Existing local changes preserved. Restarting preview with50-record Public Database pages.

### Session 010 start — 2026-10-15 16:00 IST — Codex
Baseline6be4f4e with existing local changes preserved. User requests total current database records. Read-only count of all cursor pages at a fixed Tiramisu snapshot, selecting keys only (no attributes/payloads). SDK max200/page confirmed in installed0.8.1 engine; same all-public expiry>=0 scope. Report partial lower bound if scan/time limits or RPC prevent exhaustion; never infer total from displayed50 rows.
### Session 010 outcome — 2026-10-15 16:02 IST — Codex
Files modified: HISTORY.md only; ignored read-only scripts test-results/count-public.ts and native-count.ts. Full key-only cursor scan hit a15-second RPC timeout on a subsequent200-row page; no total or partial count was inferred from it. Consulted official https://docs.arkiv.network/typescript-sdk/querying-data/#count-entities, then confirmed installed0.8.1 src/actions/public/getEntityCount.ts and decorator signature: getEntityCount() returns client.request({method:arkiv_getEntityCount,params:[]}). Native live check PASS: 2026-10-15T10:32:03.474Z (16:02:03 IST), chain7738577, whole-chain totalLiveEntities8191. Head block before and after the count was605278. This is a native aggregate observation, not a sum of the UI's50-row pages or a fabricated total. It counts live entities, not all historical/deleted/expired records or a per-second arrival rate. Total changes as records are created/expire. No attributes or payloads fetched, writes performed, dependencies changed, app code changed or tests/build needed. Existing local edits and running preview preserved. If showing global count in UI later, keep its native aggregation source and observation time distinct from page-scoped counts.

### Session 009 start — 2026-10-15 22:10 IST — Codex
Observed commit: 6be4f4e; Session 007/008 local edits present and preserved. Goal: user-requested single-viewport video landing page and matching monochrome app theme, with no query/wallet/dashboard logic changes. Use existing Next.js architecture; landing at / and existing workspace at /studio. No publication/deployment or chain write needed. Missing reference logo and Geist font assets will be handled with a native ArkivSight mark and available display font fallback; exact requested remote video/font used where available. Prior incomplete release milestones remain unchanged.

