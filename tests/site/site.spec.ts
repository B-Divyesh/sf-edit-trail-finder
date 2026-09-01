import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { execFileSync, spawnSync } from "node:child_process";
import { chmodSync, cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, statSync, unlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const productionCsp = "default-src 'self'; img-src 'self' blob: data:; script-src 'self'; style-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'";

test("@claim:sample-demo hero opens an isolated sample with visible results in one click", async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on("console", (message) => { if (message.type() === "error") consoleErrors.push(message.text()); });
  await page.addInitScript(() => localStorage.setItem("real:test-sentinel", "keep"));
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

  await page.locator("#sidecar-files").setInputFiles({
    name: "changed.xmp",
    mimeType: "text/xml",
    buffer: Buffer.from('<sidecar><module operation="masking" enabled="true" /></sidecar>')
  });
  await page.getByLabel("Any selected").check();
  await page.getByRole("button", { name: "Find matching files" }).click();
  await expect(page.locator("[data-demo-results] article")).toHaveCount(1);
  await page.getByRole("button", { name: "Reset demo" }).click();
  await expect(page.getByLabel("All selected")).toBeChecked();
  await expect(page.getByLabel("Any selected")).not.toBeChecked();
  await expect(page.locator("[data-operation-options] input:checked")).toHaveCount(2);
  await expect(page.getByLabel("crop", { exact: true })).toBeChecked();
  await expect(page.getByLabel("denoise", { exact: true })).toBeChecked();
  await expect(page.locator("#sidecar-files")).toHaveValue("");
  await expect(page.locator("#sidecar-input")).toHaveValue(/night-market-1842\.NEF\.xmp/);
  await expect(page.locator("[data-demo-status]")).toContainText("2 of 3 sidecars match all selected operations");
  await expect(page.locator("[data-demo-results] article")).toHaveCount(2);
  expect(await page.evaluate(() => localStorage.getItem("real:test-sentinel"))).toBe("keep");
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
  expect(consoleErrors).toEqual([]);
});

test("demo query entry redirects to the real sandbox route and its exit discards the mode", async ({ page }) => {
  await page.goto("/?demo=1");
  await expect(page).toHaveURL(/\/demo\/$/);
  await expect(page.getByText("Demo — sample data, nothing is saved")).toBeVisible();
  await expect(page.locator("[data-demo-results] article")).toHaveCount(2);
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
  await page.getByRole("link", { name: "Download for Linux", exact: true }).click();
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
  ] as const;
  const downloads = await Promise.all(expected.map(async ([path, signature]) => {
    const response = await request.get(path as string);
    return { path, signature, response, bytes: await response.body() };
  }));
  for (const { path, signature, response, bytes } of downloads) {
    expect(response.ok()).toBe(true);
    expect(response.headers()["content-disposition"]).toBe(`attachment; filename=${path.slice("/downloads/".length)}`);
    expect([...bytes.subarray(0, signature.length)]).toEqual([...signature]);
  }
  const lifetimeProbe = await request.get("/");
  expect(lifetimeProbe.ok()).toBe(true);
  expect(await lifetimeProbe.text()).toContain("Find RAW photos by editing steps");
});

test("@claim:recipe-download audit commands download without an account", async ({ page }) => {
  await page.goto("/#recipes");
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download audit commands" }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("edit-trail-audit-commands.txt");
  const path = await download.path();
  const recipes = readFileSync(path!, "utf8");
  const commands = recipes.split("\n").filter((line) => line.startsWith("edit-trail "));
  expect(commands).toHaveLength(12);
  expect(commands).toEqual(expect.arrayContaining([
    "edit-trail find -o masking --json",
    "edit-trail find -o crop --format csv",
    "edit-trail find -o denoise -o crop --match all",
    "edit-trail report --output full-audit.html",
    "edit-trail index ~/Pictures --include-hidden",
    "edit-trail find -o denoise --limit 1 --open"
  ]));
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
    await expect(page.locator("nav[aria-label='Main navigation']")).toContainText("Try sample data");
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

test("390px 200% text resize keeps the hero headline inside the viewport", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.evaluate(() => {
    // Snapshot first so every element is enlarged exactly once. This matches
    // browser text enlargement without compounding inherited font sizes.
    const sizes = [...document.querySelectorAll<HTMLElement>("body *")].map((element) => [element, Number.parseFloat(getComputedStyle(element).fontSize)] as const);
    for (const [element, size] of sizes) {
      if (Number.isFinite(size) && size > 0) element.style.fontSize = `${size * 2}px`;
    }
  });
  const layout = await page.evaluate(() => {
    const hero = document.querySelector<HTMLElement>(".hero")!;
    const heading = document.querySelector<HTMLElement>("h1")!;
    const heroBox = hero.getBoundingClientRect();
    const headingBox = heading.getBoundingClientRect();
    return {
      documentFits: document.documentElement.scrollWidth === document.documentElement.clientWidth,
      heroFits: hero.scrollWidth <= hero.clientWidth,
      headlineFits: heading.scrollWidth <= heading.clientWidth && headingBox.right <= heroBox.right
    };
  });
  expect(layout).toEqual({ documentFits: true, heroFits: true, headlineFits: true });
});

test("mobile navigation exposes every destination and manages keyboard focus", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const toggle = page.locator("[data-navigation-toggle]");
  await expect(toggle).toHaveAccessibleName("Open navigation menu");
  await toggle.focus();
  await page.keyboard.press("Enter");
  await expect(toggle).toHaveAttribute("aria-expanded", "true");
  const navigation = page.getByRole("navigation", { name: "Main navigation" });
  for (const name of ["Try sample data", "CLI guide", "Privacy", "Install"]) {
    await expect(navigation.getByRole("link", { name, exact: true })).toBeVisible();
  }
  await page.keyboard.press("Escape");
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  await expect(toggle).toBeFocused();

  await page.keyboard.press(" ");
  await navigation.getByRole("link", { name: "Privacy", exact: true }).click();
  await expect(page).toHaveURL(/\/privacy\/#privacy-title$/);
  await expect(page.getByRole("heading", { level: 1, name: "Privacy" })).toBeFocused();
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

test("round-four landing copy names the outcome, limits, commands, and downloads", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const sampleAction = page.getByRole("link", { name: "Try it with sample data" });
  const outcome = page.locator(".action-note");
  const installActions = page.locator(".install-actions");
  expect(await outcome.innerText()).toBe("Opens three samples and shows two matches.");
  const [sampleBox, outcomeBox, installBox] = await Promise.all([sampleAction.boundingBox(), outcome.boundingBox(), installActions.boundingBox()]);
  expect(sampleBox && outcomeBox && installBox).toBeTruthy();
  expect(outcomeBox!.y).toBeGreaterThanOrEqual(sampleBox!.y + sampleBox!.height);
  expect(outcomeBox!.y + outcomeBox!.height).toBeLessThanOrEqual(installBox!.y);
  await expect(page.locator(".hero-facts")).toContainText("Sidecars stay on your computer");
  await expect(page.locator(".hero-facts")).toContainText("Free to use · MIT licensed");
  await expect(page.getByRole("heading", { name: "What Edit Trail does not do" })).toBeVisible();
  await expect(page.locator(".limits")).toContainText("It does not render, organise, upload, or edit photos.");
  await expect(page.getByRole("heading", { name: "How Edit Trail searches sidecars" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Find files with selected edits" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "CLI behavior and outputs" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Download 12 archive audit commands" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Example search commands" })).toBeVisible();
  await expect(page.getByRole("tab", { name: "Count JSON results" })).toBeVisible();
  for (const name of ["Download for Linux x64", "Download for macOS Apple silicon", "Download for macOS Intel", "Download for Windows x64"]) {
    await expect(page.getByRole("link", { name, exact: true })).toBeVisible();
  }
  await expect(page.locator("body")).not.toContainText("recursively");
  await expect(page.locator("body")).not.toContainText("Parsing stays in this tab");
  await expect(page.locator("body")).not.toContainText("audit recipes");
});

test("@claim:cli-demo-recording landing page carries a self-hosted recording and matching text transcript", async ({ page, request }) => {
  const externalRequests: string[] = [];
  page.on("request", (event) => {
    if (new URL(event.url()).origin !== "http://127.0.0.1:4173") externalRequests.push(event.url());
  });
  await page.goto("/");
  const recording = page.locator("img[data-cli-recording]");
  await expect(recording).toBeVisible();
  await expect(recording).toHaveAttribute("src", "/edit-trail-demo.svg");
  await expect(page.getByRole("heading", { name: "Watch the CLI demo run" })).toBeVisible();
  await expect(page.locator("[data-cli-transcript]")).toContainText("edit-trail demo --output <temporary-directory> --json");
  await expect(page.locator("[data-cli-transcript]")).toContainText('"sidecars": 3');
  await expect(page.locator("[data-cli-transcript]")).toContainText('"matches": 2');
  const svg = await request.get("/edit-trail-demo.svg");
  expect(svg.ok()).toBe(true);
  const source = await svg.text();
  expect(source).toContain("edit-trail demo");
  expect(source).toContain("&quot;sidecars&quot;: 3");
  expect(source).toContain("&quot;matches&quot;: 2");
  expect(externalRequests).toEqual([]);
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
    { name: "dxo.dop", mimeType: "text/plain", buffer: readFileSync(resolve("examples/sample-archive/lantern-0917.ARW.dop")) },
    { name: "rawtherapee.pp3", mimeType: "text/plain", buffer: Buffer.from("[Crop]\nEnabled=true\n") }
  ]);
  await page.getByLabel("Any selected").check();
  await page.getByRole("button", { name: /Find matching files/ }).click();
  await expect(page.locator("[data-demo-status]")).toContainText("3 of 3 sidecars");
  await expect(page.locator("[data-demo-results] article")).toHaveCount(3);
  await expect(page.locator("[data-demo-results]")).toContainText("DxO PhotoLab");
});

test("@claim:mit-license ships the MIT license and identifies the free first-screen fact", async ({ page }) => {
  expect(existsSync(resolve("LICENSE"))).toBe(true);
  expect(readFileSync(resolve("LICENSE"), "utf8")).toContain("Permission is hereby granted, free of charge");
  await page.goto("/");
  await expect(page.locator(".hero-facts")).toContainText("Free to use · MIT licensed");
});

test("@claim:offline-reload demo and legal routes reopen with their own content while offline", async ({ browser }) => {
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
    expect(workerState.caches).toContain("edit-trail-v6");
    const cachedPaths = await page.evaluate(async () => {
      const cache = await caches.open("edit-trail-v6");
      return (await cache.keys()).map((request) => new URL(request.url).pathname);
    });
    expect(cachedPaths).toEqual(expect.arrayContaining(["/", "/demo/", "/privacy/", "/terms/"]));
    expect(cachedPaths.some((path) => path.includes("//"))).toBe(false);
    await context.setOffline(true);
    await page.getByRole("link", { name: "Try it with sample data" }).click();
    await expect(page).toHaveURL(/\/demo\/$/);
    await expect(page).toHaveTitle("Demo — Edit Trail");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Search sample editing steps");
    await expect(page.getByText("Demo — sample data, nothing is saved")).toBeVisible();
    await expect(page.locator("[data-demo-status]")).toContainText("2 of 3 sidecars");
    await expect(page.locator("[data-offline]")).toBeVisible();
    await page.reload({ waitUntil: "domcontentloaded" });
    await expect(page).toHaveTitle("Demo — Edit Trail");
    await expect(page.locator("[data-demo-status]")).toContainText("2 of 3 sidecars");

    for (const [path, title, heading] of [
      ["/privacy/", "Privacy — Edit Trail", "Privacy"],
      ["/terms/", "Terms — Edit Trail", "Terms"]
    ]) {
      await page.goto(path, { waitUntil: "domcontentloaded" });
      await expect(page).toHaveTitle(title);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(heading);
      await expect(page.locator("[data-offline]")).toBeVisible();
      await page.reload({ waitUntil: "domcontentloaded" });
      await expect(page).toHaveTitle(title);
    }
  } finally {
    await context.setOffline(false);
    await context.close();
  }
});

test("@claim:local-sidecar-search CLI indexes valid sidecars and records malformed sidecars as warnings without reading image pixels", async ({}, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "One CLI run is sufficient");
  const work = mkdtempSync(join(tmpdir(), "edit-trail-claim-"));
  try {
    writeFileSync(join(work, "darktable.NEF.xmp"), '<sidecar history_end="2"><module num="0" operation="crop" enabled="true"/><module num="1" operation="denoiseprofile" enabled="true"/><module num="2" operation="contrast" enabled="true"/></sidecar>');
    writeFileSync(join(work, "rawtherapee.pp3"), readFileSync(resolve("tests/fixtures/valid-rawtherapee.pp3")));
    writeFileSync(join(work, "dxo.dop"), readFileSync(resolve("examples/sample-archive/lantern-0917.ARW.dop")));
    writeFileSync(join(work, "broken.xmp"), "<not-closed");
    writeFileSync(join(work, "empty.pp3"), readFileSync(resolve("tests/fixtures/malformed-empty.pp3")));
    writeFileSync(join(work, "arbitrary-text.pp3"), readFileSync(resolve("tests/fixtures/malformed-arbitrary-text.pp3")));
    writeFileSync(join(work, "private.RAW"), "PRIVATE_PIXEL_MARKER");
    const binary = resolve("target/release/edit-trail");
    const index = join(work, "trail.json");
    const summary = JSON.parse(execFileSync(binary, ["index", work, "--output", index, "--json"], { encoding: "utf8" }));
    expect(summary).toMatchObject({ sidecars: 6, parsed: 3, warnings: 3 });
    const indexed = readFileSync(index, "utf8");
    expect(indexed).not.toContain("PRIVATE_PIXEL_MARKER");
    const parsedIndex = JSON.parse(indexed);
    expect(parsedIndex.root).toBe(work);
    expect(parsedIndex.sidecars_seen).toBe(6);
    expect(parsedIndex.scan_warnings).toEqual([]);
    for (const record of parsedIndex.records) {
      expect(record.sidecar).toEqual(expect.any(String));
      expect(record.source_image).toEqual(expect.any(String));
      expect(record.modified_unix).toEqual(expect.any(Number));
      expect(record.editor).toEqual(expect.any(String));
      expect(record.operations).toEqual(expect.any(Array));
      if (record.warnings !== undefined) expect(record.warnings).toEqual(expect.any(Array));
    }
    for (const name of ["broken.xmp", "empty.pp3", "arbitrary-text.pp3"]) {
      const record = parsedIndex.records.find((item: { sidecar: string }) => item.sidecar.endsWith(name));
      expect(record.warnings).toHaveLength(1);
      expect(record.warnings[0]).toContain("Could not parse sidecar:");
    }
    const darktable = parsedIndex.records.find((record: { sidecar: string }) => record.sidecar.endsWith("darktable.NEF.xmp"));
    expect(darktable.operations).toEqual(expect.arrayContaining([
      { name: "crop", active: true },
      { name: "denoise", active: true }
    ]));
    expect(darktable.operations).not.toEqual(expect.arrayContaining([{ name: "contrast", active: true }]));
    const dxo = parsedIndex.records.find((record: { sidecar: string }) => record.sidecar.endsWith("dxo.dop"));
    expect(dxo.editor).toBe("DxO PhotoLab");
    expect(dxo.operations).toEqual(expect.arrayContaining([
      { name: "crop", active: true },
      { name: "denoise", active: true },
      { name: "exposure", active: false },
      { name: "masking", active: false }
    ]));
    const matches = JSON.parse(execFileSync(binary, ["find", "-o", "denoise", "-o", "crop", "--match", "all", "--index", index, "--json"], { encoding: "utf8" }));
    expect(matches).toHaveLength(3);
    expect(statSync(binary).size).toBeGreaterThan(100_000);
  } finally {
    rmSync(work, { recursive: true, force: true });
  }
});

test("@claim:default-index-path default index works from and can be removed from a fresh directory", async ({}, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "One CLI sandbox run is sufficient");
  const work = mkdtempSync(join(tmpdir(), "edit-trail-default-index-"));
  const archive = join(work, "archive");
  try {
    cpSync(resolve("examples/sample-archive"), archive, { recursive: true });
    const binary = resolve("target/release/edit-trail");
    const indexed = spawnSync(binary, ["index", archive], { cwd: work, encoding: "utf8" });
    expect(indexed.status, indexed.stderr).toBe(0);
    const defaultIndex = join(work, ".edit-trail.json");
    expect(existsSync(defaultIndex)).toBe(true);
    const found = spawnSync(binary, ["find", "-o", "crop", "--json"], { cwd: work, encoding: "utf8" });
    expect(found.status, found.stderr).toBe(0);
    expect(JSON.parse(found.stdout)).toHaveLength(3);
    unlinkSync(defaultIndex);
    const afterDelete = spawnSync(binary, ["find", "-o", "crop", "--json"], { cwd: work, encoding: "utf8" });
    expect(afterDelete.status).toBe(1);
    expect(afterDelete.stderr).toContain("could not read .edit-trail.json");
  } finally {
    rmSync(work, { recursive: true, force: true });
  }
});

test("@claim:open-folder --open sends the matching source folder to the operating-system opener", async ({}, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "The Linux opener sandbox runs once");
  const parent = mkdtempSync(join(tmpdir(), "edit-trail-opener-"));
  const workspace = join(parent, "demo");
  try {
    const binary = resolve("target/release/edit-trail");
    const demo = spawnSync(binary, ["demo", "--output", workspace, "--json"], { encoding: "utf8" });
    expect(demo.status, demo.stderr).toBe(0);
    const summary = JSON.parse(demo.stdout);
    const openerDirectory = join(parent, "bin");
    mkdirSync(openerDirectory);
    const opener = join(openerDirectory, "xdg-open");
    const log = join(parent, "opened-path.txt");
    writeFileSync(opener, "#!/bin/sh\nprintf '%s' \"$1\" > \"$EDIT_TRAIL_OPEN_LOG\"\n");
    chmodSync(opener, 0o755);
    const opened = spawnSync(binary, ["find", "-o", "denoise", "--limit", "1", "--open", "--index", summary.index], {
      encoding: "utf8",
      env: { ...process.env, PATH: `${openerDirectory}:${process.env.PATH ?? ""}`, EDIT_TRAIL_OPEN_LOG: log }
    });
    expect(opened.status, opened.stderr).toBe(0);
    expect(readFileSync(log, "utf8")).toBe(resolve(workspace, "sample-archive"));
  } finally {
    rmSync(parent, { recursive: true, force: true });
  }
});

test("@claim:cli-private-read-only CLI makes no network call and leaves source sidecars unchanged", async ({}, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "One Linux CLI sandbox run is sufficient");
  const work = mkdtempSync(join(tmpdir(), "edit-trail-private-"));
  const archive = join(work, "archive");
  try {
    cpSync(resolve("examples/sample-archive"), archive, { recursive: true });
    const sidecars = [
      "night-market-1842.NEF.xmp",
      "lantern-0917.ARW.dop",
      "after-rain-2201.RAF.pp3"
    ];
    const snapshot = new Map(sidecars.map((name) => {
      const path = join(archive, name);
      const metadata = statSync(path);
      return [name, { bytes: readFileSync(path), mode: metadata.mode, mtimeMs: metadata.mtimeMs }];
    }));
    const interceptor = join(work, "network-deny.so");
    execFileSync("cc", ["-shared", "-fPIC", "-o", interceptor, resolve("tests/network-deny.c")]);
    const networkLog = join(work, "network-attempts.log");
    const environment = { ...process.env, LD_PRELOAD: interceptor, EDIT_TRAIL_NETWORK_LOG: networkLog };
    const binary = resolve("target/release/edit-trail");
    const index = join(work, "trail.json");
    const report = join(work, "report.html");
    for (const args of [
      ["index", archive, "--output", index, "--json"],
      ["find", "-o", "crop", "--index", index, "--json"],
      ["report", "--index", index, "--output", report]
    ]) {
      const result = spawnSync(binary, args, { encoding: "utf8", env: environment });
      expect(result.status, result.stderr).toBe(0);
    }
    expect(existsSync(networkLog) ? readFileSync(networkLog, "utf8") : "").toBe("");
    for (const name of sidecars) {
      const before = snapshot.get(name)!;
      const path = join(archive, name);
      const after = statSync(path);
      expect(readFileSync(path)).toEqual(before.bytes);
      expect(after.mode).toBe(before.mode);
      expect(after.mtimeMs).toBe(before.mtimeMs);
    }
  } finally {
    rmSync(work, { recursive: true, force: true });
  }
});

test("@claim:local-only-boundary CLI reads sidecars without changing or uploading source photos", async ({}, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "One Linux CLI sandbox run is sufficient");
  const work = mkdtempSync(join(tmpdir(), "edit-trail-boundary-"));
  const archive = join(work, "archive");
  try {
    cpSync(resolve("examples/sample-archive"), archive, { recursive: true });
    const sourcePhoto = join(archive, "night-market-1842.NEF");
    writeFileSync(sourcePhoto, "PRIVATE_PIXEL_MARKER");
    const sources = [
      "night-market-1842.NEF.xmp",
      "lantern-0917.ARW.dop",
      "after-rain-2201.RAF.pp3",
      "night-market-1842.NEF"
    ];
    const snapshot = new Map(sources.map((name) => {
      const path = join(archive, name);
      const metadata = statSync(path);
      return [name, { bytes: readFileSync(path), mode: metadata.mode, mtimeMs: metadata.mtimeMs }];
    }));
    const interceptor = join(work, "network-deny.so");
    execFileSync("cc", ["-shared", "-fPIC", "-o", interceptor, resolve("tests/network-deny.c")]);
    const networkLog = join(work, "network-attempts.log");
    const environment = { ...process.env, LD_PRELOAD: interceptor, EDIT_TRAIL_NETWORK_LOG: networkLog };
    const binary = resolve("target/release/edit-trail");
    const index = join(work, "trail.json");
    const report = join(work, "report.html");
    for (const args of [["index", archive, "--output", index, "--json"], ["report", "--index", index, "--output", report]]) {
      const result = spawnSync(binary, args, { encoding: "utf8", env: environment });
      expect(result.status, result.stderr).toBe(0);
    }
    const output = `${readFileSync(index, "utf8")}\n${readFileSync(report, "utf8")}`;
    expect(output).not.toContain("PRIVATE_PIXEL_MARKER");
    expect(existsSync(networkLog) ? readFileSync(networkLog, "utf8") : "").toBe("");
    for (const name of sources) {
      const before = snapshot.get(name)!;
      const path = join(archive, name);
      const after = statSync(path);
      expect(readFileSync(path)).toEqual(before.bytes);
      expect(after.mode).toBe(before.mode);
      expect(after.mtimeMs).toBe(before.mtimeMs);
    }
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
