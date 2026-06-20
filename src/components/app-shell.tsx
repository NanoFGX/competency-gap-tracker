import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import {
  LayoutDashboard, Target, FileText, TrendingUp, GraduationCap,
  Users, ClipboardCheck, ShieldCheck, Compass, GitCompare, LogOut, UserCircle, Palette,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useStudent } from "@/lib/student-context";
import { useRole } from "@/lib/role-context";
import { recruiters } from "@/lib/mock-data";
import { ConfirmDialog } from "@/components/ui";
import { ThemeToggle } from "@/components/theme-toggle";
import type { ReactNode } from "react";

const studentNav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/career", label: "Career target", icon: Target },
  { to: "/evidence", label: "Evidence", icon: FileText },
  { to: "/self-check", label: "Self-check", icon: Compass },
  { to: "/timeline", label: "Progression", icon: TrendingUp },
  { to: "/profile", label: "My Profile", icon: UserCircle },
] as const;

const recruiterNav = [
  { to: "/recruiter", label: "Candidates", icon: Users },
  { to: "/mentor", label: "Validate claims", icon: ClipboardCheck },
  { to: "/career", label: "Role benchmarks", icon: GitCompare },
  { to: "/profile", label: "My Profile", icon: UserCircle },
] as const;

const PAGE_LABELS: Record<string, string> = {
  "/": "Dashboard",
  "/career": "Career Target",
  "/evidence": "Evidence",
  "/self-check": "Self-Check",
  "/timeline": "Progression",
  "/profile": "My Profile",
  "/recruiter": "Candidates",
  "/mentor": "Review",
  "/design-system": "Design System",
};

function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground shadow-sm">
        <GraduationCap className="h-4 w-4" />
      </div>
      {!compact && (
        <div className="leading-tight">
          <div className="text-sm font-semibold tracking-tight">Competency</div>
          <div className="text-xs text-muted-foreground">Gap Tracker</div>
        </div>
      )}
    </div>
  );
}

function isActive(pathname: string, to: string) {
  return to === "/" ? pathname === "/" : pathname.startsWith(to);
}

export function AppShell({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const { setStudentId, student } = useStudent();
  const { role, isLoggedIn, personId, registeredUsers, logout } = useRole();
  const navigate = useNavigate();
  const nav = role === "recruiter" ? recruiterNav : studentNav;
  const pageLabel = PAGE_LABELS[pathname] ?? "";
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    if (!isLoggedIn && pathname !== "/login" && pathname !== "/signup") {
      navigate({ to: "/login" });
    }
  }, [isLoggedIn, pathname, navigate]);

  useEffect(() => {
    if (role === "student" && personId) {
      setStudentId(personId);
    }
  }, [role, personId, setStudentId]);

  const handleLogout = () => {
    setShowLogoutConfirm(false);
    logout();
    navigate({ to: "/login" });
  };

  if (!isLoggedIn) return <>{children}</>;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {showLogoutConfirm && (
        <ConfirmDialog
          title="Sign out?"
          description="You will be returned to the login screen. Any unsaved changes in this session will be lost."
          confirmLabel="Yes, sign out"
          onConfirm={handleLogout}
          onCancel={() => setShowLogoutConfirm(false)}
        />
      )}
      <div className="flex">
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-border bg-sidebar md:flex">
          <div className="border-b border-border px-5 py-5">
            <Brand />
          </div>

          <nav className="flex-1 space-y-0.5 px-3 py-4">
            <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              {role === "recruiter" ? "Recruiter view" : "Student view"}
            </div>
            {nav.map((n) => {
              const active = isActive(pathname, n.to);
              const Icon = n.icon;
              return (
                <Link
                  key={n.to}
                  to={n.to}
                  className={`group relative flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
                    active
                      ? "bg-accent font-medium text-accent-foreground"
                      : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
                  }`}
                >
                  {active && (
                    <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-primary" />
                  )}
                  <Icon className={`h-4 w-4 transition-colors ${active ? "text-primary" : "text-muted-foreground group-hover:text-foreground"}`} />
                  {n.label}
                </Link>
              );
            })}

            <div className="px-3 pb-2 pt-5 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Reference
            </div>
            <Link
              to="/design-system"
              className={`group relative flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
                isActive(pathname, "/design-system")
                  ? "bg-accent font-medium text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
              }`}
            >
              {isActive(pathname, "/design-system") && (
                <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-primary" />
              )}
              <Palette className={`h-4 w-4 transition-colors ${isActive(pathname, "/design-system") ? "text-primary" : "text-muted-foreground group-hover:text-foreground"}`} />
              Design system
            </Link>
          </nav>

          <div className="border-t border-border px-4 py-4">
            {role === "student" ? (
              <div className="flex items-center gap-2.5">
                <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-accent text-accent-foreground">
                  <UserCircle className="h-4 w-4" />
                </div>
                <div className="min-w-0 leading-tight">
                  <div className="truncate text-sm font-medium">{student.name}</div>
                  <div className="truncate text-xs text-muted-foreground">{student.program.replace(", Final Year", "")}</div>
                </div>
              </div>
            ) : (
              (() => {
                const mockRec = recruiters.find((r) => r.id === personId);
                const regRec = !mockRec ? registeredUsers.find((u) => u.id === personId && u.role === "recruiter") : null;
                const name = mockRec?.name ?? regRec?.name ?? "Recruiter";
                const subtitle = mockRec
                  ? `${mockRec.title} · ${mockRec.company}`
                  : regRec
                  ? `${regRec.title ?? "Recruiter"} · ${regRec.company ?? ""}`
                  : "";
                return (
                  <div className="flex items-center gap-2.5">
                    <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-accent text-accent-foreground">
                      <ShieldCheck className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 leading-tight">
                      <div className="truncate text-sm font-medium">{name}</div>
                      <div className="truncate text-xs text-muted-foreground">{subtitle}</div>
                    </div>
                  </div>
                );
              })()
            )}

            <div className="mt-3 space-y-0.5">
              <ThemeToggle />
              <button
                onClick={() => setShowLogoutConfirm(true)}
                className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                <LogOut className="h-3.5 w-3.5" />
                Sign out
              </button>
            </div>
          </div>
        </aside>

        <main className="flex min-w-0 flex-1 flex-col">
          {/* Desktop page-label bar */}
          <div className="hidden shrink-0 items-center justify-between border-b border-border/70 bg-card/60 px-10 py-2.5 backdrop-blur md:flex">
            <div className="flex items-center gap-2 text-xs text-muted-foreground/70">
              <GraduationCap className="h-3.5 w-3.5 text-primary/70" />
              <span>Competency Gap Tracker</span>
            </div>
            {pageLabel && (
              <span className="select-none text-[11px] font-extrabold uppercase tracking-[0.3em] text-foreground/25">
                {pageLabel}
              </span>
            )}
          </div>

          {/* Mobile top bar */}
          <div className="flex items-center justify-between gap-2 border-b border-border bg-card px-4 py-3 md:hidden">
            <Brand />
            <ThemeToggle variant="icon" />
          </div>
          <div className="flex gap-1 overflow-x-auto border-b border-border bg-card px-2 py-2 md:hidden">
            {nav.map((n) => {
              const active = isActive(pathname, n.to);
              return (
                <Link
                  key={n.to}
                  to={n.to}
                  className={`whitespace-nowrap rounded-md px-3 py-1.5 text-xs transition-colors ${active ? "bg-accent font-medium text-accent-foreground" : "text-muted-foreground"}`}
                >
                  {n.label}
                </Link>
              );
            })}
            <Link
              to="/design-system"
              className={`whitespace-nowrap rounded-md px-3 py-1.5 text-xs transition-colors ${isActive(pathname, "/design-system") ? "bg-accent font-medium text-accent-foreground" : "text-muted-foreground"}`}
            >
              Design system
            </Link>
          </div>

          <div className="mx-auto w-full max-w-6xl px-6 py-8 md:px-10">{children}</div>
        </main>
      </div>
    </div>
  );
}
