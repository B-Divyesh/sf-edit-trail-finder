import { spawn, type ChildProcessWithoutNullStreams } from "node:child_process";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { afterEach, describe, expect, it } from "vitest";

const children = new Set<ChildProcessWithoutNullStreams>();
const temporaryDirectories = new Set<string>();

afterEach(async () => {
  for (const child of children) {
    if (child.exitCode === null) child.kill("SIGKILL");
  }
  children.clear();
  await Promise.all([...temporaryDirectories].map((directory) => rm(directory, { recursive: true, force: true })));
  temporaryDirectories.clear();
});

function waitForReady(child: ChildProcessWithoutNullStreams): Promise<number> {
  return new Promise((resolveReady, reject) => {
    let output = "";
    const timeout = setTimeout(() => reject(new Error(`Preview did not start. Output: ${output}`)), 5_000);
    child.stdout.on("data", (chunk: Buffer) => {
      output += chunk.toString();
      const match = output.match(/Preview server listening on http:\/\/127\.0\.0\.1:(\d+)/);
      if (!match) return;
      clearTimeout(timeout);
      resolveReady(Number(match[1]));
    });
    child.stderr.on("data", (chunk: Buffer) => { output += chunk.toString(); });
    child.once("exit", (code) => {
      clearTimeout(timeout);
      reject(new Error(`Preview exited before it was ready with code ${code}. Output: ${output}`));
    });
  });
}

function waitForExit(child: ChildProcessWithoutNullStreams): Promise<number | null> {
  return new Promise((resolveExit) => child.once("exit", (code) => resolveExit(code)));
}

describe("production preview lifetime", () => {
  it("keeps serving after concurrent native downloads and exits cleanly on SIGTERM", async () => {
    const root = await mkdtemp(join(tmpdir(), "edit-trail-preview-"));
    temporaryDirectories.add(root);
    await mkdir(join(root, "downloads"));
    await writeFile(join(root, "index.html"), "<!doctype html><title>Preview fixture</title>");
    await writeFile(join(root, "404.html"), "<!doctype html><title>Not found</title>");

    const downloads = [
      ["edit-trail-linux-x86_64", [0x7f, 0x45, 0x4c, 0x46]],
      ["edit-trail-macos-arm64", [0xcf, 0xfa, 0xed, 0xfe]],
      ["edit-trail-macos-x86_64", [0xcf, 0xfa, 0xed, 0xfe]],
      ["edit-trail-windows-x86_64.exe", [0x4d, 0x5a]]
    ] as const;
    for (const [name, signature] of downloads) {
      const bytes = Buffer.alloc(1_100_000, 0x5a);
      Buffer.from(signature).copy(bytes);
      await writeFile(join(root, "downloads", name), bytes);
    }
    await writeFile(join(root, "staticwebapp.config.json"), JSON.stringify({
      globalHeaders: { "X-Content-Type-Options": "nosniff" },
      responseOverrides: { "404": { rewrite: "/404.html" } },
      routes: downloads.map(([name]) => ({
        route: `/downloads/${name}`,
        headers: {
          "Content-Disposition": `attachment; filename=${name}`,
          "Content-Type": "application/octet-stream"
        }
      }))
    }));

    const child = spawn(process.execPath, [resolve("scripts/preview-site.mjs"), "--root", root, "--host", "127.0.0.1", "--port", "0"], {
      stdio: ["pipe", "pipe", "pipe"]
    });
    children.add(child);
    const port = await waitForReady(child);
    const origin = `http://127.0.0.1:${port}`;

    const responses = await Promise.all(Array.from({ length: 3 }, () => downloads.map(async ([name, signature]) => {
      const response = await fetch(`${origin}/downloads/${name}`);
      const bytes = new Uint8Array(await response.arrayBuffer());
      return { response, bytes, signature };
    })).flat());
    for (const { response, bytes, signature } of responses) {
      expect(response.status).toBe(200);
      expect([...bytes.subarray(0, signature.length)]).toEqual([...signature]);
      expect(bytes.length).toBe(1_100_000);
    }

    expect(child.exitCode).toBeNull();
    const lifetimeProbe = await fetch(`${origin}/`);
    expect(lifetimeProbe.status).toBe(200);
    expect(await lifetimeProbe.text()).toContain("Preview fixture");

    const exit = waitForExit(child);
    child.kill("SIGTERM");
    expect(await exit).toBe(0);
    children.delete(child);
  });
});
