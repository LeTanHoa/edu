import mongoose from 'mongoose';

const certificateSchema = new mongoose.Schema({
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
  certId: {
    type: String,
    unique: true,
    required: true,
  },
  issueDate: {
    type: Date,
    default: Date.now,
  },
  pdfUrl: {
    type: String, // Path to downloadable certificate file
    default: '',
  }
}, { timestamps: true });

const Certificate = mongoose.model('Certificate', certificateSchema);
export default Certificate;
