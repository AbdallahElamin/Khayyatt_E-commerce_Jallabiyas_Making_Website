import { useEffect, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Star, MapPin } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { TAILOR_PROFILES, getTailorById, type TailorProfile } from "@/lib/mock-data";
import { useWizard } from "../WizardContext";
import { supabase } from "@/lib/supabase";

export function TailorDropdown() {
  const { user } = useApp();
  const { tailorId, setTailorId } = useWizard();
  const userCity = user.location_address?.split(",")[0]?.trim();

  // Merge real tailor accounts from Supabase with mock profiles
  const [realTailors, setRealTailors] = useState<TailorProfile[]>([]);

  useEffect(() => {
    async function loadRealTailors() {
      const { data } = await supabase.from("profiles").select("*").eq("role", "tailor");
      if (data && data.length > 0) {
        const G = {
          emerald: "linear-gradient(135deg, oklch(0.30 0.08 160), oklch(0.55 0.13 160))",
          saffron: "linear-gradient(135deg, oklch(0.78 0.15 70), oklch(0.45 0.13 30))",
        };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const mapped: TailorProfile[] = data.map((d: any) => {
          const fullName = d.full_name || "Unknown Tailor";
          const parts = fullName.trim().split(/\s+/);
          const initials =
            parts.length >= 2
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
            specialty: "Custom Tailoring",
            rating: typeof d.rating === "number" ? d.rating : 5.0,
            reviewCount: typeof d.review_count === "number" ? d.review_count : 0,
            years: 0,
            experienceStartDate: d.experience_start_date || new Date().toISOString().split("T")[0],
            username: d.username || "",
            password: "",
            bio: "",
            avatarGradient: G.emerald,
            coverGradient: G.saffron,
            lat: d.location_lat || 0,
            lng: d.location_lng || 0,
          };
        });
        // Only keep real tailors that are NOT already in TAILOR_PROFILES (avoid duplication)
        const mockIds = new Set(TAILOR_PROFILES.map((t) => t.id));
        setRealTailors(mapped.filter((t) => !mockIds.has(t.id)));
      }
    }
    loadRealTailors();
  }, []);

  // Combine mock + real tailor lists
  const allTailors = [...TAILOR_PROFILES, ...realTailors];

  const inCity = allTailors.filter((t) => t.city === userCity);
  const list = inCity.length > 0 ? inCity : allTailors;

  // For the selected card, check both mock profiles and real tailors
  const selected = tailorId
    ? (getTailorById(tailorId) ?? realTailors.find((t) => t.id === tailorId))
    : undefined;

  return (
    <Card className="flex h-full flex-col gap-5 p-6">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-accent-foreground">Step 1</p>
        <h2 className="font-display text-2xl text-primary">Choose a Tailor</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {inCity.length > 0
            ? <><span className="text-primary">{userCity}</span> ateliers</>
            : <>Browsing all ateliers</>}
        </p>
      </div>

      <Select value={tailorId} onValueChange={setTailorId}>
        <SelectTrigger className="h-12">
          <SelectValue placeholder="Select a tailor…" />
        </SelectTrigger>
        <SelectContent>
          {list.map((t) => (
            <SelectItem key={t.id} value={t.id}>
              <div className="flex items-center gap-3">
                <div
                  className="h-6 w-6 rounded-full"
                  style={{ background: t.avatarGradient }}
                />
                <div>
                  <div className="font-medium">{t.atelier}</div>
                  <div className="text-xs text-muted-foreground">{t.city || "—"} · ★ {t.rating}</div>
                </div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {selected && (
        <div className="rounded-lg border border-border bg-background/60 p-4">
          <div className="flex items-center gap-3">
            <div
              className="grid h-12 w-12 place-items-center rounded-full font-display text-sm text-primary-foreground shadow-sm"
              style={{ background: selected.avatarGradient }}
            >
              {selected.initials}
            </div>
            <div className="flex-1">
              <div className="font-display text-lg text-primary">{selected.atelier}</div>
              <div className="text-xs text-muted-foreground">{selected.tailorName}</div>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-sm">
            <span className="inline-flex items-center gap-1 text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" /> {selected.city || "—"}
            </span>
            <span className="inline-flex items-center gap-1 text-accent-foreground">
              <Star className="h-3.5 w-3.5 fill-current" /> {selected.rating} · {selected.reviewCount} reviews
            </span>
          </div>
          {selected.bio && (
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{selected.bio}</p>
          )}
        </div>
      )}
    </Card>
  );
}
