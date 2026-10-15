# Release and live verification

Status: release preparation, not a deployed or submitted project. Wallet setup and live writes are pending. Never replace pending evidence with offline browser fixtures.

## Local release checks

Use Node 24 and `npm ci`. Run `npm run lint`, `npm run typecheck`, `npm test`, then `npm run build`. Stop any development server before building. Start the production preview with `npm run start` and open http://127.0.0.1:3000.

For browser checks, install Chromium with `npx playwright install chromium`, then run `npm run test:e2e`. On Windows, installed Edge is supported with `PLAYWRIGHT_CHANNEL=msedge`. The CI workflow repeats these checks on pushes and pull requests; its remote result is pending until pushed and run.

## Wallet and actual project entities

1. Install a browser wallet from its official source, such as https://metamask.io/download/. Create/unlock it yourself; no seed phrase or private key belongs in this repository or chat.
2. Click **Connect wallet** in ArkivSight. Review the request to add/switch to Tiramisu (chain 7738577). Obtain test GLM at https://hub.arkiv.network/faucet. Official network details: https://docs.arkiv.network/networks/tiramisu/.
3. Expand **Need a dataset? Publish synthetic demo metrics**, review the 12 fictional records and 30-day lifetime, check the consent box, and approve the transaction in the wallet. Save the returned transaction hash and all 12 entity keys after read-back.
4. Run the default query, adding `$creator` / `addr` / `equals` / your public address. Expect 12 rows for a newly seeded, unexpired dataset. Display category/value as sum: Compute 206, Storage 274, Indexing 252; total 732. These are expected synthetic values, not evidence of a write.
5. Add a chart, edit its title, and publish a dashboard. Approve this separate wallet transaction. Save the dashboard key and transaction hash after read-back.
6. Load `/d/<actual-key>` in a clean browser without a wallet. Verify title, creator/owner and page-scoped chart values. Load `examples/independent-consumer/index.html` from a separate HTTP origin and use the actual deployment URL and key. Verify the iframe without a wallet.
7. Confirm the polling interval, hide/reopen the tab, and check that it resumes. After an additional separately approved matching data write, verify new data appears on a subsequent poll. Polling is not push streaming.
8. Add actual public evidence to `arkiv/schema.md`, `HISTORY.md`, and `SUBMISSION.md`. Do not mark M1/M4/M5 verified until these steps pass.

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
