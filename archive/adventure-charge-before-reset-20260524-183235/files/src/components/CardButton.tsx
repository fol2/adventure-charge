import { HeartPulse, Shield, Sparkles, Swords } from "lucide-react";
import { getCard } from "../game/cards";

interface CardButtonProps {
  cardId: string;
  disabled?: boolean;
  onPlay?: () => void;
}

export function CardButton({ cardId, disabled, onPlay }: CardButtonProps) {
  const card = getCard(cardId);

  return (
    <button className="card-button" type="button" disabled={disabled} onClick={onPlay}>
      <span className="card-cost">{card.cost}</span>
      <span>
        <strong>{card.name}</strong>
        <span className="card-text">{card.description}</span>
      </span>
      <span className="stat-row">
        {card.damage ? (
          <span className="stat-pill">
            <Swords size={14} /> {card.damage}
          </span>
        ) : null}
        {card.block ? (
          <span className="stat-pill">
            <Shield size={14} /> {card.block}
          </span>
        ) : null}
        {card.heal ? (
          <span className="stat-pill">
            <HeartPulse size={14} /> {card.heal}
          </span>
        ) : null}
        {card.draw ? (
          <span className="stat-pill">
            <Sparkles size={14} /> +{card.draw}
          </span>
        ) : null}
      </span>
    </button>
  );
}
