// Standalone read-only MCP client. Uses Node's built-in fetch; installs no packages.
/* global fetch, AbortSignal, process, console */
import { readFile } from "node:fs/promises";

const endpoint = "https://mcp.arkiv.network/devfolio";
let protocolVersion = "2025-06-18";
let session;
let nextId = 1;
async function request(method, params, notification = false) {
  const id = notification ? undefined : nextId++;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json, text/event-stream",
      ...(method !== "initialize"
        ? { "MCP-Protocol-Version": protocolVersion }
        : {}),
      ...(session ? { "Mcp-Session-Id": session } : {}),
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      ...(notification ? {} : { id }),
      method,
      params,
    }),
    signal: AbortSignal.timeout(20000),
    redirect: "error",
  });
  if (!response.ok) throw new Error(`MCP ${method}: HTTP ${response.status}`);
  session = response.headers.get("Mcp-Session-Id") ?? session;
  if (notification) return;
  const body = await response.text();
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
  const message = messages.find((entry) => entry.id === id);
  if (!message) throw new Error(`Missing MCP response for ${method}`);
  if (message.error) throw new Error(JSON.stringify(message.error));
  return message.result;
}

const initialized = await request("initialize", {
  protocolVersion,
  capabilities: {},
  clientInfo: { name: "arkivsight-readonly-evidence", version: "1.0.0" },
});
if (
  !["2025-06-18", "2025-03-26", "2024-11-05"].includes(
    initialized.protocolVersion,
  )
)
  throw new Error("Unsupported negotiated MCP version");
protocolVersion = initialized.protocolVersion;
await request("notifications/initialized", {}, true);
const tools = [];
let cursor;
do {
  const page = await request("tools/list", cursor ? { cursor } : {});
  tools.push(...page.tools);
  cursor = page.nextCursor;
} while (cursor);

const name = process.argv[2];
if (!name) {
  console.log(
    JSON.stringify(
      {
        observedAt: new Date().toISOString(),
        endpoint,
        protocolVersion,
        server: initialized.serverInfo,
        tools,
      },
      null,
      2,
    ),
  );
} else {
  if (
    !["server_status", "network_status", "verify_entity", "verify_tx"].includes(
      name,
    )
  )
    throw new Error(
      "This evidence client permits only explicitly named read-only tools",
    );
  if (!tools.some((tool) => tool.name === name))
    throw new Error(`Tool not exposed: ${name}`);
  const args = process.argv[3]
    ? JSON.parse(await readFile(process.argv[3], "utf8"))
    : {};
  const result = await request("tools/call", { name, arguments: args });
  console.log(
    JSON.stringify(
      {
        observedAt: new Date().toISOString(),
        endpoint,
        protocolVersion,
        tool: name,
        result,
      },
      null,
      2,
    ),
  );
  if (result.isError) process.exitCode = 1;
}
