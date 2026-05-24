import { useEffect, useState } from "react";

export function useExistingAssetUrl(url: string | undefined) {
  const [existingUrl, setExistingUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    if (!url) {
      setExistingUrl(null);
      return () => {
        cancelled = true;
      };
    }

    fetch(url, { method: "HEAD", cache: "no-store" })
      .then((response) => {
        const contentType = response.headers.get("content-type") ?? "";

        if (!cancelled) {
          setExistingUrl(response.ok && !contentType.includes("text/html") ? url : null);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setExistingUrl(null);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [url]);

  return existingUrl;
}
