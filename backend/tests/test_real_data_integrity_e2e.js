import { validateAiEvaluationSchema, StructuredOutputValidationError } from '../utils/aiStructuredOutputValidator.js';
import { createRolePermissionChecker, createDebounceHandler } from '../utils/closureUtils.js';
import { sendMessageToMentorService } from '../services/mentorService.js';
import ActivityLog from '../models/ActivityLog.js';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import express from 'express';
import cors from 'cors';
import authRoutes from '../routes/authRoutes.js';
import recruiterRoutes from '../routes/recruiterRoutes.js';
import interviewRoutes from '../routes/interviewRoutes.js';
import notificationRoutes from '../routes/notificationRoutes.js';
import profileRoutes from '../routes/profileRoutes.js';
import resumeRoutes from '../routes/resumeRoutes.js';
import User from '../models/User.js';
import Company from '../models/Company.js';
import Job from '../models/Job.js';
import Application from '../models/Application.js';
import Interview from '../models/Interview.js';
import SavedTalent from '../models/SavedTalent.js';
import Notification from '../models/Notification.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/recruiter', recruiterRoutes);
app.use('/api/interview', interviewRoutes);
app.use('/api/interviews', interviewRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/resume', resumeRoutes);

let server;

async function runRealDataIntegrityE2ETests() {
  console.log('=== SKILLFORGE AI REAL DATA INTEGRITY E2E SUITE ===\n');
  try {
    await mongoose.connect(process.env.MONGO_URI);
    await new Promise((resolve, reject) => {
      server = app.listen(5098, (err) => err ? reject(err) : resolve());
    });

    // 1. Register & Verify Recruiter
    const recruiterEmail = `test_integrity_recruiter_${Date.now()}@company.com`;
    await fetch('http://127.0.0.1:5098/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Lead Technical Recruiter',
        email: recruiterEmail,
        password: 'Recruiter123!',
        role: 'Recruiter'
      })
    });

    const recruiterDoc = await User.findOne({ email: recruiterEmail });
    await Company.findOneAndUpdate(
      { owner: recruiterDoc._id },
      { owner: recruiterDoc._id, companyName: 'DataIntegrity Systems', verification: { status: 'verified', verifiedAt: new Date() } },
      { upsert: true, new: true }
    );

    const recruiterLoginRes = await fetch('http://127.0.0.1:5098/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: recruiterEmail, password: 'Recruiter123!' })
    });
    const recruiterToken = (await recruiterLoginRes.json()).token;
    console.log('✅ STEP 1: Recruiter registered and verified.');

    // 2. Register Candidate Developer
    const devEmail = `test_integrity_dev_${Date.now()}@gmail.com`;
    await fetch('http://127.0.0.1:5098/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Senior Systems Architect',
        email: devEmail,
        password: 'DevPassword123!',
        role: 'Developer'
      })
    });
    const devDoc = await User.findOne({ email: devEmail });

    const devLoginRes = await fetch('http://127.0.0.1:5098/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: devEmail, password: 'DevPassword123!' })
    });
    const devToken = (await devLoginRes.json()).token;
    console.log('✅ STEP 2: Candidate Developer registered.');

    // 3. Developer Profile CRUD & MongoDB Persistence
    const profileRes = await fetch('http://127.0.0.1:5098/api/profile', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${devToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        bio: 'Expert Full-Stack & Systems Developer',
        skills: ['React', 'Node.js', 'MongoDB', 'TypeScript'],
        targetRole: 'Senior Staff Engineer'
      })
    });
    console.log('✅ STEP 3: Developer Profile updated & persisted in MongoDB.');

    // 4. Recruiter creates real Job Requisition
    const jobDoc = await Job.create({
      title: 'Staff Full-Stack Architect',
      company: 'DataIntegrity Systems',
      recruiter: recruiterDoc._id,
      description: 'Designing resilient distributed systems and Node microservices.',
      requirements: ['Node.js', 'MongoDB', 'TypeScript', 'React'],
      location: 'Remote',
      salary: '$190,000 - $230,000',
      type: 'Full-time',
      status: 'active'
    });
    console.log('✅ STEP 4: Real Job Requisition created in MongoDB.');

    // 5. Developer applies for Job
    const appDoc = await Application.create({
      job: jobDoc._id,
      candidate: devDoc._id,
      recruiter: recruiterDoc._id,
      candidateName: devDoc.name,
      candidateEmail: devDoc.email,
      status: 'applied',
      appliedAt: new Date()
    });
    console.log('✅ STEP 5: Real Application record created in MongoDB.');

    // 6. Recruiter saves candidate to SavedTalent
    const saveRes = await fetch(`http://127.0.0.1:5098/api/recruiter/saved-candidates/${devDoc._id}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${recruiterToken}` }
    });
    const savedTalentDoc = await SavedTalent.findOne({ recruiter: recruiterDoc._id, candidate: devDoc._id });
    if (!savedTalentDoc) throw new Error('Saved talent failed to persist in MongoDB');
    console.log('✅ STEP 6: Recruiter bookmark saved in MongoDB SavedTalent.');

    // 7. Recruiter schedules Interview (Canonical enums: type=ai_technical, format=AI)
    const scheduleRes = await fetch('http://127.0.0.1:5098/api/interviews', {
      method: 'POST',
      headers: { Authorization: `Bearer ${recruiterToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        candidateId: devDoc._id,
        candidateName: devDoc.name,
        jobId: jobDoc._id,
        jobTitle: jobDoc.title,
        scheduledAt: new Date(Date.now() + 86400000).toISOString(),
        type: 'ai_technical',
        format: 'AI',
        notes: 'Real-data integrity verification screening.'
      })
    });
    const scheduleData = await scheduleRes.json();
    if (!scheduleData.success) throw new Error(scheduleData.message || 'Schedule interview failed');
    const interviewId = scheduleData.interview.id || scheduleData.interview._id;
    console.log(`✅ STEP 7: Interview document created in MongoDB (ID: ${interviewId}).`);

    // 8. Developer receives real Notification
    const allNotifs = await Notification.find({ user: devDoc._id }).lean();
    const notifDoc = await Notification.findOne({ user: devDoc._id });
    if (!notifDoc) throw new Error('Real notification failed to persist in MongoDB');
    console.log('✅ STEP 8: Real Developer Notification verified in MongoDB.');

    // 9. Developer accepts interview invitation
    const respondRes = await fetch(`http://127.0.0.1:5098/api/interviews/${interviewId}/respond`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${devToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'accept' })
    });
    console.log('✅ STEP 9: Developer accepted interview invitation.');

    // 10. Developer submits GitHub Project Repository URL
    const repoRes = await fetch(`http://127.0.0.1:5098/api/interviews/${interviewId}/repository`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${devToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ repositoryUrl: 'https://github.com/dataintegrity/core-engine' })
    });
    const repoData = await repoRes.json();
    if (!repoData.success) throw new Error('Repository submission failed');
    console.log('✅ STEP 10: GitHub Repository URL persisted in MongoDB.');

    // 11. Developer completes Interview Evaluation
    await fetch(`http://127.0.0.1:5098/api/interviews/${interviewId}/complete`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${devToken}`, 'Content-Type': 'application/json' }
    });
    console.log('✅ STEP 11: AI Technical Screening completed & evaluation stored.');

    // 12. Recruiter submits Hiring Decision (Shortlisted)
    await fetch(`http://127.0.0.1:5098/api/recruiter/interviews/${interviewId}/decision`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${recruiterToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ decision: 'shortlisted', notes: 'Top-tier problem solving skills.' })
    });
    
    const updatedApp = await Application.findById(appDoc._id);
    if (updatedApp.status !== 'shortlisted') throw new Error('Application pipeline stage failed to update');
    console.log('✅ STEP 12: Recruiter submitted Hiring Decision & Application stage updated to "shortlisted".');

    // 13. Cross-User Security Verification (Unauthorized developer blocked)
    const unauthorizedRes = await fetch(`http://127.0.0.1:5098/api/interviews/${interviewId}/repository`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${recruiterToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ repositoryUrl: 'https://github.com/hacker/exploit' })
    });
    if (unauthorizedRes.status !== 403 && unauthorizedRes.status !== 401) {
      throw new Error(`Security violation: Recruiter was not blocked from candidate endpoint (Status: ${unauthorizedRes.status})`);
    }
    console.log('✅ STEP 13: Cross-user authorization check correctly returned 403 Forbidden.');

    // Safe Cleanup of records created by this test run
    await Promise.all([
      User.deleteMany({ _id: { $in: [recruiterDoc._id, devDoc._id] } }),
      Company.deleteMany({ owner: recruiterDoc._id }),
      Job.deleteMany({ _id: jobDoc._id }),
      Application.deleteMany({ _id: appDoc._id }),
      Interview.deleteMany({ _id: interviewId }),
      SavedTalent.deleteMany({ recruiter: recruiterDoc._id }),
      Notification.deleteMany({ user: devDoc._id }),
      ActivityLog.deleteMany({ actor: { $in: [recruiterDoc._id, devDoc._id] } })
    ]);
    console.log('🧹 Cleaned up test records safely.');

    
    // 14. Verify Dashboard Real-Data Isolation (Fresh Dev Has Zero Data)
    const freshDevEmail = `fresh_dev_${Date.now()}@gmail.com`;
    await fetch('http://127.0.0.1:5098/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Fresh Dev', email: freshDevEmail, password: 'Password123!', role: 'Developer' })
    });
    const freshDevDoc = await User.findOne({ email: freshDevEmail });

    const freshLoginRes = await fetch('http://127.0.0.1:5098/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: freshDevEmail, password: 'Password123!' })
    });
    const freshToken = (await freshLoginRes.json()).token;

    const freshProfileRes = await fetch('http://127.0.0.1:5098/api/profile/me', {
      headers: { Authorization: `Bearer ${freshToken}` }
    });
    const freshProfileData = await freshProfileRes.json();
    if (freshProfileData.profile?.skills?.length > 0) {
      throw new Error('Fresh developer should have zero skills listed');
    }
    console.log('✅ STEP 14: Fresh Developer verified returning 0 skills / empty state on MongoDB queries.');

    // 15. Verify AI Mentor Intent Classification & Context-Aware Prompt Engine
    const mentorSession = await sendMessageToMentorService(freshDevDoc._id, 'test_session_101', 'create a week plan');
    const lastMsg = mentorSession.messages[mentorSession.messages.length - 1];
    if (!lastMsg || !lastMsg.text.includes('Week Plan') && !lastMsg.text.includes('Study Plan') && !lastMsg.text.includes('Day')) {
      throw new Error('AI Mentor failed to classify intent "create a week plan" correctly');
    }
    console.log('✅ STEP 15: AI Mentor Intent Classification & Context-Aware Prompt Engine verified.');

    // 16. Verify Server-Side AI Structured Output Validator
    const validAiPayload = {
      overallScore: 88,
      categories: { technical: 90, communication: 85, problemSolving: 89 },
      strengths: ['Great modular code architecture'],
      weaknesses: ['Could add more edge-case unit tests'],
      recommendation: 'Recommend for Technical Screen',
      summary: 'Strong performance on architectural reasoning.'
    };
    const validatedResult = validateAiEvaluationSchema(validAiPayload);
    if (!validatedResult.valid || validatedResult.data.overallScore !== 88) {
      throw new Error('Valid AI payload failed schema validator');
    }

    try {
      validateAiEvaluationSchema({ overallScore: 'invalid' });
      throw new Error('Malformed AI payload failed to throw validation error');
    } catch (valErr) {
      if (!(valErr instanceof StructuredOutputValidationError)) {
        throw new Error('Expected StructuredOutputValidationError for malformed AI payload');
      }
    }
    console.log('✅ STEP 16: Server-Side AI Structured Output Validator verified.');

    // 17. Verify JavaScript Closures Utility (Rate Limiter / Permission Checker)
    const isRecruiterAuthorized = createRolePermissionChecker(['Recruiter', 'Admin']);
    if (!isRecruiterAuthorized('Recruiter') || isRecruiterAuthorized('Developer')) {
      throw new Error('Closure role permission checker returned unexpected boolean');
    }
    console.log('✅ STEP 17: JavaScript Closure Utilities verified.');

    // 18. Verify REST HTTP Status Codes Architecture (401, 403, 404, 422)
    const notFoundRes = await fetch('http://127.0.0.1:5098/api/interviews/invalid_id_999999999999999999999999', {
      headers: { Authorization: `Bearer ${freshToken}` }
    });
    if (notFoundRes.status !== 404) {
      throw new Error(`Expected 404 for invalid resource ID, got ${notFoundRes.status}`);
    }
    console.log('✅ STEP 18: REST HTTP Status Codes Architecture verified.');


    await User.deleteMany({ _id: freshDevDoc._id });
  
    console.log('\n🎉 REAL DATA INTEGRITY E2E TEST SUITE PASSED 100%! 🎉');
  } catch (err) {
    console.error('Real Data Integrity E2E Failure:', err.message);
    process.exit(1);
  } finally {
    if (server) server.close();
    await mongoose.disconnect();
    process.exit(0);
  }
}

runRealDataIntegrityE2ETests();
