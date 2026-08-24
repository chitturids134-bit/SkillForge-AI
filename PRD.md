SkillForge AI — Product Requirements Document (PRD)

Version: 1.0
Status: Viva Submission / Production Project Documentation
Product: SkillForge AI
Primary Users: Developers, Recruiters, Administrators

1. Product Overview

SkillForge AI is a full-stack career development and talent-management platform connecting developers, recruiters, and administrators in one system.

Developers can manage profiles and resumes, discover jobs, apply to opportunities, prepare for interviews, use AI-assisted career guidance, complete skill assessments, and track career progress.

Recruiters can create job requisitions, search candidate profiles, save talent, review applications, schedule recruiter-led interviews, communicate with candidates, and make hiring decisions.

Administrators manage users, jobs, verifications, analytics, settings, support, and platform activity.

Business workflows use authenticated user data and persistent MongoDB records. When records do not exist, the UI displays professional empty states rather than fake runtime business data.

2. Problem Statement

Developers often use separate tools for profiles, resumes, job applications, interview preparation, learning plans, and career tracking. Recruiters similarly need separate workflows for candidate discovery, applications, communication, interviews, and hiring decisions.

This fragmentation makes career information difficult to manage, candidate discovery less efficient, and recruitment workflows harder to track.

SkillForge AI addresses this through an integrated role-based platform combining career development, recruitment, AI assistance, and administration.

3. Product Vision

Build a secure, data-driven platform where:

Developers manage their complete career journey.

Recruiters efficiently discover and hire talent.

Administrators manage and monitor the platform.

AI assists career-development workflows without replacing human recruiter decisions.

Important workflows persist through authenticated MongoDB records.

4. Product Objectives

Centralize developer career information.

Provide recruiters with candidate sourcing and hiring workflows.

Support real job discovery and applications.

Persist profiles, resumes, applications, interviews, notifications, messages, assessments, and roadmap data.

Integrate contextual AI assistance.

Enforce authentication and role-based access control.

Support responsive desktop, tablet, and mobile interfaces.

Provide loading, error, and empty states.

Maintain a maintainable REST backend with controllers, services, middleware, validation, and MongoDB persistence.

5. Target Users

Developer

A developer who wants to:

Maintain a professional profile and profile image.

Build and manage resumes.

Perform ATS-oriented resume analysis.

Discover and apply to jobs.

Track applications.

Participate in recruiter interviews.

Respond to interview invitations.

Submit repository information when required by an interview workflow.

Use AI Mentor for career guidance.

Complete assessments.

Track a career roadmap.

Communicate with recruiters.

Receive notifications.

Recruiter

A recruiter who wants to:

Manage company/recruiter information.

Create job requisitions.

Search candidate profiles.

Filter candidates by skills.

Save talent.

Review applications.

Schedule recruiter-led interviews.

Handle candidate responses and reschedule requests.

Conduct human interviews.

Make hiring decisions.

Communicate with developers.

View recruitment analytics.

Administrator

An administrator who wants to:

Manage users.

Monitor jobs and activity.

Review recruiter/company verification.

View analytics.

Manage support tickets.

Manage platform settings.

6. Roles and Authorization

Developer

Access is limited to developer-owned resources such as profile, resume, applications, interviews, assessments, roadmap, mentor, messages, notifications, and settings.

Recruiter

Access includes recruiter-owned jobs, candidate search, saved talent, applications, interviews, analytics, company profile, and recruiter settings.

Admin

Access includes administrative users, jobs, verifications, analytics, logs, tickets, and platform settings.

Protected resources require authentication. Server-side authorization prevents unauthorized cross-user or cross-role access.

7. Core User Journeys

Developer Career Journey

Register → Login → Complete Profile → Build Resume → ATS Analysis
→ Discover Jobs → Apply → Track Application
→ Interview Invitation → Accept / Decline / Reschedule
→ Recruiter Interview → Hiring Decision

Recruiter Hiring Journey

Recruiter Login → Create Job → Search Candidates → Skill Filter
→ View Profile → Save Talent (optional) → Review Applications
→ Schedule Interview → Developer Notification
→ Developer Accept / Decline / Reschedule
→ Recruiter Conducts Interview → Hiring Decision
→ Application Pipeline Update

Career Development Journey

Profile → AI Mentor → Skill Assessment → Career Roadmap → Progress

Admin Journey

Admin Login → Dashboard → Users / Jobs / Verification / Analytics
→ Support / Settings / Activity

8. Functional Requirements

8.1 Authentication

The system shall:

Support registration and login.

Issue authenticated JWT credentials.

Verify JWT-protected requests.

Enforce role-based authorization.

Hash passwords securely.

Reject invalid authentication attempts.

Exclude sensitive authentication fields from normal responses.

Return appropriate HTTP status codes.

8.2 Developer Profile

Developers shall be able to:

Create and update professional information.

Store skills, target role, education, experience, and bio.

Upload a profile image.

Persist profile changes in MongoDB.

Retrieve saved data after refresh/login.

8.3 Resume Studio

Developers shall be able to:

Create and edit resumes.

Manage resume sections.

Preview resumes.

Use supported templates.

Perform ATS-oriented analysis.

Persist resume data.

Access supported resume history/version information.

8.4 Jobs and Applications

The system shall:

Display jobs from MongoDB.

Allow developers to view job details.

Allow eligible developers to apply.

Persist applications.

Allow developers to track application status.

Allow recruiters to review applications for their jobs.

No fake job or application cards shall be generated as production fallbacks.

8.5 Recruiter Job Management

Recruiters shall be able to:

Create job requisitions.

Update recruiter-owned jobs.

View their jobs.

Review associated applications.

Job ownership must be verified server-side.

8.6 Candidate Search and Saved Talent

Recruiters shall be able to:

Search real candidate profiles.

Search using candidate-related query text.

Filter by dynamically available skills.

View candidate profiles.

Save candidates.

Unsave candidates.

Persist saved talent in MongoDB.

Maintain recruiter-specific saved state.

Candidate search must not depend on static fake candidate arrays.

8.7 Recruiter-to-Developer Interview

The platform shall support a human recruiter-led interview lifecycle.

Scheduling

A verified recruiter can select an eligible candidate/job, set date/time and duration, add notes where applicable, and persist the interview.

Developer Response

The developer receives a persistent notification and can:

Accept.

Decline.

Request reschedule.

Rescheduling

The developer can provide preferred timing and a reason. The recruiter can approve or reject the request. The resulting state is persisted and notifications are generated.

Human Interview Principle

For recruiter_interview, the recruiter is the interviewer.

AI must not conduct, replace, or automatically evaluate the human recruiter interview.

AI technical screening is a separate interview type and must remain separate from the human recruiter workflow.

Hiring Decision

The recruiter can make appropriate hiring decisions such as:

Shortlist

Reject

Move to Offer

The applicable Application record is updated in MongoDB.

8.8 AI Features

AI capabilities support career-development workflows including:

AI Mentor.

Resume/ATS analysis.

Career roadmap assistance.

Separate AI technical screening where configured.

Interview question generation/evaluation services for AI screening.

AI provider credentials remain server-side.

Structured AI output is validated before trusted persistence where required.

8.9 AI Mentor

The AI Mentor provides context-aware career assistance.

Supported intent categories include:

Greeting

Weekly plan

Learning topics

Resume

Interview

Projects

Explanation

The mentor can use authenticated developer/profile context where appropriate.

8.10 Skill Assessments

Developers can:

Start supported assessments.

Submit attempts.

Persist results.

Review supported assessment history.

8.11 Career Roadmap

The platform can generate and maintain roadmap information using developer career/profile context, persist roadmap data, and display progress.

Roadmap progress must not be fabricated when real records are unavailable.

8.12 Notifications

Persistent notifications can be generated for:

Interview invitations.

Interview responses.

Reschedule events.

Interview completion.

Hiring decisions.

Other supported application/platform events.

8.13 Messaging

The platform shall support authorized conversations and messages.

Messages must be persisted and accessible only to authorized participants.

8.14 Recruiter Analytics

Recruiter analytics shall derive metrics from recruiter-owned jobs, applications, and other available database records. Missing records must not be replaced with fabricated metrics.

8.15 Admin Portal

The admin portal shall support:

User management.

Job monitoring.

Recruiter/company verification.

Analytics.

Logs/activity.

Support tickets.

Platform settings.

Administrative endpoints shall enforce administrator authorization server-side.

9. Non-Functional Requirements

Security

JWT authentication.

Secure password hashing.

Role-based authorization.

Request validation.

Cross-user access protection.

Environment-variable based secrets.

.env files and credentials must not be committed.

Reliability

Consistent HTTP status codes.

Server-side error handling.

Frontend loading states.

Error states with useful feedback.

Empty states for missing data.

No fake business-data fallbacks.

Performance

Appropriate database queries and indexes.

Efficient filtering.

Debounced search where applicable.

Responsive asynchronous UI.

Responsiveness

The application shall support desktop, tablet, and mobile screen sizes. Cards, buttons, forms, tables, modals, and navigation must remain within their containers.

Maintainability

Backend responsibilities should remain separated:

Routes → Controllers → Services → Models / Database

Frontend functionality should use reusable components and service modules where appropriate.

10. Data Requirements

MongoDB is the core business database.

Important domain entities include:

User

Profile

Resume

Job

Application

Interview

Notification

Conversation

Message

Assessment

AssessmentAttempt

AssessmentResult

CareerRoadmap

MentorChat

Portfolio

ProjectStudio

SavedTalent

Company

SupportTicket

ActivityLog

AdminSettings

User-owned data must be scoped to the authenticated user. Recruiter-owned resources must be scoped to the authorized recruiter/company relationship.

11. Real-Data and Data-Integrity Policy

SkillForge AI follows a zero-runtime-demo-data policy for business workflows.

The following must come from real MongoDB records:

Candidate profiles.

Jobs.

Applications.

Interviews.

Notifications.

Messages.

Saved talent.

Assessments/results.

Roadmap records.

User-facing business metrics.

When a collection has no applicable records, the UI displays a professional empty state.

Controlled automated test data may be used only by test infrastructure and must not appear as production fallback data.

12. Error and Empty States

Loading

Show loading/skeleton UI during asynchronous requests.

Error

Show a user-friendly error message and retry action where appropriate.

Empty

Examples:

No jobs available.

No applications yet.

No interviews scheduled.

No saved talent.

No messages.

No notifications.

No assessment history.

Empty states should guide users toward the next useful action.

13. AI Safety and Reliability

AI functionality shall:

Keep provider secrets server-side.

Validate structured outputs where required.

Reject malformed structured AI data before trusted persistence.

Use profile context appropriately.

Separate AI technical screening from recruiter-led interviews.

Handle AI service failures through backend error handling.

Human recruiter interviews remain under human recruiter control.

14. User Experience Requirements

The UI shall provide:

Consistent navigation.

Role-specific dashboards.

Responsive layouts.

Clear form validation.

Consistent status indicators.

Loading, error, and empty states.

Clear success/error feedback after important actions.

No overflow from cards, buttons, modals, or containers.

15. Success Criteria

The product is successful when:

Users can register and authenticate.

Developers can save and retrieve profile information.

Profile images persist correctly.

Developers can create/manage resumes.

Developers can discover and apply to real jobs.

Recruiters can create and manage real job requisitions.

Recruiters can search real candidates.

Recruiters can persist saved talent.

Recruiters can schedule interviews.

Developers receive and respond to interview invitations.

Recruiter-led interviews remain human-controlled.

Application stages update after supported hiring decisions.

Notifications and messages persist correctly.

AI services operate through the backend with validated structured output where required.

Role-based authorization prevents unauthorized access.

Empty states work without fake business records.

The frontend production build succeeds.

Critical workflows are covered by automated integration/E2E tests.

16. Scope

In Scope

Authentication and RBAC

Developer profiles and profile images

Resume management and ATS analysis

Jobs and applications

Candidate search and saved talent

Recruiter-led interviews

Developer interview responses

Notifications

Messaging

AI Mentor

Separate AI technical screening

Skill assessments

Career roadmap

Recruiter analytics

Admin management

Responsive frontend

MongoDB persistence

REST APIs

Validation and error handling

Automated integration testing

Out of Scope

Replacing human recruiters with AI for recruiter-led interviews.

Using fake candidates/jobs/applications as production UI data.

Automatically evaluating a human recruiter interview using AI.

PostgreSQL business persistence in the current MongoDB architecture.

17. Future Enhancements

Potential future improvements include:

Advanced recruiter collaboration.

Calendar integrations.

Video interview infrastructure.

More advanced candidate ranking.

Expanded AI career recommendations.

Additional assessment types.

Richer recruiter analytics.

Advanced notification preferences.

Additional third-party integrations.

Future features must not be described as implemented until they exist in the repository.

18. Acceptance Criteria

Authentication

Registration and login work.

Invalid credentials are rejected.

Protected endpoints reject unauthenticated users.

Role restrictions are enforced server-side.

Profile

Developer can save profile details.

Saved details remain after refresh/login.

Profile image upload persists correctly.

Jobs and Applications

Recruiter can create a job.

Developer can view real jobs.

Developer can apply.

Application persists and is visible to authorized users.

Candidate Search

Recruiter can search real candidates.

Skill filters come from real candidate data.

Candidate details come from MongoDB.

Saved Talent persists across refreshes.

Interviews

Recruiter can schedule an interview.

Developer receives a persistent notification.

Developer can accept, decline, or request reschedule.

Recruiter can respond to reschedule requests.

Recruiter-led interviews are conducted by the recruiter.

AI does not conduct or evaluate human recruiter interviews.

Supported hiring decisions update the relevant application pipeline.

AI

AI requests are handled server-side.

Provider secrets are not exposed to the frontend.

Structured outputs are validated where required.

AI technical screening remains separate from recruiter-led interviews.

UI

Loading states appear during asynchronous operations.

Errors provide useful feedback.

Empty states appear when no real records exist.

Responsive layouts do not overflow containers.

19. Technical Evidence Map

Requirement

Repository Evidence

Authentication

backend/controllers/authController.js, backend/middleware/authMiddleware.js

Profile

backend/models/Profile.js, backend/controllers/profileController.js, frontend/src/pages/Profile.jsx

Resume

backend/models/Resume.js, backend/controllers/resumeController.js, frontend/src/pages/resume/

Jobs

backend/models/Job.js, recruiter controllers/pages

Applications

backend/models/Application.js, application/recruiter pages

Candidate Search

frontend/src/pages/recruiter/CandidateSearch.jsx, recruiter backend

Saved Talent

backend/models/SavedTalent.js

Interviews

backend/models/Interview.js, backend/controllers/interviewController.js

Developer Interviews

frontend/src/pages/interview/DeveloperInterviews.jsx, DeveloperInterviewDetail.jsx

Recruiter Interviews

frontend/src/pages/recruiter/InterviewSchedule.jsx, RecruiterInterviewDetail.jsx

Notifications

backend/models/Notification.js, notification services/routes

Messaging

backend/models/Message.js, backend/models/Conversation.js, messaging services/pages

AI Mentor

backend/services/mentorService.js, frontend/src/pages/mentor/MentorChat.jsx

Structured AI Validation

backend/utils/aiStructuredOutputValidator.js

Assessments

backend/models/Assessment\*.js, assessment pages/services

Career Roadmap

backend/models/CareerRoadmap.js, roadmap pages/services

Admin

backend/controllers/adminController.js, frontend/src/pages/admin/

Automated Tests

backend/tests/

Architecture Concepts

docs/ARCHITECTURE_AND_CONCEPTS.md

20. Document Status

This PRD describes the intended/current SkillForge AI product behavior for viva submission.

Documentation must be kept synchronized with the repository implementation. A capability should be described as implemented only when it is supported by the current code and project workflow.

End of PRD
