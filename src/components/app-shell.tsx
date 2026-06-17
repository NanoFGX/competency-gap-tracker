import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import {
  LayoutDashboard, Target, FileText, TrendingUp, GraduationCap,
  Users, ClipboardCheck, ShieldCheck, Compass, GitCompare, LogOut, UserCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useStudent } from "@/lib/student-context";
import { useRole } from "@/lib/role-context";
import { recruiters } from "@/lib/mock-data";
import { ConfirmDialog } from "@/components/ui";
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
};

export function AppShell({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const { studentId, setStudentId, student } = useStudent();
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
        <aside className="hidden md:flex w-64 shrink-0 flex-col border-r border-border bg-card sticky top-0 h-screen">
          <div className="px-5 py-5 border-b border-border">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-primary text-primary-foreground grid place-items-center shadow-sm">
                <GraduationCap className="h-4 w-4" />
              </div>
              <div className="leading-tight">
                <div className="text-sm font-semibold tracking-tight">Competency</div>
                <div className="text-xs text-muted-foreground">Gap Tracker</div>
              </div>
            </div>
          </div>

          <nav className="flex-1 px-3 py-4 space-y-0.5">
            <div className="px-3 pb-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              {role === "recruiter" ? "Recruiter view" : "Student view"}
            </div>
            {nav.map((n) => {
              const active = n.to === "/" ? pathname === "/" : pathname.startsWith(n.to);
              const Icon = n.icon;
              return (
                <Link
                  key={n.to}
                  to={n.to}
                  className={`group flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors ${
                    active ? "bg-accent text-foreground font-medium" : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
                  }`}
                >
                  <Icon className={`h-4 w-4 transition-colors ${active ? "text-primary" : ""}`} />
                  {n.label}
                </Link>
              );
            })}
          </nav>

          <div className="px-4 py-4 border-t border-border">
            {role === "student" ? (
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-full bg-accent grid place-items-center text-accent-foreground shrink-0">
                  <UserCircle className="h-4 w-4" />
                </div>
                <div className="leading-tight min-w-0">
                  <div className="text-sm font-medium truncate">{student.name}</div>
                  <div className="text-xs text-muted-foreground truncate">{student.program.replace(", Final Year", "")}</div>
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
                    <div className="h-8 w-8 rounded-full bg-accent grid place-items-center text-accent-foreground">
                      <ShieldCheck className="h-4 w-4" />
                    </div>
                    <div className="leading-tight">
                      <div className="text-sm font-medium">{name}</div>
                      <div className="text-xs text-muted-foreground">{subtitle}</div>
                    </div>
                  </div>
                );
              })()
            )}
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="mt-3 w-full flex items-center gap-2 rounded-md px-2.5 py-1.5 text-xs text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign out
            </button>
          </div>
        </aside>

        <main className="flex-1 min-w-0 flex flex-col">
          {/* Desktop page-label bar */}
          <div className="hidden md:flex items-center justify-between border-b border-border/70 bg-card/50 px-10 py-2.5 shrink-0">
            <div className="flex items-center gap-2 text-xs text-muted-foreground/60">
              <GraduationCap className="h-3.5 w-3.5 text-primary/60" />
              <span>Competency Gap Tracker</span>
            </div>
            {pageLabel && (
              <span className="text-[11px] font-extrabold uppercase tracking-[0.3em] text-foreground/25 select-none">
                {pageLabel}
              </span>
            )}
          </div>

          {/* Mobile top bar */}
          <div className="md:hidden border-b border-border bg-card px-4 py-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold">Competency Tracker</span>
            </div>
            {pageLabel && (
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">
                {pageLabel}
              </span>
            )}
          </div>
          <div className="md:hidden border-b border-border bg-card px-2 py-2 flex gap-1 overflow-x-auto">
            {nav.map((n) => {
              const active = n.to === "/" ? pathname === "/" : pathname.startsWith(n.to);
              return (
                <Link key={n.to} to={n.to} className={`px-3 py-1.5 rounded-md text-xs whitespace-nowrap transition-colors ${active ? "bg-accent font-medium" : "text-muted-foreground"}`}>
                  {n.label}
                </Link>
              );
            })}
          </div>

          <div className="px-6 md:px-10 py-8 max-w-6xl mx-auto w-full">{children}</div>
        </main>
      </div>
    </div>
  );
}

