import { Star, StarHalf } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  value: number; // 0–5
  size?: number;
  showValue?: boolean;
  reviewCount?: number;
  className?: string;
}

export function StarRating({ value, size = 14, showValue = false, reviewCount, className }: Props) {
  const full = Math.floor(value);
  const hasHalf = value - full >= 0.25 && value - full < 0.75;
  const fullOut = value - full >= 0.75 ? full + 1 : full;
  const empty = 5 - fullOut - (hasHalf ? 1 : 0);

  return (
    <div className={cn("inline-flex items-center gap-1.5", className)}>
      <div className="inline-flex items-center text-accent">
        {Array.from({ length: fullOut }).map((_, i) => (
          <Star key={`f-${i}`} style={{ width: size, height: size }} className="fill-accent text-accent" />
        ))}
        {hasHalf && (
          <StarHalf style={{ width: size, height: size }} className="fill-accent text-accent" />
        )}
        {Array.from({ length: empty }).map((_, i) => (
          <Star key={`e-${i}`} style={{ width: size, height: size }} className="text-accent/40" />
        ))}
      </div>
      {showValue && (
        <span className="text-sm text-foreground/80">
          {value.toFixed(1)}
          {typeof reviewCount === "number" && (
            <span className="text-muted-foreground"> ({reviewCount})</span>
          )}
        </span>
      )}
    </div>
  );
}
