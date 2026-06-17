import { createFileRoute } from "@tanstack/react-router";
import { MapPin, Mail, GraduationCap, Briefcase, ExternalLink, Building2, Star, Users, BookOpen } from "lucide-react";
import { useRole } from "@/lib/role-context";
import { useStudent } from "@/lib/student-context";
import { students, recruiters, latestScores, readinessScore, strengthsWeaknesses, evaluations, evidence, COMPETENCIES, tier } from "@/lib/mock-data";
import { Card, CardHeader, PageHeader } from "@/components/page-header";
import { Pill } from "@/components/badges";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "Profile — Competency Tracker" }] }),
  component: ProfilePage,
});

const AVATAR_STUDENT = ["bg-blue-100 text-blue-700", "bg-violet-100 text-violet-700", "bg-emerald-100 text-emerald-700"];
const AVATAR_RECRUITER = ["bg-orange-100 text-orange-700", "bg-rose-100 text-rose-700", "bg-cyan-100 text-cyan-700"];

function initials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

function InfoRow({ icon, value }: { icon: React.ReactNode; value: string }) {
  return (
    <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
      <span className="shrink-0">{icon}</span>
      <span>{value}</span>
    </div>
  );
}

function ProfilePage() {
  const { role, personId } = useRole();
  return role === "recruiter" ? <RecruiterProfile personId={personId} /> : <StudentProfile />;
}

function StudentProfile() {
  const { student } = useStudent();
  const studentIdx = students.findIndex((s) => s.id === student.id);
  const colorClass = AVATAR_STUDENT[Math.max(studentIdx, 0) % AVATAR_STUDENT.length];

  const scores = latestScores(student.id);
  const readiness = readinessScore(scores);
  const { strengths, weaknesses } = strengthsWeaknesses(scores);
  const evals = evaluations.filter((e) => e.studentId === student.id).sort((a, b) => a.date.localeCompare(b.date));
  const evs = evidence.filter((e) => e.studentId === student.id);
  const approved = evs.filter((e) => e.status === "Approved").length;
  const pending = evs.filter((e) => e.status === "Pending").length;
  const lastEval = evals.at(-1);

  const sortedCompetencies = [...COMPETENCIES].sort((a, b) => scores[b] - scores[a]);

  return (
    <>
      <PageHeader
        title="My Profile"
        description="Your biographical data, competency snapshot, and academic record."
      />

      {/* Hero */}
      <Card className="mb-4">
        <div className="p-6 flex flex-col sm:flex-row items-start gap-5">
          <div className={`h-20 w-20 shrink-0 rounded-2xl grid place-items-center text-2xl font-bold ${colorClass}`}>
            {initials(student.name)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-start gap-3 justify-between">
              <div>
                <h2 className="text-xl font-semibold tracking-tight">{student.name}</h2>
                {student.careerInterest && (
                  <p className="text-sm text-muted-foreground mt-0.5">{student.careerInterest}</p>
                )}
              </div>
              {student.linkedIn && (
                <a
                  href={`https://${student.linkedIn}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-accent transition-colors"
                >
                  <ExternalLink className="h-3 w-3" /> LinkedIn
                </a>
              )}
            </div>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
              <InfoRow icon={<Mail className="h-4 w-4" />} value={student.email} />
              {student.location && (
                <InfoRow icon={<MapPin className="h-4 w-4" />} value={student.location} />
              )}
              <InfoRow icon={<GraduationCap className="h-4 w-4" />} value={`${student.university} · ${student.program}`} />
              <InfoRow icon={<Briefcase className="h-4 w-4" />} value={`Graduating ${student.graduationYear} · GPA ${student.gpa}`} />
            </div>
          </div>
        </div>
        {student.bio && (
          <div className="border-t border-border px-6 py-4">
            <p className="text-sm text-muted-foreground leading-relaxed">{student.bio}</p>
          </div>
        )}
      </Card>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <StatBox label="Career Readiness" value={`${readiness}%`} sub="composite score" />
        <StatBox label="Evidence submitted" value={String(evs.length)} sub={`${approved} approved · ${pending} pending`} />
        <StatBox label="Mentor sessions" value={String(evals.length)} sub={lastEval ? `Last: ${lastEval.date}` : "None yet"} />
        <StatBox label="Strengths" value={String(strengths.length)} sub={strengths.slice(0, 2).join(", ") || "—"} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Competency profile */}
        <Card>
          <CardHeader title="Competency Profile" description="Mentor-validated scores across all domains (1–10 scale)" />
          <div className="p-5 space-y-3">
            {sortedCompetencies.map((c) => {
              const v = scores[c];
              const t = tier(v);
              const barColor = t === "strong" ? "bg-[color:var(--success)]" : t === "weak" ? "bg-[color:oklch(0.65_0.15_25)]" : "bg-primary";
              return (
                <div key={c} className="flex items-center gap-3">
                  <span className="w-32 shrink-0 text-xs text-muted-foreground">{c}</span>
                  <div className="relative flex-1 h-3 rounded bg-muted border border-border overflow-hidden">
                    <div className={`absolute inset-y-0 left-0 rounded transition-all ${barColor}`} style={{ width: `${(v / 10) * 100}%` }} />
                  </div>
                  <span className="w-10 text-right text-xs font-mono text-muted-foreground">{v}/10</span>
                  <Pill tone={t}>{t}</Pill>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Strengths / areas to develop + recent feedback */}
        <div className="space-y-4">
          <Card>
            <CardHeader title="Strengths" description="Competencies scoring above 6" />
            <div className="p-5 flex flex-wrap gap-1.5 min-h-[52px]">
              {strengths.length
                ? strengths.map((c) => <Pill key={c} tone="strong">{c} · {scores[c]}/10</Pill>)
                : <span className="text-xs text-muted-foreground">No strengths identified yet.</span>}
            </div>
          </Card>
          <Card>
            <CardHeader title="Areas to develop" description="Competencies scoring 6 or below" />
            <div className="p-5 flex flex-wrap gap-1.5 min-h-[52px]">
              {weaknesses.length
                ? weaknesses.map((c) => <Pill key={c} tone={tier(scores[c])}>{c} · {scores[c]}/10</Pill>)
                : <span className="text-xs text-muted-foreground">All competencies are strong.</span>}
            </div>
          </Card>
          {lastEval && (
            <Card>
              <CardHeader title="Latest mentor feedback" description={lastEval.date} />
              <div className="px-5 pb-5 pt-2 text-sm text-muted-foreground leading-relaxed">
                {lastEval.comment}
              </div>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}

function RecruiterProfile({ personId }: { personId: string | null }) {
  const { registeredUsers } = useRole();
  const recruiterIdx = recruiters.findIndex((r) => r.id === personId);
  const mockRec = recruiterIdx >= 0 ? recruiters[recruiterIdx] : null;
  const regRec = !mockRec ? (registeredUsers.find((u) => u.id === personId && u.role === "recruiter") ?? null) : null;
  const colorClass = AVATAR_RECRUITER[Math.max(recruiterIdx, 0) % AVATAR_RECRUITER.length];

  const name = mockRec?.name ?? regRec?.name ?? "Recruiter";
  const email = mockRec?.email ?? regRec?.email ?? "";
  const location = mockRec?.location ?? "";
  const company = mockRec?.company ?? regRec?.company ?? "";
  const title = mockRec?.title ?? regRec?.title ?? "";
  const yearsExperience = mockRec?.yearsExperience ?? 0;
  const bio = mockRec?.bio ?? "";
  const linkedIn = mockRec?.linkedIn ?? "";
  const specializations = mockRec?.specializations ?? [];

  const totalCandidates = students.length;
  const totalEvidence = evidence.length;
  const totalApproved = evidence.filter((e) => e.status === "Approved").length;
  const totalPending = evidence.filter((e) => e.status === "Pending").length;
  const totalEvals = evaluations.length;

  return (
    <>
      <PageHeader
        title="My Profile"
        description="Your recruiter profile and platform activity summary."
      />

      {/* Hero */}
      <Card className="mb-4">
        <div className="p-6 flex flex-col sm:flex-row items-start gap-5">
          <div className={`h-20 w-20 shrink-0 rounded-2xl grid place-items-center text-2xl font-bold ${colorClass}`}>
            {initials(name)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-start gap-3 justify-between">
              <div>
                <h2 className="text-xl font-semibold tracking-tight">{name}</h2>
                {(title || company) && (
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {[title, company].filter(Boolean).join(" · ")}
                  </p>
                )}
              </div>
              {linkedIn && (
                <a
                  href={`https://${linkedIn}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-accent transition-colors"
                >
                  <ExternalLink className="h-3 w-3" /> LinkedIn
                </a>
              )}
            </div>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
              {email && <InfoRow icon={<Mail className="h-4 w-4" />} value={email} />}
              {location && <InfoRow icon={<MapPin className="h-4 w-4" />} value={location} />}
              {company && <InfoRow icon={<Building2 className="h-4 w-4" />} value={company} />}
              {yearsExperience > 0 && (
                <InfoRow icon={<Briefcase className="h-4 w-4" />} value={`${yearsExperience} years in recruiting`} />
              )}
            </div>
          </div>
        </div>
        {bio && (
          <div className="border-t border-border px-6 py-4">
            <p className="text-sm text-muted-foreground leading-relaxed">{bio}</p>
          </div>
        )}
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <StatBox label="Candidates reviewed" value={String(totalCandidates)} sub="active in pipeline" />
        <StatBox label="Evidence reviewed" value={String(totalEvidence)} sub={`${totalApproved} approved · ${totalPending} pending`} />
        <StatBox label="Mentor evaluations" value={String(totalEvals)} sub="across all students" />
        <StatBox label="Approval rate" value={`${Math.round((totalApproved / totalEvidence) * 100)}%`} sub="of all submissions" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader title="Specializations" description="Roles and domains this recruiter focuses on" />
          <div className="p-5 flex flex-wrap gap-2 min-h-[52px]">
            {specializations.length > 0
              ? specializations.map((s) => (
                  <span key={s} className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-muted/40 px-3 py-1.5 text-sm font-medium">
                    <Star className="h-3.5 w-3.5 text-[color:var(--warning)]" />{s}
                  </span>
                ))
              : <span className="text-xs text-muted-foreground">No specializations listed yet.</span>}
          </div>
        </Card>
        <Card>
          <CardHeader title="Platform summary" description="Overview of pipeline and review activity" />
          <ul className="divide-y divide-border">
            <SummaryRow icon={<Users className="h-4 w-4 text-primary" />} label="Candidates in pipeline" value={String(totalCandidates)} />
            <SummaryRow icon={<BookOpen className="h-4 w-4 text-[color:var(--success)]" />} label="Evidence submissions reviewed" value={String(totalEvidence)} />
            {yearsExperience > 0 && (
              <SummaryRow icon={<Briefcase className="h-4 w-4 text-muted-foreground" />} label="Years of recruiting experience" value={String(yearsExperience)} />
            )}
          </ul>
        </Card>
      </div>
    </>
  );
}

function StatBox({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="rounded-lg border border-border bg-card px-4 py-4">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 text-2xl font-semibold tracking-tight">{value}</div>
      <div className="text-xs text-muted-foreground mt-0.5">{sub}</div>
    </div>
  );
}

function SummaryRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <li className="flex items-center justify-between px-5 py-3 text-sm">
      <div className="flex items-center gap-2.5 text-muted-foreground">
        {icon}<span>{label}</span>
      </div>
      <span className="font-semibold">{value}</span>
    </li>
  );
}
