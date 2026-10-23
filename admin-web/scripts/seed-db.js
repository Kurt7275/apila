const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, serverTimestamp } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: 'AIzaSyBaTrL0f9IYorgNJ1h96LlPhJmSm9065m0',
  authDomain: 'apila-barangay.firebaseapp.com',
  projectId: 'apila-barangay',
  storageBucket: 'apila-barangay.appspot.com',
  messagingSenderId: '686449307162',
  appId: '1:686449307162:web:6eeea5072efc4d9ad15fa1'
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const initialPrograms = [
  {
    title: "Barangay Health and Wellness Fair",
    category: "Health",
    description: "Free medical consultations, blood pressure monitoring, blood typing, and health awareness sessions for Lapasan residents.",
    location: "Barangay Lapasan Multi-Purpose Hall",
    schedule: "2026-11-15T08:00",
    registrationDeadline: "2026-11-10",
    slots: 200,
    enrolledCount: 0,
    officer: "Kagawad Maria Santos",
    status: "Active"
  },
  {
    title: "Community Clean-Up Drive and Mangrove Planting",
    category: "Environment",
    description: "Environmental program in coordination with DENR — coastal cleanup and mangrove planting at the Lapasan shoreline.",
    location: "Lapasan Coastal Area",
    schedule: "2026-11-22T06:00",
    registrationDeadline: "2026-11-18",
    slots: 150,
    enrolledCount: 0,
    officer: "Kagawad Gloria Manalo",
    status: "Active"
  },
  {
    title: "Livelihood Skills Training: Bread and Pastry Production",
    category: "Livelihood",
    description: "TESDA-aligned bread and pastry production training open to unemployed and underemployed residents of Barangay Lapasan.",
    location: "Lapasan Barangay Training Center",
    schedule: "2026-11-20T08:00",
    registrationDeadline: "2026-11-15",
    slots: 30,
    enrolledCount: 0,
    officer: "Kagawad Jose Reyes",
    status: "Active"
  },
  {
    title: "Educational Scholarship Program — Second Semester",
    category: "Scholarship",
    description: "Financial assistance program for qualified college students who are bonafide residents of Barangay Lapasan. Priority given to students from low-income families.",
    location: "Barangay Lapasan Hall — Scholarship Office",
    schedule: "2026-11-12T08:00",
    registrationDeadline: "2026-11-08",
    slots: 25,
    enrolledCount: 0,
    officer: "Barangay Captain Eduardo Lim",
    status: "Active"
  },
  {
    title: "Senior Citizens Wellness and Recreation Program",
    category: "Senior Citizens",
    description: "Monthly wellness check, therapeutic activities, and recreational programs for senior citizens of Barangay Lapasan.",
    location: "Lapasan Senior Citizens Center",
    schedule: "2026-11-08T09:00",
    registrationDeadline: "2026-11-05",
    slots: 60,
    enrolledCount: 0,
    officer: "Kagawad Rosario Dela Cruz",
    status: "Active"
  }
];

const initialAnnouncements = [
  {
    title: "Mandatory Evacuation Advisory — Typhoon Queenie",
    category: "Emergency / DRRM",
    priority: "Urgent",
    targetAudience: "All Residents",
    message: "Due to the imminent landfall of Typhoon Queenie, all residents in low-lying and coastal areas of Barangay Lapasan are advised to evacuate immediately to the designated evacuation center at Lapasan Elementary School.",
    publishedBy: "Admin",
    pushNotification: true
  },
  {
    title: "Scheduled Water Interruption — November 10-11",
    category: "General Advisory",
    priority: "Important",
    targetAudience: "Purok 1, 2, 3",
    message: "COWD announces a temporary water service interruption from 10:00 PM Nov 10 to 6:00 AM Nov 11 for scheduled pipeline maintenance. Please store sufficient water.",
    publishedBy: "Admin",
    pushNotification: true
  },
  {
    title: "Health and Wellness Fair — Registration Now Open",
    category: "Program Update",
    priority: "Important",
    targetAudience: "All Residents",
    message: "Registration for the annual Barangay Health and Wellness Fair is now live. Register through the APILA mobile app to reserve your slot and receive your digital pass.",
    publishedBy: "Admin",
    pushNotification: true
  }
];

const initialResidents = [
  { name: "Maria Clara Santos", email: "resident@lapasan.gov.ph", phone: "09171234567", purok: "Purok 2 - Lapasan Proper", address: "Block 4 Lot 12, Lapasan Proper", gender: "Female", civilStatus: "Single", birthdate: "1995-04-12", householdId: "HH-001", isVerified: true },
  { name: "Roberto Tan", email: "roberto.tan@lapasan.gov.ph", phone: "09181112233", purok: "Purok 1 - Riverside", address: "Riverside Drive, Lapasan", gender: "Male", civilStatus: "Married", birthdate: "1988-08-20", householdId: "HH-002", isVerified: true },
  { name: "Ana Cruz", email: "ana.cruz@lapasan.gov.ph", phone: "09203334455", purok: "Purok 3 - Coastal", address: "Coastal Road, Lapasan", gender: "Female", civilStatus: "Single", birthdate: "2000-01-15", householdId: "HH-003", isVerified: false },
  { name: "Jose Reyes", email: "jose.reyes@lapasan.gov.ph", phone: "09175556677", purok: "Purok 2 - Lapasan Proper", address: "San Pedro St., Lapasan", gender: "Male", civilStatus: "Married", birthdate: "1975-11-03", householdId: "HH-004", isVerified: true },
  { name: "Gloria Manalo", email: "gloria.manalo@lapasan.gov.ph", phone: "09198889900", purok: "Purok 4 - Hillside", address: "Hillside Subd., Lapasan", gender: "Female", civilStatus: "Widowed", birthdate: "1960-06-25", householdId: "HH-005", isVerified: true }
];

async function seed() {
  console.log('--- SEEDING DATABASE WITH FRESH DEFAULT DATA ---');
  for (const p of initialPrograms) {
    await addDoc(collection(db, 'programs'), { ...p, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
  }
  console.log(`✓ Seeded ${initialPrograms.length} programs with 0 enrolled.`);

  for (const a of initialAnnouncements) {
    await addDoc(collection(db, 'announcements'), { ...a, createdAt: serverTimestamp() });
  }
  console.log(`✓ Seeded ${initialAnnouncements.length} announcements.`);

  for (const r of initialResidents) {
    await addDoc(collection(db, 'residents'), { ...r, createdAt: serverTimestamp() });
  }
  console.log(`✓ Seeded ${initialResidents.length} residents.`);

  console.log('--- SEEDING COMPLETE ---');
}

seed().then(() => process.exit(0)).catch(err => {
  console.error(err);
  process.exit(1);
});
