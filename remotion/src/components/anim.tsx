import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { bodyFont, colors, headingFont, smooth } from "../theme";

/**
 * Slide — a full-frame container that handles the signature Anthropic
 * enter/exit: content fades + rises in on entry, fades out at the end.
 * Drop any slide content inside; timing is derived from the Sequence length.
 */
export const Slide: React.FC<{
  children: React.ReactNode;
  background?: string;
}> = ({ children, background = colors.light }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const enter = interpolate(frame, [0, 18], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(...smooth),
  });
  const exit = interpolate(
    frame,
    [durationInFrames - 15, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  return (
    <AbsoluteFill
      style={{
        backgroundColor: background,
        opacity: enter * exit,
        padding: 120,
        justifyContent: "center",
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

/**
 * RiseIn — fades and rises a block into place with a per-item delay,
 * so a stack of them staggers naturally.
 */
export const RiseIn: React.FC<{
  children: React.ReactNode;
  delay?: number;
  distance?: number;
  style?: React.CSSProperties;
}> = ({ children, delay = 0, distance = 28, style }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [delay, delay + 24], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(...smooth),
  });
  return (
    <div
      style={{
        opacity: p,
        transform: `translateY(${(1 - p) * distance}px)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/**
 * WordsIn — kinetic typography. Each word fades/rises in sequence.
 * Words wrapped in `accent` are highlighted in a brand color.
 */
export const WordsIn: React.FC<{
  text: string;
  accent?: Record<string, keyof typeof colors>;
  delay?: number;
  perWord?: number;
  style?: React.CSSProperties;
}> = ({ text, accent = {}, delay = 0, perWord = 4, style }) => {
  const frame = useCurrentFrame();
  const words = text.split(" ");
  return (
    <div style={{ display: "flex", flexWrap: "wrap", ...style }}>
      {words.map((word, i) => {
        const start = delay + i * perWord;
        const p = interpolate(frame, [start, start + 18], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.bezier(...smooth),
        });
        const clean = word.replace(/[.,!?]/g, "");
        const color = accent[clean] ? colors[accent[clean]] : colors.dark;
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              marginRight: "0.28em",
              opacity: p,
              transform: `translateY(${(1 - p) * 18}px)`,
              color,
            }}
          >
            {word}
          </span>
        );
      })}
    </div>
  );
};

/**
 * DrawUnderline — a hand-underline that draws itself left to right,
 * a recurring device in the Anthropic explainer style.
 */
export const DrawUnderline: React.FC<{
  delay?: number;
  width?: number;
  color?: string;
  height?: number;
}> = ({ delay = 0, width = 360, color = colors.orange, height = 8 }) => {
  const frame = useCurrentFrame();
  const w = interpolate(frame, [delay, delay + 26], [0, width], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(...smooth),
  });
  return (
    <div
      style={{
        width: w,
        height,
        backgroundColor: color,
        borderRadius: height,
        marginTop: 18,
      }}
    />
  );
};

export const heading = (size: number): React.CSSProperties => ({
  fontFamily: headingFont,
  fontWeight: 600,
  fontSize: size,
  lineHeight: 1.08,
  color: colors.dark,
  letterSpacing: "-0.02em",
});

export const body = (size: number): React.CSSProperties => ({
  fontFamily: bodyFont,
  fontWeight: 400,
  fontSize: size,
  lineHeight: 1.4,
  color: colors.dark,
});
