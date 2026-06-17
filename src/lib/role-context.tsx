import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Role = "student" | "recruiter";

export interface RegisteredUser {
  id: string;
  role: Role;
  name: string;
  email: string;
  password: string;
  program?: string;
  university?: string;
  graduationYear?: number;
  company?: string;
  title?: string;
}

// Demo accounts — same emails/passwords as CREDENTIALS.txt
const DEMO_CREDENTIALS: Record<string, { password: string; role: Role; id: string }> = {
  "aisha.r@university.edu":     { password: "Student@123",   role: "student",   id: "s1" },
  "marcus.c@university.edu":    { password: "Student@123",   role: "student",   id: "s2" },
  "priya.s@university.edu":     { password: "Student@123",   role: "student",   id: "s3" },
  "s.marc@zurichservices.com":  { password: "Recruiter@123", role: "recruiter", id: "r1" },
  "s.mitchell@axiomdigital.io": { password: "Recruiter@123", role: "recruiter", id: "r2" },
  "j.okafor@novatech.co":       { password: "Recruiter@123", role: "recruiter", id: "r3" },
};

interface Ctx {
  role: Role;
  setRole: (r: Role) => void;
  isLoggedIn: boolean;
  personId: string | null;
  registeredUsers: RegisteredUser[];
  login: (email: string, password: string) => { success: true; role: Role } | { success: false };
  loginAs: (role: Role, id: string) => void;
  logout: () => void;
  signUp: (data: Omit<RegisteredUser, "id">) => { success: true; id: string } | { success: false; error: string };
}

const RoleContext = createContext<Ctx | null>(null);

function loadRegisteredUsers(): RegisteredUser[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem("cgt-registered-users") ?? "[]");
  } catch {
    return [];
  }
}

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<Role>("student");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [personId, setPersonId] = useState<string | null>(null);
  const [registeredUsers, setRegisteredUsers] = useState<RegisteredUser[]>([]);

  useEffect(() => {
    const savedRole = typeof window !== "undefined" ? window.localStorage.getItem("cgt-role") : null;
    const savedLogin = typeof window !== "undefined" ? window.localStorage.getItem("cgt-logged-in") : null;
    const savedPersonId = typeof window !== "undefined" ? window.localStorage.getItem("cgt-person-id") : null;
    if (savedRole === "student" || savedRole === "recruiter") setRoleState(savedRole);
    if (savedLogin === "true") setIsLoggedIn(true);
    if (savedPersonId) setPersonId(savedPersonId);
    setRegisteredUsers(loadRegisteredUsers());
  }, []);

  const setRole = (r: Role) => {
    setRoleState(r);
    if (typeof window !== "undefined") window.localStorage.setItem("cgt-role", r);
  };

  const loginAs = (r: Role, id: string) => {
    setRoleState(r);
    setIsLoggedIn(true);
    setPersonId(id);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("cgt-role", r);
      window.localStorage.setItem("cgt-logged-in", "true");
      window.localStorage.setItem("cgt-person-id", id);
    }
  };

  const login = (email: string, password: string): { success: true; role: Role } | { success: false } => {
    const key = email.toLowerCase().trim();

    // 1. Check demo accounts
    const demo = DEMO_CREDENTIALS[key];
    if (demo && demo.password === password) {
      loginAs(demo.role, demo.id);
      return { success: true, role: demo.role };
    }

    // 2. Check accounts created via sign-up (stored in localStorage)
    const registered = loadRegisteredUsers();
    const reg = registered.find((u) => u.email.toLowerCase() === key && u.password === password);
    if (reg) {
      loginAs(reg.role, reg.id);
      return { success: true, role: reg.role };
    }

    return { success: false };
  };

  const logout = () => {
    setIsLoggedIn(false);
    setPersonId(null);
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("cgt-logged-in");
      window.localStorage.removeItem("cgt-role");
      window.localStorage.removeItem("cgt-person-id");
    }
  };

  const signUp = (data: Omit<RegisteredUser, "id">): { success: true; id: string } | { success: false; error: string } => {
    const emailKey = data.email.toLowerCase().trim();

    // Block if email matches a demo account
    if (DEMO_CREDENTIALS[emailKey]) {
      return { success: false, error: "An account with that email already exists." };
    }

    // Block if email already signed up
    const existing = loadRegisteredUsers();
    if (existing.some((u) => u.email.toLowerCase() === emailKey)) {
      return { success: false, error: "An account with that email already exists." };
    }

    const id = `${data.role[0]}-reg-${Date.now()}`;
    const newUser: RegisteredUser = { ...data, email: emailKey, id };
    const updated = [...existing, newUser];

    if (typeof window !== "undefined") {
      window.localStorage.setItem("cgt-registered-users", JSON.stringify(updated));
    }
    setRegisteredUsers(updated);
    return { success: true, id };
  };

  return (
    <RoleContext.Provider value={{ role, setRole, isLoggedIn, personId, registeredUsers, login, loginAs, logout, signUp }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error("useRole must be used within RoleProvider");
  return ctx;
}
