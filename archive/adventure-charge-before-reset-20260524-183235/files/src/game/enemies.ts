import type { EnemyDefinition } from "./types";

export const ENEMIES: Record<string, EnemyDefinition> = {
  brambleBoar: {
    id: "brambleBoar",
    name: "Bramble Boar",
    subtitle: "A stubborn forest fighter",
    maxHealth: 28,
    deck: ["claw", "thickHide", "pounce", "claw"],
    rewardCoins: 12,
    rewardCardIds: ["heavySwing", "shieldWall"]
  },
  riverLynx: {
    id: "riverLynx",
    name: "River Lynx",
    subtitle: "Fast paws, sharp timing",
    maxHealth: 24,
    deck: ["pounce", "claw", "bite", "thickHide"],
    rewardCoins: 14,
    rewardCardIds: ["wildSpark", "braveStand"]
  },
  ridgeWolf: {
    id: "ridgeWolf",
    name: "Ridge Wolf",
    subtitle: "An elite hunter on the high path",
    maxHealth: 38,
    deck: ["bite", "pounce", "thickHide", "bite"],
    rewardCoins: 22,
    rewardCardIds: ["wildSpark", "keyBlade"]
  },
  thornBear: {
    id: "thornBear",
    name: "Thorn Bear",
    subtitle: "Guardian of the first key",
    maxHealth: 46,
    deck: ["thickHide", "bite", "claw", "crush"],
    rewardCoins: 28,
    rewardCardIds: ["keyBlade", "stormCharge"]
  },
  frostMaw: {
    id: "frostMaw",
    name: "Frost Maw",
    subtitle: "The second map's patient guardian",
    maxHealth: 58,
    deck: ["bite", "thickHide", "crush", "pounce"],
    rewardCoins: 34,
    rewardCardIds: ["stormCharge", "coinTrick"]
  },
  thunderTusks: {
    id: "thunderTusks",
    name: "Thunder Tusks",
    subtitle: "The final map's gatekeeper",
    maxHealth: 72,
    deck: ["crush", "stormRoar", "bite", "thickHide"],
    rewardCoins: 40,
    rewardCardIds: ["stormCharge", "keyBlade"]
  },
  ancientStormBeast: {
    id: "ancientStormBeast",
    name: "Ancient Storm Beast",
    subtitle: "The big boss behind the three-key gate",
    maxHealth: 110,
    deck: ["stormRoar", "crush", "bite", "stormRoar", "crush"],
    rewardCoins: 80,
    rewardCardIds: ["stormCharge"]
  }
};

export function getEnemy(enemyId: string): EnemyDefinition {
  const enemy = ENEMIES[enemyId];

  if (!enemy) {
    throw new Error(`Unknown enemy: ${enemyId}`);
  }

  return enemy;
}
