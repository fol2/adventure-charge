import { Compass, KeyRound, Swords } from "lucide-react";

interface StartScreenProps {
  onStart: () => void;
}

export function StartScreen({ onStart }: StartScreenProps) {
  return (
    <main className="start-screen">
      <section className="start-content" aria-labelledby="game-title">
        <h1 id="game-title" className="game-title">
          Adventure Charge
        </h1>
        <p className="start-copy">
          Choose risky routes, read enemy intent, build your deck from card rewards, collect relics, and open the
          storm gate with 3 keys. Four skins wait behind tough unlocks.
        </p>
        <div className="stat-row" aria-label="Game pillars">
          <span className="stat-pill">
            <Compass size={16} /> Route map
          </span>
          <span className="stat-pill">
            <Swords size={16} /> Card battles
          </span>
          <span className="stat-pill">
            <KeyRound size={16} /> 3 boss keys
          </span>
        </div>
        <button className="primary-button" type="button" onClick={onStart}>
          <Swords size={18} /> Start run
        </button>
      </section>
    </main>
  );
}
