# APILA — Barangay Lapasan Program & Participation Management System

<p align="center">
  <strong>A native Android app for Barangay Lapasan, Cagayan de Oro City</strong><br/>
  Helping residents discover &amp; register for community programs — and giving barangay officials the tools to manage them end-to-end.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Platform-Android-3DDC84?logo=android&logoColor=white"/>
  <img src="https://img.shields.io/badge/Language-Kotlin-7F52FF?logo=kotlin&logoColor=white"/>
  <img src="https://img.shields.io/badge/Min%20SDK-26-blue"/>
  <img src="https://img.shields.io/badge/Target%20SDK-34-blue"/>
  <img src="https://img.shields.io/badge/Firebase-Scaffolded-FFCA28?logo=firebase&logoColor=black"/>
  <img src="https://img.shields.io/badge/Overall-~35%25 Complete-F45113"/>
</p>

> **Honest Status**: APILA is currently a high-fidelity UI prototype. All screens are built and styled, but the app runs entirely on hardcoded mock data. There is no live backend yet. Firebase Auth, Firestore, and FCM are imported but not wired to real data.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Build Progress](#build-progress)
   - [Done](#done)
   - [In Progress](#in-progress)
   - [Left to Build](#left-to-build)
3. [Completion by Layer](#completion-by-layer)
4. [Tech Stack](#tech-stack)
5. [Demo Accounts](#demo-accounts)
6. [Project Structure](#project-structure)
7. [Firebase Setup](#firebase-setup)
8. [Getting Started](#getting-started)

---

## Project Overview

**APILA** streamlines civic participation for Barangay Lapasan by providing:

- A **Resident Portal** — discover programs, register, track your passes, and view your participation history.
- A **Personnel / Admin Portal** — manage programs end-to-end, record attendance, broadcast announcements, and view analytics.

The app currently runs on a **mock offline data layer** pre-seeded with realistic Barangay Lapasan programs and residents. Real Firebase integration is the next major milestone.

---

## Build Progress

### Done

> UI screens and frontend logic — fully built, styled, and verified on-device against mock data.

#### Auth & Onboarding
- [x] Splash screen with APILA branding and auto-route (resident vs admin)
- [x] Login screen — email/password fields, "Demo Resident" & "Demo Admin" quick-fill buttons
- [x] Register screen — new account form with Purok selector
- [x] `AuthViewModel` + `AuthRepository` structure (wired to mock, Firebase Auth not yet live)

#### Resident Portal
- [x] `ResidentMainActivity` with 5-tab bottom navigation
- [x] **Home** — hero banner, quick stat cards, Upcoming Initiatives list, Advisories section
- [x] **Programs** — catalog with search, category filter chips, "Open Slots Only" toggle
- [x] **Program Detail** — slot meter, Register / Cancel Registration dialogs
- [x] **My Programs** — digital REG-PASS entry pass cards
- [x] **History** — participation log with Attended / Absent / Cancelled badges
- [x] **Notifications** — announcements list
- [x] **Profile** — resident info display, role switcher to Admin portal

#### Admin / Personnel Portal
- [x] `AdminMainActivity` — dark charcoal header, KPI dashboard
- [x] **Admin Dashboard** — 4 KPI stat cards, Quick Action buttons, program roster
- [x] **Admin Programs** — program list, search, filter chips, publish/unpublish toggle
- [x] **Admin Create/Edit Program** — full form (title, description, category, date, time, venue, capacity)
- [x] **Admin Participants** — registered residents list per program
- [x] **Admin Attendance** — one-tap Present / Absent check-in with tally counters
- [x] **Admin Announcements** — published notices list
- [x] **Admin Reports** — program performance card, per-program capacity meter rows

#### Design System
- [x] Warm civic palette: cream `#FFF9F3`, brand orange `#F45113`, charcoal navy `#0F172A`
- [x] Material Design 3 theme, 29 XML layout files, custom drawables
- [x] Zero-emoji policy across all source files

---

### In Progress

- [ ] **Firebase Auth** — login/register against real Firebase (currently mock-only)
- [ ] **Profile edit flow** — residents can view but not yet edit their info

---

### Left to Build

#### Backend (Highest Priority)
- [ ] **Firestore database wiring** — replace all mock repositories with real Firestore reads/writes
  - Programs collection (CRUD)
  - Registrations collection (register, cancel, fetch per user)
  - Users collection (profile data)
  - Announcements collection
- [ ] **Firestore security rules** — role-based read/write rules (resident vs admin)
- [ ] **Firebase Auth** — live email/password login and registration
- [ ] **Cloud Functions** (optional) — server-side registration validation, slot enforcement

#### Push Notifications
- [ ] FCM deep links — tapping notification navigates to the relevant Program Detail
- [ ] In-app notification badge counter on bottom nav tab
- [ ] Admin push broadcaster — send FCM topic messages to all residents

#### Resident Features
- [ ] Offline registration queue — queue requests when offline, sync on reconnect
- [ ] QR code pass — generate scannable QR from REG-PASS card for physical check-in
- [ ] Search history with local cache (Room / DataStore)

#### Admin Features
- [ ] Attendance QR scanner — camera scan to mark resident present
- [ ] Export Reports to PDF / CSV
- [ ] Program banner image upload (Firebase Storage)
- [ ] Program archival (soft-delete completed programs)
- [ ] Admin Create Announcement — finalize post-submission navigation

#### Platform & Infrastructure
- [ ] **Room Database** — local persistence for offline-first caching
- [ ] **Unit tests** — ViewModel & Repository with JUnit + MockK
- [ ] **UI tests** — Espresso suite for core resident and admin flows
- [ ] **GitHub Actions CI/CD** — automated build + test on every push
- [ ] **Signed release APK** — keystore setup and `signingConfigs` in Gradle

---

## Completion by Layer

| Layer | Completion | Notes |
|---|:---:|---|
| UI Screens & Layouts | **72%** | All major screens built; polish & edge cases remain |
| Frontend Logic (ViewModels, Adapters) | **65%** | Works against mock data only |
| Firebase Authentication | **20%** | Imported; real login/register not wired |
| Firestore Backend | **5%** | Repository classes exist; no real queries |
| Push Notifications (FCM) | **10%** | Service registered; no real messages fire |
| Offline / Local DB (Room) | **5%** | Mock layer exists; Room not started |
| Testing (Unit + UI) | **0%** | Not started |
| CI/CD & Release Build | **0%** | Not started |
| **TRUE OVERALL** | **~35%** | High-fidelity UI prototype, no live backend |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Language | Kotlin |
| Min / Target SDK | 26 / 34 |
| UI | XML Layouts + Material Design 3 |
| Architecture | MVVM + Repository Pattern |
| Async | Kotlin Coroutines + LiveData |
| View Binding | ViewBinding |
| Auth | Firebase Authentication (scaffolded) |
| Database | Cloud Firestore (scaffolded) + offline mock |
| Local Cache | Room (planned) |
| Push Notifications | Firebase Cloud Messaging (scaffolded) |
| Build System | Gradle (Kotlin DSL `.kts`) |

---

## Demo Accounts

The app runs on mock data out of the box. Use these credentials on the Login screen:

| Role | Email | Password |
|---|---|---|
| **Resident** | `resident@lapasan.gov.ph` | `123456` |
| **Barangay Admin / Personnel** | `admin@lapasan.gov.ph` | `123456` |

> Switch portals anytime from **Profile → Open Barangay Personnel Portal**.

---

## Project Structure

```
app/src/main/
├── AndroidManifest.xml
├── java/com/lapasan/apila/
│   ├── data/
│   │   ├── model/             # User, Program, Registration, Announcement, DashboardStats
│   │   └── repository/        # AuthRepository, ProgramRepository, RegistrationRepository,
│   │                          # AnnouncementRepository (mock-only, Firestore pending)
│   ├── service/               # ApilaFirebaseMessagingService (FCM scaffolded)
│   ├── ui/
│   │   ├── auth/              # SplashActivity, LoginActivity, RegisterActivity, AuthViewModel
│   │   ├── common/            # All RecyclerView adapters
│   │   ├── resident/          # ResidentMainActivity + all resident fragments & ViewModel
│   │   └── admin/             # AdminMainActivity + all admin fragments, activities & ViewModel
│   └── util/                  # Resource<T> sealed class
└── res/
    ├── layout/                # 29 XML layout files
    ├── menu/                  # Bottom nav menus
    ├── drawable/              # Custom shapes, vectors, illustrations
    ├── color/                 # Nav item color state lists
    └── values/                # colors.xml, strings.xml, themes.xml, dimens.xml
```

---

## Firebase Setup

The app works offline without any Firebase setup. To connect a real backend:

1. Open [Firebase Console](https://console.firebase.google.com/) → Create project (e.g. `apila-lapasan`)
2. Add Android app with package name `com.lapasan.apila`
3. Download `google-services.json` → place it in `app/`
4. Enable **Email/Password** in Firebase Authentication
5. Create a **Cloud Firestore** database (test mode for development)
6. Rebuild the project — Gradle auto-detects `google-services.json`
7. Replace mock return values in each `Repository` class with real Firestore calls

> **`google-services.json` is in `.gitignore` — never commit it.**

---

## Getting Started

### Prerequisites
- Android Studio Hedgehog (2023.1.1) or later
- JDK 17
- Android SDK 34
- Android emulator (Pixel 8 API 34 recommended) or physical device (Android 8.0+)

### Run locally

```bash
git clone https://github.com/kurt7275/apila.git
cd apila
# Open in Android Studio and click Run, or:
./gradlew assembleDebug
adb install app/build/outputs/apk/debug/app-debug.apk
```

---

<p align="center">
  Built for <strong>Barangay Lapasan, Cagayan de Oro City</strong><br/>
  <em>Civic technology for community empowerment</em>
</p>
