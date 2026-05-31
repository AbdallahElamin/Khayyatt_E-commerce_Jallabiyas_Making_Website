import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { MOCK_USERS, type MockUser, type Role } from "@/lib/mock-data";
import { supabase } from "@/lib/supabase";

interface RegisterPayload {
  fullName: string;
  email: string;
  username: string;
  password: string;
  location: { lat: number; lng: number; address: string };
}

interface AppContextValue {
  role: Role;
  user: MockUser;
  isAuthenticated: boolean;
  setRole: (r: Role) => void;
  login: (username: string, password: string) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);
const ROLE_KEY = "khayyat.role";
const AUTH_KEY = "khayyat.auth";

export function AppProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<Role>("customer");
  const [isAuthenticated, setAuth] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const savedRole = window.localStorage.getItem(ROLE_KEY);
    if (savedRole === "customer" || savedRole === "tailor" || savedRole === "admin") {
      setRoleState(savedRole);
    }
    setAuth(window.localStorage.getItem(AUTH_KEY) === "1");
  }, []);

  const setRole = (r: Role) => {
    setRoleState(r);
    if (typeof window !== "undefined") window.localStorage.setItem(ROLE_KEY, r);
  };

  const persistAuth = (v: boolean) => {
    setAuth(v);
    if (typeof window !== "undefined") {
      if (v) window.localStorage.setItem(AUTH_KEY, "1");
      else window.localStorage.removeItem(AUTH_KEY);
    }
  };

  const login = async (username: string, _password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: username,
        password: _password,
      });
      if (error) throw error;

      if (data.user) {
        // Fetch the user's role from the custom profiles table
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", data.user.id)
          .single();
        
        if (profile && profile.role) {
          setRole(profile.role as Role);
        } else {
          // Fallback for mock users or if profile doesn't exist yet
          const u = username.toLowerCase();
          if (u.includes("admin")) setRole("admin");
          else if (u.includes("tailor") || u.includes("khalil")) setRole("tailor");
          else setRole("customer");
        }
      }
      persistAuth(true);
    } catch (e) {
      console.error("Login failed:", e);
      throw e;
    }
  };

  const register = async (payload: RegisterPayload) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: payload.email,
        password: payload.password,
      });
      if (error) throw error;

      if (data.user) {
        // Create the profile row with customer role and location data
        const { error: profileError } = await supabase
          .from("profiles")
          .insert({
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
        }
      }

      setRole("customer");
      persistAuth(true);
    } catch (e) {
      console.error("Registration failed:", e);
      throw e;
    }
  };

  const logout = () => {
    persistAuth(false);
  };

  return (
    <AppContext.Provider
      value={{ role, user: MOCK_USERS[role], isAuthenticated, setRole, login, register, logout }}
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
