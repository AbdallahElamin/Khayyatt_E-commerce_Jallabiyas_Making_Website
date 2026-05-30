import { Check, ChevronDown, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type SortKey = "rating" | "experience" | "name";

const ALL = "__all";
const SORT_LABELS: Record<SortKey, string> = {
  rating: "Top rated",
  experience: "Most experienced",
  name: "Name A–Z",
};

interface Props {
  q: string;
  city: string;
  specialty: string;
  sort: SortKey;
  cities: string[];
  specialties: string[];
  onChange: (next: { q?: string; city?: string; specialty?: string; sort?: SortKey }) => void;
  onClear: () => void;
  hasFilters: boolean;
}

export function PortfolioFilters({
  q, city, specialty, sort, cities, specialties, onChange, onClear, hasFilters,
}: Props) {
  return (
    <div className="sticky top-16 z-30 -mx-4 mb-8 border-y border-border bg-background/95 px-4 py-4 backdrop-blur supports-[backdrop-filter]:bg-background/75 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-3 md:grid-cols-12">
          <div className="relative md:col-span-5">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => onChange({ q: e.target.value })}
              placeholder="Search ateliers, tailors, cities, styles…"
              className="pl-9"
            />
          </div>

          <div className="md:col-span-3">
            <FilterMenu
              label={city === ALL ? "All cities" : city}
              value={city}
              options={[{ value: ALL, label: "All cities" }, ...cities.map((c) => ({ value: c, label: c }))]}
              onSelect={(v) => onChange({ city: v })}
            />
          </div>

          <div className="md:col-span-2">
            <FilterMenu
              label={specialty === ALL ? "All styles" : specialty}
              value={specialty}
              options={[{ value: ALL, label: "All styles" }, ...specialties.map((s) => ({ value: s, label: s }))]}
              onSelect={(v) => onChange({ specialty: v })}
            />
          </div>

          <div className="md:col-span-2">
            <FilterMenu
              label={SORT_LABELS[sort]}
              value={sort}
              options={(Object.keys(SORT_LABELS) as SortKey[]).map((key) => ({ value: key, label: SORT_LABELS[key] }))}
              onSelect={(v) => onChange({ sort: v as SortKey })}
            />
          </div>
        </div>

        {hasFilters && (
          <div className="mt-3 flex justify-end">
            <Button variant="ghost" size="sm" onClick={onClear} className="gap-1.5 text-muted-foreground">
              <X className="h-3.5 w-3.5" /> Clear filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function FilterMenu({
  label, value, options, onSelect,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onSelect: (value: string) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="h-10 w-full justify-between px-3 font-normal">
          <span className="truncate">{label}</span>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="max-h-72 w-[var(--radix-dropdown-menu-trigger-width)] overflow-y-auto">
        {options.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onSelect={() => onSelect(option.value)}
            className="justify-between"
          >
            <span className="truncate">{option.label}</span>
            {option.value === value && <Check className="h-4 w-4 text-primary" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
