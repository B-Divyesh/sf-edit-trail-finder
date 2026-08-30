import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const productionCsp = "default-src 'self'; img-src 'self' blob: data:; script-src 'self'; style-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'";

test("@claim:sample-demo hero opens an isolated sample with visible results in one click", async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on("console", (message) => { if (message.type() === "error") consoleErrors.push(message.text()); });
  await page.goto("/");
  await expect(page).toHaveTitle(/Edit Trail/);
  await expect(page.locator("h1")).toHaveCount(1);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Find RAW photos by editing steps");
  await page.getByRole("link", { name: "Try it with sample data" }).click();
  await expect(page).toHaveURL(/\/demo\/$/);
  await expect(page).toHaveTitle("Demo — Edit Trail");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Search sample editing steps");
  await expect(page.getByText("Demo — sample data, nothing is saved")).toBeVisible();
  await expect(page.locator("[data-demo-status]")).toContainText("2 of 3 sidecars");
  await expect(page.locator("[data-demo-results] article")).toHaveCount(2);
  await expect(page.locator("[data-demo-results]")).toContainText("night-market-1842.NEF");
  await expect(page.locator("[data-demo-results]")).toContainText("lantern-0917.ARW");
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
  expect(consoleErrors).toEqual([]);
});

test("demo query entry redirects to the real sandbox route and its exit discards the mode", async ({ page }) => {
  await page.goto("/?demo=1");
  await expect(page).toHaveURL(/\/demo\/$/);
  await expect(page.getByText("Demo — sample data, nothing is saved")).toBeVisible();
  await page.getByRole("link", { name: "View install options" }).click();
  await expect(page).toHaveURL(/\/#install$/);
  await expect(page.getByText("Demo — sample data, nothing is saved")).toBeHidden();
});

test("browser Back returns focus to the sample-demo trigger", async ({ page }) => {
  await page.goto("/");
  const trigger = page.getByRole("link", { name: "Try it with sample data" });
  await trigger.focus();
  await trigger.click();
  await expect(page).toHaveURL(/\/demo\/$/);
  await page.goBack();
  await expect(page).toHaveURL(/\/$/);
  await expect(trigger).toBeFocused();
});

test("demo exposes actionable malformed and empty states", async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on("console", (message) => { if (message.type() === "error") consoleErrors.push(message.text()); });
  await page.route("**/", async (route) => {
    const response = await route.fetch();
    await route.fulfill({ response, headers: { ...response.headers(), "content-security-policy": productionCsp } });
  });
  await page.goto("/#demo");
  await page.locator("#sidecar-input").fill("<broken");
  await page.getByRole("button", { name: /Find matching files/ }).click();
  await expect(page.locator("[data-demo-status]")).toContainText("Could not parse");
  expect(consoleErrors).toEqual([]);
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

test("keyboard skip link reaches main and focus remains visible", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  const skip = page.getByRole("link", { name: "Skip to main content" });
  await expect(skip).toBeFocused();
  await expect(skip).toBeVisible();
  await page.keyboard.press("Enter");
  await expect(page.locator("#main")).toBeFocused();
  await page.keyboard.press("Tab");
  const focusedOutline = await page.evaluate(() => {
    const active = document.activeElement as HTMLElement;
    const style = getComputedStyle(active);
    return { color: style.outlineColor, style: style.outlineStyle, width: style.outlineWidth };
  });
  expect(focusedOutline).toEqual({ color: "rgb(89, 243, 230)", style: "solid", width: "3px" });
});

test("reduced motion removes long transitions and smooth scrolling", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  expect(await page.locator("html").evaluate((element) => getComputedStyle(element).scrollBehavior)).toBe("auto");
  expect(parseFloat(await page.getByRole("link", { name: "Try it with sample data" }).evaluate((element) => getComputedStyle(element).transitionDuration))).toBeLessThanOrEqual(0.001);
});

test("@claim:linux-download browser receives the release executable, not HTML", async ({ page }) => {
  await page.goto("/");
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("link", { name: "Download for Linux" }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("edit-trail-linux-x86_64");
  const path = await download.path();
  expect(path).not.toBeNull();
  const bytes = readFileSync(path!);
  expect(bytes.subarray(0, 4)).toEqual(Buffer.from([0x7f, 0x45, 0x4c, 0x46]));
  expect(bytes.length).toBeGreaterThan(100_000);
});

test("@claim:cross-platform-downloads exposes executable bytes for every named platform", async ({ page, request }) => {
  await page.goto("/#install");
  await expect(page.locator(".platform-downloads a")).toHaveCount(4);
  const expected = [
    ["/downloads/edit-trail-linux-x86_64", [0x7f, 0x45, 0x4c, 0x46]],
    ["/downloads/edit-trail-macos-arm64", [0xcf, 0xfa, 0xed, 0xfe]],
    ["/downloads/edit-trail-macos-x86_64", [0xcf, 0xfa, 0xed, 0xfe]],
    ["/downloads/edit-trail-windows-x86_64.exe", [0x4d, 0x5a]]
  ];
  for (const [path, signature] of expected) {
    const response = await request.get(path as string);
    expect(response.ok()).toBe(true);
    expect([... (await response.body()).subarray(0, (signature as number[]).length)]).toEqual(signature);
  }
});

test("@claim:recipe-download audit recipes download without an account", async ({ page }) => {
  await page.goto("/#recipes");
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download audit recipes" }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("edit-trail-audit-recipes.txt");
  const path = await download.path();
  const recipes = readFileSync(path!, "utf8");
  expect(recipes).toContain("edit-trail find -o denoise -o crop --match all");
  expect(recipes.split("\n").filter((line) => line.startsWith("edit-trail "))).toHaveLength(12);
});

test("legal pages render and mobile layout does not overflow", async ({ page }) => {
  for (const path of ["/privacy/", "/terms/", "/404.html"]) {
    await page.goto(path);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator("main")).toHaveCount(1);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
    expect(overflow).toBe(false);
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  }
});

test("all routes provide their own sharing metadata and the shared shell", async ({ page }) => {
  const expected = new Map([
    ["/", "Edit Trail — Find photos by what you did to them"],
    ["/demo/", "Demo — Edit Trail"],
    ["/privacy/", "Privacy — Edit Trail"],
    ["/terms/", "Terms — Edit Trail"],
    ["/404.html", "Page not found — Edit Trail"]
  ]);
  for (const [path, title] of expected) {
    await page.goto(path);
    await expect(page).toHaveTitle(title);
    for (const selector of ["meta[name=description]", "link[rel=canonical]", "meta[property='og:title']", "meta[name='twitter:card']", "link[rel='apple-touch-icon']"]) {
      await expect(page.locator(selector)).toHaveCount(1);
    }
    await expect(page.getByRole("navigation", { name: "Main navigation" })).toContainText("Try sample data");
    await expect(page.locator("footer")).toContainText("Built by Param Factory");
  }
});

test("mobile type and direct links meet the supplied baseline", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  expect(await page.locator("body").evaluate((element) => getComputedStyle(element).fontSize)).toBe("17px");
  expect((await page.getByRole("link", { name: "Edit Trail home" }).boundingBox())!.height).toBeGreaterThanOrEqual(44);
  expect((await page.getByRole("link", { name: /Read full CLI reference/ }).boundingBox())!.height).toBeGreaterThanOrEqual(44);
  expect(parseFloat(await page.locator(".micro").first().evaluate((element) => getComputedStyle(element).fontSize))).toBeGreaterThanOrEqual(14);
  expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)).toBe(false);
});

test("first-screen facts stay inside desktop and mobile viewports", async ({ page }) => {
  for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
    await page.setViewportSize(viewport);
    await page.goto("/");
    const box = await page.locator(".hero-facts li").nth(2).boundingBox();
    expect(box).not.toBeNull();
    expect(box!.y + box!.height).toBeLessThanOrEqual(viewport.height);
  }
});

test("@claim:browser-local demo parses selected files without an upload", async ({ page }) => {
  const externalRequests: string[] = [];
  const demoRequests: string[] = [];
  page.on("request", (request) => {
    const url = new URL(request.url());
    if (url.origin !== "http://127.0.0.1:4173") externalRequests.push(request.url());
    demoRequests.push(`${request.method()} ${url.pathname}`);
  });
  await page.goto("/demo/");
  await expect(page).toHaveTitle("Demo — Edit Trail");
  demoRequests.length = 0;
  await page.locator("#sidecar-files").setInputFiles({
    name: "local.xmp",
    mimeType: "text/xml",
    buffer: Buffer.from('<sidecar><module operation="crop" enabled="true" /></sidecar>')
  });
  await page.getByRole("button", { name: /Find matching files/ }).click();
  await expect(page.locator("[data-demo-status]")).toContainText("1 of 1 sidecars");
  expect(demoRequests).toEqual([]);
  expect(externalRequests).toEqual([]);
  expect(await page.evaluate(async () => ({
    local: Object.keys(localStorage),
    session: Object.keys(sessionStorage),
    indexedDb: await indexedDB.databases()
  }))).toEqual({ local: [], session: [], indexedDb: [] });
});

test("@claim:no-runtime-third-parties root page makes no third-party runtime request", async ({ page }) => {
  const requests: string[] = [];
  page.on("request", (request) => requests.push(request.url()));
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  expect(requests).not.toEqual([]);
  expect(requests.every((url) => new URL(url).origin === "http://127.0.0.1:4173")).toBe(true);
});

test("@claim:browser-sidecar-formats browser demo accepts XMP, DOP, and PP3 sidecars", async ({ page }) => {
  await page.goto("/demo/");
  await page.locator("#sidecar-files").setInputFiles([
    { name: "xmp.NEF.xmp", mimeType: "text/xml", buffer: Buffer.from('<sidecar><module operation="crop" enabled="true" /></sidecar>') },
    { name: "dxo.dop", mimeType: "text/xml", buffer: Buffer.from('<sidecar><module operation="denoise" enabled="true" /></sidecar>') },
    { name: "rawtherapee.pp3", mimeType: "text/plain", buffer: Buffer.from("[Crop]\nEnabled=true\n") }
  ]);
  await page.getByLabel("Any selected").check();
  await page.getByRole("button", { name: /Find matching files/ }).click();
  await expect(page.locator("[data-demo-status]")).toContainText("3 of 3 sidecars");
  await expect(page.locator("[data-demo-results] article")).toHaveCount(3);
});

test("@claim:mit-license ships the MIT license and identifies it in the first-screen facts", async ({ page }) => {
  expect(existsSync(resolve("LICENSE"))).toBe(true);
  expect(readFileSync(resolve("LICENSE"), "utf8")).toContain("Permission is hereby granted, free of charge");
  await page.goto("/");
  await expect(page.locator(".hero-facts")).toContainText("MIT licensed");
});

test("@claim:offline-reload installed shell reloads with an explicit offline state", async ({ browser }) => {
  const context = await browser.newContext();
  const page = await context.newPage();
  try {
    await page.goto("/");
    await page.evaluate(async () => {
      await navigator.serviceWorker.ready;
      if (!navigator.serviceWorker.controller) {
        await new Promise<void>((resolveReady) => navigator.serviceWorker.addEventListener("controllerchange", () => resolveReady(), { once: true }));
      }
    });
    const workerState = await page.evaluate(async () => {
      const registration = await navigator.serviceWorker.ready;
      await registration.update();
      return { waiting: Boolean(registration.waiting), caches: await caches.keys() };
    });
    expect(workerState.waiting).toBe(false);
    expect(workerState.caches).toContain("edit-trail-v4");
    await context.setOffline(true);
    await page.reload({ waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Find RAW photos by editing steps");
    await page.waitForFunction(() => document.querySelector("[data-operation-options]")?.childElementCount);
    await page.evaluate(() => window.dispatchEvent(new Event("offline")));
    await expect(page.locator("[data-offline]")).toBeVisible();
    await page.getByRole("button", { name: /Find matching files/ }).click();
    await expect(page.locator("[data-demo-status]")).toContainText("2 of 3 sidecars");
  } finally {
    await context.setOffline(false);
    await context.close();
  }
});

test("@claim:local-sidecar-search CLI indexes supported sidecars without reading image pixels", async ({}, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "One CLI run is sufficient");
  const work = mkdtempSync(join(tmpdir(), "edit-trail-claim-"));
  try {
    writeFileSync(join(work, "darktable.NEF.xmp"), '<sidecar history_end="2"><module num="0" operation="crop" enabled="true"/><module num="1" operation="denoiseprofile" enabled="true"/><module num="2" operation="contrast" enabled="true"/></sidecar>');
    writeFileSync(join(work, "rawtherapee.pp3"), "[Crop]\nEnabled=true\n[Directional Pyramid Denoising]\nEnabled=1\n");
    writeFileSync(join(work, "dxo.dop"), '<sidecar><module operation="masking" enabled="true"/></sidecar>');
    writeFileSync(join(work, "broken.xmp"), "<not-closed");
    writeFileSync(join(work, "private.RAW"), "PRIVATE_PIXEL_MARKER");
    const binary = resolve("target/release/edit-trail");
    const index = join(work, "trail.json");
    execFileSync(binary, ["index", work, "--output", index, "--json"]);
    const indexed = readFileSync(index, "utf8");
    expect(indexed).not.toContain("PRIVATE_PIXEL_MARKER");
    const parsedIndex = JSON.parse(indexed);
    expect(parsedIndex.sidecars_seen).toBe(4);
    expect(parsedIndex.records.find((record: { sidecar: string }) => record.sidecar.endsWith("broken.xmp")).warnings).toHaveLength(1);
    const darktable = parsedIndex.records.find((record: { sidecar: string }) => record.sidecar.endsWith("darktable.NEF.xmp"));
    expect(darktable.operations).toEqual(expect.arrayContaining([
      { name: "crop", active: true },
      { name: "denoise", active: true }
    ]));
    expect(darktable.operations).not.toEqual(expect.arrayContaining([{ name: "contrast", active: true }]));
    const matches = JSON.parse(execFileSync(binary, ["find", "-o", "denoise", "-o", "crop", "--match", "all", "--index", index, "--json"], { encoding: "utf8" }));
    expect(matches).toHaveLength(2);
    expect(statSync(binary).size).toBeGreaterThan(100_000);
  } finally {
    rmSync(work, { recursive: true, force: true });
  }
});

test("@claim:cli-outputs CLI writes JSON, CSV, and a self-contained offline report", async ({}, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "One CLI run is sufficient");
  const parent = mkdtempSync(join(tmpdir(), "edit-trail-outputs-"));
  const workspace = join(parent, "demo");
  try {
    const binary = resolve("target/release/edit-trail");
    const summary = JSON.parse(execFileSync(binary, ["demo", "--output", workspace, "--json"], { encoding: "utf8" }));
    expect(summary.sidecars).toBe(3);
    expect(summary.matches).toBe(2);
    const report = readFileSync(summary.report, "utf8");
    expect(report).toContain("Edit Trail report");
    expect(report).not.toMatch(/(?:src|href)=["']https?:/i);
    const csv = execFileSync(binary, ["find", "-o", "crop", "--index", summary.index, "--format", "csv"], { encoding: "utf8" });
    expect(csv.split("\n")[0]).toBe("source_image,sidecar,editor,active_operations,warnings");
    expect(csv).toContain("night-market-1842.NEF");
  } finally {
    rmSync(parent, { recursive: true, force: true });
  }
});

test("@claim:cli-contract CLI returns documented exit codes without prompts", async ({}, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "One CLI run is sufficient");
  const parent = mkdtempSync(join(tmpdir(), "edit-trail-contract-"));
  const workspace = join(parent, "demo");
  try {
    const binary = resolve("target/release/edit-trail");
    const success = spawnSync(binary, ["demo", "--output", workspace, "--json"], { encoding: "utf8" });
    expect(success.status).toBe(0);
    const missing = spawnSync(binary, ["operations", "--index", join(parent, "missing.json")], { encoding: "utf8" });
    expect(missing.status).toBe(1);
    const invalid = spawnSync(binary, ["find", "-o", "crop", "--match", "invalid"], { encoding: "utf8" });
    expect(invalid.status).toBe(2);
    const noMatch = spawnSync(binary, ["find", "-o", "vignette", "--index", join(workspace, "edit-trail-demo.json")], { encoding: "utf8" });
    expect(noMatch.status).toBe(3);
    expect(noMatch.stdout).toContain("No matches");
  } finally {
    rmSync(parent, { recursive: true, force: true });
  }
});
