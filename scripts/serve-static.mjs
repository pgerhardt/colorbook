// Local preview only. Production nginx serves these same files directly.
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { resolve, extname, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../out/", import.meta.url));
const port = Number(process.env.PORT || 3000);
const hostname = process.env.HOST || "127.0.0.1";
const types = { ".html": "text/html; charset=utf-8", ".js": "application/javascript", ".css": "text/css", ".json": "application/json", ".txt": "text/plain; charset=utf-8", ".xml": "application/xml", ".svg": "image/svg+xml", ".png": "image/png", ".ttf": "font/ttf", ".woff": "font/woff", ".woff2": "font/woff2", ".ico": "image/x-icon" };

await stat(resolve(root, "index.html")).catch(() => {
  throw new Error("No static export found. Run npm run build first.");
});

createServer(async (request, response) => {
  if (!["GET", "HEAD"].includes(request.method)) {
    response.writeHead(405, { Allow: "GET, HEAD" }).end();
    return;
  }
  try {
    const pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
    const file = resolve(root, `.${pathname}`);
    if (!(file + sep).startsWith(root) || pathname.includes("\0")) {
      response.writeHead(400).end();
      return;
    }
    // HTML comes before the directory containing a palette's share image.
    for (const candidate of [`${file}.html`, file, resolve(file, "index.html")]) {
      try {
        if (!(await stat(candidate)).isFile()) continue;
        const content = await readFile(candidate);
        const type = candidate.endsWith("/opengraph-image") ? "image/png" : types[extname(candidate)] || "application/octet-stream";
        response.writeHead(200, { "Content-Type": type, "Content-Length": content.length, "X-Content-Type-Options": "nosniff" });
        response.end(request.method === "HEAD" ? undefined : content);
        return;
      } catch (error) {
        if (!["ENOENT", "ENOTDIR"].includes(error.code)) throw error;
      }
    }
    const content = await readFile(resolve(root, "404.html"));
    response.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
    response.end(request.method === "HEAD" ? undefined : content);
  } catch (error) {
    response.writeHead(error instanceof URIError ? 400 : 500).end();
  }
}).listen(port, hostname, () => console.log(`Color Book static preview: http://${hostname}:${port}`));
