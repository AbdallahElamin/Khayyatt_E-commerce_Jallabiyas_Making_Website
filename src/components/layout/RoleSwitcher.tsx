import { useApp } from "@/context/AppContext";
import type { Role } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, Scissors, Shield, ChevronDown, Eye } from "lucide-react";

const ROLE_META: Record<Role, { label: string; icon: typeof User }> = {
  customer: { label: "Customer", icon: User },
  tailor: { label: "Tailor", icon: Scissors },
  admin: { label: "Administrator", icon: Shield },
};

export function RoleSwitcher() {
  const { role, setRole } = useApp();
  const Current = ROLE_META[role].icon;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 rounded-full border-primary/30 bg-primary/5 text-primary hover:bg-primary/10 hover:text-primary"
        >
          <Eye className="h-3.5 w-3.5" />
          <span className="text-xs font-medium">Preview as</span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-2 py-0.5 text-xs">
            <Current className="h-3 w-3" />
            {ROLE_META[role].label}
          </span>
          <ChevronDown className="h-3.5 w-3.5 opacity-60" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuLabel className="text-xs uppercase tracking-wider text-muted-foreground">
          Dev role preview
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {(Object.keys(ROLE_META) as Role[]).map((r) => {
          const Icon = ROLE_META[r].icon;
          return (
            <DropdownMenuItem
              key={r}
              onClick={() => setRole(r)}
              className={role === r ? "bg-secondary text-primary" : ""}
            >
              <Icon className="mr-2 h-4 w-4" />
              {ROLE_META[r].label}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
