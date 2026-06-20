import { createFileRoute } from "@tanstack/react-router";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  AreaChart,
  Area,
  ReferenceLine,
} from "recharts";
import { BrainCircuit, Target, Award, TrendingUp as TrendingUpIcon } from "lucide-react";
import { useStudent } from "@/lib/student-context";
import {
  COMPETENCIES,
  evaluations,
  evidence,
  latestScores,
  readinessScore,
  tier,
  careerTargets,
} from "@/lib/mock-data";
import { Card, CardHeader, PageHeader } from "@/components/page-header";
import { Pill } from "@/components/badges";
import { useChartTheme } from "@/lib/chart-theme";

export const Route = createFileRoute("/timeline")({
  head: () => ({ meta: [{ title: "Progression — Competency Tracker" }] }),
  component: TimelinePage,
});

function fmtDate(d: string) {
  const [y, m] = d.split("-");
  const MONTHS = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return `${MONTHS[parseInt(m) - 1]} '${y.slice(2)}`;
}

const AI_INSIGHTS: Record<
  string,
  { summary: string; suggestions: string[]; nextMilestone: string }
> = {
  s1: {
    summary:
      "Strong momentum in Communication and Technical Writing — both grew from 2 to 8 over 7 months. Current readiness (67%) sits 3 percentage points below the 'Consider' threshold for Software Engineer.",
    suggestions: [
      "UX Empathy has plateaued at 4 across all evaluations. Submit a user research or usability testing project to demonstrate empathy-driven design thinking.",
      "Problem Solving is close to the Software Engineer target (8 vs 10 required). One high-quality technical project with documented solution rationale could close this gap.",
      "Communication growth is one of the fastest in the cohort — leverage this by leading a team retrospective or workshop to simultaneously build Leadership evidence.",
    ],
    nextMilestone:
      "3 pts in overall readiness needed to reach 'Consider' standing for Software Engineer",
  },
  s2: {
    summary:
      "UX Empathy leads the cohort at 8/10 — a consistent standout across all evaluations. Communication improved significantly from 2 to 6 over the year. Leadership (6) and Problem Solving (6) are the primary remaining gaps.",
    suggestions: [
      "Leadership is the highest-impact gap. Consider leading a capstone module, student society project, or research group — formal ownership generates strong mentor-validated evidence.",
      "Problem Solving at 6/10 limits AI Engineer and Tech Lead suitability. A project involving technical trade-off analysis or algorithm design would address this directly.",
      "Your NHS project is exceptional UX Engineer evidence. A concise case study documenting the co-design process would further strengthen Technical Writing.",
    ],
    nextMilestone:
      "Raise Leadership by 2 pts to unlock 'Recommend' standing for the UX Engineer role",
  },
  s3: {
    summary:
      "Problem Solving has reached mastery (10/10) — exceptionally rare at undergraduate level. The main divergence from role requirements is the soft-skill cluster: Communication (4) and UX Empathy (4) lag all four role benchmarks.",
    suggestions: [
      "Communication (4/10) is the single largest blocker across all four roles. A team presentation, seminar talk, or a technical blog series would provide concrete validated evidence.",
      "Teamwork evidence is thin compared to solo projects. A structured team project with retrospectives and pair programming logs would accelerate this competency.",
      "UX Empathy is 6 points below the UX Engineer requirement. An accessibility audit or user interview study creates role-targeted evidence while building empathy organically.",
    ],
    nextMilestone:
      "Raising Communication from 4 to 6 would lift readiness to 73% — clearing the 70% threshold",
  },
};

function TimelinePage() {
  const { student } = useStudent();
  const chart = useChartTheme();
  const CHART_COLORS = chart.series;

  const evals = evaluations
    .filter((e) => e.studentId === student.id)
    .sort((a, b) => a.date.localeCompare(b.date));

  const evs = evidence.filter((e) => e.studentId === student.id);
  const approved = evs.filter((e) => e.status === "Approved").length;

  if (evals.length === 0) {
    return (
      <>
        <PageHeader
          eyebrow="Student"
          icon={<TrendingUpIcon className="h-5 w-5" />}
          title="Progression Timeline"
          description="Track competency improvements over time, derived from mentor evaluations and validated evidence."
        />
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="h-16 w-16 rounded-2xl bg-muted grid place-items-center mb-5">
            <TrendingUpIcon className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-base font-semibold mb-2">No progression data yet</h3>
          <p className="text-sm text-muted-foreground max-w-xs">
            Submit evidence and get a mentor evaluation to start tracking your growth over time.
          </p>
        </div>
      </>
    );
  }

  const chartData = evals.map((v) => ({
    date: fmtDate(v.date),
    ...v.scores,
    readiness: readinessScore(v.scores),
  }));

  const scores = latestScores(student.id);
  const firstEval = evals[0];
  const latestEval = evals[evals.length - 1];

  const currentReadiness = readinessScore(scores);
  const firstReadiness = readinessScore(firstEval.scores);
  const readinessDelta = currentReadiness - firstReadiness;

  const perRoleStats = Object.entries(careerTargets).map(([roleName, roleTarget]) => {
    const matched = COMPETENCIES.filter((c) => scores[c] >= roleTarget[c]).length;
    const coverage = Math.round((matched / COMPETENCIES.length) * 100);
    return { role: roleName, coverage, matched };
  });

  const insights = AI_INSIGHTS[student.id as keyof typeof AI_INSIGHTS];

  return (
    <>
      <PageHeader
        eyebrow="Student"
        icon={<TrendingUpIcon className="h-5 w-5" />}
        title="Progression Timeline"
        description="Track competency improvements over time, derived from mentor evaluations and validated evidence."
      />

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <StatBox
          label="Current readiness"
          value={`${currentReadiness}%`}
          sub={currentReadiness >= 70 ? "On track" : "Developing"}
          tone={currentReadiness >= 70 ? "strong" : "developing"}
        />
        <StatBox
          label="Growth since start"
          value={`${readinessDelta > 0 ? "+" : ""}${readinessDelta}%`}
          sub={`${fmtDate(firstEval.date)} → ${fmtDate(latestEval.date)}`}
          tone={readinessDelta > 0 ? "strong" : readinessDelta < 0 ? "weak" : "developing"}
        />
        <StatBox
          label="Evaluations"
          value={String(evals.length)}
          sub={`${new Set(evals.map((e) => e.mentorId)).size} mentors`}
        />
        <StatBox
          label="Evidence approved"
          value={`${approved}/${evs.length}`}
          sub="validated submissions"
        />
      </div>

      {/* Competency Trend */}
      <Card className="mb-4">
        <CardHeader
          title="Competency Trend"
          description="Score per competency across all mentor evaluations (1–10 scale)"
        />
        <div className="p-5 h-[380px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 20, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={chart.grid} vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: chart.axis }}
                tickLine={false}
                axisLine={{ stroke: chart.grid }}
              />
              <YAxis
                domain={[0, 10]}
                ticks={[0, 2, 4, 6, 8, 10]}
                tick={{ fontSize: 11, fill: chart.axis }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip contentStyle={chart.tooltip} />
              <Legend wrapperStyle={{ fontSize: 11, paddingTop: 12 }} />
              {COMPETENCIES.map((c, i) => (
                <Line
                  key={c}
                  type="monotone"
                  dataKey={c}
                  stroke={CHART_COLORS[i]}
                  strokeWidth={2}
                  dot={{ r: 4, fill: chart.tooltip.background, strokeWidth: 2 }}
                  activeDot={{ r: 5, strokeWidth: 0 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Career Readiness per Role */}
      <div className="mb-4">
        <h3 className="text-sm font-semibold mb-3">Career Readiness by Role</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {perRoleStats.map(({ role, coverage, matched }) => (
            <div key={role} className="rounded-lg border border-border bg-card px-4 py-3">
              <div className="text-xs text-muted-foreground mb-1.5 font-medium truncate">
                {role}
              </div>
              <div className="text-2xl font-semibold tracking-tight">{coverage}%</div>
              <div className="text-xs text-muted-foreground mb-2">
                {matched}/{COMPETENCIES.length} requirements met
              </div>
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${coverage}%`,
                    background:
                      coverage >= 80
                        ? "var(--success)"
                        : coverage >= 50
                          ? "var(--primary)"
                          : "var(--warning)",
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Readiness over time + Growth Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <Card className="md:col-span-2">
          <CardHeader
            title="Overall Career Readiness"
            description="Your readiness score over time (avg of all competency scores ÷ max). The dashed line marks 70% — the point where most role profiles consider a candidate career-ready."
          />
          <div className="p-5 h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 20, left: -16, bottom: 0 }}>
                <defs>
                  <linearGradient id="readinessGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={chart.primary} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={chart.primary} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={chart.grid} vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: chart.axis }}
                  tickLine={false}
                  axisLine={{ stroke: chart.grid }}
                />
                <YAxis
                  domain={[0, 100]}
                  ticks={[0, 25, 50, 75, 100]}
                  tick={{ fontSize: 11, fill: chart.axis }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={chart.tooltip}
                  formatter={(v: number) => [`${v}%`, "Readiness"]}
                />
                <ReferenceLine
                  y={70}
                  stroke={chart.warning}
                  strokeDasharray="4 3"
                  label={{
                    value: "Career-ready goal (70%)",
                    position: "insideTopRight",
                    fontSize: 10,
                    fill: chart.warning,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="readiness"
                  stroke={chart.primary}
                  fill="url(#readinessGrad)"
                  strokeWidth={2.5}
                  dot={{
                    r: 4,
                    fill: chart.tooltip.background,
                    strokeWidth: 2.5,
                    stroke: chart.primary,
                  }}
                  activeDot={{ r: 6, strokeWidth: 0, fill: chart.primary }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Growth Summary"
            description={`${fmtDate(firstEval.date)} → ${fmtDate(latestEval.date)}`}
          />
          <ul className="p-5 space-y-3">
            {COMPETENCIES.map((c) => {
              const first = firstEval.scores[c];
              const latest = scores[c];
              const delta = latest - first;
              const t = tier(latest);
              const dotCls =
                t === "strong"
                  ? "bg-[color:var(--success)]"
                  : t === "weak"
                    ? "bg-destructive/70"
                    : "bg-primary/70";
              return (
                <li key={c} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full shrink-0 ${dotCls}`} />
                    <span className="text-xs">{c}</span>
                  </span>
                  <div className="flex items-center gap-2 text-xs shrink-0">
                    <span className="text-muted-foreground font-mono">
                      {first}→{latest}
                    </span>
                    <span
                      className={`font-mono font-semibold ${
                        delta > 0
                          ? "text-[color:var(--success)]"
                          : delta < 0
                            ? "text-destructive"
                            : "text-muted-foreground"
                      }`}
                    >
                      {delta > 0 ? "+" : ""}
                      {delta}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>
      </div>

      {/* Competency Growth Table */}
      <Card className="mb-4">
        <CardHeader
          title="Competency Growth Table"
          description={`Tracking from ${fmtDate(firstEval.date)} to ${fmtDate(latestEval.date)} · ${evals.length} evaluations`}
        />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-[11px] uppercase tracking-wider text-muted-foreground">
                <th className="px-5 py-3 text-left font-medium">Competency</th>
                <th className="px-5 py-3 text-center font-medium">Start</th>
                <th className="px-5 py-3 text-center font-medium">Current</th>
                <th className="px-5 py-3 text-center font-medium">Change</th>
                <th className="px-5 py-3 text-left font-medium hidden md:table-cell">Progress</th>
                <th className="px-5 py-3 text-left font-medium">Level</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {COMPETENCIES.map((c) => {
                const first = firstEval.scores[c];
                const latest = scores[c];
                const delta = latest - first;
                const t = tier(latest);
                const barColor =
                  t === "strong"
                    ? "var(--success)"
                    : t === "weak"
                      ? "var(--destructive)"
                      : "var(--primary)";
                return (
                  <tr key={c} className="hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-3 font-medium">{c}</td>
                    <td className="px-5 py-3 text-center font-mono text-xs text-muted-foreground">
                      {first}/10
                    </td>
                    <td className="px-5 py-3 text-center font-mono text-xs font-semibold">
                      {latest}/10
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span
                        className={`font-mono text-xs font-semibold ${
                          delta > 0
                            ? "text-[color:var(--success)]"
                            : delta < 0
                              ? "text-destructive"
                              : "text-muted-foreground"
                        }`}
                      >
                        {delta > 0 ? "+" : ""}
                        {delta}
                      </span>
                    </td>
                    <td className="px-5 py-3 hidden md:table-cell">
                      <div className="h-1.5 rounded-full bg-muted overflow-hidden w-24">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${(latest / 10) * 100}%`, background: barColor }}
                        />
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <Pill tone={t}>{t}</Pill>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* AI Insights */}
      {insights && (
        <Card className="mb-4">
          <div className="px-5 py-4 border-b border-border flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-md bg-primary/10 grid place-items-center shrink-0">
              <BrainCircuit className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-semibold">AI Insights &amp; Suggestions</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                AI-powered analysis of your progression trajectory
              </p>
            </div>
          </div>
          <div className="p-5 space-y-5">
            <div className="rounded-lg bg-primary/5 border border-primary/15 p-4">
              <p className="text-sm leading-relaxed">{insights.summary}</p>
            </div>

            <div>
              <div className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-muted-foreground mb-3 font-medium">
                <Award className="h-3.5 w-3.5" />
                Suggested actions
              </div>
              <div className="space-y-3">
                {insights.suggestions.map((s, i) => (
                  <div key={i} className="flex gap-3">
                    <span className="shrink-0 h-5 w-5 rounded-full bg-primary/10 text-primary text-[11px] font-semibold grid place-items-center mt-0.5">
                      {i + 1}
                    </span>
                    <span className="text-sm text-muted-foreground leading-relaxed">{s}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-lg bg-success/10 border border-success/25 p-3 flex items-start gap-2.5">
              <Target className="h-4 w-4 text-[color:var(--success)] shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-semibold text-[color:var(--success)] mb-0.5">
                  Next milestone
                </div>
                <div className="text-xs text-muted-foreground">{insights.nextMilestone}</div>
              </div>
            </div>
          </div>
        </Card>
      )}
    </>
  );
}

function StatBox({
  label,
  value,
  sub,
  tone = "developing",
}: {
  label: string;
  value: string;
  sub: string;
  tone?: "strong" | "developing" | "weak";
}) {
  const valueColor =
    tone === "strong" ? "text-[color:var(--success)]" : tone === "weak" ? "text-destructive" : "";
  return (
    <div className="rounded-lg border border-border bg-card px-4 py-4">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={`mt-1 text-2xl font-semibold tracking-tight ${valueColor}`}>{value}</div>
      <div className="text-xs text-muted-foreground mt-0.5">{sub}</div>
    </div>
  );
}
