import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Camera, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import {
  MEASUREMENT_KEYS, useWizard, type MeasurementKey,
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
const GRAD_SIDE  = "linear-gradient(135deg, oklch(0.55 0.12 200), oklch(0.30 0.10 220))";

/** Base URL of the local Python measurement service. Falls back to localhost:8000. */
const PYTHON_API_URL =
  (import.meta.env.VITE_PYTHON_API_URL as string | undefined) ?? "http://localhost:8000";

type Status = "idle" | "busy" | "done" | "error";

export function AiMeasurementPanel() {
  const { setMeasurement } = useWizard();
  const [front, setFront]   = useState<Upload>(null);
  const [side, setSide]     = useState<Upload>(null);
  const [height, setHeight] = useState<number | "">("");
  const [status, setStatus] = useState<Status>("idle");
  const [filledCount, setFilledCount] = useState(0);

  const busy      = status === "busy";
  const canAnalyze = !!front && !!side && typeof height === "number" && height > 100 && !busy;

  const analyze = async () => {
    if (!front || !side || typeof height !== "number") return;
    setStatus("busy");
    setFilledCount(0);

    try {
      // ── Step 0: Quick health-check so we fail fast with a clear message ──
      try {
        const health = await fetch(`${PYTHON_API_URL}/health`, { signal: AbortSignal.timeout(4000) });
        if (!health.ok) throw new Error("health check failed");
        console.info("[AiMeasurementPanel] Python server health OK");
      } catch {
        throw new Error(
          `Cannot reach the Python measurement service at ${PYTHON_API_URL}. ` +
          "Make sure you ran: bun run dev:ai"
        );
      }

      // ── Step 1: Upload images ─────────────────────────────────────────────
      const form = new FormData();
      form.append("front_photo", front.file);
      form.append("side_photo",  side.file);
      form.append("height_cm",   String(height));

      console.info("[AiMeasurementPanel] Sending images to", PYTHON_API_URL + "/measure");

      const response = await fetch(`${PYTHON_API_URL}/measure`, {
        method: "POST",
        body: form,
      });

      if (!response.ok) {
        const detail = await response.text();
        throw new Error(`Server error ${response.status}: ${detail}`);
      }

      // ── Step 2: Parse JSON response ───────────────────────────────────────
      const data = (await response.json()) as Record<string, unknown>;
      console.info("[AiMeasurementPanel] Raw API response:", data);

      // ── Step 3: Write each measurement individually into context ──────────
      // Using individual setMeasurement() calls (not a single setAllMeasurements)
      // avoids stale-closure issues where an old snapshot of `measurements` could
      // overwrite values that were already manually edited by the user.
      let count = 0;
      for (const k of MEASUREMENT_KEYS) {
        const raw = data[k];
        const value = typeof raw === "number" ? raw : Number(raw);
        console.debug(`[AiMeasurementPanel] key=${k} raw=${JSON.stringify(raw)} parsed=${value}`);
        if (Number.isFinite(value) && value > 0) {
          setMeasurement(k, Math.round(value * 10) / 10);
          count++;
        }
      }

      console.info(`[AiMeasurementPanel] Filled ${count} / ${MEASUREMENT_KEYS.length} fields`);
      setFilledCount(count);

      if (count === 0) {
        // Server responded but no usable numbers came back — use height-based estimate
        const fallback = mockPayloadForHeight(height);
        for (const k of MEASUREMENT_KEYS) setMeasurement(k, fallback[k]);
        setFilledCount(MEASUREMENT_KEYS.length);
        toast.warning(
          "AI returned no values — measurements estimated from your height. Please review.",
          { duration: 8000 },
        );
      } else {
        setStatus("done");
        toast.success(
          `${count} measurement${count !== 1 ? "s" : ""} filled from your photos. ` +
          "Scroll down to review them.",
          { duration: 8000 },
        );
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("[AiMeasurementPanel] Error:", err);
      setStatus("error");

      // Graceful fallback: use proportional estimate and tell the user.
      const fallback = mockPayloadForHeight(height as number);
      for (const k of MEASUREMENT_KEYS) setMeasurement(k, fallback[k]);
      setFilledCount(MEASUREMENT_KEYS.length);

      toast.warning(
        `Could not use AI measurements: ${msg}. ` +
        "Estimated measurements have been pre-filled from your height — please review manually.",
        { duration: 10000 },
      );
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
          onPick={(file) => setFront({ name: file.name, gradient: GRAD_FRONT, file })}
        />
        <UploadTile
          id="upload-side"
          label="Side-facing photo"
          upload={side}
          gradient={GRAD_SIDE}
          onPick={(file) => setSide({ name: file.name, gradient: GRAD_SIDE, file })}
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

      {/* Success / error status banners */}
      {status === "done" && (
        <div className="mt-4 flex items-center gap-2 rounded-lg bg-green-500/10 px-4 py-3 text-sm text-green-700 dark:text-green-400">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>
            <strong>{filledCount} measurements</strong> filled from your photos — scroll down to
            review and adjust.
          </span>
        </div>
      )}
      {status === "error" && (
        <div className="mt-4 flex items-center gap-2 rounded-lg bg-yellow-500/10 px-4 py-3 text-sm text-yellow-700 dark:text-yellow-500">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>
            AI could not process the photos. Measurements have been estimated from your height —
            please review them manually.
          </span>
        </div>
      )}

      {/* Service status hint */}
      <p className="mt-3 text-[11px] text-muted-foreground">
        Requires the local Python service to be running at{" "}
        <code className="rounded bg-muted px-1 py-0.5 font-mono">{PYTHON_API_URL}</code>.
        Start it with{" "}
        <code className="rounded bg-muted px-1 py-0.5 font-mono">bun run dev:ai</code> in a
        second terminal.
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
