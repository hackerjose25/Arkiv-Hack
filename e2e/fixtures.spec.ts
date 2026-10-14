import { test, expect, type Page } from "@playwright/test";
import { stringToHex } from "viem";
import { demoQuery } from "../lib/query";
import { defaultWidget } from "../lib/dashboard";
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
  query: demoQuery,
  widgets: [defaultWidget],
  refreshSeconds: 60,
  createdAt: "2026-10-14T12:00:00.000Z",
};
async function mockRPC(page: Page) {
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
              payload: stringToHex(JSON.stringify(spec)),
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
  await page.goto("/");
  await page.getByRole("button", { name: "Run query", exact: true }).click();
  await expect(
    page.getByText("Snapshot block 256", { exact: false }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Next page" }).click();
  await expect(page.getByText("Page 2", { exact: false })).toBeVisible();
  await expect(page.getByRole("button", { name: "Next page" })).toBeDisabled();
  await page.getByRole("button", { name: "Visualize", exact: true }).click();
  await expect(
    page.getByRole("img", { name: /Offline fixture: 42/ }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Add to dashboard" }).click();
  await expect(
    page.getByRole("heading", { name: "Requests by category" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Publish dashboard" }),
  ).toBeEnabled();
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
});
test("capture honest empty studio preview", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "From query to clarity." }),
  ).toBeVisible();
  await page.screenshot({
    path: "test-results/studio-desktop.png",
    fullPage: true,
  });
});
