import { useEffect, useRef, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { TAILOR_PROFILES, type TailorProfile } from "@/lib/mock-data";
import { useApp } from "@/context/AppContext";
import { useWizard } from "../WizardContext";
import { loadLeaflet } from "@/lib/leaflet-loader";
import { supabase } from "@/lib/supabase";

// ── Haversine distance (km) between two WGS84 points ────────────────────────
function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Default user position — Marrakech, used when no location is saved
const DEFAULT_USER: [number, number] = [31.6295, -7.9811];

export function MockMap() {
  const { user } = useApp();
  const { tailorId, setTailorId, radiusKm, setRadiusKm } = useWizard();

  const mapEl = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markerRefs = useRef<Map<string, any>>(new Map());
  const [leafletReady, setLeafletReady] = useState(false);
  const [tailorProfiles, setTailorProfiles] = useState<TailorProfile[]>(TAILOR_PROFILES);

  useEffect(() => {
    async function loadTailors() {
      const { data } = await supabase.from("profiles").select("*").eq("role", "tailor");
      if (data && data.length > 0) {
        const mapped: TailorProfile[] = data.map((d: any) => {
          const fullName = d.full_name || "Unknown Tailor";
          const parts = fullName.trim().split(/\s+/);
          const initials = parts.length >= 2 
            ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase() 
            : fullName.slice(0, 2).toUpperCase() || "?";
          
          return {
            id: d.id,
            atelier: d.atelier_name || "Unknown Atelier",
            tailorName: fullName,
            firstName: parts[0] || "",
            lastName: parts.slice(1).join(" ") || "",
            initials,
            city: d.location_address ? d.location_address.split(",")[0].trim() : "",
            country: "",
            specialty: "Custom Tailoring", // Default fallback
            rating: 5.0,
            reviewCount: 0,
            years: 0,
            experienceStartDate: d.experience_start_date || new Date().toISOString().split("T")[0],
            username: d.username || "",
            password: "",
            bio: "",
            avatarGradient: "linear-gradient(135deg, oklch(0.30 0.08 160), oklch(0.55 0.13 160))", // Fallback G.emerald
            coverGradient: "linear-gradient(135deg, oklch(0.78 0.15 70), oklch(0.45 0.13 30))",
            lat: d.location_lat || 0,
            lng: d.location_lng || 0,
          };
        });
        setTailorProfiles(mapped);
      }
    }
    loadTailors();
  }, []);

  const userPos: [number, number] =
    user.location_lat != null && user.location_lng != null
      ? [user.location_lat, user.location_lng]
      : DEFAULT_USER;

  // Compute real distances from user to each tailor
  const tailorsWithDistance = useMemo(
    () =>
      tailorProfiles.map((t) => ({
        ...t,
        distanceKm: haversine(userPos[0], userPos[1], t.lat, t.lng),
      })),
    [userPos[0], userPos[1], tailorProfiles], // eslint-disable-line react-hooks/exhaustive-deps
  );

  // Auto-expand visual radius until ≥3 tailors fit (same behaviour as before)
  const [autoRadius, setAutoRadius] = useState(radiusKm);
  useEffect(() => {
    let r = radiusKm;
    while (tailorsWithDistance.filter((t) => t.distanceKm <= r).length < 3 && r < 20000) r += 50;
    setAutoRadius(r);
  }, [radiusKm, tailorsWithDistance]);

  const visibleTailors = tailorsWithDistance.filter((t) => t.distanceKm <= autoRadius);

  // ── Mount the Leaflet map once ──────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    loadLeaflet().then((L) => {
      if (cancelled || !mapEl.current || mapRef.current) return;

      const map = L.map(mapEl.current, {
        center: userPos,
        zoom: 4,
        zoomControl: true,
        attributionControl: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18,
      }).addTo(map);

      // User pin â€” emerald dot with a pulsing ring via CSS keyframe
      const userIconHtml = `
        <div style="
          width:16px; height:16px;
          background: oklch(0.30 0.08 160);
          border-radius:50%;
          border:2px solid white;
          box-shadow:0 0 0 6px oklch(0.30 0.08 160 / 0.25);
        "></div>`;
      const userIcon = L.divIcon({
        html: userIconHtml,
        className: "",
        iconSize: [16, 16],
        iconAnchor: [8, 8],
      });
      L.marker(userPos, { icon: userIcon, interactive: false }).addTo(map);

      mapRef.current = map;
      setLeafletReady(true);
      // Force Leaflet to recalculate tile layout after React has committed the DOM
      setTimeout(() => map.invalidateSize(), 100);
    });

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRefs.current.clear();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // â”€â”€ Sync tailor markers whenever visible set or selection changes â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  useEffect(() => {
    if (!leafletReady || !mapRef.current) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const L = (window as any).L;
    if (!L) return;

    const map = mapRef.current;
    const existing = markerRefs.current;

    // Build set of IDs that should be visible
    const visibleIds = new Set(visibleTailors.map((t) => t.id));

    // Remove markers no longer visible
    existing.forEach((marker, id) => {
      if (!visibleIds.has(id)) {
        marker.remove();
        existing.delete(id);
      }
    });

    // Add / update markers for visible tailors
    visibleTailors.forEach((t) => {
      const selected = t.id === tailorId;
      const size = selected ? 44 : 36;
      const border = selected ? "3px solid oklch(0.30 0.08 160)" : "2px solid white";
      const shadow = selected
        ? "0 0 0 4px oklch(0.30 0.08 160 / 0.3), 0 2px 8px rgba(0,0,0,0.3)"
        : "0 2px 6px rgba(0,0,0,0.25)";
      const zIndex = selected ? 1000 : 500;

      const iconHtml = `
        <div style="
          width:${size}px; height:${size}px;
          background: ${t.avatarGradient};
          border-radius:50%;
          border:${border};
          box-shadow:${shadow};
          display:flex; align-items:center; justify-content:center;
          font-family: 'Cormorant Garamond', serif;
          font-size:${selected ? "13px" : "11px"};
          font-weight:600;
          color:white;
          cursor:pointer;
          transition: transform 0.15s;
          transform: scale(${selected ? "1.1" : "1"});
        ">${t.initials}</div>`;

      const icon = L.divIcon({
        html: iconHtml,
        className: "",
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
        popupAnchor: [0, -(size / 2 + 4)],
      });

      if (existing.has(t.id)) {
        // Just update the icon for selection state change
        existing.get(t.id)!.setIcon(icon);
        existing.get(t.id)!.setZIndexOffset(zIndex);
      } else {
        const marker = L.marker([t.lat, t.lng], { icon, zIndexOffset: zIndex });

        const popupContent = `
          <div style="font-family:'Cormorant Garamond',serif; min-width:160px; padding:4px 0;">
            <div style="font-size:15px; font-weight:600; color:oklch(0.30 0.08 160)">${t.tailorName}</div>
            <div style="font-size:12px; color:#666; margin-top:2px">${t.atelier}</div>
            <div style="font-size:11px; color:#888; margin-top:4px">${t.city}, ${t.country}</div>
            <div style="font-size:11px; color:#888">${t.distanceKm > 999 ? (t.distanceKm / 1000).toFixed(1) + " Mm" : t.distanceKm.toFixed(0) + " km"} away</div>
          </div>`;

        marker.bindPopup(popupContent, { closeButton: false, offset: [0, -(size / 2)] });
        marker.on("click", () => {
          setTailorId(t.id);
          marker.openPopup();
        });

        marker.addTo(map);
        existing.set(t.id, marker);
      }
    });

    // Fit the map to show all visible pins + user
    if (visibleTailors.length > 0) {
      const latlngs: [number, number][] = [
        userPos,
        ...visibleTailors.map((t): [number, number] => [t.lat, t.lng]),
      ];
      map.fitBounds(L.latLngBounds(latlngs), { padding: [40, 40], maxZoom: 10 });
    }
  }, [leafletReady, visibleTailors, tailorId, setTailorId]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Card className="relative flex h-full flex-col overflow-hidden p-6">
      <div className="flex items-baseline justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-accent-foreground">Nearby</p>
          <h3 className="font-display text-xl text-primary">Map View</h3>
        </div>
        <span className="text-xs text-muted-foreground">
          {visibleTailors.length} tailor{visibleTailors.length === 1 ? "" : "s"} within{" "}
          {autoRadius >= 1000
            ? `${(autoRadius / 1000).toFixed(0)} Mm`
            : `${autoRadius.toFixed(0)} km`}
        </span>
      </div>

      {/* Leaflet map container */}
      <div
        ref={mapEl}
        id="wizard-map"
        className="relative mt-5 w-full overflow-hidden rounded-xl border border-border"
        style={{ height: "320px" }}
        aria-label="Tailor proximity map"
      />

      {/* Radius slider */}
      <div className="mt-5">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Search radius</span>
          <span className="font-medium text-primary">{radiusKm} km</span>
        </div>
        <Slider
          value={[radiusKm]}
          min={1}
          max={50}
          step={1}
          onValueChange={(v) => setRadiusKm(v[0])}
          className="mt-2"
        />
        {autoRadius > radiusKm && (
          <p className="mt-2 text-[11px] italic text-muted-foreground">
            Expanded to {autoRadius.toFixed(0)} km to reach at least 3 tailors.
          </p>
        )}
      </div>
    </Card>
  );
}