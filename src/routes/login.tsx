import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { GraduationCap, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useRole } from "@/lib/role-context";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in — Competency Tracker" }] }),
  component: LoginPage,
});

function LoginPage() {
  const { login } = useRole();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }

    const result = login(email, password);
    if (!result.success) {
      setError("Incorrect email or password. Check the credentials file if you're using a demo account.");
      return;
    }

    navigate({ to: result.role === "recruiter" ? "/recruiter" : "/" });
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div className="h-9 w-9 rounded-lg bg-primary text-primary-foreground grid place-items-center shadow-sm">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div className="leading-tight">
            <div className="text-base font-semibold tracking-tight">Competency</div>
            <div className="text-xs text-muted-foreground">Gap Tracker</div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card shadow-sm p-6">
          <h1 className="text-lg font-semibold text-foreground mb-1">Sign in</h1>
          <p className="text-sm text-muted-foreground mb-6">Enter your email and password to continue.</p>

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {error && (
              <div className="rounded-md bg-destructive/10 border border-destructive/30 px-3 py-2 text-xs text-destructive">
                {error}
              </div>
            )}

            <label className="block">
              <span className="text-xs font-medium text-muted-foreground mb-1.5 block">Email address</span>
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
              <span className="text-xs font-medium text-muted-foreground mb-1.5 block">Password</span>
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
                  className="absolute inset-y-0 right-0 px-2.5 flex items-center text-muted-foreground hover:text-foreground"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </label>

            <button
              type="submit"
              className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
            >
              Sign in
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-5">
            Don't have an account?{" "}
            <Link to="/signup" className="text-primary hover:underline font-medium">
              Sign up
            </Link>
          </p>
        </div>
      </div>

      <style>{`
        .inp { width: 100%; border: 1px solid var(--input); background: var(--background); border-radius: 6px; padding: 6px 10px; font-size: 13px; outline: none; }
        .inp:focus { box-shadow: 0 0 0 2px var(--ring); }
      `}</style>
    </div>
  );
}
