import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Search,
  Star,
  FileText,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  BarChart2,
  Users,
} from "lucide-react";
import {
  COMPETENCIES,
  students,
  evidence as allEvidence,
  evaluations,
  careerTargets,
  latestScores,
  readinessScore,
  strengthsWeaknesses,
  type Competency,
} from "@/lib/mock-data";
import { Card, CardHeader, PageHeader } from "@/components/page-header";
import { Pill } from "@/components/badges";
import { avatarStyle, initials } from "@/components/ui-kit";

export const Route = createFileRoute("/recruiter")({
  head: () => ({ meta: [{ title: "Candidates — Recruiter" }] }),
  component: RecruiterPage,
});

function RecruiterPage() {
  const roles = Object.keys(careerTargets);
  const [roleTarget, setRoleTarget] = useState(roles[0]);
  const [query, setQuery] = useState("");
  const [minReadiness, setMinReadiness] = useState(0);
  const [selectedId, setSelectedId] = useState(students[0].id);

  const target = careerTargets[roleTarget];

  const ranked = useMemo(() => {
    return students
      .map((s, i) => {
        const scores = latestScores(s.id);
        const readiness = readinessScore(scores);
        const fit = Math.round(
          (COMPETENCIES.filter((c) => scores[c] >= target[c]).length / COMPETENCIES.length) * 100,
        );
        return { ...s, scores, readiness, fit, colorIdx: i };
      })
      .filter(
        (s) => s.name.toLowerCase().includes(query.toLowerCase()) && s.readiness >= minReadiness,
      )
      .sort((a, b) => b.fit - a.fit || b.readiness - a.readiness);
  }, [query, minReadiness, roleTarget]);

  const selected = students.find((s) => s.id === selectedId)!;
  const selectedIdx = students.findIndex((s) => s.id === selectedId);
  const scores = latestScores(selected.id);
  const readiness = readinessScore(scores);
  const { strengths } = strengthsWeaknesses(scores);
  const fit = Math.round(
    (COMPETENCIES.filter((c) => scores[c] >= target[c]).length / COMPETENCIES.length) * 100,
  );
  const candidateEvidence = allEvidence.filter((e) => e.studentId === selected.id);
  const approvedEvidence = candidateEvidence.filter((e) => e.status === "Approved");
  const pendingEvidence = candidateEvidence.filter((e) => e.status === "Pending");
  const approvalRate =
    candidateEvidence.length > 0
      ? Math.round((approvedEvidence.length / candidateEvidence.length) * 100)
      : 0;
  const candidateEvals = evaluations
    .filter((e) => e.studentId === selected.id)
    .sort((a, b) => a.date.localeCompare(b.date));
  const topCompetency = [...COMPETENCIES].sort((a, b) => scores[b] - scores[a])[0];
  const weakestCompetency = [...COMPETENCIES].sort((a, b) => scores[a] - scores[b])[0];
  const gapCount = COMPETENCIES.filter((c) => scores[c] < target[c]).length;
  const totalGap = COMPETENCIES.reduce((s, c) => s + Math.max(0, target[c] - scores[c]), 0);
  const firstEval = candidateEvals[0];
  const lastEval = candidateEvals.at(-1);
  const firstReadiness = firstEval ? readinessScore(firstEval.scores) : readiness;
  const readinessDelta = readiness - firstReadiness;
  const rejectedEvidence = candidateEvidence.filter((e) => e.status === "Rejected");
  const avgMentorScore =
    candidateEvals.length > 0
      ? (
          candidateEvals.reduce(
            (sum, ev) =>
              sum + COMPETENCIES.reduce((s, c) => s + ev.scores[c], 0) / COMPETENCIES.length,
            0,
          ) / candidateEvals.length
        ).toFixed(1)
      : "—";
  const evidenceTypes = candidateEvidence.reduce(
    (acc, e) => {
      acc[e.type] = (acc[e.type] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  return (
    <>
      <PageHeader
        eyebrow="Recruiter"
        icon={<Users className="h-5 w-5" />}
        title="Candidate pipeline"
        description="Screen final-year students by mentor-validated competency. Compare each profile against a target role."
        actions={
          <label className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground hidden sm:inline">Target role</span>
            <select
              value={roleTarget}
              onChange={(e) => setRoleTarget(e.target.value)}
              className="rounded-md border border-input bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {roles.map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
          </label>
        }
      />

      {/* Filters */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
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
          <input
            type="range"
            min={0}
            max={100}
            step={5}
            value={minReadiness}
            onChange={(e) => setMinReadiness(Number(e.target.value))}
            className="w-28 accent-[color:var(--primary)]"
          />
          <span className="font-mono text-foreground w-9 text-right">{minReadiness}%</span>
        </label>
        <span className="text-sm text-muted-foreground">
          {ranked.length} candidate{ranked.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Candidate selector grid */}
      {ranked.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-10 text-center text-sm text-muted-foreground mb-4">
          No candidates meet these filters.
        </div>
      ) : (
        <div
          className={`grid gap-3 mb-5 ${ranked.length === 1 ? "grid-cols-1 max-w-xs" : ranked.length === 2 ? "grid-cols-2" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"}`}
        >
          {ranked.map((s, i) => {
            const active = s.id === selectedId;
            return (
              <button
                key={s.id}
                onClick={() => setSelectedId(s.id)}
                className={`group text-left rounded-xl border p-4 transition-all ${
                  active
                    ? "border-primary ring-2 ring-primary/20 bg-card shadow-sm"
                    : "border-border bg-card hover:border-muted-foreground/40 hover:shadow-sm"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="h-10 w-10 shrink-0 rounded-full grid place-items-center text-sm font-semibold"
                    style={avatarStyle(s.colorIdx)}
                  >
                    {initials(s.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-sm font-semibold truncate">{s.name}</div>
                      {i === 0 && <Pill tone="strong">Top</Pill>}
                    </div>
                    <div className="text-xs text-muted-foreground truncate mt-0.5">{s.program}</div>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-center">
                      <div className="text-lg font-bold tracking-tight leading-none">{s.fit}%</div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">role fit</div>
                    </div>
                    <div className="h-8 w-px bg-border" />
                    <div className="text-center">
                      <div className="text-lg font-bold tracking-tight leading-none">
                        {s.readiness}%
                      </div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">readiness</div>
                    </div>
                  </div>
                  <div className="flex-1 mx-3">
                    {/* Mini competency bars */}
                    <div className="space-y-1">
                      {COMPETENCIES.slice(0, 3).map((c) => {
                        const v = s.scores[c];
                        const t = target[c];
                        return (
                          <div key={c} className="flex items-center gap-1.5">
                            <div className="relative h-1.5 flex-1 rounded-full bg-muted">
                              <div
                                className={`absolute inset-y-0 left-0 rounded-full ${v >= t ? "bg-[color:var(--success)]" : "bg-primary/70"}`}
                                style={{ width: `${(v / 10) * 100}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <Donut value={s.fit} size={40} />
                </div>

                <div className="mt-3 flex flex-wrap gap-1">
                  {strengthsWeaknesses(s.scores).strengths.map((c) => (
                    <span
                      key={c}
                      className="inline-flex items-center gap-0.5 rounded-md bg-muted/60 border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground"
                    >
                      <Star className="h-2.5 w-2.5 text-[color:var(--warning)]" />
                      {c}
                    </span>
                  ))}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Selected candidate detail */}
      <div className="space-y-4">
        {/* Header card */}
        <Card>
          <div className="p-5 flex flex-wrap items-center gap-5">
            <div
              className="h-14 w-14 shrink-0 rounded-full grid place-items-center text-lg font-bold"
              style={avatarStyle(selectedIdx)}
            >
              {initials(selected.name)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-lg font-semibold tracking-tight">{selected.name}</div>
              <div className="text-sm text-muted-foreground">{selected.email}</div>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {strengths.map((c) => (
                  <Pill key={c} tone="strong">
                    {c}
                  </Pill>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-6 shrink-0">
              <div className="text-center">
                <div className="text-3xl font-semibold tracking-tight">{fit}%</div>
                <div className="text-xs text-muted-foreground">role fit</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-semibold tracking-tight">{readiness}%</div>
                <div className="text-xs text-muted-foreground">overall readiness</div>
              </div>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Competency bars */}
          <Card>
            <CardHeader
              title="Competency vs role target"
              description={`Mentor-validated scores · marker = ${roleTarget} requirement`}
            />
            <div className="p-5 space-y-3">
              {COMPETENCIES.map((c) => {
                const v = scores[c];
                const t = target[c];
                const met = v >= t;
                return (
                  <div key={c} className="flex items-center gap-3 text-sm">
                    <span className="w-32 shrink-0 text-muted-foreground text-xs">{c}</span>
                    <div className="relative flex-1 h-3.5 rounded bg-muted border border-border">
                      <div
                        className={`absolute inset-y-0 left-0 rounded ${met ? "bg-[color:var(--success)]" : "bg-primary"}`}
                        style={{ width: `${(v / 10) * 100}%` }}
                      />
                      <div
                        className="absolute -top-1 -bottom-1 w-0.5 bg-foreground/50"
                        style={{ left: `${(t / 10) * 100}%` }}
                        title={`target ${t}/10`}
                      />
                    </div>
                    <span
                      className={`w-10 text-right font-mono text-xs ${met ? "text-[color:var(--success)]" : "text-muted-foreground"}`}
                    >
                      {v}/{t}
                    </span>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Stats */}
          <Card>
            <CardHeader
              title="Candidate Statistics"
              description="Evidence, approval rate, mentor sessions, and growth"
            />
            <div className="p-5 grid grid-cols-2 gap-3">
              <MiniStat
                icon={<FileText className="h-3.5 w-3.5" />}
                label="Total evidence"
                value={String(candidateEvidence.length)}
              />
              <MiniStat
                icon={<CheckCircle2 className="h-3.5 w-3.5 text-[color:var(--success)]" />}
                label="Approved"
                value={`${approvedEvidence.length} (${approvalRate}%)`}
              />
              <MiniStat
                icon={<AlertCircle className="h-3.5 w-3.5 text-[color:var(--warning)]" />}
                label="Pending review"
                value={String(pendingEvidence.length)}
              />
              <MiniStat
                icon={<BarChart2 className="h-3.5 w-3.5 text-destructive" />}
                label="Rejected"
                value={String(rejectedEvidence.length)}
              />
              <MiniStat
                icon={<TrendingUp className="h-3.5 w-3.5 text-[color:var(--success)]" />}
                label="Readiness growth"
                value={readinessDelta >= 0 ? `+${readinessDelta}%` : `${readinessDelta}%`}
              />
              <MiniStat
                icon={<Star className="h-3.5 w-3.5 text-[color:var(--warning)]" />}
                label="Top competency"
                value={topCompetency}
              />
              <MiniStat
                icon={<BarChart2 className="h-3.5 w-3.5 text-primary" />}
                label="Role gap"
                value={`${gapCount} skills · ${totalGap} pts`}
              />
              <MiniStat
                icon={<CheckCircle2 className="h-3.5 w-3.5 text-primary" />}
                label="Mentor sessions"
                value={String(candidateEvals.length)}
              />
              <MiniStat
                icon={<TrendingUp className="h-3.5 w-3.5 text-muted-foreground" />}
                label="Avg mentor score"
                value={`${avgMentorScore}/10`}
              />
              <MiniStat
                icon={<FileText className="h-3.5 w-3.5 text-muted-foreground" />}
                label="Last reviewed"
                value={lastEval?.date ?? "—"}
              />
            </div>
            {Object.keys(evidenceTypes).length > 0 && (
              <div className="px-5 pb-4">
                <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-2">
                  Evidence by type
                </div>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(evidenceTypes).map(([type, count]) => (
                    <span
                      key={type}
                      className="inline-flex items-center gap-1.5 rounded-md border border-border bg-muted/30 px-2.5 py-1 text-xs"
                    >
                      <span className="font-medium">{count}</span>
                      <span className="text-muted-foreground">{type}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
            <div className="px-5 pb-5">
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                Competency snapshot
              </div>
              <div className="space-y-2">
                {COMPETENCIES.map((c) => {
                  const v = scores[c];
                  const t = target[c];
                  const met = v >= t;
                  return (
                    <div key={c} className="flex items-center gap-3 text-xs">
                      <span className="w-28 shrink-0 text-muted-foreground">{c}</span>
                      <div className="relative flex-1 h-2 rounded bg-muted border border-border">
                        <div
                          className={`absolute inset-y-0 left-0 rounded transition-all duration-500 ${met ? "bg-[color:var(--success)]" : "bg-primary"}`}
                          style={{ width: `${(v / 10) * 100}%` }}
                        />
                        <div
                          className="absolute -top-0.5 -bottom-0.5 w-0.5 bg-foreground/30"
                          style={{ left: `${(t / 10) * 100}%` }}
                        />
                      </div>
                      <span
                        className={`w-8 text-right font-mono ${met ? "text-[color:var(--success)]" : "text-muted-foreground"}`}
                      >
                        {v}/{t}
                      </span>
                      {c === topCompetency && <Pill tone="strong">Top</Pill>}
                      {c === weakestCompetency && !met && <Pill tone="weak">Focus</Pill>}
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}

function MiniStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-muted/30 px-3 py-2.5">
      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mb-1">
        {icon}
        {label}
      </div>
      <div className="text-sm font-semibold">{value}</div>
    </div>
  );
}

function Donut({ value, size = 56 }: { value: number; size?: number }) {
  const r = (size - 8) / 2;
  const c = 2 * Math.PI * r;
  const off = c - (value / 100) * c;
  const stroke = value >= 67 ? "var(--success)" : value >= 34 ? "var(--primary)" : "var(--warning)";
  return (
    <div
      className="relative grid place-items-center shrink-0"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--muted)"
          strokeWidth={3}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={stroke}
          strokeWidth={3}
          strokeDasharray={c}
          strokeDashoffset={off}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 600ms" }}
        />
      </svg>
      <div className="absolute text-center leading-none">
        <div className="font-semibold" style={{ fontSize: size * 0.28 }}>
          {value}
        </div>
      </div>
    </div>
  );
}
