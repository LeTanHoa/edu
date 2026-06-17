import mongoose from 'mongoose';

const quizSchema = new mongoose.Schema({
  lesson: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lesson',
    default: null,
  },
  chapter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chapter',
    default: null,
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
  timeLimit: {
    type: Number, // In minutes, 0 means no limit
    default: 0,
  },
  passingScore: {
    type: Number, // Percentage (e.g., 80 for 80%)
    default: 50,
  },
  randomizeQuestions: {
    type: Boolean,
    default: false,
  },
  randomizeAnswers: {
    type: Boolean,
    default: false,
  },
  showAnswersAfterSubmission: {
    type: Boolean,
    default: true,
  }
}, { timestamps: true });

const Quiz = mongoose.model('Quiz', quizSchema);
export default Quiz;
