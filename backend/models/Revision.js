import mongoose from 'mongoose';

const revisionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  topicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Topic' },
  subjectName: { type: String, required: true },
  topicName: { type: String, required: true },
  revisionStage: { type: Number, default: 1 }, // 1 (1d), 2 (3d), 3 (7d), 4 (14d), 5 (30d)
  scheduledDate: { type: String, required: true }, // Format: YYYY-MM-DD
  status: {
    type: String,
    enum: ['Pending', 'Completed', 'Rescheduled', 'Missed'],
    default: 'Pending'
  },
  completedAt: { type: Date },
  notes: { type: String, default: '' },
  retentionRating: { type: Number, min: 1, max: 5, default: 4 }
}, { timestamps: true });

revisionSchema.index({ userId: 1, scheduledDate: 1, status: 1 });

export default mongoose.model('Revision', revisionSchema);
