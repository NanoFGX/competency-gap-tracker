import { createContext, useContext, useState, type ReactNode } from "react";
import { students, type Student } from "./mock-data";
import type { RegisteredUser } from "./role-context";

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

function registeredToStudent(u: RegisteredUser): Student {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    program: u.program ?? "Computer Science",
    university: u.university ?? "",
    graduationYear: u.graduationYear ?? new Date().getFullYear() + 1,
    location: "",
    gpa: "N/A",
    careerInterest: "",
    bio: "",
    linkedIn: "",
  };
}

export function useStudent() {
  const ctx = useContext(StudentContext);
  if (!ctx) throw new Error("useStudent must be used within StudentProvider");

  let student = students.find((s) => s.id === ctx.studentId);

  if (!student && typeof window !== "undefined") {
    try {
      const registered: RegisteredUser[] = JSON.parse(window.localStorage.getItem("cgt-registered-users") ?? "[]");
      const reg = registered.find((u) => u.id === ctx.studentId && u.role === "student");
      if (reg) student = registeredToStudent(reg);
    } catch {
      // ignore
    }
  }

  return { ...ctx, student: student ?? students[0] };
}
