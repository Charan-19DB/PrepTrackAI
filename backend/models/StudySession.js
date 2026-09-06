import mongoose from 'mongoose';

const studySessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subject: { type: String, required: true },
  topic: { type: String, default: '' },
  durationMinutes: { type: Number, required: true },
  sessionType: {
    type: String,
    enum: ['Pomodoro', 'Practice', 'Revision', 'FreeStudy', 'Interview'],
    default: 'Pomodoro'
  },
  date: { type: String, default: () => new Date().toISOString().split('T')[0] },
  notes: { type: String, default: '' },
  productivityRating: { type: Number, min: 1, max: 5, default: 5 }
}, { timestamps: true });

studySessionSchema.index({ userId: 1, date: 1 });

export default mongoose.model('StudySession', studySessionSchema);
