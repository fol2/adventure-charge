import { Clone, useGLTF } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { useEffect, type ReactNode } from "react";
import type { ModelAsset, SceneAsset, VectorTuple } from "../game/assets";
import { useExistingAssetUrl } from "./useExistingAssetUrl";

interface OptionalGlbModelProps {
  asset: ModelAsset | undefined;
  position: VectorTuple;
  rotation?: VectorTuple;
  fallback: ReactNode;
}

interface SplatSceneProps {
  asset: SceneAsset | undefined;
}

export function SplatScene({ asset }: SplatSceneProps) {
  const existingUrl = useExistingAssetUrl(asset?.spz);

  if (!existingUrl || !asset) {
    return null;
  }

  return <LoadedSplatScene asset={{ ...asset, spz: existingUrl }} />;
}

export function OptionalGlbModel({ asset, position, rotation, fallback }: OptionalGlbModelProps) {
  const existingUrl = useExistingAssetUrl(asset?.glb);

  if (!asset || !existingUrl) {
    return <>{fallback}</>;
  }

  return <LoadedGlbModel asset={{ ...asset, glb: existingUrl }} position={position} rotation={rotation} />;
}

function LoadedGlbModel({ asset, position, rotation }: { asset: ModelAsset; position: VectorTuple; rotation?: VectorTuple }) {
  const gltf = useGLTF(asset.glb);
  const assetPosition = addVectors(position, asset.position ?? [0, 0, 0]);
  const assetRotation = addVectors(rotation ?? [0, 0, 0], asset.rotation ?? [0, 0, 0]);

  return (
    <group position={assetPosition} rotation={assetRotation} scale={asset.scale ?? 1}>
      <Clone object={gltf.scene} />
    </group>
  );
}

function LoadedSplatScene({ asset }: { asset: SceneAsset }) {
  const renderer = useThree((state) => state.gl);
  const scene = useThree((state) => state.scene);

  useEffect(() => {
    let cancelled = false;
    let removeSplat: (() => void) | null = null;

    import("@sparkjsdev/spark").then(({ SparkRenderer, SplatMesh }) => {
      if (cancelled) {
        return;
      }

      const sparkRenderer = new SparkRenderer({ renderer });
      const splat = new SplatMesh({ url: asset.spz });
      const position = asset.position ?? [0, 0, 0];
      const rotation = asset.rotation ?? [0, 0, 0];

      splat.position.set(...position);
      splat.rotation.set(...rotation);
      splat.scale.setScalar(asset.scale ?? 1);
      scene.add(sparkRenderer);
      scene.add(splat);

      removeSplat = () => {
        scene.remove(splat);
        scene.remove(sparkRenderer);
        const disposableSplat = splat as unknown as { dispose?: () => void };
        const disposableSpark = sparkRenderer as unknown as { dispose?: () => void };
        disposableSplat.dispose?.();
        disposableSpark.dispose?.();
      };
    });

    return () => {
      cancelled = true;
      removeSplat?.();
    };
  }, [asset, renderer, scene]);

  return null;
}

function addVectors(a: VectorTuple, b: VectorTuple): VectorTuple {
  return [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
}
