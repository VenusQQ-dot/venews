import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { body, display, heading } from "../components/anim";
import {
  Checkmark,
  Counter,
  DrawnArrow,
  MaskReveal,
  SpringIn,
  useEaseIn,
} from "../components/motion";
import { bodyFont, colors, headingFont } from "../theme";

export type SceneProps = { kicker?: string; title: string };

/** Shared header for hero scenes: kicker + mask-revealed serif title. */
const SceneHeader: React.FC<SceneProps> = ({ kicker, title }) => (
  <div style={{ marginBottom: 44 }}>
    {kicker ? (
      <MaskReveal delay={2} dur={18}>
        <div
          style={{
            fontFamily: headingFont,
            fontWeight: 700,
            fontSize: 30,
            letterSpacing: "0.14em",
            color: colors.orange,
            marginBottom: 20,
          }}
        >
          {kicker}
        </div>
      </MaskReveal>
    ) : null}
    <MaskReveal delay={6} dur={26}>
      <div style={{ ...display(70), maxWidth: 1600 }}>{title}</div>
    </MaskReveal>
  </div>
);

/* ── Chat scene:先請 AI 復述 ─────────────────────────────────────────── */
const AnthropicGlyph: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  <svg width={size} height={size} viewBox="0 0 100 100">
    {Array.from({ length: 12 }).map((_, i) => (
      <rect key={i} x={48} y={8} width={4} height={34} rx={2} fill={color} transform={`rotate(${i * 30} 50 50)`} />
    ))}
  </svg>
);

export const ChatScene: React.FC<SceneProps> = ({ kicker, title }) => {
  const frame = useCurrentFrame();
  const reply = "用途、主體、訊息、構圖、風格、限制 — 我理解的是不是同一件事？";
  const replyAt = 70;
  const typed = Math.max(0, Math.floor((frame - replyAt) * 0.8));
  const shown = reply.slice(0, typed);
  const typing = frame > replyAt && typed < reply.length;
  const caretOn = Math.floor(frame / 8) % 2 === 0;
  const done = typed >= reply.length;

  return (
    <>
      <SceneHeader kicker={kicker} title={title} />
      <SpringIn delay={20} damping={15}>
        <div
          style={{
            width: 1180,
            backgroundColor: "#fff",
            border: `1.5px solid ${colors.lightGray}`,
            borderRadius: 26,
            boxShadow: "0 40px 90px rgba(20,20,19,0.10)",
            padding: 40,
          }}
        >
          <div style={{ display: "flex", gap: 9, marginBottom: 30, alignItems: "center" }}>
            {[colors.orange, colors.midGray, colors.midGray].map((c, i) => (
              <div key={i} style={{ width: 13, height: 13, borderRadius: 99, backgroundColor: c }} />
            ))}
            <div style={{ marginLeft: 12, fontFamily: headingFont, fontSize: 22, color: colors.midGray, fontWeight: 600 }}>
              Claude
            </div>
          </div>

          {/* user bubble */}
          <SpringIn delay={30} distance={18} style={{ display: "flex", justifyContent: "flex-end" }}>
            <div
              style={{
                backgroundColor: colors.lightGray,
                fontFamily: bodyFont,
                fontSize: 32,
                lineHeight: 1.4,
                padding: "20px 28px",
                borderRadius: "24px 24px 8px 24px",
                maxWidth: 820,
              }}
            >
              先不要生成，請用自己的話復述需求。
            </div>
          </SpringIn>

          {/* claude reply */}
          <div style={{ display: "flex", gap: 20, marginTop: 30, alignItems: "flex-start" }}>
            <div
              style={{
                flexShrink: 0,
                width: 52,
                height: 52,
                borderRadius: 14,
                backgroundColor: colors.orange,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <AnthropicGlyph size={30} color={colors.light} />
            </div>
            <div style={{ fontFamily: bodyFont, fontSize: 33, lineHeight: 1.45, minHeight: 48, paddingTop: 6 }}>
              {shown}
              <span style={{ opacity: typing && caretOn ? 1 : 0, color: colors.orange, fontWeight: 700 }}>▍</span>
            </div>
          </div>
        </div>
      </SpringIn>

      {/* confirmation */}
      <div style={{ display: "flex", alignItems: "center", gap: 18, marginTop: 40, opacity: done ? 1 : 0 }}>
        <Checkmark delay={replyAt + reply.length / 0.8 + 2} size={50} />
        <div style={{ ...heading(40), color: colors.green }}>30 秒確認：理解一致</div>
      </div>
    </>
  );
};

/* ── Flow scene:報銷流程 ─────────────────────────────────────────────── */
export const FlowScene: React.FC<SceneProps> = ({ kicker, title }) => {
  const nodes = ["員工申請", "主管審核", "會計審核", "出納付款", "歸檔"];
  const W = 1660;
  const nodeW = 250;
  const gap = (W - nodeW * nodes.length) / (nodes.length - 1);
  const y = 150;
  const cx = (i: number) => i * (nodeW + gap) + nodeW / 2;
  return (
    <>
      <SceneHeader kicker={kicker} title={title} />
      <div style={{ position: "relative", width: W, height: 440, marginTop: 10 }}>
        <svg width={W} height={440} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
          {nodes.slice(0, -1).map((_, i) => (
            <DrawnArrow
              key={i}
              from={[cx(i) + nodeW / 2 - 6, y]}
              to={[cx(i + 1) - nodeW / 2 + 6, y]}
              delay={30 + i * 14}
              color={colors.midGray}
              width={3}
            />
          ))}
          {/* retry loop:會計審核 → 員工申請, bowed downward (negative curve
              because this arrow runs right→left) */}
          <DrawnArrow
            from={[cx(2), y + 52]}
            to={[cx(0), y + 52]}
            delay={30 + 4 * 14 + 8}
            dur={24}
            color={colors.orange}
            width={3}
            curve={-150}
            dashed
          />
        </svg>
        {/* retry label */}
        <RetryLabel x={cx(1)} y={y + 250} delay={30 + 4 * 14 + 16} />
        {nodes.map((n, i) => (
          <SpringIn key={n} delay={18 + i * 9} damping={12} style={{ position: "absolute", left: cx(i) - nodeW / 2, top: y - 55 }}>
            <div
              style={{
                width: nodeW,
                height: 110,
                borderRadius: 20,
                backgroundColor: "#fff",
                border: `2px solid ${i === nodes.length - 1 ? colors.green : colors.lightGray}`,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 16px 40px rgba(20,20,19,0.06)",
              }}
            >
              <div style={{ fontFamily: headingFont, fontWeight: 700, fontSize: 24, color: [colors.orange, colors.blue, colors.green][i % 3], marginBottom: 6 }}>
                {String(i + 1).padStart(2, "0")}
              </div>
              <div style={{ ...body(30), fontWeight: 500 }}>{n}</div>
            </div>
          </SpringIn>
        ))}
      </div>
    </>
  );
};

const RetryLabel: React.FC<{ x: number; y: number; delay: number }> = ({ x, y, delay }) => {
  const p = useEaseIn(delay, 16);
  return (
    <div
      style={{
        position: "absolute",
        left: x - 190,
        top: y,
        width: 380,
        textAlign: "center",
        whiteSpace: "nowrap",
        opacity: p,
        transform: `translateY(${(1 - p) * 10}px)`,
        fontFamily: headingFont,
        fontWeight: 700,
        fontSize: 27,
        color: colors.orange,
        padding: "4px 16px",
      }}
    >
      退件 → 回員工補件
    </div>
  );
};

/* ── Bar scene:預算執行率 ────────────────────────────────────────────── */
export const BarScene: React.FC<SceneProps> = ({ kicker, title }) => {
  const data = [
    { k: "行政", v: 82 },
    { k: "人資", v: 91 },
    { k: "資訊", v: 108 },
    { k: "業務", v: 120 },
  ];
  const max = 130;
  const trackW = 1240;
  const rowH = 92;
  const frame = useCurrentFrame();
  const baselineP = interpolate(frame, [18, 34], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <>
      <SceneHeader kicker={kicker} title={title} />
      <div style={{ display: "flex", gap: 26, alignItems: "center", marginBottom: 30 }}>
        <div style={{ ...heading(34), color: colors.dark }}>問題：</div>
        <div style={{ ...body(34), color: "#4a4945" }}>哪些部門執行率超過 100%？</div>
      </div>
      <div style={{ position: "relative", width: 260 + trackW, height: data.length * rowH + 30 }}>
        {/* 100% baseline */}
        {(() => {
          const x = 260 + (100 / max) * trackW;
          return (
            <div style={{ position: "absolute", left: x, top: 0, bottom: 40, width: 0, borderLeft: `3px dashed ${colors.dark}`, opacity: baselineP }}>
              <div style={{ position: "absolute", top: -34, left: -34, fontFamily: headingFont, fontWeight: 700, fontSize: 26, color: colors.dark, opacity: baselineP }}>
                100%
              </div>
            </div>
          );
        })()}
        {data.map((d, i) => {
          const over = d.v > 100;
          const c = over ? colors.orange : colors.blue;
          const delay = 30 + i * 10;
          const grow = interpolate(frame, [delay, delay + 26], [0, d.v], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          const pulse = over ? 1 + Math.sin(frame * 0.15) * 0.015 : 1;
          return (
            <div key={d.k} style={{ position: "absolute", top: i * rowH, left: 0, height: rowH, width: "100%", display: "flex", alignItems: "center" }}>
              <div style={{ width: 240, ...heading(38), textAlign: "right", paddingRight: 20 }}>{d.k}</div>
              <div style={{ position: "relative", height: 56 }}>
                <div
                  style={{
                    height: 56,
                    width: (grow / max) * trackW,
                    background: c,
                    borderRadius: 12,
                    transform: `scaleY(${pulse})`,
                    boxShadow: over ? `0 0 0 4px ${colors.orange}22` : "none",
                  }}
                />
              </div>
              <div style={{ ...heading(38), color: c, marginLeft: 22 }}>
                <Counter to={d.v} delay={delay} dur={26} suffix="%" />
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};

/* ── Prompt-assembly scene:把六欄位組成 Prompt ───────────────────────── */
export const PromptScene: React.FC<SceneProps> = ({ kicker, title }) => {
  const fields = ["用途", "主體", "訊息", "構圖", "風格", "限制"];
  const frame = useCurrentFrame();
  return (
    <>
      <SceneHeader kicker={kicker} title={title} />
      <div style={{ display: "flex", gap: 80, alignItems: "center", marginTop: 20 }}>
        {/* six chips flying in */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 22, width: 620 }}>
          {fields.map((f, i) => (
            <SpringIn key={f} delay={16 + i * 8} distance={40} damping={12}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  backgroundColor: "#fff",
                  border: `1.5px solid ${colors.lightGray}`,
                  borderRadius: 16,
                  padding: "22px 26px",
                }}
              >
                <div style={{ width: 30, height: 30, borderRadius: 8, background: [colors.orange, colors.blue, colors.green][i % 3] }} />
                <div style={{ ...heading(38) }}>{f}</div>
              </div>
            </SpringIn>
          ))}
        </div>

        {/* arrow */}
        <div style={{ ...display(70), color: colors.midGray, opacity: interpolate(frame, [70, 82], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>
          →
        </div>

        {/* assembled prompt document */}
        <SpringIn delay={78} damping={14}>
          <div
            style={{
              width: 560,
              backgroundColor: "#fff",
              border: `1.5px solid ${colors.lightGray}`,
              borderRadius: 20,
              boxShadow: "0 30px 70px rgba(20,20,19,0.10)",
              padding: 36,
            }}
          >
            <div style={{ fontFamily: headingFont, fontWeight: 700, fontSize: 28, color: colors.orange, marginBottom: 22 }}>
              可複製 Prompt
            </div>
            {[
              "請生成一張企業內部教育訓練用的",
              "16:9 圖片，主體是會計工作者，",
              "人物放右側、左側留 40% 文字空間，",
              "風格專業穩重，不要文字與機器人。",
            ].map((line, i) => {
              const p = interpolate(frame, [92 + i * 6, 92 + i * 6 + 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
              const highlight = i === 0;
              return (
                <div key={i} style={{ ...body(28), color: highlight ? colors.dark : "#4a4945", opacity: p, marginBottom: 10, lineHeight: 1.45 }}>
                  {line}
                </div>
              );
            })}
          </div>
        </SpringIn>
      </div>
    </>
  );
};

export const SCENES: Record<string, React.FC<SceneProps>> = {
  chat: ChatScene,
  flow: FlowScene,
  bars: BarScene,
  prompt: PromptScene,
};
