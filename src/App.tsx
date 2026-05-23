import { StartScreen } from "./components/StartScreen";
import { AdventureScene } from "./components/AdventureScene";
import { BattleView } from "./components/BattleView";
import { Hud } from "./components/Hud";
import { MapPanel } from "./components/MapPanel";
import { RunSummary } from "./components/RunSummary";
import { ShopView } from "./components/ShopView";
import { SkinPanel } from "./components/SkinPanel";
import { useGame } from "./game/useGame";

export default function App() {
  const game = useGame();

  if (game.state.phase === "start") {
    return <StartScreen onStart={game.startRun} />;
  }

  return (
    <main className="app-shell">
      <AdventureScene state={game.state} availableNodes={game.availableNodes} onChooseNode={game.chooseNode} />
      <Hud state={game.state} onRestart={game.restart} />
      <section className="control-dock" aria-label="Adventure controls">
        {game.state.phase === "map" && (
          <>
            <MapPanel state={game.state} availableNodes={game.availableNodes} onChooseNode={game.chooseNode} />
            <SkinPanel state={game.state} onSelectSkin={game.selectSkin} />
          </>
        )}
        {game.state.phase === "battle" && (
          <BattleView state={game.state} onPlayCard={game.playCard} onEndTurn={game.endTurn} />
        )}
        {game.state.phase === "shop" && (
          <ShopView state={game.state} onBuyCard={game.buyCard} onLeave={game.leaveShop} />
        )}
        {(game.state.phase === "victory" || game.state.phase === "defeat") && (
          <RunSummary state={game.state} onRestart={game.restart} />
        )}
      </section>
    </main>
  );
}
