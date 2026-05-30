import { Ornament } from "@/components/ui/ornament";
import { Card } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";

export function PagePlaceholder({
  icon: Icon, eyebrow, title, description, children,
}: {
  icon: LucideIcon;
  eyebrow: string;
  title: string;
  description: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-5xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="text-center">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-primary text-primary-foreground shadow-[var(--shadow-luxe)]">
          <Icon className="h-6 w-6" />
        </div>
        <p className="mt-5 text-xs uppercase tracking-[0.2em] text-accent-foreground">{eyebrow}</p>
        <h1 className="mt-2 font-display text-5xl text-primary">{title}</h1>
        <Ornament className="mx-auto mt-4 h-3 w-40 text-accent" />
        <p className="mx-auto mt-6 max-w-xl text-muted-foreground">{description}</p>
      </div>
      {children && (
        <Card className="mt-12 border-dashed border-2 border-border bg-card/60 p-10">
          {children}
        </Card>
      )}
    </div>
  );
}
