import { Coins, Gift, SkipForward, Sparkles } from "lucide-react";
import { getCard } from "../game/cards";
import { getRelic } from "../game/relics";
import type { RunState } from "../game/types";
import { CardButton } from "./CardButton";

interface RewardViewProps {
  state: RunState;
  onClaimCard: (cardId: string) => void;
  onSkip: () => void;
}

export function RewardView({ state, onClaimCard, onSkip }: RewardViewProps) {
  const reward = state.pendingReward;

  if (!reward) {
    return null;
  }

  const relic = reward.relicId ? getRelic(reward.relicId) : null;

  return (
    <section className="panel reward-view" aria-labelledby="reward-title">
      <div className="panel-header">
        <div>
          <h2 id="reward-title" className="panel-title">
            {reward.title}
          </h2>
          <p className="panel-subtitle">Choose 1 card for your deck, or skip if it would make the deck weaker.</p>
        </div>
        <button className="secondary-button" type="button" onClick={onSkip}>
          <SkipForward size={16} /> Skip card
        </button>
      </div>
      <div className="reward-strip">
        <span className="stat-pill">
          <Coins size={14} /> {reward.coins} coins
        </span>
        {relic ? (
          <span className="relic-chip" style={{ borderColor: relic.colour }}>
            <Sparkles size={14} /> {relic.name}: {relic.description}
          </span>
        ) : (
          <span className="stat-pill">
            <Gift size={14} /> Card reward
          </span>
        )}
      </div>
      <div className="hand-grid reward-grid">
        {reward.cardIds.map((cardId) => {
          const card = getCard(cardId);

          return <CardButton key={card.id} cardId={card.id} onPlay={() => onClaimCard(card.id)} />;
        })}
      </div>
    </section>
  );
}
