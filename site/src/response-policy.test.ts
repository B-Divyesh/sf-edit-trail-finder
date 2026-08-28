import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const csp = "default-src 'self'; img-src 'self' blob: data:; script-src 'self'; style-src 'self'; connect-src 'self' https://api.sociobot.in; object-src 'none'; base-uri 'self'; form-action 'self' https://api.sociobot.in";
const immutable = "public, max-age=31536000, immutable";

describe("Azure Static Web Apps response policy", () => {
  it("declares the security and immutable-cache headers required in production", async () => {
    const source = await readFile(resolve("site/public/staticwebapp.config.json"), "utf8");
    const config = JSON.parse(source) as {
      globalHeaders: Record<string, string>;
      navigationFallback: { rewrite: string; exclude: string[] };
      routes: { route: string; headers: Record<string, string> }[];
    };

    expect(config.globalHeaders).toMatchObject({
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "strict-origin-when-cross-origin",
      "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
      "Content-Security-Policy": csp
    });
    expect(config.navigationFallback).toEqual({
      rewrite: "/index.html",
      exclude: ["/assets/*", "/*.{css,js,png,jpg,svg,webp,ico,woff2,json,txt,xml,wasm}"]
    });
    expect(config.routes).toEqual(expect.arrayContaining([
      expect.objectContaining({ route: "/assets/*", headers: { "Cache-Control": immutable } }),
      expect.objectContaining({ route: "/edit-trail-night-market.webp", headers: { "Cache-Control": immutable } }),
      expect.objectContaining({ route: "/edit-trail-night-market-1080.webp", headers: { "Cache-Control": immutable } }),
      expect.objectContaining({ route: "/edit-trail-night-market-720.webp", headers: { "Cache-Control": immutable } })
    ]));
  });
});
