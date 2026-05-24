import { BadgeHelp, Gem, HeartPulse, KeyRound, ShoppingBag, Skull, Swords } from "lucide-react";
import { FINAL_BOSS_NODE, getCurrentMap } from "../game/maps";
import type { MapNode, RunState } from "../game/types";

interface MapPanelProps {
  state: RunState;
  availableNodes: MapNode[];
  onChooseNode: (nodeId: string) => void;
}

export function MapPanel({ state, availableNodes, onChooseNode }: MapPanelProps) {
  const currentMap = getCurrentMap(state.mapIndex);
  const title = currentMap?.name ?? "Storm Gate";
  const subtitle = currentMap?.theme ?? FINAL_BOSS_NODE.detail;

  return (
    <section className="panel map-panel" aria-labelledby="map-title">
      <div className="panel-header">
        <div>
          <h2 id="map-title" className="panel-title">
            {title}
          </h2>
          <p className="panel-subtitle">{subtitle}</p>
        </div>
      </div>
      <div className="map-routes">
        {availableNodes.length === 0 ? (
          <p className="panel-subtitle">No routes are open yet.</p>
        ) : (
          availableNodes.map((node) => (
            <button className="node-button" type="button" key={node.id} onClick={() => onChooseNode(node.id)}>
              <span className={`node-kind kind-${node.type}`}>{getNodeInitial(node)}</span>
              <span>
                <span className="button-title">{node.label}</span>
                <span className="button-detail">{node.detail}</span>
              </span>
              {getNodeIcon(node.type)}
            </button>
          ))
        )}
      </div>
    </section>
  );
}

function getNodeInitial(node: MapNode) {
  if (node.type === "finalBoss") {
    return "B";
  }

  return node.type.slice(0, 1);
}

function getNodeIcon(type: MapNode["type"]) {
  if (type === "shop") {
    return <ShoppingBag size={18} />;
  }

  if (type === "rest") {
    return <HeartPulse size={18} />;
  }

  if (type === "treasure") {
    return <Gem size={18} />;
  }

  if (type === "guardian" || type === "finalBoss") {
    return <KeyRound size={18} />;
  }

  if (type === "elite") {
    return <Skull size={18} />;
  }

  if (type === "encounter") {
    return <Swords size={18} />;
  }

  return <BadgeHelp size={18} />;
}
