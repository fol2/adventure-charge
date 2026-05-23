import { useEffect, useState } from "react";
import { ASSET_MANIFEST_URL, DEFAULT_ASSET_MANIFEST, mergeAssetManifest, type AssetManifest } from "./assets";

export function useAssetManifest() {
  const [manifest, setManifest] = useState(DEFAULT_ASSET_MANIFEST);

  useEffect(() => {
    let cancelled = false;

    fetch(ASSET_MANIFEST_URL, { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((json: AssetManifest | null) => {
        if (!cancelled && json) {
          setManifest(mergeAssetManifest(json));
        }
      })
      .catch(() => {
        if (!cancelled) {
          setManifest(DEFAULT_ASSET_MANIFEST);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return manifest;
}
