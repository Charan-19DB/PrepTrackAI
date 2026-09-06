import mongoose from 'mongoose';

const goalSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  category: {
    type: String,
    enum: ['DSA', 'Core CSE', 'Aptitude', 'Study Time', 'Placement Prep', 'General'],
    default: 'General'
  },
  targetValue: { type: Number, required: true },
  currentValue: { type: Number, default: 0 },
  unit: { type: String, default: 'items' }, // 'problems', 'topics', 'hours', 'days'
  startDate: { type: String, default: () => new Date().toISOString().split('T')[0] },
  deadline: { type: String, required: true },
  dailyTarget: { type: Number, default: 1 },
  status: {
    type: String,
    enum: ['In Progress', 'Completed', 'Behind Schedule', 'Paused'],
    default: 'In Progress'
  },
  notes: { type: String, default: '' }
}, { timestamps: true });

goalSchema.index({ userId: 1, status: 1 });

export default mongoose.model('Goal', goalSchema);
