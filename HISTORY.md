# HISTORY.md — ArkivSight progress and agent handoff ledger

**Last reviewed:** 2026-10-15 10:18 IST (Asia/Kolkata). **Current phase:** implementation verified locally; live publication and release pending. **Owner:** Codex / user for wallet and release approval. **Source of truth:** verified file state + command results; entries below must never claim unobserved success.

## CURRENT STATE / HANDOFF SUMMARY
- Project: **ArkivSight — Query-to-Dashboard Studio** (replaces CivicProof AI entirely).
- Objective: no-code Arkiv query builder, explorer, automatic charts, configurable dashboard, public share/iframe embed, auto-refresh, Arkiv-backed config persistence.
- Primary target: Open Source. Additional tracks considered only when concrete evidence meets rubric.
- Implemented: typed query studio, cursor explorer, chart transforms, dashboard composition/editing, wallet publication journal, public/embed readers. Local verification below distinguishes fixtures from live evidence.
- Verified Tiramisu wallet: **NONE**. Entity keys / transaction hashes: **NONE**.
- Verified checks: 22 unit tests, 9 production browser tests, lint, typecheck and production build pass. Public Tiramisu metadata reads re-verified 15 October. No public deployment verified.
- Active blockers: user confirms wallet not set up; no project seed/dashboard transaction. Production deployment approval/account and live recording/submission remain pending.
- **Next atomic task: user installs/funds wallet, signs synthetic seed, capture receipt and 12 read-back keys (M1). Then publish/read dashboard independently (M4/M5). Follow RELEASE.md.**

## Milestone board

| ID | Stage | Status | Evidence / remaining |
|---|---|---|---|
| M0 | Scaffold, environment, MIT license | VERIFIED | Build/lint/types pass; MIT source and pinned SDK 0.8.1 |
| M1 | Query real Tiramisu data + synthetic seed | BLOCKED | Live reads + two cursor pages verified at 594656; seed needs user wallet |
| M2 | Query UI + dataset explorer | VERIFIED | Typed validation tests; browser filters/errors/schema/cursor tests pass with labeled fixtures; live SDK reads separately verified |
| M3 | Chart engine and scoped aggregation | IN PROGRESS | Unit/browser transforms pass; populated live project data awaits M1 |
| M4 | Dashboard editor and Arkiv persistence | BLOCKED | Composition/editing, schema and wallet safety tested offline; actual signed roundtrip pending |
| M5 | Public dashboard, auto-refresh, iframe embed | IN PROGRESS | Wallet-free route and real second-origin server tested using offline RPC fixtures; live project key and polling changes pending |
| M6 | Hardening, deployment, evidence and submission | IN PROGRESS | Local checks pass; CI, release guide, submission draft and demo script prepared; deployment/video/submission pending |

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
