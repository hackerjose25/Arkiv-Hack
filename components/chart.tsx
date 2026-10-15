"use client";
import { useEffect, useRef } from "react";
import * as echarts from "echarts/core";
import { BarChart, LineChart } from "echarts/charts";
import {
  GridComponent,
  TooltipComponent,
  AriaComponent,
} from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";
import type { Row } from "@/lib/arkiv";
import { aggregate } from "@/lib/charts";
import type { Widget } from "@/lib/dashboard";
echarts.use([
  BarChart,
  LineChart,
  GridComponent,
  TooltipComponent,
  AriaComponent,
  CanvasRenderer,
]);
export default function Chart({
  rows,
  widget,
}: {
  rows: readonly Row[];
  widget: Widget;
}) {
  const target = useRef<HTMLDivElement>(null);
  const { points, skipped } = aggregate(rows, widget);
  useEffect(() => {
    if (
      !target.current ||
      widget.type === "kpi" ||
      widget.type === "table" ||
      !rows.length
    )
      return;
    const instance = echarts.init(target.current);
    const data = aggregate(rows, widget).points;
    instance.setOption({
      animation: false,
      aria: {
        enabled: true,
        label: {
          description: `${widget.title}. ${data
            .map((p) => `${p.name}: ${p.value}`)
            .join(", ")
            .slice(0, 2000)}`,
        },
      },
      tooltip: { trigger: "axis", renderMode: "richText" },
      grid: { left: 58, right: 24, top: 20, bottom: 55 },
      xAxis: {
        type: "category",
        data: data.map((p) => p.name),
        axisLabel: { color: "#8797ad", width: 90, overflow: "truncate" },
        axisLine: { lineStyle: { color: "#293344" } },
      },
      yAxis: {
        type: "value",
        axisLabel: { color: "#8797ad" },
        splitLine: { lineStyle: { color: "#202b3c" } },
      },
      series: [
        {
          type: widget.type,
          data: data.map((p) => p.value),
          barMaxWidth: 48,
          itemStyle: { color: "#61e3bd", borderRadius: [5, 5, 0, 0] },
          lineStyle: { color: "#61e3bd", width: 3 },
          areaStyle:
            widget.type === "line"
              ? { color: "#61e3bd", opacity: 0.08 }
              : undefined,
        },
      ],
    });
    const observer = new ResizeObserver(() => instance.resize());
    observer.observe(target.current);
    return () => {
      observer.disconnect();
      instance.dispose();
    };
  }, [rows, widget]);
  if (widget.type === "table")
    return (
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Entity key</th>
              <th>{widget.groupBy}</th>
              <th>{widget.measure}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.key}>
                <td className="mono">{r.key.slice(0, 16)}…</td>
                <td>{String(r.attributes[widget.groupBy]?.value ?? "—")}</td>
                <td>{String(r.attributes[widget.measure]?.value ?? "—")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  return (
    <>
      <div
        className="chart"
        ref={target}
        role="img"
        aria-label={`${widget.title}. ${points
          .map((p) => `${p.name}: ${p.value}`)
          .join(", ")
          .slice(0, 2000)}`}
      >
        {!rows.length ? (
          <div className="empty">
            <span>No data to visualize</span>
            <p>Run a query that returns numeric attributes.</p>
          </div>
        ) : widget.type === "kpi" ? (
          <div className="kpi">
            {points[0]?.value.toLocaleString() ?? "—"}
            <small>{widget.aggregation} · current page</small>
          </div>
        ) : null}
      </div>
      {skipped > 0 && (
        <p className="hint">
          {skipped} rows excluded: missing, non-numeric, or unsafe precision.
        </p>
      )}
    </>
  );
}
