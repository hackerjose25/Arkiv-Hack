# Release and live verification

Status: deployed at https://arkivsight.vercel.app on16 October2026; submission remains pending. Vercel Hobby project `hackerjose25s-projects/arkivsight`, deployment `dpl_6pj1sW3tCNrQqyNWLuqMJgD9HqP9`, app revision `93b9ecc20fea983fe93fc8bf7deb51cdd81552ce`. User explicitly authorized Git push and deployment. Root/studio/evidence/example-download/public/embed routes returned200 without login cookies. Hosted public dashboard returned18 actual rows at639016. Separate-origin hosted embed loaded the app but its RPC read returned429 ANON_COST_LIMITED; populated hosted embed proof remains pending. No paid upgrade, wallet action or secrets used. The project overview still offers Connect Git Repository; automatic future deployment is not verified. Public browsing needs no wallet; never replace pending evidence with offline fixtures.

Use existing populated key `0x5dba036694a998c9b9a6eda06d974bace7e30d5947d5090161427f029f83668f` for the reader/embed checks below. Its receipt/query evidence is `arkiv/dashboard-receipt-5dba03.json`; the independent direct SDK observation is `arkiv/independent-read-evidence.json`. No additional wallet signature is needed to read this publication. Steps3–4 apply only if the user chooses to create another definition.

## Local release checks

Use Node 24 and `npm ci`. Run `npm run lint`, `npm run typecheck`, `npm test`, then `npm run build`. Stop any development server before building. Start the production preview with `npm run start` and open http://127.0.0.1:3000.

For browser checks, install Chromium with `npx playwright install chromium`, then run `npm run test:e2e`. On Windows, installed Edge is supported with `PLAYWRIGHT_CHANNEL=msedge`. The CI workflow repeats these checks on pushes and pull requests. App release `93b9ecc` has a [successful full remote run](https://github.com/hackerjose25/Arkiv-Hack/actions/runs/38854629242), checked16 October, covering install/lint/types/unit/build/Chromium browser tests. Later documentation-only commits do not change the deployed app revision.

## Public data and dashboard publication

1. Open **Public Database**. Confirm live public entities load automatically, page-scoped counts, snapshot block and canonical creator/owner. Follow Next public page and confirm the snapshot remains pinned. Inspect payload only when needed. No wallet or source-data publication is required.
2. Click **Open in query studio**. Confirm zero filters work, add a condition then remove the last condition, and test **Clear all filters**. Inspect typed fields, choose a real numeric measure/grouping or a count KPI, and add widgets. Arbitrary publishers have different schemas; there is no universal fixed expected chart total.
3. For dashboard publication, install/unlock a wallet yourself, click **Connect wallet**, approve switching to Tiramisu (7738577), and obtain test GLM from https://hub.arkiv.network/faucet. Official network details: https://docs.arkiv.network/networks/tiramisu/.
4. Review the publicly stored title, query and widgets, approve the dashboard-definition transaction, and save its actual hash, entity key and read-back expiry. This is the only publication flow; the synthetic dataset publisher has been removed.
5. Load `/d/<actual-key>` in a clean browser without a wallet. Verify title, creator/owner and page-scoped chart values. Load `examples/independent-consumer/index.html` from a separate HTTP origin and use the actual deployment URL and key. Verify the iframe without a wallet.
6. Confirm 30-second polling, hide/reopen the tab, and check that it resumes. Public Database and studio pause auto-refresh on later cursor pages. Polling is not push streaming.
7. Add actual public evidence to `arkiv/schema.md`, `HISTORY.md`, and `SUBMISSION.md`. Previously created demo entities remain historical on-chain evidence, not the current source-data workflow.

8. Open `/evidence` and check that dated snapshots, historical empty queries and the unpublished example are labeled accurately. Download the example there rather than uploading a raw dataset into Dashboard builder. After a corrected publication, add its verified receipt and query observation; do not silently replace historical snapshots.
9. Stop the Next server and run `npm run read:dashboard -- --key <actual-key>`. This independent SDK consumer must load the same definition and execute its typed query through public Tiramisu RPC. Record its real result/snapshot; zero rows are an empty result, not proof of a populated demo. The existing iframe example separately proves integration on another web origin.

Explicit wallet rejection is retryable. A timeout or failed read-back keeps the publication journal and blocks duplicates. Preserve the journal and reconcile the original transaction before clearing anything; never automatically repeat an uncertain write.

### Prepared definition and receipt recovery

To avoid reconstructing the draft in a wallet browser, open Dashboard builder and import `examples/public-dashboard.json`. Its count KPI and canonical creator/expiry table query all public publishers, capped at 50 records. No source-data write is involved. The final live preparation check returned 50 records at block 636023; exact evidence is in `arkiv/prepared-dashboard-provenance-evidence.json`. The initial attribute-table preview at block635752 is retained separately; it showed that arbitrary publishers do not share the sample's kind/value attributes. The final definition is still unpublished. Confirm the live preview, title, query and widgets before signing. Export dashboard JSON saves a local copy without publishing.

After the wallet returns the new entity key, run:

```sh
npm run verify:dashboard -- --key <actual-key> --out arkiv/corrected-dashboard-evidence.json
```

This read-only command recovers the creation event from the entity's exact creation block, verifies its successful transaction receipt against the engine and authoritative creator, and executes the saved query. It refuses to overwrite an existing evidence file. An empty query is recorded as a warning, never promoted to a populated demo. Existing receipts are in `arkiv/dashboard-receipt-249da0.json` and `arkiv/dashboard-receipt-8ca8fd.json`. Neither proves a corrected query or hosted embed.

## Deployment proposal — approval required before publishing

Deploy this Next.js app using an existing eligible free Vercel account, or a user-selected Node host. No database, backend credentials or environment secrets are needed. Dynamic public key routes require Next.js hosting; do not use a plain static export.

For Vercel: import the public `hackerjose25/Arkiv-Hack` repository, select the approved release commit, use Next.js preset, Node 24, install `npm ci`, build `npm run build`, and default output directory. Review account/plan eligibility and keep paid upgrades disabled. Confirm approval before clicking Deploy. Official instructions: https://vercel.com/docs/git and https://vercel.com/docs/frameworks/full-stack/nextjs.

After deployment, verify the root, `/studio`, `/evidence`, `/api/examples/dashboard`, `/d/<actual-key>`, `/embed/<actual-key>`, direct browser RPC, and the independent-origin consumer. Ensure visitors can access the production URL without hosting-account login. Keep the deployment available through at least 23 October 2026. Record URL, release SHA and check time; roll back to a previously verified deployment if a release fails.

Anonymous RPC reliability is an open release risk: the user observed HTTP429 `ANON_COST_LIMITED` on16 October. Hosting does not raise Arkiv's limit. Public Database now enforces a cooldown, but verify actual hosted reads before presenting the demo as reliable. The optional higher-quota access-key path requires a separate architecture review to keep credentials server-side while preserving the direct public read path; no key or proxy is currently configured.

## Final handoff

- Record and publish a real demo of at most 3 minutes using `DEMO.md` after live proof exists.
- Complete user-owned fields in `SUBMISSION.md`, confirm the current event rules, and review before submitting.
- Preserve public MIT source, lockfile, schema, friction and baseline disclosure.
- Do not force-push or rewrite judged repository history after the deadline.
