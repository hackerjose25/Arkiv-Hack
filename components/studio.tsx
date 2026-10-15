"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Activity,
  ArrowDown,
  ArrowUp,
  BarChart3,
  Braces,
  ChevronRight,
  CircleHelp,
  Code2,
  Database,
  ExternalLink,
  LayoutDashboard,
  Layers3,
  Play,
  Plus,
  Search,
  Trash2,
  Wallet,
  X,
} from "lucide-react";
import {
  attributeText,
  inspectEntity,
  runQuery,
  type Page,
  type Row,
} from "@/lib/arkiv";
import {
  compileQuery,
  publicQuery,
  type Filter,
  type QuerySpec,
} from "@/lib/query";
import {
  dashboardSchema,
  defaultWidget,
  embedSnippet,
  widgetSchema,
  type Widget,
} from "@/lib/dashboard";
import { connectWallet, publishDashboard } from "@/lib/wallet";
import Chart from "./chart";
import PublicDatabase from "./public-database";
import McpObservationPanel from "./mcp-observation";

const short = (s: string) => `${s.slice(0, 8)}…${s.slice(-6)}`;
export default function Studio() {
  const [section, setSection] = useState<"public" | "query" | "dashboard">(
    "public",
  );
  const [query, setQuery] = useState<QuerySpec>(publicQuery);
  const [page, setPage] = useState<Page>();
  const [pages, setPages] = useState<Page[]>([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [executed, setExecuted] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [last, setLast] = useState("");
  const [view, setView] = useState<"table" | "chart">("table");
  const [widget, setWidget] = useState<Widget>(defaultWidget);
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [editingId, setEditingId] = useState<string>();
  const [title, setTitle] = useState("Untitled dashboard");
  const [description, setDescription] = useState("");
  const refresh = 30;
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [account, setAccount] = useState("");
  const [publishing, setPublishing] = useState(false);
  const [publication, setPublication] = useState<{
    entityKey: string;
    txHash: string;
  }>();
  const [detail, setDetail] = useState<{ row: Row; text?: string }>();
  const [detailError, setDetailError] = useState("");
  const [sort, setSort] = useState("");
  const [sortDesc, setSortDesc] = useState(false);
  const [recovery, setRecovery] = useState("");
  const active = useRef<AbortController | null>(null);
  const requestBusy = useRef(false);
  useEffect(() => {
    requestBusy.current = busy;
  }, [busy]);
  const detailRequest = useRef<AbortController | null>(null);
  const detailDialog = useRef<HTMLDialogElement | null>(null);
  const detailTrigger = useRef<HTMLElement | null>(null);
  const detailOpen = !!detail;
  useEffect(() => {
    if (!detailOpen) return;
    const previous = detailTrigger.current;
    const dialog = detailDialog.current;
    dialog?.showModal();
    dialog?.querySelector<HTMLButtonElement>("button")?.focus();
    return () => {
      dialog?.close();
      previous?.focus();
    };
  }, [detailOpen]);
  useEffect(() => {
    const provider = window.ethereum;
    const reset = () => setAccount("");
    provider?.on("accountsChanged", reset);
    provider?.on("chainChanged", reset);
    provider?.on("disconnect", reset);
    return () => {
      active.current?.abort();
      detailRequest.current?.abort();
      provider?.removeListener("accountsChanged", reset);
      provider?.removeListener("chainChanged", reset);
      provider?.removeListener("disconnect", reset);
    };
  }, []);
  let compiled = "";
  let validation = "";
  try {
    compiled = compileQuery(query);
  } catch (e) {
    validation = e instanceof Error ? e.message : "Invalid query";
  }
  const fields = useMemo(() => {
    const map = new Map<string, Set<string>>();
    for (const row of page?.entities ?? [])
      for (const [name, a] of Object.entries(row.attributes)) {
        if (!map.has(name)) map.set(name, new Set());
        map.get(name)!.add(a.type);
      }
    return [...map.entries()];
  }, [page]);
  const rows = useMemo(() => {
    const result = [...(page?.entities ?? [])];
    if (sort)
      result.sort((a, b) => {
        const av = a.attributes[sort]?.value,
          bv = b.attributes[sort]?.value;
        const order =
          typeof av === "bigint" && typeof bv === "bigint"
            ? av < bv
              ? -1
              : av > bv
                ? 1
                : 0
            : typeof av === "number" && typeof bv === "number"
              ? av - bv
              : String(av ?? "").localeCompare(String(bv ?? ""));
        return sortDesc ? -order : order;
      });
    return result;
  }, [page, sort, sortDesc]);
  const changed = executed !== JSON.stringify(query);
  useEffect(() => {
    if (
      !autoRefresh ||
      !executed ||
      executed !== JSON.stringify(query) ||
      pageIndex !== 0
    )
      return;
    let stopped = false;
    let failures = 0;
    let controller: AbortController | undefined;
    let timer: ReturnType<typeof setTimeout>;
    async function poll() {
      if (document.hidden || requestBusy.current) {
        timer = setTimeout(poll, 30000);
        return;
      }
      controller = new AbortController();
      active.current = controller;
      setBusy(true);
      requestBusy.current = true;
      try {
        const result = await runQuery(query, controller.signal);
        if (stopped || controller.signal.aborted) return;
        setPage(result);
        setPages([result]);
        setLast(new Date().toLocaleTimeString());
        setError("");
        failures = 0;
      } catch (error) {
        if (stopped || controller.signal.aborted) return;
        failures++;
        setError(
          `Refresh failed; previous results may be stale. ${error instanceof Error ? error.message : "Network unavailable"}`,
        );
      } finally {
        if (!stopped && !controller.signal.aborted) {
          setBusy(false);
          requestBusy.current = false;
        }
        if (!stopped)
          timer = setTimeout(
            poll,
            Math.min(300000, 30000 * 2 ** Math.min(failures, 3)),
          );
      }
    }
    const visible = () => {
      if (!document.hidden && !requestBusy.current) {
        clearTimeout(timer);
        void poll();
      }
    };
    timer = setTimeout(poll, 30000);
    document.addEventListener("visibilitychange", visible);
    return () => {
      stopped = true;
      controller?.abort();
      clearTimeout(timer);
      requestBusy.current = false;
      setBusy(false);
      document.removeEventListener("visibilitychange", visible);
    };
  }, [autoRefresh, executed, query, pageIndex]);
  async function execute(spec: QuerySpec = query) {
    active.current?.abort();
    const controller = new AbortController();
    active.current = controller;
    setBusy(true);
    setError("");
    setPage(undefined);
    setPages([]);
    try {
      const result = await runQuery(spec, controller.signal);
      if (controller.signal.aborted) return;
      setPage(result);
      setPages([result]);
      setPageIndex(0);
      setExecuted(JSON.stringify(spec));
      setLast(new Date().toLocaleTimeString());
    } catch (e) {
      if (!controller.signal.aborted)
        setError(e instanceof Error ? e.message : "RPC request failed");
    } finally {
      if (!controller.signal.aborted) setBusy(false);
    }
  }
  async function next() {
    if (!page || busy) return;
    setBusy(true);
    setError("");
    try {
      const p = pages[pageIndex + 1] ?? (await page.next());
      setPages(pages[pageIndex + 1] ? pages : [...pages, p]);
      setPageIndex(pageIndex + 1);
      setPage(p);
    } catch (e) {
      setError(
        `Pagination failed. Run the query again. ${e instanceof Error ? e.message : ""}`,
      );
    } finally {
      setBusy(false);
    }
  }
  function editFilter(index: number, patch: Partial<Filter>) {
    setQuery({
      ...query,
      filters: query.filters.map((f, i) =>
        i === index ? { ...f, ...patch } : f,
      ),
    });
  }
  async function inspect(row: Row) {
    detailTrigger.current = document.activeElement as HTMLElement | null;
    detailRequest.current?.abort();
    const controller = new AbortController();
    detailRequest.current = controller;
    setDetail({ row });
    setDetailError("");
    try {
      const result = await inspectEntity(row.key, controller.signal);
      if (!controller.signal.aborted) setDetail({ row, text: result.text });
    } catch (e) {
      if (!controller.signal.aborted)
        setDetailError(e instanceof Error ? e.message : "Cannot read payload");
    }
  }
  async function connect() {
    try {
      setAccount((await connectWallet()).account);
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Wallet connection failed");
    }
  }
  async function publish() {
    setPublishing(true);
    setError("");
    try {
      const spec = dashboardSchema.parse({
        version: 1,
        network: "tiramisu",
        title,
        description,
        query,
        widgets,
        refreshSeconds: refresh,
        createdAt: new Date().toISOString(),
      });
      setPublication(await publishDashboard(spec));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Publication failed");
    } finally {
      setPublishing(false);
    }
  }
  function addWidget() {
    if (editingId) {
      setWidgets(
        widgets.map((w) => (w.id === editingId ? { ...widget, id: w.id } : w)),
      );
      setEditingId(undefined);
      setSection("dashboard");
      return;
    }
    if (widgets.length >= 8) return;
    setWidgets([
      ...widgets,
      { ...widget, id: crypto.randomUUID().slice(0, 8) },
    ]);
    setSection("dashboard");
  }
  return (
    <div className="shell">
      <aside className="sidebar">
        <a href="/" className="brand">
          <span className="brand-mark">
            <Layers3 size={23} />
          </span>
          <span>
            ArkivSight<small>QUERY-TO-DASHBOARD</small>
          </span>
        </a>
        <div className="workspace">
          <span className="workspace-icon">A</span>
          <div>
            Personal workspace<small>Open source studio</small>
          </div>
          <ChevronRight size={14} />
        </div>
        <span className="eyebrow nav-label">WORKSPACE</span>
        <nav>
          <button
            className={section === "public" ? "selected" : ""}
            onClick={() => setSection("public")}
          >
            <Database size={18} />
            Public Database
          </button>
          <button
            className={section === "query" ? "selected" : ""}
            onClick={() => setSection("query")}
          >
            <Database size={18} />
            Query studio
            <span className="nav-dot" />
          </button>
          <button
            className={section === "dashboard" ? "selected" : ""}
            onClick={() => setSection("dashboard")}
          >
            <LayoutDashboard size={18} />
            Dashboard builder<span className="count">{widgets.length}</span>
          </button>
        </nav>
        <div className="sidebar-rule" />
        <span className="eyebrow nav-label">DATA SOURCES</span>
        <button
          className="source"
          onClick={() => {
            setSection("public");
          }}
        >
          <span className="source-dot" />
          <span>
            Tiramisu testnet<small>Arkiv public RPC</small>
          </span>
        </button>
        <div className="sidebar-bottom">
          <div className="open-card">
            <Code2 size={20} />
            <strong>Your data. Your dashboard.</strong>
            <p>
              Open source. Direct to Arkiv.
              <br />
              No private indexer.
            </p>
            <a
              href="https://github.com/hackerjose25/Arkiv-Hack"
              target="_blank"
              rel="noreferrer"
            >
              View source <ExternalLink size={12} />
            </a>
          </div>
          <a
            href="https://docs.arkiv.network"
            target="_blank"
            rel="noreferrer"
            className="help"
          >
            <CircleHelp size={16} />
            Documentation
            <ExternalLink size={12} />
          </a>
          <div className="version">
            ARKIVSIGHT <span>v0.1 / SDK 0.8.1</span>
          </div>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <div className="breadcrumb">
            Workspace <ChevronRight size={13} />
            <span>
              {section === "public"
                ? "Public Database"
                : section === "query"
                  ? "Query studio"
                  : "Dashboard builder"}
            </span>
          </div>
          <div className="top-actions">
            <span className="network">
              <i />
              Tiramisu testnet
            </span>
            <button onClick={connect}>
              <Wallet size={15} />
              {account ? short(account) : "Connect wallet"}
            </button>
          </div>
        </header>
        <main className="main-content">
          <div className="page-title">
            <div>
              <div className="eyebrow">EXPLORE. UNDERSTAND. BUILD.</div>
              <h1>
                {section === "public"
                  ? "Public Database"
                  : section === "query"
                    ? "From query to clarity."
                    : "Make your data useful."}
              </h1>
              <p>
                {section === "public"
                  ? "Browse live public records across Arkiv Tiramisu. No wallet needed."
                  : section === "query"
                    ? "Explore public Arkiv data and turn it into something worth sharing."
                    : "Compose a dashboard. Publish its definition with your wallet."}
              </p>
            </div>
            <a
              className="quiet-link"
              href="https://hub.arkiv.network/faucet"
              target="_blank"
              rel="noreferrer"
            >
              Testnet faucet <ExternalLink size={13} />
            </a>
          </div>
          {error && (
            <div className="notice error" role="alert">
              <strong>Action could not complete</strong>
              <p>{error.slice(0, 1600)}</p>
              <span>No simulated results are substituted.</span>
            </div>
          )}
          {section === "public" ? (
            <PublicDatabase
              onInspect={inspect}
              onUseQuery={(spec) => {
                setQuery(spec);
                setSection("query");
                void execute(spec);
              }}
            />
          ) : section === "query" ? (
            <>
              <div className="studio-grid">
                <section className="panel query-panel">
                  <div className="panel-head">
                    <div>
                      <Braces size={17} />
                      <h2>Query builder</h2>
                    </div>
                    <span className="tag">NO CODE</span>
                  </div>
                  <div className="panel-body">
                    <div className="query-intro">
                      <span className="eyebrow">FILTERS</span>
                      <span>
                        Match <b>all</b> conditions
                      </span>
                    </div>
                    {query.filters.length > 0 && (
                      <div className="filter-labels">
                        <span>Indexed attribute</span>
                        <span>Type</span>
                        <span>Operator</span>
                        <span>Value</span>
                      </div>
                    )}
                    {!query.filters.length && (
                      <div className="notice">
                        No filters. All currently available public entities are
                        eligible; results load one page at a time.
                      </div>
                    )}
                    {query.filters.map((f, i) => (
                      <div className="filter-row" key={i}>
                        <input
                          aria-label={`Attribute ${i + 1}`}
                          list="attributes"
                          value={f.field}
                          onChange={(e) =>
                            editFilter(i, { field: e.target.value })
                          }
                        />
                        <select
                          aria-label={`Type ${i + 1}`}
                          value={f.type}
                          onChange={(e) =>
                            editFilter(i, {
                              type: e.target.value as Filter["type"],
                            })
                          }
                        >
                          {[
                            "str",
                            "i32",
                            "u64",
                            "u256",
                            "dec",
                            "bool",
                            "addr",
                            "key",
                          ].map((t) => (
                            <option key={t}>{t}</option>
                          ))}
                        </select>
                        <select
                          aria-label={`Operator ${i + 1}`}
                          value={f.op}
                          onChange={(e) =>
                            editFilter(i, {
                              op: e.target.value as Filter["op"],
                            })
                          }
                        >
                          {Object.entries({
                            eq: "equals",
                            gt: ">",
                            gte: "≥",
                            lt: "<",
                            lte: "≤",
                            prefix: "starts with",
                          }).map(([k, v]) => (
                            <option value={k} key={k}>
                              {v}
                            </option>
                          ))}
                        </select>
                        <input
                          aria-label={`Value ${i + 1}`}
                          value={f.value}
                          onChange={(e) =>
                            editFilter(i, { value: e.target.value })
                          }
                        />
                        <button
                          className="icon-button"
                          aria-label={`Remove filter ${i + 1}`}
                          onClick={() =>
                            setQuery({
                              ...query,
                              filters: query.filters.filter((_, j) => i !== j),
                            })
                          }
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                    <datalist id="attributes">
                      {fields.map(([name]) => (
                        <option key={name}>{name}</option>
                      ))}
                    </datalist>
                    <button
                      className="text-button"
                      disabled={query.filters.length >= 12}
                      onClick={() =>
                        setQuery({
                          ...query,
                          filters: [
                            ...query.filters,
                            {
                              field: "category",
                              type: "str",
                              op: "eq",
                              value: "",
                            },
                          ],
                        })
                      }
                    >
                      <Plus size={15} />
                      Add condition
                    </button>
                    <button
                      className="text-button"
                      disabled={!query.filters.length}
                      onClick={() => setQuery({ ...query, filters: [] })}
                    >
                      Clear all filters
                    </button>
                    <div className="query-options">
                      <label>
                        Page size{" "}
                        <select
                          aria-label="Page size"
                          value={query.limit}
                          onChange={(e) =>
                            setQuery({
                              ...query,
                              limit: Number(e.target.value),
                            })
                          }
                        >
                          {[10, 25, 50, 100].map((n) => (
                            <option key={n}>{n}</option>
                          ))}
                        </select>
                      </label>
                      <span>Indexed attributes only · AND filters</span>
                    </div>
                    <div className="query-code">
                      <span className="eyebrow">ARKIV EXPRESSION</span>
                      <code>{validation || compiled}</code>
                    </div>
                    <div className="query-bottom">
                      <span>
                        <Activity size={13} />
                        Direct network query
                      </span>
                      <button
                        className="primary"
                        disabled={busy || !!validation}
                        onClick={() => void execute()}
                      >
                        <Play size={14} />
                        {busy ? "Querying…" : "Run query"}
                      </button>
                    </div>
                  </div>
                </section>
                <section className="panel schema-panel">
                  <div className="panel-head">
                    <div>
                      <Database size={17} />
                      <h2>Attribute explorer</h2>
                    </div>
                    <span className="count">{fields.length}</span>
                  </div>
                  <p className="hint">
                    Schema inferred from the current page. Payload fields are
                    not indexed.
                  </p>
                  {fields.length ? (
                    <div className="schema-list">
                      {fields.map(([name, types]) => (
                        <button
                          key={name}
                          onClick={() => {
                            if (
                              query.filters.length < 12 &&
                              [
                                "str",
                                "i32",
                                "u64",
                                "u256",
                                "dec",
                                "bool",
                                "addr",
                                "key",
                              ].includes([...types][0])
                            )
                              setQuery({
                                ...query,
                                filters: [
                                  ...query.filters,
                                  {
                                    field: name,
                                    type: [...types][0] as Filter["type"],
                                    op: "eq",
                                    value: "",
                                  },
                                ],
                              });
                          }}
                        >
                          <span className="mono">{name}</span>
                          <span className="type">{[...types].join(" | ")}</span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="empty compact">
                      <Search size={28} />
                      <strong>Discover your schema</strong>
                      <p>
                        Run a query to inspect the typed attributes in your
                        results.
                      </p>
                    </div>
                  )}
                  <div className="schema-note">
                    <span className="source-dot" />
                    Public reads need no wallet
                  </div>
                </section>
              </div>
              <section className="panel results">
                <div className="panel-head">
                  <div>
                    <h2>Query results</h2>
                    <span className="count">{rows.length}</span>
                    {last && <span className="hint">Updated {last}</span>}
                  </div>
                  <div className="tabs">
                    <button
                      className={view === "table" ? "active" : ""}
                      onClick={() => setView("table")}
                    >
                      <Database size={14} />
                      Table
                    </button>
                    <button
                      className={view === "chart" ? "active" : ""}
                      onClick={() => setView("chart")}
                    >
                      <BarChart3 size={14} />
                      Visualize
                    </button>
                  </div>
                </div>
                {changed && page && (
                  <div className="notice">
                    Filters changed. Run the query to update these results.
                  </div>
                )}
                {view === "table" ? (
                  <>
                    {rows.length ? (
                      <div className="table-scroll">
                        <table>
                          <thead>
                            <tr>
                              <th>Entity key</th>
                              {fields.slice(0, 7).map(([f]) => (
                                <th key={f}>
                                  <button
                                    onClick={() => {
                                      setSort(f);
                                      setSortDesc(
                                        sort === f ? !sortDesc : false,
                                      );
                                    }}
                                  >
                                    {f}
                                    {sort === f ? (
                                      sortDesc ? (
                                        <ArrowDown size={12} />
                                      ) : (
                                        <ArrowUp size={12} />
                                      )
                                    ) : null}
                                  </button>
                                </th>
                              ))}
                              <th>Creator / owner</th>
                            </tr>
                          </thead>
                          <tbody>
                            {rows.map((row) => (
                              <tr key={row.key}>
                                <td>
                                  <button
                                    className="entity-link mono"
                                    onClick={() => inspect(row)}
                                  >
                                    {short(row.key)} <ExternalLink size={11} />
                                  </button>
                                </td>
                                {fields.slice(0, 7).map(([f]) => (
                                  <td
                                    key={f}
                                    title={attributeText(row.attributes[f])}
                                  >
                                    {attributeText(row.attributes[f])}
                                  </td>
                                ))}
                                <td className="mono">
                                  <span title={row.creator}>
                                    {short(row.creator)}
                                  </span>
                                  <small title={row.owner}>
                                    {short(row.owner)}
                                  </small>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="empty result-empty">
                        <div className="empty-orbit">
                          <Database size={27} />
                        </div>
                        <h3>
                          {busy
                            ? "Reading Tiramisu…"
                            : error
                              ? "Network read unavailable"
                              : page
                                ? "No matching entities"
                                : "Your next insight starts here"}
                        </h3>
                        <p>
                          {page
                            ? "Try a different indexed value, type, or public dataset."
                            : "Build your filters above, then run a query against Arkiv."}
                        </p>
                        <span className="tag">
                          REAL DATA ONLY · NO WALLET REQUIRED
                        </span>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="visualize">
                    <div className="chart-controls">
                      <label>
                        Chart
                        <select
                          value={widget.type}
                          onChange={(e) =>
                            setWidget({
                              ...widget,
                              type: e.target.value as Widget["type"],
                            })
                          }
                        >
                          {["bar", "line", "kpi", "table"].map((t) => (
                            <option key={t}>{t}</option>
                          ))}
                        </select>
                      </label>
                      <label>
                        Group by
                        <input
                          list="attributes"
                          value={widget.groupBy}
                          onChange={(e) =>
                            setWidget({ ...widget, groupBy: e.target.value })
                          }
                        />
                      </label>
                      <label>
                        Measure
                        <input
                          list="attributes"
                          value={widget.measure}
                          onChange={(e) =>
                            setWidget({ ...widget, measure: e.target.value })
                          }
                        />
                      </label>
                      <label>
                        Aggregate
                        <select
                          value={widget.aggregation}
                          onChange={(e) =>
                            setWidget({
                              ...widget,
                              aggregation: e.target
                                .value as Widget["aggregation"],
                            })
                          }
                        >
                          {["sum", "average", "count"].map((t) => (
                            <option key={t}>{t}</option>
                          ))}
                        </select>
                      </label>
                      <label>
                        Widget title
                        <input
                          value={widget.title}
                          maxLength={80}
                          onChange={(e) =>
                            setWidget({ ...widget, title: e.target.value })
                          }
                        />
                      </label>
                      <button
                        onClick={addWidget}
                        disabled={
                          !page ||
                          changed ||
                          !widgetSchema.safeParse(widget).success ||
                          (!editingId && widgets.length >= 8)
                        }
                      >
                        <Plus size={14} />
                        {editingId ? "Save widget changes" : "Add to dashboard"}
                      </button>
                      {editingId && (
                        <button
                          onClick={() => {
                            setEditingId(undefined);
                            setWidget(defaultWidget);
                            setSection("dashboard");
                          }}
                        >
                          Cancel widget editing
                        </button>
                      )}
                    </div>
                    <Chart rows={rows} widget={widget} />
                  </div>
                )}
                <div className="results-footer">
                  <span>
                    {page
                      ? `Snapshot block ${page.blockNumber} · Page ${pageIndex + 1}`
                      : "Awaiting first query"}{" "}
                    · Aggregations and sorting: current page only
                  </span>
                  <div>
                    <button
                      disabled={busy || pageIndex === 0 || changed}
                      onClick={() => {
                        setPageIndex(pageIndex - 1);
                        setPage(pages[pageIndex - 1]);
                      }}
                    >
                      Previous
                    </button>
                    <button
                      disabled={busy || !page?.hasNextPage() || changed}
                      onClick={next}
                    >
                      Next page <ChevronRight size={13} />
                    </button>
                  </div>
                </div>
              </section>
              <label className="consent">
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(event) => setAutoRefresh(event.target.checked)}
                />
                Refresh every 30 seconds · pauses while hidden, while filters
                change, and on later cursor pages
              </label>
              {page?.entities[0] && (
                <McpObservationPanel entityKey={page.entities[0].key} />
              )}
            </>
          ) : (
            <>
              <section className="panel">
                <div className="panel-head">
                  <h2>Dashboard definition</h2>
                  <span className="tag">WALLET-OWNED · PUBLIC</span>
                </div>
                <div className="dashboard-settings">
                  <label>
                    Title
                    <input
                      value={title}
                      maxLength={100}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </label>
                  <label>
                    Description
                    <input
                      value={description}
                      maxLength={500}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </label>
                  <label>
                    Refresh seconds
                    <input
                      type="number"
                      min={30}
                      max={3600}
                      value={refresh}
                      readOnly
                    />
                  </label>
                </div>
                <div className="notice">
                  All widgets use the current query. Publishing stores its
                  filters, layout order and widget settings publicly on Tiramisu
                  for approximately 90 days. Review the wallet’s test GLM fee
                  before approving.
                </div>
                <div className="query-bottom">
                  <button onClick={() => setSection("query")}>
                    <Plus size={14} />
                    Configure a widget
                  </button>
                  <button
                    className="primary"
                    disabled={publishing || !widgets.length || !!validation}
                    onClick={publish}
                  >
                    <Wallet size={14} />
                    {publishing
                      ? "Awaiting wallet / read-back…"
                      : "Publish dashboard"}
                  </button>
                </div>
              </section>
              <div className="dashboard-grid">
                {widgets.map((w, i) => (
                  <section className="panel" key={w.id}>
                    <div className="panel-head">
                      <h2>{w.title}</h2>
                      <div>
                        <button
                          aria-label={`Edit ${w.title}`}
                          onClick={() => {
                            setWidget(w);
                            setEditingId(w.id);
                            setView("chart");
                            setSection("query");
                          }}
                        >
                          Edit
                        </button>
                        <button
                          aria-label={`Move ${w.title} up`}
                          disabled={!i}
                          onClick={() => {
                            const copy = [...widgets];
                            [copy[i - 1], copy[i]] = [copy[i], copy[i - 1]];
                            setWidgets(copy);
                          }}
                        >
                          <ArrowUp size={14} />
                        </button>
                        <button
                          aria-label={`Remove ${w.title}`}
                          onClick={() =>
                            setWidgets(widgets.filter((x) => x.id !== w.id))
                          }
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    <Chart rows={rows} widget={w} />
                    <p className="hint">
                      Preview: current fetched page
                      {changed
                        ? " · Query changed; refresh preview in Query studio"
                        : ""}
                    </p>
                  </section>
                ))}
              </div>
              {!widgets.length && (
                <div className="empty panel">
                  <LayoutDashboard size={32} />
                  <h3>A blank canvas for your data</h3>
                  <p>
                    Choose Visualize in Query studio, configure a chart, and add
                    it here.
                  </p>
                </div>
              )}
              {publication && (
                <section className="panel panel-body">
                  <h2>Published and read back</h2>
                  <a href={`/d/${publication.entityKey}`} target="_blank">
                    Open public dashboard <ExternalLink size={14} />
                  </a>
                  <p className="mono">Entity: {publication.entityKey}</p>
                  <a
                    href={`https://tiramisu.explorer.arkiv.network/tx/${publication.txHash}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Transaction: {publication.txHash}
                  </a>
                  <pre>
                    {embedSnippet(
                      window.location.origin,
                      publication.entityKey,
                    )}
                  </pre>
                </section>
              )}
              <button
                onClick={() => {
                  const entries = Object.keys(localStorage).filter((k) =>
                    k.startsWith("arkivsight:publish:"),
                  );
                  setRecovery(
                    entries.map((k) => localStorage.getItem(k)).join("\n") ||
                      "No unresolved publication in this browser.",
                  );
                }}
              >
                Publication recovery
              </button>
              {recovery && <pre className="panel panel-body">{recovery}</pre>}
            </>
          )}
          <footer className="main-footer">
            <span>
              <span className="source-dot" />
              Built on Arkiv. Owned by you.
            </span>
            <span>Independent open-source tool · Testnet data can expire</span>
          </footer>
        </main>
      </div>
      {detail && (
        <dialog
          ref={detailDialog}
          className="modal-backdrop"
          aria-label="Entity details"
          onKeyDown={(event) => {
            if (event.key === "Tab") {
              event.preventDefault();
              detailDialog.current
                ?.querySelector<HTMLButtonElement>("button")
                ?.focus();
            }
          }}
          onCancel={() => {
            detailRequest.current?.abort();
            setDetail(undefined);
          }}
          onClick={() => {
            detailRequest.current?.abort();
            setDetail(undefined);
          }}
        >
          <section
            className="detail panel"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="panel-head">
              <h2>Entity details</h2>
              <button
                autoFocus
                aria-label="Close entity details"
                onClick={() => {
                  detailRequest.current?.abort();
                  setDetail(undefined);
                }}
              >
                <X size={18} />
              </button>
            </div>
            <div className="panel-body">
              <dl>
                {Object.entries({
                  Key: detail.row.key,
                  Creator: detail.row.creator,
                  Owner: detail.row.owner,
                  "Created at block": String(detail.row.createdAt),
                  "Expires at block": String(detail.row.expiresAt),
                }).map(([k, v]) => (
                  <div key={k}>
                    <dt>{k}</dt>
                    <dd className="mono">{v}</dd>
                  </div>
                ))}
              </dl>
              <h3>Indexed attributes</h3>
              <pre>
                {JSON.stringify(
                  detail.row.attributes,
                  (_, v) => (typeof v === "bigint" ? v.toString() : v),
                  2,
                )}
              </pre>
              <h3>Payload · untrusted text</h3>
              <pre>{detailError || detail.text || "Loading payload…"}</pre>
            </div>
          </section>
        </dialog>
      )}
    </div>
  );
}
