import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  gradeLevel: {
    type: Number, // Class 1, 2, 3, 4, 5
    required: true,
  },
  className: {
    type: String, // e.g., "3A", "5B"
    default: '',
  },
  xp: {
    type: Number,
    default: 0,
  },
  coins: {
    type: Number,
    default: 0,
  },
  level: {
    type: Number,
    default: 1,
  },
  badges: [{
    badge: { type: mongoose.Schema.Types.ObjectId, ref: 'Badge' },
    unlockedAt: { type: Date, default: Date.now }
  }],
  achievements: [{
    achievement: { type: mongoose.Schema.Types.ObjectId, ref: 'Achievement' },
    unlockedAt: { type: Date, default: Date.now }
  }],
  dailyStreak: {
    count: { type: Number, default: 0 },
    lastLogin: { type: Date }
  }
}, { timestamps: true });

const Student = mongoose.model('Student', studentSchema);
export default Student;
