import { useTheme } from "@/lib/theme";

/**
 * Theme-aware palette for recharts. Recharts renders SVG with literal colour
 * strings (CSS variables don't resolve in SVG presentation attributes), so we
 * resolve concrete oklch values per theme here — keeping charts perfectly in
 * sync with the design-system tokens in both light and dark mode.
 */
export interface ChartTheme {
  /* one colour per competency, in COMPETENCIES order */
  series: string[];
  primary: string;
  target: string;       // muted "role target" series
  success: string;
  warning: string;
  destructive: string;
  grid: string;
  axis: string;
  tooltip: {
    background: string;
    border: string;
    borderRadius: number;
    fontSize: number;
    color: string;
    boxShadow: string;
  };
}

const LIGHT: ChartTheme = {
  series: [
    "oklch(0.545 0.205 275)", // indigo
    "oklch(0.585 0.205 305)", // violet
    "oklch(0.66 0.13 215)",   // cyan
    "oklch(0.62 0.15 155)",   // emerald
    "oklch(0.76 0.15 70)",    // amber
    "oklch(0.62 0.205 12)",   // rose
  ],
  primary: "oklch(0.515 0.214 275)",
  target: "oklch(0.80 0.04 275)",
  success: "oklch(0.60 0.146 150)",
  warning: "oklch(0.705 0.158 64)",
  destructive: "oklch(0.585 0.221 27)",
  grid: "oklch(0.92 0.005 264)",
  axis: "oklch(0.50 0.021 264)",
  tooltip: {
    background: "oklch(1 0 0)",
    border: "1px solid oklch(0.92 0.005 264)",
    borderRadius: 10,
    fontSize: 12,
    color: "oklch(0.21 0.021 266)",
    boxShadow: "0 8px 24px -8px rgb(15 23 42 / 0.18)",
  },
};

const DARK: ChartTheme = {
  series: [
    "oklch(0.66 0.19 274)",
    "oklch(0.68 0.19 305)",
    "oklch(0.72 0.13 212)",
    "oklch(0.72 0.15 158)",
    "oklch(0.80 0.15 75)",
    "oklch(0.70 0.19 12)",
  ],
  primary: "oklch(0.64 0.176 274)",
  target: "oklch(0.45 0.05 274)",
  success: "oklch(0.715 0.155 156)",
  warning: "oklch(0.81 0.145 78)",
  destructive: "oklch(0.66 0.20 25)",
  grid: "oklch(1 0 0 / 10%)",
  axis: "oklch(0.715 0.022 264)",
  tooltip: {
    background: "oklch(0.214 0.021 266)",
    border: "1px solid oklch(1 0 0 / 12%)",
    borderRadius: 10,
    fontSize: 12,
    color: "oklch(0.96 0.004 264)",
    boxShadow: "0 12px 32px -10px rgb(0 0 0 / 0.6)",
  },
};

export function useChartTheme(): ChartTheme {
  const { theme } = useTheme();
  return theme === "dark" ? DARK : LIGHT;
}
