/**
 * TailorArchivePostDialog
 *
 * A simplified "quick publish" form for tailor-role users on the Portfolio Archive
 * page.  Only two fields are presented to the user:
 *   1. Photo upload  (single or multiple images, up to 5)
 *   2. Style         (one of the 8 colour gradients from POST_GRADIENTS)
 *
 * Atelier details are derived directly from the logged-in UserProfile (real
 * Supabase data) — no longer dependent on the legacy getTailorById() mock lookup.
 */

import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  Check,
  ImagePlus,
  Info,
  MapPin,
  Scissors,
  Star,
  Upload,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useApp } from "@/context/AppContext";
import { POST_GRADIENTS, type TailorPost } from "@/lib/mock-data";
import { calculateExperienceYears } from "@/lib/utils";

interface Props {
  open: boolean;
  onClose: () => void;
  /** Called with the fully-constructed TailorPost on successful submission. */
  onPublish: (post: TailorPost) => void;
}

type PhotoEntry = { file: File; url: string };

const MAX_PHOTOS = 5;

export function TailorArchivePostDialog({ open, onClose, onPublish }: Props) {
  const { user } = useApp();

  // Derive the tailor's identity directly from the real UserProfile.
  // `user.atelier_name` and `user.experience_start_date` come from Supabase.
  const hasProfile = !!(user.id && user.role === "tailor" && user.atelier_name);

  // ── form state ──────────────────────────────────────────────────────────
  const [photos, setPhotos] = useState<PhotoEntry[]>([]);
  const [styleId, setStyleId] = useState(POST_GRADIENTS[2].id); // Saffron default
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset the form each time the dialog opens / closes
  useEffect(() => {
    if (open) {
      setPhotos([]);
      setStyleId(POST_GRADIENTS[2].id);
      setDragOver(false);
    } else {
      // Revoke object URLs we own to avoid memory leaks
      photos.forEach((p) => URL.revokeObjectURL(p.url));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // ── photo helpers ────────────────────────────────────────────────────────
  const addFiles = (files: FileList | null) => {
    if (!files) return;
    const accepted = Array.from(files).filter((f) =>
      f.type.startsWith("image/"),
    );
    const next = accepted
      .map((f) => ({ file: f, url: URL.createObjectURL(f) }))
      .slice(0, MAX_PHOTOS - photos.length);
    if (next.length) setPhotos((prev) => [...prev, ...next]);
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => {
      URL.revokeObjectURL(prev[index].url);
      return prev.filter((_, i) => i !== index);
    });
  };

  // ── submit ───────────────────────────────────────────────────────────────
  const selectedStyle =
    POST_GRADIENTS.find((g) => g.id === styleId) ?? POST_GRADIENTS[0];

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!hasProfile) return;

    const expYears = user.experience_start_date
      ? calculateExperienceYears(user.experience_start_date)
      : 0;
    const firstPhoto = photos[0];

    // Build author line from real profile
    const nameParts = (user.full_name ?? user.name ?? "").trim().split(/\s+/);
    const authorLabel =
      nameParts.length >= 2
        ? `${nameParts[0]} ${nameParts[nameParts.length - 1].charAt(0)}.`
        : (user.full_name ?? user.name ?? "Tailor");

    const ratingLine =
      user.rating > 0
        ? `, rated ${user.rating.toFixed(1)} by ${user.review_count} customers`
        : "";

    const post: TailorPost = {
      id: crypto.randomUUID(),
      tailorId: user.id,
      title: `${selectedStyle.label} Commission`,
      description:
        `A new commission from ${user.atelier_name}, ${user.location_address ?? ""}. ` +
        `${expYears} years of craft${ratingLine}.`,
      imageGradient: selectedStyle.gradient,
      imageUrl: firstPhoto?.url, // first photo only; gradient is fallback
      customerName: authorLabel,
      createdAt: new Date().toISOString(),
    };

    onPublish(post);
    onClose();
  };

  // ── computed display values ──────────────────────────────────────────────
  const expYears = user.experience_start_date
    ? calculateExperienceYears(user.experience_start_date)
    : null;

  const ratingDisplay =
    user.rating > 0 ? `${user.rating.toFixed(1)} / 5` : "—";

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl text-primary">
            Add atelier post
          </DialogTitle>
          <DialogDescription>
            Upload your commission photo and choose a style — your atelier
            details are filled in automatically.
          </DialogDescription>
        </DialogHeader>

        <form
          id="tailor-archive-post-form"
          onSubmit={submit}
          className="space-y-5 py-1"
        >
          {/* ── Photo upload ─────────────────────────────────────────── */}
          <div className="space-y-2">
            <Label>
              Photos{" "}
              <span className="text-muted-foreground font-normal">
                (optional — up to {MAX_PHOTOS})
              </span>
            </Label>

            {/* Drop zone */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                addFiles(e.dataTransfer.files);
              }}
              disabled={photos.length >= MAX_PHOTOS}
              className={cn(
                "flex w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed py-8 text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                dragOver
                  ? "border-accent bg-accent/5 text-accent"
                  : photos.length >= MAX_PHOTOS
                    ? "cursor-not-allowed border-border bg-muted/20 text-muted-foreground/50"
                    : "border-border bg-muted/30 text-muted-foreground hover:border-primary/50 hover:bg-muted/50",
              )}
            >
              <ImagePlus className="h-8 w-8" />
              <span className="font-medium">
                {photos.length >= MAX_PHOTOS
                  ? "Maximum photos reached"
                  : "Click or drag to upload"}
              </span>
              <span className="text-xs">JPEG · PNG · WebP</span>
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => addFiles(e.target.files)}
            />

            {/* Thumbnail previews */}
            {photos.length > 0 && (
              <div className="grid grid-cols-5 gap-2">
                {photos.map((p, i) => (
                  <div
                    key={p.url}
                    className="group relative aspect-square overflow-hidden rounded-md border border-border"
                  >
                    <img
                      src={p.url}
                      alt={`Photo ${i + 1}`}
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(i)}
                      className="absolute inset-0 flex items-center justify-center bg-black/55 opacity-0 transition-opacity group-hover:opacity-100 focus:outline-none"
                      aria-label={`Remove photo ${i + 1}`}
                    >
                      <X className="h-4 w-4 text-white" />
                    </button>
                  </div>
                ))}

                {/* "Add more" thumbnail */}
                {photos.length < MAX_PHOTOS && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-square flex items-center justify-center rounded-md border-2 border-dashed border-border text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary focus:outline-none"
                    aria-label="Add more photos"
                  >
                    <Upload className="h-4 w-4" />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* ── Style picker — label always visible below each swatch ── */}
          <div className="space-y-2">
            <Label>Style</Label>
            <div className="grid grid-cols-4 gap-2">
              {POST_GRADIENTS.map((g) => {
                const active = styleId === g.id;
                return (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setStyleId(g.id)}
                    className={cn(
                      "group flex flex-col items-center gap-1.5 rounded-lg border-2 p-1 pb-2 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      active
                        ? "border-accent shadow-[var(--shadow-luxe)] scale-[1.03] bg-accent/5"
                        : "border-transparent hover:border-primary/30 hover:bg-muted/30",
                    )}
                    aria-label={g.label}
                    aria-pressed={active}
                    title={g.label}
                  >
                    {/* Colour swatch */}
                    <div
                      className="relative h-10 w-full rounded-md"
                      style={{ background: g.gradient }}
                    >
                      {active && (
                        <span className="absolute inset-0 flex items-center justify-center">
                          <Check className="h-3.5 w-3.5 text-white drop-shadow" />
                        </span>
                      )}
                    </div>
                    {/* Always-visible label */}
                    <span
                      className={cn(
                        "text-[11px] font-medium leading-none",
                        active ? "text-primary" : "text-muted-foreground",
                      )}
                    >
                      {g.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Auto-filled profile summary ──────────────────────────── */}
          {hasProfile ? (
            <div className="rounded-lg border border-border bg-muted/20 px-4 py-3">
              <div className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <Info className="h-3 w-3" />
                Auto-filled from your profile
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                <InfoRow label="Atelier" value={user.atelier_name ?? "—"} />
                <InfoRow
                  label="Location"
                  value={user.location_address ?? "—"}
                  icon={<MapPin className="h-3 w-3" />}
                />
                <InfoRow
                  label="Experience"
                  value={expYears !== null ? `${expYears} yrs` : "—"}
                  icon={<Scissors className="h-3 w-3" />}
                />
                <InfoRow
                  label="Rating"
                  value={ratingDisplay}
                  icon={<Star className="h-3 w-3 fill-accent text-accent" />}
                />
              </div>
            </div>
          ) : (
            /* Shown only if the tailor account has no atelier_name set */
            <p className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
              Your tailor profile is incomplete. Please set your atelier name in
              your profile settings before publishing a post.
            </p>
          )}
        </form>

        <DialogFooter>
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="tailor-archive-post-form"
            disabled={!hasProfile}
            className="bg-primary text-primary-foreground"
          >
            Publish post
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ── Small helper ─────────────────────────────────────────────────────────── */

function InfoRow({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-1.5">
      {icon && <span className="text-muted-foreground">{icon}</span>}
      <span className="text-muted-foreground">{label}:</span>
      <span className="font-medium text-foreground truncate">{value}</span>
    </div>
  );
}
