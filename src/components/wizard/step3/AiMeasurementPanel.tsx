import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Camera, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import {
  MEASUREMENT_KEYS, useWizard, type Measurements, type MeasurementKey,
} from "../WizardContext";

function mockPayloadForHeight(heightCm: number): Record<MeasurementKey, number> {
  const ratio = heightCm / 175;
  const base: Record<MeasurementKey, number> = {
    neck: 38, shoulderToCrotch: 72, chest: 98, waist: 84, hips: 100,
    bicep: 32, armLength: 60, legHeight: 102, thigh: 56, shoulderBreadth: 46,
  };
  const out = {} as Record<MeasurementKey, number>;
  for (const k of MEASUREMENT_KEYS) out[k] = Math.round(base[k] * ratio * 10) / 10;
  return out;
}

type Upload = { name: string; gradient: string; file: File } | null;
const GRAD_FRONT = "linear-gradient(135deg, oklch(0.55 0.13 30), oklch(0.30 0.10 30))";
const GRAD_SIDE = "linear-gradient(135deg, oklch(0.55 0.12 200), oklch(0.30 0.10 220))";

/** Base URL of the local Python measurement service. Falls back to localhost:8000. */
const PYTHON_API_URL =
  (import.meta.env.VITE_PYTHON_API_URL as string | undefined) ?? "http://localhost:8000";

export function AiMeasurementPanel() {
  const { setAllMeasurements, measurements } = useWizard();
  const [front, setFront] = useState<Upload>(null);
  const [side, setSide] = useState<Upload>(null);
  const [height, setHeight] = useState<number | "">("");
  const [busy, setBusy] = useState(false);

  const canAnalyze = !!front && !!side && typeof height === "number" && height > 100 && !busy;

  const analyze = async () => {
    if (!front || !side || typeof height !== "number") return;
    setBusy(true);

    try {
      const form = new FormData();
      form.append("front_photo", front.file);
      form.append("side_photo", side.file);
      form.append("height_cm", String(height));

      const response = await fetch(`${PYTHON_API_URL}/measure`, {
        method: "POST",
        body: form,
      });

      if (!response.ok) {
        throw new Error(`Server responded with status ${response.status}`);
      }

      const data = (await response.json()) as Partial<Record<MeasurementKey, number | null>>;

      // Merge API results into the measurements state; skip null/undefined values
      // so the user can fill those in manually.
      const filled: Measurements = { ...measurements };
      for (const k of MEASUREMENT_KEYS) {
        const value = data[k];
        if (typeof value === "number" && value > 0) {
          filled[k] = Math.round(value * 10) / 10;
        }
      }
      setAllMeasurements(filled);
      toast.success("Measurements auto-filled from photo analysis.");
    } catch (err) {
      console.error("[AiMeasurementPanel] Python API unreachable:", err);

      // Graceful fallback: use proportional estimate and tell the user.
      const fallback = mockPayloadForHeight(height as number);
      const filled: Measurements = { ...measurements };
      for (const k of MEASUREMENT_KEYS) filled[k] = fallback[k];
      setAllMeasurements(filled);

      toast.warning(
        "Could not reach the Python measurement service — estimated measurements have been pre-filled based on your height. Please review and adjust them manually.",
        { duration: 6000 },
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card className="border-dashed p-6">
      <p className="text-xs uppercase tracking-[0.2em] text-accent-foreground">
        AI Measurement Pipeline
      </p>
      <h3 className="mt-1 font-display text-xl text-primary">
        Upload one front-facing and one side-facing photo
      </h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Stand 2 m from the camera against a plain background. Photos are processed
        on our pose-estimation server; nothing is stored permanently.
      </p>

      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <UploadTile
          id="upload-front"
          label="Front-facing photo"
          upload={front}
          gradient={GRAD_FRONT}
          onPick={(file) =>
            setFront({ name: file.name, gradient: GRAD_FRONT, file })
          }
        />
        <UploadTile
          id="upload-side"
          label="Side-facing photo"
          upload={side}
          gradient={GRAD_SIDE}
          onPick={(file) =>
            setSide({ name: file.name, gradient: GRAD_SIDE, file })
          }
        />
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:items-end">
        <div className="space-y-1.5">
          <Label htmlFor="ai-height">Your height</Label>
          <div className="relative">
            <Input
              id="ai-height"
              type="number"
              min={120}
              max={230}
              value={height}
              onChange={(e) =>
                setHeight(e.target.value === "" ? "" : Number(e.target.value))
              }
              className="pr-12"
              placeholder="175"
            />
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
              cm
            </span>
          </div>
        </div>
        <Button onClick={analyze} disabled={!canAnalyze} className="gap-2">
          {busy ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Running pose estimation…
            </>
          ) : (
            <>
              <Camera className="h-4 w-4" /> Analyze photos
            </>
          )}
        </Button>
      </div>

      {/* Service status hint */}
      <p className="mt-3 text-[11px] text-muted-foreground">
        Requires the local Python service to be running at{" "}
        <code className="rounded bg-muted px-1 py-0.5 font-mono">{PYTHON_API_URL}</code>.
        See <code className="rounded bg-muted px-1 py-0.5 font-mono">api/python-engine/README.md</code>{" "}
        for setup instructions.
      </p>
    </Card>
  );
}

function UploadTile({
  id,
  label,
  upload,
  gradient,
  onPick,
}: {
  id: string;
  label: string;
  upload: Upload;
  gradient: string;
  onPick: (file: File) => void;
}) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onPick(file);
    // Reset so the same file can be re-selected after replacement.
    e.target.value = "";
  };

  return (
    <label
      htmlFor={id}
      className="group relative flex aspect-[4/5] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-border bg-muted/40 transition-colors hover:border-primary"
    >
      {/* Hidden native file input */}
      <input
        id={id}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={handleChange}
      />

      {upload ? (
        <>
          <div className="absolute inset-0" style={{ background: upload.gradient }} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="relative z-10 flex flex-col items-center gap-2 text-primary-foreground">
            <CheckCircle2 className="h-8 w-8" />
            <span className="max-w-[90%] truncate text-xs font-medium">{upload.name}</span>
            <span className="text-[10px] uppercase tracking-wider opacity-80">Click to replace</span>
          </div>
        </>
      ) : (
        <>
          <Camera className="h-8 w-8 text-muted-foreground transition-colors group-hover:text-primary" />
          <span className="mt-2 text-sm font-medium text-foreground">{label}</span>
          <span className="mt-1 text-[11px] text-muted-foreground">Click to upload</span>
        </>
      )}
    </label>
  );
}
