import { Link, useLocation } from "@tanstack/react-router";
import { LayoutDashboard, Target, FileText, ClipboardCheck, TrendingUp, GraduationCap } from "lucide-react";
import { useStudent } from "@/lib/student-context";
import { students } from "@/lib/mock-data";
import type { ReactNode } from "react";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/career", label: "Career Target", icon: Target },
  { to: "/evidence", label: "Evidence", icon: FileText },
  { to: "/mentor", label: "Mentor Review", icon: ClipboardCheck },
  { to: "/timeline", label: "Progression", icon: TrendingUp },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const { studentId, setStudentId, student } = useStudent();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex">
        <aside className="hidden md:flex w-64 shrink-0 flex-col border-r border-border bg-card sticky top-0 h-screen">
          <div className="px-6 py-5 border-b border-border">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-md bg-primary text-primary-foreground grid place-items-center">
                <GraduationCap className="h-4 w-4" />
              </div>
              <div className="leading-tight">
                <div className="text-sm font-semibold">Competency</div>
                <div className="text-xs text-muted-foreground">Gap Tracker</div>
              </div>
            </div>
          </div>
          <nav className="flex-1 px-3 py-4 space-y-0.5">
            {nav.map((n) => {
              const active = n.to === "/" ? pathname === "/" : pathname.startsWith(n.to);
              const Icon = n.icon;
              return (
                <Link
                  key={n.to}
                  to={n.to}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors ${
                    active
                      ? "bg-accent text-foreground font-medium"
                      : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {n.label}
                </Link>
              );
            })}
          </nav>
          <div className="px-4 py-4 border-t border-border">
            <label className="text-xs text-muted-foreground uppercase tracking-wide">Viewing as</label>
            <select
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              className="mt-1.5 w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {students.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            <div className="mt-2 text-xs text-muted-foreground">{student.program}</div>
          </div>
        </aside>

        <main className="flex-1 min-w-0">
          <div className="md:hidden border-b border-border bg-card px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold">Competency Tracker</span>
            </div>
            <select
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              className="rounded-md border border-input bg-background px-2 py-1 text-xs"
            >
              {students.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          <div className="md:hidden border-b border-border bg-card px-2 py-2 flex gap-1 overflow-x-auto">
            {nav.map((n) => {
              const active = n.to === "/" ? pathname === "/" : pathname.startsWith(n.to);
              return (
                <Link key={n.to} to={n.to} className={`px-3 py-1.5 rounded-md text-xs whitespace-nowrap ${active ? "bg-accent font-medium" : "text-muted-foreground"}`}>
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
