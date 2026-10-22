import { Resident } from "@/types";

export const purkosList = [
  "Purok 1", "Purok 2", "Purok 3", "Purok 4", "Purok 5",
  "Purok 6", "Purok 7", "Purok 8", "Purok 9", "Purok 10",
];

export const mockResidents: Resident[] = [];

export const demoResident = mockResidents.find((r) => r.id === "res-demo");
