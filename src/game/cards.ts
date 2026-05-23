import type { CardDefinition } from "./types";

export const CARDS: Record<string, CardDefinition> = {
  strike: {
    id: "strike",
    name: "Strike",
    kind: "attack",
    rarity: "starter",
    cost: 1,
    price: 0,
    damage: 6,
    description: "Deal 6 damage."
  },
  guard: {
    id: "guard",
    name: "Guard",
    kind: "defence",
    rarity: "starter",
    cost: 1,
    price: 0,
    block: 6,
    description: "Gain 6 block."
  },
  quickCut: {
    id: "quickCut",
    name: "Quick Cut",
    kind: "attack",
    rarity: "starter",
    cost: 0,
    price: 0,
    damage: 3,
    description: "Deal 3 damage for free."
  },
  firstAid: {
    id: "firstAid",
    name: "First Aid",
    kind: "skill",
    rarity: "starter",
    cost: 1,
    price: 0,
    heal: 4,
    block: 2,
    description: "Heal 4 and gain 2 block."
  },
  heavySwing: {
    id: "heavySwing",
    name: "Heavy Swing",
    kind: "attack",
    rarity: "common",
    cost: 2,
    price: 18,
    damage: 14,
    description: "Deal 14 damage."
  },
  shieldWall: {
    id: "shieldWall",
    name: "Shield Wall",
    kind: "defence",
    rarity: "common",
    cost: 2,
    price: 16,
    block: 14,
    description: "Gain 14 block."
  },
  wildSpark: {
    id: "wildSpark",
    name: "Wild Spark",
    kind: "attack",
    rarity: "rare",
    cost: 1,
    price: 22,
    damage: 8,
    draw: 1,
    description: "Deal 8 damage and draw 1 card."
  },
  braveStand: {
    id: "braveStand",
    name: "Brave Stand",
    kind: "defence",
    rarity: "rare",
    cost: 1,
    price: 24,
    block: 7,
    heal: 3,
    description: "Gain 7 block and heal 3."
  },
  coinTrick: {
    id: "coinTrick",
    name: "Coin Trick",
    kind: "skill",
    rarity: "rare",
    cost: 0,
    price: 26,
    block: 3,
    draw: 2,
    description: "Gain 3 block and draw 2 cards."
  },
  keyBlade: {
    id: "keyBlade",
    name: "Key Blade",
    kind: "attack",
    rarity: "rare",
    cost: 2,
    price: 30,
    damage: 10,
    block: 5,
    description: "Deal 10 damage and gain 5 block."
  },
  stormCharge: {
    id: "stormCharge",
    name: "Storm Charge",
    kind: "attack",
    rarity: "legendary",
    cost: 3,
    price: 44,
    damage: 22,
    block: 8,
    description: "Deal 22 damage and gain 8 block."
  },
  claw: {
    id: "claw",
    name: "Claw",
    kind: "attack",
    rarity: "enemy",
    cost: 0,
    price: 0,
    damage: 6,
    description: "Enemy attacks for 6."
  },
  bite: {
    id: "bite",
    name: "Bite",
    kind: "attack",
    rarity: "enemy",
    cost: 0,
    price: 0,
    damage: 9,
    description: "Enemy attacks for 9."
  },
  thickHide: {
    id: "thickHide",
    name: "Thick Hide",
    kind: "defence",
    rarity: "enemy",
    cost: 0,
    price: 0,
    block: 8,
    description: "Enemy gains 8 block."
  },
  pounce: {
    id: "pounce",
    name: "Pounce",
    kind: "attack",
    rarity: "enemy",
    cost: 0,
    price: 0,
    damage: 5,
    block: 3,
    description: "Enemy attacks for 5 and gains 3 block."
  },
  crush: {
    id: "crush",
    name: "Crush",
    kind: "attack",
    rarity: "enemy",
    cost: 0,
    price: 0,
    damage: 13,
    description: "Enemy attacks for 13."
  },
  stormRoar: {
    id: "stormRoar",
    name: "Storm Roar",
    kind: "defence",
    rarity: "enemy",
    cost: 0,
    price: 0,
    block: 12,
    damage: 4,
    description: "Enemy attacks for 4 and gains 12 block."
  }
};

export const STARTER_DECK = [
  "strike",
  "strike",
  "strike",
  "strike",
  "guard",
  "guard",
  "guard",
  "quickCut",
  "quickCut",
  "firstAid"
];

export const SHOP_CARD_IDS = ["heavySwing", "shieldWall", "wildSpark", "braveStand", "coinTrick", "keyBlade", "stormCharge"];

export const TREASURE_CARD_IDS = ["wildSpark", "braveStand", "keyBlade", "stormCharge"];

export function getCard(cardId: string): CardDefinition {
  const card = CARDS[cardId];

  if (!card) {
    throw new Error(`Unknown card: ${cardId}`);
  }

  return card;
}
