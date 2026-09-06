import mongoose from 'mongoose';

const practiceQuestionSchema = new mongoose.Schema({
  subject: { type: String, required: true },
  topic: { type: String, required: true },
  type: {
    type: String,
    enum: ['MCQ', 'Aptitude', 'SQL', 'Output Prediction', 'Coding Problem', 'Interview Question'],
    default: 'MCQ'
  },
  question: { type: String, required: true },
  codeSnippet: { type: String, default: '' },
  options: [{ type: String }],
  correctAnswer: { type: String, required: true },
  explanation: { type: String, default: '' },
  difficulty: {
    type: String,
    enum: ['Beginner', 'Easy', 'Medium', 'Hard', 'Advanced'],
    default: 'Medium'
  },
  tags: [{ type: String }],
  isCustom: { type: Boolean, default: false },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

practiceQuestionSchema.index({ subject: 1, topic: 1 });
practiceQuestionSchema.index({ type: 1, difficulty: 1 });

export default mongoose.model('PracticeQuestion', practiceQuestionSchema);
