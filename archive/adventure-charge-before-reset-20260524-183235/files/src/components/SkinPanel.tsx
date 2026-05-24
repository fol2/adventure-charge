import { Lock, UserRound } from "lucide-react";
import { getSkinStatuses } from "../game/skins";
import type { RunState } from "../game/types";

interface SkinPanelProps {
  state: RunState;
  onSelectSkin: (skinId: string) => void;
}

export function SkinPanel({ state, onSelectSkin }: SkinPanelProps) {
  const skins = getSkinStatuses(state);

  return (
    <section className="panel skin-panel" aria-labelledby="skins-title">
      <div className="panel-header">
        <div>
          <h2 id="skins-title" className="panel-title">
            People
          </h2>
          <p className="panel-subtitle">Only 4 skins. The best ones are hard to unlock.</p>
        </div>
      </div>
      <div className="skin-list">
        {skins.map((skin) => (
          <button
            className={`skin-button ${state.selectedSkinId === skin.id ? "is-selected" : ""}`}
            type="button"
            key={skin.id}
            disabled={!skin.unlocked}
            onClick={() => onSelectSkin(skin.id)}
          >
            <span className="node-kind" style={{ background: skin.colour }}>
              <UserRound size={14} />
            </span>
            <span>
              <span className="button-title">{skin.name}</span>
              <span className="button-detail">
                {skin.title}. {skin.unlockDescription}
              </span>
            </span>
            {!skin.unlocked ? (
              <span className="skin-lock">
                <Lock size={14} /> Locked
              </span>
            ) : null}
          </button>
        ))}
      </div>
    </section>
  );
}
