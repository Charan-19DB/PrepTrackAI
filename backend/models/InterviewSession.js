import mongoose from 'mongoose';

const interviewMessageSchema = new mongoose.Schema({
  role: { type: String, enum: ['interviewer', 'candidate'], required: true },
  text: { type: String, required: true },
  isFollowUp: { type: Boolean, default: false },
  timestamp: { type: Date, default: Date.now }
});

const interviewSessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  interviewType: { type: String, default: 'Technical' }, // Technical, HR, Behavioral, CSE Core, Full Placement
  difficulty: { type: String, default: 'Medium' }, // Easy, Medium, Hard
  durationMinutes: { type: Number, default: 15 },
  topics: [{ type: String }],
  messages: [interviewMessageSchema],
  status: { type: String, enum: ['In Progress', 'Completed'], default: 'In Progress' },
  evaluationReport: {
    overallScore: Number,
    technicalScore: Number,
    problemSolvingScore: Number,
    communicationScore: Number,
    confidenceScore: Number,
    clarityScore: Number,
    grammarScore: Number,
    depthScore: Number,
    hiringRecommendation: String,
    strengths: [String],
    weaknesses: [String],
    recommendedActions: [String],
    interviewerSummary: String
  }
}, { timestamps: true });

interviewSessionSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model('InterviewSession', interviewSessionSchema);
