import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  thumbnail: {
    type: String,
    default: '',
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
  },
  gradeLevel: {
    type: Number,
    required: true,
  },
  isPublished: {
    type: Boolean,
    default: false,
  },
  isApproved: {
    type: Boolean,
    default: false,
  },
  xpReward: {
    type: Number,
    default: 100,
  },
  coinReward: {
    type: Number,
    default: 50,
  },
  enrollmentCount: {
    type: Number,
    default: 0,
  }
}, { timestamps: true });

const Course = mongoose.model('Course', courseSchema);
export default Course;
