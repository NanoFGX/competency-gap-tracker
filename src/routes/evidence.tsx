import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Github,
  FileText,
  Presentation,
  Trophy,
  Plus,
  X,
  Upload,
  CheckCircle2,
  Clock,
  XCircle,
  User,
} from "lucide-react";
import { useStudent } from "@/lib/student-context";
import {
  COMPETENCIES,
  evidence as seedEvidence,
  mentors,
  type Competency,
  type Evidence,
  type EvidenceType,
} from "@/lib/mock-data";
import { Card, PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/badges";
import { Banner, ConfirmDialog, FieldError } from "@/components/ui";
import { useLocalStorage, type SubmittedEval } from "@/lib/use-local-storage";

export const Route = createFileRoute("/evidence")({
  head: () => ({ meta: [{ title: "Evidence — Competency Tracker" }] }),
  component: EvidencePage,
});

const PRESET_TYPES = ["GitHub Project", "Report", "Presentation", "Hackathon"] as const;

const TYPE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  "GitHub Project": Github,
  Report: FileText,
  Presentation: Presentation,
  Hackathon: Trophy,
};

function getIcon(type: string) {
  return TYPE_ICONS[type] ?? FileText;
}

function EvidencePage() {
  const { student } = useStudent();
  const [extra, setExtra] = useLocalStorage<Evidence[]>("cgt-extra-evidence", []);
  const [withdrawnArr, setWithdrawnArr] = useLocalStorage<string[]>("cgt-withdrawn", []);
  const [decisions] = useLocalStorage<Partial<Record<string, "Approved" | "Rejected">>>(
    "cgt-mentor-decisions",
    {},
  );
  const [submittedEvals] = useLocalStorage<SubmittedEval[]>("cgt-submitted-evaluations", []);
  const withdrawn = useMemo(() => new Set(withdrawnArr), [withdrawnArr]);
  const [open, setOpen] = useState(false);
  const [banner, setBanner] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [pendingWithdrawId, setPendingWithdrawId] = useState<string | null>(null);
  const [detailEvidence, setDetailEvidence] = useState<Evidence | null>(null);

  // Heuristic 1: Auto-dismiss status banner after 5 s
  useEffect(() => {
    if (!banner) return;
    const t = setTimeout(() => setBanner(null), 5000);
    return () => clearTimeout(t);
  }, [banner]);

  // Heuristic 3: Escape key closes modal / detail view
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (detailEvidence) {
          setDetailEvidence(null);
          return;
        }
        setOpen(false);
      }
    };
    if (open || detailEvidence) document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, detailEvidence]);

  const items = useMemo(
    () =>
      [...seedEvidence, ...extra]
        .filter((e) => e.studentId === student.id && !withdrawn.has(e.id))
        .sort((a, b) => b.submittedAt.localeCompare(a.submittedAt)),
    [extra, student.id, withdrawn],
  );

  const handleWithdraw = (id: string) => {
    setWithdrawnArr((prev) => [...prev, id]);
    setPendingWithdrawId(null);
    setBanner({ type: "success", message: "Submission withdrawn and removed from mentor review." });
  };

  return (
    <>
      <PageHeader
        eyebrow="Student"
        icon={<FileText className="h-5 w-5" />}
        title="Evidence Portfolio"
        description="Concrete work mapped to competencies. Each item is mentor-validated before it counts toward your profile."
        actions={
          <button
            onClick={() => setOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-[color:var(--primary-hover)]"
          >
            <Plus className="h-4 w-4" /> New evidence
          </button>
        }
      />

      {/* Heuristic 1: System status banner */}
      {banner && (
        <Banner type={banner.type} message={banner.message} onDismiss={() => setBanner(null)} />
      )}

      {/* Withdraw confirmation popup */}
      {pendingWithdrawId && (
        <ConfirmDialog
          title="Withdraw this submission?"
          description="The evidence will be removed from mentor review and will no longer count toward your profile. You can re-submit at any time."
          confirmLabel="Yes, withdraw"
          destructive
          onConfirm={() => handleWithdraw(pendingWithdrawId)}
          onCancel={() => setPendingWithdrawId(null)}
        />
      )}

      {/* Evidence detail modal */}
      {detailEvidence && (
        <EvidenceDetailModal
          evidence={detailEvidence}
          effectiveStatus={decisions[detailEvidence.id] ?? detailEvidence.status}
          runtimeEval={submittedEvals.find((s) => s.evidenceId === detailEvidence.id)}
          onClose={() => setDetailEvidence(null)}
          onRequestWithdraw={(id) => {
            setDetailEvidence(null);
            setPendingWithdrawId(id);
          }}
        />
      )}

      {/* Heuristic 3: Submit modal with Esc + backdrop-click to close */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.55)" }}
        >
          <div className="absolute inset-0" onClick={() => setOpen(false)} aria-hidden="true" />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            className="relative z-10 bg-card rounded-xl border border-border shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
              <div>
                <h2 id="modal-title" className="text-base font-semibold">
                  Submit Evidence
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Add work mapped to your competencies for mentor review
                  <span className="ml-2 text-muted-foreground/45">(Esc to close)</span>
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close modal"
                className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="overflow-y-auto flex-1">
              <NewEvidenceForm
                studentId={student.id}
                onCancel={() => setOpen(false)}
                onSubmit={(ev) => {
                  setExtra((x: Evidence[]) => [...x, ev]);
                  setOpen(false);
                  setBanner({
                    type: "success",
                    message:
                      "Evidence submitted for review. It will appear as Pending until a mentor validates it.",
                  });
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Heuristic 10: Guided empty state */}
      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border py-16 flex flex-col items-center text-center px-8">
          <div className="h-12 w-12 rounded-full bg-muted grid place-items-center mb-4">
            <FileText className="h-5 w-5 text-muted-foreground" />
          </div>
          <h3 className="text-sm font-semibold mb-1">No evidence yet</h3>
          <p className="text-xs text-muted-foreground mb-5 max-w-xs leading-relaxed">
            Submit your first piece of evidence — a GitHub project, report, presentation, or
            hackathon entry — to start building your validated competency profile.
          </p>
          <button
            onClick={() => setOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            <Plus className="h-4 w-4" /> Submit your first evidence
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map((e) => (
            <EvidenceCard
              key={e.id}
              evidence={e}
              effectiveStatus={decisions[e.id] ?? e.status}
              onView={setDetailEvidence}
              onRequestWithdraw={setPendingWithdrawId}
            />
          ))}
        </div>
      )}
    </>
  );
}

function EvidenceCard({
  evidence: e,
  effectiveStatus,
  onView,
  onRequestWithdraw,
}: {
  evidence: Evidence;
  effectiveStatus: Evidence["status"];
  onView: (ev: Evidence) => void;
  onRequestWithdraw: (id: string) => void;
}) {
  const Icon = getIcon(e.type);

  return (
    <div
      className="rounded-lg border border-border bg-card shadow-[0_1px_2px_rgba(15,23,42,0.04)] flex flex-col cursor-pointer hover:border-primary/40 transition-colors group"
      onClick={() => onView(e)}
      role="button"
      tabIndex={0}
      onKeyDown={(ev) => ev.key === "Enter" && onView(e)}
      aria-label={`View details for ${e.title}`}
    >
      <div className="px-5 py-4 border-b border-border flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className="h-8 w-8 rounded-md bg-muted grid place-items-center shrink-0 group-hover:bg-primary/10 transition-colors">
            <Icon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold truncate group-hover:text-primary transition-colors">
              {e.title}
            </div>
            <div className="text-xs text-muted-foreground">
              {e.type} · {e.submittedAt}
            </div>
          </div>
        </div>
        <div className="shrink-0">
          <StatusBadge status={effectiveStatus} />
        </div>
      </div>
      <div className="px-5 py-4 text-sm text-muted-foreground leading-relaxed flex-1 line-clamp-3">
        {e.description || (
          <span className="italic text-muted-foreground/50">No description provided.</span>
        )}
      </div>
      <div className="px-5 py-3 border-t border-border flex flex-wrap items-center gap-2">
        {e.competencies.map((c) => (
          <span key={c} className="text-xs px-2 py-0.5 rounded-md bg-accent text-accent-foreground">
            {c}
          </span>
        ))}
        <div className="ml-auto flex items-center gap-2 shrink-0">
          {e.link ? (
            <a
              href={`https://${e.link}`}
              target="_blank"
              rel="noreferrer"
              onClick={(ev) => ev.stopPropagation()}
              className="inline-flex items-center gap-1.5 rounded-md bg-primary/10 border border-primary/20 px-2.5 py-1 text-xs text-primary hover:bg-primary/15 font-medium transition-colors"
            >
              <Github className="h-3.5 w-3.5" /> GitHub
            </a>
          ) : null}
          {effectiveStatus === "Pending" && (
            <button
              onClick={(ev) => {
                ev.stopPropagation();
                onRequestWithdraw(e.id);
              }}
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 px-2.5 py-1 rounded-md border border-border transition-colors"
              aria-label="Withdraw this submission"
            >
              <X className="h-3 w-3" /> Withdraw
            </button>
          )}
          <span className="text-[10px] text-muted-foreground/50 hidden group-hover:inline">
            View details →
          </span>
        </div>
      </div>
    </div>
  );
}

// Heuristics 5 + 9: Form validation with specific inline error messages
type FormErrors = {
  title?: string;
  customType?: string;
  competencies?: string;
};

function NewEvidenceForm({
  studentId,
  onSubmit,
  onCancel,
}: {
  studentId: string;
  onSubmit: (e: Evidence) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState("");
  const [typeValue, setTypeValue] = useState<string>("GitHub Project");
  const [customType, setCustomType] = useState("");
  const [description, setDescription] = useState("");
  const [githubLink, setGithubLink] = useState("");
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [selected, setSelected] = useState<Competency[]>([]);
  const [errors, setErrors] = useState<FormErrors>({});

  const isCustom = typeValue === "__other__";
  const finalType = isCustom ? customType.trim() || "Other" : typeValue;
  const DESC_MAX = 1000;

  const toggle = (c: Competency) =>
    setSelected((s) => (s.includes(c) ? s.filter((x) => x !== c) : [...s, c]));

  function validate(): FormErrors {
    const e: FormErrors = {};
    if (!title.trim()) e.title = "Title is required.";
    if (isCustom && !customType.trim()) e.customType = "Please describe the evidence type.";
    if (selected.length === 0) e.competencies = "Select at least one competency.";
    return e;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    onSubmit({
      id: `ev-${Date.now()}`,
      studentId,
      title: title.trim(),
      type: finalType as EvidenceType,
      description,
      link: githubLink.trim() || undefined,
      competencies: selected,
      status: "Pending",
      submittedAt: new Date().toISOString().slice(0, 10),
    });
  };

  return (
    <form className="p-6 space-y-5" onSubmit={handleSubmit} noValidate>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Title */}
        <Field label="Title *">
          <input
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (e.target.value.trim()) setErrors((x) => ({ ...x, title: undefined }));
            }}
            className={`inp${errors.title ? " inp-error" : ""}`}
            placeholder="e.g. Capstone Project"
            aria-describedby={errors.title ? "err-title" : undefined}
          />
          <FieldError message={errors.title} />
        </Field>

        {/* Type */}
        <Field label="Type *">
          <select value={typeValue} onChange={(e) => setTypeValue(e.target.value)} className="inp">
            {PRESET_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
            <option value="__other__">Other (specify below)</option>
          </select>
          {isCustom && (
            <>
              <input
                value={customType}
                onChange={(e) => {
                  setCustomType(e.target.value);
                  if (e.target.value.trim()) setErrors((x) => ({ ...x, customType: undefined }));
                }}
                placeholder="Describe the evidence type..."
                className={`inp mt-2${errors.customType ? " inp-error" : ""}`}
              />
              <FieldError message={errors.customType} />
            </>
          )}
        </Field>
      </div>

      {/* Description */}
      <Field label={`Description (${description.length}/${DESC_MAX})`}>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value.slice(0, DESC_MAX))}
          rows={4}
          className="inp resize-none"
          placeholder="What did you build or do? What was your role? What was the outcome?"
        />
        {description.length >= DESC_MAX * 0.9 && (
          <p className="text-xs text-[color:var(--warning)] mt-1">
            Approaching character limit ({DESC_MAX - description.length} remaining).
          </p>
        )}
      </Field>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* GitHub link */}
        <Field label="GitHub Link (optional)">
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2.5">
              <Github className="h-4 w-4 text-muted-foreground" />
            </div>
            <input
              value={githubLink}
              onChange={(e) => setGithubLink(e.target.value)}
              className="inp"
              style={{ paddingLeft: "2rem" }}
              placeholder="github.com/user/repo"
              inputMode="url"
            />
          </div>
        </Field>

        {/* Photo/video upload */}
        <Field label="Photos / Videos (optional)">
          <div className="relative">
            <div className="flex items-center gap-2 h-[38px] rounded-md border border-dashed border-input bg-muted/40 text-xs text-muted-foreground px-3 pointer-events-none">
              <Upload className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">
                {mediaFile ? mediaFile.name : "Click to upload image or video"}
              </span>
            </div>
            <input
              type="file"
              accept="image/*,video/*"
              className="absolute inset-0 opacity-0 cursor-pointer"
              onChange={(e) => setMediaFile(e.target.files?.[0] ?? null)}
            />
          </div>
        </Field>
      </div>

      {/* Competencies */}
      <Field label="Competencies *">
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Select competencies">
          {COMPETENCIES.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => {
                toggle(c);
                setErrors((x) => ({ ...x, competencies: undefined }));
              }}
              aria-pressed={selected.includes(c)}
              className={`text-xs px-2.5 py-1 rounded-md border transition-colors ${
                selected.includes(c)
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background text-muted-foreground border-border hover:bg-accent"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
        <FieldError message={errors.competencies} />
      </Field>

      <div className="flex justify-end gap-2 pt-1 border-t border-border">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-border px-3 py-1.5 text-sm hover:bg-accent"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="rounded-md bg-primary px-4 py-1.5 text-sm text-primary-foreground hover:opacity-90 font-medium"
        >
          Submit for review
        </button>
      </div>

      <style>{`
        .inp { width: 100%; border: 1px solid var(--input); background: var(--background); border-radius: 6px; padding: 6px 10px; font-size: 13px; outline: none; }
        .inp:focus { box-shadow: 0 0 0 2px var(--ring); }
        .inp-error { border-color: var(--destructive) !important; }
        .inp-error:focus { box-shadow: 0 0 0 2px color-mix(in oklch, var(--destructive) 30%, transparent); }
      `}</style>
    </form>
  );
}

function EvidenceDetailModal({
  evidence: e,
  effectiveStatus,
  runtimeEval,
  onClose,
  onRequestWithdraw,
}: {
  evidence: Evidence;
  effectiveStatus: Evidence["status"];
  runtimeEval?: SubmittedEval;
  onClose: () => void;
  onRequestWithdraw: (id: string) => void;
}) {
  const Icon = getIcon(e.type);

  // Prefer runtime eval (from mentor page), fall back to seeded mock feedback
  const fb = runtimeEval
    ? {
        mentorId: runtimeEval.mentorId,
        date: runtimeEval.date,
        scores: runtimeEval.scores,
        comment: runtimeEval.comment,
      }
    : e.mentorFeedback;
  const mentorName = fb ? (mentors.find((m) => m.id === fb.mentorId)?.name ?? "Mentor") : null;

  const statusIcon = {
    Approved: <CheckCircle2 className="h-4 w-4 text-[color:var(--success)]" />,
    Pending: <Clock className="h-4 w-4 text-[color:var(--warning)]" />,
    Rejected: <XCircle className="h-4 w-4 text-destructive" />,
  }[effectiveStatus];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.55)" }}
    >
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        className="relative z-10 bg-card rounded-xl border border-border shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-4 border-b border-border shrink-0 gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <div className="h-9 w-9 rounded-md bg-muted grid place-items-center shrink-0 mt-0.5">
              <Icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-semibold leading-tight">{e.title}</h2>
              <div className="text-xs text-muted-foreground mt-0.5">
                {e.type} · Submitted {e.submittedAt}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <StatusBadge status={effectiveStatus} />
            <button
              onClick={onClose}
              aria-label="Close"
              className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
          {/* Description */}
          <div>
            <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-2">
              Description
            </div>
            <p className="text-sm leading-relaxed text-foreground">
              {e.description || (
                <span className="italic text-muted-foreground">No description provided.</span>
              )}
            </p>
          </div>

          {/* Links + competencies */}
          <div className="flex flex-wrap items-center gap-2">
            {e.link && (
              <a
                href={`https://${e.link}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-md bg-primary/10 border border-primary/20 px-3 py-1.5 text-xs text-primary hover:bg-primary/15 font-medium transition-colors"
              >
                <Github className="h-3.5 w-3.5" /> View on GitHub
              </a>
            )}
            {e.competencies.map((c) => (
              <span
                key={c}
                className="text-xs px-2.5 py-1 rounded-md bg-accent text-accent-foreground border border-border"
              >
                {c}
              </span>
            ))}
          </div>

          {/* Mentor assessment section */}
          {effectiveStatus === "Pending" ? (
            <div className="rounded-xl border border-dashed border-border bg-muted/10 p-5 flex items-start gap-3">
              <Clock className="h-4 w-4 text-[color:var(--warning)] mt-0.5 shrink-0" />
              <div>
                <div className="text-xs font-semibold mb-0.5">Awaiting mentor review</div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  This evidence hasn't been evaluated yet. Mentor feedback and competency scores
                  will appear here once a mentor has reviewed your submission.
                </p>
              </div>
            </div>
          ) : fb ? (
            <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-4">
              <div className="flex items-start gap-2">
                {statusIcon}
                <div>
                  <div className="text-xs font-semibold">Mentor Assessment</div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {effectiveStatus === "Approved"
                      ? "Validated — scores reflect the mentor's evaluation of this specific submission."
                      : "Not validated — see mentor feedback below."}
                  </p>
                </div>
              </div>

              {/* Mentor identity */}
              <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5" />
                  Reviewed by{" "}
                  <span className="font-medium text-foreground/70 ml-1">{mentorName}</span>
                </span>
                <span>· {fb.date}</span>
              </div>

              {/* Per-competency scores for mapped competencies */}
              <div className="space-y-2.5">
                <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                  Competency scores for this submission
                </div>
                {e.competencies.map((c) => {
                  const score = fb.scores[c] ?? 0;
                  const pct = (score / 10) * 100;
                  return (
                    <div key={c}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-medium">{c}</span>
                        <span className="font-mono text-muted-foreground">{score}/10</span>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${pct}%`,
                            background:
                              score >= 8
                                ? "var(--success)"
                                : score >= 5
                                  ? "var(--primary)"
                                  : "var(--warning)",
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Mentor comment */}
              <div className="border-t border-border/60 pt-3">
                <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-1.5">
                  Mentor feedback
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed italic">
                  "{fb.comment}"
                </p>
                <div className="text-[10px] text-muted-foreground mt-1.5">
                  — {mentorName}, {fb.date}
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-border bg-muted/20 p-4 flex items-start gap-2">
              {statusIcon}
              <div>
                <div className="text-xs font-semibold">Mentor Assessment</div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  No detailed feedback recorded for this submission.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-border flex items-center justify-between shrink-0">
          <span className="text-[11px] text-muted-foreground/50">(Esc to close)</span>
          <div className="flex items-center gap-2">
            {effectiveStatus === "Pending" && (
              <button
                onClick={() => onRequestWithdraw(e.id)}
                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 px-2.5 py-1.5 rounded-md border border-border transition-colors"
              >
                <X className="h-3 w-3" /> Withdraw
              </button>
            )}
            <button
              onClick={onClose}
              className="rounded-md border border-border px-3 py-1.5 text-sm hover:bg-accent transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-muted-foreground mb-1.5 block">{label}</span>
      {children}
    </label>
  );
}
