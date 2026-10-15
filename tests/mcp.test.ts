import { afterEach, expect, it, vi } from "vitest";
import { verifyPublicEntity } from "../lib/mcp";
const key = "0x" + "a".repeat(64);
const observation = {
  status: "observed",
  data: {
    kind: "entity_metadata",
    createdAt: "8",
    updatedAt: "8",
    expiresAt: "4096",
    creationFlags: { readonly: true, permissionlessExtension: false },
  },
  error: null,
  warnings: [],
  observation: {
    profile: "devfolio",
    network: "tiramisu",
    chainId: 7738577,
    blockNumber: "256",
    observedAt: "2026-10-15T09:36:58.336Z",
    sourceKind: "rpc",
    serverVersion: "offline-fixture",
  },
};
afterEach(() => vi.unstubAllGlobals());
function mockServer(value: unknown, sse = false) {
  const requests: {
    headers: HeadersInit;
    body: { id?: number; method: string; params: unknown };
  }[] = [];
  vi.stubGlobal(
    "fetch",
    vi.fn(async (_url, init) => {
      const body = JSON.parse(init.body);
      requests.push({ headers: init.headers, body });
      if (body.method === "notifications/initialized")
        return new Response(null, { status: 202 });
      const result =
        body.method === "initialize"
          ? { protocolVersion: "2025-06-18" }
          : { structuredContent: value };
      const json = JSON.stringify({ jsonrpc: "2.0", id: body.id, result });
      return new Response(sse ? `event: message\ndata: ${json}\n\n` : json, {
        headers: {
          "Content-Type": sse ? "text/event-stream" : "application/json",
          "Mcp-Session-Id": "fixture-session",
        },
      });
    }),
  );
  return requests;
}
it("negotiates MCP and requests only reviewed public metadata, including session headers", async () => {
  const requests = mockServer(observation);
  expect(await verifyPublicEntity(key)).toEqual(observation);
  expect(requests.map((r) => r.body.method)).toEqual([
    "initialize",
    "notifications/initialized",
    "tools/call",
  ]);
  expect(requests[1].body.id).toBeUndefined();
  expect(requests[2].headers).toMatchObject({
    "MCP-Protocol-Version": "2025-06-18",
    "Mcp-Session-Id": "fixture-session",
  });
  expect(requests[2].body.params).toEqual({
    name: "verify_entity",
    arguments: { entityKey: key, publicEvidenceReviewed: true },
  });
});
it("accepts Streamable HTTP SSE responses", async () => {
  mockServer(observation, true);
  expect((await verifyPublicEntity(key)).observation.chainId).toBe(7738577);
});
it("rejects the wrong network and malformed keys", async () => {
  const requests = mockServer({
    ...observation,
    observation: { ...observation.observation, chainId: 1 },
  });
  await expect(verifyPublicEntity("https://example.com")).rejects.toBeDefined();
  expect(requests).toHaveLength(0);
  await expect(verifyPublicEntity(key)).rejects.toBeDefined();
});
it("keeps a missing entity distinct from observed metadata", async () => {
  mockServer({ ...observation, status: "not_found", data: null });
  expect((await verifyPublicEntity(key)).status).toBe("not_found");
});
it("rejects oversized remote responses", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => new Response("x".repeat(131073))),
  );
  await expect(verifyPublicEntity(key)).rejects.toThrow("128 KiB");
});
