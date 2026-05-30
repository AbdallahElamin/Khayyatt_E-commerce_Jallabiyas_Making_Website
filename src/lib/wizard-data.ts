import type { DesignConfig } from "@/components/wizard/WizardContext";
import { EMPTY_DESIGN } from "@/components/wizard/WizardContext";

/** A swatch can be either a flat color or a CSS background (gradient / pattern). */
export type SwatchOption = {
  id: string;
  label: string;
  /** CSS background value used to preview the option. */
  swatch: string;
  hint?: string;
};

/* ---------------- Catalogues ---------------- */

export const FABRICS: (SwatchOption & { price: number })[] = [
  { id: "cotton",       label: "Egyptian Cotton",  price: 60,  swatch: "repeating-linear-gradient(45deg, #f1ead9 0 4px, #e6dfcb 4px 8px)" },
  { id: "linen",        label: "Hand-loomed Linen", price: 85, swatch: "repeating-linear-gradient(90deg, #ece4d2 0 3px, #d6cdb8 3px 6px)" },
  { id: "silk",         label: "Mulberry Silk",    price: 180, swatch: "linear-gradient(135deg, #f4e9c8, #cfa86b)" },
  { id: "wool",         label: "Light Wool",       price: 120, swatch: "repeating-radial-gradient(circle at 30% 30%, #c8b896 0 2px, #a89876 2px 4px)" },
  { id: "poly-blend",   label: "Poly Blend",       price: 40,  swatch: "linear-gradient(135deg, #cfcfcf, #9a9a9a)" },
];

export const LABOR_BASE = 90;
export const EMBROIDERY_FEE = 25;
export const DELIVERY_FEE = 15;
export const TAX_RATE = 0.15;

export const FABRIC_COLORS: SwatchOption[] = [
  { id: "ivory",    label: "Ivory",       swatch: "#f5efe1" },
  { id: "sand",     label: "Sand",        swatch: "#d8c79a" },
  { id: "saffron",  label: "Saffron",     swatch: "#d49144" },
  { id: "emerald",  label: "Emerald",     swatch: "#2f6b53" },
  { id: "indigo",   label: "Indigo",      swatch: "#2e3a6b" },
  { id: "charcoal", label: "Charcoal",    swatch: "#2b2b2b" },
  { id: "rose",     label: "Dusty Rose",  swatch: "#b87f7f" },
];

export const SLEEVES: SwatchOption[] = [
  { id: "sudanese-wide",   label: "Sudanese Wide",   swatch: "linear-gradient(180deg,#e9dfc8,#cdbf99)" },
  { id: "khaleeji-straight", label: "Khaleeji Straight", swatch: "linear-gradient(180deg,#e3e9ef,#aeb8c4)" },
  { id: "short-sleeve",    label: "Short Sleeve",    swatch: "linear-gradient(180deg,#f1e7d3,#caa67a)" },
];

export const EMBROIDERY_PLACEMENTS: SwatchOption[] = [
  { id: "collar", label: "Collar", swatch: "linear-gradient(135deg,#caa86b,#7b5b2c)" },
  { id: "cuffs",  label: "Cuffs",  swatch: "linear-gradient(135deg,#caa86b,#7b5b2c)" },
  { id: "hem",    label: "Hem",    swatch: "linear-gradient(135deg,#caa86b,#7b5b2c)" },
];

export const EMBROIDERY_PATTERNS: SwatchOption[] = [
  { id: "geometric", label: "Geometric",   swatch: "repeating-linear-gradient(45deg,#caa86b 0 4px,#3b2a14 4px 8px)" },
  { id: "floral",    label: "Floral Vine", swatch: "radial-gradient(circle at 30% 30%, #caa86b 2px, transparent 3px), radial-gradient(circle at 70% 70%, #7b5b2c 2px, transparent 3px), #2b2014" },
  { id: "zellige",   label: "Zellige",     swatch: "conic-gradient(from 45deg, #caa86b 25%, #7b5b2c 0 50%, #caa86b 0 75%, #7b5b2c 0)" },
  { id: "minimal",   label: "Minimal Line", swatch: "linear-gradient(180deg, transparent 45%, #caa86b 45% 55%, transparent 55%)" },
];

export const FASTENERS: SwatchOption[] = [
  { id: "buttons", label: "Buttons", swatch: "radial-gradient(circle at 50% 50%, #caa86b 30%, transparent 32%) #2b2014" },
  { id: "zipper",  label: "Zipper",  swatch: "repeating-linear-gradient(90deg,#9a9a9a 0 3px,#3a3a3a 3px 6px)" },
];

export const BUTTON_COLORS: SwatchOption[] = [
  { id: "gold",       label: "Gold",        swatch: "#caa86b" },
  { id: "pearl",      label: "Pearl",       swatch: "#efe7d4" },
  { id: "onyx",       label: "Onyx",        swatch: "#1a1a1a" },
  { id: "horn",       label: "Horn",        swatch: "#6b4a2a" },
];

export const COLLARS: SwatchOption[] = [
  { id: "band",             label: "Band Collar",                              swatch: "linear-gradient(180deg,#e9dfc8 0 60%,#cdbf99 60%)" },
  { id: "chinese",          label: "Chinese Collar",                           swatch: "linear-gradient(180deg,#e9dfc8 0 50%,#a88a55 50% 60%,#e9dfc8 60%)" },
  { id: "french",           label: "French Fold-over",                         swatch: "linear-gradient(180deg,#e9dfc8 0 40%,#cdbf99 40% 55%,#e9dfc8 55%)" },
  { id: "no-collar",        label: "No Collar",                                swatch: "linear-gradient(180deg,#e9dfc8,#e9dfc8)" },
  { id: "no-collar-satin",  label: "No Collar - With Satin piping cord edging", swatch: "linear-gradient(180deg,#e9dfc8 0 90%,#c8a86b 90%)" },
];

export const BACK_STITCH_PATTERNS: SwatchOption[] = [
  { id: "straight",  label: "Straight",  swatch: "repeating-linear-gradient(90deg,#3b2a14 0 4px, transparent 4px 8px)" },
  { id: "chevron",   label: "Chevron",   swatch: "repeating-linear-gradient(45deg,#3b2a14 0 3px,transparent 3px 7px),repeating-linear-gradient(-45deg,#3b2a14 0 3px,transparent 3px 7px)" },
  { id: "cross",     label: "Cross-stitch", swatch: "repeating-linear-gradient(45deg,#3b2a14 0 2px,transparent 2px 6px),repeating-linear-gradient(-45deg,#3b2a14 0 2px,transparent 2px 6px)" },
  { id: "double",    label: "Double Run", swatch: "repeating-linear-gradient(90deg,#3b2a14 0 2px,transparent 2px 4px,#3b2a14 4px 6px,transparent 6px 10px)" },
];

export const CATEGORY_LABELS = {
  fabric: "Fabric Type",
  fabricColor: "Fabric Color",
  sleeve: "Sleeve Type",
  embroideryPattern: "Embroidery Pattern",
  fastener: "Fastener Type",
  buttonColor: "Button Color",
  collar: "Collar Style",
  backStitch: "Back Stitching",
} as const;

export type CategoryKey = keyof typeof CATEGORY_LABELS;

/* ---------------- Style Presets ---------------- */

export type StylePreset = { id: string; label: string; config: DesignConfig };

export const STYLE_PRESETS: StylePreset[] = [
  {
    id: "sudanese", label: "Traditional Sudanese",
    config: {
      fabric: "cotton", fabricColor: "ivory", sleeve: "sudanese-wide",
      embroideryPlacements: ["collar", "cuffs"], embroideryPattern: "geometric",
      buttonsVisible: false, fastener: "buttons", buttonColor: "pearl",
      collar: "no-collar", backStitch: "straight",
    },
  },
  {
    id: "saudi", label: "Traditional Saudi",
    config: {
      fabric: "cotton", fabricColor: "ivory", sleeve: "khaleeji-straight",
      embroideryPlacements: [], embroideryPattern: undefined,
      buttonsVisible: true, fastener: "buttons", buttonColor: "pearl",
      collar: "chinese", backStitch: "straight",
    },
  },
  {
    id: "emirati", label: "Traditional Emirati",
    config: {
      fabric: "linen", fabricColor: "ivory", sleeve: "khaleeji-straight",
      embroideryPlacements: ["collar"], embroideryPattern: "minimal",
      buttonsVisible: false, fastener: "zipper", buttonColor: "pearl",
      collar: "french", backStitch: "double",
    },
  },
  {
    id: "saidi", label: "Egyptian Saidi",
    config: {
      fabric: "wool", fabricColor: "charcoal", sleeve: "sudanese-wide",
      embroideryPlacements: ["hem"], embroideryPattern: "floral",
      buttonsVisible: true, fastener: "buttons", buttonColor: "onyx",
      collar: "band", backStitch: "chevron",
    },
  },
  {
    id: "custom", label: "Custom",
    config: EMPTY_DESIGN,
  },
];

/* ---------------- Per-tailor Inventory ---------------- */
/** Items listed here are IN STOCK for that tailor. Anything else is greyed-out. */
export type TailorInventory = Record<CategoryKey | "embroideryPlacement", string[]>;

const ALL: TailorInventory = {
  fabric: FABRICS.map((f) => f.id),
  fabricColor: FABRIC_COLORS.map((f) => f.id),
  sleeve: SLEEVES.map((f) => f.id),
  embroideryPattern: EMBROIDERY_PATTERNS.map((f) => f.id),
  embroideryPlacement: EMBROIDERY_PLACEMENTS.map((f) => f.id),
  fastener: FASTENERS.map((f) => f.id),
  buttonColor: BUTTON_COLORS.map((f) => f.id),
  collar: COLLARS.map((f) => f.id),
  backStitch: BACK_STITCH_PATTERNS.map((f) => f.id),
};

export const TAILOR_INVENTORY: Record<string, TailorInventory> = {
  // Marrakech — Atelier Khalil (broad stock, no silk, no zipper)
  "t-1": {
    ...ALL,
    fabric: ["cotton", "linen", "wool"],
    fastener: ["buttons"],
    fabricColor: ["ivory", "sand", "saffron", "emerald", "charcoal"],
  },
  // Cairo — Beit Al-Hareer (silks specialist; no wool)
  "t-2": {
    ...ALL,
    fabric: ["cotton", "linen", "silk"],
    fabricColor: ["ivory", "sand", "saffron", "rose", "indigo"],
    buttonColor: ["gold", "pearl", "horn"],
  },
  // Amman — Dar Al-Khayyat (premium only)
  "t-3": {
    ...ALL,
    fabric: ["silk", "wool"],
    backStitch: ["chevron", "cross", "double"],
  },
  // Beirut — Haddad & Sons (modern, zipper-friendly)
  "t-4": {
    ...ALL,
    fabric: ["cotton", "wool", "poly-blend"],
    embroideryPattern: ["minimal", "geometric"],
    collar: ["chinese", "french"],
  },
  // Tunis — Maison Zaytouna (linen-only)
  "t-5": {
    ...ALL,
    fabric: ["linen", "cotton"],
    fabricColor: ["ivory", "sand", "emerald", "rose"],
    sleeve: ["sudanese-wide", "short-sleeve"],
  },
  // Casablanca — Atelier Andalus
  "t-6": {
    ...ALL,
    fastener: ["buttons"],
    embroideryPattern: ["geometric", "zellige", "floral"],
  },
  // Riyadh — Bayt Al-Jazira (khaleeji)
  "t-7": {
    ...ALL,
    sleeve: ["khaleeji-straight"],
    collar: ["chinese", "band"],
    embroideryPattern: ["minimal", "geometric"],
  },
  // Istanbul — İpek Studio (silks, minimalist)
  "t-8": {
    ...ALL,
    fabric: ["silk", "wool"],
    embroideryPattern: ["minimal"],
    fastener: ["zipper", "buttons"],
  },
};

export function getInventory(tailorId?: string): TailorInventory {
  if (!tailorId) return ALL;
  return TAILOR_INVENTORY[tailorId] ?? ALL;
}
