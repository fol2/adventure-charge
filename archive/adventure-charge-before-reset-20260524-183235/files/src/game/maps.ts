import type { MapDefinition, MapNode } from "./types";

export const FINAL_BOSS_NODE: MapNode = {
  id: "final-boss",
  type: "finalBoss",
  label: "Storm Gate",
  detail: "Spend all 3 keys to challenge the big boss.",
  row: 1,
  lane: 0,
  nextIds: [],
  enemyId: "ancientStormBeast"
};

export const MAPS: MapDefinition[] = [
  {
    id: "greenwood",
    name: "Greenwood Trail",
    theme: "Forest paths with the first key at the old thorn den.",
    startNodeId: "m1-start",
    nodes: [
      {
        id: "m1-start",
        type: "start",
        label: "Camp",
        detail: "Choose your first path.",
        row: 0,
        lane: 0,
        nextIds: ["m1-encounter-a", "m1-shop"]
      },
      {
        id: "m1-encounter-a",
        type: "encounter",
        label: "Bramble Track",
        detail: "A wild fight blocks the left fork.",
        row: 1,
        lane: -1,
        nextIds: ["m1-rest", "m1-elite"],
        enemyId: "brambleBoar"
      },
      {
        id: "m1-shop",
        type: "shop",
        label: "Lantern Shop",
        detail: "Spend coins on stronger cards.",
        row: 1,
        lane: 1,
        nextIds: ["m1-encounter-b", "m1-treasure"]
      },
      {
        id: "m1-rest",
        type: "rest",
        label: "Moss Shelter",
        detail: "Recover before the guardian.",
        row: 2,
        lane: -2,
        nextIds: ["m1-guardian"]
      },
      {
        id: "m1-elite",
        type: "elite",
        label: "Ridge Hunt",
        detail: "A harder fight with better rewards.",
        row: 2,
        lane: 0,
        nextIds: ["m1-guardian"],
        enemyId: "ridgeWolf"
      },
      {
        id: "m1-encounter-b",
        type: "encounter",
        label: "River Bend",
        detail: "A quick enemy guards the water path.",
        row: 2,
        lane: 1,
        nextIds: ["m1-guardian"],
        enemyId: "riverLynx"
      },
      {
        id: "m1-treasure",
        type: "treasure",
        label: "Sunken Chest",
        detail: "Gain a rare card and coins.",
        row: 2,
        lane: 2,
        nextIds: ["m1-guardian"]
      },
      {
        id: "m1-guardian",
        type: "guardian",
        label: "Thorn Den",
        detail: "Beat the guardian to claim key 1.",
        row: 3,
        lane: 0,
        nextIds: [],
        enemyId: "thornBear"
      }
    ]
  },
  {
    id: "frostpass",
    name: "Frostpass Steps",
    theme: "Icy ridges where route choices punish weak decks.",
    startNodeId: "m2-start",
    nodes: [
      {
        id: "m2-start",
        type: "start",
        label: "Snow Camp",
        detail: "The cold path begins.",
        row: 0,
        lane: 0,
        nextIds: ["m2-elite", "m2-rest"]
      },
      {
        id: "m2-elite",
        type: "elite",
        label: "Ice Ridge",
        detail: "Risk a tough fight for more coins.",
        row: 1,
        lane: -1,
        nextIds: ["m2-shop", "m2-encounter-b"],
        enemyId: "ridgeWolf"
      },
      {
        id: "m2-rest",
        type: "rest",
        label: "Warm Stones",
        detail: "Heal now, but skip the elite reward.",
        row: 1,
        lane: 1,
        nextIds: ["m2-encounter-a", "m2-treasure"]
      },
      {
        id: "m2-shop",
        type: "shop",
        label: "Peak Trader",
        detail: "Expensive cards before the guardian.",
        row: 2,
        lane: -2,
        nextIds: ["m2-guardian"]
      },
      {
        id: "m2-encounter-a",
        type: "encounter",
        label: "White River",
        detail: "A fast ambush near the ice.",
        row: 2,
        lane: 0,
        nextIds: ["m2-guardian"],
        enemyId: "riverLynx"
      },
      {
        id: "m2-encounter-b",
        type: "encounter",
        label: "Bramble Ice",
        detail: "A defensive foe waits ahead.",
        row: 2,
        lane: 1,
        nextIds: ["m2-guardian"],
        enemyId: "brambleBoar"
      },
      {
        id: "m2-treasure",
        type: "treasure",
        label: "Frozen Cache",
        detail: "Find a powerful card.",
        row: 2,
        lane: 2,
        nextIds: ["m2-guardian"]
      },
      {
        id: "m2-guardian",
        type: "guardian",
        label: "Frost Maw",
        detail: "Beat the guardian to claim key 2.",
        row: 3,
        lane: 0,
        nextIds: [],
        enemyId: "frostMaw"
      }
    ]
  },
  {
    id: "stormspire",
    name: "Stormspire Climb",
    theme: "The last map is short, sharp, and mean.",
    startNodeId: "m3-start",
    nodes: [
      {
        id: "m3-start",
        type: "start",
        label: "Broken Gate",
        detail: "One final route before the boss key.",
        row: 0,
        lane: 0,
        nextIds: ["m3-shop", "m3-encounter-a", "m3-elite"]
      },
      {
        id: "m3-shop",
        type: "shop",
        label: "Last Shop",
        detail: "Buy before the climb gets brutal.",
        row: 1,
        lane: -2,
        nextIds: ["m3-encounter-b", "m3-treasure"]
      },
      {
        id: "m3-encounter-a",
        type: "encounter",
        label: "Storm Path",
        detail: "A normal fight with no easy turns.",
        row: 1,
        lane: 0,
        nextIds: ["m3-rest", "m3-treasure"],
        enemyId: "riverLynx"
      },
      {
        id: "m3-elite",
        type: "elite",
        label: "High Hunt",
        detail: "A dangerous route for brave decks.",
        row: 1,
        lane: 2,
        nextIds: ["m3-rest"],
        enemyId: "ridgeWolf"
      },
      {
        id: "m3-encounter-b",
        type: "encounter",
        label: "Thunder Hollow",
        detail: "The last regular fight.",
        row: 2,
        lane: -1,
        nextIds: ["m3-guardian"],
        enemyId: "brambleBoar"
      },
      {
        id: "m3-rest",
        type: "rest",
        label: "Quiet Shrine",
        detail: "A rare safe moment.",
        row: 2,
        lane: 1,
        nextIds: ["m3-guardian"]
      },
      {
        id: "m3-treasure",
        type: "treasure",
        label: "Storm Vault",
        detail: "Gain a late power card.",
        row: 2,
        lane: 2,
        nextIds: ["m3-guardian"]
      },
      {
        id: "m3-guardian",
        type: "guardian",
        label: "Thunder Tusks",
        detail: "Beat the guardian to claim key 3.",
        row: 3,
        lane: 0,
        nextIds: [],
        enemyId: "thunderTusks"
      }
    ]
  }
];

export function getCurrentMap(mapIndex: number): MapDefinition | null {
  return MAPS[mapIndex] ?? null;
}
