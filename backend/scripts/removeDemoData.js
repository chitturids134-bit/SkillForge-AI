import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import User from '../models/User.js';
import Profile from '../models/Profile.js';
import Company from '../models/Company.js';
import Resume from '../models/Resume.js';
import Job from '../models/Job.js';
import Application from '../models/Application.js';
import Interview from '../models/Interview.js';
import SavedTalent from '../models/SavedTalent.js';
import Notification from '../models/Notification.js';
import Message from '../models/Message.js';
import ActivityLog from '../models/ActivityLog.js';
import SupportTicket from '../models/SupportTicket.js';

import path from 'path';
dotenv.config({ path: path.join('d:', 'SkillForge-AI', 'backend', '.env') });

const PRIMARY_ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'devadharshinichitturi95@gmail.com').trim().toLowerCase();

const LEGITIMATE_USER_EMAILS = [
  PRIMARY_ADMIN_EMAIL,
  'suryachandrachitturi543@gmail.com',
  '99250040853@klu.ac.in',
  'devadharshinichitturi@gmail.com',
  '99250040850@klu.ac.in',
  '992500408532@klu.ac.in',
  'tester2349@gmail.com'
];

const TEST_DEMO_KEYWORDS = [
  'master_dev_',
  'master_recruiter_',
  'recruiter.demo',
  'demo@',
  'sample_',
  'test_recruiter_',
  'test_integrity_',
  'recruiter_lifecycle_',
  'developer_candidate_',
  'test_candidate_',
  'demo_recruiter',
  'demo_candidate',
  'test_user_',
  'master e2e',
  'talent sourcing recruiter',
  '.e2e',
  '@example.com',
  '@skillforge.ai',
  'usera',
  'userb',
  'history.full',
  'theme.test',
  'resume.user',
  'settings.e2e',
  'sdfg@gmail.com'
];

async function removeDemoData() {
  const isConfirmed = process.env.CONFIRM_REMOVE_DEMO_DATA === 'true';

  console.log('=== SKILLFORGE AI FINAL PRODUCTION DATA CLEANUP ===\n');
  console.log(`Execution Mode: ${isConfirmed ? '🔥 CONFIRMATION DETECTED (PERFORMING DELETIONS)' : '🔍 DRY RUN ONLY (NO DELETIONS PERFORMED)'}`);
  console.log(`Primary Protected Admin: ${PRIMARY_ADMIN_EMAIL}\n`);

  try {
    await connectDB();

    // 1. Audit Users
    const allUsers = await User.find({}).lean();
    const realUsers = [];
    const testUsers = [];
    const uncertainUsers = [];

    allUsers.forEach(u => {
      const email = (u.email || '').toLowerCase();
      const name = (u.name || '').toLowerCase();

      if (LEGITIMATE_USER_EMAILS.includes(email)) {
        realUsers.push(u);
      } else if (TEST_DEMO_KEYWORDS.some(kw => email.includes(kw) || name.includes(kw))) {
        testUsers.push(u);
      } else {
        // Unrecognized users - treat as real/uncertain, DO NOT DELETE
        uncertainUsers.push(u);
      }
    });

    const testUserIds = testUsers.map(u => u._id);

    // 2. Audit Companies
    const testCompanies = await Company.find({
      $or: [
        { owner: { $in: testUserIds } },
        { companyName: { $regex: /master recruiter|talent sourcing|enterprise ai labs|dataintegrity|demo/i } }
      ]
    }).lean();
    const testCompanyIds = testCompanies.map(c => c._id);

    // 3. Audit Jobs
    const testJobs = await Job.find({
      $or: [
        { recruiter: { $in: testUserIds } },
        { company: { $in: testCompanyIds } },
        { title: { $regex: /master e2e|test|demo/i } }
      ]
    }).lean();
    const testJobIds = testJobs.map(j => j._id);

    // 4. Audit Applications
    const testApplications = await Application.find({
      $or: [
        { candidate: { $in: testUserIds } },
        { recruiter: { $in: testUserIds } },
        { job: { $in: testJobIds } }
      ]
    }).lean();
    const testAppIds = testApplications.map(a => a._id);

    // 5. Audit Interviews
    const testInterviews = await Interview.find({
      $or: [
        { user: { $in: testUserIds } },
        { candidate: { $in: testUserIds } },
        { recruiter: { $in: testUserIds } },
        { job: { $in: testJobIds } }
      ]
    }).lean();
    const testInterviewIds = testInterviews.map(i => i._id);

    // 6. Audit Activity Logs
    const testLogs = await ActivityLog.find({
      $or: [
        { actor: { $in: testUserIds } },
        { description: { $regex: /master recruiter|master developer|master e2e|talent sourcing|enterprise ai labs|dataintegrity|test_/i } }
      ]
    }).lean();
    const testLogIds = testLogs.map(l => l._id);

    // 7. Audit Other Dependent Collections
    const [
      profilesCount,
      resumesCount,
      savedTalentCount,
      notificationsCount,
      messagesCount,
      ticketsCount
    ] = await Promise.all([
      Profile.countDocuments({ user: { $in: testUserIds } }),
      Resume.countDocuments({ user: { $in: testUserIds } }),
      SavedTalent.countDocuments({ recruiter: { $in: testUserIds } }),
      Notification.countDocuments({ user: { $in: testUserIds } }),
      Message.countDocuments({ $or: [{ sender: { $in: testUserIds } }, { recipient: { $in: testUserIds } }] }),
      SupportTicket.countDocuments({ user: { $in: testUserIds } })
    ]);

    console.log('=================== DELETION MANIFEST ===================');
    console.log(`REAL USERS PROTECTED: ${realUsers.length}`);
    realUsers.forEach(u => console.log(`  ✓ ${u.name} (${u.email}) [${u.role}]`));

    console.log(`\nUNCERTAIN USERS PRESERVED: ${uncertainUsers.length}`);
    uncertainUsers.forEach(u => console.log(`  🛡️ ${u.name} (${u.email}) [${u.role}]`));

    console.log(`\nTEST/DEMO USERS DETECTED FOR DELETION: ${testUsers.length}`);
    testUsers.forEach(u => console.log(`  ❌ ${u.name} (${u.email}) [${u.role}]`));

    console.log('\n--- DEPENDENT TEST RECORDS TO REMOVE ---');
    console.log(`  Companies: ${testCompanies.length}`);
    console.log(`  Jobs: ${testJobs.length}`);
    console.log(`  Applications: ${testApplications.length}`);
    console.log(`  Interviews: ${testInterviews.length}`);
    console.log(`  Activity Logs: ${testLogs.length}`);
    console.log(`  Profiles: ${profilesCount}`);
    console.log(`  Resumes: ${resumesCount}`);
    console.log(`  Saved Talent: ${savedTalentCount}`);
    console.log(`  Notifications: ${notificationsCount}`);
    console.log(`  Messages: ${messagesCount}`);
    console.log(`  Support Tickets: ${ticketsCount}`);

    const totalRecords = testUsers.length + testCompanies.length + testJobs.length + testApplications.length + testInterviews.length + testLogs.length + profilesCount + resumesCount + savedTalentCount + notificationsCount + messagesCount + ticketsCount;
    console.log(`\nTOTAL TEST RECORDS TO DELETE: ${totalRecords}`);

    if (!isConfirmed) {
      console.log('\nℹ️ DRY RUN COMPLETE. No database mutations were made.');
      console.log('To execute deletion, run: CONFIRM_REMOVE_DEMO_DATA=true node backend/scripts/removeDemoData.js');
      process.exit(0);
    }

    console.log('\n🔥 EXECUTING COMPLETE CASCADE CLEANUP...');
    await Promise.all([
      User.deleteMany({ _id: { $in: testUserIds } }),
      Company.deleteMany({ _id: { $in: testCompanyIds } }),
      Job.deleteMany({ _id: { $in: testJobIds } }),
      Application.deleteMany({ _id: { $in: testAppIds } }),
      Interview.deleteMany({ _id: { $in: testInterviewIds } }),
      ActivityLog.deleteMany({ _id: { $in: testLogIds } }),
      Profile.deleteMany({ user: { $in: testUserIds } }),
      Resume.deleteMany({ user: { $in: testUserIds } }),
      SavedTalent.deleteMany({ recruiter: { $in: testUserIds } }),
      Notification.deleteMany({ user: { $in: testUserIds } }),
      Message.deleteMany({ $or: [{ sender: { $in: testUserIds } }, { recipient: { $in: testUserIds } }] }),
      SupportTicket.deleteMany({ user: { $in: testUserIds } })
    ]);

    console.log('✅ CASCADE CLEANUP COMPLETED SUCCESSFULLY!');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌ Remove Demo Data Error:', err);
    await mongoose.disconnect();
    process.exit(1);
  }
}

removeDemoData();
