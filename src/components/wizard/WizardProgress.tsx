import { Check } from "lucide-react";
import { useWizard, WIZARD_STEPS } from "./WizardContext";
import { cn } from "@/lib/utils";

export function WizardProgress() {
  const { step } = useWizard();
  const pct = ((step - 1) / (WIZARD_STEPS.length - 1)) * 100;

  return (
    <div className="mx-auto max-w-5xl px-4 pt-10 sm:px-6 lg:px-8">
      <div className="flex items-baseline justify-between">
        <p className="text-xs uppercase tracking-[0.25em] text-accent-foreground">
          Step {step} of {WIZARD_STEPS.length}
        </p>
        <p className="font-display text-2xl text-primary">{WIZARD_STEPS[step - 1].label}</p>
      </div>

      <div className="relative mt-6">
        <div className="absolute left-0 right-0 top-5 h-px bg-border" />
        <div
          className="absolute left-0 top-5 h-px bg-primary transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
        <ol className="relative grid grid-cols-4">
          {WIZARD_STEPS.map((s) => {
            const done = s.n < step;
            const active = s.n === step;
            return (
              <li key={s.n} className="flex flex-col items-center">
                <div
                  className={cn(
                    "grid h-10 w-10 place-items-center rounded-full border-2 bg-background text-sm font-semibold transition-colors",
                    done && "border-primary bg-primary text-primary-foreground",
                    active && "border-primary text-primary shadow-[var(--shadow-luxe)]",
                    !done && !active && "border-border text-muted-foreground",
                  )}
                >
                  {done ? <Check className="h-4 w-4" /> : s.n}
                </div>
                <span
                  className={cn(
                    "mt-2 hidden text-[11px] uppercase tracking-wider sm:block",
                    active ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  {s.label}
                </span>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
