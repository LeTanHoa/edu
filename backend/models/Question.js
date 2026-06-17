import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  quiz: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
    default: '',
  },
  type: {
    type: String,
    enum: ['single', 'multiple', 'text', 'match', 'drag'],
    default: 'single',
  },
  points: {
    type: Number,
    default: 10,
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'easy',
  },
  tags: {
    type: [String],
    default: [],
  }
}, { timestamps: true });

const Question = mongoose.model('Question', questionSchema);
export default Question;
