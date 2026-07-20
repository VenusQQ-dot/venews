import { continueRender, delayRender, staticFile } from "remotion";

// Anthropic official brand fonts, self-hosted from public/fonts so renders
// work offline / in sandboxes (no fonts.gstatic.com fetch at render time).
const FONTS: { family: string; file: string; weight: string }[] = [
  { family: "Poppins", file: "fonts/Poppins-500.woff2", weight: "500" },
  { family: "Poppins", file: "fonts/Poppins-600.woff2", weight: "600" },
  { family: "Lora", file: "fonts/Lora.woff2", weight: "400 600" },
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

export const headingFont = "Poppins";
export const bodyFont = "Lora";

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
// Elements decelerate gently into place; nothing snaps.
export const smooth = [0.16, 1, 0.3, 1] as const;
