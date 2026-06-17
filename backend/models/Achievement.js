import mongoose from 'mongoose';

const achievementSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  badge: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Badge',
    required: true,
  },
  unlockedAt: {
    type: Date,
    default: Date.now,
  }
}, { timestamps: true });

// Avoid duplicate award entries
achievementSchema.index({ student: 1, badge: 1 }, { unique: true });

const Achievement = mongoose.model('Achievement', achievementSchema);
export default Achievement;
