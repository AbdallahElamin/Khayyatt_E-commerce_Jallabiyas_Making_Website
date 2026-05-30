import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { MOCK_USERS, type MockUser, type Role } from "@/lib/mock-data";

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
      console.warn("Database persistence pending Supabase connection");
      // const { data, error } = await supabase.auth.signInWithPassword({
      //   email: username,
      //   password: _password,
      // });
      // if (error) throw error;

      // MOCK ONLY — temporary keyword-based role inference for dev preview.
      // Real auth (post-Cloud) will read the user's assigned role from the database.
      const u = username.toLowerCase();
      if (u.includes("admin")) setRole("admin");
      else if (u.includes("tailor") || u.includes("khalil")) setRole("tailor");
      else setRole("customer");
      persistAuth(true);
    } catch (e) {
      console.error("Login failed:", e);
      throw e;
    }
  };

  const register = async (payload: RegisterPayload) => {
    try {
      console.warn("Database persistence pending Supabase connection");
      // const { data, error } = await supabase.auth.signUp({
      //   email: payload.email,
      //   password: payload.password,
      //   options: {
      //     data: {
      //       full_name: payload.fullName,
      //       username: payload.username,
      //     }
      //   }
      // });
      // if (error) throw error;

      // Public registration is customer-only. Tailors are provisioned by an
      // admin from the dashboard; admins are seeded in the database directly.
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
