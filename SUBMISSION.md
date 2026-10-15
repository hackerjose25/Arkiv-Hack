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
- Versioned strict dashboard payload, safe embed generation: `lib/dashboard.ts`.
- Browser wallet batch seed/publication, expiry, readonly flags, journal and read-back: `lib/wallet.ts`. Live wallet execution remains PENDING.
- Wallet-free public readers and polling with visibility pause/backoff: `components/public-dashboard.tsx`. Offline tests pass only when recorded in HISTORY; live project entity verification remains PENDING.

Fresh public metadata reads succeeded 15 October 2026, 04:37:59 UTC, at block 594656. The demo namespace was empty. This demonstrates actual reads, not project writes or a complete demo. Full details are in `arkiv/schema.md` and `arkiv/friction.md`.

## Required evidence to fill after execution

| Item | Value |
|---|---|
| Writer address and role | PENDING user wallet |
| Synthetic seed transaction / 12 entity keys | PENDING |
| Dashboard transaction / entity key | PENDING |
| Independent live reader/embed URL | PENDING |
| Time to first successful project write | Not measured; no project write yet |
| Team members / eligibility | User to supply |
| Feedback-call consent | User to decide |

Reproduction: follow `RELEASE.md`, including creator-scoped filters, actual seed read-back and a clean-browser dashboard load. Schema: `arkiv/schema.md`. Measured friction: `arkiv/friction.md`.

## Challenges and suggested improvement

Initial certificate validation and sandbox DNS failures prevented access; successful retries used normal TLS with no bypass. SDK inspection established that sorting must be labeled current-page-only. Wallet uncertainty requires a persistent journal to avoid duplicate publications. The highest-priority documentation improvement from this work is clearer node-supported sorting and indexed-name restrictions alongside SDK examples. These are measured observations and recommendations, not invented protocol defects.

## Reused work and AI disclosure

Documentation baseline: `6265194`. Repo license baseline: `b65d8f6bb0c59c1a4ff3683ff3b5ec125f585606`. App implementation was added after the documentation baseline. Reused dependencies include Next.js, React, Arkiv SDK, viem, Zod, ECharts, Lucide and Fontsource; exact versions are pinned in the lockfile. No claim is made to authorship of these dependencies.

Recorded assistance: ChatGPT for initial specification, Gemini (Antigravity) for repository setup, Codex for implementation and verification. User should confirm a complete disclosure before submission. Build-window and eligibility attestations require the user's review. No submission or feedback message has been sent.
