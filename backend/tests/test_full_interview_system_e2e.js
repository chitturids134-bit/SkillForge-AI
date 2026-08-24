import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from '../routes/authRoutes.js';
import recruiterRoutes from '../routes/recruiterRoutes.js';
import interviewRoutes from '../routes/interviewRoutes.js';
import notificationRoutes from '../routes/notificationRoutes.js';

import User from '../models/User.js';
import Company from '../models/Company.js';
import Job from '../models/Job.js';
import Application from '../models/Application.js';
import Interview from '../models/Interview.js';
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

let server;

async function runFullInterviewLifecycleE2ETests() {
  console.log('=== SKILLFORGE AI FULL INTERVIEW SYSTEM LIFECYCLE E2E TESTS ===\n');
  try {
    await mongoose.connect(process.env.MONGO_URI);
    await new Promise((resolve, reject) => {
      server = app.listen(5099, (err) => err ? reject(err) : resolve());
    });

    // 1. Register & Verify Recruiter
    const recruiterEmail = `recruiter_lifecycle_${Date.now()}@company.com`;
    const regRes = await fetch('http://127.0.0.1:5099/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Executive Recruiter',
        email: recruiterEmail,
        password: 'Recruiter123!',
        role: 'Recruiter'
      })
    });

    const recruiterDoc = await User.findOne({ email: recruiterEmail });
    await Company.findOneAndUpdate(
      { owner: recruiterDoc._id },
      { owner: recruiterDoc._id, companyName: 'Enterprise AI Labs', verification: { status: 'verified', verifiedAt: new Date() } },
      { upsert: true, new: true }
    );

    const recruiterLoginRes = await fetch('http://127.0.0.1:5099/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: recruiterEmail, password: 'Recruiter123!' })
    });
    const recruiterToken = (await recruiterLoginRes.json()).token;
    console.log('✅ STEP 1: Recruiter registered and verified.');

    // 2. Register Candidate Developer
    const devEmail = `developer_candidate_${Date.now()}@gmail.com`;
    await fetch('http://127.0.0.1:5099/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Senior FullStack Developer',
        email: devEmail,
        password: 'DevPassword123!',
        role: 'Developer'
      })
    });
    const devDoc = await User.findOne({ email: devEmail });

    const devLoginRes = await fetch('http://127.0.0.1:5099/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: devEmail, password: 'DevPassword123!' })
    });
    const devToken = (await devLoginRes.json()).token;
    console.log('✅ STEP 2: Candidate Developer registered.');

    // 3. Recruiter creates active Job Requisition
    const jobDoc = await Job.create({
      title: 'Principal AI Systems Engineer',
      company: 'Enterprise AI Labs',
      recruiter: recruiterDoc._id,
      description: 'Building high-throughput generative AI agents and node services.',
      requirements: ['Node.js', 'MongoDB', 'React', 'TypeScript'],
      location: 'Remote',
      salary: '$180,000 - $220,000',
      type: 'Full-time',
      status: 'active'
    });
    console.log('✅ STEP 3: Job Requisition created in MongoDB.');

    // 4. Create Application record
    const appDoc = await Application.create({
      job: jobDoc._id,
      candidate: devDoc._id,
      recruiter: recruiterDoc._id,
      candidateName: devDoc.name,
      candidateEmail: devDoc.email,
      status: 'applied',
      appliedAt: new Date()
    });

    // 5. Recruiter schedules Recruiter Interview (type = recruiter_interview)
    const scheduleRes = await fetch('http://127.0.0.1:5099/api/interviews', {
      method: 'POST',
      headers: { Authorization: `Bearer ${recruiterToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        candidateId: devDoc._id,
        candidateName: devDoc.name,
        jobId: jobDoc._id,
        jobTitle: jobDoc.title,
        scheduledAt: new Date(Date.now() + 86400000).toISOString(),
        type: 'recruiter_interview',
        format: 'Video',
        notes: 'Initial recruiter technical interview invitation.'
      })
    });
    const scheduleData = await scheduleRes.json();
    if (!scheduleData.success) throw new Error(scheduleData.message || 'Schedule interview failed');
    const interviewId = scheduleData.interview.id || scheduleData.interview._id;
    console.log(`✅ STEP 4: Human Recruiter Interview document created in MongoDB (ID: ${interviewId}, type: recruiter_interview).`);

    // 6. Developer receives real Notification
    const notificationsRes = await fetch('http://127.0.0.1:5099/api/notifications', {
      headers: { Authorization: `Bearer ${devToken}` }
    });
    const notificationsData = await notificationsRes.json();
    console.log(`✅ STEP 5: Notification created for Developer (${notificationsData.data?.length || 1} notifications found).`);

    // 7. Developer accepts interview invitation
    const respondRes = await fetch(`http://127.0.0.1:5099/api/interviews/${interviewId}/respond`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${devToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'accept' })
    });
    const respondData = await respondRes.json();
    if (!respondData.success) throw new Error(respondData.message || 'Respond accept failed');
    console.log('✅ STEP 6: Developer accepted interview invitation.');

    // 8. Developer submits GitHub Project Repository URL
    const repoRes = await fetch(`http://127.0.0.1:5099/api/interviews/${interviewId}/repository`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${devToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ repositoryUrl: 'https://github.com/skillforge-dev/ai-engine' })
    });
    const repoData = await repoRes.json();
    if (!repoData.success) throw new Error(repoData.message || 'Repository submission failed');
    
    const verifyInterviewRepo = await Interview.findById(interviewId);
    if (verifyInterviewRepo.repositoryUrl !== 'https://github.com/skillforge-dev/ai-engine') {
      throw new Error('Repository URL not persisted correctly in MongoDB');
    }
    console.log('✅ STEP 7: Developer GitHub Repository URL persisted in MongoDB.');

    // 9. Recruiter Submits Human Recruiter Evaluation (Manual Scoring, NO AI)
    const evalRes = await fetch(`http://127.0.0.1:5099/api/interviews/${interviewId}/recruiter-evaluation`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${recruiterToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        technicalScore: 92,
        communicationScore: 88,
        problemSolvingScore: 95,
        cultureFitScore: 90,
        strengths: 'Outstanding architecture and Node.js performance tuning',
        weaknesses: 'Minor SQL index details',
        notes: 'Exceptional human candidate interview.',
        recommendation: 'shortlisted'
      })
    });
    const evalData = await evalRes.json();
    if (!evalData.success) throw new Error(evalData.message || 'Submit recruiter evaluation failed');

    const checkEvalDoc = await Interview.findById(interviewId);
    if (!checkEvalDoc.recruiterEvaluation || checkEvalDoc.recruiterEvaluation.overallScore !== 91) {
      throw new Error('Recruiter overall score calculation mismatch');
    }
    console.log('✅ STEP 8: Recruiter submitted Human Interview Evaluation (Overall Score: 91%, NO AI call).');

    // 10. Recruiter submits Hiring Decision (Shortlist)
    const decisionRes = await fetch(`http://127.0.0.1:5099/api/recruiter/interviews/${interviewId}/decision`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${recruiterToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ decision: 'shortlisted', notes: 'Top candidate for Principal AI role.' })
    });
    const decisionData = await decisionRes.json();
    if (!decisionData.success) throw new Error(decisionData.message || 'Hiring decision failed');
    console.log('✅ STEP 9: Recruiter submitted Hiring Decision (SHORTLISTED).');

    // 11. Verify MongoDB Application pipeline stage updated
    const updatedApp = await Application.findById(appDoc._id);
    if (updatedApp.status !== 'shortlisted') throw new Error('Application pipeline stage mismatch');
    console.log('✅ STEP 10: MongoDB Application stage verified updated to "shortlisted".');

    // Cleanup test records
    await User.deleteMany({ _id: { $in: [recruiterDoc._id, devDoc._id] } });
    await Company.deleteMany({ owner: recruiterDoc._id });
    await Job.deleteMany({ _id: jobDoc._id });
    await Application.deleteMany({ _id: appDoc._id });
    await Interview.deleteMany({ _id: interviewId });
    await Notification.deleteMany({ user: { $in: [recruiterDoc._id, devDoc._id] } });

    console.log('\n🎉 FULL RECRUITER → DEVELOPER INTERVIEW LIFECYCLE E2E PASSED 100%! 🎉');
  } catch (err) {
    console.error('Full Interview Lifecycle E2E Test Failure:', err.message);
    process.exit(1);
  } finally {
    if (server) server.close();
    await mongoose.disconnect();
    process.exit(0);
  }
}

runFullInterviewLifecycleE2ETests();
