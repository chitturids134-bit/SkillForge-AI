import ActivityLog from '../models/ActivityLog.js';
import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import User from '../models/User.js';
import Company from '../models/Company.js';
import Job from '../models/Job.js';
import Application from '../models/Application.js';
import Interview from '../models/Interview.js';
import Assessment from '../models/Assessment.js';
import AssessmentAttempt from '../models/AssessmentAttempt.js';
import Resume from '../models/Resume.js';
import Message from '../models/Message.js';
import Notification from '../models/Notification.js';
import express from 'express';
import cors from 'cors';

import authRoutes from '../routes/authRoutes.js';
import recruiterRoutes from '../routes/recruiterRoutes.js';
import roadmapRoutes from '../routes/roadmapRoutes.js';
import mentorRoutes from '../routes/mentorRoutes.js';
import adminRoutes from '../routes/adminRoutes.js';
import assessmentRoutes from '../routes/assessmentRoutes.js';
import interviewRoutes from '../routes/interviewRoutes.js';
import resumeRoutes from '../routes/resumeRoutes.js';
import messageRoutes from '../routes/messageRoutes.js';
import notificationRoutes from '../routes/notificationRoutes.js';
import { bootstrapAdmin } from '../services/bootstrapAdmin.js';

dotenv.config();

async function runMasterE2ETests() {
  console.log('=== SKILLFORGE AI MASTER PRODUCTION E2E SUITE ===\n');
  await connectDB();
  await bootstrapAdmin();

  const app = express();
  app.use(express.json());
  app.use(cors());

  app.use('/api/auth', authRoutes);
  app.use('/api/recruiter', recruiterRoutes);
app.use('/api/career-roadmap', roadmapRoutes);
app.use('/api/mentor', mentorRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/assessments', assessmentRoutes);
  app.use('/api/interviews', interviewRoutes);
  app.use('/api/resume', resumeRoutes);
  app.use('/api/messages', messageRoutes);
  app.use('/api/notifications', notificationRoutes);

  const PORT = 5055;
  const server = app.listen(PORT, async () => {
    const baseUrl = `http://localhost:${PORT}/api`;
    console.log(`Master Test Server listening on port ${PORT}\n`);

    try {
      // -------------------------------------------------------------
      // PILLAR 1: SINGLE ADMIN ENFORCEMENT & ADMIN AUTH
      // -------------------------------------------------------------
      const adminEmail = (process.env.ADMIN_EMAIL || 'devadharshinichitturi95@gmail.com').trim().toLowerCase();
      const adminPassword = process.env.ADMIN_PASSWORD || 'Shini@123';

      const adminLoginRes = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: adminEmail, password: adminPassword }),
      });
      const adminLoginData = await adminLoginRes.json();
      const adminToken = adminLoginData.token;

      if (adminLoginRes.status === 200 && adminLoginData.user?.role === 'Admin') {
        console.log('✅ PILLAR 1 PASS: Primary Admin login successful from .env credentials.');
      } else {
        console.error('❌ PILLAR 1 FAIL: Primary Admin login failed', adminLoginData);
        process.exit(1);
      }

      // Check single admin enforcement count in database
      const adminCount = await User.countDocuments({ role: 'Admin', isDeleted: { $ne: true } });
      if (adminCount === 1) {
        console.log('✅ PILLAR 2 PASS: Exactly 1 Admin account active in database (Single Admin Rule Enforced).');
      } else {
        console.error(`❌ PILLAR 2 FAIL: Found ${adminCount} active Admin accounts in database.`);
        process.exit(1);
      }

      // -------------------------------------------------------------
      // PILLAR 3: DEVELOPER REGISTRATION, AUTH & RESOURCE ISOLATION
      // -------------------------------------------------------------
      const devEmail = `master_dev_${Date.now()}@skillforge.ai`;
      const devRegRes = await fetch(`${baseUrl}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Master Developer',
          email: devEmail,
          password: 'Password123!',
          role: 'Developer',
        }),
      });
      const devRegData = await devRegRes.json();
      const devToken = devRegData.token;
      const devUserId = devRegData.user.id;

      if (devRegRes.status === 201 && devRegData.user?.role === 'Developer') {
        console.log('✅ PILLAR 3 PASS: Developer registration successful.');
      } else {
        console.error('❌ PILLAR 3 FAIL: Developer registration failed', devRegData);
        process.exit(1);
      }

      // -------------------------------------------------------------
      // PILLAR 4: RECRUITER ONBOARDING VERIFICATION & PROFILE SECURITY
      // -------------------------------------------------------------
      const recEmail = `master_recruiter_${Date.now()}@skillforge.ai`;
      const recRegRes = await fetch(`${baseUrl}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Master Recruiter Corp',
          email: recEmail,
          password: 'Password123!',
          role: 'Recruiter',
        }),
      });
      const recRegData = await recRegRes.json();
      const recToken = recRegData.token;
      const recUserId = recRegData.user.id;

      if (recRegData.user?.verificationStatus === 'pending') {
        console.log('✅ PILLAR 4 PASS: New recruiter created with default status = "pending".');
      } else {
        console.error('❌ PILLAR 4 FAIL: New recruiter status not pending', recRegData);
        process.exit(1);
      }

      // Admin Approves Recruiter
      const company = await Company.findOne({ owner: recUserId });
      await fetch(`${baseUrl}/admin/recruiter-verifications/${company._id}/approve`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${adminToken}` },
      });

      // Recruiter Re-login Check (Must return status = 'verified')
      const recLoginRes = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: recEmail, password: 'Password123!' }),
      });
      const recLoginData = await recLoginRes.json();

      if (recLoginData.user?.verificationStatus === 'verified') {
        console.log('✅ PILLAR 5 PASS: Verified recruiter re-login returns status = "verified" (Direct Dashboard Access).');
      } else {
        console.error('❌ PILLAR 5 FAIL: Verified recruiter login failed', recLoginData);
        process.exit(1);
      }

      // Verified Corporate Identity Lock Test
      const mutateRes = await fetch(`${baseUrl}/recruiter/company`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${recToken}`,
        },
        body: JSON.stringify({ companyName: 'Hacked Corporate Name' }),
      });

      if (mutateRes.status === 400 || mutateRes.status === 403) {
        console.log('✅ PILLAR 6 PASS: Backend correctly rejected mutation of verified corporate identity fields.');
      } else {
        console.error('❌ PILLAR 6 FAIL: Verified corporate identity mutation allowed!', mutateRes.status);
        process.exit(1);
      }

      // -------------------------------------------------------------
      // PILLAR 7: RECRUITER JOB MANAGEMENT & CANDIDATE APPLICATIONS
      // -------------------------------------------------------------
      const jobRes = await fetch(`${baseUrl}/recruiter/jobs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${recToken}`,
        },
        body: JSON.stringify({
          title: 'Senior AI Full Stack Engineer Master E2E',
          type: 'Full-time',
          workMode: 'Hybrid',
          experienceLevel: 'Senior',
          location: 'San Francisco, CA',
          salaryMin: 1800000,
          salaryMax: 3200000,
          requiredSkills: 'React, Node.js, TypeScript, MongoDB',
          description: 'Build enterprise AI applications.',
        }),
      });
      const jobData = await jobRes.json();
      const jobId = jobData.data?._id;

      if (jobRes.status === 201 && jobId) {
        console.log('✅ PILLAR 7 PASS: Verified recruiter created new job posting.');
      } else {
        console.error('❌ PILLAR 7 FAIL: Job creation failed', jobData);
        process.exit(1);
      }

      // Create Application for Developer
      const application = await Application.create({
        job: jobId,
        candidate: devUserId,
        recruiter: recUserId,
        candidateName: devRegData.user.name,
        candidateEmail: devRegData.user.email,
        status: 'applied',
        matchScore: 95,
      });

      // Update Application Stage
      const updateStageRes = await fetch(`${baseUrl}/recruiter/applications/${application._id}/stage`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${recToken}`,
        },
        body: JSON.stringify({ stage: 'interview' }),
      });
      const updateStageData = await updateStageRes.json();

      if (updateStageRes.status === 200 && updateStageData.data?.status === 'interview') {
        console.log('✅ PILLAR 8 PASS: Recruiter updated candidate application stage to "interview".');
      } else {
        console.error('❌ PILLAR 8 FAIL: Stage update failed', updateStageData);
        process.exit(1);
      }

      // -------------------------------------------------------------
      // PILLAR 8: RECRUITER REAL-TIME ANALYTICS ENGINE
      // -------------------------------------------------------------
      const analyticsRes = await fetch(`${baseUrl}/recruiter/analytics`, {
        headers: { Authorization: `Bearer ${recToken}` },
      });
      const analyticsData = await analyticsRes.json();

      if (analyticsRes.status === 200 && analyticsData.data?.metrics?.activeRequisitions >= 1) {
        console.log('✅ PILLAR 9 PASS: GET /api/recruiter/analytics returned real-time MongoDB metrics.');
      } else {
        console.error('❌ PILLAR 9 FAIL: Analytics fetch failed', analyticsData);
        process.exit(1);
      }

      // -------------------------------------------------------------
      // PILLAR 9: DEVELOPER ↔ RECRUITER MESSAGING
      // -------------------------------------------------------------
      const sendMsgRes = await fetch(`${baseUrl}/messages/conversations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${recToken}`,
        },
        body: JSON.stringify({
          participantId: devUserId,
          initialMessage: 'Hello! We would like to invite you for a technical interview.',
        }),
      });
      const sendMsgData = await sendMsgRes.json();

      if ((sendMsgRes.status === 200 || sendMsgRes.status === 201) && sendMsgData.data?._id) {
        console.log('✅ PILLAR 10 PASS: Recruiter sent real-time message to Developer successfully.');

      // PILLAR 11: CAREER ROADMAP & MILESTONES SYSTEM
      // devToken already declared in Pillar 3 scope
      const roadmapGetRes = await fetch(`${'http://localhost:5055/api'}/career-roadmap`, {
        headers: { Authorization: `Bearer ${devToken}` }
      });
      const roadmapGetData = await roadmapGetRes.json();
      if (!roadmapGetData.success || !roadmapGetData.selectedPath) {
        throw new Error('Pillar 11 Failed: GET /api/career-roadmap did not return valid data.');
      }

      const pathSelectRes = await fetch(`${'http://localhost:5055/api'}/career-roadmap/select`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${devToken}` },
        body: JSON.stringify({ careerPath: 'frontend-specialist' })
      });
      const pathSelectData = await pathSelectRes.json();
      if (pathSelectData.selectedPath !== 'frontend-specialist') {
        throw new Error('Pillar 11 Failed: PUT /api/career-roadmap/select did not switch active path.');
      }

      const milestoneRes = await fetch(`${'http://localhost:5055/api'}/career-roadmap/milestone`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${devToken}` },
        body: JSON.stringify({ careerPath: 'frontend-specialist', milestoneId: 1, status: 'Completed' })
      });
      const milestoneData = await milestoneRes.json();
      if (milestoneData.milestones[0].status !== 'Completed') {
        throw new Error('Pillar 11 Failed: PUT /api/career-roadmap/milestone did not mark milestone completed.');
      }
      console.log('✅ PILLAR 11 PASS: Career Roadmap & Milestones full-stack selection & DB persistence verified.');

      // PILLAR 12: SKILLFORGE AI MENTOR CONTEXT-AWARE SYSTEM
      const mentorSessionId = `pillar12_session_${Date.now()}`;

      // 1. "hi" greeting check
      const mentorHiRes = await fetch(`${'http://localhost:5055/api'}/mentor/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${devToken}` },
        body: JSON.stringify({ sessionId: mentorSessionId, message: 'hi' })
      });
      const mentorHiData = await mentorHiRes.json();
      const hiMsg = mentorHiData.session.messages.slice(-1)[0].text;
      if (!hiMsg.includes("I'm your SkillForge AI Mentor") || hiMsg.includes("Great inquiry regarding")) {
        throw new Error('Pillar 12 Failed: Greeting did not return natural response without generic boilerplate.');
      }

      // 2. "create a week plan" check
      const mentorPlanRes = await fetch(`${'http://localhost:5055/api'}/mentor/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${devToken}` },
        body: JSON.stringify({ sessionId: mentorSessionId, message: 'create a week plan' })
      });
      const mentorPlanData = await mentorPlanRes.json();
      const planMsg = mentorPlanData.session.messages.slice(-1)[0].text;
      if (!planMsg.includes("7-Day") || !planMsg.includes("Day 1")) {
        throw new Error('Pillar 12 Failed: Week plan did not return 7-Day study schedule.');
      }

      // 3. "which topics should I learn?" check
      const mentorTopicsRes = await fetch(`${'http://localhost:5055/api'}/mentor/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${devToken}` },
        body: JSON.stringify({ sessionId: mentorSessionId, message: 'which topics should I learn?' })
      });
      const mentorTopicsData = await mentorTopicsRes.json();
      const topicsMsg = mentorTopicsData.session.messages.slice(-1)[0].text;
      if (!topicsMsg.includes("prioritized technical topic list")) {
        throw new Error('Pillar 12 Failed: Learning topics did not return prioritized list.');
      }

      // 4. Conversation Context Preservation check
      const backendSessId = `backend_context_${Date.now()}`;
      await fetch(`${'http://localhost:5055/api'}/mentor/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${devToken}` },
        body: JSON.stringify({ sessionId: backendSessId, message: 'I want to become a backend developer' })
      });
      const followUpRes = await fetch(`${'http://localhost:5055/api'}/mentor/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${devToken}` },
        body: JSON.stringify({ sessionId: backendSessId, message: 'create a week plan' })
      });
      const followUpData = await followUpRes.json();
      const followUpMsg = followUpData.session.messages.slice(-1)[0].text;
      if (!followUpMsg.includes("Backend Microservices") && !followUpMsg.includes("Node.js")) {
        throw new Error('Pillar 12 Failed: Conversation context was not preserved for follow-up week plan.');
      }

      console.log('✅ PILLAR 12 PASS: SkillForge AI Mentor intent classification & context-aware responses verified.');

      } else {
        console.error('❌ PILLAR 10 FAIL: Message sending failed', sendMsgData);
        process.exit(1);
      }

      console.log('\n🎉 ALL 12 PILLARS OF SKILLFORGE AI PASSED E2E VALIDATION 100%! 🎉\n');
      
    } catch (err) {
      console.error('Master E2E Test Failure:', err);
      server.close();
      process.exit(1);
    }
  });
}

runMasterE2ETests().catch((err) => {
  console.error(err);
  process.exit(1);
});
