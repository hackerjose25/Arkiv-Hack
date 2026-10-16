import { test, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";

test("recorded evidence labels empty historical queries and the unpublished example accurately", async ({
  page,
}) => {
  await page.goto("/evidence");
  await expect(
    page.getByRole("heading", { name: "Evidence & reuse" }),
  ).toBeVisible();
  await expect(
    page.getByText("These are dated evidence snapshots", { exact: false }),
  ).toBeVisible();
  await expect(
    page.getByText(
      "Historical definition · empty result at this observation.",
      { exact: true },
    ),
  ).toHaveCount(2);
  await expect(
    page.getByText("UNPUBLISHED FILE", { exact: true }),
  ).toBeVisible();
  const downloadPromise = page.waitForEvent("download");
  await page
    .getByRole("link", { name: "Download prepared dashboard definition" })
    .click();
  const download = await downloadPromise;
  const definition = JSON.parse(
    await readFile((await download.path())!, "utf8"),
  );
  expect(definition).toMatchObject({
    version: 1,
    network: "tiramisu",
    query: { filters: [], limit: 50 },
  });
  expect(definition.widgets).toHaveLength(2);
  expect(definition.widgets[1]).toMatchObject({
    groupBy: "$creator",
    measure: "$expiresAt",
  });
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
