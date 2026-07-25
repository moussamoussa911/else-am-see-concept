import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize } from "node:path";

const port = Number(process.env.PORT || 4176);
const root = process.cwd();
const types = {
  ".css": "text/css; charset=utf-8",
  ".gif": "image/gif",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp"
};

createServer((request, response) => {
  const pathname = decodeURIComponent(new URL(request.url, `http://${request.headers.host}`).pathname);
  const clean = normalize(pathname).replace(/^([/\\])+/, "");
  let file = join(root, clean || "index.html");
  if (!file.startsWith(root)) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }
  if (existsSync(file) && statSync(file).isDirectory()) file = join(file, "index.html");
  if (!existsSync(file) && !extname(file)) file = `${file}.html`;
  if (!existsSync(file)) file = join(root, "404.html");

  response.writeHead(file.endsWith("404.html") ? 404 : 200, {
    "Cache-Control": extname(file) === ".html" ? "no-cache" : "public, max-age=604800",
    "Content-Type": types[extname(file)] || "application/octet-stream",
    "X-Content-Type-Options": "nosniff"
  });
  createReadStream(file).pipe(response);
}).listen(port, "0.0.0.0", () => {
  console.log(`Else am See concept running on http://0.0.0.0:${port}`);
});
