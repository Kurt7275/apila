# COLLEGE OF INFORMATION TECHNOLOGY
## LICEO DE CAGAYAN UNIVERSITY
### Cagayan de Oro City

---

# DEVELOPMENT OF APILA: A HYBRID MOBILE AND WEB-BASED BARANGAY COMMUNITY PROGRAM REGISTRATION AND PARTICIPATION MANAGEMENT SYSTEM FOR BARANGAY LAPASAN, CAGAYAN DE ORO CITY

A Capstone Project Presented to the  
Faculty of the College of Information Technology  
Liceo de Cagayan University  
Cagayan de Oro City  

In Partial Fulfillment of the Requirements for the Degree  
**Bachelor of Science in Information Technology**

**Proponents:**  
KURT BAUTISTA  
SEAN RA  
RAIN BACABIS  
RALPH TEODORA  
VINCE TAN  
CHARLES NAVAREZ  
KYLE GONZALES  

**JUNE 2026**

---

## 1. INTRODUCTION AND PROBLEM STATEMENT

Barangay community initiatives play an essential role in local governance, public health, disaster preparedness, environmental preservation, and social welfare. In Barangay Lapasan—one of the largest and most populous urban barangays in Cagayan de Oro City—the local administration routinely organizes civic programs, health outreach missions, youth athletic leagues, TESDA livelihood trainings, disaster-risk drills, and community clean-up drives.

Despite the abundance of these initiatives, citizen participation and administrative coordination continue to suffer from operational bottlenecks:
1. **Fragmented and Ephemeral Communication:** Program announcements are typically broadcasted via printed flyers, physical bulletin boards, or informal social media posts that are easily buried in public feeds. Residents often discover opportunities only after quotas are filled or events have passed.
2. **Manual and Error-Prone Registration:** Registration frequently requires physical visits to the barangay hall or handwritten log sheets at Purok centers. This process results in duplicated entries, lost records, incomplete participant demographics, and difficulty in verifying resident bona fide status.
3. **Absence of Unified Tracking and Attendance Verification:** Barangay personnel lack an integrated tool to monitor real-time quotas, issue validated entry credentials, track actual attendance during program execution, or evaluate demographic turnout across the different puroks of Lapasan.

To resolve these challenges, **APILA** is developed as a synchronized, cross-platform system designed specifically for the operational setting of Barangay Lapasan, Cagayan de Oro City. The system is architected into two specialized client applications linked by a real-time cloud data pipeline:
- **A Native Android Mobile Application** dedicated to Lapasan residents for discovering community programs, tracking live schedules via countdowns, submitting one-tap applications, securing digital community passes with dynamic QR codes, selecting their designated Purok, and receiving official barangay advisories.
- **A Web-Based Administrative Management Portal** dedicated to authorized barangay officials and staff for publishing initiatives, approving participant quotas, conducting attendance verification via a live camera QR scanner, managing resident verification records, generating real-time analytical reports, and broadcasting high-priority public advisories.

The implementation of APILA eliminates scattered paperwork, centralizes community records, provides real-time transparency, and fosters higher civic engagement throughout the community.

---

## 2. OBJECTIVES OF THE PROJECT

### General Objective
To design, develop, and implement **APILA**, a hybrid native mobile and web-based community program registration, attendance, and participation management system for Barangay Lapasan, Cagayan de Oro City, powered by a centralized real-time cloud database.

### Specific Objectives
1. **Design and develop a Native Android Application for Residents** featuring:
   - Secure resident sign-up and authentication with an explicit 10-Purok dropdown selector and address attribution.
   - An interactive program catalog with keyword search, category filtering, and capacity status.
   - Real-time countdown timers for upcoming civic events.
   - One-tap program registration and personal **Digital Community Passes** equipped with dynamic scannable **QR codes** and status indicators (*Pending*, *Approved*, *Rejected*).
   - An advisory bulletin that receives official broadcast notices in real time.
2. **Design and develop a Web-Based Administrative Portal for Barangay Officials** featuring:
   - A centralized KPI dashboard summarizing active initiatives, pending registrations, verified residents, and attendance rates.
   - End-to-end program lifecycle management (creation, quota allocation, officer-in-charge assignment, updating, and archiving).
   - Participant verification workflow to review resident applications, validate quotas, and update registration statuses.
   - Digital attendance tracking station featuring a **live camera QR scanner** with real-time verification and audio feedback.
   - An advisory management center capable of broadcasting categorized announcements with designated priority levels (*Normal*, *Important*, *Urgent*).
   - Resident management with verification toggles to confirm residency within Barangay Lapasan.
   - Real-time statistical and demographic reporting across various Puroks and civic sectors.
3. **Implement a Unified Cloud Backend Architecture** using Google Firebase to guarantee instantaneous two-way data synchronization between the resident mobile app and the administrative web portal.
4. **Enforce Role-Based Access Control (RBAC) and Security Protocols** ensuring strict separation between administrative privileges and resident access.
5. **Evaluate the System** across the dimensions of functionality, usability, performance, reliability, and security in compliance with ISO/IEC 25010 Software Quality Standards.

---

## 3. TARGET USERS AND ACCESS ROLES

| User Role | Client Interface | Primary Responsibilities & Permissions |
| :--- | :--- | :--- |
| **Barangay Resident** | Native Android Mobile App | • Create and manage personal resident profile (with explicit Purok selection).<br>• Explore programs, search, and filter by civic sector.<br>• Register for programs and view live quota availability.<br>• View digital program passes with scannable QR codes.<br>• Access official barangay advisories and emergency notifications. |
| **Program Officer / Barangay Staff** | Web-Based Admin Portal | • Create, edit, and manage civic program listings.<br>• Review, approve, or reject participant registrations in real time.<br>• Record on-site attendance using camera QR scanner or manual checklist.<br>• Publish general program announcements and reminders. |
| **Barangay Administrator / IT Admin** | Web-Based Admin Portal | • Full administrative oversight of the portal.<br>• Verify official resident accounts.<br>• Issue urgent broadcast alerts and calamity warnings.<br>• View analytical and demographic reports across Puroks.<br>• Manage system audit trails and platform security configurations. |

---

## 4. SYSTEM ARCHITECTURE AND TECHNICAL SPECIFICATIONS

APILA employs a **Cloud-Synchronized Client-Server Architecture** utilizing modern native mobile development, reactive web frameworks, and Serverless NoSQL cloud infrastructure:

```
┌────────────────────────────────┐         ┌────────────────────────────────┐
│   RESIDENT CLIENT (MOBILE)     │         │   ADMINISTRATIVE PORTAL (WEB)  │
│  Native Android App (Kotlin)   │         │    Next.js / TypeScript App    │
│  MVVM + Coroutines + ViewBind  │         │ Tailwind CSS + Turbopack SSR/CSR│
│  ZXing QR Matrix Generator     │         │ Web Camera QR Barcode Scanner   │
└───────────────┬────────────────┘         └────────────────┬───────────────┘
                │                                           │
                │  HTTPS / WebSocket Real-Time Listeners    │
                ▼                                           ▼
┌───────────────────────────────────────────────────────────────────────────┐
│                    GOOGLE FIREBASE CLOUD INFRASTRUCTURE                   │
│                                                                           │
│   • Firebase Authentication : Identity management (JWT token auth)        │
│   • Cloud Firestore         : Real-time NoSQL document-based database     │
│   • Firebase Cloud Storage  : Asset, poster, and document repository      │
│   • Security Rules Engine   : Role-based document read/write authorization │
└───────────────────────────────────────────────────────────────────────────┘
```

### Technical Stack Specifications:
- **Mobile Platform (Resident App):**
  - **Language & Runtime:** Kotlin (JVM Target 17), Android SDK (Min SDK 26, Target SDK 34).
  - **Architecture:** Model-View-ViewModel (MVVM) with Android Jetpack (LiveData, ViewModel, Lifecycle).
  - **Concurrency:** Kotlin Coroutines (`Dispatchers.IO`, `Dispatchers.Main`) with asynchronous task handling.
  - **UI Toolkit:** Material Design Components (MDC), Custom Vector Drawables, ConstraintLayout, SwipeRefreshLayout, and ViewBinding.
  - **QR Code Matrix:** Google ZXing Core engine for on-device QR bitmap rendering.
- **Web Platform (Administrative Portal):**
  - **Framework:** Next.js 16 (App Router architecture with Turbopack).
  - **Language:** TypeScript 5.x.
  - **Styling:** Tailwind CSS with Lucide React iconography.
  - **Layout Model:** Fixed sticky dual-tier navigation with independent internal scroll containers.
  - **QR Scanner:** Native Browser BarcodeDetector API & Web Audio API synthesizer for instant scan chimes.
- **Cloud Backend & Services:**
  - **Database:** Google Cloud Firestore (Document/Collection NoSQL structure with live snapshot listeners).
  - **Authentication:** Firebase Auth with secure token exchange and client fallback validation.
  - **Storage:** Google Cloud Storage for digital media, banners, and circulars.

---

## 5. SYSTEM FEATURES AND FUNCTIONALITIES

### A. Resident Mobile Application (Android)
1. **Onboarding & Cultural Branding:** An introductory experience showcasing Barangay Lapasan’s coastal landscape and municipal identity, highlighting key system capabilities before registration.
2. **Account Registration & Authentication:** Secure resident registration capturing full name, email, contact number, and an **explicit 10-Purok selector dropdown** (*Kolambog, Lapasan Proper, San Pedro, San Juan, Sta. Cruz, Riverside, Bitan-ag, Agora Area, Highway Zone, Coastal Zone*) with validation to guarantee clean demographic attribution.
3. **Personalized Resident Home Dashboard:**
   - Cultural Cebuano greeting (*"Maayong Adlaw"*) tied to the resident's profile and Purok designation.
   - Interactive Bento summary tiles displaying active passes and available community programs.
   - Dynamic countdown card calculating days, hours, minutes, and seconds until the next registered or featured civic event.
4. **Civic Program Directory & Exploration:**
   - Multi-sector filtering (Health & Wellness, Youth & Sports, Livelihood & Skills, Disaster & Safety, Senior Citizens, Education).
   - Real-time search engine with instant query matching.
   - Live capacity indicator displaying available slots versus total enrolled participants.
5. **Registration & Digital Community Pass System (with Dynamic QR Codes):**
   - Single-tap application for eligible open programs.
   - Automated digital boarding pass generation tracking application states (*Pending*, *Approved*, *Rejected*).
   - **Embedded Scannable QR Code Matrix**: Renders a sharp QR code holding the registration ID. Approved passes display active QR codes ready for venue gate scanning, while pending passes display a dimmed watermark.
6. **Official Advisories & Notification Center:** Live feed of barangay bulletins, disaster mitigation advisories, and scheduling adjustments pushed directly from the barangay council with priority badges (*Urgent* vs. *Normal*).
7. **Resident Profile Management:** Resident identity card displaying verification status, registered phone, and assigned Purok.

### B. Barangay Administration Portal (Web)
1. **Executive KPI Dashboard:** Real-time metrics tracking total registered residents, active civic programs, pending applications, and community attendance rates, supplemented by a recent registration stream and quick-broadcast launcher.
2. **Program Management Lifecycle:** Complete CRUD module allowing administrators to publish initiatives, designate event categories, establish participant caps, assign venue locations, set event dates, assign presiding officers, and toggle operational statuses (*Active*, *Upcoming*, *Completed*, *Cancelled*).
3. **Participant Registration Review & Approval Workflow:** Real-time roster module displaying all resident applications with one-click status transitions (*Approved* or *Rejected*). Approvals immediately increment program enrollment counters and activate the resident's mobile QR pass.
4. **Attendance Tracking & Live Camera QR Scanner Station:** 
   - Interactive camera scanner modal utilizing device cameras to scan resident QR codes at venue doors.
   - Instant audio check-in chime and visual match confirmation (*Name, Purok, Registration ID*).
   - Automatic attendance recording in Firestore marking participants as **"PRESENT"**.
   - Manual override roster checklist, attendance progress meters, and direct CSV / print exports.
5. **Advisory & Emergency Broadcast Management:** Dedicated communication dispatch center allowing officials to draft announcements with structured priority ratings (*Normal*, *Important*, *Urgent*), immediate category tags, and broadcast timestamps.
6. **Resident Registry & Verification Management:** Centralized roster of registered citizens allowing officials to verify resident authenticity, view contact numbers, and monitor neighborhood distribution across Puroks 1 through 10.
7. **Analytical Reports & Demographic Visualizations:** Dynamic data synthesis calculating program completion rates, sector distributions, and attendance efficiency across all Lapasan puroks.
8. **System Audit Logs & Security Administration:** Immutable record tracking administrative actions, status updates, and session logins for institutional accountability.

---

## 6. DATABASE ARCHITECTURE (FIRESTORE NO-SQL SCHEMA)

APILA utilizes a high-performance, denormalized NoSQL schema organized into dedicated Cloud Firestore collections:

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

### Detailed Collection Specifications:

#### 1. `programs` Collection
| Field Name | Data Type | Description |
| :--- | :--- | :--- |
| `id` | String | Unique Program Identifier |
| `title` | String | Official Title of the Community Program |
| `category` | String | Sector (Health, Sports, Livelihood, Calamity, etc.) |
| `description` | String | Detailed objectives, requirements, and instructions |
| `location` | String | Venue (e.g., Lapasan Covered Court, Coastal Zone) |
| `schedule` | String | Human-readable schedule / Date & Time |
| `slots` | Number | Maximum participant capacity |
| `enrolledCount`| Number | Current number of approved resident registrations |
| `status` | String | Operational status (`Active`, `Upcoming`, `Completed`, `Cancelled`) |
| `officer` | String | Barangay Official or Committee Head in-charge |

#### 2. `registrations` Collection
| Field Name | Data Type | Description |
| :--- | :--- | :--- |
| `id` | String | Unique Registration / Pass Identifier (encoded in QR code) |
| `userId` / `residentId`| String | Reference UID of the registered resident |
| `residentName`| String | Complete name of the applicant |
| `programId` | String | Reference ID of the targeted program |
| `programTitle`| String | Snapshot title of the program |
| `purok` | String | Purok of residence within Barangay Lapasan |
| `phone` | String | Resident contact number |
| `status` | String | Approval state (`Pending`, `Approved`, `Rejected`) |
| `registeredAt`| Timestamp | Server timestamp when application was filed |

#### 3. `residents` Collection
| Field Name | Data Type | Description |
| :--- | :--- | :--- |
| `id` | String | Reference Firebase User UID |
| `name` | String | Full resident name |
| `email` | String | Registered electronic mail address |
| `phone` | String | Contact number |
| `purok` | String | Assigned Purok (e.g., Purok 2 - Lapasan Proper) |
| `address` | String | Complete residential street address |
| `isVerified` | Boolean | Administrative validation flag of bona fide residency |
| `createdAt` | Timestamp | Date of profile creation |

#### 4. `announcements` Collection
| Field Name | Data Type | Description |
| :--- | :--- | :--- |
| `id` | String | Unique Advisory Identifier |
| `title` | String | Headline of the advisory or circular |
| `message` | String | Complete message content |
| `category` | String | Sector tag (Health, Calamity, Sports, General) |
| `priority` | String | Urgency level (`Normal`, `Important`, `Urgent`) |
| `publishedBy` | String | Official or office responsible for publication |
| `createdAt` | Timestamp | Server publication timestamp |

---

## 7. USER INTERFACE AND EXPERIENCE (UI/UX) SPECIFICATIONS

### Mobile App (Resident Experience):
- **Visual Aesthetic:** Organic warm cream palette (`#FFF9F3`) accented by vibrant Philippine orange branding (`#F45113`), reflecting community warmth and civic vitality.
- **Micro-Interactions:** Pull-to-refresh swipe controls on all feeds, responsive category chips, active countdown timers, and capsule-shaped input fields with validation states.
- **Navigation Architecture:** A custom **Floating Dark-Navy Pill Bottom Navigation Bar** elevated above the viewport, offering one-thumb navigation between *Home*, *Programs*, *Passes*, *History*, *Alerts*, and *Profile*.

### Web Portal (Administrative Experience):
- **Layout Model:** A zero-bleed administrative dashboard structured with a **sticky, fixed-height sidebar** and independent scrolling workspaces, preventing disorienting full-page jumps during high-volume data entry.
- **Data Clarity:** High-contrast data tables, color-coded status badges, modal-driven program generators, live camera scanner modal with audio feedback, and direct CSV exporting for municipal reporting.

---

## 8. SECURITY AND DATA PROTECTION MEASURES

1. **Role-Based Security Rules (RBAC):** Cloud Firestore rules enforce authorization at the database level. Residents can only create registrations linked to their own verified UID and can only read public collections. Administrative mutations require authenticated administrative tokens.
2. **Credential Sanitization:** Sensitive credentials and service account files (`google-services.json`, private API keys) are strictly isolated from public source control via comprehensive `.gitignore` filtering.
3. **Client-Side Form Validation:** All mobile and web inputs undergo strict syntactic and length validation (e.g., email format verification, password confirmation constraints, phone number pattern checks, and mandatory Purok selection) before dispatch to cloud services.
4. **Compliance with Philippine Data Privacy Act of 2012 (RA 10173):** Personal identifiable information (contact numbers, physical addresses, and participation records) is restricted to authorized barangay personnel and utilized exclusively for legitimate public administration and emergency disaster response.

---

## 9. EXPECTED BENEFITS AND IMPACT

| Stakeholder | Key Quantifiable & Qualitative Benefits |
| :--- | :--- |
| **Residents of Barangay Lapasan** | • **Zero-Travel Registration:** Eliminates the financial and logistical burden of visiting the barangay hall simply to file program forms.<br>• **24/7 Information Access:** Immediate visibility into upcoming programs and official advisories.<br>• **Transparent Tracking:** Clear insight into application approvals via dynamic Digital Passes with QR codes. |
| **Barangay Officials & Program Staff** | • **Elimination of Paper Redundancy:** Replaces physical logbooks with searchable cloud records.<br>• **Automated Quota Control:** Prevents program oversubscription through real-time slot decrementing.<br>• **Rapid Attendance Gate Check-in:** Camera QR scanning takes less than 1 second per attendee, preventing long lines at venues.<br>• **Rapid Emergency Dispatch:** Instant dissemination of urgent weather alerts and barangay announcements. |
| **Barangay Local Government Unit (BLGU)** | • **Demographic Evidence for Policy:** Access to statistical reports illustrating which Puroks and sectors require more civic investment.<br>• **Modernized E-Governance Standing:** Serves as a benchmark for digital transformation across urban barangays in Cagayan de Oro City. |

---

## 10. CONCLUSION

The **APILA** system demonstrates a practical, modern, and culturally grounded approach to barangay governance in the digital era. By pairing a responsive, cloud-backed administrative web portal with an accessible, high-performance native Android application for residents, APILA bridges the historical communication divide between the Barangay Council of Lapasan and its constituents.

Through centralized cloud data management, instant status verification, automated quota control, scannable digital passes, and camera-based gate attendance tracking, the system successfully modernizes the community participation lifecycle. APILA stands as a scalable, secure, and production-ready technological framework that elevates civic participation, fosters operational accountability, and promotes community welfare across Barangay Lapasan, Cagayan de Oro City.
