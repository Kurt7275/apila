// ============================================================
// APILA — TypeScript Types
// ============================================================

export type ProgramCategory =
  | "Health"
  | "Education"
  | "Livelihood"
  | "Youth"
  | "Senior Citizens"
  | "Sports"
  | "Scholarship"
  | "Women"
  | "Environment"
  | "Disaster Risk"
  | "Disaster Relief";

export type ProgramStatus = "Active" | "Upcoming" | "Completed" | "Cancelled";

export type RegistrationStatus =
  | "Pending"
  | "Approved"
  | "Rejected"
  | "Completed"
  | "Cancelled";

export type NotificationCategory =
  | "Announcement"
  | "Confirmation"
  | "Reminder"
  | "Update";

export type UserRole = "Resident" | "Admin" | "Secretary" | "Program Officer";

export interface Program {
  id: string;
  title: string;
  category: ProgramCategory;
  description: string;
  schedule: string;
  location: string;
  slots: number;
  enrolled: number;
  status: ProgramStatus;
  officer: string;
  benefits: string[];
  requirements: string[];
  imageUrl?: string;
  startDate: string;
  endDate?: string;
  tags: string[];
}

export interface Resident {
  id: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  birthdate: string;
  sex: "Male" | "Female";
  civilStatus: "Single" | "Married" | "Widowed" | "Separated" | "Head of Household" | string;
  email: string;
  phone: string;
  purok: string;
  street: string;
  householdId: string;
  registeredAt: string;
  isVerified: boolean;
  profileImage?: string;
}

export interface Registration {
  id: string;
  residentId: string;
  residentName: string;
  programId: string;
  programTitle: string;
  status: RegistrationStatus;
  registeredAt: string;
  approvedAt?: string;
  notes?: string;
  purok: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  category: NotificationCategory;
  isRead: boolean;
  createdAt: string;
  programId?: string;
  actionUrl?: string;
}

export interface DashboardStats {
  totalResidents: number;
  activePrograms: number;
  totalRegistrations: number;
  newThisMonth: number;
  pendingApprovals: number;
  completedPrograms: number;
}
