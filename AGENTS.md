# AGENTS.md — instructions for Astra6, Gemini, Claude and every coding agent

## Read order (mandatory at session start)
1. `AGENTS.md` (this file)
2. `HISTORY.md` (actual progress; not aspirational)
3. `HACKATHON.md` (judging and pass/fail gates)
4. `README.md` (product contract)
5. `arkiv/schema.md` and `arkiv/friction.md`
6. Inspect the actual repository tree, package manifest, git log/status, tests, and environment without exposing secrets.

If documentation contradicts runnable code, test the code and record the divergence. Never accept a previous agent's 'done' claim without evidence.

## North star
Build **ArkivSight**, not CivicProof: a no-code Arkiv **read-side** query and dashboard builder, supporting public live dashboards, embeds and wallet-signed dashboard definitions. The primary track is **Open Source**. Prioritize value to external Arkiv developers over gratuitous effects. See HACKATHON.md.

## Operating rules
- Implement the *next incomplete milestone* in HISTORY.md and run relevant checks before advancing. Prefer working end-to-end slices.
- Confirm SDK signatures from installed `@arkiv-network/sdk` 0.8.x and current docs before writing calls; do not copy unverified examples verbatim.
- Use **actual Tiramisu data** for demonstrable data operations. A mock may support offline tests but must be labeled and must never be treated as on-chain evidence.
- Use an Arkiv public client for reads, wallet client and user-approved wallet transactions for writes. Never request or embed a private key in frontend; never commit secrets or local `.env`.
- Explain and validate typed attributes versus payload. Query only indexable attributes; do not fabricate SQL support. Sort, range and cursor pagination must match actual SDK ability.
- Analytics counts are page-scoped unless complete pagination or native aggregation establishes otherwise. UI must communicate the scope.
- Record and expose `$creator`/`$owner` from authoritative entity metadata; never trust `creator`/`owner` user-defined text fields. Include verified explorer links if correct.
- Persist public dashboard definitions as versioned, Zod-validated Arkiv entities; display actual tx hash and entity key. Loading by key must work independently of writer wallet.
- Queries execute directly against Arkiv (no private centralized indexer). Optional proxy for rate limiting must never be the sole source of truth or quietly replace Arkiv.
- Prefer modest polling with cancellation, visibility pause and backoff; consider WebSocket `watchEntityEvents` only after confirming suitability. Do not describe polling as instant push streaming.
- Treat records as hostile input: strict parse, size limits, safe rendering, no arbitrary HTML/JS or unvalidated iframe injection. Avoid real user personal information; seed **synthetic data**.
- Optimize first for public read functionality, accessible UX, reproducibility, documentation, and reliable demo; add animations last.
- Adhere to free-tier quotas. No paid services required; get consent for irreversible actions, wallet signatures, production deployments or third-party charges as needed.
- Do not create fake friction reports; document actual experiments even when they succeed.

## Workflow protocol
**At start:** verify present state and choose one milestone; append a short session-start entry to HISTORY.md with timestamp (timezone), goal, observed commit, known blockers. Keep working without repetitive permission prompts for ordinary coding tasks.

**During:** preserve a compilable project when possible; write tests for query compile/validation, chart transforms, dashboard schema round trip and public embeds. When SDK calls fail, capture minimum reproducible details; redact credentials. Update `arkiv/schema.md` when schema changes.

**At end:** run available checks, inspect `git diff`, update HISTORY.md to reflect only verified outcomes. Include:
- exact files modified, commands and pass/fail output;
- network, SDK and deployed URL / tx hashes / entity keys where publicly shareable;
- TODOs, blockers and next atomic task;
- decisions, known limitations, tests not run and why;
- timestamp + agent identifier (not a fabricated exact time).

**Handoff:** Any replacement agent starts from the most recent `HISTORY.md` entry, re-checks git/test status, verifies the next task, and continues without redoing completed work. Preserve manual changes; do not overwrite user work without examining it. Do not change project name or scope back to CivicProof.

## Prioritization and stop conditions
1. Real Arkiv query + entity metadata -> 2. no-code filter and explorer -> 3. charts -> 4. saved dashboards -> 5. independent share/embed -> 6. polish/documentation/evidence.
If tests/build fail, fix them before promoting milestone status. If Tiramisu is unavailable, build offline UI/tests **with an explicit degraded mode**, record the blocker, and retry only when feasible. Do not mark M1 or M4 complete without network evidence.

## Required project evidence
- Public deployed demo; public MIT repo; reproducible query steps; wallet address(es) writing Tiramisu entities.
- Actual `/arkiv/schema.md` matching on-chain artifacts and runtime queries.
- Actual `/arkiv/friction.md` containing expected/actual, versions, repro steps and remedies.
- Demo <=3 minutes, links, submission responses, disclosed reused components/baseline SHA.
- Remain publicly accessible until at least 23 Oct 2026, and never rewrite judged repo history after deadline.

## Documentation updates
Maintain README for user-facing state, HISTORY as authoritative state ledger, schema/friction as measured technical evidence, HACKATHON for rules (do not casually rewrite verified facts). Cite official URLs. A decision to change architecture belongs in HISTORY with reason and migration impact.

## Initial next action
M0: inspect workspace and scaffold Next.js TypeScript project. Check network/SDK support, then M1: connect public client to Tiramisu, query actual entities, seed minimal safe synthetic records if needed via a user wallet, capture evidence. Update HISTORY immediately after verification.
