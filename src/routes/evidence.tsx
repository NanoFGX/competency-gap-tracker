import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Github, FileText, Presentation, Trophy, Link2, Plus } from "lucide-react";
import { useStudent } from "@/lib/student-context";
import { COMPETENCIES, evidence as seedEvidence, type Competency, type Evidence, type EvidenceType } from "@/lib/mock-data";
import { Card, CardHeader, PageHeader } from "@/components/page-header";
import { StatusBadge } from "./index";

export const Route = createFileRoute("/evidence")({
  head: () => ({ meta: [{ title: "Evidence — Competency Tracker" }] }),
  component: EvidencePage,
});

const typeIcon: Record<EvidenceType, React.ComponentType<{ className?: string }>> = {
  "GitHub Project": Github,
  Report: FileText,
  Presentation: Presentation,
  Hackathon: Trophy,
};

function EvidencePage() {
  const { student } = useStudent();
  const [extra, setExtra] = useState<Evidence[]>([]);
  const [open, setOpen] = useState(false);

  const items = useMemo(
    () => [...seedEvidence, ...extra].filter((e) => e.studentId === student.id).sort((a, b) => b.submittedAt.localeCompare(a.submittedAt)),
    [extra, student.id],
  );

  return (
    <>
      <PageHeader
        title="Evidence Portfolio"
        description="Concrete work mapped to competencies. Each item is mentor-validated before it counts toward the profile."
        actions={
          <button
            onClick={() => setOpen((v) => !v)}
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            <Plus className="h-4 w-4" /> New evidence
          </button>
        }
      />

      {open ? (
        <Card className="mb-4">
          <CardHeader title="Submit evidence" description="Maps to one or more competencies." />
          <NewEvidenceForm
            studentId={student.id}
            onCancel={() => setOpen(false)}
            onSubmit={(ev) => {
              setExtra((x) => [...x, ev]);
              setOpen(false);
            }}
          />
        </Card>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((e) => {
          const Icon = typeIcon[e.type];
          return (
            <Card key={e.id} className="flex flex-col">
              <div className="px-5 py-4 border-b border-border flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="h-8 w-8 rounded-md bg-muted grid place-items-center shrink-0">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold truncate">{e.title}</div>
                    <div className="text-xs text-muted-foreground">{e.type} · {e.submittedAt}</div>
                  </div>
                </div>
                <StatusBadge status={e.status} />
              </div>
              <div className="px-5 py-4 text-sm text-muted-foreground leading-relaxed flex-1">{e.description}</div>
              <div className="px-5 py-3 border-t border-border flex flex-wrap items-center gap-2">
                {e.competencies.map((c) => (
                  <span key={c} className="text-xs px-2 py-0.5 rounded-md bg-accent text-accent-foreground">{c}</span>
                ))}
                {e.link ? (
                  <a href={`https://${e.link}`} target="_blank" rel="noreferrer" className="ml-auto inline-flex items-center gap-1 text-xs text-primary hover:underline">
                    <Link2 className="h-3 w-3" /> {e.link}
                  </a>
                ) : null}
              </div>
            </Card>
          );
        })}
      </div>
    </>
  );
}

function NewEvidenceForm({ studentId, onSubmit, onCancel }: { studentId: string; onSubmit: (e: Evidence) => void; onCancel: () => void }) {
  const [title, setTitle] = useState("");
  const [type, setType] = useState<EvidenceType>("GitHub Project");
  const [description, setDescription] = useState("");
  const [link, setLink] = useState("");
  const [selected, setSelected] = useState<Competency[]>([]);

  const toggle = (c: Competency) =>
    setSelected((s) => (s.includes(c) ? s.filter((x) => x !== c) : [...s, c]));

  return (
    <form
      className="p-5 space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (!title || selected.length === 0) return;
        onSubmit({
          id: `ev-${Date.now()}`,
          studentId,
          title,
          type,
          description,
          link: link || undefined,
          competencies: selected,
          status: "Pending",
          submittedAt: new Date().toISOString().slice(0, 10),
        });
      }}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Title">
          <input value={title} onChange={(e) => setTitle(e.target.value)} required className="input" placeholder="e.g. Capstone Project" />
        </Field>
        <Field label="Type">
          <select value={type} onChange={(e) => setType(e.target.value as EvidenceType)} className="input">
            {(["GitHub Project", "Report", "Presentation", "Hackathon"] as EvidenceType[]).map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </Field>
      </div>
      <Field label="Description">
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="input" placeholder="What was built, what was your role, what outcome?" />
      </Field>
      <Field label="Link (optional)">
        <input value={link} onChange={(e) => setLink(e.target.value)} className="input" placeholder="github.com/user/repo" />
      </Field>
      <Field label="Competencies">
        <div className="flex flex-wrap gap-1.5">
          {COMPETENCIES.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => toggle(c)}
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
      </Field>
      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={onCancel} className="rounded-md border border-border px-3 py-1.5 text-sm hover:bg-accent">Cancel</button>
        <button type="submit" className="rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:opacity-90">Submit for review</button>
      </div>
      <style>{`.input { width:100%; border:1px solid var(--input); background:var(--background); border-radius:6px; padding:6px 10px; font-size:13px; outline:none; }
      .input:focus { box-shadow: 0 0 0 2px var(--ring); }`}</style>
    </form>
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
