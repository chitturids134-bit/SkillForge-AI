import User from '../models/User.js';

/**
 * Bootstrap Single Real Admin Account from process.env
 * Guarantees EXACTLY ONE account in MongoDB has role === 'Admin'
 * Synchronizes password hash when ADMIN_PASSWORD in process.env is updated.
 */
export const bootstrapAdmin = async () => {
  try {
    const rawEmail = process.env.ADMIN_EMAIL || 'devadharshinichitturi95@gmail.com';
    const adminEmail = rawEmail.trim().toLowerCase();
    const adminPassword = process.env.ADMIN_PASSWORD || 'Shini@123';
    const adminName = process.env.ADMIN_NAME || 'SkillForge Admin';

    console.log(`[BootstrapAdmin] Syncing primary admin account for: ${adminEmail}`);

    // 1. Find or create the single primary Admin
    let primaryAdmin = await User.findOne({ email: adminEmail }).select('+password');
    if (!primaryAdmin) {
      primaryAdmin = await User.create({
        name: adminName,
        email: adminEmail,
        password: adminPassword,
        role: 'Admin',
        isActive: true,
      });
      console.log(`✅ Primary Admin account created with ID: ${primaryAdmin._id}`);
    } else {
      let updated = false;
      
      if (primaryAdmin.role !== 'Admin') {
        primaryAdmin.role = 'Admin';
        updated = true;
      }
      if (primaryAdmin.isActive === false) {
        primaryAdmin.isActive = true;
        updated = true;
      }

      // Check if stored password hash matches process.env.ADMIN_PASSWORD
      const isPasswordMatch = await primaryAdmin.comparePassword(adminPassword);
      if (!isPasswordMatch) {
        console.log(`[BootstrapAdmin] Password change detected in .env for ${adminEmail}. Updating stored password hash...`);
        primaryAdmin.password = adminPassword; // Pre-save hook will hash this securely
        updated = true;
      }

      if (updated) {
        await primaryAdmin.save();
        console.log(`✅ Primary Admin account credentials & role synchronized.`);
      }
    }

    // 2. Downgrade any extra users with role === 'Admin' to 'Developer'
    const duplicateAdmins = await User.find({
      role: 'Admin',
      _id: { $ne: primaryAdmin._id },
    });

    if (duplicateAdmins.length > 0) {
      console.log(`⚠️ Found ${duplicateAdmins.length} extra Admin account(s). Downgrading to Developer role for single admin rule...`);
      for (const extraAdmin of duplicateAdmins) {
        extraAdmin.role = 'Developer';
        await extraAdmin.save();
        console.log(`  - Downgraded extra admin: ${extraAdmin.email} (${extraAdmin._id})`);
      }
    }

    const adminCount = await User.countDocuments({ role: 'Admin' });
    console.log(`✅ SINGLE ADMIN ENFORCED: Exactly ${adminCount} Admin account active in database (${adminEmail}).`);
    return primaryAdmin;
  } catch (error) {
    console.error('❌ Bootstrap Admin Error:', error.message);
  }
};
