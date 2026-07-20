import { continueRender, delayRender, staticFile } from "remotion";

// Self-hosted fonts (public/fonts) so renders work offline / in sandboxes.
// Latin: Poppins + Lora (Anthropic brand). CJK: Noto Sans/Serif TC, subset to
// only the characters this deck uses (see scripts/subset-fonts.mjs).
const FONTS: { family: string; file: string; weight: string }[] = [
  { family: "Poppins", file: "fonts/Poppins-500.woff2", weight: "500" },
  { family: "Poppins", file: "fonts/Poppins-600.woff2", weight: "600" },
  { family: "Lora", file: "fonts/Lora.woff2", weight: "400 600" },
  { family: "Noto Sans TC", file: "fonts/NotoSansTC-400.woff2", weight: "400" },
  { family: "Noto Sans TC", file: "fonts/NotoSansTC-500.woff2", weight: "500" },
  { family: "Noto Sans TC", file: "fonts/NotoSansTC-700.woff2", weight: "700" },
  { family: "Noto Serif TC", file: "fonts/NotoSerifTC-600.woff2", weight: "600" },
];

if (typeof document !== "undefined" && "fonts" in document) {
  const handle = delayRender("Loading brand fonts");
  Promise.all(
    FONTS.map(async ({ family, file, weight }) => {
      const face = new FontFace(family, `url(${staticFile(file)})`, { weight });
      document.fonts.add(await face.load());
    }),
  )
    .then(() => continueRender(handle))
    .catch(() => continueRender(handle));
}

// Font stacks: Latin glyphs come from Poppins/Lora, CJK falls back to Noto TC.
export const displayFont = `"Lora", "Noto Serif TC", serif`; // large editorial headings
export const headingFont = `"Poppins", "Noto Sans TC", sans-serif`; // titles, labels
export const bodyFont = `"Poppins", "Noto Sans TC", sans-serif`; // body copy

// Anthropic official brand colors
export const colors = {
  dark: "#141413", // primary text / dark backgrounds
  light: "#faf9f5", // warm off-white background
  midGray: "#b0aea5", // secondary elements
  lightGray: "#e8e6dc", // subtle backgrounds / borders
  orange: "#d97757", // primary accent
  blue: "#6a9bcc", // secondary accent
  green: "#788c5d", // tertiary accent
} as const;

// The signature "Anthropic smooth" easing — a soft exponential ease-out.
export const smooth = [0.16, 1, 0.3, 1] as const;
