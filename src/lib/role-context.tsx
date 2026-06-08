import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Role = "student" | "recruiter";

interface Ctx {
  role: Role;
  setRole: (r: Role) => void;
}

const RoleContext = createContext<Ctx | null>(null);

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<Role>("student");

  // Restore choice after hydration (SSR-safe: defaults to student on the server).
  useEffect(() => {
    const saved = typeof window !== "undefined" ? window.localStorage.getItem("cgt-role") : null;
    if (saved === "student" || saved === "recruiter") setRoleState(saved);
  }, []);

  const setRole = (r: Role) => {
    setRoleState(r);
    if (typeof window !== "undefined") window.localStorage.setItem("cgt-role", r);
  };

  return <RoleContext.Provider value={{ role, setRole }}>{children}</RoleContext.Provider>;
}

export function useRole() {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error("useRole must be used within RoleProvider");
  return ctx;
}
