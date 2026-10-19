import { Notification } from "@/types";

export const mockNotifications: Notification[] = [
  {
    id: "notif-001",
    title: "Registration Approved",
    message:
      "Your registration for the Free Medical and Dental Checkup program has been approved. Please attend on the 2nd Saturday of the month at 7:00 AM at the Barangay Multi-Purpose Hall.",
    category: "Confirmation",
    isRead: true,
    createdAt: "2026-08-11T14:00:00",
    programId: "prog-001",
  },
  {
    id: "notif-002",
    title: "Registration Received",
    message:
      "We have received your registration for the Youth Leadership and Values Formation program. It is currently under review. You will be notified once it has been processed.",
    category: "Confirmation",
    isRead: true,
    createdAt: "2026-09-07T10:20:00",
    programId: "prog-003",
  },
  {
    id: "notif-003",
    title: "Reminder: Medical Checkup Tomorrow",
    message:
      "This is a reminder that the Free Medical and Dental Checkup is scheduled tomorrow, September 13, 2026 at 7:00 AM. Please bring your barangay ID. See you there!",
    category: "Reminder",
    isRead: false,
    createdAt: "2026-09-12T08:00:00",
    programId: "prog-001",
  },
  {
    id: "notif-004",
    title: "New Program: DRRM Training",
    message:
      "The Barangay is opening registrations for the Disaster Risk Reduction and Management Training on October 10–12, 2026. Slots are limited to 100 participants. Register now!",
    category: "Announcement",
    isRead: false,
    createdAt: "2026-09-10T09:00:00",
    programId: "prog-011",
    actionUrl: "/resident/programs/prog-011",
  },
  {
    id: "notif-005",
    title: "Barangay Cup Registration Open",
    message:
      "The Barangay Cup Basketball Tournament 2026 registration is now open. Register your team before September 30, 2026. Games start on October 1 every weekend.",
    category: "Announcement",
    isRead: false,
    createdAt: "2026-09-09T10:00:00",
    programId: "prog-005",
    actionUrl: "/resident/programs/prog-005",
  },
  {
    id: "notif-006",
    title: "Clean-Up Drive This Saturday",
    message:
      "Reminder: The monthly Community Clean-Up and Tree Planting Drive is this Saturday, September 27, 2026, at 6:00 AM. All household representatives are encouraged to participate.",
    category: "Reminder",
    isRead: true,
    createdAt: "2026-09-25T08:00:00",
    programId: "prog-007",
  },
  {
    id: "notif-007",
    title: "PhilHealth Registration Deadline Extended",
    message:
      "The PhilHealth Indigent Member Registration deadline has been extended to October 15, 2026. If you haven't registered yet, please visit the Barangay Hall from Monday to Friday, 8AM–5PM.",
    category: "Update",
    isRead: false,
    createdAt: "2026-09-30T09:00:00",
    programId: "prog-009",
  },
  {
    id: "notif-008",
    title: "Program Completed: Feeding Program",
    message:
      "The Nutrition Month Feeding Program has been successfully completed. Thank you for your participation. A total of 80 children benefited from this program.",
    category: "Update",
    isRead: true,
    createdAt: "2026-07-31T17:00:00",
    programId: "prog-010",
  },
];
