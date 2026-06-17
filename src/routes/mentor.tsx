import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Check, X, Undo2, ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import { COMPETENCIES, evidence as seedEvidence, students, type Competency, type Evidence } from "@/lib/mock-data";
import { Card, CardHeader, PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/badges";
import { ConfirmDialog } from "@/components/ui";
import { useLocalStorage, type SubmittedEval } from "@/lib/use-local-storage";

export const Route = createFileRoute("/mentor")({
  head: () => ({ meta: [{ title: "Mentor Review — Competency Tracker" }] }),
  component: MentorPage,
});

const RUBRIC = [
  "1 — Beginner", "2 — Early stage", "3 — Basic awareness", "4 — Approaching competency",
  "5 — Developing", "6 — Competent", "7 — Proficient", "8 — Advanced", "9 — Expert", "10 — Mastery",
];

const AVATAR_COLORS = [
  "bg-blue-100 text-blue-700",
  "bg-violet-100 text-violet-700",
  "bg-emerald-100 text-emerald-700",
];

function initials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

const defaultScores = () =>
  COMPETENCIES.reduce((acc, c) => ({ ...acc, [c]: 5 }), {} as Record<Competency, number>);

type PendingDecision = { evidenceId: string; decision: "Approved" | "Rejected" };

function MentorPage() {
  const [activeStudent, setActiveStudent] = useState(students[0].id);
  const [decisions, setDecisions] = useLocalStorage<Partial<Record<string, "Approved" | "Rejected">>>("cgt-mentor-decisions", {});
  const [evidenceScores, setEvidenceScores] = useState<Record<string, Record<Competency, number>>>({});
  const [evidenceComments, setEvidenceComments] = useState<Record<string, string>>({});
  const [expandedEvidenceId, setExpandedEvidenceId] = useState<string | null>(null);
  const [submitted, setSubmitted] = useLocalStorage<SubmittedEval[]>("cgt-submitted-evaluations", []);
  const [extraEvidence] = useLocalStorage<Evidence[]>("cgt-extra-evidence", []);
  const [withdrawnArr] = useLocalStorage<string[]>("cgt-withdrawn", []);

  const withdrawnSet = useMemo(() => new Set(withdrawnArr), [withdrawnArr]);

  // Confirmation dialog state
  const [pendingDecision, setPendingDecision] = useState<PendingDecision | null>(null);
  const [pendingUndo, setPendingUndo] = useState<string | null>(null);

  const allEvidence = useMemo(() => [...seedEvidence, ...extraEvidence], [extraEvidence]);

  const studentEvidence = useMemo(
    () => allEvidence.filter((e) => e.studentId === activeStudent && !withdrawnSet.has(e.id)),
    [allEvidence, activeStudent, withdrawnSet],
  );

  const decide = (evidenceId: string, decision: "Approved" | "Rejected") => {
    const scores = evidenceScores[evidenceId] ?? defaultScores();
    const comment = evidenceComments[evidenceId] ?? "";
    setDecisions((d) => ({ ...d, [evidenceId]: decision }));
    setSubmitted((arr) => [
      { evidenceId, studentId: activeStudent, mentorId: "m1", date: new Date().toISOString().slice(0, 10), scores, comment, decision },
      ...arr.filter((s) => s.evidenceId !== evidenceId),
    ]);
    setExpandedEvidenceId(null);
  };

  return (
    <>
      <PageHeader
        title="Validate Claims"
        description="Review each evidence submission, score competencies, leave feedback, then approve or reject."
      />

      {/* Approve / Reject confirmation dialog */}
      {pendingDecision && (
        <ConfirmDialog
          title={pendingDecision.decision === "Approved" ? "Approve this evidence?" : "Reject this evidence?"}
          description={
            pendingDecision.decision === "Approved"
              ? "This will mark the submission as Approved and record your rubric scores and feedback."
              : "This will mark the submission as Rejected. The student will see this outcome."
          }
          confirmLabel={pendingDecision.decision === "Approved" ? "Yes, approve" : "Yes, reject"}
          destructive={pendingDecision.decision === "Rejected"}
          onConfirm={() => {
            decide(pendingDecision.evidenceId, pendingDecision.decision);
            setPendingDecision(null);
          }}
          onCancel={() => setPendingDecision(null)}
        />
      )}

      {/* Undo confirmation dialog */}
      {pendingUndo && (
        <ConfirmDialog
          title="Undo this decision?"
          description="This will return the submission to Pending status, clearing the recorded decision and rubric scores."
          confirmLabel="Yes, undo"
          onConfirm={() => {
            setDecisions((d) => { const next = { ...d }; delete next[pendingUndo!]; return next; });
            setSubmitted((arr) => arr.filter((s) => s.evidenceId !== pendingUndo));
            setPendingUndo(null);
          }}
          onCancel={() => setPendingUndo(null)}
        />
      )}

      {/* Student selector */}
      <div className="mb-5">
        <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-2">Select student</div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {students.map((s, i) => {
            const active = s.id === activeStudent;
            const ev = allEvidence.filter((e) => e.studentId === s.id && !withdrawnSet.has(e.id));
            const pending = ev.filter((e) => (decisions[e.id] ?? e.status) === "Pending").length;
            const approved = ev.filter((e) => (decisions[e.id] ?? e.status) === "Approved").length;
            return (
              <button
                key={s.id}
                onClick={() => { setActiveStudent(s.id); setExpandedEvidenceId(null); }}
                className={`text-left rounded-xl border p-4 transition-all ${
                  active
                    ? "border-primary ring-2 ring-primary/20 bg-card shadow-sm"
                    : "border-border bg-card hover:border-muted-foreground/40"
                }`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={`h-9 w-9 shrink-0 rounded-full grid place-items-center text-sm font-bold ${AVATAR_COLORS[i % AVATAR_COLORS.length]}`}>
                    {initials(s.name)}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold truncate">{s.name}</div>
                    <div className="text-[11px] text-muted-foreground truncate">{s.program.replace(", Final Year", "")}</div>
                  </div>
                </div>
                <div className="flex gap-3 text-xs">
                  <div className="flex-1 rounded-md bg-muted/60 px-2 py-1.5 text-center">
                    <div className="font-semibold">{ev.length}</div>
                    <div className="text-muted-foreground text-[10px]">total</div>
                  </div>
                  <div className="flex-1 rounded-md bg-muted/60 px-2 py-1.5 text-center">
                    <div className={`font-semibold ${pending > 0 ? "text-[color:var(--warning)]" : "text-[color:var(--success)]"}`}>{pending}</div>
                    <div className="text-muted-foreground text-[10px]">pending</div>
                  </div>
                  <div className="flex-1 rounded-md bg-muted/60 px-2 py-1.5 text-center">
                    <div className="font-semibold text-[color:var(--success)]">{approved}</div>
                    <div className="text-muted-foreground text-[10px]">approved</div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Evidence list */}
      <Card>
        <CardHeader
          title="Evidence Submissions"
          description="Expand each item to score all competencies, leave a comment, then approve or reject."
        />
        <ul className="divide-y divide-border">
          {studentEvidence.map((e) => {
            const override = decisions[e.id];
            const status = override ?? e.status;
            const isSettled = status === "Approved" || status === "Rejected";
            const isExpanded = expandedEvidenceId === e.id;
            const evScores = evidenceScores[e.id] ?? defaultScores();
            const evComment = evidenceComments[e.id] ?? "";

            return (
              <li key={e.id}>
                {/* Row header — always visible */}
                <button
                  className="w-full text-left px-5 py-3.5 flex items-center justify-between gap-3 hover:bg-muted/30 transition-colors"
                  onClick={() => setExpandedEvidenceId(isExpanded ? null : e.id)}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{e.title}</span>
                      {e.link && (
                        <a
                          href={`https://${e.link}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(ev) => ev.stopPropagation()}
                          className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                        >
                          <ExternalLink className="h-3 w-3" />
                          {e.link}
                        </a>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">{e.type} · {e.competencies.join(", ")}</div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <StatusBadge status={status} />
                    {isSettled && (
                      <span
                        role="button"
                        onClick={(ev) => {
                          ev.stopPropagation();
                          setPendingUndo(e.id);
                        }}
                        className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:bg-accent cursor-pointer"
                      >
                        <Undo2 className="h-3.5 w-3.5" /> Undo
                      </span>
                    )}
                    {isExpanded
                      ? <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
                      : <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                    }
                  </div>
                </button>

                {/* Dropdown — rubric + comment + actions */}
                {isExpanded && (
                  <div className="border-t border-border bg-muted/20 px-5 pb-5 pt-4 space-y-4">
                    {/* Evidence description */}
                    <div className="rounded-lg border border-border bg-background px-4 py-3 text-sm text-muted-foreground space-y-2">
                      <p>{e.description}</p>
                      {e.link && (
                        <a
                          href={`https://${e.link}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline font-medium"
                        >
                          <ExternalLink className="h-3 w-3" />
                          {e.link}
                        </a>
                      )}
                    </div>

                    {/* Competency rubric — all 6 */}
                    <div>
                      <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-1">
                        Rubric evaluation — score all competencies
                      </div>
                      <p className="text-xs text-muted-foreground mb-3">
                        Highlighted competencies are the ones the student submitted this evidence to demonstrate.
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {COMPETENCIES.map((c) => {
                          const val = evScores[c];
                          const isMapped = e.competencies.includes(c);
                          return (
                            <div
                              key={c}
                              className={`rounded-md border px-3 py-2.5 ${isMapped ? "border-primary/40 bg-primary/5" : "border-border bg-background"}`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">{c}</span>
                                <span className="text-xs font-mono text-muted-foreground">{val}/10</span>
                              </div>
                              <input
                                type="range" min={1} max={10} step={1}
                                value={val}
                                onChange={(ev) => setEvidenceScores((prev) => ({
                                  ...prev,
                                  [e.id]: { ...evScores, [c]: Number(ev.target.value) },
                                }))}
                                className="w-full mt-2 accent-[color:var(--primary)]"
                              />
                              <div className="text-[10px] text-muted-foreground mt-1">{RUBRIC[val - 1]}</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Comment */}
                    <div>
                      <label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-2 block">
                        Structured feedback
                      </label>
                      <textarea
                        value={evComment}
                        onChange={(ev) => setEvidenceComments((prev) => ({ ...prev, [e.id]: ev.target.value }))}
                        rows={3}
                        placeholder="Describe observed competencies, evidence quality, and recommended next steps."
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>

                    {/* Approve / Reject — only when not yet settled */}
                    {!isSettled ? (
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          onClick={() => setPendingDecision({ evidenceId: e.id, decision: "Approved" })}
                          className="inline-flex items-center gap-1.5 rounded-md bg-[color:var(--success)] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
                        >
                          <Check className="h-4 w-4" /> Approve
                        </button>
                        <button
                          onClick={() => setPendingDecision({ evidenceId: e.id, decision: "Rejected" })}
                          className="inline-flex items-center gap-1.5 rounded-md border border-destructive bg-background px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/10"
                        >
                          <X className="h-4 w-4" /> Reject
                        </button>
                        <button
                          onClick={() => setExpandedEvidenceId(null)}
                          className="ml-auto rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-xs text-muted-foreground">
                          Decision recorded · click <strong>Undo</strong> in the row above to reopen
                        </span>
                        <button
                          onClick={() => setExpandedEvidenceId(null)}
                          className="rounded-md px-3 py-1.5 text-xs text-muted-foreground hover:bg-accent"
                        >
                          Close
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </Card>

      {/* Decision log */}
      {submitted.length > 0 && (
        <Card className="mt-4">
          <CardHeader title="Decision Log" description="All recorded mentor decisions" />
          <ul className="divide-y divide-border">
            {submitted.map((v, i) => {
              const ev = allEvidence.find((e) => e.id === v.evidenceId);
              const avg = (COMPETENCIES.reduce((a, c) => a + v.scores[c], 0) / COMPETENCIES.length).toFixed(1);
              return (
                <li key={i} className="px-5 py-3">
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-0.5">
                    <span className="font-medium text-foreground">{ev?.title}</span>
                    <span className={v.decision === "Approved" ? "text-[color:var(--success)]" : "text-destructive"}>{v.decision}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{students.find((s) => s.id === v.studentId)?.name} · {v.date}</span>
                    <span>avg rubric {avg}/10</span>
                  </div>
                  {v.comment && <div className="mt-1 text-sm">{v.comment}</div>}
                </li>
              );
            })}
          </ul>
        </Card>
      )}
    </>
  );
}
