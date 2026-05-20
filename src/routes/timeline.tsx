import { createFileRoute } from "@tanstack/react-router";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { useStudent } from "@/lib/student-context";
import { COMPETENCIES, evaluations, latestScores, readinessScore, tier } from "@/lib/mock-data";
import { Card, CardHeader, PageHeader } from "@/components/page-header";

export const Route = createFileRoute("/timeline")({
  head: () => ({ meta: [{ title: "Progression — Competency Tracker" }] }),
  component: TimelinePage,
});

const COLORS = ["#2563eb", "#64748b", "#0ea5e9", "#7c3aed", "#059669", "#d97706"];

function TimelinePage() {
  const { student } = useStudent();
  const evals = evaluations.filter((e) => e.studentId === student.id).sort((a, b) => a.date.localeCompare(b.date));
  const data = evals.map((v) => ({
    date: v.date,
    ...v.scores,
    readiness: readinessScore(v.scores),
  }));

  const scores = latestScores(student.id);
  const sorted = [...COMPETENCIES].sort((a, b) => scores[a] - scores[b]);
  const top3 = sorted.slice(0, 3);

  return (
    <>
      <PageHeader
        title="Progression Timeline"
        description="Track competency improvements over time, derived from mentor evaluations and validated evidence."
      />

      <Card className="mb-4">
        <CardHeader title="Competency Trend" description="Score per competency across mentor evaluations" />
        <div className="p-5 h-[360px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 20, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.93 0.006 250)" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "oklch(0.45 0.02 260)" }} />
              <YAxis domain={[0, 5]} tick={{ fontSize: 11, fill: "oklch(0.45 0.02 260)" }} />
              <Tooltip contentStyle={{ background: "white", border: "1px solid oklch(0.92 0.006 250)", borderRadius: 6, fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              {COMPETENCIES.map((c, i) => (
                <Line key={c} type="monotone" dataKey={c} stroke={COLORS[i]} strokeWidth={1.6} dot={{ r: 2.5 }} activeDot={{ r: 4 }} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="md:col-span-2">
          <CardHeader title="Career Readiness" description="Composite percentage over time" />
          <div className="p-5 h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 5, right: 20, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.93 0.006 250)" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "oklch(0.45 0.02 260)" }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "oklch(0.45 0.02 260)" }} />
                <Tooltip contentStyle={{ background: "white", border: "1px solid oklch(0.92 0.006 250)", borderRadius: 6, fontSize: 12 }} />
                <Line type="monotone" dataKey="readiness" stroke="oklch(0.45 0.09 250)" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <CardHeader title="Top Improvement Areas" description="Lowest current scores" />
          <ul className="p-5 space-y-3">
            {top3.map((c) => {
              const t = tier(scores[c]);
              const dotCls =
                t === "strong" ? "bg-[color:oklch(0.65_0.1_155)]" : t === "weak" ? "bg-[color:oklch(0.65_0.15_25)]" : "bg-[color:oklch(0.75_0.1_80)]";
              return (
                <li key={c} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${dotCls}`} />
                    {c}
                  </span>
                  <span className="text-xs text-muted-foreground capitalize">{t} · {scores[c]}/5</span>
                </li>
              );
            })}
          </ul>
        </Card>
      </div>
    </>
  );
}
