export type Role = "customer" | "tailor" | "admin";

export interface MockUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  initials: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  location?: { lat: number; lng: number; address: string };
  marketName?: string;
  /** Tailor: the portfolio id this user owns. */
  tailorId?: string;
}

export const MOCK_USERS: Record<Role, MockUser> = {
  customer: {
    id: "u-1",
    name: "Amira Hassan",
    firstName: "Amira",
    lastName: "Hassan",
    username: "amira_h",
    email: "amira@example.com",
    role: "customer",
    initials: "AH",
    location: { lat: 31.6295, lng: -7.9811, address: "Marrakech, Morocco" },
  },
  tailor: {
    id: "u-2",
    name: "Master Khalil",
    firstName: "Khalil",
    lastName: "Benali",
    username: "master_khalil",
    email: "khalil@khayyat.app",
    role: "tailor",
    initials: "MK",
    marketName: "Atelier Khalil",
    location: { lat: 31.6295, lng: -7.9811, address: "Marrakech, Morocco" },
    tailorId: "t-1",
  },
  admin: {
    id: "u-3",
    name: "Yasmin Admin",
    firstName: "Yasmin",
    lastName: "Idrissi",
    username: "yasmin_admin",
    email: "yasmin@khayyat.app",
    role: "admin",
    initials: "YA",
  },
};

export interface FeaturedTailor {
  id: string;
  name: string;
  city: string;
  specialty: string;
  rating: number;
  years: number;
}

export const FEATURED_TAILORS: FeaturedTailor[] = [
  { id: "t-1", name: "Atelier Khalil", city: "Marrakech", specialty: "Embroidered Jallabiyas", rating: 4.9, years: 22 },
  { id: "t-2", name: "Beit Al-Hareer",  city: "Cairo",     specialty: "Silk & Linen Cuts",      rating: 4.8, years: 15 },
  { id: "t-3", name: "Dar Al-Khayyat",  city: "Amman",     specialty: "Bridal & Ceremonial",    rating: 5.0, years: 30 },
];

export interface TopDesign {
  id: string;
  title: string;
  tailorName: string;
  city: string;
  likes: number;
  gradient: string;
}

export const TOP_DESIGNS: TopDesign[] = [
  { id: "d-1", title: "Saffron Dunes",  tailorName: "Atelier Khalil",  city: "Marrakech", likes: 1284, gradient: "linear-gradient(135deg, oklch(0.72 0.14 70), oklch(0.45 0.11 30))" },
  { id: "d-2", title: "Emerald Nights", tailorName: "Beit Al-Hareer",  city: "Cairo",     likes: 968,  gradient: "linear-gradient(135deg, oklch(0.30 0.08 160), oklch(0.55 0.13 160))" },
  { id: "d-3", title: "Pearl & Ivory",  tailorName: "Dar Al-Khayyat",  city: "Amman",     likes: 1502, gradient: "linear-gradient(135deg, oklch(0.92 0.04 85), oklch(0.78 0.13 80))" },
];

export interface ManagedTailor {
  id: string;
  fullName: string;
  atelier: string;
  email: string;
  username: string;
  password: string;
  /** ISO date string — the date the tailor started their professional career. */
  experienceStartDate: string;
  city: string;
  /** WGS84 coordinates of the tailor's atelier. */
  location: { lat: number; lng: number; address: string } | null;
  bannedUntil: string | null;
}

export const MANAGED_TAILORS_SEED: ManagedTailor[] = [
  {
    id: "mt-1", fullName: "Khalil Benali",  atelier: "Atelier Khalil",  email: "khalil@khayyat.app",
    username: "master_khalil",  password: "khayyat_2024!",
    experienceStartDate: "2002-03-15",
    city: "Marrakech", location: { lat: 31.6295, lng: -7.9811, address: "Marrakech, Morocco" },
    bannedUntil: null,
  },
  {
    id: "mt-2", fullName: "Layla Mansour",  atelier: "Beit Al-Hareer",  email: "layla@khayyat.app",
    username: "layla_beithareer", password: "khayyat_2024!",
    experienceStartDate: "2009-06-01",
    city: "Cairo", location: { lat: 30.0444, lng: 31.2357, address: "Cairo, Egypt" },
    bannedUntil: null,
  },
  {
    id: "mt-3", fullName: "Ibrahim Nassar", atelier: "Dar Al-Khayyat",  email: "ibrahim@khayyat.app",
    username: "ibrahim_dkhayyat", password: "khayyat_2024!",
    experienceStartDate: "1994-01-10",
    city: "Amman", location: { lat: 31.9539, lng: 35.9106, address: "Amman, Jordan" },
    bannedUntil: null,
  },
  {
    id: "mt-4", fullName: "Sami Haddad",    atelier: "Haddad & Sons",   email: "sami@khayyat.app",
    username: "sami_haddad",    password: "khayyat_2024!",
    experienceStartDate: "2006-09-20",
    city: "Beirut", location: { lat: 33.8886, lng: 35.4955, address: "Beirut, Lebanon" },
    bannedUntil: null,
  },
];

export const PLATFORM_STATS = {
  customers: 1840,
  ordersThisMonth: 312,
};

/* ---------- Portfolio archive + tailor profiles ---------- */

export interface TailorProfile {
  id: string;
  atelier: string;
  tailorName: string;
  firstName: string;
  lastName: string;
  initials: string;
  city: string;
  country: string;
  specialty: string;
  rating: number;
  reviewCount: number;
  /**
   * @deprecated Use `experienceStartDate` + `calculateExperienceYears()` instead.
   * Kept for backward-compat with seed data that predates the date field.
   */
  years: number;
  /** ISO date string — the date this tailor started their professional career. */
  experienceStartDate: string;
  /** Account credentials provisioned by admin. */
  username: string;
  password: string;
  bio: string;
  avatarGradient: string;
  coverGradient: string;
  /** Approximate geographic centre of the tailor's atelier (WGS84). */
  lat: number;
  lng: number;
}

const G = {
  emerald: "linear-gradient(135deg, oklch(0.30 0.08 160), oklch(0.55 0.13 160))",
  gold:    "linear-gradient(135deg, oklch(0.82 0.13 85), oklch(0.62 0.14 60))",
  saffron: "linear-gradient(135deg, oklch(0.78 0.15 70), oklch(0.45 0.13 30))",
  rose:    "linear-gradient(135deg, oklch(0.78 0.10 20), oklch(0.55 0.15 0))",
  indigo:  "linear-gradient(135deg, oklch(0.30 0.10 270), oklch(0.55 0.16 280))",
  jade:    "linear-gradient(135deg, oklch(0.40 0.10 175), oklch(0.65 0.12 170))",
  sand:    "linear-gradient(135deg, oklch(0.88 0.05 80), oklch(0.70 0.08 70))",
  copper:  "linear-gradient(135deg, oklch(0.55 0.14 45), oklch(0.35 0.10 30))",
};

export const POST_GRADIENTS: { id: string; label: string; gradient: string }[] = [
  { id: "g-emerald", label: "Emerald",  gradient: G.emerald },
  { id: "g-gold",    label: "Gold",     gradient: G.gold },
  { id: "g-saffron", label: "Saffron",  gradient: G.saffron },
  { id: "g-rose",    label: "Rose",     gradient: G.rose },
  { id: "g-indigo",  label: "Indigo",   gradient: G.indigo },
  { id: "g-jade",    label: "Jade",     gradient: G.jade },
  { id: "g-sand",    label: "Sand",     gradient: G.sand },
  { id: "g-copper",  label: "Copper",   gradient: G.copper },
];

export const TAILOR_PROFILES: TailorProfile[] = [
  {
    id: "t-1", atelier: "Atelier Khalil", tailorName: "Master Khalil Benali",
    firstName: "Khalil", lastName: "Benali", initials: "KB",
    city: "Marrakech", country: "Morocco", specialty: "Embroidered Jallabiyas",
    rating: 4.9, reviewCount: 214, years: 22,
    experienceStartDate: "2002-03-15",
    username: "master_khalil", password: "khayyat_2024!",
    bio: "Three generations of needle and thread, working the souks of Marrakech with hand-woven cotton and silk. Specialising in heritage embroidery and made-to-measure ceremonial wear.",
    avatarGradient: G.emerald, coverGradient: G.saffron,
    lat: 31.6295, lng: -7.9811,
  },
  {
    id: "t-2", atelier: "Beit Al-Hareer", tailorName: "Layla Mansour",
    firstName: "Layla", lastName: "Mansour", initials: "LM",
    city: "Cairo", country: "Egypt", specialty: "Silk & Linen Cuts",
    rating: 4.8, reviewCount: 189, years: 15,
    experienceStartDate: "2009-06-01",
    username: "layla_beithareer", password: "khayyat_2024!",
    bio: "A modern Cairene atelier reviving Mamluk-era silhouettes with breathable linens and hand-loomed silks.",
    avatarGradient: G.rose, coverGradient: G.gold,
    lat: 30.0444, lng: 31.2357,
  },
  {
    id: "t-3", atelier: "Dar Al-Khayyat", tailorName: "Ibrahim Nassar",
    firstName: "Ibrahim", lastName: "Nassar", initials: "IN",
    city: "Amman", country: "Jordan", specialty: "Bridal & Ceremonial",
    rating: 5.0, reviewCount: 312, years: 30,
    experienceStartDate: "1994-01-10",
    username: "ibrahim_dkhayyat", password: "khayyat_2024!",
    bio: "House of bridal couture in the heart of Amman. Hand-stitched goldwork and pearl beading passed down across three generations.",
    avatarGradient: G.gold, coverGradient: G.indigo,
    lat: 31.9539, lng: 35.9106,
  },
  {
    id: "t-4", atelier: "Haddad & Sons", tailorName: "Sami Haddad",
    firstName: "Sami", lastName: "Haddad", initials: "SH",
    city: "Beirut", country: "Lebanon", specialty: "Modern Menswear",
    rating: 4.6, reviewCount: 142, years: 18,
    experienceStartDate: "2006-09-20",
    username: "sami_haddad", password: "khayyat_2024!",
    bio: "Beiruti tailoring with a contemporary cut — minimal lines, weighty fabrics, considered details.",
    avatarGradient: G.indigo, coverGradient: G.jade,
    lat: 33.8886, lng: 35.4955,
  },
  {
    id: "t-5", atelier: "Maison Zaytouna", tailorName: "Nour El-Amri",
    firstName: "Nour", lastName: "El-Amri", initials: "NE",
    city: "Tunis", country: "Tunisia", specialty: "Coastal Linens",
    rating: 4.7, reviewCount: 96, years: 12,
    experienceStartDate: "2012-04-22",
    username: "nour_zaytouna", password: "khayyat_2024!",
    bio: "Sun-faded olive linens and breezy cuts inspired by the Tunisian coast. Slow-stitched, season after season.",
    avatarGradient: G.jade, coverGradient: G.sand,
    lat: 36.8065, lng: 10.1815,
  },
  {
    id: "t-6", atelier: "Atelier Andalus", tailorName: "Yasmin Cherkaoui",
    firstName: "Yasmin", lastName: "Cherkaoui", initials: "YC",
    city: "Casablanca", country: "Morocco", specialty: "Andalusian Heritage",
    rating: 4.9, reviewCount: 178, years: 20,
    experienceStartDate: "2004-07-30",
    username: "yasmin_andalus", password: "khayyat_2024!",
    bio: "Casablanca-based atelier celebrating Andalusian motifs — geometric tilework rendered in thread.",
    avatarGradient: G.copper, coverGradient: G.emerald,
    lat: 33.5731, lng: -7.5898,
  },
  {
    id: "t-7", atelier: "Bayt Al-Jazira", tailorName: "Faisal Al-Rashid",
    firstName: "Faisal", lastName: "Al-Rashid", initials: "FR",
    city: "Riyadh", country: "Saudi Arabia", specialty: "Khaleeji Formal",
    rating: 4.8, reviewCount: 224, years: 25,
    experienceStartDate: "1999-11-05",
    username: "faisal_jazira", password: "khayyat_2024!",
    bio: "Formal Khaleeji thobes and bishts crafted with imported wool and gold-trim detailing.",
    avatarGradient: G.sand, coverGradient: G.rose,
    lat: 24.6877, lng: 46.7219,
  },
  {
    id: "t-8", atelier: "İpek Studio", tailorName: "Selin Demir",
    firstName: "Selin", lastName: "Demir", initials: "SD",
    city: "Istanbul", country: "Türkiye", specialty: "Ottoman Revival",
    rating: 4.5, reviewCount: 88, years: 10,
    experienceStartDate: "2014-08-18",
    username: "selin_ipek", password: "khayyat_2024!",
    bio: "Bosphorus-side studio reinterpreting Ottoman-court silhouettes through a modern, minimal lens.",
    avatarGradient: G.copper, coverGradient: G.indigo,
    lat: 41.0082, lng: 28.9784,
  },
];

export interface TailorPost {
  id: string;
  tailorId: string;
  title: string;
  description: string;
  imageGradient: string;
  /**
   * Client-side photo URL (object URL or data URL).
   * Falls back to `imageGradient` when absent.
   * Will be replaced with a real CDN URL once the backend is connected.
   */
  imageUrl?: string;
  customerName: string;
  createdAt: string; // ISO
}

const daysAgo = (n: number) => new Date(Date.now() - n * 24 * 60 * 60 * 1000).toISOString();

export const TAILOR_POSTS_SEED: TailorPost[] = [
  // t-1
  { id: "p-1",  tailorId: "t-1", title: "Saffron Dunes",       description: "A ceremonial Jallabiya in hand-dyed saffron silk, with goldwork along the placket. Three fittings, six weeks of stitching.", imageGradient: G.saffron, customerName: "Amira H.",  createdAt: daysAgo(2) },
  { id: "p-2",  tailorId: "t-1", title: "Emerald Evening",     description: "Deep emerald cotton with hand-knotted buttons. Designed for a wedding guest, finished in 4 weeks.",                            imageGradient: G.emerald, customerName: "Rania M.",  createdAt: daysAgo(11) },
  { id: "p-3",  tailorId: "t-1", title: "Atlas Morning",       description: "Light beige linen for the warm season — minimal embroidery at the cuffs.",                                                  imageGradient: G.sand,    customerName: "Karim B.",  createdAt: daysAgo(28) },
  { id: "p-4",  tailorId: "t-1", title: "Souk Sundown",        description: "Copper-toned wool blend, structured shoulders, hand-rolled hems.",                                                          imageGradient: G.copper,  customerName: "Omar K.",   createdAt: daysAgo(60) },

  // t-2
  { id: "p-5",  tailorId: "t-2", title: "Nile Silk",           description: "Featherweight silk with a draped panel. Cairo summer wedding piece.",                                                       imageGradient: G.gold,    customerName: "Hala A.",   createdAt: daysAgo(4) },
  { id: "p-6",  tailorId: "t-2", title: "Hareer Heritage",     description: "Revived Mamluk silhouette in deep rose linen.",                                                                              imageGradient: G.rose,    customerName: "Mariam S.", createdAt: daysAgo(20) },
  { id: "p-7",  tailorId: "t-2", title: "Pyramid Pearl",       description: "Soft sand linen with mother-of-pearl detailing.",                                                                            imageGradient: G.sand,    customerName: "Dina E.",   createdAt: daysAgo(45) },

  // t-3
  { id: "p-8",  tailorId: "t-3", title: "Bridal Goldwork",     description: "Full bridal piece — six months in the making, hand-applied pearl and goldwork.",                                            imageGradient: G.gold,    customerName: "Layan A.",  createdAt: daysAgo(7) },
  { id: "p-9",  tailorId: "t-3", title: "Amman Twilight",      description: "Indigo silk gown for the henna night, with constellation beading.",                                                          imageGradient: G.indigo,  customerName: "Sara T.",   createdAt: daysAgo(33) },
  { id: "p-10", tailorId: "t-3", title: "Ivory Reception",     description: "Ivory-on-ivory reception gown with a custom-cut train.",                                                                     imageGradient: G.sand,    customerName: "Nadine F.", createdAt: daysAgo(70) },

  // t-4
  { id: "p-11", tailorId: "t-4", title: "Hamra Suit",          description: "Slim wool suit, half-canvas construction, peak lapel.",                                                                      imageGradient: G.indigo,  customerName: "Jad S.",    createdAt: daysAgo(5) },
  { id: "p-12", tailorId: "t-4", title: "Marina Linen",        description: "Coastal linen jacket, unstructured, cooled for August.",                                                                     imageGradient: G.jade,    customerName: "Ziad N.",   createdAt: daysAgo(22) },
  { id: "p-13", tailorId: "t-4", title: "Verdun Overcoat",     description: "Heavy wool overcoat, raglan shoulder, single button.",                                                                       imageGradient: G.emerald, customerName: "Tarek M.",  createdAt: daysAgo(50) },

  // t-5
  { id: "p-14", tailorId: "t-5", title: "Sidi Bou Said",       description: "Sea-washed linen Jallabiya in faded sky blue.",                                                                              imageGradient: G.jade,    customerName: "Imen B.",   createdAt: daysAgo(9) },
  { id: "p-15", tailorId: "t-5", title: "Olive Grove",         description: "Olive-toned linen, soft drape, salt-resistant finish.",                                                                      imageGradient: G.sand,    customerName: "Aya R.",    createdAt: daysAgo(31) },
  { id: "p-16", tailorId: "t-5", title: "Carthage Cream",      description: "Cream linen tunic with hand-stitched mosaic motif.",                                                                         imageGradient: G.gold,    customerName: "Maya L.",   createdAt: daysAgo(55) },

  // t-6
  { id: "p-17", tailorId: "t-6", title: "Zellige in Thread",   description: "Geometric embroidery panels echoing Andalusian tilework.",                                                                   imageGradient: G.emerald, customerName: "Reem A.",   createdAt: daysAgo(3) },
  { id: "p-18", tailorId: "t-6", title: "Granada Gold",        description: "Goldwork-trimmed kaftan for a state reception.",                                                                              imageGradient: G.gold,    customerName: "Salma D.",  createdAt: daysAgo(18) },
  { id: "p-19", tailorId: "t-6", title: "Casablanca Dusk",     description: "Dusk-toned silk evening Jallabiya, cropped sleeves.",                                                                        imageGradient: G.copper,  customerName: "Imane K.",  createdAt: daysAgo(40) },

  // t-7
  { id: "p-20", tailorId: "t-7", title: "Najd Formal",         description: "Charcoal wool bisht with custom gold trim.",                                                                                 imageGradient: G.indigo,  customerName: "Abdullah R.", createdAt: daysAgo(6) },
  { id: "p-21", tailorId: "t-7", title: "Desert Ivory",        description: "Ivory thobe with mother-of-pearl studs.",                                                                                    imageGradient: G.sand,    customerName: "Fahad M.",  createdAt: daysAgo(24) },
  { id: "p-22", tailorId: "t-7", title: "Riyadh Royal",        description: "State-occasion bisht in royal indigo, hand-tasselled.",                                                                       imageGradient: G.gold,    customerName: "Khalid S.", createdAt: daysAgo(48) },

  // t-8
  { id: "p-23", tailorId: "t-8", title: "Bosphorus Blue",      description: "Lightweight wool kaftan with Ottoman-court collar.",                                                                          imageGradient: G.indigo,  customerName: "Defne A.",  createdAt: daysAgo(10) },
  { id: "p-24", tailorId: "t-8", title: "Topkapı Rose",        description: "Dusty rose silk gown, modern minimal cut.",                                                                                   imageGradient: G.rose,    customerName: "Elif K.",   createdAt: daysAgo(35) },
];

export function getTailorById(id: string): TailorProfile | undefined {
  return TAILOR_PROFILES.find((t) => t.id === id);
}
export function getPostsByTailor(tailorId: string, posts: TailorPost[] = TAILOR_POSTS_SEED): TailorPost[] {
  return posts
    .filter((p) => p.tailorId === tailorId)
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
}
