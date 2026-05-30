import { useState, type FormEvent } from "react";
import { UserPlus, Eye, EyeOff, CalendarDays } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LocationPicker, type LocationValue } from "@/components/auth/LocationPicker";
import type { ManagedTailor } from "@/lib/mock-data";

interface Props {
  onAdd: (t: Omit<ManagedTailor, "id" | "bannedUntil">) => void;
}

interface FormState {
  fullName: string;
  atelier: string;
  email: string;
  username: string;
  password: string;
  /** ISO date string selected by the native date picker (YYYY-MM-DD). */
  experienceStartDate: string;
  location: LocationValue | null;
}

const EMPTY_FORM: FormState = {
  fullName: "",
  atelier: "",
  email: "",
  username: "",
  password: "",
  experienceStartDate: "",
  location: null,
};

/**
 * Derives a short city name from an address string returned by Nominatim.
 * Takes the first comma-separated segment, or the whole string if no comma.
 */
function cityFromAddress(address: string): string {
  return address.split(",")[0].trim();
}

export function AddTailorDialog({ onAdd }: Props) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const validate = (): boolean => {
    const e: Partial<Record<keyof FormState, string>> = {};
    if (!form.fullName.trim())         e.fullName = "Required";
    if (!form.atelier.trim())          e.atelier  = "Required";
    if (!form.email.trim())            e.email    = "Required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Invalid email";
    if (!form.username.trim())         e.username  = "Required";
    if (form.username.length < 3)      e.username  = "At least 3 characters";
    if (!/^[a-zA-Z0-9_-]+$/.test(form.username)) e.username = "Letters, numbers, _ and - only";
    if (!form.password)                e.password  = "Required";
    if (form.password.length < 8)      e.password  = "At least 8 characters";
    if (!form.experienceStartDate)     e.experienceStartDate = "Required";
    if (!form.location)                e.location  = "Pin the atelier location on the map";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const city = form.location ? cityFromAddress(form.location.address) : "";

    onAdd({
      fullName:             form.fullName.trim(),
      atelier:              form.atelier.trim(),
      email:                form.email.trim(),
      username:             form.username.trim(),
      password:             form.password,
      experienceStartDate:  form.experienceStartDate,
      city,
      location:             form.location,
    });

    setForm(EMPTY_FORM);
    setErrors({});
    setOpen(false);
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setForm(EMPTY_FORM);
      setErrors({});
    }
    setOpen(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="bg-primary text-primary-foreground gap-1.5">
          <UserPlus className="h-4 w-4" /> Add New Tailor
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl text-primary">
            Onboard a tailor
          </DialogTitle>
          <DialogDescription>
            Tailors cannot self-register. Provision their account here — they will
            receive credentials to sign in.
          </DialogDescription>
        </DialogHeader>

        <form
          id="add-tailor-form"
          onSubmit={submit}
          className="space-y-5 py-2"
          noValidate
        >
          {/* ── Row 1: Full name + Atelier ──────────────────────────── */}
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Full name" error={errors.fullName}>
              <Input
                id="add-tailor-fullName"
                value={form.fullName}
                onChange={(e) => set("fullName", e.target.value)}
                placeholder="Khalil Benali"
                autoComplete="name"
              />
            </Field>
            <Field label="Atelier name" error={errors.atelier}>
              <Input
                id="add-tailor-atelier"
                value={form.atelier}
                onChange={(e) => set("atelier", e.target.value)}
                placeholder="Atelier Khalil"
              />
            </Field>
          </div>

          {/* ── Row 2: Email + Username ─────────────────────────────── */}
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Email" error={errors.email}>
              <Input
                id="add-tailor-email"
                type="email"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                placeholder="khalil@khayyat.app"
                autoComplete="email"
              />
            </Field>
            <Field label="Username" error={errors.username}>
              <Input
                id="add-tailor-username"
                value={form.username}
                onChange={(e) => set("username", e.target.value)}
                placeholder="master_khalil"
                autoComplete="off"
              />
            </Field>
          </div>

          {/* ── Row 3: Password + Experience start date ─────────────── */}
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Password" error={errors.password}>
              <div className="relative">
                <Input
                  id="add-tailor-password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => set("password", e.target.value)}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute inset-y-0 right-3 flex items-center text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </Field>

            <Field label="Start of experience" error={errors.experienceStartDate}>
              <div className="relative">
                <Input
                  id="add-tailor-experienceStartDate"
                  type="date"
                  value={form.experienceStartDate}
                  onChange={(e) => set("experienceStartDate", e.target.value)}
                  max={new Date().toISOString().split("T")[0]}
                  className="pr-10"
                />
                <CalendarDays className="pointer-events-none absolute inset-y-0 right-3 flex h-full w-4 items-center text-muted-foreground" />
              </div>
            </Field>
          </div>

          {/* ── Atelier location (full-width Leaflet map) ───────────── */}
          <div className="space-y-1.5">
            <Label htmlFor="location-picker-map">
              Atelier location
            </Label>
            <LocationPicker
              value={form.location}
              onChange={(v) => set("location", v)}
            />
            {errors.location && (
              <p className="text-xs text-destructive">{errors.location}</p>
            )}
          </div>
        </form>

        <DialogFooter>
          <Button
            type="button"
            variant="ghost"
            onClick={() => handleOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="add-tailor-form"
            className="bg-primary text-primary-foreground"
          >
            Add tailor
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
