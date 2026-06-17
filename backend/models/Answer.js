import mongoose from 'mongoose';

const answerSchema = new mongoose.Schema({
  question: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  isCorrect: {
    type: Boolean,
    default: false,
  },
  matchingPair: {
    type: String, // Used in 'match' questions (e.g. key-pair matching)
    default: '',
  },
  order: {
    type: Number, // For drag-and-drop sequencing
    default: 0,
  }
}, { timestamps: true });

const Answer = mongoose.model('Answer', answerSchema);
export default Answer;
