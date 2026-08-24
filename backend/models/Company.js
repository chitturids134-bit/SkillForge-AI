import mongoose from 'mongoose';

const companySchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Company owner is required'],
      unique: true,
      index: true,
    },
    companyName: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
      maxlength: [120, 'Company name cannot exceed 120 characters'],
    },
    logoUrl: {
      type: String,
      default: '',
      trim: true,
    },
    tagline: {
      type: String,
      default: '',
      trim: true,
      maxlength: [160, 'Tagline cannot exceed 160 characters'],
    },
    description: {
      type: String,
      default: '',
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    website: {
      type: String,
      default: '',
      trim: true,
    },
    email: {
      type: String,
      default: '',
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      default: '',
      trim: true,
    },
    industry: {
      type: String,
      default: '',
      trim: true,
    },
    companySize: {
      type: String,
      enum: ['1-10', '11-50', '51-200', '201-500', '501-1000', '1001-5000', '5001+', ''],
      default: '',
    },
    foundedYear: {
      type: Number,
      min: [1800, 'Founded year must be 1800 or later'],
      max: [new Date().getFullYear(), 'Founded year cannot be in the future'],
      default: null,
    },
    headquarters: {
      type: String,
      default: '',
      trim: true,
    },
    hiringStatus: {
      type: String,
      enum: ['actively-hiring', 'selective', 'not-hiring'],
      default: 'actively-hiring',
    },
    hiringCategories: [
      {
        type: String,
        trim: true,
      },
    ],
    specialties: [
      {
        type: String,
        trim: true,
      },
    ],
    technologies: [
      {
        type: String,
        trim: true,
      },
    ],
    verification: {
      status: {
        type: String,
        enum: ['unverified', 'pending', 'verified', 'rejected', 'info-requested'],
        default: 'unverified',
      },
      verifiedAt: {
        type: Date,
        default: null,
      },
      verifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
      },
      rejectedAt: {
        type: Date,
        default: null,
      },
      rejectedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
      },
      rejectionReason: {
        type: String,
        default: '',
      },
      adminNotes: {
        type: String,
        default: '',
      },
    },
  },
  { timestamps: true }
);

const Company = mongoose.model('Company', companySchema);
export default Company;
