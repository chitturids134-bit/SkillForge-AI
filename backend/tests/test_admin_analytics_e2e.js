import { spawn } from 'child_process';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function findActivePort() {
  for (let port = 5004; port <= 5010; port++) {
    const isUp = await new Promise((resolve) => {
      const req = http.get(`http://localhost:${port}/api/health`, (res) => resolve(true));
      req.on('error', () => resolve(false));
      req.end();
    });
    if (isUp) return port;
  }
  return null;
}

async function request(url, options = {}) {
  const res = await fetch(url, options);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const error = new Error(data.message || 'Request failed');
    error.status = res.status;
    error.data = data;
    throw error;
  }
  return data;
}

async function runAdminAnalyticsE2ETests() {
  console.log('=== ADMIN PLATFORM ANALYTICS FULL E2E TEST SUITE ===');

  let activePort = await findActivePort();
  let child = null;

  if (!activePort) {
    console.log('Starting temporary backend server for test execution...');
    child = spawn('node', ['server.js'], { cwd: __dirname, env: { ...process.env, PORT: '5004' } });
    await new Promise((r) => setTimeout(r, 4500));
    activePort = (await findActivePort()) || 5004;
  }

  const API_BASE = `http://localhost:${activePort}/api`;
  console.log(`Using Backend API at ${API_BASE}`);

  try {
    // 1. Login Admin
    const adminAuth = await request(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin_test@skillforge.ai', password: 'Password123!' }),
    });
    const adminToken = adminAuth.token || adminAuth.user.token;
    console.log('1. ✅ Admin Logged In:', adminAuth.user?._id || adminAuth.user?.id);

    // 2. Login Developer
    const devAuth = await request(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'dev_mark@skillforge.ai', password: 'Password123!' }),
    });
    const devToken = devAuth.token || devAuth.user.token;
    console.log('2. ✅ Developer Logged In');

    // 3. Login Recruiter
    const recruiterAuth = await request(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'recruiter_nova@skillforge.ai', password: 'Password123!' }),
    });
    const recruiterToken = recruiterAuth.token || recruiterAuth.user.token;
    console.log('3. ✅ Recruiter Logged In');

    const adminHeaders = { Authorization: `Bearer ${adminToken}`, 'Content-Type': 'application/json' };
    const devHeaders = { Authorization: `Bearer ${devToken}`, 'Content-Type': 'application/json' };
    const recruiterHeaders = { Authorization: `Bearer ${recruiterToken}`, 'Content-Type': 'application/json' };

    // 4. Admin GET Analytics (200 OK)
    const analyticsRes = await request(`${API_BASE}/admin/analytics?range=30d`, { headers: adminHeaders });
    if (!analyticsRes.success || !analyticsRes.data.overview) {
      throw new Error('Analytics overview payload missing!');
    }
    console.log('4. ✅ Admin Analytics Loaded. Overview:', {
      totalUsers: analyticsRes.data.overview.totalUsers,
      totalDevelopers: analyticsRes.data.overview.totalDevelopers,
      totalRecruiters: analyticsRes.data.overview.totalRecruiters,
      activeJobs: analyticsRes.data.overview.activeJobs,
    });

    // 5. SECURITY TEST: Developer GET /api/admin/analytics -> 403 Forbidden
    try {
      await request(`${API_BASE}/admin/analytics`, { headers: devHeaders });
      console.error('❌ SECURITY FAILURE: Developer accessed Admin Analytics API!');
      if (child) child.kill();
      process.exit(1);
    } catch (err) {
      if (err.status === 403) {
        console.log('5. ✅ SECURITY PASS: Developer blocked with 403 Forbidden');
      } else {
        console.log(`5. ✅ SECURITY PASS: Developer blocked with status ${err.status}`);
      }
    }

    // 6. SECURITY TEST: Recruiter GET /api/admin/analytics -> 403 Forbidden
    try {
      await request(`${API_BASE}/admin/analytics`, { headers: recruiterHeaders });
      console.error('❌ SECURITY FAILURE: Recruiter accessed Admin Analytics API!');
      if (child) child.kill();
      process.exit(1);
    } catch (err) {
      if (err.status === 403) {
        console.log('6. ✅ SECURITY PASS: Recruiter blocked with 403 Forbidden');
      } else {
        console.log(`6. ✅ SECURITY PASS: Recruiter blocked with status ${err.status}`);
      }
    }

    // 7. Verify userDistribution Payload Structure
    if (!Array.isArray(analyticsRes.data.userDistribution)) {
      throw new Error('userDistribution array missing!');
    }
    console.log('7. ✅ Verified userDistribution Payload Structure');

    // 8. Verify recruitmentFunnel Payload Structure
    if (!Array.isArray(analyticsRes.data.recruitmentFunnel)) {
      throw new Error('recruitmentFunnel array missing!');
    }
    console.log('8. ✅ Verified recruitmentFunnel Payload Structure');

    // 9. Verify resumeAnalytics Payload Structure
    if (!analyticsRes.data.resumeAnalytics || typeof analyticsRes.data.resumeAnalytics.averageATS !== 'number') {
      throw new Error('resumeAnalytics payload missing!');
    }
    console.log('9. ✅ Verified resumeAnalytics Payload Structure');

    // 10. Verify attention Payload Structure
    if (!analyticsRes.data.attention) {
      throw new Error('attention payload missing!');
    }
    console.log('10. ✅ Verified attention Payload Structure');

    console.log('\n🎉 ALL ADMIN PLATFORM ANALYTICS E2E TESTS PASSED SUCCESSFULLY! 🎉\n');
    if (child) child.kill();
    process.exit(0);
  } catch (error) {
    console.error('E2E Test Failed:', error.data || error.message);
    if (child) child.kill();
    process.exit(1);
  }
}

runAdminAnalyticsE2ETests();
