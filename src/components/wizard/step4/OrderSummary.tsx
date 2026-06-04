import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { TAILOR_PROFILES, type TailorProfile } from "@/lib/mock-data";
import {
  FABRICS, FABRIC_COLORS, SLEEVES, EMBROIDERY_PATTERNS, EMBROIDERY_PLACEMENTS,
  FASTENERS, BUTTON_COLORS, COLLARS, BACK_STITCH_PATTERNS, type SwatchOption,
} from "@/lib/wizard-data";
import { StarRating } from "@/components/portfolio/StarRating";
import { MEASUREMENT_KEYS, MEASUREMENT_LABELS, useWizard } from "../WizardContext";
import { supabase } from "@/lib/supabase";

function look(list: SwatchOption[], id?: string) {
  return list.find((x) => x.id === id);
}

export function OrderSummary() {
  const { tailorId, design, measurements, resetWizard, addToCart } = useWizard();

  // Try mock profiles first; if not found, load from Supabase
  const mockTailor = TAILOR_PROFILES.find((t) => t.id === tailorId);
  const [tailor, setTailor] = useState<TailorProfile | undefined>(mockTailor);

  useEffect(() => {
    if (mockTailor || !tailorId) return; // already found in mock data
    // Load real profile from Supabase
    supabase
      .from("profiles")
      .select("*")
      .eq("id", tailorId)
      .single()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .then(({ data }) => {
        if (!data) return;
        const G = {
          emerald: "linear-gradient(135deg, oklch(0.30 0.08 160), oklch(0.55 0.13 160))",
          saffron: "linear-gradient(135deg, oklch(0.78 0.15 70), oklch(0.45 0.13 30))",
        };
        const fullName = (data as any).full_name || "Unknown Tailor";
        const parts = fullName.trim().split(/\s+/);
        const initials =
          parts.length >= 2
            ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
            : fullName.slice(0, 2).toUpperCase() || "?";
        const profile: TailorProfile = {
          id: (data as any).id,
          atelier: (data as any).atelier_name || "Unknown Atelier",
          tailorName: fullName,
          firstName: parts[0] || "",
          lastName: parts.slice(1).join(" ") || "",
          initials,
          city: (data as any).location_address
            ? (data as any).location_address.split(",")[0].trim()
            : "",
          country: "",
          specialty: "Custom Tailoring",
          rating:
            typeof (data as any).rating === "number" ? (data as any).rating : 5.0,
          reviewCount:
            typeof (data as any).review_count === "number"
              ? (data as any).review_count
              : 0,
          years: 0,
          experienceStartDate:
            (data as any).experience_start_date ||
            new Date().toISOString().split("T")[0],
          username: (data as any).username || "",
          password: "",
          bio: "",
          avatarGradient: G.emerald,
          coverGradient: G.saffron,
          lat: (data as any).location_lat || 0,
          lng: (data as any).location_lng || 0,
        };
        setTailor(profile);
      });
  }, [tailorId, mockTailor]);

  // Keep state in sync if user goes back and picks a different tailor
  useEffect(() => {
    setTailor(mockTailor);
  }, [tailorId]); // eslint-disable-line react-hooks/exhaustive-deps

  /** Save the current design to the cart, then wipe the wizard so
   *  the user can configure a second garment from a clean state. */
  const handleAddAnother = () => {
    if (!tailorId) return;
    addToCart();
    toast.success("Jallabiyah added to order — now configure your next one.");
    resetWizard(); // clears design + measurements, returns to step 2
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <Card className="overflow-hidden">
        <div className="h-20" style={{ background: tailor?.coverGradient ?? "linear-gradient(135deg, oklch(0.78 0.15 70), oklch(0.45 0.13 30))" }} />
        <div className="-mt-10 flex items-end gap-4 px-6">
          <div
            className="grid h-20 w-20 place-items-center rounded-full border-4 border-card font-display text-2xl text-primary-foreground"
            style={{ background: tailor?.avatarGradient ?? "linear-gradient(135deg, oklch(0.30 0.08 160), oklch(0.55 0.13 160))" }}
          >
            {tailor?.initials ?? "?"}
          </div>
          <div className="pb-3">
            <p className="font-display text-xl text-primary">
              {tailor?.atelier ?? (tailorId ? "Loading…" : "No tailor selected")}
            </p>
            <p className="text-sm text-muted-foreground">{tailor?.tailorName}</p>
          </div>
        </div>
        <div className="space-y-2 px-6 pb-6 pt-4">
          {tailor?.city && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" />
              {tailor.city}{tailor.country ? `, ${tailor.country}` : ""}
            </div>
          )}
          {tailor && <StarRating value={tailor.rating} />}
          {tailor?.specialty && (
            <p className="pt-2 text-sm text-muted-foreground">{tailor.specialty}</p>
          )}
        </div>
      </Card>

      <Card className="p-6">
        <p className="text-xs uppercase tracking-[0.2em] text-accent-foreground">
          Body Measurements
        </p>
        <h3 className="mt-1 font-display text-xl text-primary">All 10 fields</h3>
        <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
          {MEASUREMENT_KEYS.map((k) => (
            <div key={k} className="flex justify-between border-b border-border/40 py-1">
              <dt className="text-muted-foreground">{MEASUREMENT_LABELS[k]}</dt>
              <dd className="font-medium text-foreground">
                {measurements[k] || "—"} {measurements[k] ? "cm" : ""}
              </dd>
            </div>
          ))}
        </dl>
      </Card>

      <Card className="p-6 lg:col-span-2">
        <p className="text-xs uppercase tracking-[0.2em] text-accent-foreground">
          Design Choices
        </p>
        <h3 className="mt-1 font-display text-xl text-primary">Fabric &amp; cut</h3>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Row label="Fabric" opt={look(FABRICS, design.fabric)} />
          <Row label="Fabric Color" opt={look(FABRIC_COLORS, design.fabricColor)} />
          <Row label="Sleeve" opt={look(SLEEVES, design.sleeve)} />
          <Row label="Collar" opt={look(COLLARS, design.collar)} />
          <Row label="Fastener" opt={look(FASTENERS, design.fastener)} />
          <Row label="Button Color" opt={look(BUTTON_COLORS, design.buttonColor)} />
          <Row label="Embroidery Pattern" opt={look(EMBROIDERY_PATTERNS, design.embroideryPattern)} />
          <Row label="Back Stitching" opt={look(BACK_STITCH_PATTERNS, design.backStitch)} />
          <div className="flex items-center justify-between rounded-lg border border-border bg-card/60 px-4 py-3">
            <span className="text-xs uppercase tracking-wider text-muted-foreground">
              Buttons visible
            </span>
            <Badge variant={design.buttonsVisible ? "default" : "outline"}>
              {design.buttonsVisible ? "Yes" : "Hidden"}
            </Badge>
          </div>
        </div>

        <div className="mt-5">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            Embroidery placements
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {design.embroideryPlacements.length === 0 && (
              <span className="text-sm text-muted-foreground">None</span>
            )}
            {design.embroideryPlacements.map((id) => {
              const opt = look(EMBROIDERY_PLACEMENTS, id);
              return (
                <Badge key={id} variant="secondary" className="gap-2">
                  <span className="inline-block h-3 w-3 rounded-full" style={{ background: opt?.swatch }} />
                  {opt?.label ?? id}
                </Badge>
              );
            })}
          </div>
        </div>
      </Card>

      {/* ── Add another garment ── */}
      <div className="lg:col-span-2 flex items-center justify-between gap-4 rounded-xl border border-dashed border-border bg-muted/30 px-6 py-4">
        <div>
          <p className="text-sm font-medium text-foreground">Want to order another Jallabiyah?</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Adds this design to your current order and opens a fresh customiser for the next one.
          </p>
        </div>
        <Button
          id="add-another-order-btn"
          variant="outline"
          onClick={handleAddAnother}
          className="shrink-0 gap-2"
        >
          <Plus className="h-4 w-4" />
          Add a new Jallabiyah
        </Button>
      </div>
    </div>
  );
}

function Row({ label, opt }: { label: string; opt?: SwatchOption }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-card/60 px-4 py-3">
      <div
        className="h-8 w-8 shrink-0 rounded-md border border-border"
        style={{ background: opt?.swatch ?? "transparent" }}
      />
      <div className="min-w-0">
        <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className="truncate text-sm font-medium text-foreground">{opt?.label ?? "—"}</p>
      </div>
    </div>
  );
}
