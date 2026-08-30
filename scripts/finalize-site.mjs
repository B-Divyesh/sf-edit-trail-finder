import { readdir, readFile, writeFile } from "node:fs/promises";
import { relative, resolve, sep } from "node:path";

const root = resolve("dist/site");
async function files(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  return (await Promise.all(entries.map((entry) => {
    const path = resolve(directory, entry.name);
    return entry.isDirectory() ? files(path) : [path];
  }))).flat();
}

const urls = (await files(root))
  .map((path) => relative(root, path).split(sep).join("/"))
  .filter((path) => path !== "sw.js" && path !== "_headers" && path !== "staticwebapp.config.json" && !path.startsWith("downloads/"))
  .map((path) => path === "index.html" ? "/" : path.endsWith("/index.html") ? `/${path.slice(0, -"/index.html".length)}/` : `/${path}`)
  .sort();
const workerPath = resolve(root, "sw.js");
const worker = await readFile(workerPath, "utf8");
await writeFile(workerPath, worker.replace("__EDIT_TRAIL_PRECACHE__", JSON.stringify(urls)));
console.log(`Precached ${urls.length} site files`);
