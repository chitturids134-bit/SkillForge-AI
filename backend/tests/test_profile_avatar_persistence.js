import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import authRoutes from '../routes/authRoutes.js';
import profileRoutes from '../routes/profileRoutes.js';

import User from '../models/User.js';
import Profile from '../models/Profile.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);

let server;

async function runAvatarPersistenceRegressionSuite() {
  console.log('=== SKILLFORGE AI AVATAR PERSISTENCE REGRESSION SUITE ===\n');
  try {
    await mongoose.connect(process.env.MONGO_URI);
    await new Promise((resolve, reject) => {
      server = app.listen(5099, (err) => err ? reject(err) : resolve());
    });

    // 1. Register fresh Developer candidate
    const devEmail = `avatar_persist_${Date.now()}@gmail.com`;
    const regRes = await fetch('http://127.0.0.1:5099/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Persistence Candidate',
        email: devEmail,
        password: 'Password123!',
        role: 'Developer'
      })
    });
    const regData = await regRes.json();
    if (!regData.token) throw new Error('Registration failed');
    const devDoc = await User.findOne({ email: devEmail });
    console.log('✅ STEP 1: Fresh Developer registered.');

    // 2. Login to retrieve JWT
    const loginRes = await fetch('http://127.0.0.1:5099/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: devEmail, password: 'Password123!' })
    });
    const token1 = (await loginRes.json()).token;
    console.log('✅ STEP 2: Developer logged in & JWT token retrieved.');

    // 3. Upload avatar image
    const base64Png = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    const uploadRes = await fetch('http://127.0.0.1:5099/api/profile/avatar', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token1}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ photoUrl: base64Png })
    });
    const uploadData = await uploadRes.json();
    const avatarUrl = uploadData.profilePhoto;
    if (!avatarUrl || !avatarUrl.startsWith('/uploads/avatars/')) {
      throw new Error('Avatar upload failed');
    }
    console.log(`✅ STEP 3: POST /api/profile/avatar created persistent disk file: ${avatarUrl}`);

    // 4. Critical Test: Execute PUT /api/profile/me (text fields save) without profilePhoto in payload
    const putRes = await fetch('http://127.0.0.1:5099/api/profile/me', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token1}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Persistence Candidate',
        headline: 'Senior Full Stack Lead',
        bio: 'Updated bio text without touching avatar photo',
        location: 'Seattle, WA'
      })
    });
    const putData = await putRes.json();
    if (!putData.profile || putData.profile.profilePhoto !== avatarUrl) {
      throw new Error(`CRITICAL BUG: PUT /api/profile/me wiped avatar! Expected ${avatarUrl}, got ${putData.profile?.profilePhoto}`);
    }
    console.log('✅ STEP 4: PASS — PUT /api/profile/me text profile update preserved avatar photo intact.');

    // 5. Direct MongoDB verification
    const dbProfile = await Profile.findOne({ user: devDoc._id });
    const dbUser = await User.findById(devDoc._id);
    if (dbProfile.profilePhoto !== avatarUrl || dbUser.profilePhoto !== avatarUrl) {
      throw new Error('Direct MongoDB check failed: profilePhoto wiped in database');
    }
    console.log('✅ STEP 5: Direct MongoDB query confirmed profilePhoto preserved in Profile and User documents.');

    // 6. Simulate logout & re-login with a new JWT
    const reLoginRes = await fetch('http://127.0.0.1:5099/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: devEmail, password: 'Password123!' })
    });
    const token2 = (await reLoginRes.json()).token;

    const getRes = await fetch('http://127.0.0.1:5099/api/profile/me', {
      headers: { Authorization: `Bearer ${token2}` }
    });
    const getData = await getRes.json();
    if (getData.profile.profilePhoto !== avatarUrl) {
      throw new Error('GET /api/profile/me omitted avatar after re-login');
    }
    console.log('✅ STEP 6: GET /api/profile/me after re-login verified avatar remains 100% persistent.');

    // 7. Verify Express static file endpoint returns 200 OK
    const staticRes = await fetch(`http://127.0.0.1:5099${avatarUrl}`);
    if (staticRes.status !== 200) {
      throw new Error(`Static server returned ${staticRes.status} for ${avatarUrl}`);
    }
    console.log('✅ STEP 7: Express static endpoint served uploaded file with status 200 OK.');

    // Cleanup test user and physical file
    const physicalPath = path.join(__dirname, avatarUrl);
    if (fs.existsSync(physicalPath)) {
      fs.unlinkSync(physicalPath);
    }
    await User.deleteMany({ _id: devDoc._id });
    await Profile.deleteMany({ user: devDoc._id });

    console.log('\n🎉 AVATAR PERSISTENCE REGRESSION SUITE PASSED 100%! 🎉');
  } catch (err) {
    console.error('Avatar Persistence Regression Failure:', err.message);
    process.exit(1);
  } finally {
    if (server) server.close();
    await mongoose.disconnect();
    process.exit(0);
  }
}

runAvatarPersistenceRegressionSuite();
