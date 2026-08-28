import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("home completes the core demo with no serious accessibility issues", async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on("console", (message) => { if (message.type() === "error") consoleErrors.push(message.text()); });
  await page.goto("/");
  await expect(page).toHaveTitle(/Edit Trail/);
  await expect(page.locator("h1")).toHaveCount(1);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Search the work");
  await page.getByRole("button", { name: /Find matching files/ }).click();
  await expect(page.locator("[data-demo-status]")).toContainText("2 of 3 sidecars");
  await expect(page.locator("[data-demo-results] article")).toHaveCount(2);
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations.filter((violation) => ["serious", "critical"].includes(violation.impact ?? ""))).toEqual([]);
  expect(consoleErrors).toEqual([]);
});

test("demo exposes actionable malformed and empty states", async ({ page }) => {
  await page.goto("/#demo");
  await page.locator("#sidecar-input").fill("<broken");
  await page.getByRole("button", { name: /Find matching files/ }).click();
  await expect(page.locator("[data-demo-status]")).toContainText("Could not parse");
  await page.locator("#sidecar-input").fill("");
  await page.getByRole("button", { name: /Find matching files/ }).click();
  await expect(page.locator("[data-demo-status]")).toContainText("0 of 0 sidecars");
  await expect(page.locator(".empty-result")).toBeVisible();
});

test("command tabs support arrow-key navigation", async ({ page }) => {
  await page.goto("/#docs");
  const indexTab = page.getByRole("tab", { name: "Index" });
  await indexTab.focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("tab", { name: "Find" })).toHaveAttribute("aria-selected", "true");
  await expect(page.getByRole("tabpanel", { name: "Find" })).toBeVisible();
});

test("returned license is stored, stripped, verified, and unlocked", async ({ page }) => {
  await page.route("https://api.sociobot.in/api/v1/products/edit-trail-finder/verify**", (route) => route.fulfill({ json: { valid: true, reason: "ok", expires_at: null } }));
  await page.goto("/?license=test-token#support");
  await expect(page).toHaveURL(/\/#support$/);
  await expect(page.locator("[data-pro]")).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem("sb_license:edit-trail-finder"))).toBe("test-token");
});

test("legal pages render and mobile layout does not overflow", async ({ page }) => {
  for (const path of ["/privacy/", "/terms/"]) {
    await page.goto(path);
    await expect(page.locator("h1")).toHaveCount(1);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
    expect(overflow).toBe(false);
  }
});

test("installed shell reloads with an explicit offline state", async ({ page, context }) => {
  await page.goto("/");
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
    if (!navigator.serviceWorker.controller) {
      await new Promise<void>((resolve) => navigator.serviceWorker.addEventListener("controllerchange", () => resolve(), { once: true }));
    }
  });
  await context.setOffline(true);
  await page.reload({ waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Search the work");
  await page.waitForFunction(() => document.querySelector("[data-operation-options]")?.childElementCount);
  await page.evaluate(() => window.dispatchEvent(new Event("offline")));
  await expect(page.locator("[data-offline]")).toBeVisible();
  await context.setOffline(false);
});
