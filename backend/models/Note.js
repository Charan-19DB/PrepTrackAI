import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  topicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Topic' },
  subjectName: { type: String, required: true },
  topicName: { type: String, required: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  tags: [{ type: String }],
  isPinned: { type: Boolean, default: false },
  category: {
    type: String,
    enum: ['Summary', 'Code Snippet', 'Interview Notes', 'Cheat Sheet', 'Mistake Analysis'],
    default: 'Summary'
  }
}, { timestamps: true });

noteSchema.index({ userId: 1, topicName: 1 });
noteSchema.index({ userId: 1, tags: 1 });

export default mongoose.model('Note', noteSchema);
