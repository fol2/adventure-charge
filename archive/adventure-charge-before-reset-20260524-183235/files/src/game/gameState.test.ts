import { describe, expect, it } from "vitest";
import {
  buyShopCard,
  canStartFinalBoss,
  claimRewardCard,
  chooseRouteNode,
  createNewRun,
  endPlayerTurn,
  playPlayerCard,
  skipReward
} from "./gameState";
import { getSkinStatuses } from "./skins";

describe("adventure card game rules", () => {
  it("starts a run with a deck, route, coins, no keys, and only the first skin unlocked", () => {
    const state = createNewRun();
    const skins = getSkinStatuses(state);

    expect(state.phase).toBe("map");
    expect(state.player.deck.length).toBeGreaterThan(0);
    expect(state.player.health).toBe(state.player.maxHealth);
    expect(state.player.coins).toBe(24);
    expect(state.keys).toBe(0);
    expect(skins).toHaveLength(4);
    expect(skins.filter((skin) => skin.unlocked).map((skin) => skin.id)).toEqual(["trailKid"]);
  });

  it("lets attack cards reduce enemy block before health", () => {
    const started = createNewRun();
    const battle = chooseRouteNode(started, "m1-encounter-a");
    const blockedEnemy = {
      ...battle.currentEnemy!,
      block: 4
    };
    const strikeIndex = battle.player.hand.findIndex((cardId) => cardId === "strike");

    const next = playPlayerCard({ ...battle, currentEnemy: blockedEnemy }, strikeIndex);

    expect(next.currentEnemy!.block).toBe(0);
    expect(next.currentEnemy!.health).toBe(blockedEnemy.health - 2);
  });

  it("lets defence cards block incoming enemy attacks", () => {
    const started = createNewRun();
    const battle = chooseRouteNode(started, "m1-encounter-a");
    const guardIndex = battle.player.hand.findIndex((cardId) => cardId === "guard");
    const defended = playPlayerCard(battle, guardIndex);
    const healthBefore = defended.player.health;

    const afterEnemy = endPlayerTurn({
      ...defended,
      currentEnemy: {
        ...defended.currentEnemy!,
        intentCardId: "claw"
      }
    });

    expect(afterEnemy.player.health).toBe(healthBefore);
  });

  it("lets enemy cards attack or block on their turn", () => {
    const started = createNewRun();
    const battle = chooseRouteNode(started, "m1-encounter-a");
    const healthBefore = battle.player.health;

    const afterAttack = endPlayerTurn({
      ...battle,
      currentEnemy: {
        ...battle.currentEnemy!,
        intentCardId: "claw"
      }
    });

    const afterBlock = endPlayerTurn({
      ...battle,
      currentEnemy: {
        ...battle.currentEnemy!,
        intentCardId: "thickHide"
      }
    });

    expect(afterAttack.player.health).toBe(healthBefore - 6);
    expect(afterBlock.currentEnemy!.block).toBe(8);
  });

  it("keeps the final boss locked until all three map keys are earned", () => {
    const state = createNewRun();

    expect(canStartFinalBoss(state)).toBe(false);

    const withThreeKeys = {
      ...state,
      mapIndex: 3,
      keys: 3
    };

    expect(canStartFinalBoss(withThreeKeys)).toBe(true);
  });

  it("grants a key and advances to the next map when a guardian is defeated", () => {
    const state = createNewRun();
    const guardianBattle = {
      ...state,
      phase: "battle" as const,
      currentNodeId: "m1-guardian",
      player: {
        ...state.player,
        energy: 3,
        hand: ["strike"],
        drawPile: [],
        discardPile: []
      },
      currentEnemy: {
        id: "thornBear",
        name: "Thorn Bear",
        subtitle: "Guardian of the first key",
        maxHealth: 46,
        health: 1,
        block: 0,
        deck: ["claw"],
        drawPile: ["claw"],
        discardPile: [],
        intentCardId: "claw"
      }
    };

    const reward = playPlayerCard(guardianBattle, 0);
    const afterWin = claimRewardCard(reward, reward.pendingReward!.cardIds[0]);

    expect(afterWin.phase).toBe("map");
    expect(afterWin.keys).toBe(1);
    expect(afterWin.mapIndex).toBe(1);
    expect(afterWin.stats.guardiansDefeated).toBe(1);
  });

  it("unlocks the final skin when the big boss is defeated", () => {
    const state = createNewRun();
    const bossBattle = {
      ...state,
      phase: "battle" as const,
      mapIndex: 3,
      currentNodeId: "final-boss",
      keys: 3,
      player: {
        ...state.player,
        energy: 3,
        hand: ["strike"],
        drawPile: [],
        discardPile: []
      },
      currentEnemy: {
        id: "ancientStormBeast",
        name: "Ancient Storm Beast",
        subtitle: "The big boss behind the three-key gate",
        maxHealth: 110,
        health: 1,
        block: 0,
        deck: ["crush"],
        drawPile: ["crush"],
        discardPile: [],
        intentCardId: "crush"
      }
    };

    const afterWin = playPlayerCard(bossBattle, 0);

    expect(afterWin.phase).toBe("victory");
    expect(afterWin.stats.finalBossDefeated).toBe(true);
    expect(getSkinStatuses(afterWin).find((skin) => skin.id === "stormChampion")?.unlocked).toBe(true);
  });

  it("lets the shop add affordable cards and reject unaffordable cards", () => {
    const started = createNewRun();
    const shop = chooseRouteNode(started, "m1-shop");
    const firstCardId = shop.shopInventory[0];
    const bought = buyShopCard(shop, firstCardId);

    expect(bought.player.deck).toContain(firstCardId);
    expect(bought.player.coins).toBeLessThan(shop.player.coins);

    const tooPoor = buyShopCard(
      {
        ...shop,
        player: {
          ...shop.player,
          coins: 0
        }
      },
      firstCardId
    );

    expect(tooPoor.player.deck.filter((cardId) => cardId === firstCardId)).toHaveLength(
      shop.player.deck.filter((cardId) => cardId === firstCardId).length
    );
  });

  it("opens a card reward choice after normal battles", () => {
    const started = createNewRun();
    const battle = chooseRouteNode(started, "m1-encounter-a");
    const strikeIndex = battle.player.hand.findIndex((cardId) => cardId === "strike");
    const reward = playPlayerCard(
      {
        ...battle,
        currentEnemy: {
          ...battle.currentEnemy!,
          health: 1
        }
      },
      strikeIndex
    );

    expect(reward.phase).toBe("reward");
    expect(reward.pendingReward?.cardIds).toHaveLength(3);

    const chosenCard = reward.pendingReward!.cardIds[0];
    const afterClaim = claimRewardCard(reward, chosenCard);

    expect(afterClaim.phase).toBe("map");
    expect(afterClaim.player.deck).toContain(chosenCard);
    expect(afterClaim.player.coins).toBeGreaterThan(started.player.coins);
  });

  it("allows skipping card rewards without losing coins", () => {
    const started = createNewRun();
    const battle = chooseRouteNode(started, "m1-encounter-a");
    const strikeIndex = battle.player.hand.findIndex((cardId) => cardId === "strike");
    const reward = playPlayerCard(
      {
        ...battle,
        currentEnemy: {
          ...battle.currentEnemy!,
          health: 1
        }
      },
      strikeIndex
    );
    const afterSkip = skipReward(reward);

    expect(reward.phase).toBe("reward");
    expect(afterSkip.phase).toBe("map");
    expect(afterSkip.player.deck).toHaveLength(started.player.deck.length);
    expect(afterSkip.player.coins).toBeGreaterThan(started.player.coins);
  });

  it("applies relic effects for battle energy, attack damage, and shop prices", () => {
    const started = createNewRun();
    const battle = chooseRouteNode(started, "m1-encounter-a");

    expect(battle.player.energy).toBe(4);

    const fangBattle = {
      ...battle,
      player: {
        ...battle.player,
        relics: [...battle.player.relics, "crackedFang"]
      },
      currentEnemy: {
        ...battle.currentEnemy!,
        block: 0
      }
    };
    const strikeIndex = fangBattle.player.hand.findIndex((cardId) => cardId === "strike");
    const afterStrike = playPlayerCard(fangBattle, strikeIndex);

    expect(afterStrike.currentEnemy!.health).toBe(fangBattle.currentEnemy.health - 8);

    const shop = chooseRouteNode(
      {
        ...started,
        player: {
          ...started.player,
          relics: [...started.player.relics, "marketToken"]
        }
      },
      "m1-shop"
    );
    const bought = buyShopCard(shop, "heavySwing");

    expect(bought.player.coins).toBe(started.player.coins - 14);
  });

  it("unlocks exactly four skins through hard progress gates", () => {
    const base = createNewRun();
    const oneKey = {
      ...base,
      keys: 1,
      stats: {
        ...base.stats,
        guardiansDefeated: 1
      }
    };
    const threeKeys = {
      ...oneKey,
      keys: 3,
      stats: {
        ...oneKey.stats,
        mapsCompleted: 3
      }
    };
    const winner = {
      ...threeKeys,
      stats: {
        ...threeKeys.stats,
        finalBossDefeated: true
      }
    };

    expect(getSkinStatuses(base).map((skin) => skin.id)).toEqual([
      "trailKid",
      "sparkScout",
      "ironGuide",
      "stormChampion"
    ]);
    expect(getSkinStatuses(oneKey).filter((skin) => skin.unlocked).map((skin) => skin.id)).toEqual([
      "trailKid",
      "sparkScout"
    ]);
    expect(getSkinStatuses(threeKeys).filter((skin) => skin.unlocked).map((skin) => skin.id)).toEqual([
      "trailKid",
      "sparkScout",
      "ironGuide"
    ]);
    expect(getSkinStatuses(winner).filter((skin) => skin.unlocked).map((skin) => skin.id)).toEqual([
      "trailKid",
      "sparkScout",
      "ironGuide",
      "stormChampion"
    ]);
  });
});
