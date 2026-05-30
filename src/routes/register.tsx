import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Scissors, Info } from "lucide-react";
import { useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Ornament } from "@/components/ui/ornament";
import { useApp } from "@/context/AppContext";
import { LocationPicker, type LocationValue } from "@/components/auth/LocationPicker";

export const Route = createFileRoute("/register")({
  head: () => ({ meta: [{ title: "Create account — Khayyat" }] }),
  component: RegisterPage,
});

const locationSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  address: z.string().trim().min(2).max(200),
});

const schema = z
  .object({
    fullName: z.string().trim().min(2, "Required").max(80),
    email: z.string().trim().email("Invalid email").max(255),
    username: z
      .string()
      .trim()
      .min(3, "At least 3 characters")
      .max(32)
      .regex(/^[a-zA-Z0-9_-]+$/, "Letters, numbers, _ and - only"),
    password: z.string().min(8, "At least 8 characters").max(128),
    confirmPassword: z.string(),
    location: locationSchema.nullable().refine((v) => v !== null, {
      message: "Please pin your location on the map",
    }),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

interface FormState {
  fullName: string;
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
  location: LocationValue | null;
}

function RegisterPage() {
  const { register } = useApp();
  const navigate = useNavigate();

  const [values, setValues] = useState<FormState>({
    fullName: "",
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
    location: null,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const update = <K extends keyof FormState>(k: K, v: FormState[K]) => {
    setValues((s) => ({ ...s, [k]: v }));
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(values);
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      parsed.error.issues.forEach((i) => (errs[i.path[0] as string] = i.message));
      setErrors(errs);
      return;
    }
    register({
      fullName: parsed.data.fullName,
      email: parsed.data.email,
      username: parsed.data.username,
      password: parsed.data.password,
      location: parsed.data.location!,
    });
    navigate({ to: "/" });
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <aside
        className="relative hidden lg:flex flex-col justify-between p-12 text-primary-foreground overflow-hidden"
        style={{ background: "var(--gradient-emerald)" }}
      >
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "radial-gradient(circle at 30% 20%, oklch(0.82 0.13 85 / 0.35), transparent 40%), radial-gradient(circle at 70% 80%, oklch(0.55 0.13 160 / 0.4), transparent 45%)",
          }}
        />
        <Link to="/" className="relative flex items-center gap-2.5">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-accent text-accent-foreground">
            <Scissors className="h-4 w-4" />
          </span>
          <span className="font-display text-3xl">Khayyat</span>
        </Link>
        <div className="relative">
          <Ornament className="h-4 w-56 text-accent" />
          <h2 className="mt-6 font-display text-5xl leading-tight">
            Join a heritage
            <br />of fine craft.
          </h2>
          <p className="mt-4 max-w-md text-primary-foreground/85">
            Create an account to design with master tailors, save inspirations, and
            track every stitch of your order.
          </p>
        </div>
        <p className="relative text-sm text-primary-foreground/70">
          © {new Date().getFullYear()} Khayyat — Curated craftsmanship.
        </p>
      </aside>

      <main className="flex items-center justify-center p-6 sm:p-10 bg-background">
        <div className="w-full max-w-md">
          <div className="text-center lg:text-left">
            <h1 className="font-display text-4xl text-primary">Create your account</h1>
            <p className="mt-2 text-muted-foreground">
              Customer registration. A few details and you're in.
            </p>
            <div className="mt-4 flex items-start gap-2 rounded-md border bg-muted/40 p-3 text-xs text-muted-foreground">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <p>
                Tailor and administrator accounts are provisioned by the Khayyat
                team — they cannot be created from this page.
              </p>
            </div>
          </div>

          <form className="mt-6 space-y-4" onSubmit={onSubmit} noValidate>
            <Field label="Full name" error={errors.fullName}>
              <Input
                value={values.fullName}
                onChange={(e) => update("fullName", e.target.value)}
                placeholder="Amira Hassan"
              />
            </Field>

            <Field label="Email" error={errors.email}>
              <Input
                type="email"
                value={values.email}
                onChange={(e) => update("email", e.target.value)}
                placeholder="you@atelier.com"
                autoComplete="email"
              />
            </Field>

            <Field label="Username" error={errors.username}>
              <Input
                value={values.username}
                onChange={(e) => update("username", e.target.value)}
                placeholder="your_handle"
                autoComplete="username"
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Password" error={errors.password}>
                <Input
                  type="password"
                  value={values.password}
                  onChange={(e) => update("password", e.target.value)}
                  placeholder="••••••••"
                  autoComplete="new-password"
                />
              </Field>
              <Field label="Confirm password" error={errors.confirmPassword}>
                <Input
                  type="password"
                  value={values.confirmPassword}
                  onChange={(e) => update("confirmPassword", e.target.value)}
                  placeholder="••••••••"
                  autoComplete="new-password"
                />
              </Field>
            </div>

            <Field label="Location" error={errors.location}>
              <LocationPicker
                value={values.location}
                onChange={(v) => update("location", v)}
              />
            </Field>

            <Button type="submit" size="lg" className="w-full bg-primary text-primary-foreground">
              Create account
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already a member?{" "}
            <Link to="/login" className="text-primary font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </main>
    </div>
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
