# Release and live verification

Status: release preparation, not a deployed or submitted project. Public browsing needs no wallet. Dashboard receipt capture and public release are pending. Never replace pending evidence with offline browser fixtures.

## Local release checks

Use Node 24 and `npm ci`. Run `npm run lint`, `npm run typecheck`, `npm test`, then `npm run build`. Stop any development server before building. Start the production preview with `npm run start` and open http://127.0.0.1:3000.

For browser checks, install Chromium with `npx playwright install chromium`, then run `npm run test:e2e`. On Windows, installed Edge is supported with `PLAYWRIGHT_CHANNEL=msedge`. The CI workflow repeats these checks on pushes and pull requests; its remote result is pending until pushed and run.

## Public data and dashboard publication

1. Open **Public Database**. Confirm live public entities load automatically, page-scoped counts, snapshot block and canonical creator/owner. Follow Next public page and confirm the snapshot remains pinned. Inspect payload only when needed. No wallet or source-data publication is required.
2. Click **Open in query studio**. Confirm zero filters work, add a condition then remove the last condition, and test **Clear all filters**. Inspect typed fields, choose a real numeric measure/grouping or a count KPI, and add widgets. Arbitrary publishers have different schemas; there is no universal fixed expected chart total.
3. For dashboard publication, install/unlock a wallet yourself, click **Connect wallet**, approve switching to Tiramisu (7738577), and obtain test GLM from https://hub.arkiv.network/faucet. Official network details: https://docs.arkiv.network/networks/tiramisu/.
4. Review the publicly stored title, query and widgets, approve the dashboard-definition transaction, and save its actual hash, entity key and read-back expiry. This is the only publication flow; the synthetic dataset publisher has been removed.
5. Load `/d/<actual-key>` in a clean browser without a wallet. Verify title, creator/owner and page-scoped chart values. Load `examples/independent-consumer/index.html` from a separate HTTP origin and use the actual deployment URL and key. Verify the iframe without a wallet.
6. Confirm 30-second polling, hide/reopen the tab, and check that it resumes. Public Database and studio pause auto-refresh on later cursor pages. Polling is not push streaming.
7. Add actual public evidence to `arkiv/schema.md`, `HISTORY.md`, and `SUBMISSION.md`. Previously created demo entities remain historical on-chain evidence, not the current source-data workflow.

Explicit wallet rejection is retryable. A timeout or failed read-back keeps the publication journal and blocks duplicates. Preserve the journal and reconcile the original transaction before clearing anything; never automatically repeat an uncertain write.

## Deployment proposal — approval required before publishing

Deploy this Next.js app using an existing eligible free Vercel account, or a user-selected Node host. No database, backend credentials or environment secrets are needed. Dynamic public key routes require Next.js hosting; do not use a plain static export.

For Vercel: import the public `hackerjose25/Arkiv-Hack` repository, select the approved release commit, use Next.js preset, Node 24, install `npm ci`, build `npm run build`, and default output directory. Review account/plan eligibility and keep paid upgrades disabled. Confirm approval before clicking Deploy. Official instructions: https://vercel.com/docs/git and https://vercel.com/docs/frameworks/full-stack/nextjs.

After deployment, verify the root, `/d/<actual-key>`, `/embed/<actual-key>`, direct browser RPC, and the independent-origin consumer. Ensure visitors can access the production URL without hosting-account login. Keep the deployment available through at least 23 October 2026. Record URL, release SHA and check time; roll back to a previously verified deployment if a release fails.

## Final handoff

- Record and publish a real demo of at most 3 minutes using `DEMO.md` after live proof exists.
- Complete user-owned fields in `SUBMISSION.md`, confirm the current event rules, and review before submitting.
- Preserve public MIT source, lockfile, schema, friction and baseline disclosure.
- Do not force-push or rewrite judged repository history after the deadline.
