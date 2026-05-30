import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

export type DesignConfig = {
  fabric?: string;
  fabricColor?: string;
  sleeve?: string;
  embroideryPlacements: string[];
  embroideryPattern?: string;
  buttonsVisible: boolean;
  fastener?: string;
  buttonColor?: string;
  collar?: string;
  backStitch?: string;
};

export const EMPTY_DESIGN: DesignConfig = {
  embroideryPlacements: [],
  buttonsVisible: true,
};

export const MEASUREMENT_KEYS = [
  "neck",
  "shoulderToCrotch",
  "chest",
  "waist",
  "hips",
  "bicep",
  "armLength",
  "legHeight",
  "thigh",
  "shoulderBreadth",
] as const;
export type MeasurementKey = (typeof MEASUREMENT_KEYS)[number];

export const MEASUREMENT_LABELS: Record<MeasurementKey, string> = {
  neck: "Neck circumference",
  shoulderToCrotch: "Shoulder-to-crotch",
  chest: "Chest",
  waist: "Waist",
  hips: "Hips",
  bicep: "Bicep",
  armLength: "Arm length",
  legHeight: "Leg height",
  thigh: "Thigh circumference",
  shoulderBreadth: "Shoulder breadth",
};

export type Measurements = Record<MeasurementKey, number | "">;

export const EMPTY_MEASUREMENTS: Measurements = MEASUREMENT_KEYS.reduce(
  (acc, k) => ({ ...acc, [k]: "" }),
  {} as Measurements,
);

export const WIZARD_STEPS = [
  { n: 1, label: "Select Tailor" },
  { n: 2, label: "Customize" },
  { n: 3, label: "Measurements" },
  { n: 4, label: "Review" },
] as const;

export type StepNum = 1 | 2 | 3 | 4;

type Ctx = {
  step: StepNum;
  tailorId?: string;
  radiusKm: number;
  design: DesignConfig;
  preset?: string;
  measurements: Measurements;
  setStep: (s: StepNum) => void;
  next: () => void;
  back: () => void;
  setTailorId: (id?: string) => void;
  setRadiusKm: (n: number) => void;
  setDesign: (d: DesignConfig | ((p: DesignConfig) => DesignConfig)) => void;
  applyPreset: (presetId: string, design: DesignConfig) => void;
  setMeasurement: (key: MeasurementKey, value: number | "") => void;
  setAllMeasurements: (m: Measurements) => void;
  /** Full reset: clears design, measurements, and preset; returns to step 2. */
  resetWizard: () => void;
  /** Legacy alias for resetWizard — kept for backward compatibility. */
  resetForNewOrder: () => void;
  canAdvance: boolean;
};

const WizardCtx = createContext<Ctx | undefined>(undefined);

export function WizardProvider({ children }: { children: ReactNode }) {
  const [step, setStep] = useState<StepNum>(1);
  const [tailorId, setTailorId] = useState<string | undefined>();
  const [radiusKm, setRadiusKm] = useState(5);
  const [design, setDesign] = useState<DesignConfig>(EMPTY_DESIGN);
  const [preset, setPreset] = useState<string | undefined>();
  const [measurements, setMeasurements] = useState<Measurements>(EMPTY_MEASUREMENTS);

  const canAdvance = useMemo(() => {
    if (step === 1) return !!tailorId;
    if (step === 2) return !!preset || (!!design.fabric && !!design.fabricColor);
    if (step === 3)
      return MEASUREMENT_KEYS.every((k) => typeof measurements[k] === "number" && (measurements[k] as number) > 0);
    return true;
  }, [step, tailorId, preset, design, measurements]);

  const value: Ctx = {
    step, tailorId, radiusKm, design, preset, measurements,
    setStep,
    next: () => setStep((s) => (Math.min(4, s + 1) as StepNum)),
    back: () => setStep((s) => (Math.max(1, s - 1) as StepNum)),
    setTailorId,
    setRadiusKm,
    setDesign,
    applyPreset: (id, d) => { setPreset(id); setDesign(d); },
    setMeasurement: (key, val) => setMeasurements((m) => ({ ...m, [key]: val })),
    setAllMeasurements: (m) => setMeasurements(m),
    resetWizard: () => {
      setDesign(EMPTY_DESIGN);
      setMeasurements(EMPTY_MEASUREMENTS);
      setPreset(undefined);
      setStep(2);
    },
    resetForNewOrder: () => {
      setDesign(EMPTY_DESIGN);
      setMeasurements(EMPTY_MEASUREMENTS);
      setPreset(undefined);
      setStep(2);
    },
    canAdvance,
  };

  return <WizardCtx.Provider value={value}>{children}</WizardCtx.Provider>;
}

export function useWizard() {
  const c = useContext(WizardCtx);
  if (!c) throw new Error("useWizard must be used inside WizardProvider");
  return c;
}
