import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { colors } from "./theme";
import {
  ChatSlide,
  ClosingSlide,
  FeaturesSlide,
  KineticSlide,
  TitleSlide,
} from "./slides";

// Each slide's on-screen length, in frames (30 fps).
export const SLIDES = [
  { Comp: TitleSlide, dur: 110 },
  { Comp: KineticSlide, dur: 100 },
  { Comp: ChatSlide, dur: 150 },
  { Comp: FeaturesSlide, dur: 130 },
  { Comp: ClosingSlide, dur: 110 },
];

// Slides overlap slightly so their fade-out/fade-in crossfade — the
// gentle, seamless scene changes of the Anthropic explainer style.
const OVERLAP = 12;

export const DECK_DURATION = SLIDES.reduce(
  (sum, s) => sum + s.dur - OVERLAP,
  OVERLAP,
);

export const AnthropicDeck: React.FC = () => {
  let cursor = 0;
  return (
    <AbsoluteFill style={{ backgroundColor: colors.light }}>
      {SLIDES.map(({ Comp, dur }, i) => {
        const from = cursor;
        cursor += dur - OVERLAP;
        return (
          <Sequence key={i} from={from} durationInFrames={dur}>
            <Comp />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
