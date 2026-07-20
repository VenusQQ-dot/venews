import React from "react";
import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { body, DrawUnderline, heading, RiseIn, Slide, WordsIn } from "./components/anim";
import { AnthropicMark, ChatMock } from "./components/ChatMock";
import { colors, smooth } from "./theme";

/* 1 — Title */
export const TitleSlide: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const spin = interpolate(frame, [0, 40], [-40, 0], {
    extrapolateRight: "clamp",
    easing: Easing.bezier(...smooth),
  });
  const markScale = spring({ frame, fps, config: { damping: 14 } });
  return (
    <Slide>
      <RiseIn delay={4}>
        <div style={{ transform: `rotate(${spin}deg) scale(${markScale})`, transformOrigin: "left center", marginBottom: 36 }}>
          <AnthropicMark size={92} color={colors.orange} />
        </div>
      </RiseIn>
      <RiseIn delay={10}>
        <div style={heading(120)}>Getting started</div>
      </RiseIn>
      <RiseIn delay={18}>
        <div style={{ ...heading(120), color: colors.orange }}>with Claude</div>
      </RiseIn>
      <DrawUnderline delay={34} width={420} />
      <RiseIn delay={44} style={{ marginTop: 34 }}>
        <div style={body(40)}>A short guide to chatting with your AI assistant.</div>
      </RiseIn>
    </Slide>
  );
};

/* 2 — Kinetic typography */
export const KineticSlide: React.FC = () => (
  <Slide>
    <RiseIn delay={2}>
      <div style={{ ...body(34), color: colors.midGray, marginBottom: 26 }}>THE IDEA</div>
    </RiseIn>
    <WordsIn
      text="Just tell Claude what you want in plain language."
      accent={{ plain: "orange", language: "orange" }}
      delay={8}
      perWord={5}
      style={{ ...heading(88), maxWidth: 1400 }}
    />
  </Slide>
);

/* 3 — Chat UI mockup */
export const ChatSlide: React.FC = () => (
  <Slide>
    <RiseIn delay={2} style={{ marginBottom: 40 }}>
      <div style={heading(58)}>Ask anything.</div>
    </RiseIn>
    <ChatMock
      prompt="Summarize this article in 3 bullet points."
      reply="Sure — here are the key takeaways from the article you shared."
      promptAt={10}
      replyAt={40}
    />
  </Slide>
);

/* 4 — Three features that stagger in */
const feats = [
  { c: "orange" as const, t: "Write", d: "Draft, edit and polish anything." },
  { c: "blue" as const, t: "Analyze", d: "Make sense of docs and data." },
  { c: "green" as const, t: "Build", d: "Turn ideas into working code." },
];
export const FeaturesSlide: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <Slide>
      <RiseIn delay={2} style={{ marginBottom: 56 }}>
        <div style={heading(76)}>Three things to try</div>
      </RiseIn>
      <div style={{ display: "flex", gap: 40 }}>
        {feats.map((f, i) => {
          const delay = 14 + i * 10;
          const p = interpolate(frame, [delay, delay + 24], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(...smooth),
          });
          return (
            <div
              key={f.t}
              style={{
                flex: 1,
                backgroundColor: "#fff",
                border: `1.5px solid ${colors.lightGray}`,
                borderRadius: 24,
                padding: 44,
                opacity: p,
                transform: `translateY(${(1 - p) * 40}px)`,
              }}
            >
              <div
                style={{
                  width: 66,
                  height: 66,
                  borderRadius: 18,
                  backgroundColor: colors[f.c],
                  marginBottom: 30,
                }}
              />
              <div style={{ ...heading(48), marginBottom: 14 }}>{f.t}</div>
              <div style={body(30)}>{f.d}</div>
            </div>
          );
        })}
      </div>
    </Slide>
  );
};

/* 5 — Closing */
export const ClosingSlide: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - 6, fps, config: { damping: 12 } });
  return (
    <Slide background={colors.dark}>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <div style={{ transform: `scale(${s})`, marginBottom: 44 }}>
          <AnthropicMark size={120} color={colors.orange} />
        </div>
        <RiseIn delay={16}>
          <div style={{ ...heading(96), color: colors.light, textAlign: "center" }}>
            Start the conversation.
          </div>
        </RiseIn>
        <RiseIn delay={26} style={{ marginTop: 28 }}>
          <div style={{ ...body(38), color: colors.midGray }}>claude.ai</div>
        </RiseIn>
      </AbsoluteFill>
    </Slide>
  );
};
