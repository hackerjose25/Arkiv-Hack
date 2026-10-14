"use client";
import { useEffect, useState } from "react";
import { publicClient, runQuery, type Row } from "@/lib/arkiv";
import {
  decodeDashboard,
  entityKeySchema,
  type Dashboard,
} from "@/lib/dashboard";
import Chart from "./chart";
export default function PublicDashboard({
  entityKey,
  embed = false,
  widgetId,
}: {
  entityKey: string;
  embed?: boolean;
  widgetId?: string;
}) {
  const [spec, setSpec] = useState<Dashboard>();
  const [rows, setRows] = useState<readonly Row[]>([]);
  const [error, setError] = useState("");
  const [last, setLast] = useState("");
  const [creator, setCreator] = useState("");
  useEffect(() => {
    const controller = new AbortController();
    let timer: ReturnType<typeof setTimeout>;
    let failures = 0;
    let running = false;
    let closed = false;
    async function refresh() {
      if (running || closed) return;
      if (document.hidden) {
        timer = setTimeout(refresh, 30000);
        return;
      }
      running = true;
      try {
        const valid = entityKeySchema.parse(entityKey) as `0x${string}`;
        const entity = await publicClient(controller.signal).getEntity(valid);
        if (
          entity.attributes.app?.value !== "arkivsight" ||
          entity.attributes.kind?.value !== "dashboard" ||
          entity.attributes.schema_version?.value !== 1 ||
          entity.contentType !== "application/json"
        )
          throw new Error("This entity is not an ArkivSight v1 dashboard");
        const parsed = decodeDashboard(entity.payload);
        if (widgetId && !parsed.widgets.some((w) => w.id === widgetId))
          throw new Error("Widget not found in this dashboard");
        const page = await runQuery(parsed.query, controller.signal);
        if (closed) return;
        setSpec(parsed);
        setRows(page.entities);
        setCreator(entity.creator);
        setLast(new Date().toLocaleTimeString());
        setError("");
        failures = 0;
        timer = setTimeout(refresh, parsed.refreshSeconds * 1000);
      } catch (e) {
        if (closed) return;
        setError(e instanceof Error ? e.message : "Unable to load dashboard");
        failures++;
        timer = setTimeout(
          refresh,
          Math.min(300000, 30000 * 2 ** Math.min(failures, 3)),
        );
      } finally {
        running = false;
      }
    }
    const visible = () => {
      if (!document.hidden && !running) {
        clearTimeout(timer);
        void refresh();
      }
    };
    void refresh();
    document.addEventListener("visibilitychange", visible);
    return () => {
      closed = true;
      controller.abort();
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", visible);
    };
  }, [entityKey, widgetId]);
  return (
    <main className={`public-page ${embed ? "embedded" : ""}`}>
      <header>
        <a className="brand" href="/">
          ◈ <span>ArkivSight</span>
        </a>
        <span className="network">Tiramisu · public read</span>
      </header>
      {!embed && (
        <>
          <h1>{spec?.title ?? "Public dashboard"}</h1>
          <p className="muted">
            {spec?.description ??
              "Loading a wallet-owned definition directly from Arkiv…"}
          </p>
        </>
      )}
      {error && (
        <div role="alert" className="notice error">
          {last ? "Stale data. " : ""}
          {error}
        </div>
      )}
      <div className="dashboard-grid">
        {spec?.widgets
          .filter((w) => !widgetId || w.id === widgetId)
          .map((w) => (
            <section className="panel" key={w.id}>
              <div className="panel-head">
                <h2>{w.title}</h2>
                <span className="tag">Current page</span>
              </div>
              <Chart rows={rows} widget={w} />
            </section>
          ))}
      </div>
      <footer>
        Direct Arkiv reads · {rows.length} rows on current page
        {last ? ` · Updated ${last}` : ""}
        {creator && <p className="mono">Creator: {creator}</p>}
        <p>
          Polling pauses while hidden. Expired or deleted definitions may become
          unavailable.
        </p>
      </footer>
    </main>
  );
}
