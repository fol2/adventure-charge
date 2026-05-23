import { Coins, Heart, KeyRound, Map, RotateCcw, Shield, UserRound, Zap } from "lucide-react";
import { SKINS } from "../game/skins";
import type { RunState } from "../game/types";

interface HudProps {
  state: RunState;
  onRestart: () => void;
}

export function Hud({ state, onRestart }: HudProps) {
  const selectedSkin = SKINS.find((skin) => skin.id === state.selectedSkinId);
  const mapLabel = state.mapIndex < 3 ? `Map ${state.mapIndex + 1}` : "Storm gate";

  return (
    <header className="hud">
      <div className="resource-bar" aria-label="Run resources">
        <span className="resource-chip">
          <Heart size={16} /> {state.player.health}/{state.player.maxHealth}
        </span>
        <span className="resource-chip">
          <Shield size={16} /> {state.player.block}
        </span>
        <span className="resource-chip">
          <Zap size={16} /> {state.player.energy}/{state.player.maxEnergy}
        </span>
        <span className="resource-chip">
          <Coins size={16} /> {state.player.coins}
        </span>
        <span className="resource-chip">
          <KeyRound size={16} /> {state.keys}/3
        </span>
        <span className="resource-chip">
          <Map size={16} /> {mapLabel}
        </span>
        <span className="resource-chip">
          <UserRound size={16} /> {selectedSkin?.name ?? "Adventurer"}
        </span>
      </div>
      <div className="status-strip">
        <span className="message-chip">{state.message}</span>
        <button className="icon-button" type="button" onClick={onRestart} aria-label="Restart run" title="Restart run">
          <RotateCcw size={18} />
        </button>
      </div>
    </header>
  );
}
