import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Star, MapPin } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { TAILOR_PROFILES, getTailorById } from "@/lib/mock-data";
import { useWizard } from "../WizardContext";

export function TailorDropdown() {
  const { user } = useApp();
  const { tailorId, setTailorId } = useWizard();
  const userCity = user.location?.address?.split(",")[0]?.trim();

  const inCity = TAILOR_PROFILES.filter((t) => t.city === userCity);
  const list = inCity.length > 0 ? inCity : TAILOR_PROFILES;
  const selected = tailorId ? getTailorById(tailorId) : undefined;

  return (
    <Card className="flex h-full flex-col gap-5 p-6">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-accent-foreground">Step 1</p>
        <h2 className="font-display text-2xl text-primary">Choose a Tailor</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {inCity.length > 0
            ? <>Showing ateliers in <span className="text-primary">{userCity}</span></>
            : <>No tailors in your city — browsing all ateliers</>}
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
                  <div className="text-xs text-muted-foreground">{t.city} · ★ {t.rating}</div>
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
              <MapPin className="h-3.5 w-3.5" /> {selected.city}
            </span>
            <span className="inline-flex items-center gap-1 text-accent-foreground">
              <Star className="h-3.5 w-3.5 fill-current" /> {selected.rating} · {selected.reviewCount} reviews
            </span>
          </div>
          <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{selected.bio}</p>
        </div>
      )}
    </Card>
  );
}
