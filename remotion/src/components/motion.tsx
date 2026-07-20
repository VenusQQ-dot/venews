import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  random,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { colors, smooth } from "../theme";

/** Spring progress 0..1 with a delay, in frames. */
export const useSpringIn = (delay = 0, damping = 14) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - delay, fps, config: { damping, mass: 0.8 } });
};

/** Ease progress 0..1 over [delay, delay+dur] with the signature easing. */
export const useEaseIn = (delay = 0, dur = 22) => {
  const frame = useCurrentFrame();
  return interpolate(frame, [delay, delay + dur], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(...smooth),
  });
};

/** Springy entrance: rises + scales into place, with an overshoot. */
export const SpringIn: React.FC<{
  children: React.ReactNode;
  delay?: number;
  distance?: number;
  scaleFrom?: number;
  damping?: number;
  style?: React.CSSProperties;
}> = ({ children, delay = 0, distance = 30, scaleFrom = 0.96, damping = 13, style }) => {
  const p = useSpringIn(delay, damping);
  return (
    <div
      style={{
        opacity: interpolate(p, [0, 0.6], [0, 1], { extrapolateRight: "clamp" }),
        transform: `translateY(${(1 - p) * distance}px) scale(${scaleFrom + (1 - scaleFrom) * p})`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/** Mask-wipe reveal: content is revealed left-to-right behind a clip, with a lift. */
export const MaskReveal: React.FC<{
  children: React.ReactNode;
  delay?: number;
  dur?: number;
  style?: React.CSSProperties;
}> = ({ children, delay = 0, dur = 26, style }) => {
  const p = useEaseIn(delay, dur);
  return (
    <div
      style={{
        clipPath: `inset(0 ${(1 - p) * 100}% -0.15em 0)`,
        transform: `translateY(${(1 - p) * 14}px)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/**
 * DrawnArrow — an SVG arrow that draws itself from a→b (optionally curved),
 * then pops its arrowhead. Coordinates are in the parent SVG's user space.
 */
export const DrawnArrow: React.FC<{
  from: [number, number];
  to: [number, number];
  delay?: number;
  dur?: number;
  color?: string;
  width?: number;
  curve?: number; // perpendicular bow, 0 = straight
  dashed?: boolean;
}> = ({ from, to, delay = 0, dur = 16, color = colors.midGray, width = 3, curve = 0, dashed = false }) => {
  const frame = useCurrentFrame();
  const [x1, y1] = from;
  const [x2, y2] = to;
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len;
  const ny = dx / len;
  const cx = mx + nx * curve;
  const cy = my + ny * curve;
  const d = `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`;

  const draw = interpolate(frame, [delay, delay + dur], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(...smooth),
  });
  const headP = interpolate(frame, [delay + dur - 2, delay + dur + 4], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  // arrowhead angle from the curve's end tangent (control point → end)
  const ang = Math.atan2(y2 - cy, x2 - cx);
  const hl = 15;
  const ha = 0.5;
  const p1 = [x2 - hl * Math.cos(ang - ha), y2 - hl * Math.sin(ang - ha)];
  const p2 = [x2 - hl * Math.cos(ang + ha), y2 - hl * Math.sin(ang + ha)];

  return (
    <g>
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={width}
        strokeLinecap="round"
        pathLength={1}
        strokeDasharray={dashed ? "6 7" : 1}
        strokeDashoffset={dashed ? 0 : 1 - draw}
        style={dashed ? { opacity: draw } : undefined}
      />
      <path
        d={`M ${p1[0]} ${p1[1]} L ${x2} ${y2} L ${p2[0]} ${p2[1]}`}
        fill="none"
        stroke={color}
        strokeWidth={width}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ opacity: headP }}
      />
    </g>
  );
};

/** An animated check-mark that draws itself inside a circle that pops in. */
export const Checkmark: React.FC<{
  delay?: number;
  size?: number;
  color?: string;
}> = ({ delay = 0, size = 44, color = colors.green }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame: frame - delay, fps, config: { damping: 10 } });
  const draw = interpolate(frame, [delay + 4, delay + 16], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(...smooth),
  });
  return (
    <svg width={size} height={size} viewBox="0 0 44 44" style={{ transform: `scale(${pop})` }}>
      <circle cx={22} cy={22} r={21} fill={color} />
      <path
        d="M 12 23 L 19 30 L 32 15"
        fill="none"
        stroke="#fff"
        strokeWidth={4}
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength={1}
        strokeDasharray={1}
        strokeDashoffset={1 - draw}
      />
    </svg>
  );
};

/** Count-up number. */
export const Counter: React.FC<{
  to: number;
  delay?: number;
  dur?: number;
  suffix?: string;
  style?: React.CSSProperties;
}> = ({ to, delay = 0, dur = 26, suffix = "", style }) => {
  const frame = useCurrentFrame();
  const v = interpolate(frame, [delay, delay + dur], [0, to], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(...smooth),
  });
  return (
    <span style={style}>
      {Math.round(v)}
      {suffix}
    </span>
  );
};

/**
 * FloatingBg — a few large, soft brand-colored blobs that drift slowly,
 * giving depth and continuous motion behind the content.
 */
export const FloatingBg: React.FC<{ tint?: "light" | "dark" }> = ({ tint = "light" }) => {
  const frame = useCurrentFrame();
  // Soft radial-gradient blobs (no CSS blur — blur is pathologically slow under
  // software rendering and stalls the render). Same soft, drifting look.
  const blobs = [
    { c: colors.orange, x: 82, y: 18, r: 620, s: 0.05 },
    { c: colors.blue, x: 10, y: 84, r: 680, s: 0.04 },
    { c: colors.green, x: 92, y: 90, r: 560, s: 0.045 },
  ];
  const toRgba = (hex: string, a: number) => {
    const n = parseInt(hex.slice(1), 16);
    return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
  };
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      {blobs.map((b, i) => {
        const drift = 30;
        const ox = Math.sin(frame * 0.01 + i * 2) * drift;
        const oy = Math.cos(frame * 0.008 + i * 1.3) * drift;
        const a = tint === "dark" ? b.s * 1.7 : b.s;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${b.x}%`,
              top: `${b.y}%`,
              width: b.r,
              height: b.r,
              marginLeft: -b.r / 2,
              marginTop: -b.r / 2,
              background: `radial-gradient(circle, ${toRgba(b.c, a)} 0%, ${toRgba(b.c, 0)} 68%)`,
              transform: `translate(${ox}px, ${oy}px)`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

/** Small drifting dots for subtle texture (deterministic via random seed). */
export const DriftDots: React.FC<{ count?: number; color?: string }> = ({
  count = 18,
  color = colors.midGray,
}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      {Array.from({ length: count }).map((_, i) => {
        const x = random(`x${i}`) * 100;
        const y0 = random(`y${i}`) * 100;
        const spd = 0.2 + random(`s${i}`) * 0.3;
        const y = (y0 - frame * spd * 0.05 + 100) % 100;
        const sz = 3 + random(`z${i}`) * 4;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${x}%`,
              top: `${y}%`,
              width: sz,
              height: sz,
              borderRadius: "50%",
              background: color,
              opacity: 0.14,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};
