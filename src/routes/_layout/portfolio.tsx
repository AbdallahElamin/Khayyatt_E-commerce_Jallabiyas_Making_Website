import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { LayoutGrid, Loader2, Plus, SearchX } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Ornament } from "@/components/ui/ornament";
import {
  TAILOR_POSTS_SEED,
  TAILOR_PROFILES,
  type TailorPost,
  type TailorProfile,
} from "@/lib/mock-data";
import { useApp } from "@/context/AppContext";
import { TailorCard } from "@/components/portfolio/TailorCard";
import { AtelierLightbox } from "@/components/portfolio/AtelierLightbox";
import { TailorArchivePostDialog } from "@/components/portfolio/TailorArchivePostDialog";
import { PortfolioFilters, type SortKey } from "@/components/portfolio/PortfolioFilters";
import { supabase } from "@/lib/supabase";
import { calculateExperienceYears } from "@/lib/utils";

export const Route = createFileRoute("/_layout/portfolio")({
  head: () => ({
    meta: [
      { title: "Portfolio Archive — Khayyat" },
      { name: "description", content: "Discover master tailors across the region. Filter by city, style, and rating." },
      { property: "og:title", content: "Portfolio Archive — Khayyat" },
      { property: "og:description", content: "Curated ateliers from Marrakech to Istanbul." },
    ],
  }),
  component: PortfolioArchive,
});

const ALL = "__all";

// Cover gradient palette cycled for real accounts that have no stored gradient
const COVER_GRADIENTS = [
  "linear-gradient(135deg, oklch(0.78 0.15 70), oklch(0.45 0.13 30))",   // saffron
  "linear-gradient(135deg, oklch(0.30 0.08 160), oklch(0.55 0.13 160))", // emerald
  "linear-gradient(135deg, oklch(0.82 0.13 85), oklch(0.62 0.14 60))",   // gold
  "linear-gradient(135deg, oklch(0.78 0.10 20), oklch(0.55 0.15 0))",    // rose
  "linear-gradient(135deg, oklch(0.30 0.10 270), oklch(0.55 0.16 280))", // indigo
  "linear-gradient(135deg, oklch(0.40 0.10 175), oklch(0.65 0.12 170))", // jade
  "linear-gradient(135deg, oklch(0.88 0.05 80), oklch(0.70 0.08 70))",   // sand
  "linear-gradient(135deg, oklch(0.55 0.14 45), oklch(0.35 0.10 30))",   // copper
];

const AVATAR_GRADIENTS = [
  "linear-gradient(135deg, oklch(0.30 0.08 160), oklch(0.55 0.13 160))",
  "linear-gradient(135deg, oklch(0.78 0.10 20), oklch(0.55 0.15 0))",
  "linear-gradient(135deg, oklch(0.82 0.13 85), oklch(0.62 0.14 60))",
  "linear-gradient(135deg, oklch(0.30 0.10 270), oklch(0.55 0.16 280))",
];

/** Map a Supabase profiles row (role=tailor) to the TailorProfile shape. */
function dbRowToProfile(row: any, index: number): TailorProfile {
  const fullName: string = row.full_name ?? "";
  const parts = fullName.trim().split(/\s+/);
  const initials =
    parts.length >= 2
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : fullName.slice(0, 2).toUpperCase() || "?";

  const city = row.location_address
    ? (row.location_address as string).split(",")[0].trim()
    : "—";
  const country = row.location_address
    ? (row.location_address as string).split(",").slice(1).join(",").trim()
    : "—";

  const experienceStartDate: string = row.experience_start_date ?? "";
  const years = experienceStartDate
    ? calculateExperienceYears(experienceStartDate)
    : 0;

  const rating = typeof row.rating === "number"
    ? row.rating
    : Number(row.rating ?? 0);
  const reviewCount = typeof row.review_count === "number"
    ? row.review_count
    : Number(row.review_count ?? 0);

  return {
    id: row.id,
    atelier: row.atelier_name ?? fullName,
    tailorName: fullName,
    firstName: parts[0] ?? "",
    lastName: parts.slice(1).join(" ") ?? "",
    initials,
    city,
    country,
    specialty: "Jallabiyas", // Default — no specialty column in DB yet
    rating,
    reviewCount,
    years,
    experienceStartDate,
    username: row.username ?? "",
    password: "", // never exposed
    bio: "",
    avatarGradient: AVATAR_GRADIENTS[index % AVATAR_GRADIENTS.length],
    coverGradient: COVER_GRADIENTS[index % COVER_GRADIENTS.length],
    lat: row.location_lat ?? 0,
    lng: row.location_lng ?? 0,
  };
}

function PortfolioArchive() {
  const { role } = useApp();

  // ── real tailor profiles from Supabase ─────────────────────────────────
  const [realProfiles, setRealProfiles] = useState<TailorProfile[]>([]);
  const [loadingReal, setLoadingReal] = useState(true);

  useEffect(() => {
    let cancelled = false;
    supabase
      .from("profiles")
      .select("*")
      .eq("role", "tailor")
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) {
          console.error("Failed to load tailor profiles:", error);
        } else if (data) {
          setRealProfiles(data.map((row, i) => dbRowToProfile(row, i)));
        }
        setLoadingReal(false);
      });
    return () => { cancelled = true; };
  }, []);

  // Merge: real accounts first (they're actual users), then mocks below
  const allProfiles = useMemo(() => {
    // Exclude mock profiles whose id matches a real profile (avoids duplicates
    // if someone registered an account that coincides with mock IDs like "t-1")
    const realIds = new Set(realProfiles.map((p) => p.id));
    const filteredMocks = TAILOR_PROFILES.filter((p) => !realIds.has(p.id));
    return [...realProfiles, ...filteredMocks];
  }, [realProfiles]);

  // ── filter / sort state ────────────────────────────────────────────────
  const [q, setQ] = useState("");
  const [city, setCity] = useState<string>(ALL);
  const [specialty, setSpecialty] = useState<string>(ALL);
  const [sort, setSort] = useState<SortKey>("rating");

  // ── lightbox state ─────────────────────────────────────────────────────
  const [lightbox, setLightbox] = useState<TailorProfile | null>(null);

  // ── shared posts state — lifted here so the FAB dialog can append
  //    a new post and the lightbox immediately reflects it ────────────────
  const [posts, setPosts] = useState<TailorPost[]>(() => [...TAILOR_POSTS_SEED]);

  // ── tailor FAB / publish dialog state ─────────────────────────────────
  const [postDialogOpen, setPostDialogOpen] = useState(false);

  // ── derived data ───────────────────────────────────────────────────────
  const cities = useMemo(
    () => [...new Set(allProfiles.map((t) => t.city))].sort(),
    [allProfiles],
  );
  const specialties = useMemo(
    () => [...new Set(allProfiles.map((t) => t.specialty))].sort(),
    [allProfiles],
  );

  const results = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const filtered = allProfiles.filter((t) => {
      if (city !== ALL && t.city !== city) return false;
      if (specialty !== ALL && t.specialty !== specialty) return false;
      if (!needle) return true;
      return [t.atelier, t.tailorName, t.city, t.country, t.specialty]
        .some((v) => v.toLowerCase().includes(needle));
    });
    return filtered.sort((a, b) => {
      if (sort === "rating") return b.rating - a.rating || b.reviewCount - a.reviewCount;
      if (sort === "experience") return b.years - a.years;
      return a.atelier.localeCompare(b.atelier);
    });
  }, [q, city, specialty, sort, allProfiles]);

  const hasFilters = q !== "" || city !== ALL || specialty !== ALL || sort !== "rating";

  const clear = () => {
    setQ(""); setCity(ALL); setSpecialty(ALL); setSort("rating");
  };

  // ── publish handler ────────────────────────────────────────────────────
  const handlePublish = (post: TailorPost) => {
    setPosts((prev) => [post, ...prev]);
    toast.success("Post published — it will appear in your atelier gallery.");
  };

  return (
    <div className="min-h-screen">
      <section className="mx-auto max-w-7xl px-4 pt-12 pb-2 sm:px-6 lg:px-8">
        <div className="flex items-start gap-4">
          <span className="grid h-12 w-12 place-items-center rounded-full bg-primary text-primary-foreground shrink-0">
            <LayoutGrid className="h-5 w-5" />
          </span>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-accent-foreground">Browse</p>
            <h1 className="font-display text-4xl text-primary sm:text-5xl">Portfolio Archive</h1>
            <Ornament className="mt-3 h-3 w-40 text-accent" />
            <p className="mt-4 max-w-2xl text-muted-foreground">
              Every commissioned Jallabiya, by every master tailor on Khayyat.
              Filter by region, style, and reputation.
            </p>
          </div>
        </div>
      </section>

      <PortfolioFilters
        q={q}
        city={city}
        specialty={specialty}
        sort={sort}
        cities={cities}
        specialties={specialties}
        onChange={(n) => {
          if (n.q !== undefined) setQ(n.q);
          if (n.city !== undefined) setCity(n.city);
          if (n.specialty !== undefined) setSpecialty(n.specialty);
          if (n.sort !== undefined) setSort(n.sort);
        }}
        onClear={clear}
        hasFilters={hasFilters}
      />

      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            {loadingReal && (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground/60" />
            )}
            {results.length} {results.length === 1 ? "atelier" : "ateliers"} found
            {realProfiles.length > 0 && (
              <span className="text-xs text-accent-foreground">
                ({realProfiles.length} registered{realProfiles.length === 1 ? "" : ""})
              </span>
            )}
          </p>
        </div>

        {results.length === 0 && !loadingReal ? (
          <div className="rounded-xl border border-dashed border-border bg-card/50 py-20 text-center">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-muted text-muted-foreground">
              <SearchX className="h-5 w-5" />
            </div>
            <p className="mt-4 font-display text-2xl text-primary">No ateliers match</p>
            <p className="mt-1 text-sm text-muted-foreground">Try a different search or clear the filters.</p>
            <Button onClick={clear} variant="outline" className="mt-5">Reset filters</Button>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((t) => (
              <TailorCard key={t.id} tailor={t} onOpen={setLightbox} />
            ))}
          </div>
        )}
      </section>

      {/* Lightbox — mounted once, driven by selectedTailor.
          allPosts is passed so newly published posts appear immediately. */}
      <AtelierLightbox
        tailor={lightbox}
        onClose={() => setLightbox(null)}
        allPosts={posts}
      />

      {/* ── Tailor-only: floating "Add Post" action button ───────────── */}
      {role === "tailor" && (
        <>
          {/* FAB with animated label on hover */}
          <div className="fixed bottom-6 right-6 z-40 flex items-center gap-3 group">
            <span className="rounded-full bg-background/95 px-3.5 py-1.5 text-xs font-medium text-primary shadow-[var(--shadow-elevated)] opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 pointer-events-none select-none">
              Add atelier post
            </span>
            <button
              type="button"
              id="tailor-add-post-fab"
              onClick={() => setPostDialogOpen(true)}
              className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[var(--shadow-luxe)] transition-transform hover:scale-105 hover:bg-primary/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              aria-label="Add atelier post"
            >
              <Plus className="h-6 w-6" />
            </button>
          </div>

          {/* Publish dialog */}
          <TailorArchivePostDialog
            open={postDialogOpen}
            onClose={() => setPostDialogOpen(false)}
            onPublish={handlePublish}
          />
        </>
      )}
    </div>
  );
}
