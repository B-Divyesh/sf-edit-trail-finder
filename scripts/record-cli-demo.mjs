import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const binary = resolve("target/release/edit-trail");
const parent = await mkdtemp(join(tmpdir(), "edit-trail-recording-"));
const workspace = join(parent, "demo");

function escapeXml(value) {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&apos;"
  })[character]);
}

function terminalSvg(transcript) {
  const lines = transcript.split("\n");
  const text = lines.map((line, index) => `<tspan x="54" dy="${index === 0 ? 0 : 42}" class="${index === 0 ? "prompt" : "output"}">${escapeXml(line)}</tspan>`).join("");
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="700" viewBox="0 0 1200 700" role="img" aria-labelledby="title description">
  <title id="title">Edit Trail CLI demo recording</title>
  <desc id="description">A real edit-trail demo run creates three sample sidecars, an index, an offline report, and finds two matches.</desc>
  <rect width="1200" height="700" fill="#0d0d10"/>
  <rect x="20" y="20" width="1160" height="660" fill="#111116" stroke="#403d47" stroke-width="2"/>
  <rect x="20" y="20" width="1160" height="58" fill="#17161c" stroke="#403d47" stroke-width="2"/>
  <circle cx="52" cy="49" r="8" fill="#ff5ca8"/><circle cx="78" cy="49" r="8" fill="#ffc857"/><circle cx="104" cy="49" r="8" fill="#66e38f"/>
  <text x="142" y="55" fill="#cfc5b4" font-family="Azeret Mono, monospace" font-size="20">edit-trail demo / recorded locally</text>
  <text x="54" y="126" fill="#fff7e6" font-family="Azeret Mono, monospace" font-size="25" xml:space="preserve">${text}</text>
  <style>.prompt { fill: #59f3e6; } .output { fill: #cfc5b4; }</style>
</svg>`;
}

try {
  const result = spawnSync(binary, ["demo", "--output", workspace, "--json"], { encoding: "utf8" });
  if (result.status !== 0) throw new Error(`edit-trail demo failed: ${result.stderr || result.stdout}`);
  const summary = JSON.parse(result.stdout);
  if (summary.workspace !== workspace || summary.sidecars !== 3 || summary.matches !== 2) {
    throw new Error("The CLI demo did not produce the expected three-sidecar, two-match result");
  }
  for (const key of ["archive", "index", "report"]) {
    if (typeof summary[key] !== "string" || !summary[key].startsWith(workspace)) throw new Error(`CLI demo did not create ${key}`);
  }

  const display = Object.fromEntries(Object.entries(summary).map(([key, value]) => [
    key,
    typeof value === "string" ? value.replace(workspace, "<temporary-directory>") : value
  ]));
  const transcript = `$ edit-trail demo --output <temporary-directory> --json\n${JSON.stringify(display, null, 2)}`;
  const svg = terminalSvg(transcript);
  await Promise.all([
    writeFile(resolve("site/public/edit-trail-demo.svg"), svg),
    writeFile(resolve("dist/site/edit-trail-demo.svg"), svg)
  ]);
  console.log("Recorded the shipped CLI demo: 3 sidecars, 2 matches");
} finally {
  await rm(parent, { recursive: true, force: true });
}
