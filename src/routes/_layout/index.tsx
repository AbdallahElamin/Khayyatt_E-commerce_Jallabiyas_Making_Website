import { createFileRoute, Link } from "@tanstack/react-router";
import { useApp } from "@/context/AppContext";
import { FEATURED_TAILORS, TOP_DESIGNS } from "@/lib/mock-data";
import { Ornament } from "@/components/ui/ornament";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Scissors, MapPin, Ruler, Sparkles, ArrowRight, Star, Shield, User, Heart, Flame,
} from "lucide-react";

export const Route = createFileRoute("/_layout/")({
  head: () => ({
    meta: [
      { title: "Khayyat — Bespoke Jallabiyas by Master Tailors" },
      { name: "description", content: "Design heirloom-quality Jallabiyas with master tailors across the Middle East and North Africa." },
      { property: "og:title", content: "Khayyat — Bespoke Jallabiyas by Master Tailors" },
      { property: "og:description", content: "A modern marketplace for traditional, made-to-measure Jallabiyas." },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const { role } = useApp();

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10" style={{ background: "var(--gradient-emerald)" }} />
        <div
          className="absolute inset-0 -z-10 opacity-30"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, oklch(0.82 0.13 85 / 0.35), transparent 40%), radial-gradient(circle at 80% 70%, oklch(0.55 0.13 160 / 0.4), transparent 45%)",
          }}
        />
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8 text-primary-foreground">
          <div className="mx-auto max-w-3xl text-center">
            <Badge className="mb-6 bg-accent/20 text-accent border border-accent/40 backdrop-blur">
              <Sparkles className="mr-1.5 h-3 w-3" /> A new kind of atelier
            </Badge>
            <h1 className="font-display text-5xl font-medium leading-[1.05] sm:text-6xl md:text-7xl">
              Bespoke <em className="text-accent not-italic">Jallabiyas</em>,
              <br />stitched to your measure.
            </h1>
            <div className="my-8 flex justify-center text-accent">
              <Ornament className="h-4 w-56" />
            </div>
            <p className="mx-auto max-w-xl text-lg text-primary-foreground/85">
              A curated marketplace of master tailors from Marrakech to Amman — designed,
              measured, and crafted around you.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-3">
              {role === "admin" ? (
                <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-full px-7">
                  <Link to="/admin"><Shield className="mr-1.5 h-4 w-4" /> Open Admin Dashboard</Link>
                </Button>
              ) : (
                <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-full px-7">
                  <Link to="/wizard">Design Your Jallabiya Now! <ArrowRight className="ml-1.5 h-4 w-4" /></Link>
                </Button>
              )}
              <Button asChild size="lg" variant="outline" className="rounded-full border-primary-foreground/40 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground px-7">
                <Link to="/portfolio">Browse Portfolios</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Top 3 Trending Designs */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mb-10 flex items-end justify-between flex-wrap gap-4">
          <div>
            <p className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.2em] text-accent-foreground">
              <Flame className="h-3.5 w-3.5 text-accent" /> Trending this week
            </p>
            <h2 className="mt-2 font-display text-4xl text-primary">Top 3 Designs</h2>
          </div>
          <Button asChild variant="ghost" className="text-primary hidden sm:inline-flex">
            <Link to="/portfolio">Explore all <ArrowRight className="ml-1 h-4 w-4" /></Link>
          </Button>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {TOP_DESIGNS.map((d, i) => (
            <Card
              key={d.id}
              className="group overflow-hidden border-border transition-all hover:border-accent hover:shadow-[var(--shadow-luxe)]"
            >
              <div className="relative h-64" style={{ background: d.gradient }}>
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                <span className="absolute top-3 left-3 inline-flex items-center justify-center h-8 w-8 rounded-full bg-background/90 text-primary font-display text-lg">
                  {i + 1}
                </span>
                <span className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-full bg-background/90 px-2.5 py-1 text-xs text-primary">
                  <Heart className="h-3 w-3 fill-destructive text-destructive" />
                  {d.likes.toLocaleString()}
                </span>
              </div>
              <div className="p-6">
                <h3 className="font-display text-2xl text-primary">{d.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  by <span className="text-foreground">{d.tailorName}</span> · {d.city}
                </p>
                <Link to="/portfolio" className="mt-4 inline-flex items-center gap-1 text-sm text-primary hover:text-primary-glow">
                  View design <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Role lanes */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="font-display text-4xl text-primary">Choose your path</h2>
          <p className="mt-2 text-muted-foreground">Three ways to experience Khayyat.</p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          <RoleCard active={role === "customer"} icon={User} title="For Customers" desc="Design your Jallabiya with a master tailor — guided, end to end." cta="Open Design Wizard" to="/wizard" />
          <RoleCard active={role === "tailor"} icon={Scissors} title="For Tailors" desc="Showcase your atelier, accept orders, and manage your studio." cta="Visit Studio" to="/profile" />
          <RoleCard active={role === "admin"} icon={Shield} title="For Administrators" desc="Oversee tailors, customers, and platform operations." cta="Open Dashboard" to="/admin" />
        </div>
      </section>

      {/* Featured tailors */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <h2 className="font-display text-4xl text-primary">Featured Ateliers</h2>
            <p className="mt-2 text-muted-foreground">Hand-picked masters of traditional craft.</p>
          </div>
          <Button asChild variant="ghost" className="text-primary hidden sm:inline-flex">
            <Link to="/portfolio">View all <ArrowRight className="ml-1 h-4 w-4" /></Link>
          </Button>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {FEATURED_TAILORS.map((t) => (
            <Link key={t.id} to="/portfolio/$tailorId" params={{ tailorId: t.id }}>
              <Card className="group h-full overflow-hidden border-border transition-all hover:border-accent hover:shadow-[var(--shadow-luxe)]">
                <div className="h-44 w-full" style={{ background: "var(--gradient-emerald)" }}>
                  <div className="flex h-full items-center justify-center text-primary-foreground/80">
                    <Scissors className="h-10 w-10" />
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display text-2xl text-primary">{t.name}</h3>
                    <span className="inline-flex items-center gap-1 text-sm text-accent-foreground">
                      <Star className="h-3.5 w-3.5 fill-accent text-accent" /> {t.rating}
                    </span>
                  </div>
                  <p className="mt-1 inline-flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" /> {t.city}
                  </p>
                  <p className="mt-3 text-sm text-foreground/80">{t.specialty}</p>
                  <p className="mt-4 text-xs uppercase tracking-wider text-muted-foreground">{t.years} years of craft</p>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-secondary/40 border-y border-border">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-display text-4xl text-primary">How it works</h2>
            <Ornament className="mx-auto mt-3 h-3 w-32 text-accent" />
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: MapPin, title: "Find a tailor", desc: "Browse master ateliers on the map or by city." },
              { icon: Sparkles, title: "Design", desc: "Pick fabric, cut, embroidery, and finishing." },
              { icon: Ruler, title: "Measure", desc: "Take measurements manually or with AI assistance." },
              { icon: Scissors, title: "Receive", desc: "Track your order until it arrives at your door." },
            ].map((s, i) => (
              <div key={s.title} className="text-center">
                <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-background border border-accent/40 text-primary shadow-[var(--shadow-luxe)]">
                  <s.icon className="h-6 w-6" />
                </div>
                <p className="mt-4 text-xs font-medium uppercase tracking-wider text-accent-foreground">Step {i + 1}</p>
                <h3 className="mt-1 font-display text-xl text-primary">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function RoleCard({
  icon: Icon, title, desc, cta, to, active,
}: {
  icon: typeof User; title: string; desc: string; cta: string; to: string; active: boolean;
}) {
  return (
    <Card className={`p-7 transition-all ${active ? "border-accent shadow-[var(--shadow-luxe)] bg-card" : "hover:border-accent/60 hover:shadow-[var(--shadow-elevated)]"}`}>
      <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary text-primary-foreground">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="mt-5 font-display text-2xl text-primary">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
      <Button asChild variant="ghost" className="mt-5 px-0 text-primary hover:bg-transparent hover:text-primary-glow">
        <Link to={to}>{cta} <ArrowRight className="ml-1.5 h-4 w-4" /></Link>
      </Button>
    </Card>
  );
}
