import { readFile, stat } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve("dist/site");
const binaryPath = resolve(root, "downloads/edit-trail-linux-x86_64");
const binary = await readFile(binaryPath);
const metadata = await stat(binaryPath);

if (binary.length < 100_000 || !binary.subarray(0, 4).equals(Buffer.from([0x7f, 0x45, 0x4c, 0x46]))) {
  throw new Error(`${binaryPath} is not the release ELF executable`);
}
if ((metadata.mode & 0o111) === 0) {
  throw new Error(`${binaryPath} is not executable`);
}

const page = await readFile(resolve(root, "index.html"), "utf8");
if (!page.includes('href="/downloads/edit-trail-linux-x86_64"')) {
  throw new Error("The landing page does not point to the deployed executable");
}

console.log(`Verified deployable Linux executable (${binary.length} bytes)`);
