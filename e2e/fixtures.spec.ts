import { test, expect, type Page } from "@playwright/test";
import { stringToHex } from "viem";
import { publicQuery } from "../lib/query";
import { defaultWidget } from "../lib/dashboard";
import { readFile } from "node:fs/promises";
import { createServer } from "node:http";
import type { AddressInfo } from "node:net";
const entityKey = "0x" + "a".repeat(64);
const address = "0x" + "1".repeat(40);
const metric = {
  key: "0x" + "b".repeat(64),
  creator: address,
  owner: address,
  createdAt: "0x8",
  expiresAt: "0x1000",
  attributes: [
    { name: "category", type: "str", value: "Offline fixture" },
    { name: "value", type: "i32", value: 42 },
    { name: "creator", type: "str", value: "UNTRUSTED CLAIM" },
  ],
};
const spec = {
  version: 1,
  network: "tiramisu",
  title: "Offline fixture dashboard",
  description: "Synthetic browser-test fixture, never chain evidence",
  query: publicQuery,
  widgets: [defaultWidget],
  refreshSeconds: 60,
  createdAt: "2026-10-14T12:00:00.000Z",
};
async function mockRPC(page: Page, dashboard: unknown = spec) {
  await page.route("**/api/mcp/entity?*", (route) =>
    route.fulfill({
      json: {
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
      },
    }),
  );
  await page.route(
    "**/rpc.tiramisu.db-chain.testnet.arkiv.network/**",
    async (route) => {
      const req = route.request().postDataJSON();
      let result: unknown;
      if (req.method === "eth_blockNumber") result = "0x100";
      else if (req.method === "arkiv_query" && req.params[0].includes("$key"))
        result = {
          blockNumber: "0x100",
          data: [
            {
              ...metric,
              key: entityKey,
              contentType: "application/json",
              payload: stringToHex(JSON.stringify(dashboard)),
              creationFlags: 1,
              attributes: [
                { name: "app", type: "str", value: "arkivsight" },
                { name: "kind", type: "str", value: "dashboard" },
                { name: "schema_version", type: "i32", value: 1 },
              ],
            },
          ],
        };
      else {
        const cursor = req.params[1].cursor;
        expect(req.params[1].atBlock).toBe("0x100");
        result = {
          blockNumber: "0x100",
          data: [
            { ...metric, key: cursor ? "0x" + "c".repeat(64) : metric.key },
          ],
          ...(!cursor ? { cursor: "fixture-next" } : {}),
        };
      }
      await route.fulfill({ json: { jsonrpc: "2.0", id: req.id, result } });
    },
  );
}
test("OFFLINE fixture: query pagination, charts and dashboard composition", async ({
  page,
}) => {
  await mockRPC(page);
  await page.goto("/studio");
  await page.getByRole("button", { name: "Query studio", exact: true }).click();
  await page.getByRole("button", { name: "Run query", exact: true }).click();
  await expect(
    page.getByText("Snapshot block 256", { exact: false }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Next page" }).click();
  await expect(page.getByText("Page 2", { exact: false })).toBeVisible();
  await expect(page.getByRole("button", { name: "Next page" })).toBeDisabled();
  await page.getByRole("button", { name: "Visualize", exact: true }).click();
  await expect(
    page.getByRole("img", { name: /Records by creator/ }),
  ).toHaveAttribute("aria-label", new RegExp(`${address}: 1`));
  await expect(page.locator(".chart canvas")).toBeVisible();
  await expect(page.getByRole("combobox", { name: /^Aggregate/ })).toHaveValue(
    "count",
  );
  await page.getByRole("combobox", { name: /^Aggregate/ }).selectOption("sum");
  await page.getByLabel("Group by", { exact: true }).fill("category");
  await page.getByLabel("Measure", { exact: true }).fill("missing_value");
  await expect(
    page.getByText("No usable numeric values", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Add to dashboard" }),
  ).toBeDisabled();
  await page.getByLabel("Measure", { exact: true }).fill("value");
  await page.getByLabel("Widget title").fill("Requests by category");
  await expect(
    page.getByRole("img", { name: /Offline fixture: 42/ }),
  ).toBeVisible();
  await page.getByRole("combobox", { name: /^Chart/ }).selectOption("table");
  await expect(page.locator(".visualize table")).toContainText("42");
  await page.getByRole("combobox", { name: /^Chart/ }).selectOption("kpi");
  await expect(page.locator(".visualize .kpi")).toContainText("42");
  await page.getByRole("combobox", { name: /^Chart/ }).selectOption("line");
  await expect(page.locator(".chart canvas")).toBeVisible();
  await page.getByRole("combobox", { name: /^Chart/ }).selectOption("bar");
  await expect(page.locator(".chart canvas")).toBeVisible();
  await page.getByRole("button", { name: "Add to dashboard" }).click();
  await expect(
    page.getByRole("heading", { name: "Requests by category" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Publish dashboard" }),
  ).toBeEnabled();
  await page
    .getByRole("button", { name: "Edit Requests by category", exact: true })
    .click();
  await page.getByLabel("Widget title").fill("Edited chart");
  await page.getByRole("button", { name: "Save widget changes" }).click();
  await expect(
    page.getByRole("heading", { name: "Edited chart" }),
  ).toBeVisible();
  await expect(page.locator(".dashboard-grid .panel")).toHaveCount(1);
});
test("OFFLINE fixture: portable dashboard import validates before replacement and exports safely", async ({
  page,
}) => {
  await mockRPC(page);
  await page.goto("/studio");
  await page.getByRole("button", { name: "Dashboard builder" }).click();
  const input = page.getByLabel("Import dashboard definition (.json)");
  const file = (value: unknown) => ({
    name: "dashboard.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(value)),
  });
  const portable = JSON.parse(
    await readFile("examples/public-dashboard.json", "utf8"),
  );
  await input.setInputFiles(file(portable));
  await expect(page.getByLabel("Title", { exact: true })).toHaveValue(
    portable.title,
  );
  await expect(
    page.getByRole("img", { name: /Records on this page.*Current page: 1/ }),
  ).toBeVisible();
  await expect(page.locator(".dashboard-grid .panel")).toHaveCount(2);
  await expect(page.locator(".dashboard-grid table")).toContainText(address);
  await expect(page.locator(".dashboard-grid table")).toContainText("4096");
  await input.setInputFiles(
    file({
      label: "Offline analysis fixture",
      probabilities: { low: 0.6 },
      packet_count: 12,
      windows: [],
    }),
  );
  await expect(page.locator(".notice.error")).toContainText(
    "Raw datasets and analysis results cannot be imported here",
  );
  await expect(page.locator(".notice.error")).toContainText(
    "Your existing draft has not been changed",
  );
  await expect(page.locator(".notice.error")).not.toContainText(
    "invalid_value",
  );
  await expect(page.locator(".notice.error")).not.toContainText(
    "No simulated results",
  );
  await expect(page.getByLabel("Title", { exact: true })).toHaveValue(
    portable.title,
  );
  await input.setInputFiles(
    file({ ...portable, html: "<script>alert(1)</script>" }),
  );
  await expect(page.locator(".notice.error")).toBeVisible();
  await expect(page.getByLabel("Title", { exact: true })).toHaveValue(
    portable.title,
  );
  await expect(page.locator(".dashboard-grid .panel")).toHaveCount(2);
  await input.setInputFiles({
    name: "huge.json",
    mimeType: "application/json",
    buffer: Buffer.alloc(32769),
  });
  await expect(page.locator(".notice.error")).toContainText("32 KiB");
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export dashboard JSON" }).click();
  const download = await downloadPromise;
  const exported = JSON.parse(await readFile((await download.path())!, "utf8"));
  expect(exported).toEqual({ ...portable, createdAt: expect.any(String) });
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test("OFFLINE fixture: guided publisher filters preserve conditions and distinguish metadata", async ({
  page,
}) => {
  await mockRPC(page);
  const queries: string[] = [];
  page.on("request", (request) => {
    if (
      request.url().includes("rpc.tiramisu") &&
      request.postDataJSON()?.method === "arkiv_query"
    )
      queries.push(request.postDataJSON().params[0]);
  });
  await page.goto("/studio");
  await page.getByRole("button", { name: "Query studio", exact: true }).click();
  await page.getByRole("button", { name: "My records", exact: true }).click();
  await expect(page.getByLabel("Publisher wallet address")).toBeFocused();
  await page.getByLabel("Publisher wallet address").fill("$creator");
  await expect(
    page.getByRole("button", { name: "Apply publisher filter" }),
  ).toBeDisabled();
  await page.getByLabel("Publisher wallet address").fill(address);
  await page.getByRole("button", { name: "Apply publisher filter" }).click();
  await expect(page.getByLabel("Field 1", { exact: true })).toHaveValue(
    "$creator",
  );
  await expect(page.getByLabel("Type 1", { exact: true })).toBeDisabled();
  await expect(page.getByLabel("Type 1", { exact: true })).toHaveValue("addr");
  await expect(page.getByLabel("Value 1", { exact: true })).toHaveValue(
    address,
  );
  await page.getByRole("button", { name: "Run query", exact: true }).click();
  await expect
    .poll(() =>
      queries.some((query) => query.includes(`$creator = addr(${address})`)),
    )
    .toBe(true);
  await expect(
    page.getByText("Snapshot block 256", { exact: false }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Add condition" }).click();
  await page.getByLabel("Field 2", { exact: true }).selectOption("value");
  await expect(page.getByLabel("Type 2", { exact: true })).toHaveValue("i32");
  await page.getByLabel("Value 2", { exact: true }).fill("10");
  await page
    .getByRole("button", { name: "Filter by publisher", exact: true })
    .click();
  await page.getByLabel("Publisher relationship").selectOption("$owner");
  await page.getByLabel("Publisher wallet address").fill(address);
  await page.getByRole("button", { name: "Apply publisher filter" }).click();
  await expect(page.getByLabel("Field 3", { exact: true })).toHaveValue(
    "$owner",
  );
  await expect(page.getByLabel("Field 2", { exact: true })).toHaveValue(
    "value",
  );
  await page.getByLabel("Field 2", { exact: true }).selectOption("creator");
  await expect(page.getByLabel("Type 2", { exact: true })).toHaveValue("str");
  await expect(page.getByLabel("Type 2", { exact: true })).toBeEnabled();
  await page.getByRole("button", { name: "Run query", exact: true }).click();
  await expect
    .poll(() =>
      queries.some(
        (query) =>
          query.includes("$owner = addr(") &&
          query.includes("creator = str('10')"),
      ),
    )
    .toBe(true);
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test("OFFLINE fixture: My records requests only a wallet address, never a signature or chain switch", async ({
  page,
}) => {
  await mockRPC(page);
  await page.addInitScript((walletAddress) => {
    const methods: string[] = [];
    Object.defineProperty(window, "__readingWalletMethods", { value: methods });
    Object.defineProperty(window, "ethereum", {
      value: {
        on() {},
        removeListener() {},
        async request({ method }: { method: string }) {
          methods.push(method);
          if (method === "eth_requestAccounts") return [walletAddress];
          throw new Error("Unexpected wallet operation in a public read");
        },
      },
    });
  }, address);
  await page.goto("/studio");
  await page.getByRole("button", { name: "Query studio", exact: true }).click();
  await page.getByRole("button", { name: "My records", exact: true }).click();
  await expect(page.getByLabel("Value 1", { exact: true })).toHaveValue(
    address,
  );
  await page.getByRole("button", { name: "Run query", exact: true }).click();
  await expect(
    page.getByText("Snapshot block 256", { exact: false }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () =>
        (window as unknown as { __readingWalletMethods: string[] })
          .__readingWalletMethods,
    ),
  ).toEqual(["eth_requestAccounts"]);
});

test("OFFLINE fixture: entity dialog traps focus, closes on Escape and restores focus", async ({
  page,
}) => {
  await mockRPC(page);
  await page.goto("/studio");
  await page.getByRole("button", { name: "Query studio", exact: true }).click();
  await page.getByRole("button", { name: "Run query", exact: true }).click();
  const entity = page.locator(".entity-link").first();
  await entity.click();
  const dialog = page.getByRole("dialog", { name: "Entity details" });
  await expect(dialog).toBeVisible();
  const close = page.getByRole("button", { name: "Close entity details" });
  await expect(close).toBeFocused();
  await page.keyboard.press("Tab");
  // Native dialogs keep focus within their modal subtree (or the document body).
  await page.keyboard.press("Tab");
  await expect(close).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(entity).toBeFocused();
});
test("OFFLINE fixture: public content renders as text and unknown executable fields are rejected", async ({
  page,
}) => {
  const hostile = '<img src=x onerror="window.attacked=true">';
  await mockRPC(page, { ...spec, title: hostile });
  await page.goto("/d/" + entityKey);
  await expect(page.getByRole("heading", { name: hostile })).toBeVisible();
  await expect(page.locator("img[src=x]")).toHaveCount(0);
  await page.unrouteAll({ behavior: "wait" });
  await mockRPC(page, { ...spec, html: "<script>alert(1)</script>" });
  await page.reload();
  await expect(page.locator(".notice.error[role=alert]")).toBeVisible();
  await expect(page.locator(".dashboard-grid .panel")).toHaveCount(0);
});
test("OFFLINE fixture: independent origin embeds a dashboard without a wallet", async ({
  page,
}) => {
  await mockRPC(page);
  const consumer = await readFile(
    "examples/independent-consumer/index.html",
    "utf8",
  );
  const server = createServer((_request, response) => {
    response.writeHead(200, { "Content-Type": "text/html" });
    response.end(consumer);
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  try {
    await page.goto(
      `http://127.0.0.1:${(server.address() as AddressInfo).port}/`,
    );
    await page.getByLabel("Deployment origin").fill("http://127.0.0.1:3000");
    await page.getByLabel("Dashboard entity key").fill(entityKey);
    await page.getByRole("button", { name: "Load public dashboard" }).click();
    const embedded = page.frameLocator("#frame");
    await expect(
      embedded.getByRole("heading", { name: "Requests by category" }),
    ).toBeVisible();
    await expect(embedded.getByText("Owner: " + address)).toBeVisible();
    await expect(
      embedded.getByRole("img", { name: /Offline fixture: 42/ }),
    ).toBeVisible();
  } finally {
    await new Promise<void>((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve())),
    );
  }
});
test("OFFLINE fixture: public route and widget embed load without wallet", async ({
  page,
}) => {
  await mockRPC(page);
  await page.goto("/d/" + entityKey);
  await expect(
    page.getByRole("heading", { name: "Offline fixture dashboard" }),
  ).toBeVisible();
  await expect(page.getByText("Creator: " + address)).toBeVisible();
  await page.goto("/embed/" + entityKey + "?widget=overview");
  await expect(
    page.getByRole("heading", { name: "Requests by category" }),
  ).toBeVisible();
  await expect(
    page.getByRole("img", { name: /Offline fixture: 42/ }),
  ).toBeVisible();
  await page.getByText("Query & provenance", { exact: true }).click();
  await expect(
    page.getByText("Query snapshot block: 256", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("Definition expiry block: 4096", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("Creator and owner are authoritative dashboard metadata", {
      exact: false,
    }),
  ).toBeVisible();
});
test("capture honest empty studio preview", async ({ page }) => {
  await mockRPC(page);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/studio");
  await page.getByRole("button", { name: "Query studio", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "From query to clarity." }),
  ).toBeVisible();
  await page.screenshot({
    path: "test-results/studio-desktop.png",
    fullPage: true,
  });
});

test("OFFLINE fixture: studio refreshes every 30 seconds and pauses for changed filters and cursor pages", async ({
  page,
}) => {
  await page.clock.install();
  await mockRPC(page);
  let reads = 0;
  page.on("request", (request) => {
    if (
      request.url().includes("rpc.tiramisu") &&
      request.postDataJSON()?.method === "eth_blockNumber"
    )
      reads++;
  });
  await page.goto("/studio");
  await page.getByRole("button", { name: "Query studio", exact: true }).click();
  await page.getByRole("button", { name: "Run query", exact: true }).click();
  await expect(
    page.getByText("Snapshot block 256", { exact: false }),
  ).toBeVisible();
  const initialReads = reads;
  await page.clock.runFor(29000);
  expect(reads).toBe(initialReads);
  await page.clock.runFor(1000);
  await expect.poll(() => reads).toBe(initialReads + 1);
  await expect(
    page.getByRole("button", { name: "Run query", exact: true }),
  ).toBeEnabled();
  await page.getByRole("button", { name: "Next page" }).click();
  await expect(page.getByText("Page 2", { exact: false })).toBeVisible();
  await page.clock.runFor(31000);
  expect(reads).toBe(initialReads + 1);
  await page.getByRole("button", { name: "Previous", exact: true }).click();
  await page.getByRole("button", { name: "Add condition" }).click();
  await page.getByLabel("Value 1", { exact: true }).fill("changed");
  await page.clock.runFor(31000);
  expect(reads).toBe(initialReads + 1);
});

test("OFFLINE fixture: Public Database browses all publishers, paginates and opens an unfiltered studio", async ({
  page,
}) => {
  await page.clock.install();
  await mockRPC(page);
  const expressions: string[] = [];
  page.on("request", (request) => {
    if (
      request.url().includes("rpc.tiramisu") &&
      request.postDataJSON()?.method === "arkiv_query"
    )
      expressions.push(request.postDataJSON().params[0]);
  });
  await page.goto("/studio");
  await expect(
    page.getByRole("heading", { name: "Public Database", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: `Inspect public entity ${metric.key}` }),
  ).toBeVisible();
  expect(expressions[0]).toBe("$expiresAt >= u64(0)");
  await page.clock.runFor(30000);
  await expect.poll(() => expressions.length).toBe(2);
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.setViewportSize({ width: 1280, height: 900 });
  await expect(
    page.locator(`.public-database td[title="${address}"]`),
  ).toHaveCount(2);
  await expect(
    page.getByRole("button", { name: /Sign synthetic|Publish synthetic/ }),
  ).toHaveCount(0);
  await page.getByRole("button", { name: "Next public page" }).click();
  await expect(
    page.getByText("Auto-refresh paused while browsing cursor pages"),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Next public page" }),
  ).toBeDisabled();
  const requestsOnLaterPage = expressions.length;
  await page.clock.runFor(31000);
  expect(expressions).toHaveLength(requestsOnLaterPage);
  await page.getByRole("button", { name: "Previous public page" }).click();
  await page.getByRole("button", { name: "Open in query studio" }).click();
  await expect(
    page.getByText("No filters. All currently available public entities", {
      exact: false,
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Visualize", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Add condition" }).click();
  await page.getByRole("button", { name: "Remove filter 1" }).click();
  await expect(page.getByLabel("Field 1", { exact: true })).toHaveCount(0);
  await page.getByRole("button", { name: "Add condition" }).click();
  await page.getByRole("button", { name: "Add condition" }).click();
  await page.getByRole("button", { name: "Clear all filters" }).click();
  await expect(page.locator(".filter-row")).toHaveCount(0);
  await page.getByRole("button", { name: "Run query", exact: true }).click();
  await expect(
    page.getByText("Snapshot block 256", { exact: false }),
  ).toBeVisible();
});

test("OFFLINE fixture: anonymous RPC limit pauses reads and recovers without login", async ({
  page,
}) => {
  await page.clock.install();
  await mockRPC(page);
  let limited = true;
  let reads = 0;
  await page.route(
    "**/rpc.tiramisu.db-chain.testnet.arkiv.network/**",
    async (route) => {
      const req = route.request().postDataJSON();
      if (req.method !== "arkiv_query") return route.fallback();
      reads++;
      if (limited)
        return route.fulfill({ status: 429, body: "ANON_COST_LIMITED" });
      return route.fallback();
    },
  );
  await page.goto("/studio");
  await expect(page.locator(".notice.error")).toContainText(
    "limited anonymous reads",
  );
  await expect(
    page.getByRole("heading", { name: "Public read unavailable" }),
  ).toBeVisible();
  await expect(
    page.getByText("Reading public Arkiv records…", { exact: true }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Refresh public data" }),
  ).toBeDisabled();
  await expect(
    page.getByRole("button", { name: "Open in query studio" }),
  ).toBeEnabled();
  expect(reads).toBe(1);
  await page.clock.runFor(119000);
  expect(reads).toBe(1);
  limited = false;
  await page.clock.runFor(1000);
  await expect(
    page.getByRole("button", { name: `Inspect public entity ${metric.key}` }),
  ).toBeVisible();
  expect(reads).toBe(2);
  await expect(page.locator(".notice.error")).toHaveCount(0);
  await page
    .getByLabel("Auto-refresh public records", { exact: true })
    .uncheck();
  await page.clock.runFor(60000);
  expect(reads).toBe(2);
});

test("OFFLINE fixture: public data and MCP refresh at 30 seconds even for an older 60-second definition", async ({
  page,
}) => {
  await page.clock.install();
  await mockRPC(page);
  let reads = 0;
  let checks = 0;
  page.on("request", (request) => {
    if (
      request.url().includes("rpc.tiramisu") &&
      request.postDataJSON()?.method === "eth_blockNumber"
    )
      reads++;
    if (request.url().includes("/api/mcp/entity?")) checks++;
  });
  await page.goto("/d/" + entityKey);
  await expect(page.getByRole("heading", { name: spec.title })).toBeVisible();
  await expect(page.getByLabel("Live MCP entity observation")).toContainText(
    "Entity observed",
  );
  expect(reads).toBe(1);
  expect(checks).toBe(1);
  await page.clock.runFor(30000);
  await expect.poll(() => reads).toBe(2);
  await expect.poll(() => checks).toBe(2);
  await page.unroute("**/api/mcp/entity?*");
  await page.route("**/api/mcp/entity?*", (route) =>
    route.fulfill({ status: 502, json: { error: "offline simulated outage" } }),
  );
  await page.clock.runFor(30000);
  await expect(page.getByLabel("Live MCP entity observation")).toContainText(
    "stale",
  );
  await expect(
    page.getByRole("img", { name: /Offline fixture: 42/ }),
  ).toBeVisible();
});
