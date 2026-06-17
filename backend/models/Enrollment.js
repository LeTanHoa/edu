import mongoose from 'mongoose';

const enrollmentSchema = new mongoose.Schema({
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
  progress: {
    type: Number, // Percentage completed (0 - 100)
    default: 0,
  },
  completedLessons: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lesson',
  }],
  isCompleted: {
    type: Boolean,
    default: false,
  },
  completedAt: {
    type: Date,
    default: null,
  }
}, { timestamps: true });

// Ensure a student is only enrolled once per course
enrollmentSchema.index({ student: 1, course: 1 }, { unique: true });

const Enrollment = mongoose.model('Enrollment', enrollmentSchema);
export default Enrollment;
