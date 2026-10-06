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
  <img src="https://img.shields.io/badge/Firebase-Enabled-FFCA28?logo=firebase&logoColor=black"/>
  <img src="https://img.shields.io/badge/Completion-72%25-F45113"/>
</p>

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Build Progress](#build-progress)
   - [Done](#done)
   - [In Progress](#in-progress)
   - [Left to Build](#left-to-build)
3. [Feature Completion by Module](#feature-completion-by-module)
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

The app ships with a resilient **offline mock data layer** pre-seeded with realistic Barangay Lapasan programs, residents, and statistics — so it works fully out of the box without a live Firebase project.

---

## Build Progress

> **Overall Completion: ~72%**

### Done

> These screens, features, and backend layers are fully built, styled, and verified on-device.

#### Auth & Onboarding
- [x] Splash screen with APILA branding & auto-route (resident vs admin)
- [x] Login screen — email/password, "Demo Resident" & "Demo Admin" quick-fill buttons
- [x] Register screen — new resident account creation with Purok selector
- [x] `AuthViewModel` + `AuthRepository` (Firebase Auth + offline mock fallback)

#### Resident Portal
- [x] `ResidentMainActivity` with 5-tab bottom navigation (Home, Programs, My Programs, History, Notifications, Profile)
- [x] **Home tab** — hero spotlight banner, "Explore Programs" & "My Passes" CTAs, Active Passes card, Open Programs card, Upcoming Initiatives list, Advisories section
- [x] **Programs tab** — full program catalog with search bar, category filter chips (Health, Youth, Livelihood, Senior, Disaster, Education), "Open Slots Only" toggle, RecyclerView with `ProgramAdapter`
- [x] **Program Detail screen** — full event info (date, time, venue, description), visual slot meter, Register / Cancel Registration with confirmation dialogs
- [x] **My Programs tab** — digital REG-PASS entry pass cards with cancel capability (`RegistrationAdapter`)
- [x] **History tab** — permanent participation log with Attended / Absent / Cancelled status badges (`HistoryAdapter`)
- [x] **Notifications tab** — official community announcements list (`AnnouncementAdapter`)
- [x] **Profile tab** — resident info (name, phone, Purok, address, role), "Open Barangay Personnel Portal" role switcher

#### Admin / Personnel Portal
- [x] `AdminMainActivity` — dark charcoal header, APILA pin emblem, "Personnel Dashboard" title, "Resident View" pill switcher
- [x] Custom `BottomNavigationView` color state list (`#F45113` active, `#94A3B8` default)
- [x] **Admin Dashboard tab** — "CIVIC OPERATIONS" tag, Live Records pill, 4 KPI stat cards (Programs / Active / Enrolled / Attendance), Quick Action buttons, Program Management roster
- [x] **Admin Programs tab** — program list with search, filter chips, `AdminProgramAdapter`, publish/unpublish toggle
- [x] **Admin Create/Edit Program screen** — full form (title, description, category, date, time, venue, capacity), save/publish
- [x] **Admin Participants screen** — registered residents list per program with Purok, phone, registration status (`ParticipantAdapter`)
- [x] **Admin Attendance screen** — live one-tap check-in (Present / Absent) with tally counters (`AttendanceAdapter`)
- [x] **Admin Announcements tab** — list of published notices, create new announcement
- [x] **Admin Reports tab** — "CIVIC AUDIT & ANALYTICS" badge, Overall Program Performance card (capacity, registered, utilization %, attendance rate %), per-program capacity meter rows (`ReportProgramAdapter`)
- [x] `AdminViewModel` with dynamic aggregate stat computation

#### Data Layer
- [x] `User`, `Program`, `Registration`, `Announcement`, `DashboardStats` data models
- [x] `AuthRepository`, `ProgramRepository`, `RegistrationRepository`, `AnnouncementRepository`
- [x] Offline mock layer seeded with realistic Barangay Lapasan data
- [x] `Resource<T>` sealed state wrapper (Loading / Success / Error)
- [x] `ApilaFirebaseMessagingService` — FCM push notification handler

#### Design System
- [x] Warm civic palette: cream `#FFF9F3`, brand orange `#F45113`, charcoal navy `#0F172A`, border `#ECE7DF`
- [x] Material 3 theme with overridden secondary container (no purple active indicator tint)
- [x] Zero-emoji policy across all XML, drawables, and Kotlin source files
- [x] 29 XML layout files + custom drawables

---

### In Progress

> These modules exist but need refinement, deeper integration, or additional polish.

- [ ] **Live Firebase integration** — offline mock works perfectly; switching to Firestore requires `google-services.json` and security rules
- [ ] **Profile tab edit flow** — resident can view info but cannot yet edit name/phone/purok in-app (`EditProfileActivity` planned)
- [ ] **Admin Create Announcement** — `AdminCreateAnnouncementActivity` exists but post-submission navigation needs finalization

---

### Left to Build

> Planned features not yet started.

#### Resident Portal
- [ ] Push notification deep links to Program Detail screen
- [ ] In-app notification badge counter on bottom nav tab
- [ ] Program search history with local cache (Room / DataStore)
- [ ] Offline registration queue (sync when back online)
- [ ] QR code pass — scannable QR from REG-PASS card for physical check-in

#### Admin Portal
- [ ] Attendance QR scanner — camera-based QR scan to mark resident present
- [ ] Export Reports to PDF / CSV
- [ ] Program banner image upload via Firebase Storage
- [ ] Push notification broadcaster — FCM topic-based push to all residents
- [ ] Program archival (soft-delete completed programs)

#### Platform & Infrastructure
- [ ] Room Database — local persistence for offline-first caching
- [ ] Firestore security rules file (production-ready `.rules`)
- [ ] Unit tests — ViewModel & Repository with JUnit + MockK
- [ ] UI tests — Espresso test suite for core flows
- [ ] GitHub Actions CI/CD — automated build + test on every push
- [ ] Signed release APK — keystore + `signingConfigs` in Gradle

---

## Feature Completion by Module

| Module | Completion | Status |
|---|:---:|---|
| Auth & Onboarding | **100%** | Done |
| Resident Home | **100%** | Done |
| Resident Programs Catalog | **95%** | Done |
| Resident Program Detail | **95%** | Done (QR pass pending) |
| Resident My Programs (Passes) | **90%** | Done |
| Resident History | **100%** | Done |
| Resident Notifications | **85%** | Done (badge counter pending) |
| Resident Profile | **70%** | Edit profile flow pending |
| Admin Dashboard | **100%** | Done |
| Admin Programs Management | **95%** | Done |
| Admin Participants View | **95%** | Done |
| Admin Attendance Recording | **90%** | Done (QR scanner pending) |
| Admin Announcements | **80%** | Post-submit nav needs finalization |
| Admin Reports & Analytics | **90%** | Done (PDF export pending) |
| Data Models & Repositories | **90%** | Live Firebase wiring pending |
| Design System & Theming | **100%** | Done |
| Push Notifications (FCM) | **40%** | Service registered; deep links pending |
| Offline / Room Database | **10%** | Mock layer exists; Room not started |
| Testing (Unit + UI) | **0%** | Not started |
| CI/CD & Release Build | **0%** | Not started |
| **OVERALL** | **~72%** | Active development |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Language | Kotlin |
| Min / Target SDK | 26 / 34 |
| UI | XML Layouts + Material Design 3 |
| Architecture | MVVM + Repository Pattern |
| Async | Kotlin Coroutines + LiveData |
| View Binding | ViewBinding (enabled) |
| Auth | Firebase Authentication |
| Database | Cloud Firestore + offline mock |
| Push Notifications | Firebase Cloud Messaging (FCM) |
| Build System | Gradle (Kotlin DSL `.kts`) |

---

## Demo Accounts

For instant testing without a live Firebase project, use the quick-fill buttons on the Login screen or enter:

| Role | Email | Password |
|---|---|---|
| **Resident** | `resident@lapasan.gov.ph` | `123456` |
| **Barangay Admin / Personnel** | `admin@lapasan.gov.ph` | `123456` |

> You can also register a new account from the Sign Up screen, or switch portals from **Profile → Open Barangay Personnel Portal**.

---

## Project Structure

```
app/src/main/
├── AndroidManifest.xml
├── java/com/lapasan/apila/
│   ├── data/
│   │   ├── model/             # User, Program, Registration, Announcement, DashboardStats
│   │   └── repository/        # AuthRepository, ProgramRepository, RegistrationRepository,
│   │                          # AnnouncementRepository
│   ├── service/               # ApilaFirebaseMessagingService (FCM)
│   ├── ui/
│   │   ├── auth/              # SplashActivity, LoginActivity, RegisterActivity, AuthViewModel
│   │   ├── common/            # ProgramAdapter, RegistrationAdapter, HistoryAdapter,
│   │   │                      # AttendanceAdapter, ParticipantAdapter, AnnouncementAdapter,
│   │   │                      # AdminProgramAdapter, ReportProgramAdapter
│   │   ├── resident/          # ResidentMainActivity, HomeFragment, ProgramsFragment,
│   │   │                      # ProgramDetailActivity, MyProgramsFragment, HistoryFragment,
│   │   │                      # NotificationsFragment, ProfileFragment, ResidentViewModel
│   │   └── admin/             # AdminMainActivity, AdminDashboardFragment, AdminProgramsFragment,
│   │                          # AdminCreateEditProgramActivity, AdminParticipantsActivity,
│   │                          # AdminAttendanceActivity, AdminAnnouncementsFragment,
│   │                          # AdminCreateAnnouncementActivity, AdminReportsFragment,
│   │                          # AdminViewModel
│   └── util/                  # Resource<T> sealed class
└── res/
    ├── layout/                # 29 XML layout files
    ├── menu/                  # Bottom nav menus (resident + admin)
    ├── drawable/              # Custom backgrounds, shapes, vectors
    ├── color/                 # nav_admin_item_color.xml, nav_resident_item_color.xml
    └── values/                # colors.xml, strings.xml, themes.xml, dimens.xml
```

---

## Firebase Setup

The app runs fully offline out of the box. To connect a live Firebase backend:

1. Open [Firebase Console](https://console.firebase.google.com/) → Create project (e.g. `apila-lapasan`)
2. Add Android app with package name `com.lapasan.apila`
3. Download `google-services.json` → place it in `app/`
4. Enable **Email/Password** in Firebase Authentication
5. Create a **Cloud Firestore** database (test mode for development)
6. Rebuild the project — Gradle auto-detects `google-services.json`

> **Note:** `google-services.json` is listed in `.gitignore` and must never be committed to version control.

---

## Getting Started

### Prerequisites
- Android Studio Hedgehog (2023.1.1) or later
- JDK 17
- Android SDK 34
- Android emulator (Pixel 8 API 34 recommended) or physical device running Android 8.0+

### Run locally

```bash
git clone https://github.com/YOUR_USERNAME/apila.git
cd apila
# Open in Android Studio and click Run, or build via CLI:
./gradlew assembleDebug
adb install app/build/outputs/apk/debug/app-debug.apk
```

---

<p align="center">
  Built for <strong>Barangay Lapasan, Cagayan de Oro City</strong><br/>
  <em>Civic technology for community empowerment</em>
</p>
