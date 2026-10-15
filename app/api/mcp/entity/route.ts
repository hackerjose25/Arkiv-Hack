import { entityKeySchema } from "@/lib/dashboard";
import { verifyPublicEntity, type McpObservation } from "@/lib/mcp";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const cache = new Map<
  string,
  { until: number; value: Promise<McpObservation> }
>();
const headers = { "Cache-Control": "no-store" };
export async function GET(request: Request) {
  const parsed = entityKeySchema.safeParse(
    new URL(request.url).searchParams.get("key"),
  );
  if (!parsed.success)
    return Response.json(
      { error: "A valid public entity key is required" },
      { status: 400, headers },
    );
  const key = parsed.data.toLowerCase();
  try {
    let entry = cache.get(key);
    if (!entry || entry.until <= Date.now()) {
      for (const [k, item] of cache)
        if (item.until <= Date.now()) cache.delete(k);
      if (cache.size >= 64)
        return Response.json(
          { error: "MCP verification is busy. Try again later." },
          { status: 429, headers },
        );
      entry = { until: Date.now() + 25000, value: verifyPublicEntity(key) };
      cache.set(key, entry);
    }
    return Response.json(await entry.value, { headers });
  } catch {
    cache.delete(key);
    return Response.json(
      {
        error:
          "MCP verification unavailable. Direct Arkiv queries remain available.",
      },
      { status: 502, headers },
    );
  }
}
