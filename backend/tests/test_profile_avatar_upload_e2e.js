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

// Serve uploaded avatars statically
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);

let server;

async function runAvatarUploadE2ETests() {
  console.log('=== SKILLFORGE AI AVATAR UPLOAD E2E SUITE ===\n');
  try {
    await mongoose.connect(process.env.MONGO_URI);
    await new Promise((resolve, reject) => {
      server = app.listen(5098, (err) => err ? reject(err) : resolve());
    });

    // 1. Register fresh Developer candidate
    const devEmail = `avatar_test_${Date.now()}@gmail.com`;
    const regRes = await fetch('http://127.0.0.1:5098/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Avatar Candidate',
        email: devEmail,
        password: 'Password123!',
        role: 'Developer'
      })
    });
    const regData = await regRes.json();
    if (!regData.token) throw new Error('Registration failed');
    const devDoc = await User.findOne({ email: devEmail });
    console.log('✅ STEP 1: Fresh Developer candidate registered.');

    // 2. Login to receive JWT token
    const loginRes = await fetch('http://127.0.0.1:5098/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: devEmail, password: 'Password123!' })
    });
    const token1 = (await loginRes.json()).token;
    console.log('✅ STEP 2: Developer logged in & JWT token retrieved.');

    // Base64 Data URI PNG for persistent file upload
    const base64Png = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

    // 3. Perform POST /api/profile/avatar upload
    const uploadRes1 = await fetch('http://127.0.0.1:5098/api/profile/avatar', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token1}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ photoUrl: base64Png })
    });
    const uploadData1 = await uploadRes1.json();
    if (!uploadData1.success || !uploadData1.profilePhoto) {
      throw new Error(uploadData1.message || 'Avatar upload request failed');
    }
    const avatarUrl1 = uploadData1.profilePhoto;
    if (!avatarUrl1.startsWith('/uploads/avatars/avatar-')) {
      throw new Error(`Unexpected avatar URL path: ${avatarUrl1}`);
    }
    console.log(`✅ STEP 3: POST /api/profile/avatar uploaded image successfully to disk: ${avatarUrl1}`);

    // 4. Verify MongoDB persistence directly from database
    const dbProfile1 = await Profile.findOne({ user: devDoc._id });
    const dbUser1 = await User.findById(devDoc._id);

    if (dbProfile1.profilePhoto !== avatarUrl1) {
      throw new Error('Profile.profilePhoto not persisted in MongoDB');
    }
    if (dbUser1.profilePhoto !== avatarUrl1 || dbUser1.avatar !== avatarUrl1) {
      throw new Error('User.profilePhoto / User.avatar not synchronized in MongoDB');
    }
    console.log('✅ STEP 4: Direct MongoDB query verified profilePhoto persisted in both Profile & User models.');

    // 5. Test static file HTTP serving of the uploaded file
    const staticRes = await fetch(`http://127.0.0.1:5098${avatarUrl1}`);
    if (staticRes.status !== 200) {
      throw new Error(`Static file serving failed with status ${staticRes.status}`);
    }
    const contentType = staticRes.headers.get('content-type');
    if (!contentType.includes('image/png')) {
      throw new Error(`Static file content type mismatch: expected image/png, got ${contentType}`);
    }
    console.log('✅ STEP 5: Express static route served uploaded PNG file with status 200 OK.');

    // 6. Simulate logout & re-login with a new JWT token
    const reLoginRes = await fetch('http://127.0.0.1:5098/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: devEmail, password: 'Password123!' })
    });
    const token2 = (await reLoginRes.json()).token;
    
    const getRes = await fetch('http://127.0.0.1:5098/api/profile/me', {
      headers: { Authorization: `Bearer ${token2}` }
    });
    const getData = await getRes.json();
    if (getData.profile.profilePhoto !== avatarUrl1) {
      throw new Error('Avatar URL failed to persist after re-login');
    }
    console.log('✅ STEP 6: Re-login profile fetch verified persistent avatar photo across user sessions.');

    // 7. Negative Test: Unauthenticated upload request rejected
    const unauthRes = await fetch('http://127.0.0.1:5098/api/profile/avatar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ photoUrl: base64Png })
    });
    if (unauthRes.status !== 401) {
      throw new Error(`Expected 401 Unauthorized, got ${unauthRes.status}`);
    }
    console.log('✅ STEP 7: Security check verified — unauthenticated upload rejected (401 Unauthorized).');

    // 8. Negative Test: Invalid file format (.txt) rejected
    const badFileRes = await fetch('http://127.0.0.1:5098/api/profile/avatar', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token2}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ photoUrl: 'data:text/plain;base64,SGVsbG8=' })
    });
    if (badFileRes.status !== 400) {
      throw new Error(`Expected 400 Bad Request for invalid file type, got ${badFileRes.status}`);
    }
    console.log('✅ STEP 8: File validation verified — non-image file (.txt) rejected (400 Bad Request).');

    // Cleanup test user and uploaded file
    const physicalFilePath = path.join(__dirname, avatarUrl1);
    if (fs.existsSync(physicalFilePath)) {
      fs.unlinkSync(physicalFilePath);
    }
    await User.deleteMany({ _id: devDoc._id });
    await Profile.deleteMany({ user: devDoc._id });

    console.log('\n🎉 AVATAR UPLOAD E2E SUITE PASSED 100%! 🎉');
  } catch (err) {
    console.error('Avatar Upload E2E Failure:', err.message);
    process.exit(1);
  } finally {
    if (server) server.close();
    await mongoose.disconnect();
    process.exit(0);
  }
}

runAvatarUploadE2ETests();
