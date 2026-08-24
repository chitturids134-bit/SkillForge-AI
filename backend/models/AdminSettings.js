import mongoose from 'mongoose';

const adminSettingsSchema = new mongoose.Schema(
  {
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    notifications: {
      inApp: { type: Boolean, default: true },
      recruiterVerification: { type: Boolean, default: true },
      supportTickets: { type: Boolean, default: true },
      platformActivity: { type: Boolean, default: true },
      securityAlerts: { type: Boolean, default: true },
      systemIssues: { type: Boolean, default: true },
    },
    platform: {
      registrationEnabled: { type: Boolean, default: true },
      recruiterVerificationMode: {
        type: String,
        enum: ['manual', 'automatic'],
        default: 'manual',
      },
      jobReviewMode: {
        type: String,
        enum: ['review', 'immediate'],
        default: 'review',
      },
      maintenanceMode: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

const AdminSettings = mongoose.model('AdminSettings', adminSettingsSchema);
export default AdminSettings;
