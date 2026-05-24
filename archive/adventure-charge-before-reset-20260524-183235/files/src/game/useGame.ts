import { useMemo, useState } from "react";
import {
  buyShopCard,
  claimRewardCard,
  chooseRouteNode,
  createInitialState,
  createNewRun,
  endPlayerTurn,
  getAvailableNodes,
  leaveShop,
  playPlayerCard,
  selectSkin,
  skipReward
} from "./gameState";

export function useGame() {
  const [state, setState] = useState(createInitialState);
  const availableNodes = useMemo(() => getAvailableNodes(state), [state]);

  return {
    state,
    availableNodes,
    startRun: () => setState(createNewRun()),
    restart: () => setState(createInitialState()),
    chooseNode: (nodeId: string) => setState((current) => chooseRouteNode(current, nodeId)),
    playCard: (handIndex: number) => setState((current) => playPlayerCard(current, handIndex)),
    endTurn: () => setState((current) => endPlayerTurn(current)),
    buyCard: (cardId: string) => setState((current) => buyShopCard(current, cardId)),
    leaveShop: () => setState((current) => leaveShop(current)),
    claimReward: (cardId: string) => setState((current) => claimRewardCard(current, cardId)),
    skipReward: () => setState((current) => skipReward(current)),
    selectSkin: (skinId: string) => setState((current) => selectSkin(current, skinId))
  };
}
