import { useCallback, useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  User,
  Scissors,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { Badge } from "@/components/ui/badge";
import { StarRating } from "./StarRating";
import { getPostsByTailor, type TailorProfile, type TailorPost } from "@/lib/mock-data";
import { calculateExperienceYears } from "@/lib/utils";

interface Props {
  tailor: TailorProfile | null;
  onClose: () => void;
  /**
   * When provided, posts are filtered from this array instead of
   * reading from the static TAILOR_POSTS_SEED. Pass portfolio-page
   * in-memory state here so newly published posts appear immediately.
   */
  allPosts?: TailorPost[];
}

const relFmt = new Intl.DateTimeFormat("en", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

function relative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86_400_000);
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return relFmt.format(new Date(iso));
}

export function AtelierLightbox({ tailor, onClose, allPosts }: Props) {
  const [api, setApi] = useState<CarouselApi | null>(null);
  const [current, setCurrent] = useState(0);
  const [posts, setPosts] = useState<TailorPost[]>([]);

  // Refresh filtered posts when the tailor changes OR when allPosts is updated
  // (e.g. tailor publishes a new post from the archive page).
  // We intentionally do NOT reset the slide index here so the carousel
  // position is preserved when allPosts grows while the lightbox is open.
  useEffect(() => {
    if (!tailor) return;
    setPosts(getPostsByTailor(tailor.id, allPosts));
  }, [tailor?.id, allPosts]);

  // Track carousel position
  useEffect(() => {
    if (!api) return;
    const onSelect = () => setCurrent(api.selectedScrollSnap());
    api.on("select", onSelect);
    return () => { api.off("select", onSelect); };
  }, [api]);

  // Reset carousel to slide 0 only when a different tailor's lightbox opens
  useEffect(() => {
    if (!api || !tailor) return;
    api.scrollTo(0, true);
    setCurrent(0);
  }, [api, tailor?.id]);

  const scrollPrev = useCallback(() => api?.scrollPrev(), [api]);
  const scrollNext = useCallback(() => api?.scrollNext(), [api]);

  // Keyboard navigation (← →)
  useEffect(() => {
    if (!tailor) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft")  scrollPrev();
      if (e.key === "ArrowRight") scrollNext();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [tailor, scrollPrev, scrollNext]);

  const experienceYears = tailor ? calculateExperienceYears(tailor.experienceStartDate) : 0;
  const total = posts.length;

  return (
    <Dialog open={!!tailor} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        className="max-w-2xl w-full p-0 overflow-hidden gap-0"
        aria-label={tailor ? `${tailor.atelier} photo gallery` : "Gallery"}
      >
        {tailor && (
          <>
            {/* ── Accessible labelling ────────────────────────────────── */}
            <DialogTitle className="sr-only">
              {tailor.atelier} — commission gallery
            </DialogTitle>
            <DialogDescription className="sr-only">
              {total} recent commissions from {tailor.atelier}. Use arrow keys or
              the on-screen buttons to browse.
            </DialogDescription>

            {/* ── Tailor header strip ─────────────────────────────────── */}
            <div
              className="relative flex items-center gap-4 px-6 py-5 border-b border-border/60"
              style={{
                background: `linear-gradient(135deg, ${tailor.coverGradient.match(/oklch\([^)]+\)/g)?.[0] ?? "oklch(0.30 0.08 160)"} 0%, transparent 100%)`,
              }}
            >
              {/* Avatar circle */}
              <div
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-primary-foreground font-display text-xl shadow ring-2 ring-background"
                style={{ background: tailor.avatarGradient }}
                aria-hidden
              >
                {tailor.initials}
              </div>

              <div className="min-w-0 flex-1">
                <h2 className="font-display text-2xl text-primary leading-tight truncate">
                  {tailor.atelier}
                </h2>
                <p className="text-sm text-foreground/70 truncate">{tailor.tailorName}</p>
                <div className="mt-1.5 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    {tailor.city}, {tailor.country}
                  </span>
                  <span className="text-muted-foreground/40 text-xs">·</span>
                  <StarRating value={tailor.rating} size={11} showValue reviewCount={tailor.reviewCount} />
                  <span className="text-muted-foreground/40 text-xs">·</span>
                  <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                    <Scissors className="h-3 w-3" />
                    {experienceYears} yrs
                  </span>
                </div>
              </div>

              {/* Specialty badge */}
              <Badge
                className="hidden sm:inline-flex shrink-0 bg-background/80 text-primary border border-border hover:bg-background/80"
              >
                {tailor.specialty}
              </Badge>
            </div>

            {/* ── Carousel area ───────────────────────────────────────── */}
            {total === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center px-6">
                <div className="grid h-14 w-14 place-items-center rounded-full bg-muted text-muted-foreground mb-4">
                  <Scissors className="h-6 w-6" />
                </div>
                <p className="font-display text-xl text-primary">No commissions yet</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  This atelier hasn't published any work yet.
                </p>
              </div>
            ) : (
              <div className="relative select-none">
                <Carousel
                  setApi={setApi}
                  opts={{ loop: true, align: "center" }}
                  className="w-full"
                >
                  <CarouselContent>
                    {posts.map((post) => (
                      <CarouselItem key={post.id}>
                        <SlideContent post={post} />
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                </Carousel>

                {/* Prev / Next buttons — overlaid on the image area */}
                {total > 1 && (
                  <>
                    <button
                      onClick={scrollPrev}
                      className="absolute left-3 top-[40%] -translate-y-1/2 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-background/80 backdrop-blur-sm border border-border shadow transition hover:bg-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      aria-label="Previous commission"
                    >
                      <ChevronLeft className="h-5 w-5 text-primary" />
                    </button>
                    <button
                      onClick={scrollNext}
                      className="absolute right-3 top-[40%] -translate-y-1/2 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-background/80 backdrop-blur-sm border border-border shadow transition hover:bg-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      aria-label="Next commission"
                    >
                      <ChevronRight className="h-5 w-5 text-primary" />
                    </button>
                  </>
                )}

                {/* Dot indicators */}
                {total > 1 && (
                  <div
                    className="flex items-center justify-center gap-1.5 py-3"
                    aria-label={`Slide ${current + 1} of ${total}`}
                  >
                    {posts.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => api?.scrollTo(i)}
                        aria-label={`Go to slide ${i + 1}`}
                        className={`h-1.5 rounded-full transition-all focus:outline-none ${
                          i === current
                            ? "w-6 bg-primary"
                            : "w-1.5 bg-primary/25 hover:bg-primary/50"
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── Footer: counter ─────────────────────────────────────── */}
            <div className="flex items-center justify-between border-t border-border/60 px-6 py-4 bg-muted/30">
              <p className="text-xs text-muted-foreground">
                {total > 0
                  ? `${current + 1} / ${total} commissions`
                  : "No commissions yet"}
              </p>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

/* ── Individual slide ───────────────────────────────────────────────────── */

function SlideContent({ post }: { post: TailorPost }) {
  return (
    <div className="flex flex-col">
      {/* Photo or gradient */}
      <div
        className="relative aspect-[16/9] w-full overflow-hidden"
        style={!post.imageUrl ? { background: post.imageGradient } : undefined}
      >
        {post.imageUrl && (
          <img
            src={post.imageUrl}
            alt={post.title}
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

        {/* Title overlay */}
        <div className="absolute bottom-0 left-0 right-0 px-5 pb-4 pt-10">
          <h3 className="font-display text-2xl text-white leading-tight drop-shadow">
            {post.title}
          </h3>
        </div>
      </div>

      {/* Post metadata + description */}
      <div className="flex items-start gap-3 px-5 py-4">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary mt-0.5">
          <User className="h-3.5 w-3.5" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-foreground">{post.customerName}</span>
            <span className="text-xs text-muted-foreground">{relative(post.createdAt)}</span>
          </div>
          <p className="mt-1 text-sm leading-relaxed text-foreground/75 line-clamp-3">
            {post.description}
          </p>
        </div>
      </div>
    </div>
  );
}
