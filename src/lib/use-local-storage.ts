import { useCallback, useState } from "react";

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [stored, setStored] = useState<T>(() => {
    if (typeof window === "undefined") return initialValue;
    try {
      const item = window.localStorage.getItem(key);
      return item !== null ? (JSON.parse(item) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback(
    (action: T | ((prev: T) => T)) => {
      setStored((prev) => {
        const next = typeof action === "function" ? (action as (p: T) => T)(prev) : action;
        try {
          if (typeof window !== "undefined") {
            window.localStorage.setItem(key, JSON.stringify(next));
          }
        } catch {}
        return next;
      });
    },
    [key],
  );

  return [stored, setValue] as const;
}

// Shared type used by both mentor and evidence pages
export interface SubmittedEval {
  evidenceId: string;
  studentId: string;
  mentorId: string;
  date: string;
  scores: Record<string, number>;
  comment: string;
  decision: "Approved" | "Rejected";
}
