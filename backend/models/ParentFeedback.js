import mongoose from 'mongoose';

const parentFeedbackSchema = new mongoose.Schema({
  parentName: {
    type: String,
    required: true,
    trim: true,
  },
  studentName: {
    type: String,
    trim: true,
    default: '',
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  phone: {
    type: String,
    trim: true,
    default: '',
  },
  gradeLevel: {
    type: Number,
    min: 1,
    max: 5,
    default: 1,
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    default: 5,
  },
  message: {
    type: String,
    required: true,
    trim: true,
  },
  status: {
    type: String,
    enum: ['new', 'reviewed', 'archived'],
    default: 'new',
  },
  adminNote: {
    type: String,
    trim: true,
    default: '',
  }
}, { timestamps: true });

const ParentFeedback = mongoose.model('ParentFeedback', parentFeedbackSchema);
export default ParentFeedback;
