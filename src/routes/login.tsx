import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { GraduationCap, Eye, EyeOff, ShieldCheck, ArrowRight } from "lucide-react";
import { useState } from "react";
import { useRole } from "@/lib/role-context";
import { ThemeToggle } from "@/components/theme-toggle";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in — Competency Tracker" }] }),
  component: LoginPage,
});

const DEMO = [
  { label: "Student", email: "aisha.r@university.edu", password: "Student@123", icon: GraduationCap },
  { label: "Recruiter", email: "s.marc@zurichservices.com", password: "Recruiter@123", icon: ShieldCheck },
];

function LoginPage() {
  const { login } = useRole();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = (em: string, pw: string) => {
    setError(null);
    if (!em.trim() || !pw) {
      setError("Please enter your email and password.");
      return;
    }
    const result = login(em, pw);
    if (!result.success) {
      setError("Incorrect email or password. Try a demo account below.");
      return;
    }
    navigate({ to: result.role === "recruiter" ? "/recruiter" : "/" });
  };

  return (
    <div
      className="relative flex min-h-screen items-center justify-center px-4"
      style={{
        background:
          "radial-gradient(1100px 520px at 50% -8%, color-mix(in oklch, var(--primary) 14%, var(--background)) 0%, var(--background) 60%)",
      }}
    >
      {/* faint dotted grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.4]"
        style={{
          backgroundImage:
            "radial-gradient(color-mix(in oklch, var(--foreground) 8%, transparent) 1px, transparent 1px)",
          backgroundSize: "22px 22px",
          maskImage: "radial-gradient(circle at 50% 30%, black, transparent 75%)",
        }}
        aria-hidden="true"
      />
      <div className="absolute right-4 top-4">
        <ThemeToggle variant="icon" />
      </div>

      <div className="relative w-full max-w-sm cgt-rise">
        {/* Logo */}
        <div className="mb-8 flex items-center justify-center gap-2.5">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-primary-foreground shadow-sm">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div className="leading-tight">
            <div className="text-base font-semibold tracking-tight">Competency</div>
            <div className="text-xs text-muted-foreground">Gap Tracker</div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--elevation-3)]">
          <h1 className="mb-1 text-lg font-semibold text-foreground">Welcome back</h1>
          <p className="mb-6 text-sm text-muted-foreground">Sign in to your competency profile.</p>

          <form
            onSubmit={(e) => { e.preventDefault(); submit(email, password); }}
            noValidate
            className="space-y-4"
          >
            {error && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                {error}
              </div>
            )}

            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-muted-foreground">Email address</span>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(null); }}
                className="inp"
                placeholder="you@example.com"
                inputMode="email"
                autoComplete="email"
                autoFocus
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-muted-foreground">Password</span>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(null); }}
                  className="inp pr-9"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-0 flex items-center px-2.5 text-muted-foreground hover:text-foreground"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </label>

            <button
              type="submit"
              className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-[color:var(--primary-hover)]"
            >
              Sign in <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          {/* Demo quick-fill */}
          <div className="mt-5 border-t border-border pt-4">
            <div className="mb-2 text-center text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Try a demo account
            </div>
            <div className="grid grid-cols-2 gap-2">
              {DEMO.map((d) => {
                const Icon = d.icon;
                return (
                  <button
                    key={d.label}
                    type="button"
                    onClick={() => { setEmail(d.email); setPassword(d.password); submit(d.email, d.password); }}
                    className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-border bg-background px-3 py-2 text-xs font-medium text-foreground transition-colors hover:border-primary/40 hover:bg-accent"
                  >
                    <Icon className="h-3.5 w-3.5 text-primary" /> {d.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <p className="mt-5 text-center text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link to="/signup" className="font-medium text-primary hover:underline">
            Sign up
          </Link>
        </p>
      </div>

      <style>{`
        .inp { width: 100%; border: 1px solid var(--input); background: var(--background); border-radius: 8px; padding: 8px 12px; font-size: 14px; outline: none; color: var(--foreground); transition: box-shadow .15s, border-color .15s; }
        .inp:focus-visible { box-shadow: 0 0 0 2px var(--ring); border-color: transparent; }
      `}</style>
    </div>
  );
}
