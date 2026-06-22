import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion, useReducedMotion } from "framer-motion";
import {
  GraduationCap,
  ClipboardCheck,
  ArrowRight,
  Sparkles,
  Target,
  FileCheck2,
  TrendingUp,
  BarChart3,
  Compass,
  Play,
  Check,
} from "lucide-react";
import { useRole } from "@/lib/role-context";
import { ThemeToggle } from "@/components/theme-toggle";
import { FadeIn, Reveal, Stagger, StaggerItem, AnimatedNumber, Lift } from "@/components/motion";

export const Route = createFileRoute("/landing")({
  head: () => ({ meta: [{ title: "Competency Gap Tracker — Prove what you can do" }] }),
  component: LandingPage,
});

const EASE = [0.23, 1, 0.32, 1] as const;

const STEPS = [
  {
    icon: FileCheck2,
    title: "Submit evidence",
    body: "Add a project, report, presentation or hackathon and map it to the competencies it demonstrates.",
  },
  {
    icon: ClipboardCheck,
    title: "Get it validated",
    body: "A mentor scores each competency against a 1–10 rubric and leaves structured feedback.",
  },
  {
    icon: TrendingUp,
    title: "Close the gap",
    body: "Watch your readiness climb, benchmark against target roles, and act on AI-suggested next steps.",
  },
];

const FEATURES = [
  {
    icon: Target,
    title: "Role benchmarking",
    body: "Measure yourself against the real competency profile of Software, AI, UX and Tech-Lead roles.",
  },
  {
    icon: BarChart3,
    title: "Readiness analytics",
    body: "A composite readiness score, radar profile and per-role coverage — always up to date.",
  },
  {
    icon: Compass,
    title: "Self-calibration",
    body: "Compare how you rate yourself against mentor scores to surface blind spots.",
  },
  {
    icon: Sparkles,
    title: "AI insights",
    body: "Plain-English summaries of your trajectory and the highest-impact thing to do next.",
  },
];

function LandingPage() {
  const { login } = useRole();
  const navigate = useNavigate();
  const reduce = useReducedMotion();

  const tryDemo = () => {
    const r = login("aisha.r@university.edu", "Student@123");
    if (r.success) navigate({ to: "/" });
    else navigate({ to: "/login" });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ── Nav ─────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
          <div className="flex items-center gap-2.5">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground shadow-sm">
              <GraduationCap className="h-4 w-4" />
            </div>
            <div className="leading-tight">
              <div className="text-sm font-semibold tracking-tight">Competency</div>
              <div className="text-[11px] text-muted-foreground">Gap Tracker</div>
            </div>
          </div>
          <nav className="hidden items-center gap-7 text-sm text-muted-foreground md:flex">
            <a href="#how" className="transition-colors hover:text-foreground">
              How it works
            </a>
            <a href="#features" className="transition-colors hover:text-foreground">
              Features
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <ThemeToggle variant="icon" />
            <Link
              to="/login"
              className="hidden rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground sm:inline-block"
            >
              Sign in
            </Link>
            <Link
              to="/signup"
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-[color:var(--primary-hover)]"
            >
              Get started <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden"
        style={{
          background:
            "radial-gradient(1200px 560px at 50% -10%, color-mix(in oklch, var(--primary) 16%, var(--background)) 0%, var(--background) 62%)",
        }}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-50"
          style={{
            backgroundImage:
              "radial-gradient(color-mix(in oklch, var(--foreground) 8%, transparent) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
            maskImage: "radial-gradient(circle at 50% 20%, black, transparent 72%)",
          }}
          aria-hidden="true"
        />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-5 py-20 lg:grid-cols-2 lg:py-28">
          <div>
            <FadeIn>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                <Sparkles className="h-3.5 w-3.5" /> Evidence-based career readiness
              </span>
            </FadeIn>
            <FadeIn delay={0.08}>
              <h1 className="mt-5 text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl">
                Prove what you can do —{" "}
                <span className="bg-gradient-to-r from-primary to-[color:var(--chart-2)] bg-clip-text text-transparent">
                  not just claim it.
                </span>
              </h1>
            </FadeIn>
            <FadeIn delay={0.16}>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                Competency Gap Tracker turns real student work into a mentor-validated competency
                profile, benchmarks it against the role you want, and shows you the fastest path to
                career-ready.
              </p>
            </FadeIn>
            <FadeIn delay={0.24}>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link
                  to="/signup"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-5 py-3 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-[color:var(--primary-hover)]"
                >
                  Create your profile <ArrowRight className="h-4 w-4" />
                </Link>
                <button
                  onClick={tryDemo}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-5 py-3 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-accent"
                >
                  <Play className="h-4 w-4 text-primary" /> Live demo
                </button>
              </div>
            </FadeIn>
            <FadeIn delay={0.32}>
              <div className="mt-7 flex items-center gap-5 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-success" /> No setup
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-success" /> Light & dark
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-success" /> Demo accounts ready
                </span>
              </div>
            </FadeIn>
          </div>

          {/* Hero product mock */}
          <FadeIn delay={0.2} className="lg:justify-self-end">
            <HeroCard reduce={!!reduce} />
          </FadeIn>
        </div>
      </section>

      {/* ── Stat band ───────────────────────────────────────── */}
      <section className="border-y border-border bg-card/40">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-5 py-10 md:grid-cols-4">
          {[
            { v: 6, s: "", label: "Core competencies" },
            { v: 4, s: "", label: "Benchmarked roles" },
            { v: 3, s: "", label: "Connected roles" },
            { v: 100, s: "%", label: "Evidence-backed" },
          ].map((stat) => (
            <Reveal key={stat.label} className="text-center">
              <div className="text-3xl font-semibold tracking-tight text-foreground">
                <AnimatedNumber value={stat.v} suffix={stat.s} />
              </div>
              <div className="mt-1 text-xs text-muted-foreground">{stat.label}</div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── How it works ────────────────────────────────────── */}
      <section id="how" className="mx-auto max-w-6xl px-5 py-20">
        <Reveal className="text-center">
          <h2 className="text-3xl font-semibold tracking-tight">
            From coursework to career-ready in three steps
          </h2>
        </Reveal>
        <Stagger className="mt-12 grid gap-5 md:grid-cols-3">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            return (
              <StaggerItem key={s.title}>
                <div className="relative h-full rounded-2xl border border-border bg-card p-6 shadow-[var(--elevation-1)]">
                  <span className="absolute right-5 top-5 font-mono text-3xl font-bold text-primary/15">
                    0{i + 1}
                  </span>
                  <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
                </div>
              </StaggerItem>
            );
          })}
        </Stagger>
      </section>

      {/* ── Features ────────────────────────────────────────── */}
      <section id="features" className="border-t border-border bg-card/40">
        <div className="mx-auto max-w-6xl px-5 py-20">
          <Reveal className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-semibold tracking-tight">
              Everything you need to close the gap
            </h2>
          </Reveal>
          <Stagger className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <StaggerItem key={f.title}>
                  <Lift className="h-full">
                    <div className="h-full rounded-2xl border border-border bg-background p-5 shadow-[var(--elevation-1)]">
                      <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary">
                        <Icon className="h-5 w-5" />
                      </div>
                      <h3 className="mt-4 text-sm font-semibold">{f.title}</h3>
                      <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                        {f.body}
                      </p>
                    </div>
                  </Lift>
                </StaggerItem>
              );
            })}
          </Stagger>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-5 py-20">
        <Reveal>
          <div
            className="overflow-hidden rounded-3xl border border-primary/20 px-8 py-14 text-center shadow-[var(--elevation-2)]"
            style={{
              background:
                "radial-gradient(900px 360px at 50% 0%, color-mix(in oklch, var(--primary) 18%, var(--card)) 0%, var(--card) 70%)",
            }}
          >
            <h2 className="mx-auto max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
              Build a profile that proves it.
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
              Create your competency profile in minutes, or explore the platform with a ready-made
              demo account.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                to="/signup"
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-5 py-3 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-[color:var(--primary-hover)]"
              >
                Get started free <ArrowRight className="h-4 w-4" />
              </Link>
              <button
                onClick={tryDemo}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-5 py-3 text-sm font-medium transition-colors hover:bg-accent"
              >
                <Play className="h-4 w-4 text-primary" /> Try the live demo
              </button>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ── Footer ──────────────────────────────────────────── */}
      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-5 py-8 text-sm text-muted-foreground sm:flex-row">
          <div className="flex items-center gap-2">
            <div className="grid h-6 w-6 place-items-center rounded-md bg-primary text-primary-foreground">
              <GraduationCap className="h-3.5 w-3.5" />
            </div>
            Competency Gap Tracker
          </div>
          <div className="flex items-center gap-5">
            <Link to="/login" className="transition-colors hover:text-foreground">
              Sign in
            </Link>
            <Link to="/signup" className="transition-colors hover:text-foreground">
              Sign up
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* Animated hero "profile" card. */
function HeroCard({ reduce }: { reduce: boolean }) {
  const bars = [
    { label: "Problem Solving", v: 8 },
    { label: "Communication", v: 6 },
    { label: "Teamwork", v: 7 },
    { label: "Technical Writing", v: 8 },
  ];
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 24, rotate: -1 }}
      animate={{ opacity: 1, y: 0, rotate: 0 }}
      transition={{ duration: 0.7, ease: EASE, delay: 0.1 }}
      className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-[var(--elevation-3)]"
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs text-muted-foreground">Career readiness</div>
          <div className="mt-0.5 text-4xl font-semibold tracking-tight">
            <AnimatedNumber value={72} suffix="%" />
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-md bg-success/15 px-2 py-1 text-xs font-medium text-success">
          <TrendingUp className="h-3.5 w-3.5" /> On track
        </span>
      </div>
      <div className="mt-6 space-y-3.5">
        {bars.map((b, i) => (
          <div key={b.label} className="flex items-center gap-3 text-xs">
            <span className="w-28 shrink-0 text-muted-foreground">{b.label}</span>
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
              <motion.div
                className="h-full rounded-full bg-primary"
                initial={reduce ? false : { width: 0 }}
                animate={{ width: `${b.v * 10}%` }}
                transition={{ duration: 0.9, ease: EASE, delay: 0.4 + i * 0.12 }}
              />
            </div>
            <span className="w-9 text-right font-mono text-muted-foreground">{b.v}/10</span>
          </div>
        ))}
      </div>
      <div className="mt-6 flex items-center gap-2 rounded-lg border border-primary/15 bg-primary/5 p-3">
        <Sparkles className="h-4 w-4 shrink-0 text-primary" />
        <p className="text-xs text-muted-foreground">
          Raise <span className="font-medium text-foreground">Communication</span> by 2 to clear the
          Software Engineer benchmark.
        </p>
      </div>
    </motion.div>
  );
}
