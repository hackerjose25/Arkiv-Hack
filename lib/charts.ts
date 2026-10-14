import type { Row } from "./arkiv";
import type { Widget } from "./dashboard";
export function numericAttribute(row: Row, field: string) {
  const a = row.attributes[field];
  if (!a || !["i32", "u64", "u256", "dec"].includes(a.type)) return null;
  if (
    typeof a.value === "bigint" &&
    (a.value > BigInt(Number.MAX_SAFE_INTEGER) ||
      a.value < BigInt(Number.MIN_SAFE_INTEGER))
  )
    return null;
  const n = Number(a.value);
  return Number.isFinite(n) ? n : null;
}
export function aggregate(rows: readonly Row[], widget: Widget) {
  const groups = new Map<string, { sum: number; count: number }>();
  let skipped = 0;
  for (const row of rows) {
    const group =
      widget.type === "kpi"
        ? "Current page"
        : String(row.attributes[widget.groupBy]?.value ?? "(missing)");
    const n =
      widget.aggregation === "count"
        ? 1
        : numericAttribute(row, widget.measure);
    if (n === null) {
      skipped++;
      continue;
    }
    const prev = groups.get(group) ?? { sum: 0, count: 0 };
    prev.sum += n;
    prev.count++;
    groups.set(group, prev);
  }
  return {
    points: [...groups].map(([name, g]) => ({
      name,
      value: widget.aggregation === "average" ? g.sum / g.count : g.sum,
    })),
    skipped,
  };
}
