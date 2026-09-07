import mongoose from 'mongoose';

const flashcardSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subject: { type: String, required: true },
  topic: { type: String, required: true },
  front: { type: String, required: true },
  back: { type: String, required: true },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Medium' },
  intervalDays: { type: Number, default: 1 },
  easeFactor: { type: Number, default: 2.5 },
  repetitions: { type: Number, default: 0 },
  nextReviewDate: { type: String, required: true }, // YYYY-MM-DD
  lastReviewedDate: { type: String, default: '' },
  tags: [{ type: String }]
}, { timestamps: true });

flashcardSchema.index({ userId: 1, nextReviewDate: 1 });

export default mongoose.model('Flashcard', flashcardSchema);
