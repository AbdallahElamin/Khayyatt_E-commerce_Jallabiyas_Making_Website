/**
 * Leaflet JS singleton loader.
 *
 * Loads /leaflet/leaflet.js exactly once per page session and resolves with the
 * global `window.L` Leaflet instance. Safe to call from multiple components
 * simultaneously — all callers receive the same promise.
 *
 * The CSS is handled separately via the <link> tag in __root.tsx.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type LeafletGlobal = any;

let leafletPromise: Promise<LeafletGlobal> | null = null;

export function loadLeaflet(): Promise<LeafletGlobal> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Leaflet cannot be loaded in an SSR context."));
  }

  // Already loaded?
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if ((window as any).L) return Promise.resolve((window as any).L);

  // Already loading?
  if (leafletPromise) return leafletPromise;

  leafletPromise = new Promise<LeafletGlobal>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "/leaflet/leaflet.js";
    script.async = true;
    script.onload = () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const L = (window as any).L;
      if (!L) {
        reject(new Error("Leaflet loaded but window.L is undefined."));
        return;
      }

      // Point the default icon image paths to our local public/leaflet/images/ assets.
      // Without this, Leaflet tries to resolve marker icons relative to the JS file
      // and they end up 404-ing in a bundled/SSR setup.
      L.Icon.Default.mergeOptions({
        iconUrl: "/leaflet/images/marker-icon.png",
        iconRetinaUrl: "/leaflet/images/marker-icon-2x.png",
        shadowUrl: "/leaflet/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      });

      resolve(L);
    };
    script.onerror = () => reject(new Error("Failed to load /leaflet/leaflet.js"));
    document.head.appendChild(script);
  });

  return leafletPromise;
}
