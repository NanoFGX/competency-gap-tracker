import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { ArrowUpRight, TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";
import { useStudent } from "@/lib/student-context";
import {
  COMPETENCIES,
  careerTargets,
  evaluations,
  evidence,
  latestScores,
  readinessScore,
  strengthsWeaknesses,
  tier,
} from "@/lib/mock-data";
import { Card, CardHeader, PageHeader } from "@/components/page-header";
import { Pill, StatusBadge } from "@/components/badges";
import { InfoIcon, ScoreLegend } from "@/components/ui";
import { useChartTheme } from "@/lib/chart-theme";
import { AnimatedNumber } from "@/components/motion";
import { LayoutDashboard } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [{ title: "Dashboard — Competency Tracker" }] }),
  component: Dashboard,
});

function Dashboard() {
  const { student } = useStudent();
  const chart = useChartTheme();
  const scores = latestScores(student.id);
  const score = readinessScore(scores);
  const { strengths, weaknesses } = strengthsWeaknesses(scores);
  const evals = evaluations.filter((e) => e.studentId === student.id);
  const evs = evidence.filter((e) => e.studentId === student.id);
  const approved = evs.filter((e) => e.status === "Approved").length;
  const pending = evs.filter((e) => e.status === "Pending").length;

  const radarData = COMPETENCIES.map((c) => ({ competency: c, score: scores[c], full: 10 }));

  const target = careerTargets["Software Engineer"];
  const gaps = COMPETENCIES.filter((c) => scores[c] < target[c]).sort(
    (a, b) => scores[a] - target[a] - (scores[b] - target[b]),
  );

  const roleReadinessData = Object.entries(careerTargets).map(([roleName, rt]) => {
    const matched = COMPETENCIES.filter((c) => scores[c] >= rt[c]).length;
    return { role: roleName, coverage: Math.round((matched / COMPETENCIES.length) * 100) };
  });
  const bestRole = [...roleReadinessData].sort((a, b) => b.coverage - a.coverage)[0];

  return (
    <>
      <PageHeader
        eyebrow="Student dashboard"
        icon={<LayoutDashboard className="h-5 w-5" />}
        title={`${student.name}`}
        description={`${student.program} · ${student.email}`}
      />

      {gaps.length > 0 && (
        <div className="cgt-rise mb-6 flex items-start gap-3 rounded-lg border border-[color:var(--warning)]/40 bg-[color:var(--warning)]/10 px-4 py-3">
          <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0 text-[color:var(--warning)]" />
          <div className="text-sm">
            <span className="font-medium">Skill gap detected.</span>{" "}
            <span className="text-muted-foreground">
              {gaps
                .slice(0, 2)
                .map((c) => `${c} is ${scores[c]}/${target[c]} for Software Engineer`)
                .join("; ")}
              . Add targeted evidence to close the gap.
            </span>{" "}
            <Link
              to="/career"
              className="font-medium text-primary hover:underline whitespace-nowrap"
            >
              Review target →
            </Link>
          </div>
        </div>
      )}

      <div className="cgt-rise grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <Stat
          label="Career Readiness"
          value={`${score}%`}
          animateValue={score}
          suffix="%"
          hint="Average of all competency scores (1–10)"
          tip="Calculated as the average of all 6 mentor-validated competency scores (1–10 each), expressed as a percentage of the maximum. Higher = stronger overall profile."
        />
        <Stat
          label="Evaluations"
          value={String(evals.length)}
          hint={`Across ${new Set(evals.map((e) => e.mentorId)).size} mentors`}
        />
        <Stat
          label="Evidence Approved"
          value={`${approved}/${evs.length}`}
          hint="Validated submissions"
        />
        <Stat label="Pending Review" value={String(pending)} hint="Awaiting mentor validation" />
        <Stat
          label="Best role fit"
          value={`${bestRole.coverage}%`}
          animateValue={bestRole.coverage}
          suffix="%"
          hint={bestRole.role}
          tip="The career role where the most competency requirements are already met based on your latest mentor scores."
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader
            title="Competency Profile"
            description="Latest aggregated mentor scores (1–10 scale)"
          />
          <div className="px-5 py-2.5 border-b border-border/50 bg-muted/20">
            <ScoreLegend />
          </div>
          <div className="p-5">
            <div className="h-[310px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData} outerRadius="75%">
                  <PolarGrid stroke={chart.grid} />
                  <PolarAngleAxis dataKey="competency" tick={{ fill: chart.axis, fontSize: 12 }} />
                  <PolarRadiusAxis
                    angle={90}
                    domain={[0, 10]}
                    tick={{ fill: chart.axis, fontSize: 10 }}
                    tickCount={6}
                  />
                  <Radar
                    name="Score"
                    dataKey="score"
                    stroke={chart.primary}
                    fill={chart.primary}
                    fillOpacity={0.18}
                    strokeWidth={2}
                  />
                  <Tooltip contentStyle={chart.tooltip} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Insight Summary"
            description="Rule-based reading of the latest profile"
          />
          <div className="p-5 space-y-5">
            <Section
              icon={<TrendingUp className="h-3.5 w-3.5 text-[color:var(--success)]" />}
              label="Strengths"
            >
              {strengths.map((c) => (
                <Pill key={c} tone="strong">
                  {c} · {scores[c]}/10
                </Pill>
              ))}
            </Section>
            <Section
              icon={<TrendingDown className="h-3.5 w-3.5 text-destructive" />}
              label="Improvement areas"
            >
              {weaknesses.map((c) => (
                <Pill key={c} tone={tier(scores[c])}>
                  {c} · {scores[c]}/10
                </Pill>
              ))}
            </Section>
            <div className="pt-4 border-t border-border text-xs text-muted-foreground leading-relaxed">
              {generateInsight(scores)}
            </div>
            <Link
              to="/career"
              className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              Compare against career target <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
        </Card>
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader
            title="Role Readiness"
            description="Requirements met vs each career path target"
          />
          <div className="p-5 space-y-4">
            {roleReadinessData.map(({ role, coverage }) => (
              <div key={role} className="flex items-center gap-3">
                <span className="w-28 shrink-0 text-xs text-muted-foreground">{role}</span>
                <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
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
                <span className="text-xs font-mono text-muted-foreground w-10 text-right">
                  {coverage}%
                </span>
              </div>
            ))}
            <Link
              to="/career"
              className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              Full role analysis <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
        </Card>

        <Card>
          <CardHeader title="Recent Evidence" description="Submissions mapped to competencies" />
          <ul className="divide-y divide-border">
            {evs
              .slice(-4)
              .reverse()
              .map((e) => (
                <li key={e.id} className="px-5 py-3 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">{e.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {e.type} · {e.submittedAt}
                    </div>
                  </div>
                  <StatusBadge status={e.status} />
                </li>
              ))}
          </ul>
        </Card>

        <Card>
          <CardHeader title="Recent Mentor Notes" description="Qualitative feedback" />
          <ul className="divide-y divide-border">
            {evals
              .slice(-3)
              .reverse()
              .map((v) => (
                <li key={v.id} className="px-5 py-3">
                  <div className="text-xs text-muted-foreground">{v.date}</div>
                  <div className="text-sm mt-0.5 leading-snug">{v.comment}</div>
                </li>
              ))}
          </ul>
        </Card>
      </div>
    </>
  );
}

function Stat({
  label,
  value,
  hint,
  tip,
  animateValue,
  suffix,
}: {
  label: string;
  value: string;
  hint?: string;
  tip?: string;
  animateValue?: number;
  suffix?: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-card px-5 py-4 transition-shadow hover:shadow-[var(--elevation-2)]">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        {label}
        {tip && <InfoIcon tip={tip} />}
      </div>
      <div className="mt-1 text-2xl font-semibold tracking-tight">
        {animateValue !== undefined ? (
          <AnimatedNumber value={animateValue} suffix={suffix} />
        ) : (
          value
        )}
      </div>
      {hint ? <div className="text-xs text-muted-foreground mt-0.5">{hint}</div> : null}
    </div>
  );
}

function Section({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-muted-foreground mb-2">
        {icon}
        {label}
      </div>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

function generateInsight(scores: Record<string, number>): string {
  const weak = Object.entries(scores)
    .filter(([, v]) => v <= 4)
    .map(([k]) => k);
  const strong = Object.entries(scores)
    .filter(([, v]) => v >= 8)
    .map(([k]) => k);
  const parts: string[] = [];
  if (strong.length) parts.push(`Demonstrates consistent strength in ${strong.join(", ")}.`);
  if (weak.length)
    parts.push(
      `Recommended focus: ${weak.join(", ")} — submit further evidence or seek mentor sessions.`,
    );
  if (!weak.length && !strong.length)
    parts.push(
      "Profile is broadly developing; continue gathering evidence across all competencies.",
    );
  return parts.join(" ");
}
