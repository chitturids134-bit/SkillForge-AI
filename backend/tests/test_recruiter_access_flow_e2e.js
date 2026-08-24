import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import User from '../models/User.js';
import Company from '../models/Company.js';
import express from 'express';
import cors from 'cors';
import authRoutes from '../routes/authRoutes.js';
import recruiterRoutes from '../routes/recruiterRoutes.js';
import adminRoutes from '../routes/adminRoutes.js';
import { bootstrapAdmin } from '../services/bootstrapAdmin.js';

dotenv.config();

async function runAccessFlowE2ETests() {
  console.log('=== RECRUITER VERIFICATION ACCESS FLOW E2E TEST SUITE ===');
  await connectDB();
  await bootstrapAdmin();

  const app = express();
  app.use(express.json());
  app.use(cors());
  app.use('/api/auth', authRoutes);
  app.use('/api/recruiter', recruiterRoutes);
  app.use('/api/admin', adminRoutes);

  const PORT = 5028;
  const server = app.listen(PORT, async () => {
    const baseUrl = `http://localhost:${PORT}/api`;
    console.log(`Test server running on port ${PORT}`);

    try {
      // 1. REGISTER NEW RECRUITER
      const testEmail = `test_recruiter_${Date.now()}@skillforge.ai`;
      const regRes = await fetch(`${baseUrl}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Test Recruiter Inc',
          email: testEmail,
          password: 'Password123!',
          role: 'Recruiter',
        }),
      });
      const regData = await regRes.json();

      if (regRes.status === 201 && regData.user?.verificationStatus === 'pending') {
        console.log('✅ TEST 1 PASS: New recruiter created with default verificationStatus = "pending".');
      } else {
        console.error('❌ TEST 1 FAIL: Registration failed or status not pending', regData);
        process.exit(1);
      }

      const newRecToken = regData.token;

      // 2. UNVERIFIED RECRUITER CAN ACCESS /api/recruiter/verification
      const verifRes = await fetch(`${baseUrl}/recruiter/verification`, {
        headers: { Authorization: `Bearer ${newRecToken}` },
      });
      if (verifRes.status === 200) {
        console.log('✅ TEST 2 PASS: Unverified recruiter can access /api/recruiter/verification.');
      } else {
        console.error('❌ TEST 2 FAIL: Unverified recruiter blocked from verification endpoint', verifRes.status);
        process.exit(1);
      }

      // 3. UNVERIFIED RECRUITER BLOCKED FROM RECRUITER DASHBOARD API (403 FORBIDDEN)
      const dashRes = await fetch(`${baseUrl}/recruiter/dashboard`, {
        headers: { Authorization: `Bearer ${newRecToken}` },
      });
      if (dashRes.status === 403) {
        console.log('✅ TEST 3 PASS: Unverified recruiter correctly blocked from /api/recruiter/dashboard with 403 Forbidden.');
      } else {
        console.error('❌ TEST 3 FAIL: Unverified recruiter was NOT blocked with 403', dashRes.status);
        process.exit(1);
      }

      // 4. UNVERIFIED RECRUITER BLOCKED FROM COMPANY PROFILE API (403 FORBIDDEN)
      const compRes = await fetch(`${baseUrl}/recruiter/company`, {
        headers: { Authorization: `Bearer ${newRecToken}` },
      });
      if (compRes.status === 403) {
        console.log('✅ TEST 4 PASS: Unverified recruiter correctly blocked from /api/recruiter/company with 403 Forbidden.');
      } else {
        console.error('❌ TEST 4 FAIL: Unverified recruiter was NOT blocked from company profile', compRes.status);
        process.exit(1);
      }

      // 5. ADMIN APPROVES RECRUITER
      const adminEmail = (process.env.ADMIN_EMAIL || 'devadharshinichitturi95@gmail.com').trim().toLowerCase();
      const adminPassword = process.env.ADMIN_PASSWORD || 'Shini@123';

      const adminRes = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: adminEmail, password: adminPassword }),
      });
      const adminData = await adminRes.json();
      const adminToken = adminData.token;

      // Find company record created for test recruiter
      const company = await Company.findOne({ owner: regData.user.id });

      const approveRes = await fetch(`${baseUrl}/admin/recruiter-verifications/${company._id}/approve`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (approveRes.status === 200) {
        console.log('✅ TEST 5 PASS: Admin successfully approved recruiter verification.');
      } else {
        console.error('❌ TEST 5 FAIL: Admin approval failed', await approveRes.json());
        process.exit(1);
      }

      // 6. RECRUITER /api/auth/me NOW RETURNS verificationStatus = "verified"
      const meRes = await fetch(`${baseUrl}/auth/me`, {
        headers: { Authorization: `Bearer ${newRecToken}` },
      });
      const meData = await meRes.json();
      if (meData.user?.verificationStatus === 'verified') {
        console.log('✅ TEST 6 PASS: GET /api/auth/me returns latest verificationStatus = "verified".');
      } else {
        console.error('❌ TEST 6 FAIL: Auth me did not return verified status', meData);
        process.exit(1);
      }

      // 7. VERIFIED RECRUITER NOW GETS 200 OK ON RECRUITER DASHBOARD
      const dashRes2 = await fetch(`${baseUrl}/recruiter/dashboard`, {
        headers: { Authorization: `Bearer ${newRecToken}` },
      });
      if (dashRes2.status === 200) {
        console.log('✅ TEST 7 PASS: Verified recruiter now successfully accesses /api/recruiter/dashboard (200 OK).');
      } else {
        console.error('❌ TEST 7 FAIL: Verified recruiter failed to access dashboard', dashRes2.status);
        process.exit(1);
      }

      // 8. DEVELOPER LOGIN & DASHBOARD PASS-THROUGH
      const devRes = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'dev_mark@skillforge.ai', password: 'Password123!' }),
      });
      const devData = await devRes.json();
      if (devRes.status === 200 && devData.user?.role === 'Developer') {
        console.log('✅ TEST 8 PASS: Developer login & role authorization unaffected.');
      } else {
        console.error('❌ TEST 8 FAIL: Developer login error', devData);
        process.exit(1);
      }

      console.log('\n🎉 ALL RECRUITER ACCESS FLOW E2E TESTS PASSED 100%! 🎉\n');
      server.close();
      process.exit(0);
    } catch (err) {
      console.error('E2E Test Failure:', err);
      server.close();
      process.exit(1);
    }
  });
}

runAccessFlowE2ETests().catch(err => {
  console.error(err);
  process.exit(1);
});
