import { createContext, useContext, useState, type ReactNode } from "react";
import { students } from "./mock-data";

interface Ctx {
  studentId: string;
  setStudentId: (id: string) => void;
}

const StudentContext = createContext<Ctx | null>(null);

export function StudentProvider({ children }: { children: ReactNode }) {
  const [studentId, setStudentId] = useState(students[0].id);
  return (
    <StudentContext.Provider value={{ studentId, setStudentId }}>
      {children}
    </StudentContext.Provider>
  );
}

export function useStudent() {
  const ctx = useContext(StudentContext);
  if (!ctx) throw new Error("useStudent must be used within StudentProvider");
  const student = students.find((s) => s.id === ctx.studentId)!;
  return { ...ctx, student };
}
