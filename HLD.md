# SkillForge AI — High Level Design (HLD) Document

**Version**: 1.0  
**Status**: Technical Architecture & Viva Submission Document  
**Product**: SkillForge AI  
**Architecture Style**: Client-Server, Layered REST API, NoSQL Document Store  

---

## 1. System Overview & Architectural Vision

**SkillForge AI** is an enterprise-grade, full-stack career engineering and talent acquisition platform. The system operates on a multi-tier **Client-Server REST Architecture** separating user interaction, business logic execution, AI engine orchestration, and database persistence.

### Key Design Principles
1. **Separation of Concerns (Layered Architecture)**: Requests flow through isolated boundaries:  
   `Client Component → HTTP REST API → Middleware Filter → Controller Handler → Business Service → Mongoose ODM → MongoDB Atlas`.
2. **Zero-Runtime-Demo-Data Contract**: Production business workflows interact exclusively with authentic MongoDB Atlas documents. Empty states replace fabricated mock data when records are missing.
3. **Role Isolation & Single-Admin Rule**: Access is strictly governed by server-side Role-Based Access Control (RBAC) across `Developer`, `Recruiter`, and `Admin` roles. Primary platform administration is hard-locked to exactly one account (`devadharshinichitturi95@gmail.com`).
4. **Human-Centric Hiring Lifecycle**: Recruitment workflows (scheduling, interviews, feedback, hiring decisions) are human-recruiter-driven. AI capabilities are restricted to assistance (ATS scoring, screening support, career mentorship).

---

## 2. System Architecture Diagrams

### 2.1 High-Level Component Architecture
```
┌─────────────────────────────────────────────────────────────────────────┐
│                           FRONTEND TIER (SPA)                           │
│  React.js 19 + Vite + React Router v6 + Context API + Vanilla CSS       │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │ HTTP / HTTPS (REST APIs + JSON / JWT)
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           API GATEWAY / MIDDLEWARE                       │
│  Express.js CORS Router + JWT Auth Guard + Role RBAC + Multer File Engine │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
         ┌───────────────────────────┴───────────────────────────┐
         ▼                                                       ▼
┌──────────────────────────────┐                       ┌──────────────────┐
│     BACKEND SERVICES TIER    │                       │   AI ENGINE TIER │
│  - Auth & User Service       │                       │  Google Gemini   │
│  - Profile & Avatar Service  │                       │  - AI Mentor     │
│  - Resume & ATS Engine       │                       │  - ATS Analyzer  │
│  - Job & Application Service │                       │  - AI Screener   │
│  - Human Interview Engine    │                       │  - Validator     │
│  - Assessment & Roadmap      │                       └─────────┬────────┘
│  - Notification & Messaging  │                                 │
└────────┬─────────────────────┘                                 │
         │                                                       │
         │ Mongoose ODM                                          │ Structured JSON
         ▼                                                       ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           DATABASE TIER                                 │
│                 MongoDB Atlas (Cloud Cluster Database)                  │
└─────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Layered Backend Data Flow
```
               Client HTTP Request (e.g. POST /api/interviews)
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ 1. ROUTES LAYER (e.g., backend/routes/interviewRoutes.js)               │
│    - Maps endpoint paths and HTTP verbs to controller handlers.         │
└───────────────────────────────────┬─────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ 2. MIDDLEWARE LAYER (e.g., backend/middleware/authMiddleware.js)         │
│    - Verifies Bearer JWT token signature.                               │
│    - Attaches authenticated user object (req.user) to request context.  │
│    - Enforces role-based permissions (protect, restrictTo).            │
└───────────────────────────────────┬─────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ 3. CONTROLLERS LAYER (e.g., backend/controllers/interviewController.js) │
│    - Parses & validates incoming request parameters/body.               │
│    - Delegates execution to the business service layer.                 │
│    - Formats standard JSON responses ({ success: true, status, data }). │
└───────────────────────────────────┬─────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ 4. SERVICES LAYER (e.g., backend/services/interviewService.js)         │
│    - Executes domain business rules and multi-document transactions.     │
│    - Triggers side-effects (e.g., createNotification, sendRealtimeMsg). │
└───────────────────────────────────┬─────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ 5. MODELS / DATABASE LAYER (e.g., backend/models/Interview.js)          │
│    - Enforces Mongoose schema constraints, data types, and indexes.     │
│    - Executes read/write operations against MongoDB Atlas.              │
└───────────────────────────────────┬─────────────────────────────────────┘
```

---

## 3. Core Functional Workflows & Sequence Diagrams

### 3.1 Authentication & Authorization Flow
```
User (Client)            Frontend Auth           Backend Auth Route         MongoDB Atlas
   │                         │                         │                        │
   │─── 1. Login (Email/Pass) ──►                      │                        │
   │                         │─── 2. POST /api/auth/login ──►                    │
   │                         │                         │─── 3. Find User By Email ──►
   │                         │                         │◄── 4. Return User Document ──│
   │                         │                         │                        │
   │                         │                         │── 5. Compare Bcrypt Hash
   │                         │                         │── 6. Sign JWT (Secret, 30d)
   │                         │◄── 7. { token, user } ──│                        │
   │◄── 8. Store Token (Local)│                         │                        │
   │                         │                         │                        │
   │─── 9. Protected Action ─►                         │                        │
   │                         │─── 10. Request + Bearer JWT ──►                  │
   │                         │                         │── 11. Verify JWT Signature
   │                         │                         │── 12. Attach req.user
   │                         │◄── 13. Protected Resource ──│                        │
```

### 3.2 Recruiter-Led Human Interview Workflow
```
Recruiter              Frontend               Backend Service              Developer             MongoDB Atlas
   │                      │                          │                         │                     │
   │─ 1. Schedule ───────►│                          │                         │                     │
   │   (Job, Candidate,   │─ 2. POST /api/interviews►│                         │                     │
   │    Date, Time)       │                          │─ 3. Save Interview ──────────────────────────►│
   │                      │                          │─ 4. Trigger Notification ───────────────►│
   │                      │                          │                         │                     │
   │                      │                          │◄────────────────────────│─ 5. View Invitation │
   │                      │                          │                         │                     │
   │                      │                          │◄─ 6. Accept / Reschedule ────────────────────│
   │                      │                          │   (PUT /api/interviews/:id/respond)            │
   │                      │                          │                         │                     │
   │                      │◄─ 7. Reschedule Notif ───│─ 8. Update DB State ────────────────────────►│
   │                      │                          │                         │                     │
   │─ 9. Conduct Human ──►│                          │                         │                     │
   │   Interview          │                          │                         │                     │
   │                      │                          │                         │                     │
   │─ 10. Record Decision ─►│─ 11. PUT Decision ────►│                         │                     │
   │    (Shortlist/Offer) │                          │─ 12. Update Application Pipeline ───────────►│
```

### 3.3 AI Service & Structured Output Validation Flow
```
User / Frontend          Backend Controller           Gemini AI Service       AI Validator          MongoDB
      │                          │                            │                    │                   │
      │── 1. Request AI Action ─►│                            │                    │                   │
      │   (e.g., ATS Analysis)   │── 2. Pass Profile/Resume ──►│                    │                   │
      │                          │      Context to Gemini     │                    │                   │
      │                          │                            │── 3. Execute Model ─►                  │
      │                          │◄── 4. Raw JSON Response ───│                    │                   │
      │                          │                                                 │                   │
      │                          │── 5. Validate Output Schema ───────────────────►│                   │
      │                          │                                                 │                   │
      │                          │◄── 6. Validation Result (Pass/Fail) ────────────│                   │
      │                          │                                                                     │
      │                          │── 7. Save Validated Result ────────────────────────────────────────►│
      │◄── 8. Render AI Results ─│                                                                     │
```

---

## 4. Module Decomposition & System Subsystems

### 4.1 Developer Subsystem
- **Profile Management**: Personal metadata, avatar file upload processing, technical skills array, and academic/experience background.
- **Resume Studio & ATS Engine**: Multisection resume editor with algorithmic ATS compatibility scoring.
- **AI Mentor**: Gemini-powered context-aware assistant answering developer career and technical queries.
- **Career Roadmap**: Dynamic career progression tracker mapping completed milestones and target roles.
- **Skill Assessments**: Assessment engine tracking developer quiz attempts and performance scores.
- **Interview Response Module**: Interface for accepting, declining, or requesting reschedule for recruiter interview invitations.

### 4.2 Recruiter Subsystem
- **Recruiter Dashboard**: Workspace providing metrics for active job requisitions, applications, and scheduled interviews.
- **Corporate Identity Manager**: Company registration and admin verification system. Verified fields lock to prevent spoofing.
- **Candidate Sourcing & Candidate Search**: Dynamic skill-filtering search engine over candidate profiles with `SavedTalent` bookmarking.
- **Interview Scheduler**: Interface for creating and managing recruiter-led human interviews and responding to candidate reschedule requests.
- **Pipeline Decision Manager**: Controls candidate movement across pipeline stages (`applied`, `screening`, `interview`, `shortlisted`, `offered`, `rejected`).

### 4.3 Admin Subsystem
- **User & RBAC Manager**: Master directory controlling platform user accounts and permissions.
- **Recruiter Verification Portal**: Audit desk for inspecting corporate credentials and granting verification status.
- **Platform Analytics Desk**: High-level platform-wide metrics (total users, active jobs, placement rates).
- **Audit & Log Service**: System audit logger recording critical actions (verifications, admin actions).

---

## 5. Database Design & Entity Relationships

The data layer uses **MongoDB Atlas** managed via **Mongoose ODM**.

### 5.1 Primary Entity Collections Schema
```
┌──────────────────────┐         1:1         ┌─────────────────────────┐
│        User          ├────────────────────►│         Profile         │
├──────────────────────┤                     ├─────────────────────────┤
│ _id: ObjectId        │                     │ _id: ObjectId           │
│ name: String         │                     │ user: Ref<User>         │
│ email: String        │                     │ fullName: String        │
│ password: String     │                     │ profilePhoto: String    │
│ role: Enum           │                     │ targetRole: String      │
│ profilePhoto: String │                     │ skills: Array<Skill>    │
└──────────┬───────────┘                     └─────────────────────────┘
           │
           │ 1:N
           ├───► Application ◄─── Job ◄─── Company
           │
           ├───► Interview
           │
           ├───► Notification
           │
           └───► Message / Conversation
```

### 5.2 Summary Table of Core Collections

| Collection Name | Primary Key / Ref | Description / Key Fields |
| :--- | :--- | :--- |
| **`users`** | `_id` | Stores auth credentials, role (`Developer`, `Recruiter`, `Admin`), name, email, avatar. |
| **`profiles`** | `_id`, `user` (Ref) | Stores developer details, bio, skills, education, experience, target role. |
| **`resumes`** | `_id`, `user` (Ref) | Stores resume sections, ATS scores, and version history. |
| **`jobs`** | `_id`, `postedBy` (Ref) | Stores job requisitions, requirements, tech stack, company details, status. |
| **`applications`** | `_id`, `job`, `applicant` | Tracks candidate job applications, ATS match score, status pipeline stage. |
| **`interviews`** | `_id`, `job`, `candidate` | Tracks recruiter-led human interviews, scheduling dates, response status, hiring decisions. |
| **`savedtalents`** | `_id`, `recruiter`, `candidate` | Stores recruiter candidate bookmarks. |
| **`notifications`** | `_id`, `userId` | Stores system alerts, unread status, and navigation target links. |
| **`conversations`** | `_id`, `participants` | Tracks message channels between candidates and recruiters. |
| **`messages`** | `_id`, `conversation` | Stores individual chat messages. |
| **`companies`** | `_id`, `recruiter` (Ref) | Stores recruiter corporate profile, verification status (`pending`, `verified`). |
| **`mentorchats`** | `_id`, `user` | Stores AI Mentor message histories and intents. |
| **`careerroadmaps`**| `_id`, `user` | Stores generated milestone roadmaps and progress tracking. |
| **`assessments`** | `_id` | Stores skill assessment question sets. |
| **`assessmentattempts`**| `_id`, `user` | Stores candidate assessment submissions and scores. |

---

## 6. Non-Functional Requirements (NFRs)

### 6.1 Security Architecture
- **JWT Authorization**: All private routes require a `Authorization: Bearer <token>` header verified by `authMiddleware.js`.
- **Password Security**: Passwords are hashed using `bcrypt` (salt factor 10) before MongoDB insertion.
- **Single-Admin Enforcement**: Platform admin privileges are restricted to `devadharshinichitturi95@gmail.com`.
- **Field Sanitization**: Update operations block mutation of immutable fields (`role`, `password`, `_id`).

### 6.2 Performance & Scalability
- **Non-Blocking I/O**: Asynchronous Node.js event loop handles concurrency.
- **Database Indexing**: Compound and unique indexes on `user`, `email`, `postedBy`, and `job`.
- **Optimized Frontend Build**: Vite bundler produces minified assets with sub-second production build times (890ms).

### 6.3 Reliability & Availability
- **Cloud Infrastructure**: MongoDB Atlas multi-region cluster with automated failover.
- **Error Boundaries & Middleware**: Express global error handler returns consistent JSON error payloads.

---

## 7. Deployment Architecture

```
                       ┌───────────────────────────────┐
                       │     Vercel / Netlify CDN      │
                       │   Frontend Production Asset   │
                       │      (React 19 + Vite)        │
                       └───────────────┬───────────────┘
                                       │ HTTPS / REST
                                       ▼
                       ┌───────────────────────────────┐
                       │     Render / Railway / PaaS   │
                       │    Node.js Express Backend    │
                       │   (Port 5004 / Reverse Proxy) │
                       └───────────────┬───────────────┘
                                       │ Mongoose TLS Connection
                                       ▼
                       ┌───────────────────────────────┐
                       │     MongoDB Atlas Cluster     │
                       │  Cloud Replica Set Database   │
                       └───────────────────────────────┘
```

- **Frontend Deployment**: Hosted on Vercel / Netlify with automated Vite static asset optimization.
- **Backend Deployment**: Hosted on Render / Railway PaaS running Node.js runtime with environment variables (`PORT`, `MONGO_URI`, `JWT_SECRET`, `GEMINI_API_KEY`).
- **Database Cluster**: MongoDB Atlas M0/M10 Cluster with TLS encryption and automatic backups.

---

## 8. Verification & Test Compliance

The architecture has been verified via automated integration and end-to-end test suites:

- **Master Production E2E Suite (`tests/test_master_production_e2e.js`)**: **PASSED 100% (12 / 12 Pillars)**.
- **Real Data Integrity Suite (`tests/test_real_data_integrity_e2e.js`)**: **PASSED 100% (18 / 18 Steps)**.
- **Profile Persistence Suite (`tests/test_profile_save_persistence_e2e.js`)**: **PASSED 100% (9 / 9 Steps)**.
- **Avatar Upload Suite (`tests/test_profile_avatar_upload_e2e.js`)**: **PASSED 100% (8 / 8 Steps)**.
- **Frontend Production Build (`npm run build`)**: **PASSED (0 Errors, 890ms)**.

---
*End of High Level Design (HLD) Document — SkillForge AI*
