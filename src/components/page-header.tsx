import type { ReactNode } from "react";

export function PageHeader({
  title,
  description,
  actions,
  icon,
  eyebrow,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  icon?: ReactNode;
  eyebrow?: string;
}) {
  return (
    <div className="mb-8 flex items-start justify-between gap-4 cgt-fade">
      <div className="flex items-start gap-3.5 min-w-0">
        {icon && (
          <div className="mt-0.5 grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15">
            {icon}
          </div>
        )}
        <div className="min-w-0">
          {eyebrow && (
            <div className="mb-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-primary/80">
              {eyebrow}
            </div>
          )}
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-[2rem] sm:leading-tight">
            {title}
          </h1>
          {description ? (
            <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              {description}
            </p>
          ) : null}
        </div>
      </div>
      {actions ? <div className="shrink-0">{actions}</div> : null}
    </div>
  );
}

export function Card({
  children,
  className = "",
  interactive = false,
}: {
  children: ReactNode;
  className?: string;
  interactive?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border border-border bg-card shadow-[var(--elevation-1)] ${
        interactive
          ? "transition-[box-shadow,border-color,transform] hover:-translate-y-0.5 hover:shadow-[var(--elevation-2)] hover:border-border/80"
          : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
      <div>
        <h3 className="text-sm font-semibold tracking-tight">{title}</h3>
        {description ? <p className="mt-0.5 text-xs text-muted-foreground">{description}</p> : null}
      </div>
      {actions ? <div className="shrink-0">{actions}</div> : null}
    </div>
  );
}
