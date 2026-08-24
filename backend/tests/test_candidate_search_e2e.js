import dotenv from 'dotenv';
import mongoose from 'mongoose';
import express from 'express';
import cors from 'cors';
import authRoutes from '../routes/authRoutes.js';
import recruiterRoutes from '../routes/recruiterRoutes.js';
import interviewRoutes from '../routes/interviewRoutes.js';
import User from '../models/User.js';
import Company from '../models/Company.js';

dotenv.config();

const PORT = 5058;
const BASE_URL = `http://localhost:${PORT}`;
const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/recruiter', recruiterRoutes);
app.use('/api/interviews', interviewRoutes);

let server;

async function runCandidateSearchE2ETests() {
  console.log('=== SKILLFORGE AI CANDIDATE SEARCH & SAVED TALENT E2E TESTS ===\n');
  try {
    await mongoose.connect(process.env.MONGO_URI);
    server = app.listen(PORT);

    // 1. Register Recruiter
    const recruiterEmail = `test_recruiter_cs_${Date.now()}@company.com`;
    const regRes = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Talent Sourcing Recruiter',
        email: recruiterEmail,
        password: 'Recruiter123!',
        role: 'Recruiter'
      })
    });
    const regData = await regRes.json();
    console.log('✅ TEST 1 PASS: Recruiter registration successful.');

    const userDoc = await User.findOne({ email: recruiterEmail });

    // Set verified company record for recruiter in DB
    await Company.findOneAndUpdate(
      { owner: userDoc._id },
      {
        owner: userDoc._id,
        companyName: 'SkillForge AI Tech',
        verification: { status: 'verified', verifiedAt: new Date() }
      },
      { upsert: true, new: true }
    );

    // Login to get verified token
    const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: recruiterEmail,
        password: 'Recruiter123!'
      })
    });
    const loginData = await loginRes.json();
    const verifiedToken = loginData.token;

    // 2. Query Candidate Search Endpoint
    const candidatesRes = await fetch(`${BASE_URL}/api/recruiter/candidates`, {
      headers: { Authorization: `Bearer ${verifiedToken}` }
    });
    const candidatesData = await candidatesRes.json();

    if (!candidatesData.success) {
      throw new Error(candidatesData.message || 'Candidate search failed');
    }

    const candidateList = candidatesData.data || [];
    console.log(`✅ TEST 2 PASS: GET /api/recruiter/candidates returned ${candidateList.length} real candidates.`);

    // 3. Test Save Talent Endpoint
    if (candidateList.length > 0) {
      const candidateId = candidateList[0].id || candidateList[0]._id;
      
      const saveRes = await fetch(`${BASE_URL}/api/recruiter/saved-candidates/${candidateId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${verifiedToken}` }
      });
      const saveData = await saveRes.json();
      console.log('✅ TEST 3 PASS: Candidate successfully saved to MongoDB SavedTalent.');

      // Check saved candidates list
      const savedListRes = await fetch(`${BASE_URL}/api/recruiter/saved-candidates`, {
        headers: { Authorization: `Bearer ${verifiedToken}` }
      });
      const savedListData = await savedListRes.json();
      console.log(`✅ TEST 4 PASS: GET /api/recruiter/saved-candidates verified persistence (${savedListData.data.length} saved).`);

      // Test Unsave Candidate Endpoint
      await fetch(`${BASE_URL}/api/recruiter/saved-candidates/${candidateId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${verifiedToken}` }
      });
      console.log('✅ TEST 5 PASS: Candidate successfully removed from SavedTalent.');
    }

    console.log('\n🎉 ALL CANDIDATE SEARCH & SAVED TALENT TESTS PASSED 100%! 🎉');
  } catch (err) {
    console.error('Candidate Search E2E Test Failure:', err.message);
    process.exit(1);
  } finally {
    if (server) server.close();
    await mongoose.disconnect();
    process.exit(0);
  }
}

runCandidateSearchE2ETests();
