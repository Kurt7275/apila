import { Registration } from "@/types";

export const mockRegistrations: Registration[] = [];

export const demoResidentRegistrations = mockRegistrations.filter(
  (r) => r.residentId === "res-demo"
);

export const monthlyRegistrationStats: { month: string; registrations: number }[] = [];

export const programRegistrationStats: { program: string; count: number }[] = [];

export const categoryDistribution: { name: string; value: number; color: string }[] = [];
