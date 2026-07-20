import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { colors, headingFont } from "./theme";
import { SLIDES } from "./deck/data";
import { SlideView } from "./deck/slides";

// Slides overlap slightly so their fade-out/fade-in crossfade — the gentle,
// seamless scene changes of the Anthropic explainer style.
const OVERLAP = 12;
const DEFAULT_DUR = 140;

const durOf = (i: number) => SLIDES[i].dur ?? DEFAULT_DUR;

export const DECK_DURATION =
  SLIDES.reduce((sum, _, i) => sum + durOf(i) - OVERLAP, 0) + OVERLAP;

// Cover (0) and closing (last) get no page number; content pages count 1..N.
const isNumbered = (i: number) =>
  SLIDES[i].type !== "cover" && SLIDES[i].type !== "closing" && SLIDES[i].type !== "agenda";

export const AnthropicDeck: React.FC = () => {
  let cursor = 0;
  let page = 0;
  return (
    <AbsoluteFill style={{ backgroundColor: colors.light }}>
      {SLIDES.map((slide, i) => {
        const from = cursor;
        cursor += durOf(i) - OVERLAP;
        const numbered = isNumbered(i);
        if (numbered) page += 1;
        const pageNo = page;
        return (
          <Sequence key={i} from={from} durationInFrames={durOf(i)}>
            <SlideView slide={slide} />
            {numbered ? (
              <AbsoluteFill
                style={{
                  justifyContent: "flex-end",
                  alignItems: "flex-end",
                  padding: 56,
                  pointerEvents: "none",
                }}
              >
                <div
                  style={{
                    fontFamily: headingFont,
                    fontWeight: 700,
                    fontSize: 26,
                    color: colors.midGray,
                    letterSpacing: "0.08em",
                  }}
                >
                  {String(pageNo).padStart(2, "0")} / {SLIDES.filter((_, j) => isNumbered(j)).length}
                </div>
              </AbsoluteFill>
            ) : null}
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
