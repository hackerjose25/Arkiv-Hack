# ArkivSight submission draft

Not submitted. Pending values below are blockers, not claims of completion.

## Project

**Name:** ArkivSight

**Tagline:** Turn public Arkiv entities into shareable dashboards without writing code.

**Primary track:** Open Source

**Repository:** https://github.com/hackerjose25/Arkiv-Hack

**License:** MIT

**Live URL:** PENDING deployment and public access verification

**Video:** PENDING live demonstration, at most 3 minutes

**Release SHA:** PENDING final reviewed commit

## Problem and solution

Arkiv developers can publish indexed entities, but exploring them and making a reusable dashboard normally requires query and frontend code. ArkivSight provides typed visual filters, metadata inspection, page-scoped charts, dashboard composition and public reader/embed routes. Another developer can reuse the documented JSON contract, MIT source and independent iframe consumer.

## Why Arkiv

Arkiv provides a shared public data layer for indexed source entities and wallet-owned dashboard definitions. Readers query Arkiv directly, and creator/owner provenance comes from authoritative entity metadata. The app has no private indexer. A conventional BI interface could use Postgres; the reason to use Arkiv here is portable public definitions and direct cross-application reads without our database credentials.

## Implemented Arkiv surfaces and evidence boundaries

- SDK 0.8.1 public client; typed AND predicates and numeric/string operators: `lib/query.ts`.
- Snapshot-pinned cursor reads and canonical metadata: `lib/arkiv.ts`.
- Direct MCP Streamable HTTP session and live public entity metadata observations: `lib/mcp.ts`, `scripts/mcp-evidence.mjs`. Official Devfolio server 1.1.24 observed a real project metric at block 603626. MCP supplies metadata only; chart queries remain direct SDK reads. No Codex plugin installed and no new npm package added for this integration.
- Versioned strict dashboard payload, safe embed generation: `lib/dashboard.ts`.
- Browser wallet dashboard-definition publication, expiry, readonly flags, journal and read-back: `lib/wallet.ts`. Synthetic data publication was removed. A populated creator-filtered dashboard and successful creation receipt are verified; two older empty definitions remain historical. Portable import/export uses the strict v1 contract.
- Wallet-free public readers and polling with visibility pause/backoff: `components/public-dashboard.tsx`. Offline tests pass only when recorded in HISTORY; live project entity verification remains PENDING.
- Independent reuse: `examples/independent-reader/read-dashboard.ts` reads a published definition and queries Tiramisu with the web app stopped; the populated key returned18 records at snapshot638179 (historical empty key returned0 at638008). `/evidence` labels recorded observations and gaps; public readers expose actual query/definition provenance. These new local changes require the reviewed source release and deployed verification.

Unfiltered public reads succeeded 15 October 2026, 10:01:19 UTC, at block 604353: two bounded pages of 25 records retained the same snapshot and had distinct keys. The app now starts in Public Database and generates no source data. Historical project writes are listed below; full evidence and current limits are in `arkiv/schema.md` and `arkiv/friction.md`.

## Required evidence to fill after execution

| Item | Value |
|---|---|
| Writer address and role | `0x9cC4bc554C544856E9DE2D244F05c0d6E8Be099A` (Project creator/publisher) |
| Historical synthetic write evidence (publisher removed) | 12 records verified at block 596064 (e.g. `0xeaa7287a23de6198732a0004313073f795549cdc176834c725570c9c8a0f5bed`); no longer the app's default source |
| Dashboard entity keys | `0x249da0c2b8ad2aa5def9d60f963d5c8fbb68084979d7f53054476f87408b3363`, `0x8ca8fd6a7ff57eddcfd5b711579e10d4cacd644a618b00c02844a93710908bec` |
| Primary populated dashboard | `0x5dba036694a998c9b9a6eda06d974bace7e30d5947d5090161427f029f83668f`; canonical creator filter,18 records at638153, table of canonical creator/expiry metadata |
| Primary creation transaction | `0x4d939029ea70c4b74018f790d59b0c279b2386dcd319bdd722f1e0e2bd3a298e`; success, creation637419, expiry4525419; verified16 October |
| Verified historical dashboard creation transactions | `0x867fed3eac0a3b1f5ee2d44cca8818bca2d9e6935762f1cbd4f7aabed16d1a6d` (block 595532), `0x6f3e7d3960913081c30096b91f8d8afe098e398bac5015164084ff0924d79f5b` (595488); both success, but both saved queries return zero |
| Prepared corrected definition | `examples/public-dashboard.json`; unpublished, canonical creator/expiry table and count KPI, live preview 50 rows at block 636023; requires user-approved wallet publication |
| Public repo / baseline CI | GitHub API verified public MIT repo; [97bfc7b CI passed](https://github.com/hackerjose25/Arkiv-Hack/actions/runs/38775209165). New local release changes require a new run |
| Independent live reader/embed URL | PENDING public deployment |
| Time to first successful project write | PENDING user confirmation; earlier ~15-minute estimate was not backed by timing evidence |
| Team members / eligibility | User to supply |
| Feedback-call consent | User to decide |

Reproduction: follow `RELEASE.md`: open Public Database, browse pinned pages of live entities, open an unfiltered query or select indexed fields, build widgets and publish only the dashboard definition, then load it in a clean browser. Historical demo keys remain evidence of earlier writes; they are no longer the default dataset or an app publishing workflow. Schema: `arkiv/schema.md`. Measured friction: `arkiv/friction.md`.

## Challenges and suggested improvement

Initial certificate validation and sandbox DNS failures prevented access; successful retries used normal TLS with no bypass. SDK inspection established that sorting must be labeled current-page-only. Wallet uncertainty requires a persistent journal to avoid duplicate publications. The highest-priority documentation improvement from this work is clearer node-supported sorting and indexed-name restrictions alongside SDK examples. These are measured observations and recommendations, not invented protocol defects.

## Reused work and AI disclosure

Documentation baseline: `6265194`. Repo license baseline: `b65d8f6bb0c59c1a4ff3683ff3b5ec125f585606`. App implementation was added after the documentation baseline. Reused dependencies include Next.js, React, Arkiv SDK, viem, Zod, ECharts, Lucide and Fontsource; exact versions are pinned in the lockfile. No claim is made to authorship of these dependencies.

Recorded assistance: ChatGPT for initial specification, Gemini (Antigravity) for repository setup, Codex for implementation and verification. User should confirm a complete disclosure before submission. Build-window and eligibility attestations require the user's review. No submission or feedback message has been sent.
