import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // If null, target is global
    default: null,
  },
  recipientRole: {
    type: String, // Target by role: 'student', 'teacher', etc.
    enum: ['all', 'student', 'teacher', 'admin'],
    default: 'all',
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null, // Null means system sent
  },
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['system', 'teacher', 'deadline'],
    default: 'system',
  },
  isRead: {
    type: Boolean,
    default: false,
  }
}, { timestamps: true });

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;
