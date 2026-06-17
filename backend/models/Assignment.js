import mongoose from 'mongoose';

const assignmentSchema = new mongoose.Schema({
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
  },
  chapter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chapter',
    default: null,
  },
  title: {
    type: String,
    required: true,
  },
  instructions: {
    type: String,
    required: true,
  },
  fileUrl: {
    type: String, // Attached worksheet template (PDF/Doc)
    default: '',
  },
  deadline: {
    type: Date,
    required: true,
  },
  maxPoints: {
    type: Number,
    default: 10,
  }
}, { timestamps: true });

const Assignment = mongoose.model('Assignment', assignmentSchema);
export default Assignment;
