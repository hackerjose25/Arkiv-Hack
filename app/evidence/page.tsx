import Link from "next/link";
import firstReceipt from "@/arkiv/dashboard-receipt-249da0.json";
import secondReceipt from "@/arkiv/dashboard-receipt-8ca8fd.json";
import prepared from "@/arkiv/prepared-dashboard-provenance-evidence.json";
import working from "@/arkiv/dashboard-receipt-5dba03.json";

const repo = "https://github.com/hackerjose25/Arkiv-Hack";
function observed(value: string) {
  return (
    new Intl.DateTimeFormat("en-IN", {
      timeZone: "Asia/Kolkata",
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value)) + " IST"
  );
}
export default function EvidencePage() {
  return (
    <main className="public-page evidence-page">
      <header>
        <Link className="brand" href="/">
          ◈ ArkivSight
        </Link>
        <Link href="/studio">Open studio →</Link>
      </header>
      <span className="tag">OPEN SOURCE · TIRAMISU 7738577</span>
      <h1>Evidence &amp; reuse</h1>
      <p>
        Inspect recorded on-chain observations, reproduce the query path, and
        build another consumer from the public dashboard contract.
      </p>
      <div className="notice">
        These are dated evidence snapshots, not live status. A populated
        publisher dashboard and its creation receipt are verified below. Public
        deployment remains unverified. A successful historical receipt alone
        does not establish that its saved query returns data.
      </div>
      <div className="proof-links">
        <a href={`${repo}/blob/main/arkiv/schema.md`}>
          Dashboard contract &amp; schema
        </a>
        <a href={`${repo}/blob/main/arkiv/friction.md`}>
          Measured friction report
        </a>
        <a href={`${repo}/blob/main/LICENSE`}>MIT source</a>
        <a href={`${repo}/actions/runs/38775209165`}>
          Passed CI for baseline 97bfc7b
        </a>
      </div>
      <h2>A working publisher dashboard</h2>
      <section className="panel panel-body proof-card">
        <span className="tag">VERIFIED CREATION · POPULATED QUERY</span>
        <p>
          Observed {working.page.count} records at query block{" "}
          {working.page.blockNumber}, {observed(working.observedAt)}. The saved
          query filters canonical creator metadata and its table shows creator
          and expiry fields. This is a recorded observation; query results can
          change.
        </p>
        <dl>
          <dt>Entity key</dt>
          <dd>
            <code>{working.entity.key}</code>
          </dd>
          <dt>Creator / owner at observation</dt>
          <dd>
            <code>{working.entity.creator}</code>
          </dd>
          <dt>Successful creation transaction</dt>
          <dd>
            <code>{working.creation.txHash}</code>
          </dd>
          <dt>Creation / expiry block</dt>
          <dd>
            {working.entity.createdAt} / {working.entity.expiresAt}
          </dd>
        </dl>
        <Link href={`/d/${working.entity.key}`}>
          Open populated public dashboard →
        </Link>
      </section>
      <h2>Historical dashboard creations</h2>
      <p>
        SDK 0.8.1 verified the entity metadata, exact-block creation event and
        successful receipt. Payload text is omitted. Both definitions retained a
        category=jose condition and returned zero in these observations.
      </p>
      <div className="proof-grid">
        {[firstReceipt, secondReceipt].map((proof) => (
          <section
            className="panel panel-body proof-card"
            key={proof.entity.key}
          >
            <h3>Creation receipt: {proof.creation.status}</h3>
            <p className="hint">Observed {observed(proof.observedAt)}</p>
            <dl>
              <dt>Entity key</dt>
              <dd>
                <code>{proof.entity.key}</code>
              </dd>
              <dt>Creator</dt>
              <dd>
                <code>{proof.entity.creator}</code>
              </dd>
              <dt>Current owner at observation</dt>
              <dd>
                <code>{proof.entity.owner}</code>
              </dd>
              <dt>Transaction hash</dt>
              <dd>
                <code>{proof.creation.txHash}</code>
              </dd>
              <dt>Creation / expiry block</dt>
              <dd>
                {proof.entity.createdAt} / {proof.entity.expiresAt}
              </dd>
              <dt>Saved-query page</dt>
              <dd>
                {proof.page.count} records at block {proof.page.blockNumber}
              </dd>
            </dl>
            <p className="notice">
              Historical definition · empty result at this observation.
            </p>
            <Link href={`/d/${proof.entity.key}`}>
              Inspect historical public reader →
            </Link>
          </section>
        ))}
      </div>
      <h2>A prepared public-records definition</h2>
      <section className="panel panel-body proof-card">
        <span className="tag">UNPUBLISHED FILE</span>
        <p>
          The reviewed example uses no filters, a 50-record page, a count KPI
          and a canonical creator/expiry table. It contains query and widget
          settings, not source data.
        </p>
        <p>
          Its preview observed {prepared.page.count} records at block{" "}
          {prepared.page.blockNumber}, {observed(prepared.observedAt)}. This is
          a page count; more records were available. No dashboard entity key or
          creation transaction exists for this file in the recorded evidence.
        </p>
        <a href="/api/examples/dashboard">
          Download prepared dashboard definition
        </a>
        <p className="hint">
          Import it in Dashboard builder, review the current results, and
          publish only after approving your wallet transaction. Export and
          import alone do not publish anything.
        </p>
      </section>
      <h2>Read without the ArkivSight website</h2>
      <section className="panel panel-body proof-card">
        <p>
          From a clone of the MIT repository, install dependencies and run the
          independent reader. The command validates a published definition and
          queries the public Tiramisu RPC directly. It needs no wallet, Next
          server, MCP route or private indexer.
        </p>
        <pre>
          npm ci{"\n"}npm run read:dashboard -- --key
          &lt;actual-dashboard-key&gt;
        </pre>
        <p>
          The reusable modules are the versioned definition validator, typed
          query compiler and chart transforms. The example lives at{" "}
          <code>examples/independent-reader</code>. New changes in this checkout
          require a reviewed source release; the baseline CI link above does not
          cover them.
        </p>
        <p>
          For receipt recovery, run{" "}
          <code>
            npm run verify:dashboard -- --key &lt;actual-dashboard-key&gt;
          </code>
          . For a separate website, serve{" "}
          <code>examples/independent-consumer/index.html</code> and enter the
          reviewed deployment origin and published key.
        </p>
        <p className="hint">
          The iframe depends on its app host. The standalone reader works
          independently of that host; both still need a functioning public Arkiv
          RPC.
        </p>
      </section>
    </main>
  );
}
