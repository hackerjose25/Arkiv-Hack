"use client";
import { useState } from "react";
import { seedDemo } from "@/lib/wallet";
export default function SeedPanel() {
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [evidence, setEvidence] = useState("");
  async function seed() {
    setBusy(true);
    setError("");
    try {
      const results = await seedDemo();
      setEvidence(JSON.stringify(results, null, 2));
      setReady(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Seed failed");
    } finally {
      setBusy(false);
    }
  }
  return (
    <details className="panel seed-panel">
      <summary>Need a dataset? Publish synthetic demo metrics</summary>
      <div className="panel-body">
        <p className="muted">
          Creates 12 synthetic records in one wallet-approved Tiramisu
          transaction. Indexed fields: category, region, period, value,
          sequence. Records expire after approximately 30 days. This is a public
          test dataset with no personal data.
        </p>
        <label className="consent">
          <input
            type="checkbox"
            checked={ready}
            onChange={(e) => setReady(e.target.checked)}
          />
          I want to publish these 12 records and will review the test GLM fee in
          my wallet.
        </label>
        <button disabled={!ready || busy || !!evidence} onClick={seed}>
          {busy
            ? "Awaiting wallet and read-back…"
            : "Sign synthetic dataset transaction"}
        </button>
        {error && (
          <div className="notice error" role="alert">
            {error}
          </div>
        )}
        {evidence && (
          <>
            <p>
              Transaction confirmed and all 12 records read back. Run the demo
              query above.
            </p>
            <pre>{evidence}</pre>
          </>
        )}
      </div>
    </details>
  );
}
