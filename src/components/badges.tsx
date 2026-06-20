import type { CSSProperties, ReactNode } from "react";

/**
 * Tone-based pill. Colours are derived from semantic design-system tokens via
 * color-mix, so a single definition stays WCAG-legible in BOTH light and dark
 * mode (text mixes toward --foreground, which flips per theme).
 */
export type Tone = "strong" | "developing" | "weak" | "warning" | "info" | "neutral";

const TOKEN: Record<Tone, string | null> = {
  strong: "--success",
  weak: "--destructive",
  warning: "--warning",
  info: "--primary",
  developing: null, // neutral / muted
  neutral: null,
};

function toneStyle(tone: Tone): CSSProperties {
  const v = TOKEN[tone];
  if (!v) {
    return {
      background: "color-mix(in oklch, var(--muted-foreground) 12%, transparent)",
      color: "var(--muted-foreground)",
      boxShadow: "inset 0 0 0 1px color-mix(in oklch, var(--muted-foreground) 18%, transparent)",
    };
  }
  return {
    background: `color-mix(in oklch, var(${v}) 15%, transparent)`,
    color: `color-mix(in oklch, var(${v}) 72%, var(--foreground))`,
    boxShadow: `inset 0 0 0 1px color-mix(in oklch, var(${v}) 28%, transparent)`,
  };
}

export function Pill({ children, tone = "developing" }: { children: ReactNode; tone?: Tone }) {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium leading-5"
      style={toneStyle(tone)}
    >
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: "Pending" | "Approved" | "Rejected" }) {
  const tone: Tone = status === "Approved" ? "strong" : status === "Rejected" ? "weak" : "warning";
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium leading-5"
      style={toneStyle(tone)}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ background: "currentColor", opacity: 0.85 }}
        aria-hidden="true"
      />
      {status}
    </span>
  );
}
