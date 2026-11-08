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

// Instellingen. Lokaal komen ze uit .env (zie .env.example), bij de hosting uit
// de omgevingsvariabelen. Zonder instelling wordt de echte database gebruikt.
// De publishable key mag openbaar zijn: de beveiliging zit in de database.
try {
  process.loadEnvFile(join(root, ".env"));
} catch {
  // geen .env: standaardwaarden gebruiken
}
const config = {
  SUPABASE_URL: process.env.SUPABASE_URL || "https://vxmdbjtuuvrryazrnkfx.supabase.co",
  SUPABASE_KEY: process.env.SUPABASE_KEY || "sb_publishable_RhOl_un8Ik35a73T3QLThA_niKqiuTQ",
  // Alleen voor de verhuizing: het nieuwe adres, getoond op het oude adres.
  MOVED_TO: process.env.MOVED_TO || "",
};

function fillConfig(js) {
  return js.replace(/__(SUPABASE_URL|SUPABASE_KEY|MOVED_TO)__/g, (_, name) => config[name]);
}

const sha256 = (text) => `'sha256-${createHash("sha256").update(text).digest("base64")}'`;

// Beveiligingsheaders voor de hosting (Cloudflare leest _headers).
// De Content-Security-Policy staat alleen ons eigen script toe (via de hash),
// en laat de app alleen praten met Supabase en Open Food Facts.
// Wil je een nieuwe externe dienst gebruiken? Voeg hem dan hier toe.
function headers(script) {
  const csp = [
    "default-src 'self'",
    `script-src 'self' ${sha256(script)}`,
    "style-src 'self' 'unsafe-inline'",
    "font-src 'self' data:",
    "img-src 'self' data: blob:",
    "media-src 'self'",
    `connect-src 'self' ${new URL(config.SUPABASE_URL).origin} https://world.openfoodfacts.org`,
    "worker-src 'self'",
    "manifest-src 'self'",
    "object-src 'none'",
    "base-uri 'none'",
    "form-action 'none'",
    "frame-ancestors 'none'",
  ].join("; ");
  return `/*
  Content-Security-Policy: ${csp}
  X-Content-Type-Options: nosniff
  Referrer-Policy: no-referrer
  Permissions-Policy: geolocation=(), microphone=(), camera=(), payment=(), interest-cohort=()
  Strict-Transport-Security: max-age=31536000; includeSubDomains

/sw.js
  Cache-Control: no-cache

/
  Cache-Control: no-cache

/index.html
  Cache-Control: no-cache
`;
}

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
  const script = fillConfig(bundleJs());
  const html = read("index.html")
    .replace(/<style data-src="([^"]+)"><\/style>/g, (_, file) => `<style>${inlineFonts(read(file))}</style>`)
    .replace('<script data-src="js"></script>', () => `<script>${script}</script>`);

  rmSync(dist, { recursive: true, force: true });
  mkdirSync(dist, { recursive: true });
  cpSync(join(root, "public"), dist, { recursive: true });
  writeFileSync(join(dist, "index.html"), html);
  writeFileSync(join(dist, "_headers"), headers(script));

  // Een nieuwe cachenaam bij elke wijziging, zodat dit nooit meer met de hand hoeft.
  const buildId = createHash("sha256").update(html).digest("hex").slice(0, 12);
  writeFileSync(join(dist, "sw.js"), read("sw.js").replace("__BUILD_ID__", buildId));
  return buildId;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  console.log(`dist/ gebouwd (${build()})`);
}
