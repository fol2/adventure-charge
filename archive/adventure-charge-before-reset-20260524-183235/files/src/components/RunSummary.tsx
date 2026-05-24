import { RotateCcw, Trophy } from "lucide-react";
import type { RunState } from "../game/types";

interface RunSummaryProps {
  state: RunState;
  onRestart: () => void;
}

export function RunSummary({ state, onRestart }: RunSummaryProps) {
  const won = state.phase === "victory";

  return (
    <section className="panel summary-panel" aria-labelledby="summary-title">
      <h2 id="summary-title" className="panel-title">
        {won ? "Big boss beaten" : "Run ended"}
      </h2>
      <p className="panel-subtitle">{state.message}</p>
      <div className="summary-grid">
        <SummaryStat label="Keys" value={`${state.keys}/3`} />
        <SummaryStat label="Battles won" value={state.stats.battlesWon} />
        <SummaryStat label="Maps finished" value={state.stats.mapsCompleted} />
        <SummaryStat label="Cards bought" value={state.stats.cardsBought} />
      </div>
      <button className={won ? "primary-button" : "secondary-button"} type="button" onClick={onRestart}>
        {won ? <Trophy size={16} /> : <RotateCcw size={16} />} New run
      </button>
    </section>
  );
}

function SummaryStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="summary-stat">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
