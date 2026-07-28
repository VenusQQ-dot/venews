import React from "react";
import { Easing, interpolate, random, useCurrentFrame } from "remotion";
import { colors, smooth } from "../theme";

/**
 * Boil — the signature hand-drawn "breathing" wobble. Every few frames the
 * whole group nudges by a sub-pixel amount, so static line art looks alive,
 * the way frame-by-frame 2D animation "boils". Wrap any illustration in it.
 */
export const Boil: React.FC<{
  children: React.ReactNode;
  seed?: string;
  amt?: number;
  every?: number;
}> = ({ children, seed = "b", amt = 1.4, every = 5 }) => {
  const frame = useCurrentFrame();
  const step = Math.floor(frame / every);
  const dx = (random(`${seed}x${step}`) - 0.5) * amt;
  const dy = (random(`${seed}y${step}`) - 0.5) * amt;
  const r = (random(`${seed}r${step}`) - 0.5) * amt * 0.25;
  return <g transform={`translate(${dx} ${dy}) rotate(${r})`}>{children}</g>;
};

/** DrawPath — a stroke that draws itself on, hand-over-hand. */
export const DrawPath: React.FC<{
  d: string;
  delay?: number;
  dur?: number;
  color?: string;
  width?: number;
  fill?: string;
  dashLen?: number;
  cap?: "round" | "butt";
}> = ({ d, delay = 0, dur = 20, color = colors.dark, width = 3.5, fill = "none", dashLen = 1, cap = "round" }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [delay, delay + dur], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(...smooth),
  });
  const fillP = interpolate(frame, [delay + dur - 3, delay + dur + 6], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <path
      d={d}
      fill={fill}
      fillOpacity={fill === "none" ? 0 : fillP}
      stroke={color}
      strokeWidth={width}
      strokeLinecap={cap}
      strokeLinejoin="round"
      pathLength={dashLen}
      strokeDasharray={dashLen}
      strokeDashoffset={dashLen * (1 - p)}
    />
  );
};

/** Sparkle — a little four-point twinkle that pops and fades, for accents. */
export const Sparkle: React.FC<{ x: number; y: number; delay: number; size?: number; color?: string }> = ({
  x,
  y,
  delay,
  size = 16,
  color = colors.orange,
}) => {
  const frame = useCurrentFrame();
  const t = frame - delay;
  const s = interpolate(t, [0, 8, 18], [0, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const rot = interpolate(t, [0, 18], [0, 40]);
  const d = `M ${x} ${y - size} C ${x + 2} ${y - 2} ${x + 2} ${y - 2} ${x + size} ${y}
             C ${x + 2} ${y + 2} ${x + 2} ${y + 2} ${x} ${y + size}
             C ${x - 2} ${y + 2} ${x - 2} ${y + 2} ${x - size} ${y}
             C ${x - 2} ${y - 2} ${x - 2} ${y - 2} ${x} ${y - size} Z`;
  return <path d={d} fill={color} transform={`rotate(${rot} ${x} ${y}) scale(${s})`} style={{ transformOrigin: `${x}px ${y}px` }} />;
};

/**
 * DeskPerson — a loose line-drawn person at a laptop, drawn on stroke by
 * stroke, with a gentle idle bob. Coordinates live in a ~360×300 box.
 */
export const DeskPerson: React.FC<{ delay?: number; mood?: "puzzled" | "happy" }> = ({ delay = 0, mood = "puzzled" }) => {
  const frame = useCurrentFrame();
  const bob = Math.sin(frame * 0.06) * 3;
  const ink = colors.dark;
  return (
    <g transform={`translate(0 ${bob})`}>
      {/* desk line */}
      <DrawPath d="M 20 250 L 340 250" delay={delay} dur={14} width={4} />
      {/* laptop */}
      <DrawPath d="M 120 250 L 140 205 L 235 205 L 250 250 Z" delay={delay + 8} dur={16} color={ink} fill={colors.lightGray} />
      <DrawPath d="M 150 205 L 162 175 L 220 175 L 228 205 Z" delay={delay + 14} dur={16} color={ink} fill="#fff" />
      {/* head */}
      <DrawPath
        d="M 205 120 C 205 98 175 98 172 118 C 168 140 200 148 205 128 C 206 124 205 122 205 120 Z"
        delay={delay + 20}
        dur={18}
        color={ink}
        fill={colors.light}
      />
      {/* body / arm reaching to laptop */}
      <DrawPath d="M 188 148 C 182 170 178 188 196 200" delay={delay + 30} dur={16} width={4} />
      <DrawPath d="M 188 160 C 210 168 224 182 226 196" delay={delay + 36} dur={14} width={4} />
      {/* face */}
      {mood === "puzzled" ? (
        <>
          <DrawPath d="M 182 120 l 6 0" delay={delay + 42} dur={6} width={3} />
          <DrawPath d="M 193 120 l 6 0" delay={delay + 44} dur={6} width={3} />
          <DrawPath d="M 184 134 c 5 -4 10 -4 14 0" delay={delay + 48} dur={8} width={3} />
        </>
      ) : (
        <>
          <DrawPath d="M 181 118 c 3 -3 6 -3 8 0" delay={delay + 42} dur={6} width={3} />
          <DrawPath d="M 192 118 c 3 -3 6 -3 8 0" delay={delay + 44} dur={6} width={3} />
          <DrawPath d="M 183 130 c 5 6 12 6 16 0" delay={delay + 48} dur={9} width={3} />
        </>
      )}
    </g>
  );
};

/** Speech bubble that pops in with text. */
export const Bubble: React.FC<{
  x: number;
  y: number;
  delay: number;
  children: React.ReactNode;
  w?: number;
  h?: number;
  tail?: "left" | "right";
}> = ({ x, y, delay, children, w = 220, h = 92, tail = "left" }) => {
  const frame = useCurrentFrame();
  const pop = interpolate(frame, [delay, delay + 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.34, 1.56, 0.64, 1),
  });
  const tailD =
    tail === "left"
      ? `M ${x + 30} ${y + h} l -6 22 l 30 -22 Z`
      : `M ${x + w - 30} ${y + h} l 6 22 l -30 -22 Z`;
  return (
    <g transform={`scale(${pop})`} style={{ transformOrigin: `${x + w / 2}px ${y + h / 2}px` }}>
      <rect x={x} y={y} width={w} height={h} rx={20} fill="#fff" stroke={colors.dark} strokeWidth={3} />
      <path d={tailD} fill="#fff" stroke={colors.dark} strokeWidth={3} strokeLinejoin="round" />
      {children}
    </g>
  );
};

/** Lightbulb that draws on, then glows with sparkles. */
export const Lightbulb: React.FC<{ x: number; y: number; delay: number; scale?: number }> = ({ x, y, delay, scale = 1 }) => {
  const frame = useCurrentFrame();
  const glow = interpolate(frame, [delay + 22, delay + 34], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const pulse = 0.9 + Math.sin(frame * 0.15) * 0.1;
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <circle cx={0} cy={0} r={44} fill={colors.orange} opacity={glow * 0.18 * pulse} />
      <DrawPath d="M -20 -6 C -20 -34 20 -34 20 -6 C 20 6 10 10 8 22 L -8 22 C -10 10 -20 6 -20 -6 Z" delay={delay} dur={18} color={colors.dark} fill={colors.orange} />
      <DrawPath d="M -8 28 L 8 28 M -6 34 L 6 34" delay={delay + 16} dur={8} width={3} color={colors.dark} />
      {glow > 0 ? (
        <>
          <Sparkle x={-34} y={-30} delay={delay + 24} size={10} />
          <Sparkle x={36} y={-20} delay={delay + 30} size={12} />
          <Sparkle x={0} y={-52} delay={delay + 27} size={11} />
        </>
      ) : null}
    </g>
  );
};
