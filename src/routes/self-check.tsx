import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, ArrowLeft, Lock, Check, Compass } from "lucide-react";
import { useStudent } from "@/lib/student-context";
import { COMPETENCIES, latestScores, type Competency } from "@/lib/mock-data";
import { Card, CardHeader, PageHeader } from "@/components/page-header";
import { Pill } from "@/components/badges";
import { ScoreLegend } from "@/components/ui";

export const Route = createFileRoute("/self-check")({
  head: () => ({ meta: [{ title: "Self-check — Competency Tracker" }] }),
  component: SelfCheck,
});

const SCENARIO = {
  prompt: "A teammate keeps missing deadlines and the project is at risk. What do you do first?",
  options: [
    "Report them to the lecturer immediately.",
    "Quietly redo their work myself before the deadline.",
    "Have a 1:1 to understand the blocker, then re-plan the split.",
  ],
  best: 2,
  expected:
    "Strong choice surfaces the blocker early and shares ownership — and mentors also expect you to document the new plan.",
};

function SelfCheck() {
  const { student } = useStudent();
  const mentor = latestScores(student.id);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [answer, setAnswer] = useState<number | null>(2);
  const [selfRating, setSelfRating] = useState<Record<Competency, number>>(() =>
    COMPETENCIES.reduce((a, c) => ({ ...a, [c]: 5 }), {} as Record<Competency, number>),
  );

  return (
    <>
      <PageHeader
        eyebrow="Student"
        icon={<Compass className="h-5 w-5" />}
        title="Self-check"
        description="Calibrate how you see yourself against how mentors have scored you. Private to you — no scores are published."
        actions={
          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <Lock className="h-3.5 w-3.5" /> Private
          </span>
        }
      />

      <div className="mb-5 flex items-center gap-2 text-xs font-medium text-muted-foreground">
        {[1, 2, 3].map((n) => (
          <div key={n} className="flex items-center gap-2">
            <span
              className={`grid h-6 w-6 place-items-center rounded-full text-[11px] ${step >= n ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
            >
              {n}
            </span>
            {n < 3 && <span className={`h-px w-8 ${step > n ? "bg-primary" : "bg-border"}`} />}
          </div>
        ))}
        <span className="ml-2">
          {step === 1 ? "Scenario" : step === 2 ? "Rate yourself" : "Your blind spots"}
        </span>
      </div>

      {step === 1 && (
        <Card className="max-w-2xl cgt-rise">
          <CardHeader
            title="Scenario"
            description="Answer honestly — there is an expert-preferred response."
          />
          <div className="p-5">
            <p className="font-medium">{SCENARIO.prompt}</p>
            <div className="mt-4 space-y-2">
              {SCENARIO.options.map((o, i) => (
                <label
                  key={i}
                  className={`flex cursor-pointer items-center gap-3 rounded-md border px-3 py-2.5 text-sm transition-colors ${answer === i ? "border-primary bg-accent/50" : "border-border hover:bg-accent/40"}`}
                >
                  <input
                    type="radio"
                    name="ans"
                    checked={answer === i}
                    onChange={() => setAnswer(i)}
                    className="accent-[color:var(--primary)]"
                  />
                  {o}
                </label>
              ))}
            </div>
            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setStep(2)}
                className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                Continue <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </Card>
      )}

      {step === 2 && (
        <Card className="max-w-2xl cgt-rise">
          <CardHeader
            title="Rate yourself 1–10"
            description="Where do you think you stand on each competency right now?"
          />
          <div className="px-5 py-2.5 border-b border-border/50 bg-muted/20">
            <ScoreLegend />
          </div>
          <div className="p-5 space-y-4">
            {COMPETENCIES.map((c) => (
              <div key={c}>
                <div className="flex items-center justify-between text-sm">
                  <span>{c}</span>
                  <span className="font-mono text-xs text-muted-foreground">
                    {selfRating[c]}/10
                  </span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={10}
                  step={1}
                  value={selfRating[c]}
                  onChange={(e) => setSelfRating((s) => ({ ...s, [c]: Number(e.target.value) }))}
                  className="mt-1.5 w-full accent-[color:var(--primary)]"
                />
              </div>
            ))}
            <div className="flex justify-between pt-2">
              <button
                onClick={() => setStep(1)}
                className="inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent"
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
              <button
                onClick={() => setStep(3)}
                className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                See my blind spots <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </Card>
      )}

      {step === 3 && (
        <div className="space-y-4 max-w-2xl">
          <Card className="cgt-rise">
            <CardHeader title="Expected response" description="How mentors read the scenario" />
            <div className="p-5 text-sm">
              <Pill tone={answer === SCENARIO.best ? "strong" : "developing"}>
                {answer === SCENARIO.best ? (
                  <>
                    <Check className="mr-1 inline h-3 w-3" />
                    Well calibrated
                  </>
                ) : (
                  "Worth reflecting on"
                )}
              </Pill>
              <p className="mt-3 text-muted-foreground leading-relaxed">{SCENARIO.expected}</p>
            </div>
          </Card>

          <Card className="cgt-rise">
            <CardHeader
              title="Self vs mentor"
              description="The gap between your self-rating and validated mentor scores — private to you."
            />
            <div className="p-5 space-y-3">
              {COMPETENCIES.map((c) => {
                const self = selfRating[c];
                const m = mentor[c];
                const delta = self - m;
                const tag =
                  delta >= 3 ? "over-confident" : delta <= -3 ? "under-rated" : "calibrated";
                const tone = tag === "calibrated" ? "strong" : "developing";
                return (
                  <div key={c} className="flex items-center gap-3 text-sm">
                    <span className="w-36 shrink-0 text-muted-foreground">{c}</span>
                    <div className="relative flex-1 h-3.5 rounded bg-muted border border-border">
                      <div
                        className="absolute inset-y-0 left-0 rounded bg-primary/70"
                        style={{ width: `${(self / 10) * 100}%` }}
                      />
                      <div
                        className="absolute -top-1 -bottom-1 w-0.5 bg-foreground"
                        style={{ left: `${(m / 10) * 100}%` }}
                        title={`mentor ${m}/10`}
                      />
                    </div>
                    <span className="w-24 text-right">
                      <Pill tone={tone as "strong" | "developing"}>{tag}</Pill>
                    </span>
                  </div>
                );
              })}
              <p className="pt-1 text-xs text-muted-foreground">
                Bar = your self-rating · marker = mentor-validated score · scale 1–10.
              </p>
              <div className="flex justify-end">
                <button
                  onClick={() => setStep(1)}
                  className="rounded-md border border-border px-3 py-2 text-sm hover:bg-accent"
                >
                  Try another scenario
                </button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </>
  );
}
