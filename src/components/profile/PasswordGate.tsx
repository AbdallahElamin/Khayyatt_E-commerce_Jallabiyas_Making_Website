import { useState, type FormEvent } from "react";
import { Lock, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { useApp } from "@/context/AppContext";

interface Props {
  onUnlock: () => void;
}

export function PasswordGate({ onUnlock }: Props) {
  const { user } = useApp();
  const [pw, setPw] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!pw.trim()) {
      setErr("Please enter your password.");
      return;
    }
    if (!user.email) {
      setErr("No email found for this account.");
      return;
    }
    setErr(null);
    setLoading(true);
    try {
      // Verify password by attempting a real Supabase sign-in
      const { error } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: pw,
      });
      if (error) {
        setErr("Incorrect password. Please try again.");
      } else {
        onUnlock();
      }
    } catch {
      setErr("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-20">
      <Card className="border-accent/40 shadow-[var(--shadow-luxe)]">
        <CardHeader className="items-center text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-primary text-primary-foreground">
            <Lock className="h-5 w-5" />
          </div>
          <CardTitle className="font-display text-3xl text-primary mt-3">Confirm your password</CardTitle>
          <CardDescription>
            For your security, please re-enter your password to access profile settings.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-4" noValidate>
            <div className="space-y-1.5">
              <Label htmlFor="gate-pw">Password</Label>
              <Input
                id="gate-pw"
                type="password"
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                placeholder="••••••••"
                autoFocus
              />
              {err && <p className="text-xs text-destructive">{err}</p>}
            </div>
            <Button
              type="submit"
              size="lg"
              className="w-full bg-primary text-primary-foreground"
              disabled={loading}
            >
              <ShieldCheck className="mr-2 h-4 w-4" />
              {loading ? "Verifying…" : "Unlock profile"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
