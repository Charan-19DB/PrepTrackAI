import mongoose from 'mongoose';

const communicationPracticeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  moduleType: {
    type: String,
    enum: ['Writing', 'Speaking', 'Listening', 'Reading'],
    required: true
  },
  topicOrPrompt: { type: String, default: '' },
  submissionText: { type: String, default: '' }, // original text or speech transcript
  overallScore: { type: Number, default: 0 },
  subScores: {
    grammar: Number,
    clarity: Number,
    vocabulary: Number,
    professionalism: Number,
    fluency: Number,
    confidence: Number
  },
  fillerWords: { type: Map, of: Number, default: {} },
  totalFillers: { type: Number, default: 0 },
  corrections: [{
    original: String,
    correction: String,
    reason: String
  }],
  improvedVersion: { type: String, default: '' },
  feedbackTip: { type: String, default: '' }
}, { timestamps: true });

communicationPracticeSchema.index({ userId: 1, moduleType: 1 });

export default mongoose.model('CommunicationPractice', communicationPracticeSchema);
