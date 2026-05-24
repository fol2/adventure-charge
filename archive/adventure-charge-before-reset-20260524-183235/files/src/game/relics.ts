import type { RelicDefinition, RunState } from "./types";

export const RELICS: Record<string, RelicDefinition> = {
  sewerLantern: {
    id: "sewerLantern",
    name: "Sewer Lantern",
    rarity: "starter",
    description: "Start each battle with 1 extra energy on turn one.",
    colour: "#f6c85f"
  },
  stoneShell: {
    id: "stoneShell",
    name: "Stone Shell",
    rarity: "common",
    description: "Start each battle with 5 block.",
    colour: "#8a9384"
  },
  crackedFang: {
    id: "crackedFang",
    name: "Cracked Fang",
    rarity: "common",
    description: "Attack cards deal 2 extra damage.",
    colour: "#ef6f55"
  },
  mossBandage: {
    id: "mossBandage",
    name: "Moss Bandage",
    rarity: "rare",
    description: "Rest sites heal 6 extra health.",
    colour: "#49b86f"
  },
  marketToken: {
    id: "marketToken",
    name: "Market Token",
    rarity: "rare",
    description: "Shop cards cost 4 fewer coins.",
    colour: "#54b9c7"
  },
  bossKeyCharm: {
    id: "bossKeyCharm",
    name: "Boss Key Charm",
    rarity: "boss",
    description: "After a guardian, gain 1 extra max energy.",
    colour: "#a779df"
  }
};

export const RELIC_REWARD_IDS = ["stoneShell", "crackedFang", "mossBandage", "marketToken", "bossKeyCharm"];

export function getRelic(relicId: string): RelicDefinition {
  const relic = RELICS[relicId];

  if (!relic) {
    throw new Error(`Unknown relic: ${relicId}`);
  }

  return relic;
}

export function hasRelic(state: RunState, relicId: string): boolean {
  return state.player.relics.includes(relicId);
}

export function getNextRelicId(state: RunState, offset = 0): string | undefined {
  const owned = new Set(state.player.relics);
  const available = RELIC_REWARD_IDS.filter((relicId) => !owned.has(relicId));

  if (available.length === 0) {
    return undefined;
  }

  return available[(state.stats.battlesWon + state.keys + offset) % available.length];
}
