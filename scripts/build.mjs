// Bouwt de app uit src/ en public/ naar dist/. Heeft geen dependencies nodig.
// De JS-bestanden delen één globale scope en worden op bestandsnaam samengevoegd,
// dus de nummers in src/js/ bepalen de volgorde. Die volgorde doet ertoe.
import { createHash } from "node:crypto";
import { cpSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const src = join(root, "src");
const dist = join(root, "dist");

const read = (...parts) => readFileSync(join(src, ...parts), "utf8");

// Fonts staan als losse bestanden in src/fonts en worden in de CSS ingebakken,
// zodat de app ze ook offline altijd heeft.
function inlineFonts(css) {
  return css.replace(/url\(\.\.\/fonts\/([^)]+\.woff2)\)/g, (_, file) => {
    const data = readFileSync(join(src, "fonts", file)).toString("base64");
    return `url(data:font/woff2;base64,${data})`;
  });
}

function bundleJs() {
  return readdirSync(join(src, "js"))
    .filter((file) => file.endsWith(".js"))
    .sort()
    .map((file) => read("js", file))
    .join("");
}

export function build() {
  const html = read("index.html")
    .replace(/<style data-src="([^"]+)"><\/style>/g, (_, file) => `<style>${inlineFonts(read(file))}</style>`)
    .replace('<script data-src="js"></script>', () => `<script>${bundleJs()}</script>`);

  rmSync(dist, { recursive: true, force: true });
  mkdirSync(dist, { recursive: true });
  cpSync(join(root, "public"), dist, { recursive: true });
  writeFileSync(join(dist, "index.html"), html);

  // Een nieuwe cachenaam bij elke wijziging, zodat dit nooit meer met de hand hoeft.
  const buildId = createHash("sha256").update(html).digest("hex").slice(0, 12);
  writeFileSync(join(dist, "sw.js"), read("sw.js").replace("__BUILD_ID__", buildId));
  return buildId;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  console.log(`dist/ gebouwd (${build()})`);
}
