import mongoose from 'mongoose';

const dsaProblemSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  platform: {
    type: String,
    enum: ['LeetCode', 'GeeksforGeeks', 'CodeStudio', 'HackerRank', 'Codeforces', 'Other'],
    default: 'LeetCode'
  },
  url: { type: String, default: '' },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Medium'
  },
  category: {
    type: String,
    enum: [
      'Arrays',
      'Strings',
      'Hashing',
      'Linked List',
      'Stack',
      'Queue',
      'Binary Search',
      'Trees',
      'Graphs',
      'Recursion',
      'Backtracking',
      'Greedy',
      'Dynamic Programming',
      'Two Pointer',
      'Sliding Window',
      'Trie',
      'Heap',
      'Bit Manipulation'
    ],
    default: 'Arrays'
  },
  status: {
    type: String,
    enum: ['Not Started', 'Attempted', 'Solved', 'Revisit', 'Mastered'],
    default: 'Not Started'
  },
  attempts: { type: Number, default: 0 },
  timeTakenMinutes: { type: Number, default: 0 },
  solutionUnderstood: { type: Boolean, default: true },
  revisitRequired: { type: Boolean, default: false },
  solutionNotes: { type: String, default: '' },
  timeComplexity: { type: String, default: '' },
  spaceComplexity: { type: String, default: '' },
  solvedAt: { type: Date }
}, { timestamps: true });

dsaProblemSchema.index({ userId: 1, category: 1 });
dsaProblemSchema.index({ userId: 1, status: 1 });

export default mongoose.model('DSAProblem', dsaProblemSchema);
