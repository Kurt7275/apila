/**
 * Firestore Seed Script
 * Run this ONCE to populate initial data in your Firestore database.
 * 
 * Usage:
 *   node scripts/seed-firestore.mjs
 * 
 * Prerequisites:
 *   - Firebase project must have Firestore enabled
 *   - Copy your firebaseConfig into this file (already done below)
 */

import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, serverTimestamp, Timestamp } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBaTrL0f9IYorgNJ1h96LlPhJmSm9065m0",
  authDomain: "apila-barangay.firebaseapp.com",
  projectId: "apila-barangay",
  storageBucket: "apila-barangay.firebasestorage.app",
  messagingSenderId: "686449307162",
  appId: "1:686449307162:web:66df4e62ddec2993de2ba3",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const now = Timestamp.now();

// ── Programs ──────────────────────────────────────────────────────────────────
const programs = [
  {
    title: "Barangay Health and Wellness Fair",
    category: "Health",
    description: "Free medical consultations, blood pressure monitoring, blood typing, and health awareness sessions for Lapasan residents.",
    schedule: "2026-11-15T08:00",
    location: "Barangay Lapasan Multi-Purpose Hall",
    registrationDeadline: "2026-11-10",
    slots: 200,
    enrolledCount: 142,
    officer: "Kagawad Maria Santos",
    status: "Active",
    createdAt: now,
    updatedAt: now,
  },
  {
    title: "Livelihood Skills Training: Bread and Pastry Production",
    category: "Livelihood",
    description: "TESDA-aligned bread and pastry production training open to unemployed and underemployed residents of Barangay Lapasan.",
    schedule: "2026-11-20T08:00",
    location: "Lapasan Barangay Training Center",
    registrationDeadline: "2026-11-15",
    slots: 30,
    enrolledCount: 28,
    officer: "Kagawad Jose Reyes",
    status: "Active",
    createdAt: now,
    updatedAt: now,
  },
  {
    title: "Youth Leadership and Values Formation Seminar",
    category: "Youth",
    description: "A two-day seminar for youth aged 15-30 focusing on leadership, civic responsibility, and values formation aligned with Sangguniang Kabataan programs.",
    schedule: "2026-12-01T08:00",
    location: "Lapasan Barangay Hall, 2nd Floor",
    registrationDeadline: "2026-11-25",
    slots: 80,
    enrolledCount: 55,
    officer: "SK Chairperson Ana Cruz",
    status: "Upcoming",
    createdAt: now,
    updatedAt: now,
  },
  {
    title: "Senior Citizens Wellness and Recreation Program",
    category: "Senior Citizens",
    description: "Monthly wellness check, therapeutic activities, and recreational programs for senior citizens of Barangay Lapasan.",
    schedule: "2026-11-08T09:00",
    location: "Lapasan Senior Citizens Center",
    registrationDeadline: "2026-11-05",
    slots: 60,
    enrolledCount: 58,
    officer: "Kagawad Rosario Dela Cruz",
    status: "Active",
    createdAt: now,
    updatedAt: now,
  },
  {
    title: "Barangay Basketball League 2026",
    category: "Sports",
    description: "Annual inter-purok basketball tournament open to male residents aged 18-40. Teams represent their respective puroks.",
    schedule: "2026-12-10T14:00",
    location: "Lapasan Covered Court",
    registrationDeadline: "2026-12-05",
    slots: 120,
    enrolledCount: 96,
    officer: "Kagawad Roberto Tan",
    status: "Upcoming",
    createdAt: now,
    updatedAt: now,
  },
  {
    title: "Educational Scholarship Program — Second Semester",
    category: "Scholarship",
    description: "Financial assistance program for qualified college students who are bonafide residents of Barangay Lapasan. Priority given to students from low-income families.",
    schedule: "2026-11-12T08:00",
    location: "Barangay Lapasan Hall — Scholarship Office",
    registrationDeadline: "2026-11-08",
    slots: 25,
    enrolledCount: 22,
    officer: "Barangay Captain Eduardo Lim",
    status: "Active",
    createdAt: now,
    updatedAt: now,
  },
  {
    title: "Community Clean-Up Drive and Mangrove Planting",
    category: "Environment",
    description: "Environmental program in coordination with DENR — coastal cleanup and mangrove planting at the Lapasan shoreline.",
    schedule: "2026-11-22T06:00",
    location: "Lapasan Coastal Area",
    registrationDeadline: "2026-11-18",
    slots: 150,
    enrolledCount: 63,
    officer: "Kagawad Gloria Manalo",
    status: "Upcoming",
    createdAt: now,
    updatedAt: now,
  },
  {
    title: "DRRM Disaster Preparedness and First Aid Training",
    category: "Disaster Relief",
    description: "Basic first aid, evacuation procedures, and disaster risk reduction seminar for household heads and community volunteers.",
    schedule: "2026-10-20T08:00",
    location: "Barangay Lapasan Multi-Purpose Hall",
    registrationDeadline: "2026-10-15",
    slots: 100,
    enrolledCount: 100,
    officer: "DRRM Coordinator Felix Ramos",
    status: "Completed",
    createdAt: now,
    updatedAt: now,
  },
];

// ── Residents ─────────────────────────────────────────────────────────────────
const residents = [
  { name: "Maria Santos", email: "msantos@gmail.com", phone: "09171234567", purok: "Purok 1", householdId: "HH-001", address: "Purok 1, Barangay Lapasan, CDO", birthdate: "1985-03-12", gender: "Female", civilStatus: "Married", isVerified: true, createdAt: now, updatedAt: now },
  { name: "Jose Reyes", email: "jreyes@gmail.com", phone: "09182345678", purok: "Purok 2", householdId: "HH-002", address: "Purok 2, Barangay Lapasan, CDO", birthdate: "1990-07-22", gender: "Male", civilStatus: "Single", isVerified: true, createdAt: now, updatedAt: now },
  { name: "Ana Cruz", email: "acruz@gmail.com", phone: "09193456789", purok: "Purok 3", householdId: "HH-003", address: "Purok 3, Barangay Lapasan, CDO", birthdate: "2000-11-05", gender: "Female", civilStatus: "Single", isVerified: true, createdAt: now, updatedAt: now },
  { name: "Roberto Tan", email: "rtan@gmail.com", phone: "09204567890", purok: "Purok 4", householdId: "HH-004", address: "Purok 4, Barangay Lapasan, CDO", birthdate: "1978-06-18", gender: "Male", civilStatus: "Married", isVerified: true, createdAt: now, updatedAt: now },
  { name: "Gloria Manalo", email: "gmanalo@gmail.com", phone: "09215678901", purok: "Purok 5", householdId: "HH-005", address: "Purok 5, Barangay Lapasan, CDO", birthdate: "1995-02-28", gender: "Female", civilStatus: "Single", isVerified: false, createdAt: now, updatedAt: now },
  { name: "Felix Ramos", email: "framos@gmail.com", phone: "09226789012", purok: "Purok 1", householdId: "HH-006", address: "Purok 1, Barangay Lapasan, CDO", birthdate: "1982-09-14", gender: "Male", civilStatus: "Married", isVerified: true, createdAt: now, updatedAt: now },
  { name: "Lita Gomez", email: "lgomez@gmail.com", phone: "09237890123", purok: "Purok 2", householdId: "HH-007", address: "Purok 2, Barangay Lapasan, CDO", birthdate: "1968-12-01", gender: "Female", civilStatus: "Widowed", isVerified: true, createdAt: now, updatedAt: now },
  { name: "Carlos Bautista", email: "cbautista@gmail.com", phone: "09248901234", purok: "Purok 6", householdId: "HH-008", address: "Purok 6, Barangay Lapasan, CDO", birthdate: "2002-04-10", gender: "Male", civilStatus: "Single", isVerified: false, createdAt: now, updatedAt: now },
  { name: "Nelia Flores", email: "nflores@gmail.com", phone: "09259012345", purok: "Purok 3", householdId: "HH-009", address: "Purok 3, Barangay Lapasan, CDO", birthdate: "1975-08-25", gender: "Female", civilStatus: "Married", isVerified: true, createdAt: now, updatedAt: now },
  { name: "Danilo Villanueva", email: "dvillanueva@gmail.com", phone: "09260123456", purok: "Purok 7", householdId: "HH-010", address: "Purok 7, Barangay Lapasan, CDO", birthdate: "1988-01-30", gender: "Male", civilStatus: "Single", isVerified: true, createdAt: now, updatedAt: now },
];

// ── Announcements ─────────────────────────────────────────────────────────────
const announcements = [
  {
    title: "Mandatory Evacuation Advisory — Typhoon Queenie",
    category: "DRRM Advisory",
    priority: "Urgent",
    targetAudience: "All Residents",
    message: "Due to the imminent landfall of Typhoon Queenie, all residents in low-lying and coastal areas of Barangay Lapasan are advised to evacuate immediately to the designated evacuation center at Lapasan Elementary School.",
    pushNotification: true,
    publishedBy: "Admin",
    createdAt: now,
    updatedAt: now,
  },
  {
    title: "Health and Wellness Fair — Registration Now Open",
    category: "Program Announcement",
    priority: "Important",
    targetAudience: "All Residents",
    message: "Registration for the Barangay Health and Wellness Fair is now open. Free medical consultations, blood pressure monitoring, and health screenings will be available. Register through the APILA mobile app.",
    pushNotification: true,
    publishedBy: "Admin",
    createdAt: now,
    updatedAt: now,
  },
  {
    title: "Scheduled Water Interruption — November 10-11",
    category: "Public Notice",
    priority: "Important",
    targetAudience: "All Residents",
    message: "MCWD has notified the barangay of a scheduled water service interruption on November 10-11, 2026 for maintenance works. Residents are advised to store adequate water supply.",
    pushNotification: false,
    publishedBy: "Admin",
    createdAt: now,
    updatedAt: now,
  },
  {
    title: "Scholarship Applications Closing Soon",
    category: "Program Update",
    priority: "Normal",
    targetAudience: "Youth",
    message: "The deadline for the Educational Scholarship Program for Second Semester is November 8, 2026. Eligible college students are reminded to submit complete documentary requirements to the Barangay Hall.",
    pushNotification: false,
    publishedBy: "Admin",
    createdAt: now,
    updatedAt: now,
  },
];

// ── Audit Logs ────────────────────────────────────────────────────────────────
const auditLogs = [
  { officer: "Admin", action: "Approved registration for Maria Santos — Health Fair", category: "Registration", ipTerminal: "192.168.1.10", status: "Success", createdAt: now },
  { officer: "Admin", action: "Published announcement: Typhoon Queenie Advisory", category: "Announcement", ipTerminal: "192.168.1.10", status: "Success", createdAt: now },
  { officer: "Admin", action: "Created program: DRRM Disaster Preparedness Training", category: "Program Management", ipTerminal: "192.168.1.10", status: "Success", createdAt: now },
  { officer: "Admin", action: "Marked attendance — DRRM Training (100 present)", category: "Attendance", ipTerminal: "192.168.1.10", status: "Success", createdAt: now },
  { officer: "Admin", action: "Verified resident account: Felix Ramos", category: "Resident Management", ipTerminal: "192.168.1.10", status: "Success", createdAt: now },
];

// ── Seed Function ─────────────────────────────────────────────────────────────
async function seed() {
  console.log("Seeding Firestore...\n");

  console.log("Adding programs...");
  for (const p of programs) {
    const ref = await addDoc(collection(db, "programs"), p);
    console.log(`  ✓ ${p.title} (${ref.id})`);
  }

  console.log("\nAdding residents...");
  for (const r of residents) {
    const ref = await addDoc(collection(db, "residents"), r);
    console.log(`  ✓ ${r.name} (${ref.id})`);
  }

  console.log("\nAdding announcements...");
  for (const a of announcements) {
    const ref = await addDoc(collection(db, "announcements"), a);
    console.log(`  ✓ ${a.title} (${ref.id})`);
  }

  console.log("\nAdding audit logs...");
  for (const l of auditLogs) {
    const ref = await addDoc(collection(db, "audit_logs"), l);
    console.log(`  ✓ ${l.action} (${ref.id})`);
  }

  console.log("\nDone! Firestore seeded successfully.");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
