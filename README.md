# APILA — Barangay Lapasan Civic Program & Participation Management System

<p align="center">
  <strong>Dual-Platform Civic Tech Ecosystem for Barangay Lapasan, Cagayan de Oro City</strong><br/>
  📱 <strong>Resident Mobile App</strong> (Native Android / Kotlin) &bull; 💻 <strong>Personnel Web Portal</strong> (Next.js / TypeScript / Tailwind CSS)
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Mobile-Android%20(Kotlin)-3DDC84?logo=android&logoColor=white"/>
  <img src="https://img.shields.io/badge/Web-Next.js%2016-black?logo=next.js&logoColor=white"/>
  <img src="https://img.shields.io/badge/Styling-Tailwind%20CSS-38B2AC?logo=tailwind-css&logoColor=white"/>
  <img src="https://img.shields.io/badge/Min%20SDK-26-blue"/>
  <img src="https://img.shields.io/badge/Target%20SDK-34-blue"/>
  <img src="https://img.shields.io/badge/Architecture-Clean%20%2F%20MVVM-orange"/>
</p>

---

## Table of Contents

1. [Architecture & System Overview](#architecture--system-overview)
2. [Platform Division](#platform-division)
   - [📱 Resident Mobile App (Android)](#1-resident-mobile-app-android)
   - [💻 Barangay Personnel Portal (Web)](#2-barangay-personnel-portal-web)
3. [Build Progress & Status](#build-progress--status)
   - [Done](#done)
   - [In Progress](#in-progress)
   - [Left to Build](#left-to-build)
4. [Completion Matrix by Layer](#completion-matrix-by-layer)
5. [Tech Stack](#tech-stack)
6. [Demo Accounts](#demo-accounts)
7. [Repository Structure](#repository-structure)
8. [Getting Started](#getting-started)
   - [Running the Resident Android App](#running-the-resident-android-app)
   - [Running the Personnel Web Portal](#running-the-personnel-web-portal)

---

## Architecture & System Overview

**APILA** empowers Barangay Lapasan with an intentional role separation:

- **Residents** interact through a **fast, native Android mobile app** designed for on-the-go discovery, registrations, entry passes (`REG-PASS`), notifications, and civic history.
- **Barangay Personnel & Officials** manage operations through a **desktop-first responsive web portal** (`admin-web/`) equipped with data analytics dashboards, program rosters, attendance check-in stations, and notice broadcasts.

Both platforms share the same warm civic design identity:
- Cream `#FFF9F3`
- Brand Civic Orange `#F45113`
- Dark Executive Charcoal `#0F172A`
- Clean Border `#ECE7DF`
- **Zero emojis** across all layouts and source files (replaced by clean vector icons).

---

## Platform Division

### 1. Resident Mobile App (Android)
- **Splash & Auth**: Fast splash screen, resident login, and registration with Lapasan Purok assignment.
- **Home**: Civic hero spotlight, quick passes count, open programs count, upcoming initiatives, and official advisories.
- **Programs Catalog**: Categorized catalog (Health, Youth & Sports, Livelihood, Senior Citizens, Disaster Preparedness, Education) with instant search and open slots filter.
- **Program Details**: Full breakdown of schedule, venue, capacity slot meter, and one-tap registration/cancellation.
- **My Programs**: Digital entry passes (`REG-PASS #...`) ready for event verification.
- **History**: Permanent participation record with attendance status markers.
- **Notifications**: Community alerts and municipal advisories.
- **Profile**: Verified resident credentials and Purok badge.

### 2. Barangay Personnel Portal (Web)
- **Executive Dashboard** (`/admin/dashboard`): Real-time KPI summary cards (Total Residents, Active Programs, Total Registrations, Attendance Rates), visual charts via Recharts, and quick actions.
- **Program Roster & Creator** (`/admin/programs`): Create, publish, close, and edit barangay programs with capacity limits.
- **Live Attendance Station** (`/admin/registrations`): Rapid check-in tool to mark registered residents present or absent with live tallies.
- **Resident Directory** (`/admin/residents`): Searchable roster of Lapasan residents organized by Purok.
- **Audit & Analytics** (`/admin/reports`): Participation statistics, capacity utilization metrics, and audit tables.

---

## Build Progress & Status

### Done

> Fully implemented, styled, and verified with clean builds on both platforms.

#### Resident Mobile App (Android)
- [x] Streamlined mobile app to 100% resident experience (removed all mobile admin clutter).
- [x] Splash screen with auto-route to resident home.
- [x] Login screen with one-tap "Fill Demo Resident" shortcut and notice pointing personnel to the Web Portal.
- [x] Register screen with full Purok selection.
- [x] Resident 5-tab bottom navigation (Home, Programs, My Programs, History, Profile).
- [x] Program detail screen with slot meter and confirmation dialogs.
- [x] Verified zero compile errors (`./gradlew assembleDebug` passed).

#### Barangay Personnel Portal (Web — `admin-web/`)
- [x] Next.js 16 + TypeScript + Tailwind CSS responsive web application.
- [x] Executive Dark Navy sidebar navigation with APILA Lapasan seal.
- [x] Analytics Dashboard with Recharts (monthly registration trends, category distribution, KPI counters).
- [x] Program management interface (catalog, details, slot utilization).
- [x] Attendance and registration management tables.
- [x] Verified zero compile errors (`npm run build` passed with all static/dynamic routes).

---

### In Progress

- [ ] **Unified Live Backend**: Connecting both platforms to a shared Cloud Firestore database.
- [ ] **Cross-Platform Auth**: Firebase Authentication sync between Android app and Web Portal.

---

### Left to Build

- [ ] **QR Code Passes & Scanner**: Scannable QR code on mobile REG-PASS and web camera check-in scanner.
- [ ] **Export to PDF/Excel**: One-click civic audit reports export from the web dashboard.
- [ ] **Push Notification Broadcaster**: Web interface to send FCM notifications to all resident devices.
- [ ] **Firestore Security Rules**: Role-based access control protecting resident data from unauthorized modification.

---

## Completion Matrix by Layer

| Component | Completion | Status |
|---|:---:|---|
| **Resident Mobile App (UI & Flows)** | **95%** | Streamlined & verified |
| **Personnel Web Portal (UI & Dashboards)** | **90%** | Full dashboard, roster & reports |
| **Shared Civic Design System** | **100%** | Warm palette, zero emojis, clean vectors |
| **Live Backend (Firestore / Auth)** | **15%** | Scaffolded; currently runs on shared mock datasets |
| **Automated Verification & CI/CD** | **10%** | Local gradle & next build scripts verified |
| **OVERALL PROJECT** | **~60%** | Dual-platform frontend complete |

---

## Tech Stack

| Layer | Resident Mobile App | Personnel Web Portal |
|---|---|---|
| **Platform** | Native Android (Min SDK 26, Target SDK 34) | Web (Desktop-first Responsive) |
| **Language** | Kotlin | TypeScript |
| **Framework / UI** | XML Layouts + Material Design 3 | Next.js 16 + Tailwind CSS |
| **Icons** | Android Vector Drawables (Zero Emojis) | Lucide React (Zero Emojis) |
| **Data Visualization**| Native Progress Meters | Recharts Data Charts |
| **Architecture** | MVVM + Repository Pattern | App Router + Server/Client Components |
| **Planned Backend** | Firebase Auth + Cloud Firestore | Firebase Auth + Cloud Firestore |

---

## Demo Accounts

| Role | Target Platform | Email | Password |
|---|---|---|---|
| **Resident** | Mobile App | `resident@lapasan.gov.ph` | `123456` |
| **Barangay Personnel** | Web Portal | `admin@lapasan.gov.ph` | `123456` |

---

## Repository Structure

```text
apila/
├── app/                        # Resident Android Mobile App (Kotlin)
│   ├── src/main/java/          # ViewModels, Repositories, Resident UI
│   └── src/main/res/           # Material 3 XML layouts, drawables, civic colors
├── admin-web/                  # Barangay Personnel Web Portal (Next.js)
│   ├── app/
│   │   ├── admin/              # Dashboard, Programs, Registrations, Reports, Residents
│   │   └── ...                 # Shared public and resident web previews
│   ├── components/             # Reusable UI cards, tables, charts, navigation
│   └── lib/                    # Mock datasets and utilities
├── build.gradle.kts            # Android build configuration
└── README.md                   # Project documentation & roadmap
```

---

## Getting Started

### Running the Resident Android App

```bash
# Open scratch/apila in Android Studio, or build via command line:
cd /Users/mac/.gemini/antigravity/scratch/apila
export JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home"
./gradlew assembleDebug

# Install on connected emulator or physical device:
adb install app/build/outputs/apk/debug/app-debug.apk
```

### Running the Personnel Web Portal

```bash
cd /Users/mac/.gemini/antigravity/scratch/apila/admin-web

# Start development server on http://localhost:3000
npm run dev
```

Navigate to:
- **Admin Dashboard**: `http://localhost:3000/admin/dashboard`
- **Program Management**: `http://localhost:3000/admin/programs`
- **Registrations & Attendance**: `http://localhost:3000/admin/registrations`
- **Audit Reports**: `http://localhost:3000/admin/reports`

---

<p align="center">
  Built with civic pride for <strong>Barangay Lapasan, Cagayan de Oro City</strong>
</p>
