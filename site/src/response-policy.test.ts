import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const csp = "default-src 'self'; img-src 'self' blob: data:; script-src 'self'; style-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'";
const immutable = "public, max-age=31536000, immutable";

describe("Azure Static Web Apps response policy", () => {
  it("declares the security and immutable-cache headers required in production", async () => {
    const source = await readFile(resolve("site/public/staticwebapp.config.json"), "utf8");
    const config = JSON.parse(source) as {
      globalHeaders: Record<string, string>;
      navigationFallback?: unknown;
      responseOverrides: Record<string, { rewrite: string }>;
      routes: { route: string; headers: Record<string, string> }[];
    };

    expect(config.globalHeaders).toMatchObject({
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "strict-origin-when-cross-origin",
      "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
      "Content-Security-Policy": csp
    });
    expect(config.navigationFallback).toBeUndefined();
    expect(config.responseOverrides).toMatchObject({
      "404": { rewrite: "/404.html" }
    });
    expect(config.routes).toEqual(expect.arrayContaining([
      expect.objectContaining({
        route: "/downloads/edit-trail-linux-x86_64",
        headers: expect.objectContaining({
          "Content-Disposition": "attachment; filename=edit-trail-linux-x86_64",
          "Content-Type": "application/octet-stream"
        })
      }),
      expect.objectContaining({ route: "/assets/*", headers: { "Cache-Control": immutable } }),
      expect.objectContaining({ route: "/edit-trail-night-market.webp", headers: { "Cache-Control": immutable } }),
      expect.objectContaining({ route: "/edit-trail-night-market-1080.webp", headers: { "Cache-Control": immutable } }),
      expect.objectContaining({ route: "/edit-trail-night-market-720.webp", headers: { "Cache-Control": immutable } })
    ]));
  });

  it("@claim:deployment-artifact creates the documented static deployment artifact", async () => {
    const packageJson = JSON.parse(await readFile(resolve("package.json"), "utf8")) as { scripts: Record<string, string> };
    expect(packageJson.scripts["build:site"]).toContain("npm run build:cli");
    expect(packageJson.scripts["build:site"]).toContain("verify-deploy-artifacts.mjs");
    const verifier = await readFile(resolve("scripts/verify-deploy-artifacts.mjs"), "utf8");
    expect(verifier).toContain("0x7f, 0x45, 0x4c, 0x46");
    expect((await readFile(resolve("site/index.html"), "utf8"))).toContain("Edit Trail");
    const sourceConfig = JSON.parse(await readFile(resolve("site/public/staticwebapp.config.json"), "utf8"));
    expect(sourceConfig.globalHeaders["Content-Security-Policy"]).toBe(csp);
    expect(sourceConfig.routes.some((route: { headers?: Record<string, string> }) => route.headers?.["Cache-Control"] === immutable)).toBe(true);
  });

  it("does not expose unregistered checkout or shared verification endpoints", async () => {
    const productSources = await Promise.all([
      "site/index.html",
      "site/privacy/index.html",
      "site/terms/index.html",
      "site/src/main.ts",
      "site/public/staticwebapp.config.json"
    ].map((path) => readFile(resolve(path), "utf8")));
    const combined = productSources.join("\n");
    expect(combined).not.toContain("api.sociobot.in");
    expect(combined).not.toMatch(/checkout|\/verify\?license|sb_license:/i);
    expect(combined).toContain("Download audit recipes");
  });

  it("keeps every registered claim mapped to exactly one tagged test", async () => {
    const claims = JSON.parse(await readFile(resolve(".factory/claims.json"), "utf8")) as { id: string; test: string }[];
    const testSources = (await Promise.all([
      "site/src/demo.test.ts",
      "site/src/response-policy.test.ts",
      "tests/site/site.spec.ts"
    ].map((path) => readFile(resolve(path), "utf8")))).join("\n");
    expect(new Set(claims.map(({ id }) => id)).size).toBe(claims.length);
    for (const claim of claims) {
      const tag = `@claim:${claim.id}`;
      expect(claim.test).toContain(`--grep ${tag}`);
      expect(testSources.split(tag)).toHaveLength(2);
    }
  });
});
