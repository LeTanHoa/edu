import mongoose from 'mongoose';

const lessonSchema = new mongoose.Schema({
  chapter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chapter',
    required: true,
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
  contentType: {
    type: String,
    enum: ['video', 'pdf', 'slide', 'audio', 'text'],
    default: 'video',
  },
  contentUrl: {
    type: String, // Video url, pdf url, etc.
    default: '',
  },
  bodyText: {
    type: String, // If type is 'text' or as a description
    default: '',
  },
  duration: {
    type: Number, // In seconds (especially for video/audio)
    default: 0,
  },
  attachments: [{
    name: String,
    url: String
  }],
  order: {
    type: Number,
    default: 0,
  }
}, { timestamps: true });

const Lesson = mongoose.model('Lesson', lessonSchema);
export default Lesson;
