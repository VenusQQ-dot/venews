import "./index.css";
import { Composition } from "remotion";
import { AnthropicDeck, DECK_DURATION } from "./AnthropicDeck";
import { OpeningScene } from "./deck/showcase";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="AnthropicDeck"
        component={AnthropicDeck}
        durationInFrames={DECK_DURATION}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="OpeningShowcase"
        component={OpeningScene}
        durationInFrames={200}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
