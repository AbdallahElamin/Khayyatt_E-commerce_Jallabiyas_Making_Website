import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Sparkles } from "lucide-react";
import {
  MEASUREMENT_KEYS, MEASUREMENT_LABELS, useWizard, type MeasurementKey,
} from "../WizardContext";
import { AiMeasurementPanel } from "./AiMeasurementPanel";

const GROUPS: { title: string; keys: MeasurementKey[] }[] = [
  { title: "Upper Body", keys: ["neck", "chest", "shoulderBreadth", "shoulderToCrotch"] },
  { title: "Mid & Lower", keys: ["waist", "hips", "legHeight", "thigh"] },
  { title: "Limbs", keys: ["bicep", "armLength"] },
];

export function MeasurementsForm() {
  const { measurements, setMeasurement } = useWizard();
  const [aiEnabled, setAiEnabled] = useState(false);

  return (
    <div className="space-y-6">
      <Card className="flex items-center justify-between gap-4 p-5">
        <div className="flex items-start gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-full bg-primary text-primary-foreground">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <Label htmlFor="ai-toggle" className="text-base font-medium text-foreground">
              Use AI Measurement Tool
            </Label>
            <p className="text-xs text-muted-foreground">
              Upload two photos &amp; your height — we'll estimate all 10 measurements.
            </p>
          </div>
        </div>
        <Switch id="ai-toggle" checked={aiEnabled} onCheckedChange={setAiEnabled} />
      </Card>

      {aiEnabled && <AiMeasurementPanel />}

      <Card className="p-6">
        <div className="space-y-8">
          {GROUPS.map((group) => (
            <div key={group.title}>
              <p className="mb-3 text-xs uppercase tracking-[0.2em] text-accent-foreground">
                {group.title}
              </p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {group.keys.map((k) => (
                  <div key={k} className="space-y-1.5">
                    <Label htmlFor={`m-${k}`} className="text-sm text-foreground">
                      {MEASUREMENT_LABELS[k]}
                    </Label>
                    <div className="relative">
                      <Input
                        id={`m-${k}`}
                        type="number"
                        inputMode="decimal"
                        min={0}
                        step="0.1"
                        value={measurements[k]}
                        onChange={(e) => {
                          const v = e.target.value;
                          setMeasurement(k, v === "" ? "" : Number(v));
                        }}
                        className="pr-12"
                      />
                      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                        cm
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <p className="mt-6 text-xs text-muted-foreground">
          All {MEASUREMENT_KEYS.length} fields must be filled before continuing.
        </p>
      </Card>
    </div>
  );
}
