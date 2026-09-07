import mongoose from 'mongoose';

const challengeQuestionSchema = new mongoose.Schema({
  subject: { type: String, required: true },
  topic: { type: String, required: true },
  type: { type: String, default: 'MCQ' },
  question: { type: String, required: true },
  codeSnippet: { type: String, default: '' },
  options: [{ type: String }],
  correctAnswer: { type: String, required: true },
  explanation: { type: String, default: '' },
  difficulty: { type: String, default: 'Medium' },
  userAnswer: { type: String, default: '' },
  isCorrect: { type: Boolean, default: null }
});

const dailyChallengeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: String, required: true }, // YYYY-MM-DD
  questions: [challengeQuestionSchema],
  totalQuestions: { type: Number, default: 5 },
  completedQuestions: { type: Number, default: 0 },
  score: { type: Number, default: 0 },
  status: { type: String, enum: ['Pending', 'In Progress', 'Completed'], default: 'Pending' },
  xpAwarded: { type: Number, default: 0 }
}, { timestamps: true });

dailyChallengeSchema.index({ userId: 1, date: 1 }, { unique: true });

export default mongoose.model('DailyChallenge', dailyChallengeSchema);
