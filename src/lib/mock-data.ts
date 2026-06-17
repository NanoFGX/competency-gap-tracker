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

export interface MentorFeedback {
  mentorId: string;
  date: string;
  comment: string;
  scores: Record<Competency, number>;
}

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
  mentorFeedback?: MentorFeedback;
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
  university: string;
  graduationYear: number;
  location: string;
  gpa: string;
  careerInterest: string;
  bio: string;
  linkedIn: string;
}

export interface Mentor {
  id: string;
  name: string;
  role: string;
}

export interface Recruiter {
  id: string;
  name: string;
  company: string;
  title: string;
  email: string;
  location: string;
  bio: string;
  specializations: string[];
  yearsExperience: number;
  linkedIn: string;
}

export const recruiters: Recruiter[] = [
  {
    id: "r1", name: "Samuel Marc", company: "Zurich Services", title: "Senior Technical Recruiter",
    email: "s.marc@zurichservices.com", location: "Zurich, Switzerland",
    bio: "Senior technical recruiter with 9 years of experience placing software engineers and engineering leads across fintech and enterprise SaaS. Specialises in evaluating full-stack capability and leadership potential in early-career candidates.",
    specializations: ["Software Engineering", "Tech Leadership", "Fintech"],
    yearsExperience: 9, linkedIn: "linkedin.com/in/samuel-marc",
  },
  {
    id: "r2", name: "Sarah Mitchell", company: "Axiom Digital", title: "Tech Talent Lead",
    email: "s.mitchell@axiomdigital.io", location: "London, UK",
    bio: "Talent lead focused on product engineering and UX-forward roles. Passionate about identifying candidates who bridge the gap between technical rigour and design empathy. Previously worked in product management before moving into talent acquisition.",
    specializations: ["UX Engineering", "Product Engineering", "Design Systems"],
    yearsExperience: 6, linkedIn: "linkedin.com/in/sarah-mitchell-talent",
  },
  {
    id: "r3", name: "James Okafor", company: "NovaTech Solutions", title: "Engineering Recruiter",
    email: "j.okafor@novatech.co", location: "Lagos, Nigeria",
    bio: "Engineering recruiter focused on AI/ML and backend systems talent across Africa and Europe. Works closely with hiring managers to define competency frameworks and assess candidates for fast-growing engineering teams.",
    specializations: ["AI & ML Engineering", "Backend Systems", "Data Engineering"],
    yearsExperience: 4, linkedIn: "linkedin.com/in/james-okafor",
  },
];

export const students: Student[] = [
  {
    id: "s1", name: "Aisha Rahman", email: "aisha.r@university.edu",
    program: "BSc Computer Science, Final Year",
    university: "University of Manchester", graduationYear: 2025,
    location: "Manchester, UK", gpa: "3.8 / 4.0",
    careerInterest: "Full-Stack Software Engineering",
    bio: "Final-year computer science student with a passion for building scalable web applications and improving user experience through clean, maintainable code. Active contributor to open-source projects and a frequent hackathon participant. Seeking a graduate software engineer role at a product-driven company.",
    linkedIn: "linkedin.com/in/aisha-rahman-cs",
  },
  {
    id: "s2", name: "Marcus Chen", email: "marcus.c@university.edu",
    program: "BSc Computer Science, Final Year",
    university: "University of Edinburgh", graduationYear: 2025,
    location: "Edinburgh, UK", gpa: "3.6 / 4.0",
    careerInterest: "AI & Machine Learning Engineering",
    bio: "Aspiring AI engineer with strong interest in natural language processing and generative models. Has completed two industry internships in data science and is currently writing a dissertation on transformer fine-tuning for domain-specific summarisation. Enjoys teaching and mentors junior students in the CS society.",
    linkedIn: "linkedin.com/in/marcus-chen-ai",
  },
  {
    id: "s3", name: "Priya Sharma", email: "priya.s@university.edu",
    program: "BSc Computer Science, Final Year",
    university: "Imperial College London", graduationYear: 2025,
    location: "London, UK", gpa: "3.9 / 4.0",
    careerInterest: "UX Engineering & Interaction Design",
    bio: "UX-focused engineer who combines strong front-end development skills with deep empathy for user needs. Has led the design and engineering of the university's accessibility tool, used by over 2,000 students. Looking to join a team where engineering and design collaborate closely to ship high-quality products.",
    linkedIn: "linkedin.com/in/priya-sharma-ux",
  },
];

export const mentors: Mentor[] = [
  { id: "m1", name: "Dr. Eleanor Wright", role: "Senior Lecturer, Software Engineering" },
  { id: "m2", name: "Prof. David Okafor", role: "Lecturer, Human-Computer Interaction" },
];

export const evidence: Evidence[] = [
  {
    id: "e1", studentId: "s1", title: "Inventory Management System", type: "GitHub Project",
    description: "A full-stack inventory management application built with Node.js, Express, and PostgreSQL, featuring role-based access control for administrators, warehouse staff, and auditors. The system includes real-time stock tracking, automated low-stock alerts via email, a RESTful API with JWT authentication, and a responsive React dashboard with Chart.js visualisations. Deployment was automated through a GitHub Actions CI/CD pipeline to a DigitalOcean droplet. The codebase spans approximately 4,200 lines across 38 modules, with 87% unit test coverage using Jest and Supertest.",
    link: "github.com/aisha/inventory", competencies: ["Problem Solving", "Technical Writing"], status: "Approved", submittedAt: "2025-09-12",
    mentorFeedback: {
      mentorId: "m1", date: "2025-09-20",
      comment: "Strong full-stack implementation with well-structured CI/CD automation. Problem Solving is clearly evidenced through the role-based access design and the 87% test coverage — that level of discipline is uncommon at this stage. Technical Writing in the README and API documentation is at a Proficient level. Good technical instincts showing here.",
      scores: { Communication: 4, Leadership: 4, "Technical Writing": 4, "UX Empathy": 4, "Problem Solving": 6, Teamwork: 4 },
    },
  },
  {
    id: "e2", studentId: "s1", title: "Final Year Research Report", type: "Report",
    description: "A 12,000-word academic report investigating distributed caching strategies for high-traffic web applications, comparing Redis, Memcached, and Apache Ignite under realistic load scenarios. The study includes a controlled benchmarking methodology using Locust to simulate 10,000 concurrent users, statistical analysis of latency percentiles (p50, p95, p99), and a cost-benefit analysis of each approach for small-to-medium enterprise deployments. All experiments were reproduced across three separate environments to ensure result validity. The report received a distinction grade and has been nominated for the departmental best-dissertation award.",
    competencies: ["Technical Writing", "Problem Solving"], status: "Approved", submittedAt: "2025-10-04",
    mentorFeedback: {
      mentorId: "m1", date: "2025-11-15",
      comment: "Report quality has improved significantly since the previous submission. The benchmarking methodology is rigorous — three reproduced environments is the right approach. The cost-benefit framing is particularly clear and accessible. Technical Writing is advancing toward Advanced level. Encourage more user-facing work alongside this depth to build UX understanding.",
      scores: { Communication: 6, Leadership: 4, "Technical Writing": 6, "UX Empathy": 4, "Problem Solving": 6, Teamwork: 6 },
    },
  },
  {
    id: "e3", studentId: "s1", title: "Hack the Coast 2025", type: "Hackathon",
    description: "A 48-hour regional hackathon hosted in partnership with three local technology companies, in which Aisha led a four-person interdisciplinary team comprising two Computer Science students, one Design student, and one Business student. The team built SafeRoute — a real-time pedestrian safety application that aggregates council accident data, weather feeds, and crowdsourced incident reports to recommend safer walking routes. Aisha designed the system architecture, coordinated task allocation across all four members, facilitated two structured retrospective sessions, and delivered the final pitch to a panel of eight industry judges. The team placed second out of thirty-one entries and was awarded a £500 prize.",
    competencies: ["Leadership", "Teamwork", "Communication"], status: "Approved", submittedAt: "2025-11-02",
    mentorFeedback: {
      mentorId: "m2", date: "2026-01-10",
      comment: "Leading a cross-disciplinary team of four in a 48-hour competition and placing second from 31 entries is credible Leadership and Teamwork evidence. The two structured retrospective sessions show facilitation maturity well beyond a typical undergraduate project. Communication during the final pitch was composed and confident — a clear step up from earlier group settings.",
      scores: { Communication: 6, Leadership: 6, "Technical Writing": 6, "UX Empathy": 4, "Problem Solving": 6, Teamwork: 6 },
    },
  },
  {
    id: "e4", studentId: "s1", title: "Capstone Pitch Deck", type: "Presentation",
    description: "A fifteen-minute formal presentation delivered to a faculty panel of four academics and six invited industry guests from local software and consulting firms. The pitch covered the technical architecture of Aisha's capstone project — an AI-assisted academic advising tool — including a live demonstration of the natural language query interface, a discussion of the ethical considerations around algorithmic recommendation in education, and a market sizing analysis. Aisha handled all questions from the panel independently, including a technical deep-dive on the model fine-tuning pipeline and a challenge regarding data privacy compliance under UK GDPR.",
    competencies: ["Communication", "UX Empathy"], status: "Pending", submittedAt: "2026-02-18",
  },
  {
    id: "e5", studentId: "s2", title: "Patient Triage Mobile App", type: "GitHub Project",
    description: "A cross-platform mobile application built with React Native and Expo, developed in collaboration with NHS community health volunteers to digitise the initial patient triage process at walk-in centres. Marcus conducted six co-design sessions with five nurses and three receptionists across two clinic sites to identify workflow pain points, translating their feedback into iterative wireframes before writing a single line of code. The final application uses a branching symptom-assessment algorithm validated by a registered nurse, integrates with a mock NHS FHIR API for patient look-up, and supports offline-first data entry with background sync. Accessibility was tested with two visually impaired users using TalkBack and VoiceOver.",
    link: "github.com/marcus/triage", competencies: ["UX Empathy", "Problem Solving", "Technical Writing"], status: "Approved", submittedAt: "2025-08-22",
    mentorFeedback: {
      mentorId: "m2", date: "2025-09-05",
      comment: "Six co-design sessions conducted before writing any code is exactly the right approach for healthcare UX. The branching algorithm validated by a registered nurse demonstrates rigorous UX Empathy and Problem Solving working together well. Accessibility testing with real visually impaired users using TalkBack and VoiceOver elevates this submission significantly above most peer work. Genuine user-centred mindset on display throughout.",
      scores: { Communication: 4, Leadership: 4, "Technical Writing": 4, "UX Empathy": 6, "Problem Solving": 4, Teamwork: 6 },
    },
  },
  {
    id: "e6", studentId: "s2", title: "Usability Study Report", type: "Report",
    description: "A 9,500-word mixed-methods usability evaluation of three NHS patient-facing digital services, combining eight semi-structured think-aloud interviews with a heuristic evaluation conducted against Nielsen's ten usability heuristics. Participants were recruited through a local digital inclusion charity and represented a range of digital literacy levels, including two participants who had never used a smartphone before. Marcus coded all interview transcripts using thematic analysis in NVivo, producing an affinity diagram with 47 discrete usability issues grouped into eight categories. The report includes prioritised redesign recommendations with annotated wireframes and an estimated accessibility impact score for each finding.",
    competencies: ["UX Empathy", "Technical Writing"], status: "Approved", submittedAt: "2025-10-19",
    mentorFeedback: {
      mentorId: "m2", date: "2025-11-30",
      comment: "The mixed-methods approach combining think-aloud protocols with heuristic evaluation demonstrates real methodological maturity. Coding 47 usability issues across 8 categories in NVivo is serious analytical Technical Writing. The prioritised redesign recommendations with annotated wireframes are directly usable by a product team — that practical framing is a strength. Workshop facilitation is showing a clear step up; continue pushing leadership and technical problem solving.",
      scores: { Communication: 4, Leadership: 4, "Technical Writing": 6, "UX Empathy": 8, "Problem Solving": 6, Teamwork: 6 },
    },
  },
  {
    id: "e7", studentId: "s2", title: "Departmental Seminar Talk", type: "Presentation",
    description: "A thirty-minute invited talk delivered to an audience of approximately sixty people comprising second and third year undergraduates, postgraduate students, and five academic staff members at the Department of Computer Science's weekly research seminar series. Marcus presented the findings of his NHS usability study, contextualising the work within broader academic literature on healthcare UX and digital exclusion. The talk included an interactive live polling exercise using Mentimeter, a Q&A session of fifteen minutes, and a summary handout distributed to all attendees. Feedback forms collected after the session gave an average rating of 4.2 out of 5 for clarity and 4.6 out of 5 for engagement.",
    competencies: ["Communication", "UX Empathy"], status: "Pending", submittedAt: "2026-01-14",
  },
  {
    id: "e8", studentId: "s3", title: "ML Fraud Detection Service", type: "GitHub Project",
    description: "A production-ready machine learning microservice for real-time credit card fraud detection, built with Python, FastAPI, and scikit-learn, containerised with Docker and orchestrated via Docker Compose. Priya trained an ensemble model combining a gradient-boosted classifier and an isolation forest on a public Kaggle dataset of 284,000 transactions, achieving an F1-score of 0.923 and a false positive rate of 1.7% on the held-out test set. The API exposes a /predict endpoint that returns a fraud probability score and a SHAP-based explanation of the top contributing features for each decision. Priya documented the entire ML pipeline, including data preprocessing steps, feature engineering rationale, hyperparameter tuning process, and model card, in a structured technical README spanning over 3,000 words.",
    link: "github.com/priya/fraud-ml", competencies: ["Problem Solving", "Technical Writing"], status: "Approved", submittedAt: "2025-09-30",
    mentorFeedback: {
      mentorId: "m1", date: "2025-10-01",
      comment: "Exceptional engineering depth throughout. The ensemble model design and SHAP-based decision explanations demonstrate Problem Solving at an advanced level — this kind of explainability focus is rare in undergraduate work. The 3,000-word technical README covering the full ML pipeline from preprocessing to model card is Technical Writing at a professional engineering standard. Verbal explanations are still dense for non-experts, but the written documentation is exemplary.",
      scores: { Communication: 4, Leadership: 4, "Technical Writing": 4, "UX Empathy": 4, "Problem Solving": 8, Teamwork: 4 },
    },
  },
  {
    id: "e9", studentId: "s3", title: "OpenAI Hackathon", type: "Hackathon",
    description: "A solo entry to the OpenAI University Hackathon in which Priya built AccessReader — an AI-powered screen reader enhancement that uses GPT-4 Vision to generate rich, context-aware descriptions of images, charts, and diagrams embedded in academic PDFs, specifically designed to improve the experience of blind and low-vision university students. The tool integrates with the Whisper API for voice command input, allowing users to ask follow-up questions about a specific figure using natural speech. Priya completed the project independently within 36 hours, including a working prototype, a three-minute video demo, and a written technical report. AccessReader was selected as one of five finalists from 140 submissions and presented to a live audience of 200 attendees.",
    competencies: ["Problem Solving", "UX Empathy"], status: "Approved", submittedAt: "2025-12-05",
    mentorFeedback: {
      mentorId: "m1", date: "2025-12-12",
      comment: "Solo finalist from 140 submissions in a national hackathon — the Problem Solving here is outstanding. Building a GPT-4 Vision and Whisper integration for accessibility in 36 hours demonstrates both technical depth and genuine UX Empathy for the target users. The voice command interaction shows real consideration of how blind and low-vision users actually navigate. Hackathon results show creativity and strong Problem Solving; practice clearer hand-off documentation and team inclusion for future collaborative work.",
      scores: { Communication: 4, Leadership: 4, "Technical Writing": 6, "UX Empathy": 4, "Problem Solving": 10, Teamwork: 4 },
    },
  },
  {
    id: "e10", studentId: "s3", title: "Team Retrospective Report", type: "Report",
    description: "A structured retrospective report covering six two-week sprints conducted over a fourteen-week capstone project, written collaboratively by Priya and her team of five students using a shared Confluence workspace. The report documents the evolution of the team's working practices across the project lifecycle, including the adoption of a daily stand-up format in Sprint 3, the introduction of a task estimation framework using story points in Sprint 4, and the implementation of a peer code review protocol in Sprint 5. Priya led three of the six retrospective sessions using the Start-Stop-Continue format, synthesised the action items, and tracked their completion in a shared Jira board. The report includes quantitative sprint velocity data, a team health score trend graph, and individual reflection sections from each member.",
    competencies: ["Teamwork", "Leadership", "Technical Writing"], status: "Pending", submittedAt: "2026-03-02",
  },
];

// Scores on a 1–10 scale. Students sit roughly 75–85% of the way to target, creating visible but closeable gaps.
export const evaluations: Evaluation[] = [
  // Aisha — growing steadily; gaps remain in UX Empathy and Problem Solving
  { id: "v1", studentId: "s1", mentorId: "m1", date: "2025-09-20", comment: "Good technical instincts early on. Communication is developing but still cautious in group settings.", scores: { Communication: 4, Leadership: 4, "Technical Writing": 4, "UX Empathy": 4, "Problem Solving": 6, Teamwork: 4 } },
  { id: "v2", studentId: "s1", mentorId: "m1", date: "2025-11-15", comment: "Report quality has improved. Encourage more user-facing work to build UX understanding.", scores: { Communication: 6, Leadership: 4, "Technical Writing": 6, "UX Empathy": 4, "Problem Solving": 6, Teamwork: 6 } },
  { id: "v3", studentId: "s1", mentorId: "m2", date: "2026-02-25", comment: "Solid progress in writing and communication. UX empathy and top-tier problem solving still need targeted work.", scores: { Communication: 8, Leadership: 6, "Technical Writing": 8, "UX Empathy": 4, "Problem Solving": 8, Teamwork: 6 } },

  // Marcus — strong UX; leadership and problem solving are the remaining gaps
  { id: "v4", studentId: "s2", mentorId: "m2", date: "2025-09-05", comment: "Genuine user-centred mindset. Defers too often in group decisions; needs to own more direction.", scores: { Communication: 4, Leadership: 4, "Technical Writing": 4, "UX Empathy": 6, "Problem Solving": 4, Teamwork: 6 } },
  { id: "v5", studentId: "s2", mentorId: "m2", date: "2025-11-30", comment: "Workshop facilitation was a clear step up. Continue to push leadership and deepen technical problem solving.", scores: { Communication: 4, Leadership: 4, "Technical Writing": 6, "UX Empathy": 8, "Problem Solving": 6, Teamwork: 6 } },
  { id: "v6", studentId: "s2", mentorId: "m1", date: "2026-02-10", comment: "Solid communicator and team player. Leadership adequate but aim for module ownership; PS still developing.", scores: { Communication: 6, Leadership: 6, "Technical Writing": 6, "UX Empathy": 8, "Problem Solving": 6, Teamwork: 8 } },

  // Priya — exceptional PS; communication, leadership, and UX empathy lag behind
  { id: "v7", studentId: "s3", mentorId: "m1", date: "2025-10-01", comment: "Exceptional engineering depth. Verbal explanations dense for non-experts; teamwork shows room to grow.", scores: { Communication: 4, Leadership: 4, "Technical Writing": 4, "UX Empathy": 4, "Problem Solving": 8, Teamwork: 4 } },
  { id: "v8", studentId: "s3", mentorId: "m1", date: "2025-12-12", comment: "Hackathon results show creativity and strong PS. Practice clearer hand-off documentation and team inclusion.", scores: { Communication: 4, Leadership: 4, "Technical Writing": 6, "UX Empathy": 4, "Problem Solving": 10, Teamwork: 4 } },
  { id: "v9", studentId: "s3", mentorId: "m2", date: "2026-03-05", comment: "Communication improved through retrospectives; teamwork now more reliable. Comm and leadership still below target.", scores: { Communication: 4, Leadership: 6, "Technical Writing": 6, "UX Empathy": 4, "Problem Solving": 10, Teamwork: 6 } },

  // Pre-semester baselines (Jul 2025) + mid-year checkpoints — creates ~2-month-gap timeline data
  { id: "v10", studentId: "s1", mentorId: "m1", date: "2025-07-10", comment: "Initial pre-year assessment. Good technical curiosity; collaborative and communication skills need structured development.", scores: { Communication: 2, Leadership: 2, "Technical Writing": 2, "UX Empathy": 2, "Problem Solving": 4, Teamwork: 2 } },
  { id: "v11", studentId: "s1", mentorId: "m2", date: "2026-01-10", comment: "Mid-year check. Writing and communication showing clear improvement; UX empathy remains the priority gap.", scores: { Communication: 6, Leadership: 6, "Technical Writing": 6, "UX Empathy": 4, "Problem Solving": 6, Teamwork: 6 } },
  { id: "v12", studentId: "s2", mentorId: "m2", date: "2025-07-12", comment: "Pre-year baseline. User empathy instincts are natural; leadership and technical writing need structured development.", scores: { Communication: 2, Leadership: 2, "Technical Writing": 2, "UX Empathy": 4, "Problem Solving": 2, Teamwork: 4 } },
  { id: "v13", studentId: "s2", mentorId: "m1", date: "2025-12-20", comment: "Strong uplift since NHS project. Leadership growth encouraging; push for bolder ownership in group decisions.", scores: { Communication: 4, Leadership: 4, "Technical Writing": 6, "UX Empathy": 8, "Problem Solving": 6, Teamwork: 6 } },
  { id: "v14", studentId: "s3", mentorId: "m1", date: "2025-07-20", comment: "Starting-point assessment. Problem solving is a standout; significant work needed on soft skills across the board.", scores: { Communication: 2, Leadership: 2, "Technical Writing": 2, "UX Empathy": 2, "Problem Solving": 6, Teamwork: 2 } },
  { id: "v15", studentId: "s3", mentorId: "m2", date: "2025-11-15", comment: "Hackathon results demonstrate outstanding problem solving. Team dynamics and communication remain areas to address.", scores: { Communication: 4, Leadership: 4, "Technical Writing": 4, "UX Empathy": 4, "Problem Solving": 10, Teamwork: 4 } },
];

// Targets on the 1–10 scale
export const careerTargets: Record<string, Record<Competency, number>> = {
  "Software Engineer": { Communication: 6, Leadership: 6, "Technical Writing": 8, "UX Empathy": 6, "Problem Solving": 10, Teamwork: 8 },
  "AI Engineer":       { Communication: 6, Leadership: 6, "Technical Writing": 8, "UX Empathy": 4,  "Problem Solving": 10, Teamwork: 6 },
  "UX Engineer":       { Communication: 8, Leadership: 6, "Technical Writing": 6, "UX Empathy": 10, "Problem Solving": 8,  Teamwork: 8 },
  "Tech Lead":         { Communication: 10, Leadership: 10, "Technical Writing": 8, "UX Empathy": 8, "Problem Solving": 8, Teamwork: 10 },
};

export function latestScores(studentId: string): Record<Competency, number> {
  const evals = evaluations.filter((e) => e.studentId === studentId).sort((a, b) => a.date.localeCompare(b.date));
  if (evals.length === 0) {
    return Object.fromEntries(COMPETENCIES.map((c) => [c, 0])) as Record<Competency, number>;
  }
  return evals[evals.length - 1].scores;
}

export function readinessScore(scores: Record<Competency, number>): number {
  const total = COMPETENCIES.reduce((s, c) => s + scores[c], 0);
  return Math.round((total / (COMPETENCIES.length * 10)) * 100);
}

export function strengthsWeaknesses(scores: Record<Competency, number>) {
  const sorted = [...COMPETENCIES].sort((a, b) => scores[b] - scores[a]);
  return { strengths: sorted.slice(0, 2), weaknesses: sorted.slice(-2).reverse() };
}

export function tier(score: number): "weak" | "developing" | "strong" {
  if (score <= 4) return "weak";
  if (score <= 6) return "developing";
  return "strong";
}
