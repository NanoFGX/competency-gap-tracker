export const COMPETENCIES = [
  "Communication",
  "Leadership",
  "Technical Writing",
  "UX Empathy",
  "Problem Solving",
  "Teamwork",
] as const;

export type Competency = (typeof COMPETENCIES)[number];

export type EvidenceType = "GitHub Project" | "Report" | "Presentation" | "Hackathon";

export interface Evidence {
  id: string;
  title: string;
  type: EvidenceType;
  description: string;
  link?: string;
  competencies: Competency[];
  status: "Pending" | "Approved" | "Rejected";
  submittedAt: string;
  studentId: string;
}

export interface Evaluation {
  id: string;
  studentId: string;
  mentorId: string;
  date: string;
  scores: Record<Competency, number>;
  comment: string;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  program: string;
}

export interface Mentor {
  id: string;
  name: string;
  role: string;
}

export const students: Student[] = [
  { id: "s1", name: "Aisha Rahman", email: "aisha.r@university.edu", program: "BSc Computer Science, Final Year" },
  { id: "s2", name: "Marcus Chen", email: "marcus.c@university.edu", program: "BSc Computer Science, Final Year" },
  { id: "s3", name: "Priya Sharma", email: "priya.s@university.edu", program: "BSc Computer Science, Final Year" },
];

export const mentors: Mentor[] = [
  { id: "m1", name: "Dr. Eleanor Wright", role: "Senior Lecturer, Software Engineering" },
  { id: "m2", name: "Prof. David Okafor", role: "Lecturer, Human-Computer Interaction" },
];

export const evidence: Evidence[] = [
  { id: "e1", studentId: "s1", title: "Inventory Management System", type: "GitHub Project", description: "Full-stack inventory app built with Node.js and PostgreSQL. Includes role-based access and reporting.", link: "github.com/aisha/inventory", competencies: ["Problem Solving", "Technical Writing"], status: "Approved", submittedAt: "2025-09-12" },
  { id: "e2", studentId: "s1", title: "Final Year Research Report", type: "Report", description: "12,000-word technical report on distributed caching strategies.", competencies: ["Technical Writing", "Problem Solving"], status: "Approved", submittedAt: "2025-10-04" },
  { id: "e3", studentId: "s1", title: "Hack the Coast 2025", type: "Hackathon", description: "48-hour hackathon, led 4-person team to runner-up finish.", competencies: ["Leadership", "Teamwork", "Communication"], status: "Approved", submittedAt: "2025-11-02" },
  { id: "e4", studentId: "s1", title: "Capstone Pitch Deck", type: "Presentation", description: "Delivered pitch to faculty panel and industry guests.", competencies: ["Communication", "UX Empathy"], status: "Pending", submittedAt: "2026-02-18" },

  { id: "e5", studentId: "s2", title: "Patient Triage Mobile App", type: "GitHub Project", description: "React Native app prototyped with NHS volunteers.", link: "github.com/marcus/triage", competencies: ["UX Empathy", "Problem Solving", "Technical Writing"], status: "Approved", submittedAt: "2025-08-22" },
  { id: "e6", studentId: "s2", title: "Usability Study Report", type: "Report", description: "Conducted 8 interviews and a heuristic evaluation.", competencies: ["UX Empathy", "Technical Writing"], status: "Approved", submittedAt: "2025-10-19" },
  { id: "e7", studentId: "s2", title: "Departmental Seminar Talk", type: "Presentation", description: "Presented user research findings to 60 attendees.", competencies: ["Communication", "UX Empathy"], status: "Approved", submittedAt: "2026-01-14" },

  { id: "e8", studentId: "s3", title: "ML Fraud Detection Service", type: "GitHub Project", description: "Python microservice for credit fraud scoring with FastAPI.", link: "github.com/priya/fraud-ml", competencies: ["Problem Solving", "Technical Writing"], status: "Approved", submittedAt: "2025-09-30" },
  { id: "e9", studentId: "s3", title: "OpenAI Hackathon", type: "Hackathon", description: "Solo entry building an accessibility-focused screen reader.", competencies: ["Problem Solving", "UX Empathy"], status: "Approved", submittedAt: "2025-12-05" },
  { id: "e10", studentId: "s3", title: "Team Retrospective Report", type: "Report", description: "Documented sprint retros for capstone team of 5.", competencies: ["Teamwork", "Leadership", "Technical Writing"], status: "Pending", submittedAt: "2026-03-02" },
];

export const evaluations: Evaluation[] = [
  { id: "v1", studentId: "s1", mentorId: "m1", date: "2025-09-20", comment: "Strong technical foundation. Communication during reviews is improving steadily.", scores: { Communication: 3, Leadership: 3, "Technical Writing": 3, "UX Empathy": 2, "Problem Solving": 4, Teamwork: 3 } },
  { id: "v2", studentId: "s1", mentorId: "m1", date: "2025-11-15", comment: "Report quality has improved noticeably. Encourage more user-facing work.", scores: { Communication: 4, Leadership: 4, "Technical Writing": 4, "UX Empathy": 2, "Problem Solving": 4, Teamwork: 4 } },
  { id: "v3", studentId: "s1", mentorId: "m2", date: "2026-02-25", comment: "UX empathy remains the main growth area. Recommend joining a user-research project next term.", scores: { Communication: 4, Leadership: 4, "Technical Writing": 5, "UX Empathy": 3, "Problem Solving": 5, Teamwork: 4 } },

  { id: "v4", studentId: "s2", mentorId: "m2", date: "2025-09-05", comment: "Genuine user-centred mindset; defers too often in group decisions.", scores: { Communication: 3, Leadership: 2, "Technical Writing": 3, "UX Empathy": 4, "Problem Solving": 3, Teamwork: 4 } },
  { id: "v5", studentId: "s2", mentorId: "m2", date: "2025-11-30", comment: "Workshop facilitation was a clear step up. Continue to push leadership.", scores: { Communication: 4, Leadership: 3, "Technical Writing": 4, "UX Empathy": 5, "Problem Solving": 4, Teamwork: 4 } },
  { id: "v6", studentId: "s2", mentorId: "m1", date: "2026-02-10", comment: "Solid all-rounder. Leadership now adequate; aim for ownership of one full module.", scores: { Communication: 4, Leadership: 4, "Technical Writing": 4, "UX Empathy": 5, "Problem Solving": 4, Teamwork: 5 } },

  { id: "v7", studentId: "s3", mentorId: "m1", date: "2025-10-01", comment: "Exceptional engineering depth. Verbal explanations are dense for non-experts.", scores: { Communication: 2, Leadership: 2, "Technical Writing": 3, "UX Empathy": 3, "Problem Solving": 5, Teamwork: 3 } },
  { id: "v8", studentId: "s3", mentorId: "m1", date: "2025-12-12", comment: "Hackathon results show creativity. Practice clearer hand-off documentation.", scores: { Communication: 3, Leadership: 3, "Technical Writing": 3, "UX Empathy": 3, "Problem Solving": 5, Teamwork: 3 } },
  { id: "v9", studentId: "s3", mentorId: "m2", date: "2026-03-05", comment: "Communication has improved through retrospectives; teamwork now reliable.", scores: { Communication: 3, Leadership: 3, "Technical Writing": 4, "UX Empathy": 3, "Problem Solving": 5, Teamwork: 4 } },
];

export const careerTargets: Record<string, Record<Competency, number>> = {
  "Software Engineer": { Communication: 3, Leadership: 3, "Technical Writing": 4, "UX Empathy": 3, "Problem Solving": 5, Teamwork: 4 },
  "AI Engineer":       { Communication: 3, Leadership: 3, "Technical Writing": 4, "UX Empathy": 2, "Problem Solving": 5, Teamwork: 3 },
  "UX Engineer":       { Communication: 4, Leadership: 3, "Technical Writing": 3, "UX Empathy": 5, "Problem Solving": 4, Teamwork: 4 },
  "Tech Lead":         { Communication: 5, Leadership: 5, "Technical Writing": 4, "UX Empathy": 4, "Problem Solving": 4, Teamwork: 5 },
};

export function latestScores(studentId: string): Record<Competency, number> {
  const evals = evaluations.filter((e) => e.studentId === studentId).sort((a, b) => a.date.localeCompare(b.date));
  return evals[evals.length - 1].scores;
}

export function readinessScore(scores: Record<Competency, number>): number {
  const total = COMPETENCIES.reduce((s, c) => s + scores[c], 0);
  return Math.round((total / (COMPETENCIES.length * 5)) * 100);
}

export function strengthsWeaknesses(scores: Record<Competency, number>) {
  const sorted = [...COMPETENCIES].sort((a, b) => scores[b] - scores[a]);
  return { strengths: sorted.slice(0, 2), weaknesses: sorted.slice(-2).reverse() };
}

export function tier(score: number): "weak" | "developing" | "strong" {
  if (score <= 2) return "weak";
  if (score <= 3) return "developing";
  return "strong";
}
