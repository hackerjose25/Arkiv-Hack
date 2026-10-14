# HISTORY.md — ArkivSight progress and agent handoff ledger

**Last reviewed:** 2026-10-14 (Asia/Kolkata). **Current phase:** documentation-only. **Owner:** next coding agent, unassigned. **Source of truth:** verified file state + command results; entries below must never claim unobserved success.

## CURRENT STATE / HANDOFF SUMMARY
- Project: **ArkivSight — Query-to-Dashboard Studio** (replaces CivicProof AI entirely).
- Objective: no-code Arkiv query builder, explorer, automatic charts, configurable dashboard, public share/iframe embed, auto-refresh, Arkiv-backed config persistence.
- Primary target: Open Source. Additional tracks considered only when concrete evidence meets rubric.
- Verified implementation: **NONE**. This handoff package contains Markdown specs only.
- Verified Tiramisu wallet: **NONE**. Entity keys / transaction hashes: **NONE**.
- Verified tests/build/deployment: **NONE**. No running web app exists yet.
- Active blockers: SDK details not validated against an installed package; no funded testnet wallet or repo setup recorded here.
- **Next task: M0 scaffold, then M1 live Arkiv read and documented synthetic write.**

## Milestone board

| ID | Stage | Status | Evidence / remaining |
|---|---|---|---|
| M0 | Scaffold, environment, MIT license | NOT STARTED | Need repo, scripts, build, lint |
| M1 | Query real Tiramisu data + synthetic seed | NOT STARTED | Need actual SDK operation and explorer IDs |
| M2 | Query UI + dataset explorer | NOT STARTED | Need filters, schema inference, errors, cursor pages |
| M3 | Chart engine and scoped aggregation | NOT STARTED | Need charts driven by real results |
| M4 | Dashboard editor and Arkiv persistence | NOT STARTED | Need wallet-signed save/read roundtrip |
| M5 | Public dashboard, auto-refresh, iframe embed | NOT STARTED | Need independent browser test |
| M6 | Hardening, deployment, evidence and submission | NOT STARTED | Need public demo, docs, video |

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
