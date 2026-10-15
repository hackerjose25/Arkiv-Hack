import { z } from "zod";
import { entityKeySchema } from "./dashboard";

export const MCP_ENDPOINT = "https://mcp.arkiv.network/devfolio";
export const mcpObservationSchema = z.object({
  status: z.enum(["observed", "not_found", "unavailable"]),
  data: z
    .object({
      kind: z.literal("entity_metadata"),
      createdAt: z.string().regex(/^\d+$/),
      updatedAt: z.string().regex(/^\d+$/),
      expiresAt: z.string().regex(/^\d+$/),
      creationFlags: z.object({
        readonly: z.boolean(),
        permissionlessExtension: z.boolean(),
      }),
    })
    .nullable(),
  error: z
    .object({
      code: z.string().max(80),
      message: z.string().max(256),
      retryAfterSeconds: z.number().int().min(1).max(60).nullable(),
    })
    .nullable(),
  warnings: z.array(z.string().max(2000)).max(20),
  observation: z.object({
    profile: z.literal("devfolio"),
    network: z.literal("tiramisu"),
    chainId: z.literal(7738577),
    blockNumber: z.string().regex(/^\d+$/).nullable(),
    observedAt: z.string().datetime(),
    sourceKind: z.literal("rpc"),
    serverVersion: z.string().max(50),
  }),
});
export type McpObservation = z.infer<typeof mcpObservationSchema>;

// Only public entity keys are sent. This is not a generic MCP proxy or query backend.
export async function verifyPublicEntity(key: string, signal?: AbortSignal) {
  entityKeySchema.parse(key);
  let session: string | null = null;
  let version = "2025-06-18";
  let nextId = 1;
  async function call(method: string, params: unknown, notification = false) {
    const id = nextId++;
    const response = await fetch(MCP_ENDPOINT, {
      method: "POST",
      redirect: "error",
      cache: "no-store",
      signal: AbortSignal.any([
        AbortSignal.timeout(15000),
        ...(signal ? [signal] : []),
      ]),
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json, text/event-stream",
        ...(method !== "initialize" ? { "MCP-Protocol-Version": version } : {}),
        ...(session ? { "Mcp-Session-Id": session } : {}),
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        ...(!notification ? { id } : {}),
        method,
        params,
      }),
    });
    if (!response.ok)
      throw new Error(`MCP ${method} failed (HTTP ${response.status})`);
    session = response.headers.get("Mcp-Session-Id") ?? session;
    if (notification) {
      await response.body?.cancel();
      return;
    }
    const reader = response.body?.getReader();
    if (!reader) throw new Error("MCP response is empty");
    const decoder = new TextDecoder("utf-8", { fatal: true });
    let body = "";
    let bytes = 0;
    try {
      for (;;) {
        const part = await reader.read();
        if (part.done) break;
        bytes += part.value.byteLength;
        if (bytes > 131072) throw new Error("MCP response exceeds 128 KiB");
        body += decoder.decode(part.value, { stream: true });
      }
      body += decoder.decode();
    } finally {
      await reader.cancel();
    }
    const messages = response.headers
      .get("content-type")
      ?.includes("text/event-stream")
      ? body.split(/\r?\n\r?\n/).flatMap((event) => {
          const data = event
            .split(/\r?\n/)
            .filter((line) => line.startsWith("data:"))
            .map((line) => line.slice(5).trimStart())
            .join("\n");
          return data ? [JSON.parse(data)] : [];
        })
      : [JSON.parse(body)];
    const message = messages.find((m) => m.id === id);
    if (!message || message.error)
      throw new Error("MCP protocol response failed");
    return message.result;
  }
  const initialized = await call("initialize", {
    protocolVersion: version,
    capabilities: {},
    clientInfo: { name: "arkivsight-public-reader", version: "1.0.0" },
  });
  if (
    !["2025-06-18", "2025-03-26", "2024-11-05"].includes(
      initialized.protocolVersion,
    )
  )
    throw new Error("Unsupported MCP protocol version");
  version = initialized.protocolVersion;
  await call("notifications/initialized", {}, true);
  const result = await call("tools/call", {
    name: "verify_entity",
    arguments: { entityKey: key, publicEvidenceReviewed: true },
  });
  if (result.isError) throw new Error("MCP entity verification failed");
  const observation =
    result.structuredContent ??
    JSON.parse(
      result.content?.find((item: { type: string }) => item.type === "text")
        ?.text ?? "null",
    );
  return mcpObservationSchema.parse(observation);
}
