import { useState } from "react";
import { MapPin, Star, Calendar } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import type { TailorProfile } from "@/lib/mock-data";

interface Props {
  tailor: TailorProfile;
  displayName: string;
  avatarUrl: string | null;
}

export function ProfileHeader({ tailor, displayName, avatarUrl }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <header className="relative">
      <div
        className="h-56 w-full sm:h-72"
        style={{ background: tailor.coverGradient }}
      >
        <div className="h-full w-full bg-gradient-to-t from-black/40 via-transparent to-transparent" />
      </div>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="-mt-16 flex flex-col items-start gap-5 sm:-mt-20 sm:flex-row sm:items-end sm:gap-7">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="rounded-full ring-4 ring-background transition hover:ring-accent focus:outline-none focus:ring-accent"
            aria-label="View profile picture"
          >
            <Avatar className="h-32 w-32 sm:h-40 sm:w-40 shadow-[var(--shadow-luxe)]">
              {avatarUrl && <AvatarImage src={avatarUrl} alt={tailor.atelier} />}
              <AvatarFallback
                className="text-3xl font-display text-primary-foreground"
                style={{ background: tailor.avatarGradient }}
              >
                {tailor.initials}
              </AvatarFallback>
            </Avatar>
          </button>

          <div className="flex-1 pb-2">
            <h1 className="font-display text-4xl text-primary sm:text-5xl leading-tight">
              {tailor.atelier}
            </h1>
            <p className="mt-1 text-lg text-foreground/80">{displayName}</p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="gap-1 border-accent/40">
                <MapPin className="h-3 w-3" /> {tailor.city}, {tailor.country}
              </Badge>
              <Badge variant="outline" className="gap-1 border-accent/40">
                <Star className="h-3 w-3 fill-accent text-accent" />
                {tailor.rating.toFixed(1)} · {tailor.reviewCount} reviews
              </Badge>
              <Badge variant="outline" className="gap-1 border-accent/40">
                <Calendar className="h-3 w-3" /> {tailor.years} yrs of craft
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md p-0 bg-transparent border-0 shadow-none">
          <DialogTitle className="sr-only">{tailor.atelier} profile picture</DialogTitle>
          <div
            className="aspect-square w-full rounded-full overflow-hidden shadow-[var(--shadow-luxe)]"
            style={{ background: tailor.avatarGradient }}
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt={tailor.atelier} className="h-full w-full object-cover" />
            ) : (
              <div className="grid h-full w-full place-items-center font-display text-8xl text-primary-foreground">
                {tailor.initials}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </header>
  );
}
