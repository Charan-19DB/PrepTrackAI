import mongoose from 'mongoose';

const companyPrepSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  slug: { type: String, required: true, unique: true },
  tier: { type: String, enum: ['Product / FAANG', 'Enterprise / Cloud', 'Service / Mass IT'], default: 'Product / FAANG' },
  logoUrl: { type: String, default: '' },
  dsaDifficulty: { type: String, enum: ['Medium to Hard', 'Easy to Medium', 'Medium', 'Hard'], default: 'Medium to Hard' },
  aptitudeImportance: { type: String, enum: ['Critical (Elimination)', 'High', 'Moderate', 'Low / Not Tested'], default: 'Moderate' },
  interviewRounds: [{
    roundNumber: Number,
    name: String,
    duration: String,
    description: String
  }],
  frequentlyTestedSubjects: [{ type: String }],
  technicalFocusTopics: [{ type: String }],
  hrBehavioralFocus: [{ type: String }],
  preparationChecklist: [{
    task: String,
    category: String,
    estimatedHours: Number
  }],
  userChecklistProgress: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    completedTaskIndexes: [Number]
  }]
}, { timestamps: true });

companyPrepSchema.index({ slug: 1 });

export default mongoose.model('CompanyPrep', companyPrepSchema);
