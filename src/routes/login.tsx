import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Scissors } from "lucide-react";
import { useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Ornament } from "@/components/ui/ornament";
import { useApp } from "@/context/AppContext";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in — Khayyat" }] }),
  component: LoginPage,
});

const schema = z.object({
  username: z.string().trim().min(3, "At least 3 characters").max(32),
  password: z.string().min(6, "At least 6 characters"),
});

function LoginPage() {
  const { login } = useApp();
  const navigate = useNavigate();
  const [values, setValues] = useState({ username: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(values);
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      parsed.error.issues.forEach((i) => (errs[i.path[0] as string] = i.message));
      setErrors(errs);
      return;
    }
    login(parsed.data.username, parsed.data.password);
    navigate({ to: "/" });
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Brand panel */}
      <aside
        className="relative hidden lg:flex flex-col justify-between p-12 text-primary-foreground overflow-hidden"
        style={{ background: "var(--gradient-emerald)" }}
      >
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, oklch(0.82 0.13 85 / 0.35), transparent 40%), radial-gradient(circle at 80% 80%, oklch(0.55 0.13 160 / 0.4), transparent 45%)",
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
            Bespoke ateliers,
            <br />at your fingertips.
          </h2>
          <p className="mt-4 max-w-md text-primary-foreground/85">
            Sign in to continue your design, track an order, or visit your studio.
          </p>
        </div>
        <p className="relative text-sm text-primary-foreground/70">
          © {new Date().getFullYear()} Khayyat — Curated craftsmanship.
        </p>
      </aside>

      {/* Form panel */}
      <main className="flex items-center justify-center p-6 sm:p-10 bg-background">
        <div className="w-full max-w-sm">
          <div className="text-center lg:text-left">
            <h1 className="font-display text-4xl text-primary">Welcome back</h1>
            <p className="mt-2 text-muted-foreground">Sign in to your account.</p>
          </div>
          <form className="mt-8 space-y-5" onSubmit={onSubmit} noValidate>
            <div className="space-y-1.5">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={values.username}
                onChange={(e) => setValues((v) => ({ ...v, username: e.target.value }))}
                placeholder="your_handle"
                autoComplete="username"
              />
              {errors.username && <p className="text-xs text-destructive">{errors.username}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={values.password}
                onChange={(e) => setValues((v) => ({ ...v, password: e.target.value }))}
                placeholder="••••••••"
                autoComplete="current-password"
              />
              {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
            </div>
            <Button type="submit" className="w-full bg-primary text-primary-foreground" size="lg">
              Login
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            New to Khayyat?{" "}
            <Link to="/register" className="text-primary font-medium hover:underline">
              Create an account
            </Link>
          </p>
          <p className="mt-3 text-center text-xs text-muted-foreground">
            Tip: use a username containing <code>admin</code> or <code>tailor</code> to preview that role.
          </p>
        </div>
      </main>
    </div>
  );
}
