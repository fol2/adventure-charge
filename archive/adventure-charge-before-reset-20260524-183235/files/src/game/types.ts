export type GamePhase = "start" | "map" | "battle" | "reward" | "shop" | "victory" | "defeat";

export type CardKind = "attack" | "defence" | "skill";

export type CardRarity = "starter" | "common" | "rare" | "legendary" | "enemy";

export interface CardDefinition {
  id: string;
  name: string;
  kind: CardKind;
  rarity: CardRarity;
  cost: number;
  price: number;
  description: string;
  damage?: number;
  block?: number;
  heal?: number;
  draw?: number;
}

export interface PlayerState {
  maxHealth: number;
  health: number;
  block: number;
  maxEnergy: number;
  energy: number;
  coins: number;
  relics: string[];
  deck: string[];
  drawPile: string[];
  hand: string[];
  discardPile: string[];
}

export interface EnemyDefinition {
  id: string;
  name: string;
  subtitle: string;
  maxHealth: number;
  deck: string[];
  rewardCoins: number;
  rewardCardIds: string[];
}

export interface EnemyState {
  id: string;
  name: string;
  subtitle: string;
  maxHealth: number;
  health: number;
  block: number;
  deck: string[];
  drawPile: string[];
  discardPile: string[];
  intentCardId: string | null;
}

export type MapNodeType = "start" | "encounter" | "elite" | "shop" | "rest" | "treasure" | "guardian" | "finalBoss";

export interface MapNode {
  id: string;
  type: MapNodeType;
  label: string;
  detail: string;
  row: number;
  lane: number;
  nextIds: string[];
  enemyId?: string;
}

export interface MapDefinition {
  id: string;
  name: string;
  theme: string;
  startNodeId: string;
  nodes: MapNode[];
}

export interface SkinDefinition {
  id: string;
  name: string;
  title: string;
  colour: string;
  unlockDescription: string;
}

export interface SkinStatus extends SkinDefinition {
  unlocked: boolean;
}

export type RelicRarity = "starter" | "common" | "rare" | "boss";

export interface RelicDefinition {
  id: string;
  name: string;
  rarity: RelicRarity;
  description: string;
  colour: string;
}

export type RewardReason = "battle" | "treasure" | "guardian" | "finalBoss";

export interface PendingReward {
  reason: RewardReason;
  sourceNodeId: string;
  title: string;
  coins: number;
  cardIds: string[];
  relicId?: string;
}

export interface RunStats {
  battlesWon: number;
  elitesDefeated: number;
  guardiansDefeated: number;
  mapsCompleted: number;
  cardsBought: number;
  finalBossDefeated: boolean;
}

export interface RunState {
  phase: GamePhase;
  mapIndex: number;
  currentNodeId: string;
  completedNodeIds: string[];
  keys: number;
  selectedSkinId: string;
  player: PlayerState;
  currentEnemy: EnemyState | null;
  shopInventory: string[];
  pendingReward: PendingReward | null;
  stats: RunStats;
  message: string;
}
