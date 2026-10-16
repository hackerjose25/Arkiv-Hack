import { z } from "zod";
import { compileQuery, fieldSchema, querySchema } from "./query";
export const widgetSchema = z
  .object({
    id: z.string().regex(/^[a-z0-9_-]{1,40}$/),
    title: z.string().min(1).max(80),
    type: z.enum(["table", "bar", "line", "kpi"]),
    groupBy: fieldSchema,
    measure: fieldSchema,
    aggregation: z.enum(["count", "sum", "average"]),
  })
  .strict();
export type Widget = z.infer<typeof widgetSchema>;
export const dashboardSchema = z
  .object({
    version: z.literal(1),
    network: z.literal("tiramisu"),
    title: z.string().min(1).max(100),
    description: z.string().max(500),
    query: querySchema,
    widgets: z.array(widgetSchema).min(1).max(8),
    refreshSeconds: z.number().int().min(30).max(3600),
    createdAt: z.string().datetime(),
  })
  .strict()
  .superRefine((s, ctx) => {
    if (new Set(s.widgets.map((w) => w.id)).size !== s.widgets.length)
      ctx.addIssue({ code: "custom", message: "Widget IDs must be unique" });
    try {
      compileQuery(s.query);
    } catch {
      ctx.addIssue({ code: "custom", message: "Invalid typed query" });
    }
  });
export type Dashboard = z.infer<typeof dashboardSchema>;
export const defaultWidget: Widget = {
  id: "overview",
  title: "Requests by category",
  type: "bar",
  groupBy: "category",
  measure: "value",
  aggregation: "sum",
};
export const publicWidget: Widget = {
  ...defaultWidget,
  title: "Records by creator",
  groupBy: "$creator",
  measure: "$expiresAt",
  aggregation: "count",
};
export function encodeDashboard(input: unknown) {
  const parsed = dashboardSchema.parse(input);
  const bytes = new TextEncoder().encode(JSON.stringify(parsed));
  if (bytes.length > 32768) throw new Error("Dashboard exceeds 32 KiB");
  return bytes;
}
export function decodeDashboard(bytes: Uint8Array) {
  if (bytes.length > 32768) throw new Error("Dashboard exceeds 32 KiB");
  return dashboardSchema.parse(
    JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes)),
  );
}
export function decodeDashboardFile(bytes: Uint8Array) {
  try {
    return decodeDashboard(bytes);
  } catch (error) {
    if (error instanceof z.ZodError)
      throw new Error(
        "This JSON is not an ArkivSight v1 dashboard definition. Import a file exported from Dashboard builder, or use examples/public-dashboard.json. Raw datasets and analysis results cannot be imported here.",
      );
    if (error instanceof SyntaxError || error instanceof TypeError)
      throw new Error(
        "This file is not valid UTF-8 JSON. Choose an ArkivSight dashboard definition saved as a .json file.",
      );
    throw error;
  }
}
export const entityKeySchema = z.string().regex(/^0x[0-9a-fA-F]{64}$/);
export function embedSnippet(origin: string, key: string, widget?: string) {
  entityKeySchema.parse(key);
  const url = new URL(`/embed/${key}`, origin);
  if (!["http:", "https:"].includes(url.protocol))
    throw new Error("Invalid origin");
  if (widget)
    url.searchParams.set("widget", widgetSchema.shape.id.parse(widget));
  return `<iframe src="${url.href}" title="ArkivSight dashboard" width="100%" height="560" loading="lazy" style="border:0;border-radius:16px"></iframe>`;
}
