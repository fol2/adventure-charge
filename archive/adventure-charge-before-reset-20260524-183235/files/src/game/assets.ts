export type VectorTuple = [number, number, number];

export interface ModelAsset {
  glb: string;
  scale?: number;
  position?: VectorTuple;
  rotation?: VectorTuple;
}

export interface SceneAsset {
  spz: string;
  scale?: number;
  position?: VectorTuple;
  rotation?: VectorTuple;
}

export interface AssetManifest {
  scene?: SceneAsset;
  skins?: Record<string, ModelAsset>;
  enemies?: Record<string, ModelAsset>;
}

export const ASSET_MANIFEST_URL = "/assets/adventure-assets.json";

export const DEFAULT_ASSET_MANIFEST: Required<AssetManifest> = {
  scene: {
    spz: "/assets/scenes/adventure-scene.spz",
    scale: 1,
    position: [0, -0.12, -1],
    rotation: [0, 0, 0]
  },
  skins: {
    trailKid: {
      glb: "/assets/people/trail-kid.glb",
      scale: 0.55,
      position: [0, 0, 0],
      rotation: [0, 0, 0]
    },
    sparkScout: {
      glb: "/assets/people/spark-scout.glb",
      scale: 0.55,
      position: [0, 0, 0],
      rotation: [0, 0, 0]
    },
    ironGuide: {
      glb: "/assets/people/iron-guide.glb",
      scale: 0.55,
      position: [0, 0, 0],
      rotation: [0, 0, 0]
    },
    stormChampion: {
      glb: "/assets/people/storm-champion.glb",
      scale: 0.55,
      position: [0, 0, 0],
      rotation: [0, 0, 0]
    }
  },
  enemies: {
    brambleBoar: {
      glb: "/assets/enemies/bramble-boar.glb",
      scale: 0.55,
      position: [0, 0, 0],
      rotation: [0, 0, 0]
    },
    riverLynx: {
      glb: "/assets/enemies/river-lynx.glb",
      scale: 0.55,
      position: [0, 0, 0],
      rotation: [0, 0, 0]
    },
    ridgeWolf: {
      glb: "/assets/enemies/ridge-wolf.glb",
      scale: 0.55,
      position: [0, 0, 0],
      rotation: [0, 0, 0]
    },
    thornBear: {
      glb: "/assets/enemies/thorn-bear.glb",
      scale: 0.65,
      position: [0, 0, 0],
      rotation: [0, 0, 0]
    },
    frostMaw: {
      glb: "/assets/enemies/frost-maw.glb",
      scale: 0.7,
      position: [0, 0, 0],
      rotation: [0, 0, 0]
    },
    thunderTusks: {
      glb: "/assets/enemies/thunder-tusks.glb",
      scale: 0.75,
      position: [0, 0, 0],
      rotation: [0, 0, 0]
    },
    ancientStormBeast: {
      glb: "/assets/enemies/ancient-storm-beast.glb",
      scale: 0.9,
      position: [0, 0, 0],
      rotation: [0, 0, 0]
    }
  }
};

export function mergeAssetManifest(manifest: AssetManifest): Required<AssetManifest> {
  return {
    scene: {
      ...DEFAULT_ASSET_MANIFEST.scene,
      ...manifest.scene
    },
    skins: {
      ...DEFAULT_ASSET_MANIFEST.skins,
      ...manifest.skins
    },
    enemies: {
      ...DEFAULT_ASSET_MANIFEST.enemies,
      ...manifest.enemies
    }
  };
}
