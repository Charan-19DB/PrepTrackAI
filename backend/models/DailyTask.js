import mongoose from 'mongoose';

const dailyTaskSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: String, required: true }, // Format: YYYY-MM-DD
  subject: { type: String, required: true },
  topic: { type: String, required: true },
  subtopic: { type: String, default: '' },
  timeSlot: {
    type: String,
    enum: ['Morning', 'Afternoon', 'Evening', 'Night'],
    default: 'Morning'
  },
  estimatedDuration: { type: Number, default: 45 }, // in minutes
  actualDuration: { type: Number, default: 0 },
  difficulty: {
    type: String,
    enum: ['Beginner', 'Easy', 'Medium', 'Hard', 'Advanced'],
    default: 'Medium'
  },
  status: {
    type: String,
    enum: ['Not Started', 'In Progress', 'Completed', 'Skipped'],
    default: 'Not Started'
  },
  notes: { type: String, default: '' },
  isCompleted: { type: Boolean, default: false },
  priority: { type: String, enum: ['High', 'Medium', 'Low'], default: 'Medium' }
}, { timestamps: true });

dailyTaskSchema.index({ userId: 1, date: 1 });

export default mongoose.model('DailyTask', dailyTaskSchema);
