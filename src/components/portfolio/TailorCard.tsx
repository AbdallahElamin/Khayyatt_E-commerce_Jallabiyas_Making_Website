import { MapPin, Scissors } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StarRating } from "./StarRating";
import type { TailorProfile } from "@/lib/mock-data";
import { calculateExperienceYears } from "@/lib/utils";

interface Props {
  tailor: TailorProfile;
  /** Called when the card is clicked — the parent mounts the lightbox. */
  onOpen: (tailor: TailorProfile) => void;
}

export function TailorCard({ tailor, onOpen }: Props) {
  const experienceYears = calculateExperienceYears(tailor.experienceStartDate);

  return (
    <button
      type="button"
      onClick={() => onOpen(tailor)}
      className="group block w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-xl"
      aria-label={`Preview ${tailor.atelier}`}
    >
      <Card className="h-full overflow-hidden border-border transition-all group-hover:border-accent group-hover:shadow-[var(--shadow-luxe)] group-hover:-translate-y-0.5">
        {/* Cover gradient + specialty badge */}
        <div className="relative h-44" style={{ background: tailor.coverGradient }}>
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
          <Scissors className="absolute right-4 top-4 h-6 w-6 text-primary-foreground/80" />
          <Badge className="absolute left-4 bottom-4 bg-background/90 text-primary border border-border hover:bg-background/90">
            {tailor.specialty}
          </Badge>

          {/* Subtle "click to preview" hint that appears on hover */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="rounded-full bg-black/50 backdrop-blur-sm px-3 py-1.5 text-xs text-white font-medium tracking-wide">
              Preview gallery
            </span>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-3">
          <div>
            <h3 className="font-display text-2xl text-primary leading-tight">{tailor.atelier}</h3>
            <p className="text-sm text-muted-foreground">{tailor.tailorName}</p>
          </div>
          <StarRating value={tailor.rating} showValue reviewCount={tailor.reviewCount} />
          <div className="flex items-center justify-between pt-1">
            <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" />
              {tailor.city}, {tailor.country}
            </span>
            <span className="text-xs uppercase tracking-wider text-accent-foreground">
              {experienceYears} yrs
            </span>
          </div>
        </div>
      </Card>
    </button>
  );
}
