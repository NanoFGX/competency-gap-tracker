import { createFileRoute, Link } from "@tanstack/react-router";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from "recharts";
import { ArrowUpRight, TrendingUp, TrendingDown } from "lucide-react";
import { useStudent } from "@/lib/student-context";
import { COMPETENCIES, evaluations, evidence, latestScores, readinessScore, strengthsWeaknesses, tier } from "@/lib/mock-data";
import { Card, CardHeader, PageHeader } from "@/components/page-header";
import { Pill, StatusBadge } from "@/components/badges";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [{ title: "Dashboard — Competency Tracker" }] }),
  component: Dashboard,
});

function Dashboard() {
  const { student } = useStudent();
  const scores = latestScores(student.id);
  const score = readinessScore(scores);
  const { strengths, weaknesses } = strengthsWeaknesses(scores);
  const evals = evaluations.filter((e) => e.studentId === student.id);
  const evs = evidence.filter((e) => e.studentId === student.id);
  const approved = evs.filter((e) => e.status === "Approved").length;

  const radarData = COMPETENCIES.map((c) => ({ competency: c, score: scores[c], full: 5 }));

  return (
    <>
      <PageHeader
        title={`${student.name}`}
        description={`${student.program} · ${student.email}`}
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Stat label="Career Readiness" value={`${score}%`} hint="Composite of latest mentor scores" />
        <Stat label="Evaluations" value={String(evals.length)} hint={`Across ${new Set(evals.map((e) => e.mentorId)).size} mentors`} />
        <Stat label="Evidence Approved" value={`${approved}/${evs.length}`} hint="Validated submissions" />
        <Stat label="Last Reviewed" value={evals.at(-1)?.date ?? "—"} hint="Most recent mentor entry" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader title="Competency Profile" description="Latest aggregated mentor scores (1–5 scale)" />
          <div className="p-5">
            <div className="h-[340px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData} outerRadius="75%">
                  <PolarGrid stroke="oklch(0.92 0.006 250)" />
                  <PolarAngleAxis dataKey="competency" tick={{ fill: "oklch(0.4 0.02 260)", fontSize: 12 }} />
                  <PolarRadiusAxis angle={90} domain={[0, 5]} tick={{ fill: "oklch(0.6 0.02 260)", fontSize: 10 }} tickCount={6} />
                  <Radar name="Score" dataKey="score" stroke="oklch(0.45 0.09 250)" fill="oklch(0.45 0.09 250)" fillOpacity={0.18} strokeWidth={2} />
                  <Tooltip contentStyle={{ background: "white", border: "1px solid oklch(0.92 0.006 250)", borderRadius: 6, fontSize: 12 }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader title="Insight Summary" description="Rule-based reading of the latest profile" />
          <div className="p-5 space-y-5">
            <Section icon={<TrendingUp className="h-3.5 w-3.5 text-[color:var(--success)]" />} label="Strengths">
              {strengths.map((c) => (
                <Pill key={c} tone="strong">{c} · {scores[c]}/5</Pill>
              ))}
            </Section>
            <Section icon={<TrendingDown className="h-3.5 w-3.5 text-destructive" />} label="Improvement areas">
              {weaknesses.map((c) => (
                <Pill key={c} tone={tier(scores[c])}>{c} · {scores[c]}/5</Pill>
              ))}
            </Section>
            <div className="pt-4 border-t border-border text-xs text-muted-foreground leading-relaxed">
              {generateInsight(scores)}
            </div>
            <Link to="/career" className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline">
              Compare against career target <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
        </Card>
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader title="Recent Evidence" description="Submissions mapped to competencies" />
          <ul className="divide-y divide-border">
            {evs.slice(-4).reverse().map((e) => (
              <li key={e.id} className="px-5 py-3 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">{e.title}</div>
                  <div className="text-xs text-muted-foreground">{e.type} · {e.submittedAt}</div>
                </div>
                <StatusBadge status={e.status} />
              </li>
            ))}
          </ul>
        </Card>
        <Card>
          <CardHeader title="Recent Mentor Notes" description="Qualitative feedback" />
          <ul className="divide-y divide-border">
            {evals.slice(-3).reverse().map((v) => (
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

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-lg border border-border bg-card px-5 py-4">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 text-2xl font-semibold tracking-tight">{value}</div>
      {hint ? <div className="text-xs text-muted-foreground mt-0.5">{hint}</div> : null}
    </div>
  );
}

function Section({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-muted-foreground mb-2">
        {icon}{label}
      </div>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

function generateInsight(scores: Record<string, number>): string {
  const weak = Object.entries(scores).filter(([, v]) => v <= 2).map(([k]) => k);
  const strong = Object.entries(scores).filter(([, v]) => v >= 4).map(([k]) => k);
  const parts: string[] = [];
  if (strong.length) parts.push(`Demonstrates consistent strength in ${strong.join(", ")}.`);
  if (weak.length) parts.push(`Recommended focus: ${weak.join(", ")} — submit further evidence or seek mentor sessions.`);
  if (!weak.length && !strong.length) parts.push("Profile is broadly developing; continue gathering evidence across all competencies.");
  return parts.join(" ");
}
