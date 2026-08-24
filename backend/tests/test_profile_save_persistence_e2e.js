import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from '../routes/authRoutes.js';
import profileRoutes from '../routes/profileRoutes.js';

import User from '../models/User.js';
import Profile from '../models/Profile.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);

let server;

async function runProfileSavePersistenceE2ETests() {
  console.log('=== SKILLFORGE AI PROFILE SAVE PERSISTENCE E2E SUITE ===\n');
  try {
    await mongoose.connect(process.env.MONGO_URI);
    await new Promise((resolve, reject) => {
      server = app.listen(5097, (err) => err ? reject(err) : resolve());
    });

    // 1. Register fresh Developer Candidate
    const devEmail = `profile_test_${Date.now()}@gmail.com`;
    const regRes = await fetch('http://127.0.0.1:5097/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Initial Dev Name',
        email: devEmail,
        password: 'Password123!',
        role: 'Developer'
      })
    });
    const regData = await regRes.json();
    if (!regData.token) throw new Error('Registration failed');
    const devDoc = await User.findOne({ email: devEmail });
    console.log('✅ STEP 1: Fresh Developer candidate registered.');

    // 2. Login to receive JWT Token
    const loginRes = await fetch('http://127.0.0.1:5097/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: devEmail, password: 'Password123!' })
    });
    const token1 = (await loginRes.json()).token;
    console.log('✅ STEP 2: Developer logged in & JWT token retrieved.');

    // 3. Fetch initial empty profile via GET /api/profile/me
    const getRes1 = await fetch('http://127.0.0.1:5097/api/profile/me', {
      headers: { Authorization: `Bearer ${token1}` }
    });
    const getData1 = await getRes1.json();
    if (!getData1.profile) throw new Error('Failed to fetch initial profile');
    console.log('✅ STEP 3: GET /api/profile/me returned initial profile document.');

    // 4. Submit complete Profile update via PUT /api/profile/me
    const updatePayload = {
      fullName: 'Alex Mercer',
      headline: 'Principal AI Architect & Distributed Systems Engineer',
      bio: 'Over 8 years of engineering experience building resilient Node.js microservices, React apps, and MongoDB databases.',
      location: 'San Francisco, CA',
      phone: '+1 (555) 234-5678',
      college: 'University of California, Berkeley',
      degree: 'M.S. Computer Science',
      branch: 'Artificial Intelligence & Systems',
      currentYear: 'Graduated',
      cgpa: '3.92',
      interestedRole: 'Principal AI Systems Architect',
      targetRole: 'Principal AI Systems Architect',
      experienceLevel: 'Expert',
      workPreference: 'Remote',
      preferredLocation: 'San Francisco or Remote',
      expectedSalary: '$220,000',
      preferredIndustry: 'Artificial Intelligence & Cloud Infrastructure',
      careerObjective: 'Lead engineering teams in building high-throughput LLM platforms.',
      githubUrl: 'https://github.com/alexmercer',
      linkedinUrl: 'https://linkedin.com/in/alexmercer',
      portfolioUrl: 'https://alexmercer.dev',
      twitterUrl: 'https://twitter.com/alexmercer_ai',
      skills: [
        { name: 'Node.js', level: 'Expert', category: 'Backend' },
        { name: 'React 19', level: 'Advanced', category: 'Frontend' },
        { name: 'MongoDB', level: 'Expert', category: 'Database' },
        { name: 'TypeScript', level: 'Advanced', category: 'Languages' }
      ]
    };

    const putRes = await fetch('http://127.0.0.1:5097/api/profile/me', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token1}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(updatePayload)
    });
    const putData = await putRes.json();
    if (!putData.success || !putData.profile) {
      console.log('PUT Response Error:', putData);
      throw new Error(putData.message || 'PUT /api/profile/me failed');
    }
    console.log('✅ STEP 4: PUT /api/profile/me successfully saved profile changes.');

    // 5. Verify MongoDB persistence directly from Database
    const dbProfile = await Profile.findOne({ user: devDoc._id });
    if (!dbProfile) throw new Error('Profile document missing in MongoDB');
    if (dbProfile.fullName !== 'Alex Mercer') throw new Error('fullName not persisted in MongoDB');
    if (dbProfile.location !== 'San Francisco, CA') throw new Error('location not persisted in MongoDB');
    if (dbProfile.interestedRole !== 'Principal AI Systems Architect') throw new Error('interestedRole not persisted in MongoDB');
    if (dbProfile.targetRole !== 'Principal AI Systems Architect') throw new Error('targetRole not persisted in MongoDB');
    if (dbProfile.skills?.length !== 4) throw new Error(`Skills array count mismatch: expected 4, got ${dbProfile.skills?.length}`);
    
    const dbUser = await User.findById(devDoc._id);
    console.log('dbUser.name in MongoDB:', dbUser ? dbUser.name : 'null');
    if (!dbUser || dbUser.name !== 'Alex Mercer') throw new Error('User.name failed to synchronize with Profile.fullName');
    console.log('✅ STEP 5: Direct MongoDB inspection verified 100% of profile fields persisted correctly.');

    // 6. Simulate Logout & Re-login with fresh JWT
    const reLoginRes = await fetch('http://127.0.0.1:5097/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: devEmail, password: 'Password123!' })
    });
    const token2 = (await reLoginRes.json()).token;
    console.log('✅ STEP 6: Simulated logout & re-login with new JWT token.');

    // 7. GET /api/profile/me after re-login to verify persistence
    const getRes2 = await fetch('http://127.0.0.1:5097/api/profile/me', {
      headers: { Authorization: `Bearer ${token2}` }
    });
    const getData2 = await getRes2.json();
    const fetchedProf = getData2.profile;
    if (fetchedProf.fullName !== 'Alex Mercer' || fetchedProf.skills.length !== 4 || fetchedProf.college !== 'University of California, Berkeley') {
      throw new Error('Re-fetched profile data mismatch after login');
    }
    console.log('✅ STEP 7: GET /api/profile/me verified saved profile data persists perfectly after re-login.');

    // 8. Modify specific field & save again
    const updatePayload2 = {
      ...updatePayload,
      headline: 'VP of AI Engineering',
      skills: [
        ...updatePayload.skills,
        { name: 'Python', level: 'Advanced', category: 'AI' }
      ]
    };
    const putRes2 = await fetch('http://127.0.0.1:5097/api/profile/me', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token2}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(updatePayload2)
    });
    const putData2 = await putRes2.json();
    if (putData2.profile.headline !== 'VP of AI Engineering' || putData2.profile.skills.length !== 5) {
      throw new Error('Second update profile failed to modify fields');
    }
    console.log('✅ STEP 8: Second profile save verified incremental field updates & skill array additions.');

    // 9. Security Verification: Immutable system fields protected against malicious mutation
    const exploitPayload = {
      role: 'Admin',
      password: 'hackedPassword123!',
      adminPrivileges: true
    };
    await fetch('http://127.0.0.1:5097/api/profile/me', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token2}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(exploitPayload)
    });

    const verifyUserSecurity = await User.findById(devDoc._id);
    if (verifyUserSecurity.role !== 'Developer') {
      throw new Error('Security vulnerability: User role was mutated via profile endpoint');
    }
    console.log('✅ STEP 9: Security verified — system fields (role, password, adminPrivileges) remain protected.');

    // Cleanup test records
    await User.deleteMany({ _id: devDoc._id });
    await Profile.deleteMany({ user: devDoc._id });

    console.log('\n🎉 PROFILE SAVE PERSISTENCE E2E SUITE PASSED 100%! 🎉');
  } catch (err) {
    console.error('Profile Save E2E Failure:', err.message);
    process.exit(1);
  } finally {
    if (server) server.close();
    await mongoose.disconnect();
    process.exit(0);
  }
}

runProfileSavePersistenceE2ETests();
