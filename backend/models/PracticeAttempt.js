import mongoose from 'mongoose';

const practiceAttemptSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'PracticeQuestion', required: true },
  subject: { type: String, required: true },
  topic: { type: String, required: true },
  type: { type: String, required: true },
  selectedAnswer: { type: String, required: true },
  isCorrect: { type: Boolean, required: true },
  timeTakenSeconds: { type: Number, default: 0 },
  difficulty: { type: String, default: 'Medium' },
  notes: { type: String, default: '' },
  addedToMistakes: { type: Boolean, default: false }
}, { timestamps: true });

practiceAttemptSchema.index({ userId: 1, subject: 1 });
practiceAttemptSchema.index({ userId: 1, isCorrect: 1 });

export default mongoose.model('PracticeAttempt', practiceAttemptSchema);
