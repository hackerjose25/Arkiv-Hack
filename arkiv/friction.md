# Arkiv developer friction report — actual observations only

**Status: NOT TESTED (2026-10-14).** This file is a report template, not evidence of a successful integration and not a list of alleged Arkiv defects. Agents must replace placeholders after performing reproducible tests. Fabricated issues or generic praise score poorly under the official rubric.

## Environment metadata (fill on first working test)
- Date/time and timezone:
- OS / Node.js / package manager versions:
- `@arkiv-network/sdk` exact installed version:
- `viem` exact installed version:
- Network / chain ID: Tiramisu / 7738577 (planned)
- RPC transport (public HTTP, WS, access-key endpoint if used):
- Wallet address (public ONLY; never private key):
- App git commit SHA:

## Tested surfaces — update truthful statuses
| Surface | Test intent | Status | Reference |
|---|---|---|---|
| TypeScript SDK | Public query and entity decoding | NOT TESTED | — |
| Typed filters | Compound and numeric range filter | NOT TESTED | — |
| Pagination | Cursor, sorting and limits | NOT TESTED | — |
| Wallet write | Signed synthetic demo entity | NOT TESTED | — |
| Read dashboard | Fetch published spec from other browser | NOT TESTED | — |
| WebSocket events | Optional, if attempted | NOT TESTED | — |
| Docs / Explorer / Hub / Faucet | Access and practical usability | NOT TESTED | — |

## Observation template (repeat after real execution)
### F-001 — <short descriptive title>
- **Date/time:**
- **Surface:** SDK / RPC / docs / explorer / faucet / WebSocket
- **Version/environment:**
- **Task and expectation:**
- **Exact minimal steps to reproduce:** numbered setup, relevant query/code, command (redact tokens)
- **Actual result:** result/error/status and an anonymized trace if needed
- **Expected result:**
- **Impact:** affected end-user workflow and severity
- **Workaround attempted:**
- **Suggested improvement:** specific and actionable
- **Evidence:** source code path, commit, public tx/entity/explorer link if applicable
- **Outcome:** unresolved / fixed / expected behavior / documentation misunderstanding

## Tested successful paths also count
Document happy paths with the same expected-vs-actual rigor (SDK version, precise invocation, and real outcome), especially if no bugs are encountered. Do not invent complaints to fill the document.

## Before submission
- [ ] Replace NOT TESTED with actual verifiable results.
- [ ] At least one meaningful test record covers public query and one covers signed entity creation.
- [ ] Every cited command and behavior corresponds to checked-in code.
- [ ] Exclude secrets and any real person's data.
- [ ] Add public file URL to Devfolio submission.

References: https://github.com/Arkiv-Network/global-tour-stop-pre-devcon/blob/main/docs/scoring-rubric.md and https://docs.arkiv.network/
