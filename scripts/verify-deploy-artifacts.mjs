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
const recording = await readFile(resolve(root, "edit-trail-demo.svg"), "utf8");
if (!recording.includes("edit-trail demo") || !recording.includes("&quot;sidecars&quot;: 3") || !recording.includes("&quot;matches&quot;: 2")) {
  throw new Error("The landing page is missing the generated CLI demo recording");
}
if (!page.includes('src="/edit-trail-demo.svg"') || !page.includes("data-cli-transcript")) {
  throw new Error("The landing page does not expose the CLI recording and text transcript");
}

const nativeDownloads = [
  ["edit-trail-macos-arm64", Buffer.from([0xcf, 0xfa, 0xed, 0xfe])],
  ["edit-trail-macos-x86_64", Buffer.from([0xcf, 0xfa, 0xed, 0xfe])],
  ["edit-trail-windows-x86_64.exe", Buffer.from([0x4d, 0x5a])]
];
for (const [name, magic] of nativeDownloads) {
  const path = resolve(root, "downloads", name);
  const bytes = await readFile(path);
  if (bytes.length < 100_000 || !bytes.subarray(0, magic.length).equals(magic)) {
    throw new Error(`${path} is not a native release executable`);
  }
  if (!page.includes(`href="/downloads/${name}"`)) {
    throw new Error(`The landing page does not expose ${name}`);
  }
}

console.log(`Verified deployable native executables and generated CLI recording (Linux ${binary.length} bytes plus macOS and Windows)`);
