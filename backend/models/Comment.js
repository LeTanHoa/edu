import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
  lesson: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lesson',
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  parentComment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
    default: null, // Self-reference for replies
  },
  isFlagged: {
    type: Boolean,
    default: false, // For admin moderation review
  }
}, { timestamps: true });

const Comment = mongoose.model('Comment', commentSchema);
export default Comment;
