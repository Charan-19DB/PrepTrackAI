import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  technologies: [{ type: String }],
  githubUrl: { type: String, default: '' },
  liveUrl: { type: String, default: '' },
  startDate: { type: String, default: () => new Date().toISOString().split('T')[0] },
  endDate: { type: String, default: '' },
  features: [{
    title: { type: String, required: true },
    completed: { type: Boolean, default: false }
  }],
  status: {
    type: String,
    enum: ['Planning', 'In Progress', 'Completed', 'Deployed'],
    default: 'In Progress'
  },
  progress: { type: Number, default: 0 },
  skillsDemonstrated: [{ type: String }],
  interviewPitch: { type: String, default: '' } // 60-second elevator pitch for interviews
}, { timestamps: true });

projectSchema.index({ userId: 1, status: 1 });

export default mongoose.model('Project', projectSchema);
