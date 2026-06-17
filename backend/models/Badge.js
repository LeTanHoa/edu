import mongoose from 'mongoose';

const badgeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
    required: true,
  },
  icon: {
    type: String, // Emojis (e.g. 🏆, 🌟, 📚) or image filenames
    required: true,
  },
  xpRequired: {
    type: Number,
    default: 0,
  },
  coinCost: {
    type: Number,
    default: 0, // 0 means not purchasable (earned via XP)
  }
}, { timestamps: true });

const Badge = mongoose.model('Badge', badgeSchema);
export default Badge;
