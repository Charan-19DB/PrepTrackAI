import mongoose from 'mongoose';

const checklistItemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  details: { type: String, default: '' }
}, { _id: true });

const topicSchema = new mongoose.Schema({
  subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  subjectName: { type: String, required: true },
  name: { type: String, required: true },
  slug: { type: String, required: true },
  description: { type: String, default: '' },
  importance: { type: String, enum: ['High', 'Core', 'Medium', 'Optional'], default: 'High' },
  difficulty: { type: String, enum: ['Beginner', 'Easy', 'Medium', 'Hard', 'Advanced'], default: 'Medium' },
  order: { type: Number, default: 0 },
  subtopics: [{ type: String }],
  theoryItems: [checklistItemSchema],
  assessmentItems: [checklistItemSchema],
  practicalItems: [checklistItemSchema],
  interviewItems: [checklistItemSchema],
  resources: [{
    title: { type: String, required: true },
    url: { type: String, required: true },
    type: { type: String, enum: ['Article', 'Video', 'Documentation', 'Practice'], default: 'Documentation' }
  }],
  isCustom: { type: Boolean, default: false }
}, { timestamps: true });

topicSchema.index({ subjectId: 1, name: 1 });
topicSchema.index({ slug: 1 });

export default mongoose.model('Topic', topicSchema);
