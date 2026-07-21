import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { bodyFont, colors, displayFont, headingFont, smooth } from "../theme";
import { Boil, Bubble, DeskPerson, DrawPath, Lightbulb, Sparkle } from "./illustrations";
import { DriftDots } from "../components/motion";

/**
 * OpeningScene — a hand-drawn illustrated opening: a puzzled person gets a bad
 * AI image, then a lightbulb — "the problem isn't the AI, it's the prompt".
 * Everything is line art that draws itself on and "boils" (hand-drawn wobble).
 */
export const OpeningScene: React.FC = () => {
  const frame = useCurrentFrame();

  const titleP = interpolate(frame, [70, 96], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(...smooth),
  });
  const kickerP = interpolate(frame, [60, 78], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ backgroundColor: colors.light }}>
      <DriftDots count={14} color={colors.midGray} />

      <svg viewBox="0 0 1920 1080" style={{ position: "absolute", inset: 0 }}>
        {/* ---- illustration, lower-left ---- */}
        <g transform="translate(150 470) scale(2.15)">
          <Boil seed="scene" amt={1.5}>
            <DeskPerson delay={6} mood={frame < 150 ? "puzzled" : "happy"} />
          </Boil>
        </g>

        {/* ---- the "bad AI image" card the person is frowning at ---- */}
        <g transform="translate(560 300) rotate(-5)">
          <Boil seed="card" amt={1.2}>
            <DrawPath d="M 0 0 L 250 0 L 250 190 L 0 190 Z" delay={40} dur={16} color={colors.dark} fill="#fff" width={3.5} />
            {/* messy scribble = a bad generation */}
            <DrawPath d="M 30 60 C 90 20 120 120 180 70 C 210 45 230 110 220 140" delay={54} dur={20} color={colors.midGray} width={5} />
            <DrawPath d="M 40 150 C 100 120 150 165 210 150" delay={60} dur={14} color={colors.midGray} width={5} />
            {/* red cross-out */}
            <DrawPath d="M 40 40 L 210 155" delay={78} dur={10} color={colors.orange} width={6} />
            <DrawPath d="M 210 40 L 40 155" delay={84} dur={10} color={colors.orange} width={6} />
          </Boil>
        </g>

        {/* ---- speech bubble ---- */}
        <Bubble x={470} y={150} delay={94} w={300} h={96} tail="left">
          <text x={620} y={205} fontFamily={bodyFont} fontSize={34} fill={colors.dark} textAnchor="middle" fontWeight={500}>
            這張圖不對…
          </text>
        </Bubble>

        {/* ---- lightbulb: the idea ---- */}
        <g transform="translate(430 250)">
          <Lightbulb x={0} y={0} delay={128} scale={1.5} />
        </g>
        <Sparkle x={360} y={640} delay={140} size={16} color={colors.blue} />
        <Sparkle x={880} y={720} delay={150} size={18} color={colors.green} />

        {/* ---- hand-drawn underline under 指令 ---- */}
        <g style={{ opacity: titleP }}>
          <DrawPath
            d="M 1340 666 C 1410 654 1500 654 1545 666 C 1495 670 1400 670 1340 674"
            delay={104}
            dur={22}
            color={colors.orange}
            width={9}
            fill="none"
          />
        </g>
      </svg>

      {/* ---- title text, right ---- */}
      <div style={{ position: "absolute", left: 1050, top: 380, width: 760 }}>
        <div style={{ fontFamily: headingFont, fontWeight: 700, fontSize: 34, letterSpacing: "0.14em", color: colors.orange, opacity: kickerP, marginBottom: 24 }}>
          開場
        </div>
        <div
          style={{
            fontFamily: displayFont,
            fontWeight: 600,
            fontSize: 96,
            lineHeight: 1.18,
            color: colors.dark,
            opacity: titleP,
            transform: `translateY(${(1 - titleP) * 20}px)`,
          }}
        >
          問題不在 AI，<br />在你的<span style={{ color: colors.orange }}>指令</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
