import mongoose from 'mongoose';

const chapterSchema = new mongoose.Schema({
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  order: {
    type: Number,
    default: 0,
  }
}, { timestamps: true });

const Chapter = mongoose.model('Chapter', chapterSchema);
export default Chapter;
