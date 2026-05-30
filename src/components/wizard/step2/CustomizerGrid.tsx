import { SwatchSelect } from "./SwatchSelect";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  FABRICS, FABRIC_COLORS, SLEEVES, EMBROIDERY_PLACEMENTS, EMBROIDERY_PATTERNS,
  FASTENERS, BUTTON_COLORS, COLLARS, BACK_STITCH_PATTERNS, getInventory,
} from "@/lib/wizard-data";
import { useWizard } from "../WizardContext";
import { cn } from "@/lib/utils";

export function CustomizerGrid() {
  const { design, setDesign, tailorId } = useWizard();
  const inv = getInventory(tailorId);

  const update = <K extends keyof typeof design>(key: K, value: (typeof design)[K]) =>
    setDesign((d) => ({ ...d, [key]: value }));

  const togglePlacement = (id: string) => {
    if (!inv.embroideryPlacement.includes(id)) return;
    setDesign((d) => ({
      ...d,
      embroideryPlacements: d.embroideryPlacements.includes(id)
        ? d.embroideryPlacements.filter((p) => p !== id)
        : [...d.embroideryPlacements, id],
    }));
  };

  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
      <SwatchSelect label="Fabric Type" value={design.fabric}
        onChange={(v) => update("fabric", v)} options={FABRICS} inStock={inv.fabric} />
      <SwatchSelect label="Fabric Color" value={design.fabricColor}
        onChange={(v) => update("fabricColor", v)} options={FABRIC_COLORS} inStock={inv.fabricColor} />
      <SwatchSelect label="Sleeve Type" value={design.sleeve}
        onChange={(v) => update("sleeve", v)} options={SLEEVES} inStock={inv.sleeve} />
      <SwatchSelect label="Collar Style" value={design.collar}
        onChange={(v) => update("collar", v)} options={COLLARS} inStock={inv.collar} />

      {/* Embroidery placement multi-toggle */}
      <div className="md:col-span-2">
        <Label className="mb-2 block text-xs uppercase tracking-wider text-muted-foreground">
          Embroidery Placement
        </Label>
        <div className="flex flex-wrap gap-2">
          {EMBROIDERY_PLACEMENTS.map((p) => {
            const available = inv.embroideryPlacement.includes(p.id);
            const active = design.embroideryPlacements.includes(p.id);
            return (
              <button
                key={p.id}
                type="button"
                disabled={!available}
                onClick={() => togglePlacement(p.id)}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition",
                  active
                    ? "border-primary bg-primary text-primary-foreground shadow-[var(--shadow-luxe)]"
                    : "border-border bg-background hover:border-primary/40",
                  !available && "cursor-not-allowed opacity-40 grayscale",
                )}
              >
                <span
                  className="h-4 w-4 rounded border border-border/60"
                  style={{ background: p.swatch }}
                />
                {p.label}
                {!available && <span className="text-[10px] uppercase">— out</span>}
              </button>
            );
          })}
        </div>
      </div>

      <SwatchSelect label="Embroidery Pattern" value={design.embroideryPattern}
        onChange={(v) => update("embroideryPattern", v)} options={EMBROIDERY_PATTERNS} inStock={inv.embroideryPattern} />
      <SwatchSelect label="Back Stitching" value={design.backStitch}
        onChange={(v) => update("backStitch", v)} options={BACK_STITCH_PATTERNS} inStock={inv.backStitch} />

      <SwatchSelect label="Fastener Type" value={design.fastener}
        onChange={(v) => update("fastener", v)} options={FASTENERS} inStock={inv.fastener} />
      <SwatchSelect label="Button Color" value={design.buttonColor}
        onChange={(v) => update("buttonColor", v)} options={BUTTON_COLORS} inStock={inv.buttonColor} />

      {/* Button visibility toggle */}
      <div className="md:col-span-2 flex items-center justify-between rounded-lg border border-border bg-background/60 p-4">
        <div>
          <p className="font-display text-base text-primary">Visible buttons</p>
          <p className="text-xs text-muted-foreground">
            Show fasteners on the outer placket, or keep them concealed.
          </p>
        </div>
        <Switch
          checked={design.buttonsVisible}
          onCheckedChange={(v) => update("buttonsVisible", v)}
        />
      </div>
    </div>
  );
}
