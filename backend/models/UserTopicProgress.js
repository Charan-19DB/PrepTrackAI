import mongoose from 'mongoose';

const userTopicProgressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  topicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Topic', required: true },
  subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  status: {
    type: String,
    enum: ['Not Started', 'Learning', 'Practicing', 'Completed', 'Needs Revision', 'Mastered'],
    default: 'Not Started'
  },
  theoryCompleted: [{ type: String }],
  assessmentCompleted: [{ type: String }],
  practicalCompleted: [{ type: String }],
  interviewCompleted: [{ type: String }],
  progressPercentage: { type: Number, default: 0 },
  notes: { type: String, default: '' },
  isImportant: { type: Boolean, default: false },
  lastStudiedAt: { type: Date },
  nextRevisionDate: { type: Date },
  revisionStage: { type: Number, default: 0 }, // 0=none, 1=1d, 2=3d, 3=7d, 4=14d, 5=30d
  studyTimeMinutes: { type: Number, default: 0 }
}, { timestamps: true });

userTopicProgressSchema.index({ userId: 1, topicId: 1 }, { unique: true });
userTopicProgressSchema.index({ userId: 1, status: 1 });
userTopicProgressSchema.index({ userId: 1, nextRevisionDate: 1 });

export default mongoose.model('UserTopicProgress', userTopicProgressSchema);
