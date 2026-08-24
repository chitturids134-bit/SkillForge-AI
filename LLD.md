# SkillForge AI — Low Level Design (LLD) Document

**Version**: 1.0  
**Status**: Complete Technical Implementation & Code Architecture Specification  
**Product Name**: SkillForge AI  
**Technology Stack**: React 19, Vite, Node.js, Express.js, MongoDB Atlas, Mongoose ODM, JWT, Google Gemini API  

---

## 1. Introduction

### 1.1 Project Overview
**SkillForge AI** is an end-to-end, AI-powered career engineering and recruitment ecosystem. The system provides integrated portals for **Developers** (profile management, ATS resume engineering, AI mentorship, skill assessments, career roadmaps, job applications, and interview responses), **Recruiters** (job posting, candidate sourcing, saved talent, human interview scheduling, and hiring decisions), and **Administrators** (user management, recruiter identity verification, support resolution, audit logging, and platform metrics).

### 1.2 Purpose of this Document
This Low Level Design (LLD) document specifies the concrete implementation details of SkillForge AI. It details file directory structures, component breakdowns, controller-service-model contracts, schema field definitions, sequence diagrams, state machines, API endpoint signatures, and error/security mechanics for technical reviews and code audits.

---

## 2. Project Folder Structure & Module Responsibilities

```
SkillForge-AI/
├── frontend/                     # React 19 + Vite Single Page Application
│   ├── public/                   # Static assets (favicons, logos)
│   ├── src/
│   │   ├── assets/               # SVG & PNG graphical assets
│   │   ├── components/           # Reusable UI components
│   │   │   ├── common/           # Shared UI buttons, cards, modals, loading skeletons
│   │   │   ├── dashboard/        # DashboardShell, Navbar, Sidebar, KPICard
│   │   │   └── resume/           # PersonalInfoForm, ResumePreview, TemplatePickers
│   │   ├── context/              # React Context Providers (Auth, Theme, Notification)
│   │   ├── data/                 # Static template data & configurations
│   │   ├── pages/                # Route view containers
│   │   │   ├── achievements/     # Achievements & badges view
│   │   │   ├── admin/            # Admin subpages (Users, Jobs, Verification, Analytics)
│   │   │   ├── analytics/        # Platform analytics dashboard
│   │   │   ├── assessments/      # Skill quiz engine & attempt history
│   │   │   ├── interview/        # Interview prep, Developer interviews & details
│   │   │   ├── mentor/           # AI Mentor chat view
│   │   │   ├── messages/         # Real-time messaging view
│   │   │   ├── notifications/    # Notification inbox
│   │   │   ├── recruiter/        # Candidate search, Candidate details, Interview schedule
│   │   │   ├── resume/           # Resume builder, History, Templates
│   │   │   ├── roadmap/          # Milestone roadmap tracker
│   │   │   └── settings/         # User & platform settings
│   │   ├── services/             # Axios API client services (profileService, jobService, etc.)
│   │   ├── styles/               # Modular CSS stylesheet files (glassmorphic dark/light design)
│   │   ├── utils/                # Helper utilities (avatarUtils.js, dateUtils.js)
│   │   ├── App.jsx               # Main React router container & layout wrapper
│   │   └── main.jsx              # Application entry point
│   ├── index.html
│   ├── vite.config.js            # Vite bundler & API proxy configuration (/api & /uploads)
│   └── package.json
│
├── backend/                      # Node.js + Express REST API Server
│   ├── config/                   # Configuration setup (db.js for MongoDB connection)
│   ├── controllers/              # HTTP request parsers & response formatters
│   ├── middleware/               # Auth guard, RBAC filter, Upload storage middleware
│   ├── models/                   # Mongoose collection schemas & indexes
│   ├── routes/                   # Express endpoint routers
│   ├── scripts/                  # Database management scripts (removeDemoData.js)
│   ├── services/                 # Domain business logic execution
│   ├── tests/                    # E2E integration test suites
│   ├── uploads/                  # Local persistent disk storage for uploaded avatars
│   │   └── avatars/
│   ├── utils/                    # Validation utilities (aiStructuredOutputValidator.js)
│   ├── bootstrapAdmin.js         # Single-admin account initializer
│   ├── server.js                 # Express server entry point & middleware registration
│   ├── package.json
│   └── .env.example
├── docs/                         # System architecture & viva concepts documentation
├── PRD.md                        # Product Requirements Document
├── HLD.md                        # High Level Design Document
└── LLD.md                        # Low Level Design Document
```

### Folder Responsibilities
- **`controllers/`**: Intercepts HTTP requests, validates payload inputs, invokes business services, and returns formatted HTTP JSON responses.
- **`services/`**: Encapsulates core business logic, database queries, AI model integration, transaction execution, and notification triggers.
- **`models/`**: Defines Mongoose document schemas, default values, field validation rules, and indexes.
- **`routes/`**: Registers API endpoints and hooks controllers with auth/RBAC middleware.
- **`middleware/`**: Handles Bearer JWT authentication (`authMiddleware.js`), role restriction (`restrictTo`), file upload bounds (`uploadMiddleware.js`), and global error handling (`errorMiddleware.js`).
- **`tests/`**: Contains automated end-to-end integration tests verifying business pillars and real database integrity.

---

## 3. Frontend Architecture & React Component Design

### 3.1 Core Setup & Routing (`App.jsx`)
The frontend uses **React Router v6** wrapped inside global Context Providers (`AuthProvider`, `ThemeProvider`, `NotificationProvider`). 

```jsx
// Simplified Routing Topology (App.jsx)
<BrowserRouter>
  <ThemeProvider>
    <AuthProvider>
      <NotificationProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Protected Developer Routes */}
          <Route element={<ProtectedRoute allowedRoles={['Developer']} />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/resume" element={<ResumeBuilder />} />
            <Route path="/mentor" element={<MentorChat />} />
            <Route path="/roadmap" element={<CareerRoadmap />} />
            <Route path="/assessments" element={<Assessments />} />
            <Route path="/interviews" element={<DeveloperInterviews />} />
            <Route path="/interviews/:id" element={<DeveloperInterviewDetail />} />
          </Route>

          {/* Protected Recruiter Routes */}
          <Route element={<ProtectedRoute allowedRoles={['Recruiter']} />}>
            <Route path="/recruiter/dashboard" element={<RecruiterDashboard />} />
            <Route path="/recruiter/candidates" element={<CandidateSearch />} />
            <Route path="/recruiter/jobs" element={<RecruiterJobs />} />
            <Route path="/recruiter/interviews" element={<InterviewSchedule />} />
            <Route path="/recruiter/interviews/:id" element={<RecruiterInterviewDetail />} />
          </Route>

          {/* Protected Admin Routes */}
          <Route element={<ProtectedRoute allowedRoles={['Admin']} />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
          </Route>
        </Routes>
      </NotificationProvider>
    </AuthProvider>
  </ThemeProvider>
</BrowserRouter>
```

### 3.2 Key Context Providers & Page Containers
- **`AuthContext.jsx`**: Restores user session on page load via `GET /api/auth/me`, handles login/register/logout calls, sets global Axios `Authorization` header, and handles network errors (`ERR_NETWORK` $\rightarrow$ *"Unable to connect to server"*).
- **`ThemeContext.jsx`**: Toggles dark/light glassmorphic UI themes, persisting preference to `localStorage`.
- **`NotificationContext.jsx`**: Polls `GET /api/notifications/unread-count`, displaying unread count badges and toast alerts.
- **`Profile.jsx`**: 5-tab profile editor (Basic, Academic, Preference, Social, Skills). Uses controlled form state and synchronizes profile changes to MongoDB via `PUT /api/profile/me`. Supports local avatar image preview via `URL.createObjectURL` and handles file uploads via `POST /api/profile/avatar`.

---

## 4. Backend Layer Architecture

```
HTTP Request ──► Express Router ──► Auth Middleware ──► Controller ──► Service ──► Mongoose Model ──► MongoDB Atlas
```

### 4.1 Layer Breakdown & Responsibilities

1. **Routes Layer (`routes/`)**: Defines HTTP verbs (`GET`, `POST`, `PUT`, `DELETE`) and applies middleware chains.
   ```javascript
   // backend/routes/profileRoutes.js
   router.route('/me')
     .get(protect, getProfileMe)
     .put(protect, updateProfileMe);
   router.post('/avatar', protect, avatarUpload.single('avatar'), uploadAvatar);
   ```
2. **Middleware Layer (`middleware/`)**: Validates Bearer JWT, sets `req.user`, checks role privileges (`restrictTo('Recruiter')`), and filters uploaded file types/sizes (`uploadMiddleware.js`).
3. **Controller Layer (`controllers/`)**: Extracts request parameters (`req.params`, `req.body`, `req.user`), delegates to service functions, and formats HTTP responses.
   ```javascript
   // backend/controllers/profileController.js
   export const updateProfileMe = async (req, res, next) => {
     try {
       const profile = await profileService.updateProfileByUserId(req.user.id, req.body);
       res.status(200).json({ success: true, status: 'success', profile });
     } catch (err) { next(err); }
   };
   ```
4. **Service Layer (`services/`)**: Executes business logic, sanitizes immutable fields, enforces model relations, triggers notifications, and writes to MongoDB.
5. **Model Layer (`models/`)**: Defines Mongoose schema structure, types, field validation, and compound database indexes.

---

## 5. Authentication & Security Architecture

### 5.1 Auth Flow Sequence Diagram
```
User                      Frontend                  Auth Route               Auth Service           MongoDB
 │                           │                           │                        │                    │
 │─── 1. Enter Credentials ─►│                           │                        │                    │
 │                           │─── 2. POST /api/auth/login ───────────────────────►│                    │
 │                           │                           │                        │── 3. Find User ───►│
 │                           │                           │                        │◄─ 4. Return Doc ───│
 │                           │                           │                        │                    │
 │                           │                           │                        │── 5. Bcrypt Compare
 │                           │                           │                        │── 6. Generate JWT
 │                           │◄── 7. { status: 200, token, user } ─────────────────│                    │
 │◄── 8. Redirect Dashboard ─│                                                                             │
```

### 5.2 Single-Admin Enforcement Rule
To preserve security, primary platform administration is hard-locked to `devadharshinichitturi95@gmail.com`.
```javascript
// backend/services/bootstrapAdmin.js
export const bootstrapAdmin = async () => {
  const adminEmail = process.env.ADMIN_EMAIL || 'devadharshinichitturi95@gmail.com';
  // Ensures admin account exists with role = 'Admin' and adminPrivileges = true
  // Downgrades or removes any rogue admin accounts to maintain strict single-admin topology.
};
```

---

## 6. Database Schema Design (Mongoose Models)

### 6.1 Core Data Models Summary

```
   ┌──────────┐           1:1           ┌─────────────┐
   │   User   ├────────────────────────►│   Profile   │
   └────┬─────┘                         └─────────────┘
        │
        │ 1:N
        ├───► Application ◄─── Job ◄─── Company
        ├───► Interview
        ├───► Notification
        └───► Message / Conversation
```

#### 1. `User` Collection (`backend/models/User.js`)
- **Fields**: `name` (String), `email` (String, Unique, Index), `password` (String, Hashed), `role` (`Developer`, `Recruiter`, `Admin`), `avatar` (String), `profilePhoto` (String), `verificationStatus` (`none`, `pending`, `verified`), `adminPrivileges` (Boolean).

#### 2. `Profile` Collection (`backend/models/Profile.js`)
- **Fields**: `user` (ObjectId, Ref: User, Unique Index), `fullName` (String), `headline` (String), `bio` (String), `location` (String), `phone` (String), `college` (String), `degree` (String), `branch` (String), `currentYear` (String), `cgpa` (String), `interestedRole` (String), `targetRole` (String), `experienceLevel` (String), `workPreference` (String), `preferredLocation` (String), `expectedSalary` (String), `preferredIndustry` (String), `careerObjective` (String), `githubUrl` (String), `linkedinUrl` (String), `portfolioUrl` (String), `twitterUrl` (String), `profilePhoto` (String), `skills` Array of `{ name, level, category }`.

#### 3. `Resume` Collection (`backend/models/Resume.js`)
- **Fields**: `user` (ObjectId, Ref: User), `title` (String), `summary` (String), `experience` (Array), `education` (Array), `skills` (Array), `projects` (Array), `atsScore` (Number), `templateId` (String), `versionHistory` (Array).

#### 4. `Job` Collection (`backend/models/Job.js`)
- **Fields**: `title` (String), `company` (String), `location` (String), `type` (String), `experienceLevel` (String), `salaryRange` (String), `description` (String), `requirements` (Array), `skillsRequired` (Array), `postedBy` (ObjectId, Ref: User), `status` (`active`, `closed`).

#### 5. `Application` Collection (`backend/models/Application.js`)
- **Fields**: `job` (ObjectId, Ref: Job), `applicant` (ObjectId, Ref: User), `status` (`applied`, `screening`, `interview`, `shortlisted`, `offered`, `rejected`), `atsMatchScore` (Number), `repositoryUrl` (String), `coverLetter` (String), `appliedAt` (Date).

#### 6. `Interview` Collection (`backend/models/Interview.js`)
- **Fields**: `job` (ObjectId, Ref: Job), `candidate` (ObjectId, Ref: User), `recruiter` (ObjectId, Ref: User), `type` (`recruiter_interview`, `ai_technical`), `scheduledDate` (Date), `scheduledTime` (String), `durationMinutes` (Number), `status` (`scheduled`, `accepted`, `declined`, `reschedule_requested`, `completed`, `cancelled`), `candidateResponse` (`pending`, `accepted`, `declined`, `reschedule_requested`), `rescheduleReason` (String), `proposedAlternativeTiming` (String), `decision` (`pending`, `shortlisted`, `rejected`, `moved_to_offer`), `feedback` (String), `meetingLink` (String).

#### 7. `SavedTalent` Collection (`backend/models/SavedTalent.js`)
- **Fields**: `recruiter` (ObjectId, Ref: User), `candidate` (ObjectId, Ref: User), `notes` (String), `savedAt` (Date). Compound Unique Index on `{ recruiter: 1, candidate: 1 }`.

#### 8. `Notification` Collection (`backend/models/Notification.js`)
- **Fields**: `userId` (ObjectId, Ref: User), `type` (String), `title` (String), `message` (String), `read` (Boolean, Default: false), `link` (String).

#### 9. `Conversation` & `Message` Collections (`backend/models/`)
- **Conversation**: `participants` (Array of ObjectId, Ref: User), `lastMessage` (String), `updatedAt` (Date).
- **Message**: `conversation` (ObjectId, Ref: Conversation), `sender` (ObjectId, Ref: User), `text` (String), `read` (Boolean).

---

## 7. Resume Studio & ATS Analysis Design

### 7.1 ATS Analysis Integration Flow
```
Developer                Resume Controller            ATS Service              Gemini AI Engine
    │                           │                          │                           │
    │── 1. Click Analyze ATS ──►│                          │                           │
    │                           │── 2. Calculate Keywords ─►                           │
    │                           │      & Format Checks     │                           │
    │                           │                          │── 3. Evaluate Match ─────►│
    │                           │                          │◄── 4. Detailed Feedback ──│
    │                           │                          │                           │
    │                           │◄── 5. Score & Feedback ──│                           │
    │◄── 6. Update ATS Card ────│                                                      │
```

The ATS Service combines deterministic keyword parsing (section detection, skill matching ratio) with Gemini structured prompts to output an **ATS Score (0–100)** along with actionable improvement recommendations.

---

## 8. Candidate Search & Sourcing Engine

### 8.1 Candidate Search Query Architecture
Recruiters search real MongoDB candidates using text queries and dynamic skill filters.
```javascript
// Candidate Search Aggregation Query (backend/controllers/recruiterController.js)
const query = {};
if (skills) {
  const skillArray = skills.split(',').map(s => s.trim());
  query['skills.name'] = { $in: skillArray.map(s => new RegExp(s, 'i')) };
}
if (search) {
  query.$or = [
    { fullName: new RegExp(search, 'i') },
    { headline: new RegExp(search, 'i') },
    { targetRole: new RegExp(search, 'i') }
  ];
}
```

---

## 9. Interview Subsystem & Human Recruiter Workflow

### 9.1 Interview Lifecycle State Machine
```
                       ┌─────────────────────────┐
                       │  SCHEDULED (Recruiter)  │
                       └────────────┬────────────┘
                                    │
            ┌───────────────────────┼───────────────────────┐
            ▼                       ▼                       ▼
     ┌─────────────┐     ┌─────────────────────┐     ┌────────────┐
     │  ACCEPTED   │     │ RESCHEDULE REQUESTED│     │  DECLINED  │
     └──────┬──────┘     └──────────┬──────────┘     └────────────┘
            │                       │
            │               (Recruiter Responds)
            │                       │
            ▼                       ▼
     ┌─────────────────────────────────────────┐
     │            HUMAN INTERVIEW              │
     │       (Conducted by Recruiter)          │
     └────────────────────┬────────────────────┘
                          │
                          ▼
     ┌─────────────────────────────────────────┐
     │      HIRING DECISION (Recruiter)        │
     │   (Shortlisted / Rejected / Offered)    │
     └────────────────────┬────────────────────┘
                          │
                          ▼
     ┌─────────────────────────────────────────┐
     │       APPLICATION STAGE UPDATED         │
     └─────────────────────────────────────────┘
```

> **CRITICAL RULE**: Recruiter-led interviews (`recruiter_interview`) are human-controlled. AI services do **NOT** conduct, automate, or score human recruiter interviews.

---

## 10. AI Mentor & Intent Classification Engine

### 10.1 Intent Classification Engine
When a developer sends a prompt to the AI Mentor, the `mentorService.js` engine classifies the query into one of 7 distinct intent categories to apply specialized context prompts:

| Intent Category | Context Injected | System Guidance |
| :--- | :--- | :--- |
| **`GREETING`** | User Name & Role | Welcoming career assistant tone. |
| **`WEEKLY_PLAN`** | Roadmap & Target Role | Structured 7-day study and coding schedule. |
| **`LEARNING_TOPICS`** | Current Skills Array | Deep technical breakdown of missing skills. |
| **`RESUME`** | Profile & Target Role | Bullet point engineering (STAR method). |
| **`INTERVIEW`** | Preferred Role | Technical interview questions & model answers. |
| **`PROJECTS`** | Skill Level | Portfolio project ideas with architecture tips. |
| **`EXPLANATION`** | Query Context | Clear conceptual explanation with code snippets. |

---

## 11. AI Structured Output Validation

To prevent malformed or hallucinated AI outputs from polluting the database, responses undergo schema validation via `aiStructuredOutputValidator.js`.

```javascript
// backend/utils/aiStructuredOutputValidator.js
export const validateAIStructuredOutput = (data) => {
  const errors = [];
  if (typeof data.overallScore !== 'number' || data.overallScore < 0 || data.overallScore > 100) {
    errors.push('overallScore must be a number between 0 and 100.');
  }
  if (!data.categories || typeof data.categories !== 'object') {
    errors.push('categories subdocument is required.');
  }
  if (!Array.isArray(data.strengths)) {
    errors.push('strengths must be an array of strings.');
  }
  if (!Array.isArray(data.weaknesses)) {
    errors.push('weaknesses must be an array of strings.');
  }
  if (errors.length > 0) {
    const error = new Error('AI Structured Output Validation Failed');
    error.statusCode = 422; // Unprocessable Entity
    error.errors = errors;
    throw error;
  }
  return true;
};
```

---

## 12. Notification Subsystem

Notifications are persisted directly in MongoDB Atlas and pushed to users upon key application actions.

```javascript
// Example Notification Trigger (backend/services/notificationService.js)
await Notification.create({
  userId: candidateId,
  type: 'interview_invitation',
  title: 'New Interview Invitation',
  message: `${recruiterName} scheduled an interview for ${jobTitle}.`,
  link: '/interviews'
});
```

---

## 13. Messaging Subsystem

Supports multi-participant text conversations between verified recruiters and candidates.
- `POST /api/messages/conversations`: Initializes chat channel between recruiter and candidate.
- `POST /api/messages`: Appends message and updates `Conversation.lastMessage`.

---

## 14. Error Handling & HTTP Status Code Specification

Centralized error handling middleware ([`backend/middleware/errorMiddleware.js`](file:///d:/SkillForge-AI/backend/middleware/errorMiddleware.js)) catches all server exceptions and returns standard JSON payloads:

```json
{
  "status": "fail",
  "message": "Detailed error description"
}
```

### Standard HTTP Status Code Usage

| Code | Status Meaning | Trigger Scenario |
| :---: | :--- | :--- |
| **`200`** | OK | Successful GET, PUT, or POST query. |
| **`201`** | Created | Successful record registration / upload creation. |
| **`400`** | Bad Request | Missing required parameters or invalid file format. |
| **`401`** | Unauthorized | Missing or expired Bearer JWT token. |
| **`403`** | Forbidden | Role restriction violation or non-admin attempting admin access. |
| **`404`** | Not Found | Requested record missing from MongoDB. |
| **`422`** | Unprocessable Entity | AI structured output validation failure. |
| **`500`** | Internal Server Error | Uncaught backend runtime exception. |

---

## 15. Security Architecture

- **JWT Storage**: Tokens stored in `localStorage` and attached via Axios request interceptors (`Authorization: Bearer <token>`).
- **Password Protection**: Passwords salted and hashed with `bcrypt` (10 rounds).
- **Environment Isolation**: Database URIs, JWT secret keys, and Gemini API keys are loaded via `.env` and kept strictly out of git source control.

---

## 16. API Endpoint Design & Interface Specification

| Endpoint | Method | Role | Description |
| :--- | :---: | :---: | :--- |
| `/api/auth/register` | `POST` | Public | Register new user account. |
| `/api/auth/login` | `POST` | Public | Authenticate user and issue JWT. |
| `/api/auth/me` | `GET` | All | Fetch current authenticated user document. |
| `/api/profile/me` | `GET`/`PUT` | Developer | Fetch / update developer profile document. |
| `/api/profile/avatar` | `POST` | Developer | Upload profile avatar photo (`multipart/form-data`). |
| `/api/resume/me` | `GET`/`PUT` | Developer | Fetch / update resume sections & calculate ATS score. |
| `/api/jobs` | `GET` | All | List all active job requisitions from MongoDB. |
| `/api/jobs` | `POST` | Recruiter | Create new job posting. |
| `/api/applications` | `POST` | Developer | Submit application for a job posting. |
| `/api/interviews` | `POST` | Recruiter | Schedule new human recruiter interview. |
| `/api/interviews/:id/respond`| `PUT` | Developer | Respond to interview (Accept / Decline / Reschedule). |
| `/api/mentor/chat` | `POST` | Developer | Query AI Mentor with context-aware prompts. |
| `/api/recruiter/candidates` | `GET` | Recruiter | Search candidates with skill filter queries. |
| `/api/admin/users` | `GET` | Admin | Manage platform user directory. |

---

## 17. Automated Testing Architecture (`backend/tests/`)

The application includes 5 comprehensive E2E test suites inside `backend/tests/`:

1. **`test_master_production_e2e.js`**: Validates all 12 core platform pillars end-to-end.
2. **`test_real_data_integrity_e2e.js`**: 18-step verification of end-to-end hiring pipelines on MongoDB.
3. **`test_profile_save_persistence_e2e.js`**: 9-step test confirming profile saves and skill updates.
4. **`test_profile_avatar_upload_e2e.js`**: 8-step test verifying avatar uploads and Express static file serving.
5. **`test_profile_avatar_persistence.js`**: Regression suite proving profile saves do not overwrite avatars.

---

## 18. Deployment Architecture

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

---

## 19. Request-Response Lifecycle Summary

```
User Click ──► React Component ──► Axios Call ──► Express Router ──► JWT Middleware ──► Controller ──► Service ──► Mongoose Model ──► MongoDB Atlas ──► Response JSON ──► React State Update ──► UI Render
```

---

## 20. Conclusion

The Low Level Design (LLD) of **SkillForge AI** guarantees a robust, maintainable, and secure architecture. With strict separation across controllers, services, and models, single-admin enforcement, verified human recruiter workflows, and automated E2E testing validation, SkillForge AI represents a production-ready web application built for technical excellence.

---
*End of Low Level Design (LLD) Document — SkillForge AI*
