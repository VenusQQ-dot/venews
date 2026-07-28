import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { AnthropicMark, body, DrawUnderline, display, heading } from "../components/anim";
import { DriftDots, FloatingBg, MaskReveal, SpringIn, useSpringIn } from "../components/motion";
import { bodyFont, colors, headingFont, smooth } from "../theme";
import type { Slide } from "./data";
import { SCENES } from "./scenes";

const PAD = 130;

const toneColor = (t: "orange" | "blue" | "green" | "dark") =>
  t === "dark" ? colors.dark : colors[t];

const Kicker: React.FC<{ children: React.ReactNode; delay?: number }> = ({ children, delay = 2 }) => (
  <MaskReveal delay={delay} dur={18}>
    <div
      style={{
        fontFamily: headingFont,
        fontWeight: 700,
        fontSize: 30,
        letterSpacing: "0.14em",
        color: colors.orange,
        marginBottom: 26,
      }}
    >
      {children}
    </div>
  </MaskReveal>
);

const Bullet: React.FC<{ delay: number; lead?: string; text: string; size?: number }> = ({
  delay,
  lead,
  text,
  size = 40,
}) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [delay, delay + 22], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(...smooth),
  });
  const dotPop = useSpringIn(delay, 10);
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: 22, opacity: p, transform: `translateY(${(1 - p) * 20}px)` }}>
      <div
        style={{
          flexShrink: 0,
          width: 14,
          height: 14,
          borderRadius: 99,
          backgroundColor: colors.orange,
          transform: `translateY(-4px) scale(${dotPop})`,
        }}
      />
      <div style={{ ...body(size), lineHeight: 1.42 }}>
        {lead ? <span style={{ fontFamily: headingFont, fontWeight: 700 }}>{lead}</span> : null}
        {lead ? " " : ""}
        {text}
      </div>
    </div>
  );
};

// ─── slide renderers ────────────────────────────────────────────────────────

const Cover: React.FC<Extract<Slide, { type: "cover" }>> = (s) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const markScale = spring({ frame, fps, config: { damping: 14 } });
  const spin = interpolate(frame, [0, 50], [-45, 0], { extrapolateRight: "clamp", easing: Easing.bezier(...smooth) });
  return (
    <>
      <div style={{ transform: `rotate(${spin}deg) scale(${markScale})`, transformOrigin: "left center", marginBottom: 44 }}>
        <AnthropicMark size={96} color={colors.orange} />
      </div>
      {s.title.split("\n").map((line, i) => (
        <MaskReveal key={i} delay={10 + i * 9} dur={30}>
          <div style={display(118)}>{line}</div>
        </MaskReveal>
      ))}
      <DrawUnderline delay={34} width={440} />
      <MaskReveal delay={46} dur={24} style={{ marginTop: 40 }}>
        <div style={{ ...body(42), color: colors.dark }}>{s.subtitle}</div>
      </MaskReveal>
      <SpringIn delay={56} style={{ marginTop: 20 }}>
        <div style={{ ...body(34), color: colors.midGray }}>分享人 · {s.presenter}</div>
      </SpringIn>
    </>
  );
};

const Agenda: React.FC<Extract<Slide, { type: "agenda" }>> = (s) => (
  <>
    <Kicker>AGENDA</Kicker>
    <MaskReveal delay={4} dur={26}>
      <div style={{ ...display(76), marginBottom: 50 }}>{s.title}</div>
    </MaskReveal>
    <div style={{ display: "flex", flexDirection: "column", gap: 26 }}>
      {s.items.map((it, i) => (
        <SpringIn key={it.n} delay={14 + i * 8} distance={34} damping={13}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 28 }}>
            <div style={{ fontFamily: headingFont, fontWeight: 700, fontSize: 40, color: colors.orange, width: 74 }}>{it.n}</div>
            <div style={{ ...body(44) }}>{it.label}</div>
          </div>
        </SpringIn>
      ))}
    </div>
  </>
);

const Statement: React.FC<Extract<Slide, { type: "statement" }>> = (s) => {
  const parts = s.accent ? s.title.split(s.accent) : [s.title];
  return (
    <>
      {s.kicker ? <Kicker>{s.kicker}</Kicker> : null}
      <MaskReveal delay={6} dur={30}>
        <div style={{ ...display(82), maxWidth: 1500 }}>
          {parts[0]}
          {s.accent ? <span style={{ color: colors.orange }}>{s.accent}</span> : null}
          {parts[1] ?? ""}
        </div>
      </MaskReveal>
      {s.points ? (
        <div style={{ marginTop: 54, display: "flex", flexDirection: "column", gap: 24 }}>
          {s.points.map((p, i) => (
            <Bullet key={i} delay={26 + i * 9} text={p} size={38} />
          ))}
        </div>
      ) : null}
    </>
  );
};

const Bullets: React.FC<Extract<Slide, { type: "bullets" }>> = (s) => (
  <>
    {s.kicker ? <Kicker>{s.kicker}</Kicker> : null}
    <MaskReveal delay={4} dur={26}>
      <div style={{ ...display(74), marginBottom: 54, maxWidth: 1500 }}>{s.title}</div>
    </MaskReveal>
    <div style={{ display: "flex", flexDirection: "column", gap: 30 }}>
      {s.points.map((p, i) => (
        <Bullet key={i} delay={18 + i * 10} lead={p.lead} text={p.text} />
      ))}
    </div>
  </>
);

const Split: React.FC<Extract<Slide, { type: "split" }>> = (s) => {
  const Col: React.FC<{ side: typeof s.left; delay: number }> = ({ side, delay }) => {
    const c = toneColor(side.tone);
    return (
      <SpringIn delay={delay} distance={44} damping={13} style={{ flex: 1 }}>
        <div style={{ backgroundColor: "#fff", border: `1.5px solid ${colors.lightGray}`, borderRadius: 26, padding: "44px 46px", height: "100%", boxShadow: "0 20px 50px rgba(20,20,19,0.05)" }}>
          <div style={{ display: "inline-block", fontFamily: headingFont, fontWeight: 700, fontSize: 34, color: "#fff", backgroundColor: c, padding: "8px 22px", borderRadius: 99, marginBottom: 32 }}>
            {side.label}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {side.points.map((pt, i) => (
              <div key={i} style={{ display: "flex", gap: 16, alignItems: "baseline" }}>
                <div style={{ flexShrink: 0, width: 10, height: 10, borderRadius: 99, backgroundColor: c, transform: "translateY(-3px)" }} />
                <div style={body(36)}>{pt}</div>
              </div>
            ))}
          </div>
        </div>
      </SpringIn>
    );
  };
  return (
    <>
      <MaskReveal delay={2} dur={26}>
        <div style={{ ...display(70), marginBottom: 46, maxWidth: 1600 }}>{s.title}</div>
      </MaskReveal>
      <div style={{ display: "flex", gap: 36, alignItems: "stretch" }}>
        <Col side={s.left} delay={14} />
        <Col side={s.right} delay={22} />
      </div>
      {s.footer ? (
        <SpringIn delay={34} style={{ marginTop: 42 }}>
          <div style={{ ...heading(40), color: colors.dark, textAlign: "center", fontWeight: 700 }}>{s.footer}</div>
        </SpringIn>
      ) : null}
    </>
  );
};

const Cards: React.FC<Extract<Slide, { type: "cards" }>> = (s) => (
  <>
    {s.kicker ? <Kicker>{s.kicker}</Kicker> : null}
    <MaskReveal delay={4} dur={26}>
      <div style={{ ...display(72), marginBottom: 50, maxWidth: 1600 }}>{s.title}</div>
    </MaskReveal>
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${s.columns}, 1fr)`, gap: 26 }}>
      {s.items.map((it, i) => {
        const accent = [colors.orange, colors.blue, colors.green][i % 3];
        return (
          <SpringIn key={i} delay={14 + i * 7} distance={40} damping={12}>
            <div style={{ backgroundColor: "#fff", border: `1.5px solid ${colors.lightGray}`, borderRadius: 22, padding: "34px 30px", boxShadow: "0 16px 40px rgba(20,20,19,0.05)" }}>
              <div style={{ width: 46, height: 46, borderRadius: 12, background: accent, marginBottom: 24 }} />
              <div style={{ ...heading(s.columns >= 5 ? 40 : 46), marginBottom: 16 }}>{it.k}</div>
              <div style={{ ...body(s.columns >= 5 ? 27 : 31), color: "#4a4945" }}>{it.v}</div>
            </div>
          </SpringIn>
        );
      })}
    </div>
  </>
);

const Steps: React.FC<Extract<Slide, { type: "steps" }>> = (s) => {
  const frame = useCurrentFrame();
  return (
    <>
      <MaskReveal delay={2} dur={26}>
        <div style={{ ...display(70), marginBottom: 56, maxWidth: 1600 }}>{s.title}</div>
      </MaskReveal>
      <div style={{ display: "flex", alignItems: "stretch", gap: 0, flexWrap: "wrap", rowGap: 24 }}>
        {s.steps.map((st, i) => {
          const delay = 14 + i * 9;
          const arrowP = interpolate(frame, [delay + 6, delay + 16], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          const accent = [colors.orange, colors.blue, colors.green][i % 3];
          return (
            <React.Fragment key={i}>
              <SpringIn delay={delay} distance={26} damping={12} style={{ minWidth: 210, flex: 1 }}>
                <div style={{ backgroundColor: "#fff", border: `1.5px solid ${colors.lightGray}`, borderRadius: 20, padding: "26px 26px", boxShadow: "0 14px 34px rgba(20,20,19,0.05)" }}>
                  <div style={{ fontFamily: headingFont, fontWeight: 700, fontSize: 26, color: accent, marginBottom: 12 }}>{String(i + 1).padStart(2, "0")}</div>
                  <div style={{ ...body(33), fontWeight: 500 }}>{st}</div>
                </div>
              </SpringIn>
              {i < s.steps.length - 1 ? (
                <div style={{ alignSelf: "center", color: colors.midGray, fontSize: 34, padding: "0 8px", opacity: arrowP, transform: `translateX(${(1 - arrowP) * -6}px)` }}>→</div>
              ) : null}
            </React.Fragment>
          );
        })}
      </div>
      {s.note ? (
        <SpringIn delay={14 + s.steps.length * 9 + 6} style={{ marginTop: 46 }}>
          <div style={{ ...body(32), color: "#4a4945", backgroundColor: colors.lightGray, padding: "22px 28px", borderRadius: 16, maxWidth: 1500 }}>{s.note}</div>
        </SpringIn>
      ) : null}
    </>
  );
};

const Closing: React.FC<Extract<Slide, { type: "closing" }>> = (s) => {
  const markScale = useSpringIn(4, 12);
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", padding: PAD }}>
      <div style={{ transform: `scale(${markScale}) rotate(${(1 - markScale) * -30}deg)`, marginBottom: 40 }}>
        <AnthropicMark size={104} color={colors.orange} />
      </div>
      <MaskReveal delay={12} dur={24}>
        <div style={{ ...display(60), color: colors.light, marginBottom: 44 }}>{s.title}</div>
      </MaskReveal>
      <div style={{ display: "flex", flexDirection: "column", gap: 24, alignItems: "center" }}>
        {s.lines.map((ln, i) => (
          <SpringIn key={i} delay={22 + i * 11} distance={24}>
            <div style={{ fontFamily: headingFont, fontSize: 46, color: colors.light, fontWeight: 500 }}>
              <span style={{ color: colors.midGray }}>{ln.lead}</span>
              <span style={{ fontWeight: 700, color: colors.orange }}>{ln.text}</span>
            </div>
          </SpringIn>
        ))}
      </div>
      <SpringIn delay={22 + s.lines.length * 11 + 8} style={{ marginTop: 50 }}>
        <div style={{ fontFamily: bodyFont, fontSize: 34, color: colors.midGray }}>{s.signoff}</div>
      </SpringIn>
    </AbsoluteFill>
  );
};

// ─── dispatcher ─────────────────────────────────────────────────────────────

export const SlideView: React.FC<{ slide: Slide }> = ({ slide }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const enter = interpolate(frame, [0, 14], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(...smooth) });
  const exit = interpolate(frame, [durationInFrames - 14, durationInFrames], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const dark = slide.type === "closing";
  const meta = slide as Slide & { scene?: string; kicker?: string; title?: string };

  return (
    <AbsoluteFill style={{ backgroundColor: dark ? colors.dark : colors.light, opacity: enter * exit }}>
      {dark ? <DriftDots color={colors.light} /> : <FloatingBg />}
      <AbsoluteFill style={{ padding: dark ? 0 : PAD, justifyContent: "center" }}>
        {meta.scene && SCENES[meta.scene] ? (
          React.createElement(SCENES[meta.scene], { kicker: meta.kicker, title: meta.title ?? "" })
        ) : (
          <>
            {slide.type === "cover" && <Cover {...slide} />}
            {slide.type === "agenda" && <Agenda {...slide} />}
            {slide.type === "statement" && <Statement {...slide} />}
            {slide.type === "bullets" && <Bullets {...slide} />}
            {slide.type === "split" && <Split {...slide} />}
            {slide.type === "cards" && <Cards {...slide} />}
            {slide.type === "steps" && <Steps {...slide} />}
            {slide.type === "closing" && <Closing {...slide} />}
          </>
        )}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
