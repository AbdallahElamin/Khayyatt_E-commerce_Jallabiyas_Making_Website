import { Link } from "@tanstack/react-router";
import { Scissors, Instagram, Twitter, Mail } from "lucide-react";
import { Ornament } from "@/components/ui/ornament";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border bg-secondary/40">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-primary text-primary-foreground">
              <Scissors className="h-3.5 w-3.5" />
            </span>
            <span className="font-display text-2xl text-primary">Khayyat</span>
          </div>
          <Ornament className="h-3 w-44 text-accent" />
          <p className="max-w-md text-sm text-muted-foreground">
            A marketplace of master tailors crafting heirloom-quality Jallabiyas, stitched to measure.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-8 sm:grid-cols-4">
          <FooterCol title="Marketplace" links={[["Portfolio", "/portfolio"], ["Design Wizard", "/wizard"], ["Track Order", "/orders"]]} />
          <FooterCol title="For Tailors" links={[["Become a Tailor", "/register"], ["Studio", "/profile"]]} />
          <FooterCol title="Company"     links={[["About", "/"], ["Contact", "/"]]} />
          <FooterCol title="Legal"       links={[["Terms", "/"], ["Privacy", "/"]]} />
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-border pt-6 sm:flex-row">
          <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} Khayyat Atelier. All rights reserved.</p>
          <div className="flex items-center gap-3 text-muted-foreground">
            <a href="#" className="hover:text-primary"><Instagram className="h-4 w-4" /></a>
            <a href="#" className="hover:text-primary"><Twitter className="h-4 w-4" /></a>
            <a href="#" className="hover:text-primary"><Mail className="h-4 w-4" /></a>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <h4 className="font-display text-base text-primary">{title}</h4>
      <ul className="mt-3 space-y-2 text-sm">
        {links.map(([label, to]) => (
          <li key={label}>
            <Link to={to} className="text-muted-foreground hover:text-primary">{label}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
