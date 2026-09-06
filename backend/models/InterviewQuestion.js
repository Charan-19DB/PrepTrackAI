import mongoose from 'mongoose';

const interviewQuestionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // null for canonical seed questions
  category: {
    type: String,
    enum: [
      'C', 'C++', 'Java', 'Python', 'OOP', 'DBMS', 'SQL',
      'OS', 'CN', 'AI', 'ML', 'DL', 'GenAI', 'Blockchain',
      'Web Development', 'Projects', 'HR'
    ],
    required: true
  },
  question: { type: String, required: true },
  idealAnswer: { type: String, required: true },
  keyPoints: [{ type: String }],
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Medium'
  },
  topic: { type: String, default: '' },
  sampleCompanies: [{ type: String }],
  // Per-user overrides/history
  userAnswers: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    myAnswer: String,
    aiFeedback: String,
    correctnessRating: { type: Number, min: 1, max: 5 },
    confidenceLevel: { type: Number, min: 1, max: 5 },
    practicedAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

interviewQuestionSchema.index({ category: 1, difficulty: 1 });

export default mongoose.model('InterviewQuestion', interviewQuestionSchema);
