import mongoose from 'mongoose';

const teacherSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  specialty: {
    type: [String], // e.g., ["Toán", "Tiếng Việt", "Khoa học"]
    required: true,
  },
  bio: {
    type: String,
    default: '',
  },
  revenue: {
    type: Number,
    default: 0,
  },
  rating: {
    type: Number,
    default: 5.0,
  }
}, { timestamps: true });

const Teacher = mongoose.model('Teacher', teacherSchema);
export default Teacher;
