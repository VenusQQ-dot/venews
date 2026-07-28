// Regenerate the self-hosted, subsetted fonts in public/fonts.
//
// Reads every character used in src/deck/data.ts and asks Google Fonts for a
// woff2 containing only those glyphs (the `text=` API), keeping the CJK files
// tiny. Latin fonts (Poppins/Lora) are requested with the full latin subset.
//
//   node scripts/subset-fonts.mjs
//
// Note: on networks with a TLS-intercepting proxy, set
// NODE_EXTRA_CA_CERTS=/path/to/ca-bundle.crt so the fetch trusts the proxy.

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "public", "fonts");
mkdirSync(outDir, { recursive: true });

const UA =
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36";

// Collect the character set from the deck data.
const data = readFileSync(join(root, "src", "deck", "data.ts"), "utf8");
const chars = new Set(
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 %/:.，、。？「」（）·→",
);
for (const ch of data) {
  const o = ch.codePointAt(0);
  if (o > 0x2000 && !"{}[]<>=;`|&".includes(ch)) chars.add(ch);
}
const text = encodeURIComponent([...chars].sort().join(""));

const jobs = [
  { fam: "Noto+Sans+TC", w: 400, out: "NotoSansTC-400.woff2", text },
  { fam: "Noto+Sans+TC", w: 500, out: "NotoSansTC-500.woff2", text },
  { fam: "Noto+Sans+TC", w: 700, out: "NotoSansTC-700.woff2", text },
  { fam: "Noto+Serif+TC", w: 600, out: "NotoSerifTC-600.woff2", text },
  { fam: "Poppins", w: 500, out: "Poppins-500.woff2" },
  { fam: "Poppins", w: 600, out: "Poppins-600.woff2" },
  { fam: "Lora", w: "400;600", out: "Lora.woff2" },
];

for (const { fam, w, out, text: t } of jobs) {
  const q = t ? `&text=${t}` : "";
  const cssUrl = `https://fonts.googleapis.com/css2?family=${fam}:wght@${w}${q}&display=swap`;
  const css = await (await fetch(cssUrl, { headers: { "User-Agent": UA } })).text();
  // For latin (no text=), pick the last @font-face (the `latin` subset).
  const urls = [...css.matchAll(/url\((https:\/\/[^)]+)\)/g)].map((m) => m[1]);
  const url = urls[urls.length - 1];
  if (!url) throw new Error(`No font URL for ${fam} ${w}`);
  const buf = Buffer.from(await (await fetch(url, { headers: { "User-Agent": UA } })).arrayBuffer());
  writeFileSync(join(outDir, out), buf);
  console.log(`${out} -> ${buf.length} bytes`);
}
