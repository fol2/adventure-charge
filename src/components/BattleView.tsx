import { Hourglass, Shield, Swords } from "lucide-react";
import { getCard } from "../game/cards";
import type { RunState } from "../game/types";
import { CardButton } from "./CardButton";

interface BattleViewProps {
  state: RunState;
  onPlayCard: (handIndex: number) => void;
  onEndTurn: () => void;
}

export function BattleView({ state, onPlayCard, onEndTurn }: BattleViewProps) {
  const enemy = state.currentEnemy;
  const intent = enemy?.intentCardId ? getCard(enemy.intentCardId) : null;

  if (!enemy) {
    return null;
  }

  return (
    <section className="battle-view" aria-label="Card battle">
      <div className="panel battle-status">
        <div className="fighter">
          <h3>{enemy.name}</h3>
          <p className="panel-subtitle">{enemy.subtitle}</p>
          <HealthMeter current={enemy.health} max={enemy.maxHealth} />
          <div className="stat-row">
            <span className="stat-pill">
              <Shield size={14} /> {enemy.block} block
            </span>
            {intent ? (
              <span className="stat-pill">
                <Hourglass size={14} /> {intent.name}
              </span>
            ) : null}
          </div>
          {intent ? <p className="panel-subtitle">Next enemy card: {intent.description}</p> : null}
        </div>
        <div className="fighter">
          <h3>Your turn</h3>
          <HealthMeter current={state.player.health} max={state.player.maxHealth} />
          <div className="stat-row">
            <span className="stat-pill">
              <Shield size={14} /> {state.player.block} block
            </span>
            <span className="stat-pill">{state.player.energy} energy</span>
            <span className="stat-pill">{state.player.deck.length} deck</span>
          </div>
          <div className="battle-actions">
            <button className="danger-button" type="button" onClick={onEndTurn}>
              <Swords size={16} /> End turn
            </button>
          </div>
        </div>
      </div>
      <div className="panel hand-panel">
        <div className="panel-header">
          <div>
            <h2 className="panel-title">Hand</h2>
            <p className="panel-subtitle">Play cards to attack, block, heal, or draw.</p>
          </div>
        </div>
        <div className="hand-grid">
          {state.player.hand.map((cardId, index) => (
            <CardButton
              key={`${cardId}-${index}`}
              cardId={cardId}
              disabled={getCard(cardId).cost > state.player.energy}
              onPlay={() => onPlayCard(index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function HealthMeter({ current, max }: { current: number; max: number }) {
  const width = `${Math.max(0, Math.min(100, (current / max) * 100))}%`;

  return (
    <>
      <div className="meter" aria-hidden="true">
        <div className="meter-fill" style={{ width }} />
      </div>
      <div className="stat-row">
        <span className="stat-pill">
          {current}/{max} health
        </span>
      </div>
    </>
  );
}
