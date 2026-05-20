import type { ReactNode } from "react";

export function Pill({ children, tone = "developing" }: { children: ReactNode; tone?: "strong" | "developing" | "weak" }) {
  const cls =
    tone === "strong"
      ? "bg-[color:oklch(0.95_0.04_155)] text-[color:oklch(0.35_0.08_155)]"
      : tone === "weak"
      ? "bg-[color:oklch(0.96_0.04_25)] text-[color:oklch(0.45_0.15_25)]"
      : "bg-muted text-muted-foreground";
  return <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${cls}`}>{children}</span>;
}

export function StatusBadge({ status }: { status: "Pending" | "Approved" | "Rejected" }) {
  const tone = status === "Approved" ? "strong" : status === "Rejected" ? "weak" : "developing";
  return <Pill tone={tone as "strong" | "developing" | "weak"}>{status}</Pill>;
}
