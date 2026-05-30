import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, MapPin, LocateFixed } from "lucide-react";
import { loadLeaflet } from "@/lib/leaflet-loader";

export interface LocationValue {
  lat: number;
  lng: number;
  address: string;
}

interface Props {
  value: LocationValue | null;
  onChange: (v: LocationValue) => void;
}

// Default map centre — Morocco (MENA midpoint, close to most tailor cities)
const DEFAULT_CENTER: [number, number] = [31.7917, -7.0926];
const DEFAULT_ZOOM = 5;
const SELECTED_ZOOM = 14;

/**
 * Reverse-geocodes lat/lng via the free OpenStreetMap Nominatim API.
 * Falls back to a formatted coordinate string on failure.
 */
async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=14&addressdetails=0`,
      { headers: { "Accept-Language": "en" } },
    );
    if (!res.ok) throw new Error(`Nominatim ${res.status}`);
    const data = (await res.json()) as { display_name?: string };
    return data.display_name ?? `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  } catch {
    return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  }
}

export function LocationPicker({ value, onChange }: Props) {
  const mapEl = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markerRef = useRef<any>(null);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // ── Mount the Leaflet map once ──────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    loadLeaflet()
      .then((L) => {
        if (cancelled || !mapEl.current) return;

        const center: [number, number] = value
          ? [value.lat, value.lng]
          : DEFAULT_CENTER;
        const zoom = value ? SELECTED_ZOOM : DEFAULT_ZOOM;

        const map = L.map(mapEl.current, {
          center,
          zoom,
          zoomControl: true,
          attributionControl: true,
        });

        // Use OpenStreetMap tiles — free, no key required
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
        }).addTo(map);

        // Drop a marker if a value is already set
        let marker = value
          ? L.marker([value.lat, value.lng], { draggable: true }).addTo(map)
          : null;

        // Click anywhere → place / move marker
        map.on("click", async (e: { latlng: { lat: number; lng: number } }) => {
          const { lat, lng } = e.latlng;
          if (marker) {
            marker.setLatLng([lat, lng]);
          } else {
            marker = L.marker([lat, lng], { draggable: true }).addTo(map);
            // Wire up drag after creation
            marker.on("dragend", onDragEnd);
          }
          markerRef.current = marker;
          await resolveLatLng(lat, lng);
        });

        // Initial marker drag handler
        const onDragEnd = async () => {
          if (!markerRef.current) return;
          const pos = markerRef.current.getLatLng();
          await resolveLatLng(pos.lat, pos.lng);
        };
        if (marker) marker.on("dragend", onDragEnd);

        mapRef.current = map;
        markerRef.current = marker;
        setReady(true);
        // Force Leaflet to recalculate tile layout after React has committed the DOM
        setTimeout(() => map.invalidateSize(), 100);
      })
      .catch((e: Error) => setErr(e.message));

    return () => {
      cancelled = true;
      // Clean up Leaflet instance on unmount to avoid double-init in dev StrictMode
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Sync external value into marker ────────────────────────────────────────
  useEffect(() => {
    if (!ready || !value || !mapRef.current) return;
    const L = (window as { L?: unknown }).L as { marker: (...args: unknown[]) => unknown } | undefined;
    if (!L) return;

    if (markerRef.current) {
      markerRef.current.setLatLng([value.lat, value.lng]);
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      markerRef.current = (L as any).marker([value.lat, value.lng], { draggable: true }).addTo(mapRef.current);
    }
    mapRef.current.panTo([value.lat, value.lng]);
  }, [ready, value?.lat, value?.lng]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Resolve coordinates → address string ───────────────────────────────────
  const resolveLatLng = async (lat: number, lng: number) => {
    setBusy(true);
    setErr(null);
    try {
      const address = await reverseGeocode(lat, lng);
      onChange({ lat, lng, address });
    } catch (e) {
      onChange({ lat, lng, address: `${lat.toFixed(5)}, ${lng.toFixed(5)}` });
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  // ── GPS "Use my location" ───────────────────────────────────────────────────
  const useGps = () => {
    if (!("geolocation" in navigator)) {
      setErr("Geolocation is not available in this browser.");
      return;
    }
    setBusy(true);
    setErr(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        if (mapRef.current) {
          mapRef.current.setView([lat, lng], SELECTED_ZOOM);
        }
        void resolveLatLng(lat, lng);
      },
      (geoErr) => {
        setBusy(false);
        setErr(geoErr.message || "Unable to read your location.");
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={useGps}
          disabled={busy}
          className="gap-1.5"
        >
          {busy ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <LocateFixed className="h-3.5 w-3.5" />
          )}
          Use my location
        </Button>
        <span className="text-xs text-muted-foreground">or click anywhere on the map</span>
      </div>

      {/* Leaflet map container */}
      <div
        ref={mapEl}
        id="location-picker-map"
        className="w-full rounded-md border bg-muted/40"
        style={{ height: "224px" }}
        aria-label="Location map — click to drop a pin"
      />

      <div className="flex items-start gap-2">
        <MapPin className="mt-2 h-4 w-4 shrink-0 text-primary" />
        <Input
          readOnly
          placeholder="Pick a point on the map or use your location"
          value={value?.address ?? ""}
        />
      </div>

      {err && <p className="text-xs text-destructive">{err}</p>}
    </div>
  );
}

