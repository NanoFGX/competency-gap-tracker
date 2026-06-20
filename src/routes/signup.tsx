import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { GraduationCap, Building2, ArrowLeft, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useRole, type Role } from "@/lib/role-context";
import { ThemeToggle } from "@/components/theme-toggle";

export const Route = createFileRoute("/signup")({
  head: () => ({ meta: [{ title: "Sign up — Competency Tracker" }] }),
  component: SignUpPage,
});

type Step = "role" | "details" | "success";

type FormData = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  // student
  program: string;
  university: string;
  graduationYear: string;
  // recruiter
  company: string;
  title: string;
};

type FormErrors = Partial<Record<keyof FormData, string>>;

const CURRENT_YEAR = new Date().getFullYear();

function SignUpPage() {
  const { signUp } = useRole();
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>("role");
  const [role, setSelectedRole] = useState<Role>("student");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [createdEmail, setCreatedEmail] = useState("");
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (step !== "success") return;
    if (countdown <= 0) { navigate({ to: "/login" }); return; }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [step, countdown, navigate]);

  const [form, setForm] = useState<FormData>({
    name: "", email: "", password: "", confirmPassword: "",
    program: "", university: "", graduationYear: "",
    company: "", title: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const set = (field: keyof FormData, value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
    setSubmitError(null);
  };

  function validate(): FormErrors {
    const e: FormErrors = {};
    if (!form.name.trim()) e.name = "Full name is required.";
    if (!form.email.trim()) {
      e.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      e.email = "Enter a valid email address.";
    }
    if (!form.password) {
      e.password = "Password is required.";
    } else if (form.password.length < 8) {
      e.password = "Password must be at least 8 characters.";
    }
    if (!form.confirmPassword) {
      e.confirmPassword = "Please confirm your password.";
    } else if (form.password !== form.confirmPassword) {
      e.confirmPassword = "Passwords do not match.";
    }
    if (role === "student") {
      if (!form.program.trim()) e.program = "Program is required.";
      if (!form.university.trim()) e.university = "University is required.";
      if (!form.graduationYear) {
        e.graduationYear = "Graduation year is required.";
      } else {
        const yr = parseInt(form.graduationYear, 10);
        if (isNaN(yr) || yr < CURRENT_YEAR || yr > CURRENT_YEAR + 6) {
          e.graduationYear = `Enter a year between ${CURRENT_YEAR} and ${CURRENT_YEAR + 6}.`;
        }
      }
    } else {
      if (!form.company.trim()) e.company = "Company is required.";
      if (!form.title.trim()) e.title = "Job title is required.";
    }
    return e;
  }

  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setSubmitError(null);

    const result = signUp({
      role,
      name: form.name.trim(),
      email: form.email.trim(),
      password: form.password,
      ...(role === "student"
        ? { program: form.program.trim(), university: form.university.trim(), graduationYear: parseInt(form.graduationYear, 10) }
        : { company: form.company.trim(), title: form.title.trim() }),
    });

    if (!result.success) {
      setSubmitError(result.error);
      return;
    }

    setCreatedEmail(form.email.trim());
    setStep("success");
  };

  return (
    <div
      className="relative flex min-h-screen items-center justify-center px-4 py-10"
      style={{
        background:
          "radial-gradient(1100px 520px at 50% -8%, color-mix(in oklch, var(--primary) 14%, var(--background)) 0%, var(--background) 60%)",
      }}
    >
      <div className="absolute right-4 top-4">
        <ThemeToggle variant="icon" />
      </div>
      <div className="relative w-full max-w-md cgt-rise">
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

        <div className="rounded-2xl border border-border bg-card shadow-[var(--elevation-3)] p-6">
          {step === "role" && (
            <>
              <h1 className="text-lg font-semibold text-foreground mb-1">Create an account</h1>
              <p className="text-sm text-muted-foreground mb-6">How will you be using the tracker?</p>
              <div className="grid grid-cols-2 gap-3 mb-6">
                <RoleCard
                  icon={<GraduationCap className="h-6 w-6" />}
                  label="Student"
                  description="Track your competencies and build a validated portfolio"
                  selected={role === "student"}
                  onClick={() => setSelectedRole("student")}
                />
                <RoleCard
                  icon={<Building2 className="h-6 w-6" />}
                  label="Recruiter"
                  description="Review student evidence and validate competency claims"
                  selected={role === "recruiter"}
                  onClick={() => setSelectedRole("recruiter")}
                />
              </div>
              <button
                onClick={() => setStep("details")}
                className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
              >
                Continue as {role === "student" ? "Student" : "Recruiter"}
              </button>
            </>
          )}

          {step === "details" && (
            <>
              <button
                onClick={() => setStep("role")}
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Back
              </button>
              <div className="flex items-center gap-2 mb-5">
                <div className={`h-7 w-7 rounded-full grid place-items-center text-xs font-bold ${role === "student" ? "bg-blue-100 text-blue-700" : "bg-orange-100 text-orange-700"}`}>
                  {role === "student" ? <GraduationCap className="h-3.5 w-3.5" /> : <Building2 className="h-3.5 w-3.5" />}
                </div>
                <div>
                  <h1 className="text-base font-semibold leading-tight">
                    {role === "student" ? "Student" : "Recruiter"} details
                  </h1>
                  <p className="text-xs text-muted-foreground">Fill in your information to get started</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} noValidate className="space-y-4">
                {submitError && (
                  <div className="rounded-md bg-destructive/10 border border-destructive/30 px-3 py-2 text-xs text-destructive">
                    {submitError}
                  </div>
                )}

                {/* Name + Email */}
                <div className="grid grid-cols-1 gap-4">
                  <Field label="Full name *" error={errors.name}>
                    <input value={form.name} onChange={(e) => set("name", e.target.value)}
                      className={`inp${errors.name ? " inp-error" : ""}`} placeholder="e.g. Aisha Rahman" />
                  </Field>
                  <Field label="Email address *" error={errors.email}>
                    <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)}
                      className={`inp${errors.email ? " inp-error" : ""}`} placeholder="you@example.com" inputMode="email" />
                  </Field>
                </div>

                {/* Role-specific fields */}
                {role === "student" ? (
                  <div className="grid grid-cols-1 gap-4">
                    <Field label="Program / Degree *" error={errors.program}>
                      <input value={form.program} onChange={(e) => set("program", e.target.value)}
                        className={`inp${errors.program ? " inp-error" : ""}`} placeholder="e.g. BSc Computer Science" />
                    </Field>
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="University *" error={errors.university}>
                        <input value={form.university} onChange={(e) => set("university", e.target.value)}
                          className={`inp${errors.university ? " inp-error" : ""}`} placeholder="e.g. University of Leeds" />
                      </Field>
                      <Field label="Graduation year *" error={errors.graduationYear}>
                        <input value={form.graduationYear} onChange={(e) => set("graduationYear", e.target.value)}
                          className={`inp${errors.graduationYear ? " inp-error" : ""}`} placeholder={String(CURRENT_YEAR + 1)} inputMode="numeric" maxLength={4} />
                      </Field>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Company *" error={errors.company}>
                      <input value={form.company} onChange={(e) => set("company", e.target.value)}
                        className={`inp${errors.company ? " inp-error" : ""}`} placeholder="e.g. Accenture" />
                    </Field>
                    <Field label="Job title *" error={errors.title}>
                      <input value={form.title} onChange={(e) => set("title", e.target.value)}
                        className={`inp${errors.title ? " inp-error" : ""}`} placeholder="e.g. Technical Recruiter" />
                    </Field>
                  </div>
                )}

                {/* Password */}
                <Field label="Password *" error={errors.password}>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={form.password}
                      onChange={(e) => set("password", e.target.value)}
                      className={`inp pr-9${errors.password ? " inp-error" : ""}`}
                      placeholder="At least 8 characters"
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
                  {form.password && !errors.password && (
                    <PasswordStrength password={form.password} />
                  )}
                </Field>

                <Field label="Confirm password *" error={errors.confirmPassword}>
                  <div className="relative">
                    <input
                      type={showConfirm ? "text" : "password"}
                      value={form.confirmPassword}
                      onChange={(e) => set("confirmPassword", e.target.value)}
                      className={`inp pr-9${errors.confirmPassword ? " inp-error" : ""}`}
                      placeholder="Repeat your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm((v) => !v)}
                      className="absolute inset-y-0 right-0 px-2.5 flex items-center text-muted-foreground hover:text-foreground"
                      aria-label={showConfirm ? "Hide password" : "Show password"}
                    >
                      {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {form.confirmPassword && form.password === form.confirmPassword && !errors.confirmPassword && (
                    <div className="flex items-center gap-1 mt-1 text-xs text-[color:var(--success)]">
                      <CheckCircle2 className="h-3 w-3" /> Passwords match
                    </div>
                  )}
                </Field>

                <button
                  type="submit"
                  className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity mt-1"
                >
                  Create account
                </button>
              </form>
            </>
          )}

          {step === "success" && (
            <div className="flex flex-col items-center text-center py-4">
              <div className="h-14 w-14 rounded-full bg-[color:var(--success)]/15 grid place-items-center mb-4">
                <CheckCircle2 className="h-7 w-7 text-[color:var(--success)]" />
              </div>
              <h1 className="text-lg font-semibold mb-1">Account created!</h1>
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                Your account has been registered successfully. Sign in with your credentials below.
              </p>

              <div className="w-full rounded-lg border border-border bg-muted/30 px-4 py-3 text-left mb-5 space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Email</span>
                  <span className="font-medium font-mono">{createdEmail}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Password</span>
                  <span className="font-medium">Your chosen password</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Role</span>
                  <span className="font-medium capitalize">{role}</span>
                </div>
              </div>

              <Link
                to="/login"
                className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity text-center block"
              >
                Go to Sign in
              </Link>
              <p className="text-xs text-muted-foreground mt-3">
                Redirecting automatically in {countdown}s…
              </p>
            </div>
          )}
        </div>

        {step !== "success" && (
          <p className="text-center text-sm text-muted-foreground mt-5">
            Already have an account?{" "}
            <Link to="/login" className="text-primary hover:underline font-medium">
              Sign in
            </Link>
          </p>
        )}
      </div>

      <style>{`
        .inp { width: 100%; border: 1px solid var(--input); background: var(--background); border-radius: 8px; padding: 8px 12px; font-size: 14px; outline: none; color: var(--foreground); transition: box-shadow .15s, border-color .15s; }
        .inp:focus-visible { box-shadow: 0 0 0 2px var(--ring); border-color: transparent; }
        .inp-error { border-color: var(--destructive) !important; }
        .inp-error:focus-visible { box-shadow: 0 0 0 2px color-mix(in oklch, var(--destructive) 35%, transparent); }
      `}</style>
    </div>
  );
}

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ];
  const score = checks.filter(Boolean).length;
  const labels = ["Weak", "Fair", "Good", "Strong"];
  const colors = ["bg-destructive", "bg-[color:var(--warning)]", "oklch(0.6 0.15 145)", "bg-[color:var(--success)]"];
  const textColors = ["text-destructive", "text-[color:var(--warning)]", "text-emerald-600", "text-[color:var(--success)]"];

  return (
    <div className="mt-1.5 space-y-1">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all ${i < score ? (score === 1 ? "bg-destructive" : score === 2 ? "bg-[color:var(--warning)]" : score === 3 ? "bg-emerald-500" : "bg-[color:var(--success)]") : "bg-muted"}`}
          />
        ))}
      </div>
      <div className={`text-[10px] font-medium ${textColors[score - 1] ?? "text-muted-foreground"}`}>
        {score > 0 ? labels[score - 1] : ""}
      </div>
    </div>
  );
}

function RoleCard({
  icon, label, description, selected, onClick,
}: {
  icon: React.ReactNode;
  label: string;
  description: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center text-center gap-3 rounded-xl border px-4 py-6 transition-all ${
        selected
          ? "border-primary bg-primary/5 ring-1 ring-primary/30"
          : "border-border bg-muted/30 hover:border-primary/40 hover:bg-primary/5"
      }`}
    >
      <div className={selected ? "text-primary" : "text-muted-foreground"}>{icon}</div>
      <div>
        <div className="text-sm font-semibold text-foreground mb-1">{label}</div>
        <div className="text-xs text-muted-foreground leading-snug">{description}</div>
      </div>
    </button>
  );
}

function Field({
  label, error, children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-muted-foreground mb-1.5 block">{label}</span>
      {children}
      {error && (
        <p className="text-xs text-destructive mt-1">{error}</p>
      )}
    </label>
  );
}
