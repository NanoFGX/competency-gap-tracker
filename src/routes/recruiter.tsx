import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, Check, Minus, X, ShieldCheck, Star, ExternalLink, Zap } from "lucide-react";
import {
  COMPETENCIES, students, evidence as allEvidence, careerTargets,
  latestScores, readinessScore, strengthsWeaknesses, type Competency, type Evidence,
} from "@/lib/mock-data";
import { Card, CardHeader, PageHeader } from "@/components/page-header";
import { Pill } from "@/components/badges";

export const Route = createFileRoute("/recruiter")({
  head: () => ({ meta: [{ title: "Candidates — Recruiter" }] }),
  component: RecruiterPage,
});

type Decision = "Confirmed" | "Partial" | "Needs proof";

function RecruiterPage() {
  const roles = Object.keys(careerTargets);
  const [roleTarget, setRoleTarget] = useState(roles[0]);
  const [query, setQuery] = useState("");
  const [minReadiness, setMinReadiness] = useState(0);
  const [selectedId, setSelectedId] = useState(students[0].id);
  const [reviewing, setReviewing] = useState<Evidence | null>(null);
  const [decisions, setDecisions] = useState<Record<string, Decision>>({});

  const target = careerTargets[roleTarget];

  const ranked = useMemo(() => {
    return students
      .map((s) => {
        const scores = latestScores(s.id);
        const readiness = readinessScore(scores);
        const fit = Math.round((COMPETENCIES.filter((c) => scores[c] >= target[c]).length / COMPETENCIES.length) * 100);
        return { ...s, scores, readiness, fit };
      })
      .filter((s) => s.name.toLowerCase().includes(query.toLowerCase()) && s.readiness >= minReadiness)
      .sort((a, b) => b.fit - a.fit || b.readiness - a.readiness);
  }, [query, minReadiness, roleTarget]);

  const selected = students.find((s) => s.id === selectedId)!;
  const scores = latestScores(selected.id);
  const readiness = readinessScore(scores);
  const { strengths } = strengthsWeaknesses(scores);
  const fit = Math.round((COMPETENCIES.filter((c) => scores[c] >= target[c]).length / COMPETENCIES.length) * 100);
  const candidateEvidence = allEvidence.filter((e) => e.studentId === selected.id);

  return (
    <>
      <PageHeader
        title="Candidate pipeline"
        description="Screen final-year students by mentor-validated competency, not just CGPA. Compare each profile against a target role and validate claims in seconds."
        actions={
          <label className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground hidden sm:inline">Target role</span>
            <select
              value={roleTarget}
              onChange={(e) => setRoleTarget(e.target.value)}
              className="rounded-md border border-input bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {roles.map((r) => (<option key={r}>{r}</option>))}
            </select>
          </label>
        }
      />

      {/* filters */}
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search candidates"
            className="w-full rounded-md border border-input bg-background pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <label className="flex items-center gap-2.5 text-sm text-muted-foreground">
          Min readiness
          <input type="range" min={0} max={100} step={5} value={minReadiness}
            onChange={(e) => setMinReadiness(Number(e.target.value))}
            className="w-32 accent-[color:var(--primary)]" />
          <span className="font-mono text-foreground w-9 text-right">{minReadiness}%</span>
        </label>
        <span className="text-sm text-muted-foreground">{ranked.length} shown</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* candidate list */}
        <div className="lg:col-span-1 space-y-3">
          {ranked.map((s, i) => {
            const active = s.id === selectedId;
            return (
              <button
                key={s.id}
                onClick={() => setSelectedId(s.id)}
                style={{ animationDelay: `${i * 50}ms` }}
                className={`cgt-rise w-full text-left rounded-lg border bg-card p-4 transition-colors ${
                  active ? "border-primary ring-1 ring-primary/30" : "border-border hover:border-muted-foreground/40"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold truncate">{s.name}</div>
                    <div className="text-xs text-muted-foreground truncate">{s.program}</div>
                  </div>
                  <Donut value={s.fit} size={44} label="fit" />
                </div>
                <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1"><Star className="h-3 w-3 text-[color:var(--warning)]" /> {s.readiness}% ready</span>
                  {i === 0 && <Pill tone="strong">Top match</Pill>}
                </div>
              </button>
            );
          })}
          {ranked.length === 0 && (
            <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              No candidates meet these filters.
            </div>
          )}
        </div>

        {/* candidate detail */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <div className="p-5 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <Donut value={fit} size={68} label="role fit" />
                <div>
                  <div className="text-lg font-semibold tracking-tight">{selected.name}</div>
                  <div className="text-sm text-muted-foreground">{selected.email}</div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {strengths.map((c) => (<Pill key={c} tone="strong">{c}</Pill>))}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-semibold tracking-tight">{readiness}%</div>
                <div className="text-xs text-muted-foreground">overall readiness</div>
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader title="Competency vs role target" description={`Bars are mentor-validated scores; the marker is the ${roleTarget} requirement.`} />
            <div className="p-5 space-y-3">
              {COMPETENCIES.map((c) => {
                const v = scores[c]; const t = target[c]; const met = v >= t;
                return (
                  <div key={c} className="flex items-center gap-3 text-sm">
                    <span className="w-36 shrink-0 text-muted-foreground">{c}</span>
                    <div className="relative flex-1 h-3.5 rounded bg-muted border border-border">
                      <div className={`absolute inset-y-0 left-0 rounded ${met ? "bg-[color:var(--success)]" : "bg-primary"}`} style={{ width: `${(v / 5) * 100}%` }} />
                      <div className="absolute -top-1 -bottom-1 w-0.5 bg-foreground" style={{ left: `${(t / 5) * 100}%` }} title={`target ${t}/5`} />
                    </div>
                    <span className={`w-12 text-right font-mono text-xs ${met ? "text-[color:var(--success)]" : "text-muted-foreground"}`}>{v}/{t}</span>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card>
            <CardHeader title="Validate claims" description="Confirm evidence in under 30 seconds. Verified claims raise the candidate's trust signal." />
            <ul className="divide-y divide-border">
              {candidateEvidence.map((e) => {
                const d = decisions[e.id];
                return (
                  <li key={e.id} className="px-5 py-3.5 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-sm font-medium flex items-center gap-2">
                        {e.title}
                        {e.link && <ExternalLink className="h-3 w-3 text-muted-foreground" />}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">{e.type} · {e.competencies.join(", ")}</div>
                    </div>
                    <div className="shrink-0">
                      {d ? (
                        <DecisionBadge decision={d} />
                      ) : (
                        <button
                          onClick={() => setReviewing(e)}
                          className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                        >
                          <Zap className="h-3.5 w-3.5" /> Quick-validate
                        </button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </Card>
        </div>
      </div>

      {reviewing && (
        <QuickValidate
          evidence={reviewing}
          onClose={() => setReviewing(null)}
          onDecide={(d) => { setDecisions((prev) => ({ ...prev, [reviewing.id]: d })); setReviewing(null); }}
        />
      )}
    </>
  );
}

function Donut({ value, size = 56, label }: { value: number; size?: number; label?: string }) {
  const r = (size - 8) / 2;
  const c = 2 * Math.PI * r;
  const off = c - (value / 100) * c;
  const stroke = value >= 67 ? "var(--success)" : value >= 34 ? "var(--primary)" : "var(--warning)";
  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--muted)" strokeWidth={4} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={stroke} strokeWidth={4}
          strokeDasharray={c} strokeDashoffset={off} strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 600ms var(--ease-out)" }} />
      </svg>
      <div className="absolute text-center leading-none">
        <div className="font-semibold" style={{ fontSize: size * 0.26 }}>{value}</div>
        {label && size >= 60 && <div className="text-[9px] text-muted-foreground mt-0.5">{label}</div>}
      </div>
    </div>
  );
}

function DecisionBadge({ decision }: { decision: Decision }) {
  const map = {
    Confirmed: { tone: "strong" as const, icon: Check },
    Partial: { tone: "developing" as const, icon: Minus },
    "Needs proof": { tone: "weak" as const, icon: X },
  };
  const { tone, icon: Icon } = map[decision];
  return <Pill tone={tone}><Icon className="h-3 w-3 mr-1 inline" />{decision}</Pill>;
}

function QuickValidate({ evidence, onClose, onDecide }: { evidence: Evidence; onClose: () => void; onDecide: (d: Decision) => void }) {
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-foreground/40 p-4"
      onClick={onClose}
      style={{ animation: "cgt-rise 0.18s var(--ease-out)" }}
    >
      <div
        role="dialog" aria-modal="true" aria-label="Quick validate claim"
        onClick={(e) => e.stopPropagation()}
        className="w-[480px] max-w-full rounded-xl border border-border bg-popover p-5 shadow-xl origin-center"
        style={{ animation: "cgt-rise 0.2s var(--ease-out)" }}
      >
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5" /> Step 2 of 3 · review claim</span>
        </div>
        <div className="mt-2 flex gap-1.5">
          <span className="h-1.5 flex-1 rounded-full bg-primary" />
          <span className="h-1.5 flex-1 rounded-full bg-primary" />
          <span className="h-1.5 flex-1 rounded-full bg-muted" />
        </div>

        <div className="mt-4 rounded-lg border border-border bg-muted/40 p-3">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Claim</div>
          <div className="text-sm font-medium mt-0.5">{evidence.title}</div>
          <p className="text-xs text-muted-foreground mt-1">{evidence.description}</p>
        </div>
        <div className="mt-2 rounded-lg border border-border bg-muted/40 p-3">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Maps to</div>
          <div className="mt-1 flex flex-wrap gap-1.5">
            {evidence.competencies.map((c) => (<Pill key={c}>{c}</Pill>))}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          <button onClick={() => onDecide("Confirmed")}
            className="inline-flex items-center justify-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            <Check className="h-4 w-4" /> Confirm
          </button>
          <button onClick={() => onDecide("Partial")}
            className="inline-flex items-center justify-center gap-1.5 rounded-md border border-border bg-background px-3 py-2 text-sm font-medium hover:bg-accent">
            <Minus className="h-4 w-4" /> Partial
          </button>
          <button onClick={() => onDecide("Needs proof")}
            className="inline-flex items-center justify-center gap-1.5 rounded-md border border-border bg-background px-3 py-2 text-sm font-medium hover:bg-accent">
            <X className="h-4 w-4" /> Needs proof
          </button>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <button onClick={onClose} className="rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent">Cancel</button>
          <span className="text-xs text-muted-foreground">Plain words mirror a real mentor's judgement.</span>
        </div>
      </div>
    </div>
  );
}
