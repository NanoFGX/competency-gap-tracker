import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import {
  LayoutDashboard, Target, FileText, TrendingUp, GraduationCap,
  Users, ClipboardCheck, ShieldCheck, Compass, GitCompare,
} from "lucide-react";
import { useStudent } from "@/lib/student-context";
import { useRole, type Role } from "@/lib/role-context";
import { students } from "@/lib/mock-data";
import type { ReactNode } from "react";

const studentNav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/career", label: "Career target", icon: Target },
  { to: "/evidence", label: "Evidence", icon: FileText },
  { to: "/self-check", label: "Self-check", icon: Compass },
  { to: "/timeline", label: "Progression", icon: TrendingUp },
] as const;

const recruiterNav = [
  { to: "/recruiter", label: "Candidates", icon: Users },
  { to: "/mentor", label: "Validate claims", icon: ClipboardCheck },
  { to: "/career", label: "Role benchmarks", icon: GitCompare },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const { studentId, setStudentId, student } = useStudent();
  const { role, setRole } = useRole();
  const navigate = useNavigate();
  const nav = role === "recruiter" ? recruiterNav : studentNav;

  const switchRole = (r: Role) => {
    if (r === role) return;
    setRole(r);
    navigate({ to: r === "recruiter" ? "/recruiter" : "/" });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
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
            <RoleSwitch role={role} onChange={switchRole} className="mt-4" />
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
              <>
                <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Viewing as</label>
                <select
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  className="mt-1.5 w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {students.map((s) => (<option key={s.id} value={s.id}>{s.name}</option>))}
                </select>
                <div className="mt-2 text-xs text-muted-foreground">{student.program}</div>
              </>
            ) : (
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-full bg-accent grid place-items-center text-accent-foreground">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div className="leading-tight">
                  <div className="text-sm font-medium">Samuel Marc</div>
                  <div className="text-xs text-muted-foreground">Recruiter · Zurich Services</div>
                </div>
              </div>
            )}
          </div>
        </aside>

        <main className="flex-1 min-w-0">
          {/* Mobile top bar */}
          <div className="md:hidden border-b border-border bg-card px-4 py-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold">Competency Tracker</span>
            </div>
            <RoleSwitch role={role} onChange={switchRole} compact />
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
          <div className="px-6 md:px-10 py-8 max-w-6xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}

function RoleSwitch({ role, onChange, compact = false, className = "" }: { role: Role; onChange: (r: Role) => void; compact?: boolean; className?: string }) {
  return (
    <div
      role="tablist"
      aria-label="Switch perspective"
      className={`relative grid grid-cols-2 gap-1 rounded-lg border border-border bg-muted/60 p-1 ${className}`}
    >
      {(["student", "recruiter"] as const).map((r) => {
        const active = role === r;
        return (
          <button
            key={r}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(r)}
            className={`relative z-10 rounded-md font-medium capitalize transition-colors ${compact ? "px-3 py-1 text-xs" : "px-2.5 py-1.5 text-[13px]"} ${
              active ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {r}
          </button>
        );
      })}
    </div>
  );
}
