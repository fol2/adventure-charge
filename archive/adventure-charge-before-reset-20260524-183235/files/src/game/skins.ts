import type { RunState, SkinDefinition, SkinStatus } from "./types";

export const SKINS: SkinDefinition[] = [
  {
    id: "trailKid",
    name: "Trail Kid",
    title: "Starter adventurer",
    colour: "#49b86f",
    unlockDescription: "Unlocked from the start."
  },
  {
    id: "sparkScout",
    name: "Spark Scout",
    title: "First-key survivor",
    colour: "#f6c85f",
    unlockDescription: "Earn 1 key in a run."
  },
  {
    id: "ironGuide",
    name: "Iron Guide",
    title: "Three-map finisher",
    colour: "#54b9c7",
    unlockDescription: "Finish all 3 maps in one run."
  },
  {
    id: "stormChampion",
    name: "Storm Champion",
    title: "Big boss winner",
    colour: "#ef6f55",
    unlockDescription: "Defeat the big boss after collecting 3 keys."
  }
];

export function getSkinStatuses(state: RunState): SkinStatus[] {
  return SKINS.map((skin) => ({
    ...skin,
    unlocked: isSkinUnlocked(skin.id, state)
  }));
}

export function isSkinUnlocked(skinId: string, state: RunState): boolean {
  if (skinId === "trailKid") {
    return true;
  }

  if (skinId === "sparkScout") {
    return state.keys >= 1 || state.stats.guardiansDefeated >= 1;
  }

  if (skinId === "ironGuide") {
    return state.keys >= 3 || state.stats.mapsCompleted >= 3;
  }

  if (skinId === "stormChampion") {
    return state.stats.finalBossDefeated;
  }

  return false;
}
