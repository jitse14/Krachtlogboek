// Lokale ontwikkelserver: bouwt opnieuw bij elke wijziging in src/ of public/.
// Herlaad de pagina daarna zelf in de browser.
import { watch } from "node:fs";
import { readFile } from "node:fs/promises";
import { createServer } from "node:http";
import { dirname, extname, join, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "./build.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist");
const port = Number(process.env.PORT) || 5173;
const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".webmanifest": "application/manifest+json",
  ".png": "image/png",
  ".mp4": "video/mp4",
};

build();

// Dezelfde beveiligingsheaders als bij de hosting (het /*-blok uit dist/_headers),
// zodat je een geblokkeerd script of verzoek al lokaal in de console ziet.
async function siteHeaders() {
  const text = await readFile(join(dist, "_headers"), "utf8");
  const block = text.split(/\n(?=\S)/)[0];
  return Object.fromEntries(
    block
      .split("\n")
      .slice(1)
      .map((line) => line.trim().split(/:\s(.*)/s).slice(0, 2))
      .filter(([name]) => name && name !== "Strict-Transport-Security"),
  );
}

let timer = null;
for (const dir of ["src", "public"]) {
  watch(join(root, dir), { recursive: true }, () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      try {
        console.log(`opnieuw gebouwd (${build()})`);
      } catch (error) {
        console.error(error);
      }
    }, 100);
  });
}

createServer(async (req, res) => {
  const { pathname } = new URL(req.url, "http://localhost");
  const path = resolve(dist, `.${decodeURIComponent(pathname)}`);
  const file = pathname.endsWith("/") ? join(path, "index.html") : path;
  if (file !== dist && !file.startsWith(dist + sep)) {
    res.writeHead(403).end();
    return;
  }
  try {
    const body = await readFile(file);
    res
      .writeHead(200, { ...(await siteHeaders()), "Content-Type": types[extname(file)] ?? "application/octet-stream" })
      .end(body);
  } catch {
    res.writeHead(404).end("Niet gevonden");
  }
}).listen(port, "127.0.0.1", () => console.log(`http://localhost:${port}`));
