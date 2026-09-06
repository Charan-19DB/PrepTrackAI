import mongoose from 'mongoose';

const mistakeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'PracticeQuestion' },
  question: { type: String, required: true },
  myAnswer: { type: String, required: true },
  correctAnswer: { type: String, required: true },
  whyWrong: { type: String, default: '' },
  subject: { type: String, required: true },
  topic: { type: String, required: true },
  difficulty: {
    type: String,
    enum: ['Beginner', 'Easy', 'Medium', 'Hard', 'Advanced'],
    default: 'Medium'
  },
  revisionDate: { type: String, default: () => new Date().toISOString().split('T')[0] },
  resolved: { type: Boolean, default: false },
  retryCount: { type: Number, default: 0 },
  lastRetriedAt: { type: Date }
}, { timestamps: true });

mistakeSchema.index({ userId: 1, resolved: 1, revisionDate: 1 });

export default mongoose.model('Mistake', mistakeSchema);
