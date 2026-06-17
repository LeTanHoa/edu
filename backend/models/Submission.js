import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema({
  assignment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assignment',
    required: true,
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // References the student's User model
    required: true,
  },
  content: {
    type: String, // Online answer text
    default: '',
  },
  fileUrl: {
    type: String, // Student uploaded assignment file
    default: '',
  },
  status: {
    type: String,
    enum: ['draft', 'submitted', 'graded'],
    default: 'submitted',
  },
  grade: {
    type: Number,
    default: null,
  },
  feedback: {
    type: String, // Teacher response
    default: '',
  },
  gradedAt: {
    type: Date,
    default: null,
  }
}, { timestamps: true });

const Submission = mongoose.model('Submission', submissionSchema);
export default Submission;
