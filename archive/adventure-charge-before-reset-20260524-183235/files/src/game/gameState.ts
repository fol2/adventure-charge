import { getCard, SHOP_CARD_IDS, STARTER_DECK, TREASURE_CARD_IDS } from "./cards";
import { getEnemy } from "./enemies";
import { FINAL_BOSS_NODE, getCurrentMap, MAPS } from "./maps";
import { getNextRelicId } from "./relics";
import { isSkinUnlocked } from "./skins";
import type { EnemyDefinition, EnemyState, MapNode, PendingReward, PlayerState, RunState, RunStats } from "./types";

const STARTING_HEALTH = 74;
const STARTING_COINS = 24;
const HAND_SIZE = 5;

export function createInitialState(): RunState {
  return {
    ...createNewRun(),
    phase: "start",
    message: "Ready to start an adventure."
  };
}

export function createNewRun(): RunState {
  const firstMap = MAPS[0];

  return {
    phase: "map",
    mapIndex: 0,
    currentNodeId: firstMap.startNodeId,
    completedNodeIds: [firstMap.startNodeId],
    keys: 0,
    selectedSkinId: "trailKid",
    player: createPlayer(),
    currentEnemy: null,
    shopInventory: generateShopInventory(0),
    pendingReward: null,
    stats: createStats(),
    message: "Choose a route. Three keys open the storm gate."
  };
}

export function getAvailableNodes(state: RunState): MapNode[] {
  if (state.phase !== "map") {
    return [];
  }

  if (state.mapIndex >= MAPS.length) {
    return canStartFinalBoss(state) && !state.stats.finalBossDefeated ? [FINAL_BOSS_NODE] : [];
  }

  const currentMap = getCurrentMap(state.mapIndex);
  const currentNode = currentMap?.nodes.find((node) => node.id === state.currentNodeId);

  if (!currentMap || !currentNode) {
    return [];
  }

  return currentNode.nextIds
    .map((nodeId) => currentMap.nodes.find((node) => node.id === nodeId))
    .filter((node): node is MapNode => Boolean(node));
}

export function chooseRouteNode(state: RunState, nodeId: string): RunState {
  const node = getAvailableNodes(state).find((candidate) => candidate.id === nodeId);

  if (!node) {
    return {
      ...state,
      message: "That route is not open yet."
    };
  }

  if (node.type === "shop") {
    return {
      ...state,
      phase: "shop",
      currentNodeId: node.id,
      shopInventory: generateShopInventory(state.mapIndex + state.keys + state.stats.cardsBought),
      message: "The shopkeeper lays out three cards."
    };
  }

  if (node.type === "rest") {
    const restBonus = state.player.relics.includes("mossBandage") ? 6 : 0;
    const healedPlayer = healPlayer(state.player, 18 + restBonus);

    return completeMapNode(
      {
        ...state,
        player: healedPlayer,
        message: `You rest and recover ${18 + restBonus} health.`
      },
      node
    );
  }

  if (node.type === "treasure") {
    return {
      ...state,
      phase: "reward",
      currentNodeId: node.id,
      pendingReward: createTreasureReward(state, node),
      message: "A dirty chest cracks open. Pick a card or skip it."
    };
  }

  if (node.type === "finalBoss" && !canStartFinalBoss(state)) {
    return {
      ...state,
      message: "The storm gate needs all 3 keys."
    };
  }

  if (node.enemyId) {
    return startBattle(state, node);
  }

  return completeMapNode(state, node);
}

export function playPlayerCard(state: RunState, handIndex: number): RunState {
  if (state.phase !== "battle" || !state.currentEnemy) {
    return state;
  }

  const cardId = state.player.hand[handIndex];

  if (!cardId) {
    return state;
  }

  const card = getCard(cardId);

  if (state.player.energy < card.cost) {
    return {
      ...state,
      message: "Not enough energy for that card."
    };
  }

  const nextHand = state.player.hand.filter((_, index) => index !== handIndex);
  let nextPlayer: PlayerState = {
    ...state.player,
    energy: state.player.energy - card.cost,
    hand: nextHand,
    discardPile: [...state.player.discardPile, cardId]
  };
  let nextEnemy = { ...state.currentEnemy };

  if (card.damage) {
    const relicBonus = card.kind === "attack" && state.player.relics.includes("crackedFang") ? 2 : 0;
    nextEnemy = damageEnemy(nextEnemy, card.damage + relicBonus);
  }

  if (card.block) {
    nextPlayer = {
      ...nextPlayer,
      block: nextPlayer.block + card.block
    };
  }

  if (card.heal) {
    nextPlayer = healPlayer(nextPlayer, card.heal);
  }

  if (card.draw) {
    nextPlayer = drawCards(nextPlayer, card.draw);
  }

  const nextState = {
    ...state,
    player: nextPlayer,
    currentEnemy: nextEnemy,
    message: `${card.name} played.`
  };

  if (nextEnemy.health <= 0) {
    return completeBattle(nextState);
  }

  return nextState;
}

export function endPlayerTurn(state: RunState): RunState {
  if (state.phase !== "battle" || !state.currentEnemy) {
    return state;
  }

  let nextPlayer: PlayerState = {
    ...state.player,
    hand: [],
    discardPile: [...state.player.discardPile, ...state.player.hand]
  };
  let nextEnemy: EnemyState = { ...state.currentEnemy };
  const intentCardId = nextEnemy.intentCardId;

  if (intentCardId) {
    const intent = getCard(intentCardId);

    if (intent.damage) {
      nextPlayer = damagePlayer(nextPlayer, intent.damage);
    }

    if (intent.block) {
      nextEnemy = {
        ...nextEnemy,
        block: nextEnemy.block + intent.block
      };
    }

    if (intent.heal) {
      nextEnemy = {
        ...nextEnemy,
        health: Math.min(nextEnemy.maxHealth, nextEnemy.health + intent.heal)
      };
    }

    nextEnemy = {
      ...nextEnemy,
      discardPile: [...nextEnemy.discardPile, intentCardId],
      intentCardId: null
    };
  }

  if (nextPlayer.health <= 0) {
    return {
      ...state,
      phase: "defeat",
      player: {
        ...nextPlayer,
        block: 0
      },
      currentEnemy: nextEnemy,
      message: "Your adventure ends here. Try a safer route or buy stronger cards next time."
    };
  }

  nextPlayer = drawCards(
    {
      ...nextPlayer,
      block: 0,
      energy: nextPlayer.maxEnergy
    },
    HAND_SIZE
  );
  nextEnemy = drawEnemyIntent(nextEnemy);

  return {
    ...state,
    player: nextPlayer,
    currentEnemy: nextEnemy,
    stats: {
      ...state.stats
    },
    message: intentCardId ? `${nextEnemy.name} used ${getCard(intentCardId).name}.` : "The enemy hesitates."
  };
}

export function buyShopCard(state: RunState, cardId: string): RunState {
  if (state.phase !== "shop" || !state.shopInventory.includes(cardId)) {
    return state;
  }

  const card = getCard(cardId);

  const price = getCardPrice(state, cardId);

  if (state.player.coins < price) {
    return {
      ...state,
      message: `${card.name} costs ${price} coins.`
    };
  }

  return {
    ...state,
    player: addCardToDeck(
      {
        ...state.player,
        coins: state.player.coins - price
      },
      cardId
    ),
    shopInventory: state.shopInventory.filter((id) => id !== cardId),
    stats: {
      ...state.stats,
      cardsBought: state.stats.cardsBought + 1
    },
    message: `${card.name} added to your deck.`
  };
}

export function claimRewardCard(state: RunState, cardId: string): RunState {
  if (state.phase !== "reward" || !state.pendingReward || !state.pendingReward.cardIds.includes(cardId)) {
    return state;
  }

  return completePendingReward(state, cardId);
}

export function skipReward(state: RunState): RunState {
  if (state.phase !== "reward" || !state.pendingReward) {
    return state;
  }

  return completePendingReward(state);
}

export function leaveShop(state: RunState): RunState {
  if (state.phase !== "shop") {
    return state;
  }

  const currentMap = getCurrentMap(state.mapIndex);
  const shopNode = currentMap?.nodes.find((node) => node.id === state.currentNodeId);

  if (!shopNode) {
    return {
      ...state,
      phase: "map",
      message: "Back to the map."
    };
  }

  return completeMapNode(
    {
      ...state,
      phase: "map",
      message: "You leave the shop and return to the route."
    },
    shopNode
  );
}

export function selectSkin(state: RunState, skinId: string): RunState {
  if (!isSkinUnlocked(skinId, state)) {
    return {
      ...state,
      message: "That skin is still locked."
    };
  }

  return {
    ...state,
    selectedSkinId: skinId,
    message: "Skin changed."
  };
}

export function canStartFinalBoss(state: RunState): boolean {
  return state.keys >= 3 && state.mapIndex >= MAPS.length;
}

export function getCardPrice(state: RunState, cardId: string): number {
  const card = getCard(cardId);
  const discount = state.player.relics.includes("marketToken") ? 4 : 0;

  return Math.max(1, card.price - discount);
}

function createStats(): RunStats {
  return {
    battlesWon: 0,
    elitesDefeated: 0,
    guardiansDefeated: 0,
    mapsCompleted: 0,
    cardsBought: 0,
    finalBossDefeated: false
  };
}

function createPlayer(): PlayerState {
  return {
    maxHealth: STARTING_HEALTH,
    health: STARTING_HEALTH,
    block: 0,
    maxEnergy: 3,
    energy: 3,
    coins: STARTING_COINS,
    relics: ["sewerLantern"],
    deck: [...STARTER_DECK],
    drawPile: [...STARTER_DECK],
    hand: [],
    discardPile: []
  };
}

function startBattle(state: RunState, node: MapNode): RunState {
  if (!node.enemyId) {
    return state;
  }

  let enemy = createEnemy(node.enemyId);
  enemy = drawEnemyIntent(enemy);

  const player = drawCards(
    {
      ...state.player,
      block: state.player.relics.includes("stoneShell") ? 5 : 0,
      energy: state.player.maxEnergy + (state.player.relics.includes("sewerLantern") ? 1 : 0),
      drawPile: [...state.player.deck],
      hand: [],
      discardPile: []
    },
    HAND_SIZE
  );

  return {
    ...state,
    phase: "battle",
    currentNodeId: node.id,
    player,
    currentEnemy: enemy,
    message: `${enemy.name} blocks the route.`
  };
}

function completeBattle(state: RunState): RunState {
  if (!state.currentEnemy) {
    return state;
  }

  const currentNode = getNodeForState(state);
  const enemyDefinition = getEnemy(state.currentEnemy.id);
  const cleanedPlayer = {
    ...state.player,
    block: 0,
    hand: [],
    discardPile: [...state.player.discardPile, ...state.player.hand]
  };
  const baseStats: RunStats = {
    ...state.stats,
    battlesWon: state.stats.battlesWon + 1,
    elitesDefeated: state.stats.elitesDefeated + (currentNode?.type === "elite" ? 1 : 0)
  };

  if (currentNode?.type === "finalBoss") {
    return {
      ...state,
      phase: "victory",
      player: {
        ...cleanedPlayer,
        coins: cleanedPlayer.coins + enemyDefinition.rewardCoins
      },
      currentEnemy: null,
      pendingReward: null,
      stats: {
        ...baseStats,
        finalBossDefeated: true
      },
      message: "The Ancient Storm Beast falls. Storm Champion is unlocked."
    };
  }

  if (!currentNode) {
    return {
      ...state,
      phase: "map",
      player: {
        ...cleanedPlayer,
        coins: cleanedPlayer.coins + enemyDefinition.rewardCoins
      },
      currentEnemy: null,
      pendingReward: null,
      stats: baseStats,
      message: `${enemyDefinition.name} defeated.`
    };
  }

  return {
    ...state,
    phase: "reward",
    player: cleanedPlayer,
    currentEnemy: null,
    pendingReward: createBattleReward(state, currentNode, enemyDefinition),
    stats: baseStats,
    message: `${enemyDefinition.name} defeated. Pick a reward card, or skip it.`
  };
}

function createEnemy(enemyId: string): EnemyState {
  const enemy = getEnemy(enemyId);

  return {
    id: enemy.id,
    name: enemy.name,
    subtitle: enemy.subtitle,
    maxHealth: enemy.maxHealth,
    health: enemy.maxHealth,
    block: 0,
    deck: [...enemy.deck],
    drawPile: [...enemy.deck],
    discardPile: [],
    intentCardId: null
  };
}

function drawCards(player: PlayerState, count: number): PlayerState {
  let nextPlayer = { ...player, drawPile: [...player.drawPile], hand: [...player.hand], discardPile: [...player.discardPile] };

  for (let index = 0; index < count; index += 1) {
    if (nextPlayer.drawPile.length === 0) {
      if (nextPlayer.discardPile.length === 0) {
        break;
      }

      nextPlayer = {
        ...nextPlayer,
        drawPile: [...nextPlayer.discardPile],
        discardPile: []
      };
    }

    const [nextCard, ...remainingDrawPile] = nextPlayer.drawPile;
    nextPlayer = {
      ...nextPlayer,
      drawPile: remainingDrawPile,
      hand: [...nextPlayer.hand, nextCard]
    };
  }

  return nextPlayer;
}

function drawEnemyIntent(enemy: EnemyState): EnemyState {
  let nextEnemy = { ...enemy, drawPile: [...enemy.drawPile], discardPile: [...enemy.discardPile] };

  if (nextEnemy.drawPile.length === 0) {
    nextEnemy = {
      ...nextEnemy,
      drawPile: [...nextEnemy.discardPile],
      discardPile: []
    };
  }

  const [intentCardId, ...remainingDrawPile] = nextEnemy.drawPile;

  return {
    ...nextEnemy,
    drawPile: remainingDrawPile,
    intentCardId: intentCardId ?? null
  };
}

function damageEnemy(enemy: EnemyState, amount: number): EnemyState {
  const remainingBlock = Math.max(0, enemy.block - amount);
  const damageAfterBlock = Math.max(0, amount - enemy.block);

  return {
    ...enemy,
    block: remainingBlock,
    health: Math.max(0, enemy.health - damageAfterBlock)
  };
}

function damagePlayer(player: PlayerState, amount: number): PlayerState {
  const remainingBlock = Math.max(0, player.block - amount);
  const damageAfterBlock = Math.max(0, amount - player.block);

  return {
    ...player,
    block: remainingBlock,
    health: Math.max(0, player.health - damageAfterBlock)
  };
}

function healPlayer(player: PlayerState, amount: number): PlayerState {
  return {
    ...player,
    health: Math.min(player.maxHealth, player.health + amount)
  };
}

function addCardToDeck(player: PlayerState, cardId: string): PlayerState {
  return {
    ...player,
    deck: [...player.deck, cardId],
    discardPile: [...player.discardPile, cardId]
  };
}

function completeMapNode(state: RunState, node: MapNode): RunState {
  return {
    ...state,
    phase: "map",
    currentNodeId: node.id,
    completedNodeIds: [...new Set([...state.completedNodeIds, node.id])],
    pendingReward: null,
    message: state.message
  };
}

function getNodeForState(state: RunState): MapNode | null {
  if (state.currentNodeId === FINAL_BOSS_NODE.id) {
    return FINAL_BOSS_NODE;
  }

  const currentMap = getCurrentMap(state.mapIndex);

  return currentMap?.nodes.find((node) => node.id === state.currentNodeId) ?? null;
}

function generateShopInventory(offset: number): string[] {
  return [0, 1, 2].map((slot) => SHOP_CARD_IDS[(offset + slot) % SHOP_CARD_IDS.length]);
}

function createBattleReward(state: RunState, node: MapNode, enemy: EnemyDefinition): PendingReward {
  const isEliteOrGuardian = node.type === "elite" || node.type === "guardian";

  return {
    reason: node.type === "guardian" ? "guardian" : "battle",
    sourceNodeId: node.id,
    title: node.type === "guardian" ? "Guardian reward" : isEliteOrGuardian ? "Elite reward" : "Battle reward",
    coins: enemy.rewardCoins,
    cardIds: generateCardRewardIds(state, enemy.rewardCardIds),
    relicId: isEliteOrGuardian ? getNextRelicId(state, node.type === "guardian" ? 2 : 0) : undefined
  };
}

function createTreasureReward(state: RunState, node: MapNode): PendingReward {
  return {
    reason: "treasure",
    sourceNodeId: node.id,
    title: "Treasure reward",
    coins: 10,
    cardIds: generateCardRewardIds(state, TREASURE_CARD_IDS),
    relicId: getNextRelicId(state, 1)
  };
}

function generateCardRewardIds(state: RunState, priorityCardIds: string[]): string[] {
  const pool = [...new Set([...priorityCardIds, ...TREASURE_CARD_IDS, ...SHOP_CARD_IDS])];

  return [0, 1, 2].map((slot) => pool[(state.stats.battlesWon + state.keys + state.mapIndex + slot) % pool.length]);
}

function completePendingReward(state: RunState, cardId?: string): RunState {
  const reward = state.pendingReward;

  if (!reward) {
    return state;
  }

  const cardName = cardId ? getCard(cardId).name : null;
  let rewardedPlayer = {
    ...state.player,
    coins: state.player.coins + reward.coins
  };

  if (cardId) {
    rewardedPlayer = addCardToDeck(rewardedPlayer, cardId);
  }

  if (reward.relicId && !rewardedPlayer.relics.includes(reward.relicId)) {
    rewardedPlayer = {
      ...rewardedPlayer,
      relics: [...rewardedPlayer.relics, reward.relicId],
      maxEnergy: reward.relicId === "bossKeyCharm" ? rewardedPlayer.maxEnergy + 1 : rewardedPlayer.maxEnergy
    };
  }

  const chosenMessage = cardName ? `${cardName} added to your deck.` : "You skip the card reward.";

  if (reward.reason === "guardian") {
    return completeGuardianReward(state, rewardedPlayer, chosenMessage);
  }

  const currentNode = getNodeForState(state);

  if (!currentNode) {
    return {
      ...state,
      phase: "map",
      player: rewardedPlayer,
      pendingReward: null,
      message: chosenMessage
    };
  }

  return completeMapNode(
    {
      ...state,
      player: rewardedPlayer,
      pendingReward: null,
      message: chosenMessage
    },
    currentNode
  );
}

function completeGuardianReward(state: RunState, player: PlayerState, chosenMessage: string): RunState {
  const nextKeys = state.keys + 1;
  const nextMapIndex = state.mapIndex + 1;
  const hasFinishedAllMaps = nextMapIndex >= MAPS.length;
  const nextMap = MAPS[nextMapIndex];

  return {
    ...state,
    phase: "map",
    mapIndex: nextMapIndex,
    currentNodeId: hasFinishedAllMaps ? "boss-gate" : nextMap.startNodeId,
    completedNodeIds: hasFinishedAllMaps ? ["boss-gate"] : [nextMap.startNodeId],
    keys: nextKeys,
    player,
    currentEnemy: null,
    pendingReward: null,
    stats: {
      ...state.stats,
      guardiansDefeated: state.stats.guardiansDefeated + 1,
      mapsCompleted: state.stats.mapsCompleted + 1
    },
    message: hasFinishedAllMaps
      ? `${chosenMessage} Key ${nextKeys} claimed. The big boss gate is open.`
      : `${chosenMessage} Key ${nextKeys} claimed. You enter ${nextMap.name}.`
  };
}
