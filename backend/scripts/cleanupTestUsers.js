import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import User from '../models/User.js';
import Message from '../models/Message.js';
import ActivityLog from '../models/ActivityLog.js';

dotenv.config();

// Explicit preserve list for real users and legitimate accounts
const PRESERVE_EMAILS = [
  (process.env.ADMIN_EMAIL || 'devadharshinichitturi95@gmail.com').trim().toLowerCase(),
  'suryachandrachitturi543@gmail.com',
  '99250040853@klu.ac.in',
  'devadharshinichitturi@gmail.com',
  '99250040850@klu.ac.in',
  '992500408532@klu.ac.in',
  'tester2349@gmail.com',
  'dev_mark@skillforge.ai',
  'dev_jane@skillforge.ai',
  'recruiter_nova@skillforge.ai',
  'recruiter_quantum@skillforge.ai',
];

async function cleanupTestUsers() {
  const isConfirm = process.argv.includes('--confirm');
  const isDryRun = !isConfirm || process.argv.includes('--dry-run');

  console.log('=== SKILLFORGE AI TEST USER CLEANUP TOOL ===');
  console.log(`Mode: ${isConfirm ? '🔥 CONFIRM (DELETION ENABLED)' : '🔍 DRY-RUN (SIMULATION ONLY)'}\n`);

  await connectDB();

  const allUsers = await User.find().lean();
  const testCandidates = [];

  allUsers.forEach((u) => {
    const email = (u.email || '').trim().toLowerCase();
    
    // Safety 1: Never delete protected real emails
    if (PRESERVE_EMAILS.includes(email)) return;

    // Safety 2: Never delete Admin role
    if (u.role === 'Admin') return;

    // Identify obvious test pattern accounts
    const isHackerTest = email.startsWith('hacker_');
    const isE2ETest = email.includes('e2e_user') || email.includes('test_msg') || email.includes('third_intruder') || email.includes('third_user');
    const isExampleDomain = email.endsWith('@example.com');
    const isDemoAccount = email === 'recruiter.demo@skillforge.ai' || email === 'admin_test@skillforge.ai';

    if (isHackerTest || isE2ETest || isExampleDomain || isDemoAccount) {
      testCandidates.push(u);
    }
  });

  console.log(`Identified ${testCandidates.length} test/example user account(s) for cleanup:`);
  testCandidates.forEach((u, i) => {
    console.log(` ${i + 1}. [${u.role}] ${u.name} <${u.email}> (ID: ${u._id})`);
  });

  if (testCandidates.length === 0) {
    console.log('\n✨ No test user accounts found for cleanup. Database is clean!');
    process.exit(0);
  }

  if (isDryRun) {
    console.log('\n💡 DRY-RUN COMPLETE. No database records were modified.');
    console.log('   To perform actual deletion, run: node scripts/cleanupTestUsers.js --confirm\n');
    process.exit(0);
  }

  // Perform safe deletion
  const candidateIds = testCandidates.map((u) => u._id);
  console.log(`\nDeleting ${candidateIds.length} test user account(s)...`);

  const deleteResult = await User.deleteMany({ _id: { $in: candidateIds } });
  console.log(`✅ Deleted ${deleteResult.deletedCount} user document(s).`);

  // Clean up associated test messages & logs safely
  const msgResult = await Message.deleteMany({
    $or: [{ sender: { $in: candidateIds } }, { recipient: { $in: candidateIds } }],
  });
  console.log(`✅ Cleaned up ${msgResult.deletedCount} associated test message(s).`);

  const logResult = await ActivityLog.deleteMany({ actor: { $in: candidateIds } });
  console.log(`✅ Cleaned up ${logResult.deletedCount} associated test activity log(s).`);

  console.log('\n🎉 TEST USER CLEANUP COMPLETED SUCCESSFULLY! 🎉\n');
  process.exit(0);
}

cleanupTestUsers().catch((err) => {
  console.error('Cleanup Script Error:', err);
  process.exit(1);
});
