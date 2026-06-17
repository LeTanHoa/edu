import mongoose from 'mongoose';

const logSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null, // Null indicates anonymous (failed login, public visit)
  },
  action: {
    type: String, // e.g., "LOGIN_SUCCESS", "COURSE_CREATE", "USER_LOCK"
    required: true,
  },
  details: {
    type: String, // Readable metadata text
    default: '',
  },
  ip: {
    type: String,
    default: '',
  },
  userAgent: {
    type: String,
    default: '',
  }
}, { timestamps: true });

const Log = mongoose.model('Log', logSchema);
export default Log;
