# HACKATHON.md — Arkiv Global Tour Stop 2026, rules and winning-oriented plan

**Last checked:** 2026-10-14. Official canonical source (takes precedence): https://github.com/Arkiv-Network/global-tour-stop-pre-devcon . Devfolio overview: https://arkiv.devfolio.co/overview . Agent must recheck any new dated clarifications before submitting.

## Event facts
- **Event:** Arkiv: Global Tour Stop (9–18 October 2026), fully online, open globally; 1–5 builders/team; free registration.
- **Deadline:** 18 October 2026, 23:59 London BST = **19 October 2026, 04:29 IST** (22:59 UTC). Work must be built between 9–18 October; disclose earlier reused code, baseline SHA, and components.
- **Judging:** 19–22 October; keep public deployment alive through 23 October. Winners announced 23 October. Winners accept within 48h and complete KYC. Devcon 8 Mumbai 3–6 November, ticket only; travel/accommodation excluded.
- **Network:** Tiramisu `7738577`, RPC `https://rpc.tiramisu.db-chain.testnet.arkiv.network`, SDK `@arkiv-network/sdk` 0.8.x, explorer `https://tiramisu.explorer.arkiv.network`.

## Prizes / track choices

| Track | Prize | Strategy for ArkivSight |
|---|---|---|
| **Open Source (Global)** | **$750 USDC + 1 Devcon 8 ticket** | **PRIMARY.** MIT tool + documented public query/dashboard contract + independently reusable iframe or package |
| Censorship Resistance (Global) | $750 + ticket | CONDITIONAL: another party can query public source data and config without relying on our private backend |
| Security (Global) | $750 + ticket | CONDITIONAL: authentic `$creator`-verified sources, provenance filters and safe untrusted-content handling in UI |
| Privacy (Global) | $750 + ticket | NOT TARGETED without actual private-data protections; public dashboards aren't private |
| Best Indian Use Case | $2,000 + ticket | NOT TARGETED without a real India-specific adopter/use case; at least one Indian-national team member required |

Multiple tracks may be entered but at most **one** prize can be won by a team. Prize eligibility is not a guarantee of a prize; minimum score 50/100. Best Indian Use Case allocated first, then the global prizes per rubric.

## Official evaluation (100 points)
Each criterion receives raw 0–5 score, converted into up to 25 points.
1. **Why this pillar? / Why India? — 25**: who suffers if data is censored/closed/forged? For Open Source, can another team reuse the tool/data contract without permission?
2. **Why Arkiv? — 25**: what essential feature is gained versus Postgres/IPFS/subgraph/custom API? Public wallet-owned shared dashboard specs + direct indexed data queries, independently verifiable creator/owner, time-scoped lifecycle. Be honest: a conventional BI builder *could* use Postgres; the differentiation is cross-application public Arkiv compatibility and independent queries.
3. **How you use Arkiv — 25**: judge looks at on-chain evidence and code. Demonstrate typed attributes vs payload, compound queries, cursors, authentic `$creator` / `$owner`, product-driven expiry, dashboard config entities. Add WebSockets/extension only if actually used and visible.
4. **Friction report — 25**: specific tested Arkiv surfaces, versions, commands, expected vs actual, repro steps, evidence and suggestions. No invented problems or boilerplate praise.

**Winning-oriented Open Source proof:** demonstrate two separate UIs or web origins querying the same Arkiv data/config via public documented contract without asking the project team for backend permission. Provide a minimal copy/paste iframe and `examples/independent-consumer` or equivalent. Do not claim that public iframe alone makes the underlying implementation censorship resistant.

## Pass/fail gates (cannot compensate with high rubric score)
- [ ] Public deployed app that judges access without login/permission, including a tangible tool showcase.
- [ ] Reproducible exact query and demo steps backed by real Tiramisu reads and creation transaction(s).
- [ ] Public GitHub repo under **MIT license**; build instructions.
- [ ] Accurate `/arkiv/schema.md`: entities, typed attributes, expiration per type, actual queries.
- [ ] Accurate `/arkiv/friction.md`: real expected/actual/versions/steps/remedies.
- [ ] Wallet address(es) that actually create project entities on Tiramisu, supplied to judges.
- [ ] Demo video **<=3 minutes**.
- [ ] All required Devfolio fields filled with honest evidence and relevant code links.
- [ ] At least one track selected.
- [ ] Core logic / Arkiv integration new during 9–18 Oct; disclose reused work with baseline commit SHA.
- [ ] Long-lived proof: keep explorer transactions, video and sample entity references available even if entities expire.
- [ ] No secrets, private keys or **real personal data even hashed** stored on Arkiv; use synthetic data.
- [ ] Keep deployment live until 23 Oct and **do not force-push/rewrite git history after deadline**; snapshot SHA is judged.

Disqualifying examples: plagiarism; SDK installed but never queried; merely rebranding a conventional DB app; fake or nonworking integration; secrets/personal data on Arkiv; malicious code; late submission.

## Devfolio required form answers to prepare
Project name, tagline, problem, challenges, repo/live URL/video; member(s)/eligibility; select track(s); why Arkiv versus alternatives; features of Arkiv used with code links; link to friction; writer wallet addresses and roles; link to schema; step-by-step reproduction; pre-existing work; Arkiv surfaces used; elapsed time to first write; coding LLMs used; highest priority Arkiv improvement; feedback-call consent; attest build window and MIT public links. Never submit credentials.

## Demo video outline (<=180 seconds)
- 0–20s: demonstrate problem, project, Open Source value.
- 20–50s: real Tiramisu dataset and visual query builder with typed compound filter; show explorer entity.
- 50–85s: data preview and visualization; explain page vs full-data aggregations.
- 85–120s: compose dashboard, wallet-authorized publish, real entity key/transaction.
- 120–145s: open public dashboard incognito and show live refreshed query.
- 145–165s: embed widget from independent sample app; source contract and GitHub MIT repo.
- 165–180s: Why Arkiv and schema/friction evidence.

## Source links
- Overview: https://arkiv.devfolio.co/overview
- Rules: https://github.com/Arkiv-Network/global-tour-stop-pre-devcon/blob/main/RULES.md
- Rubric: https://github.com/Arkiv-Network/global-tour-stop-pre-devcon/blob/main/docs/scoring-rubric.md
- Submission checklist: https://github.com/Arkiv-Network/global-tour-stop-pre-devcon/blob/main/docs/submission-checklist.md
- Network docs: https://docs.arkiv.network/

These links are evidence of rules, not proof ArkivSight code exists.
