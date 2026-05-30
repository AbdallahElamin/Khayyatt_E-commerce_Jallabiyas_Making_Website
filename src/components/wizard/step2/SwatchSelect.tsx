import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import type { SwatchOption } from "@/lib/wizard-data";
import { cn } from "@/lib/utils";

export function SwatchSelect({
  label,
  value,
  onChange,
  options,
  inStock,
  placeholder = "Select…",
}: {
  label: string;
  value?: string;
  onChange: (v: string) => void;
  options: SwatchOption[];
  /** Set of in-stock option ids. */
  inStock: string[];
  placeholder?: string;
}) {
  const inStockSet = new Set(inStock);
  const selected = options.find((o) => o.id === value);

  return (
    <div>
      <Label className="mb-2 block text-xs uppercase tracking-wider text-muted-foreground">
        {label}
      </Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="h-12">
          <SelectValue placeholder={placeholder}>
            {selected && (
              <div className="flex items-center gap-3">
                <span
                  className="h-6 w-6 rounded border border-border"
                  style={{ background: selected.swatch }}
                />
                <span>{selected.label}</span>
              </div>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => {
            const available = inStockSet.has(o.id);
            return (
              <SelectItem
                key={o.id}
                value={o.id}
                disabled={!available}
                className={cn(!available && "opacity-40")}
              >
                <div className="flex w-full items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span
                      className={cn(
                        "h-6 w-6 rounded border border-border",
                        !available && "grayscale",
                      )}
                      style={{ background: o.swatch }}
                    />
                    <span>{o.label}</span>
                  </div>
                  {!available && (
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      Out of stock
                    </span>
                  )}
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
}
