import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Palette, Type, Component, Sparkles, ShieldCheck, GraduationCap, ClipboardCheck,
  Eye, MousePointerClick, Ban, Loader2, Target, CheckCircle2,
} from "lucide-react";
import { Card, CardHeader, PageHeader } from "@/components/page-header";
import { Pill, StatusBadge } from "@/components/badges";
import { Banner } from "@/components/ui";
import { Button, Input, Select, Textarea, FieldLabel } from "@/components/ui-kit";

export const Route = createFileRoute("/design-system")({
  head: () => ({ meta: [{ title: "Design System — Competency Tracker" }] }),
  component: DesignSystemPage,
});

/* ── colour + type data ─────────────────────────────────────────────────── */
const BRAND = [
  { name: "Primary", role: "Actions, focus, brand", hex: "#4F46E5", varName: "--primary", fg: "--primary-foreground" },
  { name: "Secondary", role: "Structure, data surfaces", hex: "#475569", varName: "--secondary-foreground", fg: "--card" },
];
const FUNCTIONAL = [
  { name: "Success", role: "Approved · target met", hex: "#16A34A", varName: "--success", fg: "--success-foreground" },
  { name: "Warning", role: "Pending · attention", hex: "#D97706", varName: "--warning", fg: "--warning-foreground" },
  { name: "Error", role: "Rejected · destructive", hex: "#DC2626", varName: "--destructive", fg: "--destructive-foreground" },
];
const NEUTRALS = [
  { name: "Background", varName: "--background" },
  { name: "Card", varName: "--card" },
  { name: "Muted", varName: "--muted" },
  { name: "Border", varName: "--border" },
  { name: "Muted text", varName: "--muted-foreground" },
  { name: "Foreground", varName: "--foreground" },
];

const TYPE_SCALE = [
  { label: "Display", cls: "text-3xl font-semibold tracking-tight", spec: "Inter SemiBold · 30/36" },
  { label: "Heading 1", cls: "text-2xl font-semibold tracking-tight", spec: "Inter SemiBold · 24/32" },
  { label: "Heading 2", cls: "text-lg font-semibold", spec: "Inter SemiBold · 18/28" },
  { label: "Heading 3", cls: "text-sm font-semibold", spec: "Inter SemiBold · 14/20" },
  { label: "Body", cls: "text-sm", spec: "Inter Regular · 14/22" },
  { label: "Small / caption", cls: "text-xs text-muted-foreground", spec: "Inter Regular · 12/16" },
];

/* ── persona pain → feature crosswalk ───────────────────────────────────── */
type Row = { pain: string; feature: string; where: string; heuristic: string };

const STUDENT: Row[] = [
  { pain: "“I can’t tell if I’m actually job-ready or what’s holding me back.”", feature: "Career-readiness %, radar profile and role-readiness bars", where: "Dashboard", heuristic: "#1 Visibility of status" },
  { pain: "“My soft skills are invisible on a CV or GPA.”", feature: "6-competency model with mentor-validated scores + evidence mapping", where: "Evidence · Profile", heuristic: "#6 Recognition over recall" },
  { pain: "“I don’t know what a specific role actually requires.”", feature: "Gap breakdown vs role benchmark, priority gaps, fit-across-roles", where: "Career Target", heuristic: "#2 Match the real world" },
  { pain: "“I over/under-estimate my own ability.”", feature: "Self-check: self-rating vs mentor scores, calibration blind-spots", where: "Self-check", heuristic: "#9 Recognise & diagnose" },
  { pain: "“I can’t see whether I’m improving.”", feature: "Progression timeline + growth delta + AI next-milestone", where: "Progression", heuristic: "#1 Visibility of status" },
  { pain: "“Submitting work is fiddly and I’m afraid of mistakes.”", feature: "Guided form with inline validation, confirm + withdraw", where: "Evidence", heuristic: "#5 Error prevention" },
];
const RECRUITER: Row[] = [
  { pain: "“CV claims are unverifiable — I waste time on unqualified candidates.”", feature: "Mentor-validated scores, approval rate and evidence audit trail", where: "Candidates", heuristic: "#1 Visibility of status" },
  { pain: "“Comparing candidates is slow and subjective.”", feature: "Pipeline ranked by role-fit + readiness; cohort table & gap heatmap", where: "Candidates · Role benchmarks", heuristic: "#6 Recognition over recall" },
  { pain: "“I can’t map a candidate to a role’s real needs.”", feature: "Per-role hire recommendation: Recommend / Consider / Not ready", where: "Role benchmarks", heuristic: "#2 Match the real world" },
  { pain: "“Dense data is exhausting to scan.”", feature: "Low-intensity palette, clear data grids, donuts & marker bars", where: "All recruiter views", heuristic: "#8 Aesthetic & minimal" },
];
const MENTOR: Row[] = [
  { pain: "“Scoring is inconsistent without a shared rubric.”", feature: "1–10 rubric with a descriptor for every level, score-all-competencies", where: "Validate claims", heuristic: "#4 Consistency & standards" },
  { pain: "“I might approve or reject by mistake.”", feature: "Confirmation dialogs on every decision + one-click Undo", where: "Validate claims", heuristic: "#5 Error prevention · #3 Control" },
  { pain: "“It’s hard to track what I’ve already decided.”", feature: "Decision log + per-student pending/approved counters", where: "Validate claims", heuristic: "#1 Visibility of status" },
  { pain: "“I need full context to evaluate fairly.”", feature: "Complete description, links, and highlighted claimed competencies", where: "Validate claims", heuristic: "#6 Recognition over recall" },
];

const HEURISTICS: { n: string; name: string; where: string }[] = [
  { n: "1", name: "Visibility of system status", where: "Readiness %, status badges, step indicators, toasts" },
  { n: "2", name: "Match between system & real world", where: "“Career-ready”, role names, 1–10 level labels" },
  { n: "3", name: "User control & freedom", where: "Cancel/Close, Esc-to-close, Withdraw, Undo, theme toggle" },
  { n: "4", name: "Consistency & standards", where: "Shared component kit, one rubric, design tokens" },
  { n: "5", name: "Error prevention", where: "Confirm dialogs, inline validation, separated destructive actions" },
  { n: "6", name: "Recognition rather than recall", where: "Score legend, info tooltips, demo quick-fill, persistent labels" },
  { n: "7", name: "Flexibility & efficiency of use", where: "Search, filters, role/student switchers, keyboard support" },
  { n: "8", name: "Aesthetic & minimalist design", where: "Low-intensity palette, clear hierarchy, generous whitespace" },
  { n: "9", name: "Help users recognise & recover from errors", where: "Specific field-level errors, recovery banners" },
  { n: "10", name: "Help & documentation", where: "Metric tooltips and this living design-system page" },
];

function DesignSystemPage() {
  const [inputVal, setInputVal] = useState("Aisha Rahman");

  return (
    <>
      <PageHeader
        eyebrow="Reference"
        icon={<Palette className="h-5 w-5" />}
        title="Design System"
        description="The single source of truth for Competency Gap Tracker — tokens, type, interactive components and the persona pain-to-feature audit trail. Direction A “Trust Indigo”, fully themeable for light and dark."
      />

      {/* ───────── COLOUR ───────── */}
      <SectionTitle icon={<Palette className="h-4 w-4" />} title="Colour" sub="1 primary · 1 secondary · 3 functional · accessible neutrals (WCAG AA)" />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="Brand & functional" description="Every colour carries meaning — the Rule of Visual Meaning" />
          <div className="grid grid-cols-1 gap-3 p-5 sm:grid-cols-2">
            {[...BRAND, ...FUNCTIONAL].map((c) => (
              <div key={c.name} className="flex items-center gap-3 rounded-lg border border-border p-3">
                <div
                  className="grid h-12 w-12 shrink-0 place-items-center rounded-lg text-[10px] font-semibold"
                  style={{ background: `var(${c.varName})`, color: `var(${c.fg})` }}
                >
                  Aa
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-semibold">{c.name}</div>
                  <div className="text-xs text-muted-foreground">{c.role}</div>
                  <div className="font-mono text-[11px] text-muted-foreground/80">{c.hex}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader title="Neutrals & surfaces" description="Layering scale used for backgrounds, cards and text" />
          <div className="space-y-2 p-5">
            {NEUTRALS.map((c) => (
              <div key={c.name} className="flex items-center gap-3">
                <div className="h-8 w-8 shrink-0 rounded-md border border-border" style={{ background: `var(${c.varName})` }} />
                <div className="text-sm">{c.name}</div>
                <code className="ml-auto font-mono text-[11px] text-muted-foreground">{c.varName}</code>
              </div>
            ))}
            <p className="pt-2 text-xs text-muted-foreground">
              Swatches read live CSS variables — toggle the theme in the sidebar to watch every token re-map.
            </p>
          </div>
        </Card>
      </div>

      {/* ───────── TYPE ───────── */}
      <SectionTitle icon={<Type className="h-4 w-4" />} title="Typography" sub="Inter for UI · JetBrains Mono for scores and data" />
      <Card>
        <div className="divide-y divide-border">
          {TYPE_SCALE.map((t) => (
            <div key={t.label} className="flex items-baseline justify-between gap-4 px-5 py-3.5">
              <span className={t.cls}>{t.label}</span>
              <span className="shrink-0 font-mono text-[11px] text-muted-foreground">{t.spec}</span>
            </div>
          ))}
          <div className="flex items-baseline justify-between gap-4 px-5 py-3.5">
            <span className="font-mono text-sm">Problem Solving · 8/10</span>
            <span className="shrink-0 font-mono text-[11px] text-muted-foreground">JetBrains Mono · numeric</span>
          </div>
        </div>
      </Card>

      {/* ───────── COMPONENTS ───────── */}
      <SectionTitle icon={<Component className="h-4 w-4" />} title="Component library" sub="Reusable master components — hover and click them, the states are real" />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Buttons */}
        <Card>
          <CardHeader title="Buttons" description="6 variants · hover, active (press), focus, disabled & loading states" />
          <div className="space-y-4 p-5">
            <div className="flex flex-wrap gap-2">
              <Button variant="primary">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="destructive">Destructive</Button>
              <Button variant="success">Success</Button>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button size="sm">Small</Button>
              <Button size="md">Medium</Button>
              <Button size="lg">Large</Button>
              <Button loading>Saving</Button>
              <Button disabled>Disabled</Button>
            </div>
            <div className="flex flex-wrap gap-2 text-[11px] text-muted-foreground">
              <StateChip icon={<MousePointerClick className="h-3 w-3" />} label="hover → brand-darkens" />
              <StateChip icon={<Eye className="h-3 w-3" />} label="focus → 2px ring" />
              <StateChip icon={<Loader2 className="h-3 w-3" />} label="loading → spinner" />
              <StateChip icon={<Ban className="h-3 w-3" />} label="disabled → 50% + no events" />
            </div>
          </div>
        </Card>

        {/* Form fields */}
        <Card>
          <CardHeader title="Form fields" description="One focus treatment everywhere · default, focus and error" />
          <div className="space-y-3 p-5">
            <div>
              <FieldLabel>Default input</FieldLabel>
              <Input value={inputVal} onChange={(e) => setInputVal(e.target.value)} placeholder="Type here" />
            </div>
            <div>
              <FieldLabel>Select</FieldLabel>
              <Select defaultValue="Software Engineer">
                <option>Software Engineer</option>
                <option>AI Engineer</option>
                <option>UX Engineer</option>
              </Select>
            </div>
            <div>
              <FieldLabel>Error state</FieldLabel>
              <Input invalid placeholder="Required field" defaultValue="" />
              <p className="mt-1 text-xs text-destructive">This field is required.</p>
            </div>
            <div>
              <FieldLabel>Textarea</FieldLabel>
              <Textarea rows={2} placeholder="Structured feedback…" />
            </div>
          </div>
        </Card>

        {/* Badges */}
        <Card>
          <CardHeader title="Badges & status" description="Token-derived tones — legible in light and dark" />
          <div className="space-y-4 p-5">
            <div className="flex flex-wrap gap-2">
              <StatusBadge status="Approved" />
              <StatusBadge status="Pending" />
              <StatusBadge status="Rejected" />
            </div>
            <div className="flex flex-wrap gap-2">
              <Pill tone="strong">Strong · 8/10</Pill>
              <Pill tone="developing">Developing</Pill>
              <Pill tone="weak">Needs work</Pill>
              <Pill tone="warning">At risk</Pill>
              <Pill tone="info">Active</Pill>
            </div>
          </div>
        </Card>

        {/* Progress + banners */}
        <Card>
          <CardHeader title="Data viz & feedback" description="Marker progress bar + system banners" />
          <div className="space-y-4 p-5">
            <MarkerBar label="Problem Solving" value={8} target={10} />
            <MarkerBar label="UX Empathy" value={4} target={6} />
            <div className="space-y-2">
              <Banner type="success" message="Evidence approved — scores added to your profile." />
              <Banner type="warning" message="Submission is pending mentor review." />
              <Banner type="error" message="Couldn’t submit — check the highlighted fields." />
            </div>
          </div>
        </Card>
      </div>

      {/* ───────── MOTION ───────── */}
      <SectionTitle icon={<Sparkles className="h-4 w-4" />} title="Motion" sub="Purposeful micro-interactions · respects prefers-reduced-motion" />
      <Card>
        <div className="grid grid-cols-1 gap-px overflow-hidden rounded-xl bg-border sm:grid-cols-3">
          {[
            { t: "Entrance", d: "Content rises + fades on mount (cgt-rise / cgt-stagger)" },
            { t: "Press", d: "Every button scales to 0.97 on :active" },
            { t: "Transitions", d: "Bars, donuts & nav animate over 160–700ms" },
          ].map((m) => (
            <div key={m.t} className="bg-card p-4">
              <div className="text-sm font-semibold">{m.t}</div>
              <div className="mt-1 text-xs text-muted-foreground">{m.d}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* ───────── PAIN → FEATURE CROSSWALK ───────── */}
      <SectionTitle icon={<Target className="h-4 w-4" />} title="Pain-to-Feature crosswalk" sub="Form follows friction — every feature resolves a documented persona pain" />
      <div className="space-y-4">
        <CrosswalkTable
          persona="Student"
          tag="Final-year CS jobseeker"
          icon={<GraduationCap className="h-4 w-4" />}
          rows={STUDENT}
        />
        <CrosswalkTable
          persona="Recruiter"
          tag="Screening many candidates"
          icon={<ShieldCheck className="h-4 w-4" />}
          rows={RECRUITER}
        />
        <CrosswalkTable
          persona="Mentor / Lecturer"
          tag="Validating evidence"
          icon={<ClipboardCheck className="h-4 w-4" />}
          rows={MENTOR}
        />
      </div>

      {/* ───────── HEURISTICS ───────── */}
      <SectionTitle icon={<CheckCircle2 className="h-4 w-4" />} title="Nielsen heuristic index" sub="Where each of the 10 usability heuristics is applied in the product" />
      <Card className="mb-4">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                <th className="px-5 py-3 font-medium">#</th>
                <th className="px-5 py-3 font-medium">Heuristic</th>
                <th className="px-5 py-3 font-medium">Applied in</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {HEURISTICS.map((h) => (
                <tr key={h.n} className="transition-colors hover:bg-muted/30">
                  <td className="px-5 py-3">
                    <span className="grid h-6 w-6 place-items-center rounded-md bg-primary/10 font-mono text-xs font-semibold text-primary">{h.n}</span>
                  </td>
                  <td className="px-5 py-3 font-medium">{h.name}</td>
                  <td className="px-5 py-3 text-muted-foreground">{h.where}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}

/* ── helpers ─────────────────────────────────────────────────────────────── */
function SectionTitle({ icon, title, sub }: { icon: React.ReactNode; title: string; sub: string }) {
  return (
    <div className="mb-3 mt-9 flex items-center gap-2.5 first:mt-0">
      <span className="grid h-7 w-7 place-items-center rounded-md bg-primary/10 text-primary">{icon}</span>
      <div>
        <h2 className="text-sm font-semibold tracking-tight">{title}</h2>
        <p className="text-xs text-muted-foreground">{sub}</p>
      </div>
    </div>
  );
}

function StateChip({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-md border border-border bg-muted/40 px-2 py-1">
      {icon} {label}
    </span>
  );
}

function MarkerBar({ label, value, target }: { label: string; value: number; target: number }) {
  const met = value >= target;
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="w-32 shrink-0 text-xs text-muted-foreground">{label}</span>
      <div className="relative h-2.5 flex-1 rounded-full border border-border bg-muted">
        <div
          className="absolute inset-y-0 left-0 rounded-full transition-all duration-700"
          style={{ width: `${(value / 10) * 100}%`, background: met ? "var(--success)" : "var(--primary)" }}
        />
        <div className="absolute -top-1 -bottom-1 w-0.5 bg-foreground/55" style={{ left: `${(target / 10) * 100}%` }} title={`target ${target}`} />
      </div>
      <span className={`w-10 text-right font-mono text-xs ${met ? "text-success" : "text-muted-foreground"}`}>{value}/{target}</span>
    </div>
  );
}

function CrosswalkTable({ persona, tag, icon, rows }: { persona: string; tag: string; icon: React.ReactNode; rows: Row[] }) {
  return (
    <Card>
      <div className="flex items-center gap-3 border-b border-border px-5 py-4">
        <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/15">{icon}</span>
        <div>
          <h3 className="text-sm font-semibold">{persona}</h3>
          <p className="text-xs text-muted-foreground">{tag}</p>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-[11px] uppercase tracking-wider text-muted-foreground">
              <th className="px-5 py-3 font-medium">Persona pain</th>
              <th className="px-5 py-3 font-medium">Hi-fi feature that resolves it</th>
              <th className="hidden px-5 py-3 font-medium md:table-cell">Where</th>
              <th className="hidden px-5 py-3 font-medium lg:table-cell">Heuristic</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((r, i) => (
              <tr key={i} className="align-top transition-colors hover:bg-muted/30">
                <td className="px-5 py-3 italic text-muted-foreground">{r.pain}</td>
                <td className="px-5 py-3">{r.feature}</td>
                <td className="hidden px-5 py-3 md:table-cell"><Pill tone="info">{r.where}</Pill></td>
                <td className="hidden px-5 py-3 text-xs text-muted-foreground lg:table-cell">{r.heuristic}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
