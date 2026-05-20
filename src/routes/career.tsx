import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from "recharts";
import { useStudent } from "@/lib/student-context";
import { COMPETENCIES, careerTargets, latestScores, type Competency } from "@/lib/mock-data";
import { Card, CardHeader, PageHeader } from "@/components/page-header";
import { Pill } from "@/components/badges";

export const Route = createFileRoute("/career")({
  head: () => ({ meta: [{ title: "Career Target — Competency Tracker" }] }),
  component: CareerPage,
});

function CareerPage() {
  const { student } = useStudent();
  const scores = latestScores(student.id);
  const [role, setRole] = useState<keyof typeof careerTargets>("Software Engineer");
  const target = careerTargets[role];

  const data = COMPETENCIES.map((c) => ({
    competency: c,
    current: scores[c],
    target: target[c],
    gap: target[c] - scores[c],
  }));

  const matched = data.filter((d) => d.current >= d.target).map((d) => d.competency);
  const missing = data.filter((d) => d.current < d.target).map((d) => d.competency);
  const priority = [...data].filter((d) => d.gap > 0).sort((a, b) => b.gap - a.gap).slice(0, 3);

  return (
    <>
      <PageHeader
        title="Career Target Comparison"
        description="Benchmark current competencies against the profile required for a chosen role."
        actions={
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as keyof typeof careerTargets)}
            className="rounded-md border border-input bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {Object.keys(careerTargets).map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <Card className="lg:col-span-2">
          <CardHeader title="Current vs Target" description={`Bar comparison against ${role} profile`} />
          <div className="p-5 h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 5, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.93 0.006 250)" vertical={false} />
                <XAxis dataKey="competency" tick={{ fontSize: 11, fill: "oklch(0.45 0.02 260)" }} interval={0} angle={-15} textAnchor="end" height={50} />
                <YAxis domain={[0, 5]} tick={{ fontSize: 11, fill: "oklch(0.45 0.02 260)" }} />
                <Tooltip contentStyle={{ background: "white", border: "1px solid oklch(0.92 0.006 250)", borderRadius: 6, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="current" name="Current" fill="oklch(0.45 0.09 250)" radius={[3, 3, 0, 0]} />
                <Bar dataKey="target" name="Target" fill="oklch(0.78 0.04 250)" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <CardHeader title="Overlay" description="Profile vs role" />
          <div className="p-3 h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={data} outerRadius="72%">
                <PolarGrid stroke="oklch(0.92 0.006 250)" />
                <PolarAngleAxis dataKey="competency" tick={{ fontSize: 10, fill: "oklch(0.4 0.02 260)" }} />
                <PolarRadiusAxis domain={[0, 5]} tick={false} axisLine={false} />
                <Radar name="Target" dataKey="target" stroke="oklch(0.7 0.04 250)" fill="oklch(0.7 0.04 250)" fillOpacity={0.15} />
                <Radar name="Current" dataKey="current" stroke="oklch(0.45 0.09 250)" fill="oklch(0.45 0.09 250)" fillOpacity={0.25} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader title="Matched Skills" description="At or above target" />
          <div className="p-5 flex flex-wrap gap-1.5 min-h-[60px]">
            {matched.length ? matched.map((c) => <Pill key={c} tone="strong">{c}</Pill>) : <span className="text-xs text-muted-foreground">None yet.</span>}
          </div>
        </Card>
        <Card>
          <CardHeader title="Missing Skills" description="Below target threshold" />
          <div className="p-5 flex flex-wrap gap-1.5 min-h-[60px]">
            {missing.length ? missing.map((c) => <Pill key={c} tone="weak">{c}</Pill>) : <span className="text-xs text-muted-foreground">Role profile fully met.</span>}
          </div>
        </Card>
        <Card>
          <CardHeader title="Priority Gaps" description="Largest deltas to close" />
          <ul className="p-5 space-y-2 min-h-[60px]">
            {priority.length ? priority.map((p) => (
              <li key={p.competency} className="flex items-center justify-between text-sm">
                <span>{p.competency}</span>
                <span className="text-xs text-muted-foreground">+{p.gap} to reach {p.target}</span>
              </li>
            )) : <li className="text-xs text-muted-foreground">No gaps.</li>}
          </ul>
        </Card>
      </div>
    </>
  );
}
