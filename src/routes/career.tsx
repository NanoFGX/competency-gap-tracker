import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from "recharts";
import { TrendingUp, TrendingDown, Minus, AlertTriangle, CheckCircle2, Target, Users, User, ShieldCheck, XCircle, Zap } from "lucide-react";
import { useStudent } from "@/lib/student-context";
import { useRole } from "@/lib/role-context";
import { COMPETENCIES, careerTargets, latestScores, students, evaluations, type Competency } from "@/lib/mock-data";
import { Card, CardHeader, PageHeader } from "@/components/page-header";
import { Pill } from "@/components/badges";
import { InfoIcon } from "@/components/ui";

export const Route = createFileRoute("/career")({
  head: () => ({ meta: [{ title: "Career Target — Competency Tracker" }] }),
  component: CareerPage,
});

const STUDENT_COLORS = [
  "oklch(0.45 0.09 250)",
  "oklch(0.60 0.12 170)",
  "oklch(0.55 0.14 320)",
];

type ViewMode = "single" | "cohort";

function CareerPage() {
  const { student: ctxStudent } = useStudent();
  const { role } = useRole();
  const [selectedRole, setSelectedRole] = useState<keyof typeof careerTargets>("Software Engineer");
  const [viewMode, setViewMode] = useState<ViewMode>("single");
  const [compareStudentId, setCompareStudentId] = useState(ctxStudent.id);

  const target = careerTargets[selectedRole];

  // In recruiter mode we let them pick the student; in student mode always use their own
  const activeStudent = role === "recruiter" ? (students.find((s) => s.id === compareStudentId) ?? ctxStudent) : ctxStudent;
  const scores = latestScores(activeStudent.id);

  const singleData = COMPETENCIES.map((c) => ({
    competency: c,
    [activeStudent.name]: scores[c],
    [`${selectedRole} target`]: target[c],
    gap: Math.max(0, target[c] - scores[c]),
  }));

  const matched = COMPETENCIES.filter((c) => scores[c] >= target[c]);
  const missing = COMPETENCIES.filter((c) => scores[c] < target[c]);
  const priority = COMPETENCIES
    .map((c) => ({ competency: c, gap: Math.max(0, target[c] - scores[c]) }))
    .filter((d) => d.gap > 0)
    .sort((a, b) => b.gap - a.gap)
    .slice(0, 3);

  const totalGapPoints = COMPETENCIES.reduce((s, c) => s + Math.max(0, target[c] - scores[c]), 0);
  const coveragePct = Math.round((matched.length / COMPETENCIES.length) * 100);
  const avgStudentScore = (COMPETENCIES.reduce((s, c) => s + scores[c], 0) / COMPETENCIES.length).toFixed(1);
  const avgTargetScore = (COMPETENCIES.reduce((s, c) => s + target[c], 0) / COMPETENCIES.length).toFixed(1);
  const readinessPct = Math.round((COMPETENCIES.reduce((s, c) => s + scores[c], 0) / (COMPETENCIES.length * 10)) * 100);

  // Growth trend — compare earliest vs latest evaluation
  const studentEvals = evaluations
    .filter((e) => e.studentId === activeStudent.id)
    .sort((a, b) => a.date.localeCompare(b.date));
  const isNewStudent = role === "student" && studentEvals.length === 0;
  const earliestEval = studentEvals[0];
  const earliestReadiness = earliestEval
    ? Math.round((COMPETENCIES.reduce((s, c) => s + earliestEval.scores[c], 0) / (COMPETENCIES.length * 10)) * 100)
    : readinessPct;
  const readinessDelta = readinessPct - earliestReadiness;

  // Critical gaps: student score is below 50 % of the role requirement — a hard blocker
  const criticalGaps = COMPETENCIES.filter((c) => scores[c] < target[c] * 0.5);

  // Surplus: meaningfully exceeds requirement (≥ 2 pts above)
  const surplus = COMPETENCIES.filter((c) => scores[c] >= target[c] + 2);

  // Recruiter-facing decision
  const hireRec =
    coveragePct >= 67 && readinessPct >= 70 && criticalGaps.length === 0
      ? "Recommend"
      : coveragePct >= 50 && readinessPct >= 60 && criticalGaps.length <= 1
      ? "Consider"
      : "Not ready";

  // Student-facing equivalent labels
  const STUDENT_STANDING: Record<string, string> = {
    "Recommend": "Role-ready",
    "Consider": "On track",
    "Not ready": "Developing",
  };
  const studentStandingSub: Record<string, string> = {
    "Recommend": "All key competencies met for this role",
    "Consider": "Good progress — a few gaps still to close",
    "Not ready": `${criticalGaps.length > 0 ? `${criticalGaps.length} critical gap${criticalGaps.length > 1 ? "s" : ""} — ` : ""}keep adding evidence to build your profile`,
  };

  // Cohort data
  const cohortRows = students.map((s, i) => {
    const sc = latestScores(s.id);
    const met = COMPETENCIES.filter((c) => sc[c] >= target[c]).length;
    const rdy = Math.round((COMPETENCIES.reduce((sum, c) => sum + sc[c], 0) / (COMPETENCIES.length * 10)) * 100);
    return {
      id: s.id, name: s.name, coverage: Math.round((met / COMPETENCIES.length) * 100),
      readiness: rdy, scores: sc, color: STUDENT_COLORS[i],
    };
  });
  const cohortAvgCoverage = Math.round(cohortRows.reduce((s, d) => s + d.coverage, 0) / cohortRows.length);

  // Cohort rank for this role (needs cohortRows)
  const cohortRank =
    [...cohortRows].sort((a, b) => b.coverage - a.coverage).findIndex((r) => r.id === activeStudent.id) + 1;

  // Cohort chart data: one row per competency, bars per student + target
  const cohortChartData = COMPETENCIES.map((c) => {
    const entry: Record<string, number | string> = { competency: c, target: target[c] };
    cohortRows.forEach((r) => { entry[r.name] = r.scores[c]; });
    return entry;
  });

  return (
    <>
      <PageHeader
        title={role === "recruiter" ? "Role Benchmarks" : "Career Target Comparison"}
        description={
          role === "recruiter"
            ? "Compare candidate profiles against industry role requirements."
            : "Benchmark your competencies against the profile required for your chosen role."
        }
        actions={
          <div className="flex items-center gap-2">
            {role === "recruiter" && (
              <div className="flex rounded-lg border border-border bg-muted/60 p-0.5 gap-0.5">
                <button
                  onClick={() => setViewMode("single")}
                  className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${viewMode === "single" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                >
                  <User className="h-3.5 w-3.5" /> Single student
                </button>
                <button
                  onClick={() => setViewMode("cohort")}
                  className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${viewMode === "cohort" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                >
                  <Users className="h-3.5 w-3.5" /> All students
                </button>
              </div>
            )}
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as keyof typeof careerTargets)}
              className="rounded-md border border-input bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {Object.keys(careerTargets).map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
        }
      />

      {/* ── EMPTY STATE for new students ─────────────────────── */}
      {isNewStudent ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="h-16 w-16 rounded-2xl bg-muted grid place-items-center mb-5">
            <Target className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-base font-semibold mb-2">No data yet</h3>
          <p className="text-sm text-muted-foreground max-w-xs">
            Submit evidence to see your career target and progression
          </p>
        </div>
      ) : /* ── COHORT VIEW ─────────────────────────────────────── */
      viewMode === "cohort" && role === "recruiter" ? (
        <>
          {/* Cohort summary stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <StatCard icon={<Users className="h-4 w-4 text-primary" />} label="Candidates" value={String(students.length)} sub={`benchmarked vs ${selectedRole}`} />
            <StatCard icon={<CheckCircle2 className="h-4 w-4 text-[color:var(--success)]" />} label="Cohort avg coverage" value={`${cohortAvgCoverage}%`} sub="competency requirements met" />
            <StatCard icon={<TrendingUp className="h-4 w-4 text-[color:var(--success)]" />} label="Top candidate" value={cohortRows.sort((a, b) => b.coverage - a.coverage)[0].name.split(" ")[0]} sub={`${cohortRows.sort((a, b) => b.coverage - a.coverage)[0].coverage}% coverage`} />
            <StatCard icon={<Target className="h-4 w-4 text-muted-foreground" />} label="Avg readiness" value={`${Math.round(cohortRows.reduce((s, d) => s + d.readiness, 0) / cohortRows.length)}%`} sub="across all candidates" />
          </div>

          {/* Grouped bar chart */}
          <Card className="mb-4">
            <CardHeader
              title={`All students vs ${selectedRole}`}
              description="Grouped by competency — darker bar = target requirement"
            />
            <div className="p-5 h-[360px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={cohortChartData} margin={{ top: 5, right: 8, left: -16, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.93 0.006 250)" vertical={false} />
                  <XAxis dataKey="competency" tick={{ fontSize: 11, fill: "oklch(0.45 0.02 260)" }} interval={0} angle={-15} textAnchor="end" height={50} />
                  <YAxis domain={[0, 10]} tick={{ fontSize: 11, fill: "oklch(0.45 0.02 260)" }} />
                  <Tooltip contentStyle={{ background: "white", border: "1px solid oklch(0.92 0.006 250)", borderRadius: 6, fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  {cohortRows.map((r) => (
                    <Bar key={r.id} dataKey={r.name} fill={r.color} radius={[3, 3, 0, 0]} />
                  ))}
                  <Bar dataKey="target" name={`${selectedRole} target`} fill="oklch(0.85 0.02 250)" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Cohort summary table */}
          <Card className="mb-4">
            <CardHeader title="Candidate Comparison" description={`All candidates vs ${selectedRole} requirements`} />
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                    <th className="px-5 py-3 font-medium">Candidate</th>
                    {COMPETENCIES.map((c) => (
                      <th key={c} className="px-3 py-3 font-medium text-center hidden md:table-cell">{c.split(" ")[0]}</th>
                    ))}
                    <th className="px-5 py-3 font-medium text-center">Coverage</th>
                    <th className="px-5 py-3 font-medium text-center">Readiness</th>
                    <th className="px-5 py-3 font-medium">Standing</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {[...cohortRows].sort((a, b) => b.coverage - a.coverage).map((r, i) => (
                    <tr key={r.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-5 py-3 font-medium">{r.name}</td>
                      {COMPETENCIES.map((c) => {
                        const v = r.scores[c]; const t = target[c]; const met = v >= t;
                        return (
                          <td key={c} className="px-3 py-3 text-center hidden md:table-cell">
                            <span className={`font-mono text-xs ${met ? "text-[color:var(--success)]" : "text-destructive"}`}>{v}/{t}</span>
                          </td>
                        );
                      })}
                      <td className="px-5 py-3 text-center">
                        <span className="font-semibold">{r.coverage}%</span>
                      </td>
                      <td className="px-5 py-3 text-center font-mono text-xs">{r.readiness}%</td>
                      <td className="px-5 py-3">
                        <Pill tone={i === 0 ? "strong" : i === cohortRows.length - 1 ? "weak" : "developing"}>
                          {i === 0 ? "Top" : i === cohortRows.length - 1 ? "Needs work" : "Developing"}
                        </Pill>
                      </td>
                    </tr>
                  ))}
                  {/* Target row */}
                  <tr className="bg-muted/20 text-muted-foreground">
                    <td className="px-5 py-3 text-xs font-medium uppercase tracking-wider">{selectedRole} target</td>
                    {COMPETENCIES.map((c) => (
                      <td key={c} className="px-3 py-3 text-center hidden md:table-cell">
                        <span className="font-mono text-xs">{target[c]}/10</span>
                      </td>
                    ))}
                    <td className="px-5 py-3 text-center text-xs">100%</td>
                    <td className="px-5 py-3" colSpan={2} />
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>

          {/* Per-competency gap heatmap */}
          <Card>
            <CardHeader title="Gap Heatmap" description="How far each candidate is from the role requirement per competency" />
            <div className="p-5 space-y-3">
              {COMPETENCIES.map((c) => (
                <div key={c} className="flex items-center gap-3">
                  <span className="w-32 shrink-0 text-xs text-muted-foreground">{c}</span>
                  <div className="flex-1 flex gap-2">
                    {cohortRows.map((r) => {
                      const v = r.scores[c]; const t = target[c]; const met = v >= t;
                      return (
                        <div key={r.id} className="flex-1 flex flex-col items-center gap-1">
                          <div className="relative w-full h-3 rounded bg-muted border border-border">
                            <div
                              className={`absolute inset-y-0 left-0 rounded ${met ? "bg-[color:var(--success)]" : "bg-primary/70"}`}
                              style={{ width: `${(v / 10) * 100}%` }}
                            />
                            <div className="absolute -top-0.5 -bottom-0.5 w-0.5 bg-foreground/40" style={{ left: `${(t / 10) * 100}%` }} />
                          </div>
                          <span className={`text-[10px] font-mono ${met ? "text-[color:var(--success)]" : "text-muted-foreground"}`}>{r.name.split(" ")[0]}</span>
                        </div>
                      );
                    })}
                  </div>
                  <span className="text-[10px] text-muted-foreground w-8 text-right">req {target[c]}</span>
                </div>
              ))}
            </div>
          </Card>
        </>
      ) : (
        /* ── SINGLE STUDENT VIEW ─────────────────────────── */
        <>
          {/* Student picker — only shown to recruiter */}
          {role === "recruiter" && (
            <div className="mb-4 flex items-center gap-3">
              <span className="text-sm text-muted-foreground">Comparing</span>
              <div className="flex gap-2">
                {students.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setCompareStudentId(s.id)}
                    className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${
                      compareStudentId === s.id
                        ? "border-primary bg-card text-foreground font-medium shadow-sm ring-1 ring-primary/20"
                        : "border-border bg-card text-muted-foreground hover:border-muted-foreground/40"
                    }`}
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Summary stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
            <StatCard
              icon={
                hireRec === "Recommend"
                  ? <ShieldCheck className="h-4 w-4 text-[color:var(--success)]" />
                  : hireRec === "Consider"
                  ? <Zap className="h-4 w-4 text-[color:var(--warning)]" />
                  : <XCircle className="h-4 w-4 text-destructive" />
              }
              label={role === "recruiter" ? "Hire recommendation" : "Career standing"}
              tip={role === "recruiter" ? "Based on requirements met (≥67%), readiness (≥70%), and zero critical gaps." : "Reflects whether your current profile meets the coverage and readiness thresholds for the selected role."}
              value={role === "recruiter" ? hireRec : STUDENT_STANDING[hireRec]}
              valueClass={
                hireRec === "Recommend"
                  ? "text-[color:var(--success)]"
                  : hireRec === "Consider"
                  ? "text-[color:var(--warning)]"
                  : "text-destructive"
              }
              sub={
                role === "recruiter"
                  ? hireRec === "Recommend"
                    ? "Meets coverage + readiness threshold"
                    : hireRec === "Consider"
                    ? "Borderline — review gaps before deciding"
                    : `${criticalGaps.length > 0 ? `${criticalGaps.length} critical gap${criticalGaps.length > 1 ? "s" : ""} · ` : ""}below threshold`
                  : studentStandingSub[hireRec]
              }
            />
            <StatCard
              icon={<Target className="h-4 w-4 text-primary" />}
              label="Requirements met"
              tip="Number of competencies where your mentor-validated score is at or above the role's required score."
              value={`${matched.length} / ${COMPETENCIES.length}`}
              sub={`${coveragePct}% of role competencies reached`}
            />
            <StatCard
              icon={<TrendingUp className="h-4 w-4 text-[color:var(--success)]" />}
              label="Avg mentor score"
              value={`${avgStudentScore}/10`}
              sub={`Role requires ${avgTargetScore}/10 avg`}
            />
            <StatCard
              icon={<AlertTriangle className="h-4 w-4 text-[color:var(--warning)]" />}
              label="Total gap"
              value={`${totalGapPoints} pts`}
              sub={totalGapPoints === 0 ? "Profile fully meets role" : `across ${missing.length} competencies`}
            />
            <StatCard
              icon={<Users className="h-4 w-4 text-muted-foreground" />}
              label="Cohort rank"
              value={`#${cohortRank} of ${students.length}`}
              sub={coveragePct >= cohortAvgCoverage ? "Above cohort average" : "Below cohort average"}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
            <Card className="lg:col-span-2">
              <CardHeader
                title={`${activeStudent.name} vs ${selectedRole}`}
                description={`Mentor-validated scores compared to the ${selectedRole} competency profile`}
              />
              <div className="p-5 h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={singleData} margin={{ top: 5, right: 8, left: -16, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.93 0.006 250)" vertical={false} />
                    <XAxis dataKey="competency" tick={{ fontSize: 11, fill: "oklch(0.45 0.02 260)" }} interval={0} angle={-15} textAnchor="end" height={50} />
                    <YAxis domain={[0, 10]} tick={{ fontSize: 11, fill: "oklch(0.45 0.02 260)" }} />
                    <Tooltip contentStyle={{ background: "white", border: "1px solid oklch(0.92 0.006 250)", borderRadius: 6, fontSize: 12 }} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Bar dataKey={activeStudent.name} fill="oklch(0.45 0.09 250)" radius={[3, 3, 0, 0]} />
                    <Bar dataKey={`${selectedRole} target`} fill="oklch(0.78 0.04 250)" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card>
              <CardHeader title="Overlay" description="Profile vs role shape" />
              <div className="p-3 h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={singleData} outerRadius="72%">
                    <PolarGrid stroke="oklch(0.92 0.006 250)" />
                    <PolarAngleAxis dataKey="competency" tick={{ fontSize: 10, fill: "oklch(0.4 0.02 260)" }} />
                    <PolarRadiusAxis domain={[0, 10]} tick={false} axisLine={false} />
                    <Radar name={`${selectedRole} target`} dataKey={`${selectedRole} target`} stroke="oklch(0.7 0.04 250)" fill="oklch(0.7 0.04 250)" fillOpacity={0.15} />
                    <Radar name={activeStudent.name} dataKey={activeStudent.name} stroke="oklch(0.45 0.09 250)" fill="oklch(0.45 0.09 250)" fillOpacity={0.25} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <Card>
              <CardHeader title="Requirements met" description="Competencies at or above the role target score" />
              <div className="p-5 flex flex-wrap gap-1.5 min-h-[60px]">
                {matched.length ? matched.map((c) => <Pill key={c} tone="strong">{c}</Pill>) : <span className="text-xs text-muted-foreground">None yet.</span>}
              </div>
            </Card>
            <Card>
              <CardHeader title="Below target" description="Competencies that haven't reached the role threshold" />
              <div className="p-5 flex flex-wrap gap-1.5 min-h-[60px]">
                {missing.length ? missing.map((c) => (
                  <Pill key={c} tone={criticalGaps.includes(c) ? "weak" : "developing"}>
                    {criticalGaps.includes(c) ? "⚠ " : ""}{c}
                  </Pill>
                )) : <span className="text-xs text-muted-foreground">Role profile fully met.</span>}
              </div>
              {criticalGaps.length > 0 && (
                <div className="px-5 pb-4 text-xs text-destructive flex items-center gap-1.5">
                  <AlertTriangle className="h-3 w-3" />
                  {criticalGaps.length} critical gap{criticalGaps.length > 1 ? "s" : ""} — score is below 50% of requirement
                </div>
              )}
            </Card>
            <Card>
              <CardHeader title="Priority gaps" description="Largest deltas to address first" />
              <ul className="p-5 space-y-2 min-h-[60px]">
                {priority.length ? priority.map((p) => (
                  <li key={p.competency} className="flex items-center justify-between text-sm">
                    <span className={criticalGaps.includes(p.competency as Competency) ? "text-destructive font-medium" : ""}>{p.competency}</span>
                    <span className="text-xs text-muted-foreground">−{p.gap} pts</span>
                  </li>
                )) : <li className="text-xs text-muted-foreground">No gaps.</li>}
              </ul>
            </Card>
            <Card>
              <CardHeader title="Surplus strengths" description="Scores ≥ 2 pts above requirement — added value for role" />
              <div className="p-5 flex flex-wrap gap-1.5 min-h-[60px]">
                {surplus.length ? surplus.map((c) => (
                  <Pill key={c} tone="strong">{c} +{scores[c] - target[c as Competency]}</Pill>
                )) : <span className="text-xs text-muted-foreground">No surplus yet.</span>}
              </div>
            </Card>
          </div>

          {/* Gap breakdown table */}
          <Card className="mb-4">
            <CardHeader title="Gap Breakdown" description="Per-competency analysis against the role profile" />
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                    <th className="px-5 py-3 font-medium">Competency</th>
                    <th className="px-5 py-3 font-medium text-center">Score</th>
                    <th className="px-5 py-3 font-medium text-center">Required</th>
                    <th className="px-5 py-3 font-medium text-center">Gap</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="px-5 py-3 font-medium hidden md:table-cell">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {COMPETENCIES.map((c) => {
                    const score = scores[c];
                    const req = target[c];
                    const gap = req - score;
                    const met = gap <= 0;
                    return (
                      <tr key={c} className="hover:bg-muted/30 transition-colors">
                        <td className="px-5 py-3 font-medium">{c}</td>
                        <td className="px-5 py-3 text-center font-mono">{score}/10</td>
                        <td className="px-5 py-3 text-center font-mono text-muted-foreground">{req}/10</td>
                        <td className="px-5 py-3 text-center">
                          {met ? <span className="text-[color:var(--success)] font-mono">—</span> : <span className="text-destructive font-mono">−{gap}</span>}
                        </td>
                        <td className="px-5 py-3">
                          <Pill tone={met ? "strong" : gap === 1 ? "developing" : "weak"}>
                            {met ? "Met" : gap === 1 ? "Close" : "Gap"}
                          </Pill>
                        </td>
                        <td className="px-5 py-3 text-xs text-muted-foreground hidden md:table-cell">
                          {met ? "Maintain with continued evidence" : gap === 1 ? "One targeted submission may close this" : "Seek mentor session + evidence"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Readiness gauge + growth trend + cohort standing */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader
                title="Role Readiness"
                description={`Average mentor score as % of the 1–10 scale maximum. Shows overall level; does not depend on the role.`}
              />
              <div className="p-5">
                <div className="flex items-end gap-3 mb-3">
                  <span className="text-4xl font-semibold tracking-tight">{readinessPct}%</span>
                  <span className={`text-sm mb-1 font-medium ${readinessPct >= 80 ? "text-[color:var(--success)]" : readinessPct >= 60 ? "text-primary" : "text-[color:var(--warning)]"}`}>
                    {readinessPct >= 80 ? "Ready" : readinessPct >= 60 ? "Developing" : "Needs work"}
                  </span>
                </div>
                <div className="h-3 w-full rounded-full bg-muted border border-border overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${Math.min(readinessPct, 100)}%`,
                      background: readinessPct >= 80 ? "var(--success)" : readinessPct >= 60 ? "oklch(0.45 0.09 250)" : "var(--warning)",
                    }}
                  />
                </div>
                <div className="mt-3 flex justify-between text-[11px] text-muted-foreground">
                  <span>0%</span><span>Threshold 80%+</span><span>100%</span>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-md bg-muted/50 border border-border px-2 py-2">
                    <div className="text-sm font-semibold">{matched.length}/{COMPETENCIES.length}</div>
                    <div className="text-[10px] text-muted-foreground">reqs met</div>
                  </div>
                  <div className="rounded-md bg-muted/50 border border-border px-2 py-2">
                    <div className="text-sm font-semibold">{totalGapPoints}</div>
                    <div className="text-[10px] text-muted-foreground">pts to close</div>
                  </div>
                  <div className="rounded-md bg-muted/50 border border-border px-2 py-2">
                    <div className={`text-sm font-semibold ${readinessDelta > 0 ? "text-[color:var(--success)]" : readinessDelta < 0 ? "text-destructive" : ""}`}>
                      {readinessDelta > 0 ? "+" : ""}{readinessDelta}%
                    </div>
                    <div className="text-[10px] text-muted-foreground">growth</div>
                  </div>
                </div>
              </div>
            </Card>

            <Card>
              <CardHeader
                title="Growth trend"
                description={`Readiness change from first to latest mentor evaluation (${studentEvals.length} session${studentEvals.length !== 1 ? "s" : ""})`}
              />
              <div className="p-5">
                <div className="flex items-center gap-3 mb-4">
                  {readinessDelta > 0
                    ? <TrendingUp className="h-7 w-7 text-[color:var(--success)]" />
                    : readinessDelta < 0
                    ? <TrendingDown className="h-7 w-7 text-destructive" />
                    : <Minus className="h-7 w-7 text-muted-foreground" />}
                  <div>
                    <div className={`text-2xl font-semibold ${readinessDelta > 0 ? "text-[color:var(--success)]" : readinessDelta < 0 ? "text-destructive" : "text-muted-foreground"}`}>
                      {readinessDelta > 0 ? "+" : ""}{readinessDelta}%
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {readinessDelta > 0 ? "Improving" : readinessDelta < 0 ? "Declining" : "No change yet"}
                    </div>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">First evaluation</span>
                    <span className="font-mono">{earliestReadiness}%</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Current readiness</span>
                    <span className="font-mono font-medium">{readinessPct}%</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Critical gaps</span>
                    <span className={`font-mono ${criticalGaps.length > 0 ? "text-destructive font-medium" : "text-[color:var(--success)]"}`}>
                      {criticalGaps.length === 0 ? "None" : criticalGaps.join(", ")}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Surplus strengths</span>
                    <span className="font-mono text-[color:var(--success)]">{surplus.length}</span>
                  </div>
                </div>
              </div>
            </Card>

            <Card>
              <CardHeader
                title="Cohort standing"
                description={`Ranked by requirements met for ${selectedRole}. Readiness = average score ÷ scale max.`}
              />
              <ul className="divide-y divide-border">
                {[...cohortRows].sort((a, b) => b.coverage - a.coverage).map((d, i) => {
                  const isActive = d.id === activeStudent.id;
                  const rec = d.coverage >= 67 && d.readiness >= 70 ? "Recommend" : d.coverage >= 50 && d.readiness >= 60 ? "Consider" : "Not ready";
                  return (
                    <li key={d.id} className={`px-4 py-3 flex items-center justify-between text-sm ${isActive ? "bg-accent/50" : ""}`}>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground w-4">{i + 1}.</span>
                        <span className={isActive ? "font-semibold" : ""}>{d.name}{isActive ? " ←" : ""}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-mono text-xs text-muted-foreground">{d.coverage}% met</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${rec === "Recommend" ? "bg-[color:var(--success)]/10 text-[color:var(--success)]" : rec === "Consider" ? "bg-[color:var(--warning)]/10 text-[color:var(--warning)]" : "bg-destructive/10 text-destructive"}`}>
                          {rec}
                        </span>
                      </div>
                    </li>
                  );
                })}
                <li className="px-4 py-2 text-[10px] text-muted-foreground">
                  "← " marks the candidate you are currently comparing
                </li>
              </ul>
            </Card>
          </div>

          {/* Fit across all roles */}
          <Card className="mt-4">
            <CardHeader
              title="Fit across all roles"
              description={`How ${activeStudent.name}'s competency profile performs against each role. "Requirements met" = competencies at or above the role's score target. "Gap points" = total score still needed to satisfy unmet requirements.`}
            />
            <div className="p-5">
              {/* Column headers */}
              <div className="flex items-center gap-3 mb-2 px-3 text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                <span className="w-36 shrink-0">Role</span>
                <span className="flex-1">Requirements met</span>
                <span className="w-24 text-right shrink-0">Reqs met</span>
                <span className="w-20 text-right shrink-0">Gap pts</span>
                <span className="w-24 text-right shrink-0">Recommendation</span>
              </div>
              <div className="space-y-2">
                {Object.entries(careerTargets).map(([roleName, roleTarget]) => {
                  const roleMatched = COMPETENCIES.filter((c) => scores[c] >= roleTarget[c]);
                  const roleMissed = COMPETENCIES.filter((c) => scores[c] < roleTarget[c]);
                  const roleCoveragePct = Math.round((roleMatched.length / COMPETENCIES.length) * 100);
                  const roleGapPts = roleMissed.reduce((s, c) => s + (roleTarget[c] - scores[c]), 0);
                  const roleRec = roleCoveragePct >= 67 && readinessPct >= 70 ? "Recommend" : roleCoveragePct >= 50 && readinessPct >= 60 ? "Consider" : "Not ready";
                  const isCurrentRole = roleName === selectedRole;
                  return (
                    <div
                      key={roleName}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2.5 ${isCurrentRole ? "bg-primary/5 border border-primary/30" : "border border-border"}`}
                    >
                      <div className="flex items-center gap-2 w-36 shrink-0">
                        <span className={`text-sm ${isCurrentRole ? "font-semibold text-foreground" : "text-muted-foreground"}`}>
                          {roleName}
                        </span>
                        {isCurrentRole && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/15 text-primary font-semibold border border-primary/20 whitespace-nowrap">
                            Active
                          </span>
                        )}
                      </div>
                      <div className="relative flex-1 h-2.5 rounded-full bg-muted overflow-hidden">
                        <div
                          className="absolute inset-y-0 left-0 rounded-full transition-all"
                          style={{
                            width: `${roleCoveragePct}%`,
                            background: roleCoveragePct >= 80 ? "var(--success)" : roleCoveragePct >= 50 ? "oklch(0.45 0.09 250)" : "var(--warning)",
                          }}
                        />
                      </div>
                      <span className="text-xs font-mono text-muted-foreground w-24 text-right shrink-0">
                        {roleMatched.length}/{COMPETENCIES.length} skills
                      </span>
                      <span className={`text-xs font-mono w-20 text-right shrink-0 ${roleGapPts === 0 ? "text-[color:var(--success)]" : "text-muted-foreground"}`}>
                        {roleGapPts === 0 ? "No gap" : `−${roleGapPts} pts`}
                      </span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium w-24 text-center shrink-0 ${roleRec === "Recommend" ? "bg-[color:var(--success)]/10 text-[color:var(--success)]" : roleRec === "Consider" ? "bg-[color:var(--warning)]/10 text-[color:var(--warning)]" : "bg-destructive/10 text-destructive"}`}>
                        {roleRec}
                      </span>
                    </div>
                  );
                })}
              </div>
              <p className="mt-3 text-[11px] text-muted-foreground">
                The row tagged <span className="font-medium text-primary">Active</span> matches the role selected in the dropdown above.
              </p>
            </div>
          </Card>
        </>
      )}
    </>
  );
}

function StatCard({ icon, label, value, sub, valueClass, tip }: { icon: React.ReactNode; label: string; value: string; sub: string; valueClass?: string; tip?: string }) {
  return (
    <div className="rounded-lg border border-border bg-card px-4 py-4">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
        {icon}{label}
        {tip && <InfoIcon tip={tip} />}
      </div>
      <div className={`text-2xl font-semibold tracking-tight ${valueClass ?? ""}`}>{value}</div>
      <div className="text-xs text-muted-foreground mt-0.5">{sub}</div>
    </div>
  );
}
