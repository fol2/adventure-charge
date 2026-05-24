import { Coins, DoorOpen } from "lucide-react";
import { getCard } from "../game/cards";
import { getCardPrice } from "../game/gameState";
import type { RunState } from "../game/types";

interface ShopViewProps {
  state: RunState;
  onBuyCard: (cardId: string) => void;
  onLeave: () => void;
}

export function ShopView({ state, onBuyCard, onLeave }: ShopViewProps) {
  return (
    <section className="panel shop-view" aria-labelledby="shop-title">
      <div className="panel-header">
        <div>
          <h2 id="shop-title" className="panel-title">
            Shop
          </h2>
          <p className="panel-subtitle">Buy cards to get powerful enough for the guardians.</p>
        </div>
        <button className="secondary-button" type="button" onClick={onLeave}>
          <DoorOpen size={16} /> Leave
        </button>
      </div>
      <div className="shop-list">
        {state.shopInventory.map((cardId) => {
          const card = getCard(cardId);
          const price = getCardPrice(state, cardId);
          const canAfford = state.player.coins >= price;

          return (
            <button className="shop-button" type="button" key={card.id} disabled={!canAfford} onClick={() => onBuyCard(card.id)}>
              <span>
                <span className="button-title">{card.name}</span>
                <span className="button-detail">{card.description}</span>
              </span>
              <span className="stat-pill">
                <Coins size={14} /> {price}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
