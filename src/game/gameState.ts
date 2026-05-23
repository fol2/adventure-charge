import { getCard, SHOP_CARD_IDS, STARTER_DECK, TREASURE_CARD_IDS } from "./cards";
import { getEnemy } from "./enemies";
import { FINAL_BOSS_NODE, getCurrentMap, MAPS } from "./maps";
import { isSkinUnlocked } from "./skins";
import type { EnemyState, MapNode, PlayerState, RunState, RunStats } from "./types";

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
    const healedPlayer = healPlayer(state.player, 18);

    return completeMapNode(
      {
        ...state,
        player: healedPlayer,
        message: "You rest and recover 18 health."
      },
      node
    );
  }

  if (node.type === "treasure") {
    const cardId = TREASURE_CARD_IDS[(state.keys + state.stats.battlesWon + state.mapIndex) % TREASURE_CARD_IDS.length];
    const card = getCard(cardId);

    return completeMapNode(
      {
        ...state,
        player: addCardToDeck({ ...state.player, coins: state.player.coins + 10 }, cardId),
        message: `Treasure found: ${card.name} joins your deck, with 10 coins.`
      },
      node
    );
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
    nextEnemy = damageEnemy(nextEnemy, card.damage);
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

  if (state.player.coins < card.price) {
    return {
      ...state,
      message: `${card.name} costs ${card.price} coins.`
    };
  }

  return {
    ...state,
    player: addCardToDeck(
      {
        ...state.player,
        coins: state.player.coins - card.price
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
      block: 0,
      energy: state.player.maxEnergy,
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
  const rewardCardId =
    enemyDefinition.rewardCardIds[state.stats.battlesWon % Math.max(1, enemyDefinition.rewardCardIds.length)];
  const rewardCard = getCard(rewardCardId);
  const rewardedPlayer = addCardToDeck(
    {
      ...state.player,
      coins: state.player.coins + enemyDefinition.rewardCoins,
      block: 0,
      hand: [],
      discardPile: [...state.player.discardPile, ...state.player.hand]
    },
    rewardCardId
  );
  const baseStats: RunStats = {
    ...state.stats,
    battlesWon: state.stats.battlesWon + 1,
    elitesDefeated: state.stats.elitesDefeated + (currentNode?.type === "elite" ? 1 : 0)
  };

  if (currentNode?.type === "finalBoss") {
    return {
      ...state,
      phase: "victory",
      player: rewardedPlayer,
      currentEnemy: null,
      stats: {
        ...baseStats,
        finalBossDefeated: true
      },
      message: "The Ancient Storm Beast falls. Storm Champion is unlocked."
    };
  }

  if (currentNode?.type === "guardian") {
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
      player: rewardedPlayer,
      currentEnemy: null,
      stats: {
        ...baseStats,
        guardiansDefeated: baseStats.guardiansDefeated + 1,
        mapsCompleted: baseStats.mapsCompleted + 1
      },
      message: hasFinishedAllMaps
        ? `Key ${nextKeys} claimed. The big boss gate is open. ${rewardCard.name} joined your deck.`
        : `Key ${nextKeys} claimed. You enter ${nextMap.name}. ${rewardCard.name} joined your deck.`
    };
  }

  if (!currentNode) {
    return {
      ...state,
      phase: "map",
      player: rewardedPlayer,
      currentEnemy: null,
      stats: baseStats,
      message: `${enemyDefinition.name} defeated. ${rewardCard.name} joined your deck.`
    };
  }

  return completeMapNode(
    {
      ...state,
      phase: "map",
      player: rewardedPlayer,
      currentEnemy: null,
      stats: baseStats,
      message: `${enemyDefinition.name} defeated. ${rewardCard.name} joined your deck.`
    },
    currentNode
  );
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
