import mongoose from 'mongoose';

const milestoneSchema = new mongoose.Schema({
  milestoneId: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['Not Started', 'In Progress', 'Completed'], 
    default: 'Not Started' 
  },
  completedAt: { type: Date }
}, { _id: false });

const careerRoadmapSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true, 
    unique: true 
  },
  selectedPath: { 
    type: String, 
    enum: ['full-stack-ai-engineer', 'frontend-specialist', 'backend-microservices-lead', 'cloud-architect'],
    default: 'full-stack-ai-engineer' 
  },
  milestonesProgress: {
    type: Map,
    of: [milestoneSchema],
    default: {}
  }
}, { timestamps: true });

const CareerRoadmap = mongoose.model('CareerRoadmap', careerRoadmapSchema);
export default CareerRoadmap;
