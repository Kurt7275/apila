# APILA — Barangay Lapasan Civic Program & Participation Management System

<p align="center">
  <strong>Dual-Platform Civic Tech Ecosystem for Barangay Lapasan, Cagayan de Oro City</strong><br/>
  Native Android Mobile App (Kotlin) &bull; Barangay Personnel Web Portal (Next.js 16 / TypeScript / Tailwind CSS) &bull; Cloud Firestore & Firebase Auth Backend
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Mobile-Android%20(Kotlin)-3DDC84?logo=android&logoColor=white"/>
  <img src="https://img.shields.io/badge/Web-Next.js%2016-black?logo=next.js&logoColor=white"/>
  <img src="https://img.shields.io/badge/Backend-Firebase%20%2F%20Firestore-FFA000?logo=firebase&logoColor=white"/>
  <img src="https://img.shields.io/badge/QR%20Code-Live%20Pass%20%26%20Camera%20Scanner-FF6F00"/>
  <img src="https://img.shields.io/badge/Status-100%25%20Complete-brightgreen"/>
  <img src="https://img.shields.io/badge/Sync-100%25%20Live%20Cloud-blue"/>
</p>

---

## Table of Contents

1. [Architecture & System Overview](#architecture--system-overview)
2. [Key Features & Recent Updates](#key-features--recent-updates)
   - [Live QR Attendance System](#1-live-qr-attendance-system-new)
   - [Explicit Purok Dropdown Selection](#2-explicit-purok-dropdown-selection-new)
   - [True Live Cloud Sync (Zero Mock Data)](#3-true-live-cloud-sync-zero-mock-data)
   - [Onboarding & Cultural UX](#4-onboarding--cultural-ux)
3. [Resident Mobile App (Android)](#resident-mobile-app-android)
4. [Barangay Personnel Portal (Admin Web)](#barangay-personnel-portal-admin-web)
5. [Backend & Database Architecture](#backend--database-architecture)
6. [Tech Stack](#tech-stack)
7. [Completion Matrix](#completion-matrix)
8. [Setup & Deployment Guide](#setup--deployment-guide)
   - [Cloning on a New Device](#1-cloning-on-a-new-device)
   - [Running the Personnel Web Portal](#2-running-the-personnel-web-portal)
   - [Running the Resident Android App](#3-running-the-resident-android-app)
   - [Firebase Console Configuration](#4-firebase-console-configuration)
9. [Repository Structure](#repository-structure)

---

## Architecture & System Overview

**APILA** is a dual-platform civic governance ecosystem tailored specifically for **Barangay Lapasan, Cagayan de Oro City**:

- **Residents** discover community initiatives, submit applications, track live event countdowns, receive digital community passes with **dynamic scannable QR codes**, and read official barangay advisories through a **native Android mobile app** (Kotlin / MVVM).
- **Barangay Personnel & Officials** manage the complete civic lifecycle through a high-performance **administrative web portal** (`admin-web/`): approving registrations, checking in attendees via a **live camera QR scanner**, publishing urgent advisories, and analyzing demographic participation across all 10 Lapasan Puroks.
- **Shared Cloud Pipeline**: Both platforms communicate directly through **Google Cloud Firestore** and **Firebase Authentication** (`apila-barangay`), delivering instantaneous two-way data sync across the internet with zero server maintenance overhead.

### Civic Brand Identity
- **Canvas Cream**: `#FFF9F3`
- **Civic Brand Orange**: `#F45113`
- **Dark Executive Charcoal**: `#0F172A`
- **Border Accent**: `#ECE7DF`
- Vector icon system via Lucide React and Android Vector Drawables.

---

## Key Features & Recent Updates

### 1. Live QR Attendance System (NEW)
- **Mobile Digital Pass**: Every confirmed community pass automatically generates and renders a high-contrast bitmap QR matrix encoding the resident's unique `registration.id`.
  - **Approved Passes**: Active, full opacity QR code labeled *"Active Pass • Present to staff at venue check-in"*.
  - **Pending Passes**: Dimmed watermark QR with alert: *"Pending Review • QR activates upon approval"*.
- **Admin Camera QR Scanner**: The web attendance station includes a live camera scanner modal:
  - Accesses device camera (`facingMode: "environment"`) with an animated viewfinder reticle and corner targets.
  - Automatically detects QR codes in real-time using browser barcode detection.
  - Synthesizes an **instant audio check-in chime** (880Hz Web Audio API) on verification.
  - Automatically marks the resident **"PRESENT"** in Firestore and increments session turnout.
  - Includes a fallback Pass ID search input for manual keying or USB laser barcode scanners.

### 2. Explicit Purok Dropdown Selection (NEW)
- The mobile registration screen features an explicit **Purok Selector Dropdown** populated with all 10 official Lapasan districts:
  - *Purok 1 - Kolambog*
  - *Purok 2 - Lapasan Proper*
  - *Purok 3 - San Pedro*
  - *Purok 4 - San Juan*
  - *Purok 5 - Sta. Cruz*
  - *Purok 6 - Riverside*
  - *Purok 7 - Bitan-ag*
  - *Purok 8 - Agora Area*
  - *Purok 9 - Highway Zone*
  - *Purok 10 - Coastal Zone*
- Strict validation ensures residents select their authentic Purok before account creation, guaranteeing 100% accurate demographic reports in the Admin portal.

### 3. True Live Cloud Sync (Zero Mock Data)
- All mock and hardcoded sample arrays have been completely stripped from both client applications.
- When an administrator creates a program or publishes a broadcast on the web, it immediately appears on mobile devices upon refresh.
- When a resident registers for an event on mobile, the applicant immediately appears in the web admin's approval queue.

### 4. Onboarding & Cultural UX
- **Onboarding Flow**: Cultural introductory screen highlighting Barangay Lapasan's coastal heritage, civic mission, and key feature highlights.
- **Floating Bottom Navigation Bar**: Elevated dark-navy pill navigation bar on mobile with tabs for *Home*, *Programs*, *Passes*, *History*, *Alerts*, and *Profile*.
- **Sticky Desktop Navigation**: The administrative portal utilizes a fixed-height sidebar with independent scrollable workspaces, eliminating jarring full-page scroll jumps.

---

## Resident Mobile App (Android)

Built natively in Kotlin (Min SDK 26, Target SDK 34) using Google's recommended MVVM pattern:

- **Authentication**: Frictionless 1-step resident registration with explicit Purok selection and instant access.
- **Home Feed**: Personalized Cebuano greeting (*"Maayong Adlaw"*), interactive Bento summary statistics, and active event countdown card (Days, Hours, Minutes, Seconds).
- **Program Directory**: Search engine with instant query matching, category chips (Health, Sports, Livelihood, Calamity, Seniors, Education), and live capacity gauges.
- **Digital Community Passes**: Boarding-pass styled ticket with perforation tear lines, pass status badges, and dynamic scannable QR code matrix.
- **Participation History**: Complete record of past initiatives and verified attendance records.
- **Advisories & Alerts**: Live feed of official barangay circulars categorized by priority (*Urgent* vs *Normal*).
- **Profile**: Resident credential card with Purok designation and verification status.

---

## Barangay Personnel Portal (Admin Web)

Built using Next.js 16 (App Router), TypeScript, and Tailwind CSS:

1. **Dashboard (`/admin/dashboard`)**: Executive KPI counters (Registered Residents, Available Programs, Pending Registrations, Attendance Rate), quick advisory broadcast launcher, and recent registration queue.
2. **Programs (`/admin/programs`, `/admin/programs/[id]`)**: Full program lifecycle (Create, Edit, Set Capacity, Assign Officers, Archive) with participant roster management.
3. **Registrations (`/admin/registrations`)**: Real-time participant approval queue with one-click *Approve* or *Reject* actions and CSV export.
4. **Attendance (`/admin/attendance`)**: Station featuring the **Live Camera QR Scanner**, real-time turnout progress, manual override toggles, and print/export tools.
5. **Announcements (`/admin/announcements`)**: Emergency broadcast console to dispatch categorized advisories (*Urgent*, *Important*, *Normal*) to residents.
6. **Residents (`/admin/residents`)**: Centralized citizen directory with household details, registration history, and administrative verification toggles.
7. **Reports & Analytics (`/admin/reports`)**: Dynamic participation graphs and demographic turnout breakdowns across Puroks 1 through 10.
8. **Settings (`/admin/settings`)**: Administrator profile settings, municipal office details, and system audit logs.

---

## Backend & Database Architecture

APILA runs on **Google Cloud Firestore** (NoSQL Document Store):

```text
Cloud Firestore
├── users/{userId}             : Resident & staff credentials and core profiles
├── residents/{residentId}     : Resident directory records queried by Admin Web
├── programs/{programId}       : Community initiatives, schedules, and capacity quotas
├── registrations/{regId}      : Resident program applications and participation status
├── attendance/{attendanceId}  : Verified check-in records for completed events
├── announcements/{advisoryId} : Official public announcements and emergency alerts
└── auditLogs/{logId}          : Historical record of administrative actions
```

---

## Tech Stack

| Layer | Resident Mobile App | Personnel Web Portal | Cloud Backend |
|---|---|---|---|
| **Platform** | Native Android (SDK 26–34) | Web (Responsive Desktop) | Google Cloud / Firebase |
| **Language** | Kotlin 1.9 | TypeScript 5 | JavaScript (Node.js) |
| **Framework** | Android Jetpack, MVVM, Coroutines | Next.js 16 (App Router) | Firebase JS SDK v13 |
| **Styling** | Material Design Components, Vector XML | Tailwind CSS v4 | — |
| **QR Code Engine** | ZXing Core (MultiFormatWriter) | HTML5 BarcodeDetector & Web Audio | — |
| **Build Tool** | Gradle 9.4.1 | Turbopack | — |

---

## Completion Matrix

| Component | Status | Details |
|---|:---:|---|
| **Admin Web Portal (8 Modules)** | **100%** | All 8 specification modules fully built, verified, and styled |
| **Android Resident App** | **100%** | Complete MVVM app with onboarding, Purok selector, and floating nav |
| **Scannable QR Pass System** | **100%** | Generates scannable QR on mobile passes; live camera scanner on web |
| **Live Firestore Cloud Sync** | **100%** | Zero mock data; true live two-way read/write between mobile & web |
| **Authentication Flow** | **100%** | Resident instant sign-up + Admin email/password login |
| **Attendance Verification** | **100%** | Live camera QR scanning + manual checklist station |
| **Overall Ecosystem** | **100%** | Production-ready, fully synchronized civic tech platform |

---

## Setup & Quickstart Tutorial

Follow this step-by-step guide to run the complete **APILA** ecosystem (Admin Web Portal + Resident Android App) on any new machine.

> [!NOTE]
> **Zero Local Database Setup Required**: The entire backend is already hosted in the cloud on **Google Firebase (`apila-barangay`)**. Both the web portal and Android app connect to the same live database automatically.

---

### Prerequisites

| Component | Required Software | Download Link |
| :--- | :--- | :--- |
| **Admin Web Portal** | Node.js (v18 or v20+) & `npm` | [nodejs.org](https://nodejs.org/) |
| **Resident Mobile App** | Android Studio (Ladybug or newer) | [developer.android.com/studio](https://developer.android.com/studio) |
| **Android Device (Optional)** | Any physical Android phone (Android 8.0+) or emulator | USB Cable or Android Studio Virtual Device |

---

### Step 1: Clone the Repository

On your target computer, open your terminal (macOS/Linux) or Command Prompt / PowerShell (Windows):

```bash
git clone https://github.com/Kurt7275/apila.git
cd apila
```

> `app/google-services.json` and web `firebaseConfig` are already included in the repository, so both clients are pre-configured to connect to the live backend out of the box.

---

### Step 2: Run the Barangay Personnel Portal (Admin Web)

1. Open a terminal and navigate to the `admin-web` folder:
   ```bash
   cd admin-web
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Launch the local development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to:
   ```text
   http://localhost:3000/admin/login
   ```

#### Default Administrator Login Credentials:

* **Official Email:** `admin@lapasan.gov.ph`
* **Password:** `admin2026` (or `123456`)
* **Role:** Primary System Owner / Head Admin

> **Tip:** You can click the **"Quick Demo Fill"** button on the login screen to automatically fill in the owner credentials.

---

### Step 3: Run the Resident Mobile App (Android)

You have two simple options to run the mobile app:

#### Option A: Open & Run in Android Studio (Recommended for Development)

1. Launch **Android Studio**.
2. Click **File &rarr; Open...** (or **Open** from the welcome screen) and select the root **`apila`** folder.
3. Allow Gradle 1–2 minutes to download dependencies and sync the project.
4. Start an Android Emulator from the **Device Manager** (or plug in a physical phone with USB Debugging enabled).
5. Click the green **Run (▶)** button in the top toolbar (or press `Shift + F10`).
6. The app will launch into the Onboarding / Welcome screen!

#### Option B: Install the Standalone APK (No Coding / Instant on Any Phone)

If you just want to run and test the app on a physical Android phone without setting up Android Studio:

1. Locate the pre-built APK at:
   ```text
   app/build/outputs/apk/debug/app-debug.apk
   ```
2. Transfer this `.apk` file to your phone (via USB, Google Drive, AirDrop, or messaging).
3. Tap the file on your phone and select **Install**.
4. Open **APILA** — it connects to the live Firebase database immediately.

---

### Step 4: Provisioning Staff Admin Accounts (Owner Role)

Regular residents cannot self-register an administrator account. Only the **Primary System Owner** can create new staff admins:

1. Log in as the Owner at `http://localhost:3000/admin/login` (`admin@lapasan.gov.ph`).
2. Go to **Settings &rarr; Admin Accounts** tab (`http://localhost:3000/admin/settings`).
3. Fill in the **"Provision Admin Account"** form:
   * **Officer Full Name** (e.g. `Ricardo Gomez`)
   * **Officer Gmail / Email** (e.g. `ricardo.gomez@gmail.com`)
   * **Role / Office** (e.g. `Program Officer`, `Barangay Secretary`, `Health Lead`)
   * **Department / Division** (e.g. `Community Services Division`)
   * **Initial Login Password** (minimum 6 characters)
4. Click **Create Admin Account**.
5. The new staff member can now immediately sign in at `http://localhost:3000/admin/login` using their assigned Gmail and password!

---

### Step 5: Testing Live Synchronization Between Devices

To verify that both platforms are communicating in real time:

1. **On Admin Web (`http://localhost:3000/admin/programs`)**: Click **+ Create Program** and publish a new initiative (e.g., *"Free Community Dental Checkup"*).
2. **On Resident Android App**: Pull down to refresh the **Programs** tab — the new program will immediately appear in the feed.
3. **On Resident App**: Tap the program and click **Register**.
4. **On Admin Web (`http://localhost:3000/admin/registrations`)**: The resident's registration appears in real time in the approval queue!
5. **On Admin Web**: Click **Approve**. The resident's pass instantly generates an active **QR Code** on mobile under the **Passes** tab.
6. **On Admin Web (`http://localhost:3000/admin/attendance`)**: Open the **Camera QR Scanner** and scan the mobile QR pass to mark attendance with audio chime verification.

---

### Troubleshooting & FAQ

* **Port 3000 already in use?**
  Run `npm run dev -- -p 3001` to start the web portal on a different port.
* **Android Studio: "Java runtime not found" or Gradle sync error?**
  Ensure Android Studio's bundled JDK is selected in **Settings &rarr; Build, Execution, Deployment &rarr; Build Tools &rarr; Gradle &rarr; Gradle JDK** (set to version 17 or embedded JBR).
* **Terminal APK Build Command**:
  ```bash
  # macOS / Linux
  ./gradlew assembleDebug

  # Windows PowerShell
  .\gradlew.bat assembleDebug
  ```
  The compiled APK is placed in `app/build/outputs/apk/debug/app-debug.apk`.

---

<p align="center">
  Built with civic pride for <strong>Barangay Lapasan, Cagayan de Oro City</strong>
</p>
