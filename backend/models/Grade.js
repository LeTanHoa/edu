import mongoose from 'mongoose';

const gradeSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
  },
  type: {
    type: String,
    enum: ['quiz', 'assignment', 'midterm', 'final'],
    required: true,
  },
  referenceId: {
    type: mongoose.Schema.Types.ObjectId, // ID of Quiz or Assignment (if applicable)
    default: null,
  },
  score: {
    type: Number,
    required: true,
  },
  maxScore: {
    type: Number,
    required: true,
  },
  remarks: {
    type: String,
    default: '',
  }
}, { timestamps: true });

const Grade = mongoose.model('Grade', gradeSchema);
export default Grade;
