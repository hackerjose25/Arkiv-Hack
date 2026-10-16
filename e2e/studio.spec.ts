import { test, expect } from "@playwright/test";
test("studio validates filters and reports network failures honestly", async ({
  page,
}) => {
  await page.route(
    "**/rpc.tiramisu.db-chain.testnet.arkiv.network/**",
    (route) => route.abort("failed"),
  );
  await page.goto("/studio");
  await page.getByRole("button", { name: "Query studio", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "From query to clarity." }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Add condition" }).click();
  await page.getByLabel("Field 1", { exact: true }).selectOption("__custom");
  await page.getByLabel("Custom attribute 1", { exact: true }).fill("app");
  await page.getByLabel("Type 1", { exact: true }).selectOption("i32");
  await expect(
    page.getByRole("button", { name: "Run query", exact: true }),
  ).toBeDisabled();
  await page.getByLabel("Type 1", { exact: true }).selectOption("str");
  await page.getByRole("button", { name: "Run query", exact: true }).click();
  await expect(page.locator(".notice.error")).toContainText(
    "No simulated results",
  );
  await page.getByRole("button", { name: "Dashboard builder" }).click();
  await expect(
    page.getByRole("button", { name: "Publish dashboard" }),
  ).toBeDisabled();
});
test("mobile does not overflow the viewport", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.route(
    "**/rpc.tiramisu.db-chain.testnet.arkiv.network/**",
    (route) => route.abort("failed"),
  );
  await page.goto("/studio");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await expect(
    page.getByRole("button", { name: "Refresh public data", exact: true }),
  ).toBeVisible();
});
test("public view rejects malformed entity key without a wallet", async ({
  page,
}) => {
  await page.goto("/d/not-a-key");
  await expect(page.locator(".notice.error")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Connect wallet" }),
  ).toHaveCount(0);
});
