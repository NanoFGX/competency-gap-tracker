import * as React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

/* ───────────────────────────────────────────────────────────────────────────
   BUTTON — the canonical interactive control.
   States: default · hover (brand-darkens) · active (press-scale, global) ·
           focus-visible (ring, global) · disabled · loading.
─────────────────────────────────────────────────────────────────────────── */
export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "destructive" | "success";
export type ButtonSize = "sm" | "md" | "lg" | "icon";

const VARIANT: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-primary-foreground shadow-sm hover:bg-[color:var(--primary-hover)]",
  secondary:
    "bg-secondary text-secondary-foreground hover:bg-accent hover:text-accent-foreground",
  outline:
    "border border-border bg-card text-foreground shadow-sm hover:bg-accent hover:text-accent-foreground",
  ghost:
    "text-muted-foreground hover:bg-accent hover:text-foreground",
  destructive:
    "bg-destructive text-destructive-foreground shadow-sm hover:opacity-90",
  success:
    "bg-success text-success-foreground shadow-sm hover:opacity-90",
};

const SIZE: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-xs gap-1.5",
  md: "h-9 px-4 text-sm gap-2",
  lg: "h-11 px-5 text-sm gap-2",
  icon: "h-9 w-9",
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", loading = false, disabled, children, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-lg font-medium",
        "transition-[background-color,color,box-shadow,opacity,transform] outline-none",
        "disabled:pointer-events-none disabled:opacity-50",
        "[&_svg]:size-4 [&_svg]:shrink-0",
        VARIANT[variant],
        SIZE[size],
        className,
      )}
      {...props}
    >
      {loading && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" aria-hidden="true" />}
      {children}
    </button>
  ),
);
Button.displayName = "Button";

/* ───────────────────────────────────────────────────────────────────────────
   FORM FIELD PRIMITIVES — consistent inputs/selects/textareas with one focus
   treatment everywhere (ring) and an error state.
─────────────────────────────────────────────────────────────────────────── */
const FIELD_BASE =
  "w-full rounded-lg border bg-background text-foreground placeholder:text-muted-foreground/70 " +
  "transition-[box-shadow,border-color] outline-none focus-visible:ring-2 focus-visible:ring-ring " +
  "disabled:opacity-50 disabled:cursor-not-allowed";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, invalid, ...props }, ref) => (
    <input
      ref={ref}
      aria-invalid={invalid || undefined}
      className={cn(
        FIELD_BASE,
        "h-9 px-3 text-sm",
        invalid ? "border-destructive focus-visible:ring-destructive/40" : "border-input",
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = "Input";

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean }>(
  ({ className, invalid, ...props }, ref) => (
    <textarea
      ref={ref}
      aria-invalid={invalid || undefined}
      className={cn(
        FIELD_BASE,
        "px-3 py-2 text-sm resize-none",
        invalid ? "border-destructive focus-visible:ring-destructive/40" : "border-input",
        className,
      )}
      {...props}
    />
  ),
);
Textarea.displayName = "Textarea";

export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(FIELD_BASE, "h-9 px-3 text-sm border-input cursor-pointer", className)}
      {...props}
    >
      {children}
    </select>
  ),
);
Select.displayName = "Select";

export function FieldLabel({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block text-xs font-medium text-muted-foreground">
      {children}
    </label>
  );
}
