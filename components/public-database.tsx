"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { Database, ExternalLink, RefreshCw } from "lucide-react";
import { attributeText, runQuery, type Page, type Row } from "@/lib/arkiv";
import { publicQuery, type QuerySpec } from "@/lib/query";

const short = (value: string) => `${value.slice(0, 10)}…${value.slice(-6)}`;
export default function PublicDatabase({
  onInspect,
  onUseQuery,
}: {
  onInspect: (row: Row) => void;
  onUseQuery: (query: QuerySpec) => void;
}) {
  const [pages, setPages] = useState<Page[]>([]);
  const [index, setIndex] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [last, setLast] = useState("");
  const [revision, setRevision] = useState(0);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [cooldownUntil, setCooldownUntil] = useState(0);
  const nextAttempt = useRef(0);
  const active = useRef<AbortController | null>(null);
  const running = useRef(false);
  const failures = useRef(0);
  const page = pages[index];
  const refresh = useCallback(async (manual = false) => {
    if (
      running.current ||
      document.hidden ||
      (!manual && Date.now() < nextAttempt.current)
    )
      return;
    running.current = true;
    setBusy(true);
    active.current?.abort();
    const controller = new AbortController();
    active.current = controller;
    try {
      const result = await runQuery(publicQuery, controller.signal);
      if (controller.signal.aborted) return;
      setPages([result]);
      setIndex(0);
      setLast(new Date().toLocaleTimeString());
      setError("");
      failures.current = 0;
      nextAttempt.current = 0;
      setCooldownUntil(0);
    } catch (error) {
      if (controller.signal.aborted) return;
      failures.current++;
      const message =
        error instanceof Error
          ? error.message
          : "Public Arkiv data is unavailable";
      const limited = /ANON_COST_LIMITED|\b429\b/.test(message);
      const delay = Math.min(
        300000,
        (limited ? 60000 : 30000) * 2 ** Math.min(failures.current, 3),
      );
      nextAttempt.current = Date.now() + delay;
      if (limited) setCooldownUntil(nextAttempt.current);
      setError(
        limited
          ? "Arkiv’s public RPC has temporarily limited anonymous reads (HTTP 429). This does not require a wallet or Vercel login. Close unused live dashboard tabs and allow the cooldown to finish."
          : message,
      );
    } finally {
      if (active.current === controller) {
        running.current = false;
        if (!controller.signal.aborted) {
          setBusy(false);
          setRevision((value) => value + 1);
        }
      }
    }
  }, []);
  useEffect(() => {
    void refresh();
    return () => {
      active.current?.abort();
      running.current = false;
    };
  }, [refresh]);
  useEffect(() => {
    if (!cooldownUntil) return;
    const timer = setTimeout(
      () => setCooldownUntil(0),
      Math.max(0, cooldownUntil - Date.now()),
    );
    return () => clearTimeout(timer);
  }, [cooldownUntil]);
  useEffect(() => {
    if (index !== 0 || !autoRefresh) return;
    let timer: ReturnType<typeof setTimeout>;
    const schedule = () => {
      timer = setTimeout(
        () => {
          if (document.hidden || running.current) schedule();
          else void refresh();
        },
        Math.max(30000, nextAttempt.current - Date.now()),
      );
    };
    const visible = () => {
      if (!document.hidden) {
        clearTimeout(timer);
        if (!running.current && Date.now() >= nextAttempt.current)
          void refresh();
        else schedule();
      }
    };
    schedule();
    document.addEventListener("visibilitychange", visible);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", visible);
    };
  }, [index, revision, refresh, autoRefresh]);
  async function next() {
    if (!page || running.current) return;
    running.current = true;
    setBusy(true);
    try {
      const result = pages[index + 1] ?? (await page.next());
      if (active.current?.signal.aborted) return;
      setPages((current) =>
        current[index + 1] ? current : [...current, result],
      );
      setIndex((value) => value + 1);
      setError("");
    } catch {
      if (!active.current?.signal.aborted)
        setError(
          "This cursor is unavailable. Refresh public data to start a new snapshot.",
        );
    } finally {
      running.current = false;
      if (!active.current?.signal.aborted) setBusy(false);
    }
  }
  return (
    <section
      className="panel public-database"
      aria-label="Public Database records"
    >
      <div className="panel-head">
        <div>
          <Database size={18} />
          <h2>Public records</h2>
          <span className="count">{page?.entities.length ?? 0}</span>
        </div>
        <div>
          <button
            disabled={busy || !!cooldownUntil}
            onClick={() => void refresh(true)}
          >
            <RefreshCw size={14} />
            Refresh public data
          </button>
          <button disabled={busy} onClick={() => onUseQuery(publicQuery)}>
            Open in query studio
          </button>
        </div>
      </div>
      <div className="notice">
        Live public entities from Tiramisu across all publishers. No app,
        dataset or creator filter. Results load in pages of {publicQuery.limit};
        the number shown is this page’s count, not the database total. Testnet
        content is supplied by its publishers.
      </div>
      {error && (
        <div className="notice error" role="alert">
          {pages.length ? "Previous results may be stale. " : ""}
          {error.slice(0, 1600)} No simulated results are substituted.
          {!!cooldownUntil && (
            <p>
              Reads paused until {new Date(cooldownUntil).toLocaleTimeString()}.{" "}
              {autoRefresh
                ? "Automatic retry will follow."
                : "Refresh manually afterward."}
            </p>
          )}
        </div>
      )}
      {page?.entities.length ? (
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Entity key</th>
                <th>Indexed attributes</th>
                <th>Creator</th>
                <th>Owner</th>
                <th>Created / expires at block</th>
              </tr>
            </thead>
            <tbody>
              {page.entities.map((row) => (
                <tr key={row.key}>
                  <td>
                    <button
                      className="entity-link mono"
                      aria-label={`Inspect public entity ${row.key}`}
                      onClick={() => onInspect(row)}
                    >
                      {short(row.key)} <ExternalLink size={11} />
                    </button>
                  </td>
                  <td>
                    <div className="public-attributes">
                      {Object.entries(row.attributes)
                        .slice(0, 4)
                        .map(([name, value]) => (
                          <span
                            key={name}
                            title={`${name} (${value.type}): ${attributeText(value)}`}
                          >
                            <b>{name}</b> <small>{value.type}</small>{" "}
                            {attributeText(value)}
                          </span>
                        ))}
                      {!Object.keys(row.attributes).length && (
                        <span>No custom attributes</span>
                      )}
                      {Object.keys(row.attributes).length > 4 && (
                        <small>
                          +{Object.keys(row.attributes).length - 4} more ·
                          inspect entity
                        </small>
                      )}
                    </div>
                  </td>
                  <td className="mono" title={row.creator}>
                    {short(row.creator)}
                  </td>
                  <td className="mono" title={row.owner}>
                    {short(row.owner)}
                  </td>
                  <td className="mono">
                    {String(row.createdAt)}
                    <small>{String(row.expiresAt)}</small>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty">
          <Database size={28} />
          <h3>
            {error
              ? "Public read unavailable"
              : busy
                ? "Reading public Arkiv records…"
                : "No public entities returned"}
          </h3>
          <p>Reads need no wallet. Only live network results appear here.</p>
        </div>
      )}
      <div className="results-footer">
        <span>
          {page
            ? `Snapshot block ${page.blockNumber} · Page ${index + 1} · ${page.entities.length} records on this page`
            : "Awaiting public network data"}
          {last ? ` · Updated ${last}` : ""}
          <br />
          {cooldownUntil
            ? "Rate-limit cooldown · no reads during cooldown"
            : !autoRefresh
              ? "Auto-refresh paused"
              : index
                ? "Auto-refresh paused while browsing cursor pages"
                : "Refresh every 30 seconds · pauses while hidden"}
        </span>
        <div>
          <label>
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(event) => setAutoRefresh(event.target.checked)}
            />{" "}
            Auto-refresh public records
          </label>
          <button
            disabled={busy || !index}
            onClick={() => setIndex((value) => value - 1)}
          >
            Previous public page
          </button>
          <button
            disabled={busy || !!cooldownUntil || !page?.hasNextPage()}
            onClick={() => void next()}
          >
            Next public page
          </button>
        </div>
      </div>
    </section>
  );
}
