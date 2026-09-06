import mongoose from 'mongoose';

const subjectSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  slug: { type: String, required: true, unique: true },
  category: {
    type: String,
    enum: [
      'Aptitude & Reasoning',
      'Programming Languages',
      'Core Computer Science',
      'Artificial Intelligence',
      'Advanced Technologies',
      'Software & Systems'
    ],
    default: 'Core Computer Science'
  },
  description: { type: String, default: '' },
  icon: { type: String, default: 'BookOpen' },
  color: { type: String, default: 'from-blue-500 to-indigo-600' },
  order: { type: Number, default: 0 },
  isCustom: { type: Boolean, default: false },
  totalTopicsCount: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model('Subject', subjectSchema);
