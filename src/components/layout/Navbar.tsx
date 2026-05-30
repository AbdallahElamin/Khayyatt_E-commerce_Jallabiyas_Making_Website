import { Link } from "@tanstack/react-router";
import { Scissors, Menu } from "lucide-react";
import { useState } from "react";
import { useApp } from "@/context/AppContext";
import type { Role } from "@/lib/mock-data";
import { RoleSwitcher } from "./RoleSwitcher";
import { ProfileMenu } from "./ProfileMenu";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";

type NavLink = { to: string; label: string };

const LINKS: Record<Role, NavLink[]> = {
  customer: [
    { to: "/", label: "Home" },
    { to: "/portfolio", label: "Portfolio" },
    { to: "/wizard", label: "Design Wizard" },
    { to: "/orders", label: "My Orders" },
  ],
  tailor: [
    { to: "/", label: "Home" },
    { to: "/portfolio", label: "Portfolio" },
    { to: "/orders", label: "Orders" },
  ],
  admin: [
    { to: "/", label: "Home" },
    { to: "/portfolio", label: "Portfolio" },
    { to: "/admin", label: "Admin Dashboard" },
  ],
};

export function Navbar() {
  const { role, isAuthenticated } = useApp();
  const links = LINKS[role];
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2.5 shrink-0">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-primary text-primary-foreground shadow-[var(--shadow-luxe)]">
            <Scissors className="h-4 w-4" />
          </span>
          <span className="font-display text-2xl tracking-tight text-primary">
            Khayyat
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1 ml-4">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              activeOptions={{ exact: l.to === "/" }}
              activeProps={{ className: "text-primary bg-secondary" }}
              inactiveProps={{ className: "text-foreground/70 hover:text-primary hover:bg-secondary/60" }}
              className="rounded-md px-3 py-2 text-sm font-medium transition-colors"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <div className="hidden sm:block">
            <RoleSwitcher />
          </div>
          {isAuthenticated ? (
            <ProfileMenu />
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Button asChild variant="ghost" size="sm">
                <Link to="/login">Login</Link>
              </Button>
              <Button asChild size="sm" className="bg-primary text-primary-foreground">
                <Link to="/register">Register</Link>
              </Button>
            </div>
          )}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetTitle className="font-display text-2xl text-primary">Khayyat</SheetTitle>
              <div className="mt-6 flex flex-col gap-1">
                {links.map((l) => (
                  <Link
                    key={l.to}
                    to={l.to}
                    onClick={() => setOpen(false)}
                    className="rounded-md px-3 py-2.5 text-sm font-medium text-foreground/80 hover:bg-secondary hover:text-primary"
                  >
                    {l.label}
                  </Link>
                ))}
              </div>
              <div className="mt-6 pt-6 border-t border-border">
                <RoleSwitcher />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
