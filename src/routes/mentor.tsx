import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Check, X } from "lucide-react";
import { COMPETENCIES, evidence as seedEvidence, mentors, students, type Competency } from "@/lib/mock-data";
import { Card, CardHeader, PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/badges";

export const Route = createFileRoute("/mentor")({
  head: () => ({ meta: [{ title: "Mentor Review — Competency Tracker" }] }),
  component: MentorPage,
});

const RUBRIC = [
  "1 — Beginner",
  "2 — Emerging",
  "3 — Developing",
  "4 — Proficient",
  "5 — Expert",
];

function MentorPage() {
  const [mentorId, setMentorId] = useState(mentors[0].id);
  const [activeStudent, setActiveStudent] = useState(students[0].id);
  const [scores, setScores] = useState<Record<Competency, number>>(() =>
    COMPETENCIES.reduce((acc, c) => ({ ...acc, [c]: 3 }), {} as Record<Competency, number>),
  );
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState<{ studentId: string; mentorId: string; date: string; scores: Record<Competency, number>; comment: string }[]>([]);
  const [decisions, setDecisions] = useState<Record<string, "Approved" | "Rejected">>({});
  const mentor = mentors.find((m) => m.id === mentorId)!;

  const studentEvidence = seedEvidence.filter((e) => e.studentId === activeStudent);

  return (
    <>
      <PageHeader
        title="Mentor Review Panel"
        description="Validate submitted evidence and record structured rubric scores with qualitative feedback."
        actions={
          <select value={mentorId} onChange={(e) => setMentorId(e.target.value)} className="rounded-md border border-input bg-background px-3 py-1.5 text-sm">
            {mentors.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
        }
      />

      <div className="mb-4 text-xs text-muted-foreground">Reviewing as <span className="text-foreground font-medium">{mentor.name}</span> · {mentor.role}</div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-1">
          <CardHeader title="Students" />
          <ul className="divide-y divide-border">
            {students.map((s) => (
              <li key={s.id}>
                <button
                  onClick={() => setActiveStudent(s.id)}
                  className={`w-full text-left px-5 py-3 hover:bg-accent/60 transition-colors ${activeStudent === s.id ? "bg-accent" : ""}`}
                >
                  <div className="text-sm font-medium">{s.name}</div>
                  <div className="text-xs text-muted-foreground">{s.program}</div>
                </button>
              </li>
            ))}
          </ul>
        </Card>

        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader title="Pending Evidence" description="Approve or reject submissions" />
            <ul className="divide-y divide-border">
              {studentEvidence.map((e) => {
                const decided = decisions[e.id];
                const status = decided ?? e.status;
                return (
                  <li key={e.id} className="px-5 py-3 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-sm font-medium">{e.title}</div>
                      <div className="text-xs text-muted-foreground">{e.type} · {e.competencies.join(", ")}</div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <StatusBadge status={status} />
                      <button
                        onClick={() => setDecisions((d) => ({ ...d, [e.id]: "Approved" }))}
                        className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2.5 py-1.5 text-xs font-medium text-[color:var(--success)] hover:bg-[color:var(--success)]/10 hover:border-[color:var(--success)]/40"
                      ><Check className="h-3.5 w-3.5" /> Approve</button>
                      <button
                        onClick={() => setDecisions((d) => ({ ...d, [e.id]: "Rejected" }))}
                        className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2.5 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/10 hover:border-destructive/40"
                      ><X className="h-3.5 w-3.5" /> Reject</button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </Card>

          <Card>
            <CardHeader title="Rubric Evaluation" description="Score 1–5 across all competencies" />
            <form
              className="p-5 space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                setSubmitted((arr) => [{ studentId: activeStudent, mentorId, date: new Date().toISOString().slice(0, 10), scores: { ...scores }, comment }, ...arr]);
                setComment("");
              }}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {COMPETENCIES.map((c) => (
                  <div key={c} className="rounded-md border border-border px-3 py-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">{c}</span>
                      <span className="text-xs font-mono text-muted-foreground">{scores[c]}/5</span>
                    </div>
                    <input
                      type="range" min={1} max={5} step={1}
                      value={scores[c]}
                      onChange={(ev) => setScores((s) => ({ ...s, [c]: Number(ev.target.value) }))}
                      className="w-full mt-2 accent-[color:var(--primary)]"
                    />
                    <div className="text-[10px] text-muted-foreground mt-1">{RUBRIC[scores[c] - 1]}</div>
                  </div>
                ))}
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Structured feedback</label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={3}
                  required
                  placeholder="Describe observed competencies, evidence reviewed, and recommended next steps."
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div className="flex justify-end">
                <button type="submit" className="rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:opacity-90">
                  Record evaluation
                </button>
              </div>
            </form>
          </Card>

          {submitted.length > 0 && (
            <Card>
              <CardHeader title="Session Evaluations" description="Recorded this session" />
              <ul className="divide-y divide-border">
                {submitted.map((v, i) => (
                  <li key={i} className="px-5 py-3 text-sm">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{students.find((s) => s.id === v.studentId)?.name} · {v.date}</span>
                      <span>avg {(COMPETENCIES.reduce((a, c) => a + v.scores[c], 0) / COMPETENCIES.length).toFixed(1)}/5</span>
                    </div>
                    <div className="mt-1">{v.comment}</div>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
