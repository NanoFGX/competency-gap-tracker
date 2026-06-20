import { useEffect, type ReactNode } from "react";
import { CheckCircle2, XCircle, AlertTriangle, X } from "lucide-react";

// ── Score legend ─────────────────────────────────────────────────────────────
// Heuristics: Recognition rather than recall (#6), Match with real world (#2)
const SCALE = [
  { range: "1–2", label: "Beginner" },
  { range: "3–4", label: "Early stage" },
  { range: "5–6", label: "Developing" },
  { range: "7–8", label: "Proficient" },
  { range: "9–10", label: "Expert" },
];

export function ScoreLegend() {
  return (
    <div
      className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-muted-foreground select-none"
      aria-label="Score scale"
    >
      <span className="font-medium uppercase tracking-wider">Scale:</span>
      {SCALE.map(({ range, label }) => (
        <span key={range} className="flex items-center gap-1">
          <span className="font-mono font-semibold text-foreground/60">{range}</span>
          <span>{label}</span>
        </span>
      ))}
    </div>
  );
}

// ── Info tooltip ──────────────────────────────────────────────────────────────
// Heuristics: Recognition rather than recall (#6), Help & documentation (#10)
export function InfoIcon({ tip }: { tip: string }) {
  return (
    <span className="group relative inline-flex shrink-0 align-middle">
      <span
        aria-label={tip}
        title={tip}
        className="inline-flex h-3.5 w-3.5 cursor-help items-center justify-center rounded-full border border-muted-foreground/40 text-[9px] font-bold italic text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary select-none"
      >
        i
      </span>
      {/* CSS tooltip — appears to the right of the icon */}
      <span className="pointer-events-none absolute left-full ml-2 top-1/2 -translate-y-1/2 z-50 hidden group-hover:block min-w-[180px] max-w-[260px]">
        <span className="block rounded-lg bg-gray-900 px-3 py-2 text-[11px] leading-snug text-white shadow-xl">
          {tip}
        </span>
      </span>
    </span>
  );
}

// ── Dismissible notification banner ──────────────────────────────────────────
// Heuristics: Visibility of system status (#1), Recover from errors (#9)
type BannerType = "success" | "error" | "warning";

const BANNER_TOKEN: Record<BannerType, string> = {
  success: "--success",
  error: "--destructive",
  warning: "--warning",
};

const BANNER_ICONS: Record<BannerType, React.ComponentType<{ className?: string }>> = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertTriangle,
};

export function Banner({
  type,
  message,
  onDismiss,
}: {
  type: BannerType;
  message: ReactNode;
  onDismiss?: () => void;
}) {
  const Icon = BANNER_ICONS[type];
  const v = BANNER_TOKEN[type];
  return (
    <div
      role="alert"
      aria-live="polite"
      className="flex items-start gap-3 rounded-lg border px-4 py-3 mb-4"
      style={{
        borderColor: `color-mix(in oklch, var(${v}) 32%, transparent)`,
        background: `color-mix(in oklch, var(${v}) 11%, var(--card))`,
        color: `color-mix(in oklch, var(${v}) 70%, var(--foreground))`,
      }}
    >
      <Icon className="h-4 w-4 shrink-0 mt-0.5" aria-hidden="true" />
      <span className="text-sm flex-1 leading-snug">{message}</span>
      {onDismiss && (
        <button
          onClick={onDismiss}
          aria-label="Dismiss notification"
          className="opacity-60 hover:opacity-100 transition-opacity shrink-0"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

// ── Field error message ────────────────────────────────────────────────────────
// Heuristics: Help users recover from errors (#9), Error prevention (#5)
export function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="flex items-center gap-1 text-xs text-destructive mt-1">
      <XCircle className="h-3 w-3 shrink-0" />
      {message}
    </p>
  );
}

// ── Confirmation dialog ────────────────────────────────────────────────────────
// Heuristics: Error prevention (#5), User control and freedom (#3)
export function ConfirmDialog({
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  destructive = false,
  onConfirm,
  onCancel,
}: {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onCancel]);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.5)" }}
    >
      <div className="absolute inset-0" onClick={onCancel} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        className="relative z-10 bg-card rounded-xl border border-border shadow-2xl w-full max-w-sm p-6"
      >
        <h2 id="confirm-dialog-title" className="text-base font-semibold">{title}</h2>
        {description && (
          <p className="text-sm text-muted-foreground leading-relaxed mt-2">{description}</p>
        )}
        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={onCancel}
            className="rounded-md border border-border px-4 py-2 text-sm hover:bg-accent transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              destructive
                ? "bg-destructive text-white hover:opacity-90"
                : "bg-primary text-primary-foreground hover:opacity-90"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
