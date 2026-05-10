import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const projectRoot = normalize(join(__dirname, ".."));
const siteRoot = join(projectRoot, "site");
const dataRoot = join(projectRoot, "data");
const port = Number(process.env.PORT || 4177);

const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml; charset=utf-8",
};

function safePath(root, urlPath) {
  const decoded = decodeURIComponent(urlPath.split("?")[0]);
  const normalized = normalize(join(root, decoded));
  if (!normalized.startsWith(root)) return null;
  return normalized;
}

async function sendFile(response, filePath) {
  try {
    const stats = await stat(filePath);
    if (!stats.isFile()) throw new Error("Not a file");
    response.writeHead(200, {
      "Content-Type": contentTypes[extname(filePath)] || "application/octet-stream",
      "Cache-Control": "no-store",
    });
    createReadStream(filePath).pipe(response);
  } catch {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Not found");
  }
}

const server = createServer(async (request, response) => {
  const url = new URL(request.url || "/", `http://${request.headers.host}`);
  if (url.pathname.startsWith("/data/")) {
    const filePath = safePath(dataRoot, url.pathname.replace(/^\/data/, ""));
    if (!filePath) {
      response.writeHead(403);
      response.end("Forbidden");
      return;
    }
    await sendFile(response, filePath);
    return;
  }

  const pathname = url.pathname === "/" ? "/index.html" : url.pathname;
  const filePath = safePath(siteRoot, pathname);
  if (!filePath) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }
  await sendFile(response, filePath);
});

server.listen(port, () => {
  console.log(`East Meets Nash prototype: http://localhost:${port}`);
});
