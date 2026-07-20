import { loadFont as loadPoppins } from "@remotion/google-fonts/Poppins";
import { loadFont as loadLora } from "@remotion/google-fonts/Lora";

// Anthropic official brand fonts
export const { fontFamily: headingFont } = loadPoppins();
export const { fontFamily: bodyFont } = loadLora();

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
