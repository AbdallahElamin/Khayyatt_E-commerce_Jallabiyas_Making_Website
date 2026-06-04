import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Role } from "@/lib/mock-data";
import { supabase } from "@/lib/supabase";

// The shape of a real user profile loaded from Supabase
export interface UserProfile {
  id: string;
  role: Role;
  full_name: string | null;
  username: string | null;
  email: string | null;
  location_lat: number | null;
  location_lng: number | null;
  location_address: string | null;
  atelier_name: string | null;
  experience_start_date: string | null;
  /** Tailor rating (0–5). Stored directly on the profile; 0 until reviews are recorded. */
  rating: number;
  /** Total number of customer reviews. */
  review_count: number;
  // Derived convenience fields
  initials: string;
  name: string;
}

interface RegisterPayload {
  fullName: string;
  email: string;
  username: string;
  password: string;
  location: { lat: number; lng: number; address: string };
}

interface AppContextValue {
  role: Role;
  user: UserProfile;
  isAuthenticated: boolean;
  setRole: (r: Role) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

// Fallback guest profile so the app never crashes when not authenticated
const GUEST_PROFILE: UserProfile = {
  id: "",
  role: "customer",
  full_name: "Guest",
  username: null,
  email: null,
  location_lat: null,
  location_lng: null,
  location_address: null,
  atelier_name: null,
  experience_start_date: null,
  rating: 0,
  review_count: 0,
  initials: "?",
  name: "Guest",
};

function buildProfile(raw: any, email: string | null): UserProfile {
  const fullName: string = raw.full_name ?? "";
  const parts = fullName.trim().split(/\s+/);
  const initials =
    parts.length >= 2
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : fullName.slice(0, 2).toUpperCase() || "?";
  return {
    id: raw.id,
    role: raw.role as Role,
    full_name: raw.full_name,
    username: raw.username,
    email: email,
    location_lat: raw.location_lat,
    location_lng: raw.location_lng,
    location_address: raw.location_address,
    atelier_name: raw.atelier_name,
    experience_start_date: raw.experience_start_date,
    rating: typeof raw.rating === "number" ? raw.rating : Number(raw.rating ?? 0),
    review_count: typeof raw.review_count === "number" ? raw.review_count : Number(raw.review_count ?? 0),
    initials,
    name: fullName || email || "User",
  };
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<Role>("customer");
  const [isAuthenticated, setAuth] = useState(false);
  const [user, setUser] = useState<UserProfile>(GUEST_PROFILE);

  // On mount, restore session from Supabase (handles page reload)
  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        await loadProfile(session.user.id, session.user.email ?? null);
        setAuth(true);
      }
    });

    // Listen for auth state changes (login / logout)
    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          await loadProfile(session.user.id, session.user.email ?? null);
          setAuth(true);
        } else {
          setUser(GUEST_PROFILE);
          setRoleState("customer");
          setAuth(false);
        }
      },
    );
    return () => listener.subscription.unsubscribe();
  }, []);

  const loadProfile = async (userId: string, email: string | null) => {
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (profile) {
      const built = buildProfile(profile, email);
      setUser(built);
      setRoleState(built.role);
    }
  };

  const setRole = (r: Role) => {
    setRoleState(r);
  };

  const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;

    if (data.user) {
      await loadProfile(data.user.id, data.user.email ?? null);
      setAuth(true);
    }
  };

  const register = async (payload: RegisterPayload) => {
    const { data, error } = await supabase.auth.signUp({
      email: payload.email,
      password: payload.password,
    });
    if (error) throw error;

    if (data.user) {
      const { error: profileError } = await supabase.from("profiles").insert({
        id: data.user.id,
        role: "customer",
        full_name: payload.fullName,
        username: payload.username,
        location_lat: payload.location.lat,
        location_lng: payload.location.lng,
        location_address: payload.location.address,
      });

      if (profileError) {
        console.error("Failed to create profile:", profileError);
        // Throw so the register page catches it and displays it
        throw new Error("Profile creation failed: " + profileError.message);
      }

      await loadProfile(data.user.id, data.user.email ?? null);
      setAuth(true);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(GUEST_PROFILE);
    setRoleState("customer");
    setAuth(false);
  };

  const refreshProfile = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      await loadProfile(session.user.id, session.user.email ?? null);
    }
  };

  return (
    <AppContext.Provider
      value={{ role, user, isAuthenticated, setRole, login, register, logout, refreshProfile }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}
