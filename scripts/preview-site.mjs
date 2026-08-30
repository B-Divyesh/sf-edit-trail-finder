import { createReadStream } from "node:fs";
import { readFile, stat } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, relative, resolve, sep } from "node:path";

const defaults = {
  host: "127.0.0.1",
  port: 4173,
  root: "dist/site"
};

function parseArguments(argumentsList) {
  const options = { ...defaults };
  for (let index = 0; index < argumentsList.length; index += 1) {
    const argument = argumentsList[index];
    if (!Object.hasOwn(options, argument.slice(2)) || !argument.startsWith("--")) {
      throw new Error(`Unknown preview option: ${argument}`);
    }
    const value = argumentsList[index + 1];
    if (!value || value.startsWith("--")) throw new Error(`Missing value for ${argument}`);
    options[argument.slice(2)] = argument === "--port" ? Number(value) : value;
    index += 1;
  }
  if (!Number.isInteger(options.port) || options.port < 0 || options.port > 65_535) {
    throw new Error(`Invalid preview port: ${options.port}`);
  }
  return options;
}

const contentTypes = new Map([
  [".css", "text/css; charset=utf-8"],
  [".html", "text/html; charset=utf-8"],
  [".ico", "image/x-icon"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".png", "image/png"],
  [".svg", "image/svg+xml"],
  [".txt", "text/plain; charset=utf-8"],
  [".webmanifest", "application/manifest+json"],
  [".webp", "image/webp"],
  [".woff", "font/woff"],
  [".woff2", "font/woff2"]
]);

function matchesRoute(pathname, route) {
  if (route.endsWith("*")) return pathname.startsWith(route.slice(0, -1));
  return pathname === route;
}

async function readPolicy(root) {
  try {
    return JSON.parse(await readFile(resolve(root, "staticwebapp.config.json"), "utf8"));
  } catch (error) {
    if (error?.code === "ENOENT") return { globalHeaders: {}, routes: [], responseOverrides: {} };
    throw error;
  }
}

async function resolveFile(root, pathname) {
  let decoded;
  try {
    decoded = decodeURIComponent(pathname);
  } catch {
    return null;
  }
  const relativePath = decoded.replace(/^\/+/, "");
  const candidate = resolve(root, relativePath || "index.html");
  const containedPath = relative(root, candidate);
  if (containedPath === ".." || containedPath.startsWith(`..${sep}`)) return null;

  try {
    const details = await stat(candidate);
    if (details.isDirectory()) {
      const indexPath = resolve(candidate, "index.html");
      const indexDetails = await stat(indexPath);
      return indexDetails.isFile() ? { path: indexPath, size: indexDetails.size } : null;
    }
    return details.isFile() ? { path: candidate, size: details.size } : null;
  } catch (error) {
    if (error?.code === "ENOENT" || error?.code === "ENOTDIR") return null;
    throw error;
  }
}

function applyHeaders(response, policy, pathname, filePath, size) {
  for (const [name, value] of Object.entries(policy.globalHeaders ?? {})) response.setHeader(name, value);
  for (const route of policy.routes ?? []) {
    if (!matchesRoute(pathname, route.route)) continue;
    for (const [name, value] of Object.entries(route.headers ?? {})) response.setHeader(name, value);
  }
  if (!response.hasHeader("Content-Type")) {
    response.setHeader("Content-Type", contentTypes.get(extname(filePath).toLowerCase()) ?? "application/octet-stream");
  }
  response.setHeader("Content-Length", size);
  response.setHeader("X-Content-Type-Options", response.getHeader("X-Content-Type-Options") ?? "nosniff");
}

async function main() {
  const options = parseArguments(process.argv.slice(2));
  const root = resolve(options.root);
  const policy = await readPolicy(root);
  let shuttingDown = false;

  const server = createServer(async (request, response) => {
    try {
      if (shuttingDown) {
        response.writeHead(503, { Connection: "close", "Content-Type": "text/plain; charset=utf-8" });
        response.end("Preview server is shutting down\n");
        return;
      }
      if (request.method !== "GET" && request.method !== "HEAD") {
        response.writeHead(405, { Allow: "GET, HEAD", "Content-Type": "text/plain; charset=utf-8" });
        response.end("Method not allowed\n");
        return;
      }

      const pathname = new URL(request.url ?? "/", "http://preview.invalid").pathname;
      let file = await resolveFile(root, pathname);
      let status = 200;
      if (!file) {
        const fallback = policy.responseOverrides?.["404"]?.rewrite;
        file = fallback ? await resolveFile(root, fallback) : null;
        status = 404;
      }
      if (!file) {
        response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
        response.end("Not found\n");
        return;
      }

      applyHeaders(response, policy, pathname, file.path, file.size);
      response.writeHead(status);
      if (request.method === "HEAD") {
        response.end();
        return;
      }

      const stream = createReadStream(file.path);
      stream.on("error", (error) => {
        if (!response.destroyed) response.destroy(error);
      });
      response.on("close", () => {
        if (!response.writableFinished) stream.destroy();
      });
      stream.pipe(response);
    } catch (error) {
      if (!response.headersSent) response.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
      if (!response.destroyed) response.end("Preview server error\n");
      process.stderr.write(`${error instanceof Error ? error.stack : String(error)}\n`);
    }
  });

  server.keepAliveTimeout = 10_000;
  server.headersTimeout = 15_000;
  server.requestTimeout = 30_000;

  const shutdown = () => {
    if (shuttingDown) return;
    shuttingDown = true;
    server.closeIdleConnections();
    server.close((error) => {
      if (error) {
        process.stderr.write(`${error.stack}\n`);
        process.exitCode = 1;
      }
    });
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);

  server.listen(options.port, options.host, () => {
    const address = server.address();
    const port = typeof address === "object" && address ? address.port : options.port;
    process.stdout.write(`Preview server listening on http://${options.host}:${port}\n`);
  });
}

main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.stack : String(error)}\n`);
  process.exitCode = 1;
});
