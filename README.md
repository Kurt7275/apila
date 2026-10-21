# APILA — Barangay Lapasan Civic Program & Participation Management System

<p align="center">
  <strong>Dual-Platform Civic Tech Ecosystem for Barangay Lapasan, Cagayan de Oro City</strong><br/>
  Native Android Mobile App (Kotlin) &bull; Barangay Personnel Web Portal (Next.js 16 / TypeScript / Tailwind CSS) &bull; Cloud Firestore & Firebase Auth Backend
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Mobile-Android%20(Kotlin)-3DDC84?logo=android&logoColor=white"/>
  <img src="https://img.shields.io/badge/Web-Next.js%2016-black?logo=next.js&logoColor=white"/>
  <img src="https://img.shields.io/badge/Backend-Firebase%20%2F%20Firestore-FFA000?logo=firebase&logoColor=white"/>
  <img src="https://img.shields.io/badge/Styling-Tailwind%20CSS-38B2AC?logo=tailwind-css&logoColor=white"/>
  <img src="https://img.shields.io/badge/Min%20SDK-26-blue"/>
  <img src="https://img.shields.io/badge/Target%20SDK-34-blue"/>
  <img src="https://img.shields.io/badge/Offline-Firestore%20Persistent%20Cache-brightgreen"/>
</p>

---

## Table of Contents

1. [Architecture & System Overview](#architecture--system-overview)
2. [Official 8-Module Admin Specification](#official-8-module-admin-specification)
3. [Resident Mobile App (Android)](#resident-mobile-app-android)
4. [Backend & Offline Architecture](#backend--offline-architecture)
5. [Tech Stack](#tech-stack)
6. [Completion Matrix](#completion-matrix)
7. [Repository Structure](#repository-structure)
8. [Getting Started](#getting-started)
   - [Running the Personnel Web Portal](#running-the-personnel-web-portal)
   - [Running the Resident Android App](#running-the-resident-android-app)
   - [Seeding the Firestore Database](#seeding-the-firestore-database)

---

## Architecture & System Overview

**APILA** provides a role-separated civic technology platform for Barangay Lapasan:

- **Residents** access civic programs, register for initiatives, receive digital passes, review attendance history, and stay updated through a **native Android mobile app** with full offline persistence.
- **Barangay Personnel & Officials** manage community programs, verify participants, mark attendance, broadcast advisories, analyze civic participation, and review administrative audit trails through a **web portal** (`admin-web/`) adhering to the official 8-module specification.

### Civic Brand Identity
- Canvas Cream: `#FFF9F3`
- Civic Brand Orange: `#F45113`
- Dark Executive Charcoal: `#0F172A`
- Border Accent: `#ECE7DF`
- Vector icon system via Lucide React and Android Vector Drawables (zero emojis throughout).

---

## Official 8-Module Admin Specification

The Admin Web Portal (`admin-web/`) is organized into 8 core modules:

| # | Module | Route | Functionality |
|---|---|---|---|
| 1 | **Dashboard** | `/admin/dashboard` | 5 KPI metrics (Registered Residents, Available Programs, Upcoming Activities, Pending Registrations, Attendance Rates), Recent Registrations queue with one-tap Approve/Reject, Available Community Programs capacity meters, Upcoming Activities schedule, and Important Updates notice feed. |
| 2 | **Program Management** | `/admin/programs`, `/admin/programs/[id]` | Program lifecycle management (Create, Update, Publish, Archive). Fields: Title, category, description, schedule, location, registration deadline, slots, and officer. Dedicated detail view with participant rosters and broadcast tool. |
| 3 | **Registration Management** | `/admin/registrations` | Live participant registration roster from mobile app sign-ups. One-tap Approve/Reject, Re-evaluate action, available program slots indicator, Purok filter, status filter, search, and CSV export. |
| 4 | **Attendance Management** | `/admin/attendance` | Program-specific attendance check-in station with real-time Turnout Rate progress bar, Present/Absent toggles, Mark All Present, Reset, CSV export, and Print Sheet. |
| 5 | **Announcements & Notifications** | `/admin/announcements` | Advisory broadcast console to publish urgent, important, and normal notices directly to mobile resident feeds. Push notification configuration and audience reach indicators. |
| 6 | **Resident Management** | `/admin/residents` | Barangay resident directory organized by Purok with account verification toggles. Detailed Profile modal displaying personal information alongside complete Registration & Attendance History. CSV export. |
| 7 | **Reports & Analytics** | `/admin/reports` | Civic participation summaries, registration counts, attendance percentages, available slots, and completed activities. Filterable by Reporting Period and Individual Program. Interactive Recharts charts, Program Outcomes Summary table, CSV export, and Print Report. |
| 8 | **Account & Security Management** | `/admin/settings` | Administrator profile settings, Barangay Office official records, password update and authentication security, and an Administrative Activity Audit Log tracking staff actions, timestamps, and terminal IPs with CSV export. |

---

## Resident Mobile App (Android)

Built natively in Kotlin (Min SDK 26, Target SDK 34) using Clean Architecture / MVVM:

- **Authentication**: Native login and registration with Barangay Lapasan Purok assignment.
- **Home Feed**: Civic hero banner, active passes summary, open program counters, and advisory highlights.
- **Programs Catalog**: Filterable program listing with slot capacity gauges and detailed specifications.
- **My Programs**: Digital entry passes (`REG-PASS`) for event admission and verification.
- **Participation History**: Completed program records displaying confirmed attendance status (Present / Absent).
- **Advisories & Notifications**: Real-time barangay alerts and municipal updates.
- **Profile**: Verified resident card and registered household demographic info.

---

## Backend & Offline Architecture

### Firebase Backend Services
- **Firebase Authentication**: Secures administrator logins on the web portal and resident authentication on mobile.
- **Cloud Firestore**: Central NoSQL real-time cloud database housing collections for `programs`, `residents`, `registrations`, `attendance`, `announcements`, and `audit_logs`.
- **Firebase Cloud Messaging (FCM)**: Push notification pipeline for barangay alerts.

### Android Offline-First Architecture
The mobile application uses Firestore's native persistent disk cache (`PersistentCacheSettings` with `CACHE_SIZE_UNLIMITED`) declared in [`ApilaApplication.kt`](app/src/main/java/com/lapasan/apila/ApilaApplication.kt):
1. **Offline Access**: Residents can browse previously fetched programs, view their digital registration passes, and check announcements without an active internet connection.
2. **Automatic Synchronization**: Actions taken or updates published while offline automatically sync with Firestore as soon as network connectivity is restored.
3. **Repository Fallback**: In-memory repository caches provide seamless resilience during initial application launch before cloud synchronization completes.

---

## Tech Stack

| Layer | Resident Mobile App | Personnel Web Portal | Cloud Backend |
|---|---|---|---|
| **Platform** | Native Android (SDK 26–34) | Web (Responsive Desktop) | Google Cloud / Firebase |
| **Language** | Kotlin 1.9 | TypeScript 5 | JavaScript (Node.js) |
| **Framework** | Android Jetpack, ViewBinding | Next.js 16 (App Router) | Firebase JS SDK v13 |
| **Styling** | Material Design 3, Vector XML | Tailwind CSS v4 | — |
| **Local Cache** | Firestore Persistent Disk Cache | LocalStorage Cache Layer | Firestore IndexedDB |
| **Data Viz** | Custom Progress Meters | Recharts Data Visualization | — |
| **Build Tool** | Gradle 9.4.1 | Turbopack | — |

---

## Completion Matrix

| Component | Status | Details |
|---|:---:|---|
| **Admin Web Portal (8 Modules)** | **100%** | All 8 official specification modules fully built, verified, and styled |
| **Admin Firebase Auth** | **100%** | Live email/password authentication on `/admin/login` |
| **Admin Firestore Integration** | **100%** | Service layer built; live Firestore CRUD wired to programs & database |
| **Android Resident UI** | **100%** | 5 resident tabs, registration passes, participation history |
| **Android Firebase SDK & Config** | **100%** | `google-services.json` integrated; Google Services Gradle plugin active |
| **Android Offline Persistence** | **100%** | `ApilaApplication.kt` configured with unlimited persistent disk cache |
| **Live Database Seeding** | **100%** | 8 programs, 10 residents, 4 announcements, 5 audit logs seeded |
| **Overall Ecosystem** | **~90%** | Dual-platform frontend, cloud database, and offline engine operational |

---

## Repository Structure

```text
apila/
├── admin-web/                            # Barangay Personnel Web Portal (Next.js 16)
│   ├── app/admin/
│   │   ├── dashboard/page.tsx            # Module 01: Executive Dashboard
│   │   ├── programs/page.tsx             # Module 02: Program Management & CRUD
│   │   ├── programs/[id]/page.tsx        # Module 02: Program Detail & Roster
│   │   ├── registrations/page.tsx        # Module 03: Registration Management
│   │   ├── attendance/page.tsx           # Module 04: Attendance Management Station
│   │   ├── announcements/page.tsx        # Module 05: Announcements & Notifications
│   │   ├── residents/page.tsx            # Module 06: Resident Management & Profiles
│   │   ├── reports/page.tsx              # Module 07: Reports & Analytics
│   │   ├── settings/page.tsx             # Module 08: Account, Security & Audit Logs
│   │   └── login/page.tsx                # Administrator Firebase Auth Sign-in
│   ├── components/layout/AdminSidebar.tsx # 8-module navigation sidebar
│   ├── lib/
│   │   ├── firebase.ts                   # Firebase App, Auth & Firestore initialization
│   │   ├── services/                     # Firestore service layer (7 modules)
│   │   └── mock-data/                    # Authentic Barangay Lapasan fallback datasets
│   └── scripts/
│       └── seed-firestore.mjs            # Firestore seeding utility
├── app/                                  # Resident Android App (Kotlin)
│   ├── google-services.json              # Firebase Android configuration
│   ├── src/main/java/com/lapasan/apila/
│   │   ├── ApilaApplication.kt           # Application class with Firestore disk persistence
│   │   ├── data/model/                   # Program, Registration, User, Announcement models
│   │   ├── data/repository/              # ProgramRepository, AuthRepository, etc.
│   │   ├── service/                      # FCM Push Notification Service
│   │   └── ui/resident/                  # Home, Programs, Passes, History, Profile
│   └── src/main/res/                     # Layouts, vector drawables, colors, styles
├── build.gradle.kts                      # Root Gradle configuration with Google Services
└── README.md                             # Project documentation
```

---

## Getting Started

### Running the Personnel Web Portal

```bash
cd admin-web

# Start development server on http://localhost:3000
npm run dev
```

Navigate to `http://localhost:3000/admin/login` to sign in.

### Running the Resident Android App

```bash
# Build the APK via command line
export JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home"
export PATH="$JAVA_HOME/bin:$PATH"
./gradlew assembleDebug

# Install on a connected Android device or emulator
adb install app/build/outputs/apk/debug/app-debug.apk
```

### Seeding the Firestore Database

To populate your Firebase Firestore database with authentic Barangay Lapasan sample records:

```bash
cd admin-web
node scripts/seed-firestore.mjs
```

---

<p align="center">
  Built with civic pride for <strong>Barangay Lapasan, Cagayan de Oro City</strong>
</p>
