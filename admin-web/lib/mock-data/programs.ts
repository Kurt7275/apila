import { Program } from "@/types";

export const mockPrograms: Program[] = [];

export const featuredPrograms = mockPrograms.filter((p) =>
  ["prog-001", "prog-003", "prog-006"].includes(p.id)
);
