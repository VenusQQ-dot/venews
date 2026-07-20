import "./index.css";
import { Composition } from "remotion";
import { AnthropicDeck, DECK_DURATION } from "./AnthropicDeck";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="AnthropicDeck"
      component={AnthropicDeck}
      durationInFrames={DECK_DURATION}
      fps={30}
      width={1920}
      height={1080}
    />
  );
};
