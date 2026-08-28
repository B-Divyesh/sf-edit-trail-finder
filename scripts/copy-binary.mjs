import { copyFile, mkdir, stat } from "node:fs/promises";
import { resolve } from "node:path";

const source = resolve("target/release/edit-trail");
const destination = resolve("dist/site/downloads/edit-trail-linux-x86_64");
await stat(source);
await mkdir(resolve("dist/site/downloads"), { recursive: true });
await copyFile(source, destination);
console.log(`Copied ${source} → ${destination}`);
