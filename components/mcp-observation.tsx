"use client";
import { useEffect, useState } from "react";
import { mcpObservationSchema, type McpObservation } from "@/lib/mcp";

export default function McpObservationPanel({
  entityKey,
}: {
  entityKey: string;
}) {
  const [observation, setObservation] = useState<McpObservation>();
  const [error, setError] = useState("");
  useEffect(() => {
    setObservation(undefined);
    setError("");
    const controller = new AbortController();
    let timer: ReturnType<typeof setTimeout>;
    let running = false;
    let failures = 0;
    async function refresh() {
      if (running || controller.signal.aborted) return;
      if (document.hidden) {
        timer = setTimeout(refresh, 30000);
        return;
      }
      running = true;
      try {
        const response = await fetch(
          `/api/mcp/entity?key=${encodeURIComponent(entityKey)}`,
          { signal: controller.signal, cache: "no-store" },
        );
        if (!response.ok)
          throw new Error(
            "MCP verification unavailable; chart data still comes directly from Arkiv.",
          );
        const parsed = mcpObservationSchema.parse(await response.json());
        if (parsed.status === "unavailable")
          throw new Error(
            parsed.error?.message ?? "MCP observation unavailable",
          );
        if (controller.signal.aborted) return;
        setObservation(parsed);
        setError("");
        failures = 0;
      } catch (error) {
        if (controller.signal.aborted) return;
        setError(
          error instanceof Error
            ? error.message
            : "MCP verification unavailable",
        );
        failures++;
      } finally {
        running = false;
        if (!controller.signal.aborted)
          timer = setTimeout(
            refresh,
            Math.min(300000, 30000 * 2 ** Math.min(failures, 3)),
          );
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
      controller.abort();
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", visible);
    };
  }, [entityKey]);
  return (
    <aside
      className="notice mcp-observation"
      aria-label="Live MCP entity observation"
    >
      <strong>Arkiv MCP · live entity metadata · 30-second polling</strong>
      <p className="mono">Entity: {entityKey}</p>
      {error && (
        <p role="status">
          {observation ? "Previous observation is stale. " : ""}
          {error}
        </p>
      )}
      {observation ? (
        <>
          <p>
            {observation.status === "observed"
              ? "Entity observed"
              : "Entity not confirmed"}{" "}
            · Tiramisu {observation.observation.chainId} · Block{" "}
            {observation.observation.blockNumber ?? "unavailable"} · Checked{" "}
            {new Date(observation.observation.observedAt).toLocaleTimeString()}
          </p>
          {observation.data && (
            <p>
              Created at block {observation.data.createdAt} · Expires at block{" "}
              {observation.data.expiresAt}
            </p>
          )}
          {observation.warnings.map((warning, i) => (
            <p key={i}>{warning}</p>
          ))}
        </>
      ) : (
        !error && <p>Checking the public entity through Arkiv MCP…</p>
      )}
      <small>
        MCP checks metadata only. Chart rows, values and creator/owner are read
        directly from Arkiv. Polling pauses while hidden.
      </small>
    </aside>
  );
}
