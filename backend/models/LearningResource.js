import mongoose from 'mongoose';

const learningResourceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  url: { type: String, required: true },
  type: {
    type: String,
    enum: ['Article', 'YouTube', 'Documentation', 'Course', 'Practice', 'Book'],
    default: 'Article'
  },
  subject: { type: String, required: true },
  topic: { type: String, required: true },
  difficulty: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Intermediate' },
  source: { type: String, default: 'Curated Placement Guide' },
  duration: { type: String, default: '15 mins' },
  channelOrAuthor: { type: String, default: 'Tech Education' },
  savedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  completedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  rating: { type: Number, default: 4.8 }
}, { timestamps: true });

learningResourceSchema.index({ subject: 1, topic: 1 });
learningResourceSchema.index({ type: 1 });

export default mongoose.model('LearningResource', learningResourceSchema);
