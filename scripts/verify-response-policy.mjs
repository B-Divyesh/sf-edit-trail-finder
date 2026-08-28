import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const configPath = resolve("dist/site/staticwebapp.config.json");
const config = JSON.parse(await readFile(configPath, "utf8"));
const worker = await readFile(resolve("dist/site/sw.js"), "utf8");
const csp = "default-src 'self'; img-src 'self' blob: data:; script-src 'self'; style-src 'self'; connect-src 'self' https://api.sociobot.in; object-src 'none'; base-uri 'self'; form-action 'self' https://api.sociobot.in";
const immutable = "public, max-age=31536000, immutable";
const requiredHeaders = {
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  "Content-Security-Policy": csp
};
const immutableRoutes = [
  "/assets/*",
  "/edit-trail-night-market.webp",
  "/edit-trail-night-market-1080.webp",
  "/edit-trail-night-market-720.webp"
];

for (const [header, value] of Object.entries(requiredHeaders)) {
  if (config.globalHeaders?.[header] !== value) throw new Error(`${configPath} is missing ${header}`);
}
for (const route of immutableRoutes) {
  if (!config.routes?.some((entry) => entry.route === route && entry.headers?.["Cache-Control"] === immutable)) {
    throw new Error(`${configPath} is missing immutable caching for ${route}`);
  }
}
if (worker.includes("staticwebapp.config.json")) {
  throw new Error("The Azure deployment manifest must not be precached by the service worker");
}
console.log("Verified production response policy in dist/site/staticwebapp.config.json");
