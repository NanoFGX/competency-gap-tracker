import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/lib/theme";

/**
 * Accessible light/dark switch. Two states, instant feedback, icon + label.
 * Heuristics: Visibility of system status (#1), User control & freedom (#3).
 */
export function ThemeToggle({ variant = "full" }: { variant?: "full" | "icon" }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  if (variant === "icon") {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
        title={isDark ? "Switch to light mode" : "Switch to dark mode"}
        className="grid h-9 w-9 place-items-center rounded-lg border border-border bg-card text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
      >
        {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      role="switch"
      aria-checked={isDark}
      aria-label="Toggle dark mode"
      className="group flex w-full items-center gap-2.5 rounded-md px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
    >
      <span className="relative inline-flex h-4.5 w-8 shrink-0 items-center rounded-full bg-muted transition-colors group-hover:bg-border"
            style={{ height: "1.05rem" }}>
        <span
          className="inline-flex h-3.5 w-3.5 translate-x-0.5 items-center justify-center rounded-full bg-card shadow-sm transition-transform"
          style={{ transform: isDark ? "translateX(0.875rem)" : "translateX(0.125rem)" }}
        >
          {isDark ? <Moon className="h-2.5 w-2.5 text-primary" /> : <Sun className="h-2.5 w-2.5 text-warning" />}
        </span>
      </span>
      {isDark ? "Dark mode" : "Light mode"}
    </button>
  );
}
