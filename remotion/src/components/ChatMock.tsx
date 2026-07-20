import React from "react";
import {
  Easing,
  interpolate,
  useCurrentFrame,
} from "remotion";
import { bodyFont, colors, headingFont, smooth } from "../theme";

/**
 * ChatMock — a simulated Claude chat panel. The user's prompt drops in,
 * then Claude's reply "types" character by character with a blinking caret,
 * mirroring the product-UI mockups used in the Anthropic explainer videos.
 */
export const ChatMock: React.FC<{
  prompt: string;
  reply: string;
  promptAt?: number;
  replyAt?: number;
  cps?: number; // characters per frame
}> = ({ prompt, reply, promptAt = 6, replyAt = 30, cps = 0.9 }) => {
  const frame = useCurrentFrame();

  const promptP = interpolate(frame, [promptAt, promptAt + 18], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(...smooth),
  });

  const typed = Math.max(0, Math.floor((frame - replyAt) * cps));
  const shown = reply.slice(0, typed);
  const typing = typed < reply.length && frame > replyAt;
  const caretOn = Math.floor(frame / 8) % 2 === 0;

  const panelP = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(...smooth),
  });

  return (
    <div
      style={{
        width: 900,
        borderRadius: 24,
        backgroundColor: "#ffffff",
        border: `1.5px solid ${colors.lightGray}`,
        boxShadow: "0 30px 80px rgba(20,20,19,0.10)",
        padding: 34,
        opacity: panelP,
        transform: `translateY(${(1 - panelP) * 24}px)`,
      }}
    >
      {/* window chrome */}
      <div style={{ display: "flex", gap: 9, marginBottom: 28 }}>
        {[colors.orange, colors.midGray, colors.midGray].map((c, i) => (
          <div
            key={i}
            style={{ width: 13, height: 13, borderRadius: 99, backgroundColor: c }}
          />
        ))}
        <div
          style={{
            marginLeft: 14,
            fontFamily: headingFont,
            fontSize: 20,
            color: colors.midGray,
            fontWeight: 500,
          }}
        >
          Claude
        </div>
      </div>

      {/* user prompt bubble */}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          opacity: promptP,
          transform: `translateY(${(1 - promptP) * 14}px)`,
        }}
      >
        <div
          style={{
            backgroundColor: colors.lightGray,
            color: colors.dark,
            fontFamily: bodyFont,
            fontSize: 30,
            lineHeight: 1.35,
            padding: "18px 26px",
            borderRadius: "22px 22px 6px 22px",
            maxWidth: 640,
          }}
        >
          {prompt}
        </div>
      </div>

      {/* Claude reply */}
      <div style={{ display: "flex", gap: 18, marginTop: 26, alignItems: "flex-start" }}>
        <div
          style={{
            flexShrink: 0,
            width: 46,
            height: 46,
            borderRadius: 12,
            backgroundColor: colors.orange,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <AnthropicMark size={26} color={colors.light} />
        </div>
        <div
          style={{
            fontFamily: bodyFont,
            fontSize: 30,
            lineHeight: 1.42,
            color: colors.dark,
            paddingTop: 4,
            minHeight: 40,
          }}
        >
          {shown}
          <span
            style={{
              opacity: typing && caretOn ? 1 : 0,
              color: colors.orange,
              fontWeight: 700,
            }}
          >
            ▍
          </span>
        </div>
      </div>
    </div>
  );
};

/** A simple Anthropic-style burst mark (the sunburst glyph). */
export const AnthropicMark: React.FC<{ size?: number; color?: string }> = ({
  size = 120,
  color = colors.dark,
}) => {
  const rays = 12;
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      {Array.from({ length: rays }).map((_, i) => {
        const a = (i / rays) * Math.PI * 2;
        return (
          <rect
            key={i}
            x={48}
            y={8}
            width={4}
            height={34}
            rx={2}
            fill={color}
            transform={`rotate(${(a * 180) / Math.PI} 50 50)`}
          />
        );
      })}
    </svg>
  );
};
