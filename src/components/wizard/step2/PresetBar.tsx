import { Button } from "@/components/ui/button";
import { STYLE_PRESETS } from "@/lib/wizard-data";
import { useWizard } from "../WizardContext";
import { cn } from "@/lib/utils";

export function PresetBar() {
  const { preset, applyPreset } = useWizard();
  return (
    <div className="rounded-xl border border-border bg-card/60 p-4">
      <p className="mb-3 text-xs uppercase tracking-[0.2em] text-accent-foreground">
        Style preset
      </p>
      <div className="flex flex-wrap gap-2">
        {STYLE_PRESETS.map((p) => {
          const active = preset === p.id;
          return (
            <Button
              key={p.id}
              variant={active ? "default" : "outline"}
              size="sm"
              onClick={() => applyPreset(p.id, p.config)}
              className={cn("rounded-full", active && "shadow-[var(--shadow-luxe)]")}
            >
              {p.label}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
