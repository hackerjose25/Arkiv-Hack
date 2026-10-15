import { expect, test } from "@playwright/test";

test("landing fits the viewport and opens the existing workspace", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.route(
    "**/rpc.tiramisu.db-chain.testnet.arkiv.network/**",
    (route) => route.abort(),
  );
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Designed For Clarity.",
  );
  await expect(page.locator(".landing-video source")).toHaveAttribute(
    "src",
    "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260809_012548_ef22562c-c0ae-4816-ad9d-f8922af4e6a7.mp4",
  );
  expect(
    await page.evaluate(
      () =>
        document.documentElement.scrollHeight <= innerHeight &&
        document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: "test-results/landing-desktop.png",
    animations: "disabled",
  });
  await page.getByRole("link", { name: "Get Started" }).click();
  await expect(page).toHaveURL(/\/studio$/);
  await expect(
    page.getByRole("button", { name: "Refresh public data", exact: true }),
  ).toBeVisible();
});

test("mobile menu supports keyboard dismissal and workspace navigation", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  expect(
    await page.evaluate(
      () =>
        document.documentElement.scrollHeight <= innerHeight &&
        document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: "test-results/landing-mobile.png",
    animations: "disabled",
  });
  const burger = page.getByRole("button", { name: "Open menu" });
  await burger.click();
  await expect(
    page.getByRole("navigation", { name: "Mobile navigation" }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(burger).toBeFocused();
  await expect(burger).toHaveAttribute("aria-expanded", "false");
  await burger.click();
  await page
    .getByRole("navigation", { name: "Mobile navigation" })
    .getByRole("link", { name: "Workspace" })
    .click();
  await expect(page).toHaveURL(/\/studio$/);
});

test("reduced motion pauses the decorative background", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(
    page.getByRole("button", { name: "Play background video" }),
  ).toBeVisible();
  expect(
    await page
      .locator("video")
      .evaluate((video: HTMLVideoElement) => video.paused),
  ).toBe(true);
  await expect(page.locator(".landing-headline span").first()).toHaveCSS(
    "animation-name",
    "none",
  );
});
