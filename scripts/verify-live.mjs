import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const base = (process.argv[2] ?? "https://edit-trail-finder.sociobot.in").replace(/\/$/, "");
const evidence = resolve(process.argv[3] ?? ".factory/evidence/polish-3-live");
await mkdir(evidence, { recursive: true });
const browser = await chromium.launch();
const report = { base, checks: [], consoleErrors: [], externalRequests: [], axeViolations: [] };
const check = (condition, name) => {
  if (!condition) throw new Error(`Live check failed: ${name}`);
  report.checks.push(name);
};

try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await context.addInitScript(() => localStorage.setItem("real:test-sentinel", "keep"));
  const page = await context.newPage();
  page.on("console", (message) => {
    const expectedMissingRoute = page.url().includes("/missing-polish-3-check") && message.text().includes("404");
    if (message.type() === "error" && !expectedMissingRoute) report.consoleErrors.push(message.text());
  });
  page.on("request", (request) => {
    if (new URL(request.url()).origin !== base) report.externalRequests.push(request.url());
  });

  let response = await page.goto(`${base}/`, { waitUntil: "networkidle" });
  check(response?.status() === 200, "home returns 200");
  check(await page.title() === "Edit Trail — Find photos by what you did to them", "home has its route title");
  check(await page.locator("h1").count() === 1 && await page.locator("main").count() === 1, "home has one h1 and one main");
  check(!(await page.locator("body").innerText()).includes("247"), "unproved 247 count is absent");
  check((await page.locator("body").innerText()).includes("Malformed sidecars are recorded as warnings, and scanning continues."), "plain scan wording is live");
  check((await page.locator("body").innerText()).includes("CLI commands for sidecar searches"), "descriptive CLI heading is live");
  check(/exports\s+JSON/i.test(await page.locator(".proof-strip").innerText()), "JSON fact names its output");
  const internalLinks = await page.locator("a[href]").evaluateAll((links, origin) => [...new Set(links.map((link) => new URL(link.getAttribute("href"), origin).href).filter((href) => new URL(href).origin === origin))], base);
  for (const href of internalLinks) {
    const linkResponse = await context.request.get(href);
    check(linkResponse.ok(), `internal link resolves: ${new URL(href).pathname}${new URL(href).hash}`);
  }
  const nativeSignatures = new Map([
    ["/downloads/edit-trail-linux-x86_64", [0x7f, 0x45, 0x4c, 0x46]],
    ["/downloads/edit-trail-macos-arm64", [0xcf, 0xfa, 0xed, 0xfe]],
    ["/downloads/edit-trail-macos-x86_64", [0xcf, 0xfa, 0xed, 0xfe]],
    ["/downloads/edit-trail-windows-x86_64.exe", [0x4d, 0x5a]]
  ]);
  for (const [path, signature] of nativeSignatures) {
    const downloadResponse = await context.request.get(`${base}${path}`);
    const bytes = await downloadResponse.body();
    check(downloadResponse.ok() && signature.every((byte, index) => bytes[index] === byte), `${path} serves its native executable`);
  }
  const desktopFact = await page.locator(".hero-facts li").last().boundingBox();
  check(Boolean(desktopFact && desktopFact.y + desktopFact.height <= 900), "desktop first-screen facts fit the viewport");
  await page.screenshot({ path: resolve(evidence, "home-desktop.png"), fullPage: true });

  const trigger = page.getByRole("link", { name: "Try it with sample data" });
  await trigger.focus();
  await trigger.click();
  await page.waitForURL(`${base}/demo/`);
  check(await page.locator("[data-demo-results] article").count() === 2, "one click opens two sample results");
  check((await page.locator("[data-demo-status]").innerText()).includes("2 of 3 sidecars match all"), "demo opens in the tested default search");
  check(await page.getByText("Demo — sample data, nothing is saved").isVisible(), "demo isolation banner is persistent");
  await page.locator("#sidecar-files").setInputFiles({ name: "changed.xmp", mimeType: "text/xml", buffer: Buffer.from('<sidecar><module operation="masking" enabled="true" /></sidecar>') });
  await page.getByLabel("Any selected").check();
  await page.getByRole("button", { name: "Find matching files" }).click();
  await page.getByRole("button", { name: "Reset demo" }).click();
  check(await page.getByLabel("All selected").isChecked() && !await page.getByLabel("Any selected").isChecked(), "reset restores the all-match rule");
  check(await page.locator("[data-operation-options] input:checked").evaluateAll((items) => items.map((item) => item.value).sort().join(",")) === "crop,denoise", "reset restores crop and denoise only");
  check(await page.locator("#sidecar-files").inputValue() === "", "reset clears the file picker");
  check(await page.locator("[data-demo-results] article").count() === 2, "reset redraws the two initial results");
  check(await page.evaluate(() => localStorage.getItem("real:test-sentinel")) === "keep", "demo leaves real storage untouched");
  await page.screenshot({ path: resolve(evidence, "demo-reset-desktop.png"), fullPage: false });
  await page.getByRole("link", { name: "View install options" }).click();
  check(page.url() === `${base}/#install`, "demo exit reaches the real install section");
  check(!await page.getByText("Demo — sample data, nothing is saved").isVisible(), "demo banner is absent after exit");
  await page.goBack();
  await page.goBack();
  check(await trigger.evaluate((element) => element === document.activeElement), "browser Back restores the demo trigger focus");

  const recipeDownload = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download audit recipes" }).click();
  const recipePath = await (await recipeDownload).path();
  const recipes = await readFile(recipePath, "utf8");
  check(recipes.split("\n").filter((line) => line.startsWith("edit-trail ")).length === 12, "live recipe pack contains 12 commands");
  check(recipes.includes("edit-trail find -o denoise --limit 1 --open"), "live recipe pack contains the tested folder-opening command");

  await page.goto(`${base}/?demo=1`, { waitUntil: "networkidle" });
  check(page.url() === `${base}/demo/`, "?demo=1 enters the real demo route");
  check(await page.locator("[data-demo-results] article").count() === 2, "?demo=1 shows results without a second action");

  const routeTitles = new Map([
    ["/", "Edit Trail — Find photos by what you did to them"],
    ["/demo/", "Demo — Edit Trail"],
    ["/privacy/", "Privacy — Edit Trail"],
    ["/terms/", "Terms — Edit Trail"]
  ]);
  for (const [path, title] of routeTitles) {
    response = await page.goto(`${base}${path}`, { waitUntil: "networkidle" });
    check(response?.status() === 200 && await page.title() === title, `${path} returns 200 with its title`);
    if (path === "/privacy/") check((await page.locator("main").innerText()).includes("Delete .edit-trail.json to remove the default CLI index."), "privacy gives tested default-index deletion guidance");
    for (const selector of ["meta[name=description]", "link[rel=canonical]", "meta[property='og:title']", "meta[name='twitter:card']", "link[rel='apple-touch-icon']"]) {
      check(await page.locator(selector).count() === 1, `${path} includes ${selector}`);
    }
    check(await page.locator("header nav").count() === 1 && await page.locator("footer a[href='/privacy/']").count() === 1 && await page.locator("footer a[href='/terms/']").count() === 1, `${path} has the shared legal shell`);
    const axe = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
    report.axeViolations.push(...axe.violations.map((violation) => `${path}:${violation.id}`));
  }
  response = await page.goto(`${base}/missing-polish-3-check`, { waitUntil: "networkidle" });
  check(response?.status() === 404, "unknown route returns HTTP 404");
  check(await page.title() === "Page not found — Edit Trail" && await page.getByRole("link", { name: "Return to Edit Trail" }).isVisible(), "404 is designed and links home");
  const notFoundAxe = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
  report.axeViolations.push(...notFoundAxe.violations.map((violation) => `/404:${violation.id}`));

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${base}/`, { waitUntil: "networkidle" });
  const mobileFact = await page.locator(".hero-facts li").last().boundingBox();
  check(Boolean(mobileFact && mobileFact.y + mobileFact.height <= 844), "mobile first-screen facts fit the viewport");
  check(await page.evaluate(() => document.documentElement.scrollWidth === document.documentElement.clientWidth), "mobile home has no horizontal overflow");
  const menuToggle = page.getByRole("button", { name: "Open navigation menu" });
  await menuToggle.focus();
  await page.keyboard.press("Enter");
  const mobileNavigation = page.getByRole("navigation", { name: "Main navigation" });
  for (const name of ["Try sample data", "CLI guide", "Privacy", "Install"]) {
    check(await mobileNavigation.getByRole("link", { name, exact: true }).isVisible(), `mobile menu exposes ${name}`);
  }
  await page.screenshot({ path: resolve(evidence, "mobile-menu.png"), fullPage: false });
  await page.keyboard.press("Escape");
  check(await menuToggle.getAttribute("aria-expanded") === "false" && await menuToggle.evaluate((element) => element === document.activeElement), "Escape closes the mobile menu and returns focus");
  await page.keyboard.press(" ");
  await mobileNavigation.getByRole("link", { name: "Privacy", exact: true }).click();
  await page.waitForURL(`${base}/privacy/#privacy-title`);
  check(await page.getByRole("heading", { level: 1, name: "Privacy" }).evaluate((element) => element === document.activeElement), "mobile Privacy navigation focuses the route heading");
  await page.goto(`${base}/`, { waitUntil: "networkidle" });
  await page.screenshot({ path: resolve(evidence, "home-mobile.png"), fullPage: true });
  await page.goto(`${base}/demo/`, { waitUntil: "networkidle" });
  check(await page.evaluate(() => document.documentElement.scrollWidth === document.documentElement.clientWidth), "mobile demo has no horizontal overflow");
  await page.screenshot({ path: resolve(evidence, "demo-mobile.png"), fullPage: false });
  await context.close();

  const offlineContext = await browser.newContext();
  const offlinePage = await offlineContext.newPage();
  await offlinePage.goto(`${base}/`);
  await offlinePage.evaluate(async () => {
    await navigator.serviceWorker.ready;
    if (!navigator.serviceWorker.controller) await new Promise((done) => navigator.serviceWorker.addEventListener("controllerchange", done, { once: true }));
  });
  await offlineContext.setOffline(true);
  for (const [path, title] of [["/demo/", "Demo — Edit Trail"], ["/privacy/", "Privacy — Edit Trail"], ["/terms/", "Terms — Edit Trail"]]) {
    await offlinePage.goto(`${base}${path}`, { waitUntil: "domcontentloaded" });
    await offlinePage.reload({ waitUntil: "domcontentloaded" });
    check(await offlinePage.title() === title, `${path} reloads offline with its own document`);
  }
  await offlineContext.setOffline(false);
  await offlineContext.close();

  const header = await fetch(`${base}/`, { cache: "no-store" });
  check(header.headers.get("content-security-policy")?.includes("frame-ancestors 'none'") === true, "live CSP prevents framing");
  check(report.consoleErrors.length === 0, "live browser emitted no console errors");
  check(report.externalRequests.length === 0, "live product flow made no third-party requests");
  check(report.axeViolations.length === 0, "axe found no WCAG 2 A/AA violations on five routes");

  await writeFile(resolve(evidence, "live-check.json"), JSON.stringify(report, null, 2));
  console.log(JSON.stringify({ checks: report.checks.length, consoleErrors: report.consoleErrors.length, externalRequests: report.externalRequests.length, axeViolations: report.axeViolations.length }));
} finally {
  await browser.close();
}
